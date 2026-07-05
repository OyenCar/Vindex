"use client";

/**
 * Off-ledger file storage helpers. Files are ENCRYPTED client-side (AES-256-GCM) and only the
 * ciphertext is uploaded to IPFS (via the server-side /api/ipfs-upload route, which keeps the Pinata
 * JWT secret). The on-ledger identifier is "<cid>#<keyB64>": the ciphertext lives on public IPFS,
 * the key rides on the private Canton ledger. A leaked CID therefore reveals only ciphertext.
 */

import { encryptBytes, decryptBytes, packUri, unpackUri } from "@/lib/crypto";

export interface UploadResult {
  cid: string;
  gateway: string | null;
  local?: boolean;
  /** Non-fatal note (e.g. Pinata key invalid → stored locally). The CID is still usable. */
  warning?: string;
}

/** Encrypt a file and upload the ciphertext; returns the on-ledger identifier "<cid>#<keyB64>". */
export async function uploadToIpfs(file: File): Promise<UploadResult> {
  // Encrypt BEFORE upload so only ciphertext ever reaches public IPFS.
  const { cipher, keyB64 } = await encryptBytes(await file.arrayBuffer());
  const form = new FormData();
  form.append("file", new File([cipher as BlobPart], `${file.name}.enc`, { type: "application/octet-stream" }));
  const res = await fetch("/api/ipfs-upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as UploadResult & { error?: string };
  if (!res.ok || !data.cid) throw new Error(data.error ?? `upload failed (${res.status})`);
  // A `local-` cid means Pinata didn't actually pin (nothing retrievable) — leave it unkeyed.
  const cid = data.cid.startsWith("local-") ? data.cid : packUri(data.cid, keyB64);
  return { ...data, cid };
}

/** Gateway URL of the raw (ciphertext) cid, or null for local stand-in / empty. Used only to TEST
 *  retrievability — encrypted content must be opened via openEncrypted, not this URL directly. */
export function ipfsUrl(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const { cid } = unpackUri(uri);
  if (!cid || cid.startsWith("local-")) return null;
  const base = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
  return `${base}/ipfs/${cid}`;
}

/** Fetch + decrypt an artifact and open it in a new tab (blob URL). Legacy plain cids (no key) open
 *  as-is. Throws on fetch/decrypt failure. */
export async function openEncrypted(uri: string | null | undefined): Promise<void> {
  if (!uri) return;
  const { cid, keyB64 } = unpackUri(uri);
  if (!cid || cid.startsWith("local-")) return;
  const base = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
  const res = await fetch(`${base}/ipfs/${cid}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not fetch ${cid} (${res.status})`);
  const buf = await res.arrayBuffer();
  const bytes = keyB64 ? await decryptBytes(buf, keyB64) : new Uint8Array(buf);
  const url = URL.createObjectURL(new Blob([bytes as BlobPart]));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

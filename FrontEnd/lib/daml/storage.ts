"use client";

/**
 * Off-ledger file storage helpers. Files are uploaded to IPFS (via the server-side
 * /api/ipfs-upload route, which keeps the Pinata JWT secret); only the returned CID
 * is ever placed on the Canton ledger.
 */

export interface UploadResult {
  cid: string;
  gateway: string | null;
  local?: boolean;
  /** Non-fatal note (e.g. Pinata key invalid → stored locally). The CID is still usable. */
  warning?: string;
}

/** Upload a file and get back its content id (CID). Throws with a readable message on failure. */
export async function uploadToIpfs(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/ipfs-upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as UploadResult & { error?: string };
  if (!res.ok || !data.cid) throw new Error(data.error ?? `upload failed (${res.status})`);
  return data;
}

/** Resolve an on-ledger CID to a viewable URL, or null for local stand-in / empty CIDs. */
export function ipfsUrl(cid: string | null | undefined): string | null {
  if (!cid || cid.startsWith("local-")) return null;
  const base = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
  return `${base}/ipfs/${cid}`;
}

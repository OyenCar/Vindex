// Shared AES-GCM helpers for encrypting off-ledger artifacts BEFORE they hit PUBLIC IPFS.
//
// Privacy model: IPFS is world-readable, so the ciphertext is safe to pin publicly. The symmetric
// key rides on the PRIVATE Canton ledger — embedded in the on-ledger URI as "<cid>#<keyB64>", which
// only the contract's stakeholders (members, worker, agent) can see. A leaked CID therefore reveals
// nothing. The server decrypts only at arbitration time (it already holds stakeholder-level access).
//
// Works in the browser and in Node (the API routes polyfill globalThis.crypto from node:crypto).

function subtle(): SubtleCrypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) throw new Error("WebCrypto unavailable in this environment");
  return c.subtle;
}

function randomBytes(n: number): Uint8Array {
  return (globalThis as { crypto: Crypto }).crypto.getRandomValues(new Uint8Array(n));
}

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

/** Encrypt raw bytes with a fresh AES-256-GCM key. Output = iv(12) || ciphertext. */
export async function encryptBytes(data: ArrayBuffer): Promise<{ cipher: Uint8Array; keyB64: string }> {
  const key = await subtle().generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = randomBytes(12);
  const ct = await subtle().encrypt({ name: "AES-GCM", iv } as AesGcmParams, key, data as BufferSource);
  const raw = await subtle().exportKey("raw", key);
  const out = new Uint8Array(iv.length + ct.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct), iv.length);
  return { cipher: out, keyB64: toB64(raw) };
}

/** Decrypt bytes produced by encryptBytes (iv(12) || ciphertext) with the base64 key. */
export async function decryptBytes(cipher: ArrayBuffer, keyB64: string): Promise<Uint8Array> {
  const raw = fromB64(keyB64);
  const key = await subtle().importKey("raw", raw as BufferSource, { name: "AES-GCM" }, false, ["decrypt"]);
  const buf = new Uint8Array(cipher);
  const iv = buf.slice(0, 12);
  const ct = buf.slice(12);
  const pt = await subtle().decrypt({ name: "AES-GCM", iv } as AesGcmParams, key, ct as BufferSource);
  return new Uint8Array(pt);
}

const SEP = "#";

/** On-ledger identifier for an encrypted artifact: "<cid>#<keyB64>". */
export function packUri(cid: string, keyB64: string): string {
  return `${cid}${SEP}${keyB64}`;
}

/** Split an on-ledger identifier into its cid and (optional) key. Legacy/plain cids have no key. */
export function unpackUri(uri: string): { cid: string; keyB64?: string } {
  const i = uri.indexOf(SEP);
  if (i === -1) return { cid: uri };
  return { cid: uri.slice(0, i), keyB64: uri.slice(i + 1) };
}

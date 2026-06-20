import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Runs server-side so the Pinata JWT never reaches the browser.
export const runtime = "nodejs";

/**
 * Uploads a file to IPFS via Pinata and returns its CID (the file's content hash + address).
 * The raw file goes to decentralized off-ledger storage; only the CID is later put on the ledger.
 *
 * If PINATA_JWT is unset, falls back to a local sha256 "stand-in CID" so the whole
 * upload → hash → submit flow still works offline (the file just isn't actually retrievable).
 */
export async function POST(req: NextRequest) {
  let inForm: FormData;
  try {
    inForm = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }
  const file = inForm.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "a 'file' field is required" }, { status: 400 });
  }

  const jwt = process.env.PINATA_JWT;
  const gatewayBase = process.env.PINATA_GATEWAY ?? "https://gateway.pinata.cloud";

  // Local content-hash stand-in. Used when Pinata is unset OR fails — the escrow flow (apply,
  // submit, etc.) must never be blocked by a file-storage problem; only the CID goes on-ledger.
  const buf = Buffer.from(await file.arrayBuffer());
  const localCid = `local-sha256-${crypto.createHash("sha256").update(buf).digest("hex")}`;

  if (!jwt) {
    return NextResponse.json({ cid: localCid, gateway: null, local: true });
  }

  try {
    const out = new FormData();
    out.append("file", new Blob([buf]), file.name || "upload.bin");
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: out,
    });
    if (res.ok) {
      const data = (await res.json()) as { IpfsHash?: string };
      if (data.IpfsHash) {
        return NextResponse.json({ cid: data.IpfsHash, gateway: `${gatewayBase}/ipfs/${data.IpfsHash}` });
      }
    }
    // Pinata rejected the request (e.g. 403 NO_SCOPES_FOUND for a key without pinning scope).
    // Degrade gracefully so the demo keeps working; surface a non-fatal warning.
    const detail = (await res.text().catch(() => "")).slice(0, 180);
    const hint =
      res.status === 401 || res.status === 403
        ? "Pinata key is missing the pinFileToIPFS scope — regenerate it with pinning enabled."
        : `Pinata upload failed (${res.status})${detail ? `: ${detail}` : ""}`;
    return NextResponse.json({ cid: localCid, gateway: null, local: true, warning: hint });
  } catch (e) {
    return NextResponse.json({
      cid: localCid,
      gateway: null,
      local: true,
      warning: `Could not reach Pinata (${e instanceof Error ? e.message : e}); stored locally.`,
    });
  }
}

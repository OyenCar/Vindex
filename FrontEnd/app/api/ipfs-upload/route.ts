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

  // Retry transient failures (Node "fetch failed" network blips, timeouts, 5xx, 429) before
  // falling back to a local stand-in — those are intermittent and otherwise leave the brief /
  // deliverable as a non-retrievable local- CID that the AI agent can't read.
  const MAX_ATTEMPTS = 4;
  let lastWarning = "Pinata upload failed; stored locally.";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const out = new FormData();
      out.append("file", new Blob([buf]), file.name || "upload.bin");
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: out,
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        const data = (await res.json()) as { IpfsHash?: string };
        if (data.IpfsHash) {
          return NextResponse.json({ cid: data.IpfsHash, gateway: `${gatewayBase}/ipfs/${data.IpfsHash}` });
        }
        lastWarning = "Pinata response missing IpfsHash; stored locally.";
      } else if (res.status === 401 || res.status === 403) {
        // Auth/scope error — retrying won't help; stop now.
        return NextResponse.json({
          cid: localCid,
          gateway: null,
          local: true,
          warning: "Pinata key is missing the pinFileToIPFS scope — regenerate it with pinning enabled.",
        });
      } else {
        const detail = (await res.text().catch(() => "")).slice(0, 160);
        lastWarning = `Pinata upload failed (${res.status})${detail ? `: ${detail}` : ""}; stored locally.`;
      }
    } catch (e) {
      lastWarning = `Could not reach Pinata (${e instanceof Error ? e.message : e}); stored locally.`;
    }
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  return NextResponse.json({ cid: localCid, gateway: null, local: true, warning: lastWarning });
}

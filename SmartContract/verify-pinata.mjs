// Verify the full Pinata chain the app + AI agent rely on:
//   1. upload a file (pinFileToIPFS)  ->  needs a key with the pinFileToIPFS scope
//   2. retrieve it back from your gateway  ->  this is exactly what /api/agent-verdict does
//   3. unpin (clean up)
//
//   node SmartContract/verify-pinata.mjs
//
// Reads PINATA_JWT / PINATA_GATEWAY / PINATA_GATEWAY_TOKEN from FrontEnd/.env.local.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readEnv() {
  const text = fs.readFileSync(path.join(root, "FrontEnd/.env.local"), "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = readEnv();
const JWT = env.PINATA_JWT;
const GATEWAY = (env.PINATA_GATEWAY || env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud").replace(/\/$/, "");
const TOKEN = env.PINATA_GATEWAY_TOKEN || "";

if (!JWT) {
  console.error("PINATA_JWT is not set in FrontEnd/.env.local");
  process.exit(1);
}
console.log(`Gateway: ${GATEWAY}${TOKEN ? " (+access token)" : ""}\n`);

const marker = `vindex-pinata-check ${Date.now()}`;

// 1) Upload --------------------------------------------------------------------
console.log("1. Uploading a test file (pinFileToIPFS) ...");
const form = new FormData();
form.append("file", new Blob([marker], { type: "text/plain" }), "vindex-check.txt");
const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  method: "POST",
  headers: { Authorization: `Bearer ${JWT}` },
  body: form,
});
if (!up.ok) {
  const detail = await up.text().catch(() => "");
  console.error(`   ❌ Upload failed (${up.status}): ${detail.slice(0, 200)}`);
  if (up.status === 401 || up.status === 403)
    console.error("   → Your key lacks the pinFileToIPFS scope. Make a new key with Pinning enabled (or Admin).");
  process.exit(1);
}
const { IpfsHash: cid } = await up.json();
console.log(`   ✅ Pinned. CID = ${cid}\n`);

// 2) Retrieve from the gateway (with a few retries for propagation) -----------
console.log("2. Fetching it back from your gateway ...");
const url = `${GATEWAY}/ipfs/${cid}${TOKEN ? `?pinataGatewayToken=${TOKEN}` : ""}`;
let got = null;
for (let i = 1; i <= 6; i++) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (r.ok) { got = await r.text(); break; }
    console.log(`   attempt ${i}: HTTP ${r.status} — retrying ...`);
  } catch (e) {
    console.log(`   attempt ${i}: ${e.message} — retrying ...`);
  }
  await sleep(2000);
}

let pass = false;
if (got === null) {
  console.error("   ❌ Could not retrieve from the gateway.");
  console.error("   → Use your DEDICATED gateway (https://<name>.mypinata.cloud) as PINATA_GATEWAY,");
  console.error("     and if it has access controls, set PINATA_GATEWAY_TOKEN.");
} else if (got.trim() === marker) {
  console.log("   ✅ Retrieved and content matches.\n");
  pass = true;
} else {
  console.error(`   ❌ Retrieved but content differs. Got: ${got.slice(0, 80)}`);
}

// 3) Clean up ------------------------------------------------------------------
console.log("3. Unpinning the test file ...");
const del = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${JWT}` },
});
console.log(del.ok ? "   done.\n" : `   (unpin returned ${del.status}; ignore)\n`);

console.log(pass
  ? "✅ PASS — uploads pin to IPFS and your gateway serves them. The app + AI agent are good to go."
  : "❌ FAIL — see the hint above, fix .env.local, then re-run this script.");
process.exit(pass ? 0 : 1);

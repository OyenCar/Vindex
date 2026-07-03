// Connectivity check against the live JSON Ledger API using a real party JWT.
// Usage: node scripts/ledger-check.mjs "<party>" [ledgerId]
import crypto from "node:crypto";

const party = process.argv[2];
const ledgerId = process.argv[3] ?? "sandbox";
const pkg = "29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const header = { alg: "HS256", typ: "JWT" };
const payload = {
  "https://daml.com/ledger-api": {
    ledgerId,
    applicationId: "Vindex",
    actAs: [party],
    readAs: [party],
  },
};
const si = `${b64(header)}.${b64(payload)}`;
const sig = crypto.createHmac("sha256", "secret").update(si).digest("base64url");
const token = `${si}.${sig}`;

const res = await fetch("http://localhost:7575/v1/query", {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ templateIds: [`${pkg}:Vindex:InvestorParty`] }),
});
console.log("HTTP", res.status);
console.log((await res.text()).slice(0, 500));

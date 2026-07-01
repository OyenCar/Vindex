// Proves the REAL frontend client (@daml/ledger + generated bindings) creates & reads a
// contract against the live JSON API — the same code path the browser uses.
// Usage: node scripts/seed-and-verify.cjs "<investorParty>" "<agentParty>" [ledgerId]
const crypto = require("node:crypto");
const LedgerMod = require("@daml/ledger");
const Ledger = LedgerMod.default || LedgerMod;
const { Vindex } = require("@daml.js/vindex-0.1.0");

const investor = process.argv[2];
const agent = process.argv[3];
const ledgerId = process.argv[4] || "sandbox";

function token(party) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const h = { alg: "HS256", typ: "JWT" };
  const p = {
    "https://daml.com/ledger-api": {
      ledgerId,
      applicationId: "Vindex",
      actAs: [party],
      readAs: [party],
    },
  };
  const si = `${b64(h)}.${b64(p)}`;
  const sig = crypto.createHmac("sha256", "secret").update(si).digest("base64url");
  return `${si}.${sig}`;
}

(async () => {
  const ledger = new Ledger({
    token: token(investor),
    httpBaseUrl: "http://localhost:7575/",
    wsBaseUrl: "ws://localhost:7575/",
  });

  const ev = await ledger.create(Vindex.InvestorParty, {
    admin: investor,
    members: [investor],
    pending: [],
    contributions: [
      { investor, projectFunding: "4000.0", agentFeeFunding: "300.0", weight: "1.0" },
    ],
    config: {
      maxInvestors: "5",
      votingModel: "SimpleMajority",
      thresholdFraction: "0.5",
      weighted: false,
      quorumFraction: "0.5",
      defaultReviewWindow: { microseconds: "86400000000" },
    },
    agent,
  });
  console.log("CREATED InvestorParty:", ev.contractId);

  const all = await ledger.query(Vindex.InvestorParty);
  console.log("QUERY InvestorParty count:", all.length);
  console.log("OK — @daml/ledger create+query round-trip against live participant");
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e && e.message ? e.message : e);
  process.exit(1);
});

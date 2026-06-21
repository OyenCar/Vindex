// End-to-end check of the OPEN-JOB visibility fix, run against the live JSON API.
//
//   investor creates party -> SetupAndPost (open posting) -> worker Apply
//   -> query Application AS THE INVESTOR -> assert it is visible
//   -> archive everything (leaves the ledger clean for your demo).
//
// Usage (sandbox + json-api must be running, parties seeded):
//   node SmartContract/verify-open-job.mjs
//
// It reads the party ids and dev-JWT settings straight from FrontEnd/.env.local.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.resolve(__dirname, "../FrontEnd/.env.local");

// vindex package id (from the generated bindings; bump after any contract change).
const PKG = "78307962a34e50d896432d9ae539640e68e0853fdc5665a6daf5af7fed31b530";
const tpl = (entity) => `${PKG}:Vindex:${entity}`;

// ---- read config from .env.local --------------------------------------------
function readEnv() {
  const text = fs.readFileSync(ENV_FILE, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}
const env = readEnv();
const BASE = (env.LEDGER_PROXY_TARGET ?? "http://localhost:7575").replace(/\/$/, "");
const SECRET = env.DAML_JWT_SECRET ?? "secret";
const LEDGER_ID = env.DAML_LEDGER_ID ?? "sandbox";
const INVESTOR = env.NEXT_PUBLIC_PARTY_INVESTOR;
const WORKER = env.NEXT_PUBLIC_PARTY_WORKER;
const AGENT = env.NEXT_PUBLIC_PARTY_AGENT;

if (!INVESTOR || !WORKER || !AGENT) {
  console.error("Missing party ids in .env.local. Run SmartContract\\seed.ps1 first.");
  process.exit(1);
}

// ---- dev JWT (same HS256 scheme as /api/daml-token) -------------------------
const b64url = (s) => Buffer.from(s).toString("base64url");
function mintToken(party) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "https://daml.com/ledger-api": {
      ledgerId: LEDGER_ID,
      applicationId: "verdix-verify",
      actAs: [party],
      readAs: [party],
    },
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const input = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
  return `${input}.${sig}`;
}

async function api(endpoint, party, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${mintToken(party)}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.status !== 200 && json.errors) {
    throw new Error(`${endpoint} failed: ${JSON.stringify(json.errors)}`);
  }
  return json.result;
}

const create = (party, entity, payload) => api("/v1/create", party, { templateId: tpl(entity), payload });
const exercise = (party, entity, contractId, choice, argument = {}) =>
  api("/v1/exercise", party, { templateId: tpl(entity), contractId, choice, argument });
const query = (party, entity) => api("/v1/query", party, { templateIds: [tpl(entity)] });
const archive = (party, entity, contractId) => exercise(party, entity, contractId, "Archive", {});

const rel = (seconds) => ({ microseconds: String(Math.round(seconds * 1e6)) });

// ---- the test ---------------------------------------------------------------
async function main() {
  console.log(`Ledger:   ${BASE}`);
  console.log(`Investor: ${INVESTOR}`);
  console.log(`Worker:   ${WORKER}\n`);

  const created = []; // { party, entity, cid } for cleanup

  try {
    console.log("1. Investor creates InvestorParty ...");
    const ip = await create(INVESTOR, "InvestorParty", {
      admin: INVESTOR,
      members: [INVESTOR],
      pending: [],
      contributions: [
        { investor: INVESTOR, projectFunding: "4000.0", agentFeeFunding: "300.0", weight: "1.0" },
      ],
      config: {
        maxInvestors: "5",
        votingModel: "SimpleMajority",
        thresholdFraction: "0.5",
        weighted: false,
        quorumFraction: "0.5",
        defaultReviewWindow: rel(24 * 3600),
      },
      agent: AGENT,
    });
    created.push({ party: INVESTOR, entity: "InvestorParty", cid: ip.contractId });

    console.log("2. Investor publishes an OPEN posting (workerPool = [Worker]) ...");
    const post = await exercise(INVESTOR, "InvestorParty", ip.contractId, "SetupAndPost", {
      requirements: "VERIFY: open-job visibility check",
      briefUri: "",
      budgetAmount: "4000.0",
      agentFeeAmount: "300.0",
      agentOpCost: "50.0",
      commitmentRequired: "500.0",
      workerPool: [WORKER],
    });
    // exerciseResult is a Tuple3 { _1: postingCid, _2: budgetCid, _3: agentFeeCid }
    const r = post.exerciseResult;
    const postingCid = r._1, budgetCid = r._2, agentFeeCid = r._3;
    created.push({ party: INVESTOR, entity: "ProjectPosting", cid: postingCid });
    created.push({ party: INVESTOR, entity: "AssetVault", cid: budgetCid });
    created.push({ party: INVESTOR, entity: "AssetVault", cid: agentFeeCid });

    console.log("3. Worker applies to the open posting ...");
    const appRes = await exercise(WORKER, "ProjectPosting", postingCid, "Apply", {
      applicant: WORKER,
      presentationHash: "sha256:portfolio",
      presentationUri: "",
      contactLink: "https://verdix.app/contact/verify",
    });
    const appCid = appRes.exerciseResult;
    created.unshift({ party: WORKER, entity: "Application", cid: appCid });

    console.log("4. Query Applications AS THE INVESTOR ...\n");
    const apps = await query(INVESTOR, "Application");
    const mine = apps.filter((a) => a.payload.applicant === WORKER);

    if (mine.length > 0) {
      console.log("   ✅ PASS — the investor can see the worker's application.");
      console.log(`      applicant = ${mine[0].payload.applicant}`);
      console.log("      => the on-ledger observer model works; the UI 'Applicants' card will populate.\n");
    } else {
      console.log("   ❌ FAIL — the application was created but is NOT visible to the investor.");
      console.log(`      investor saw ${apps.length} application(s) total.\n`);
    }
  } finally {
    // Clean up so the ledger is pristine for the real demo.
    console.log("5. Cleaning up test contracts ...");
    for (const c of created) {
      try {
        await archive(c.party, c.entity, c.cid);
      } catch (e) {
        console.log(`   (could not archive ${c.entity}: ${e.message})`);
      }
    }
    console.log("   done.");
  }
}

main().catch((e) => {
  console.error("\nVerification error:", e.message);
  process.exit(1);
});

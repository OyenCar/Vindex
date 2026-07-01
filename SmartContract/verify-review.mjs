// Prove the investor review flow against the live JSON API, mirroring the frontend's atomic chains:
//   post -> apply -> select -> accept -> submit -> REJECT (vote + reasons + finalize)
//   -> assert the project is RejPending AND visible to the AGENT (the dispute shows up)
//   -> resolve via AgentVerdict to settle, then archive leftovers (keeps the ledger clean).
//
//   node SmartContract/verify-review.mjs
//
// Reads party ids + dev-JWT settings from FrontEnd/.env.local.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.resolve(__dirname, "../FrontEnd/.env.local");
const PKG = "29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167";
const tpl = (e) => `${PKG}:Vindex:${e}`;

function readEnv() {
  const env = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
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
if (!INVESTOR || !WORKER || !AGENT) { console.error("Missing party ids; run seed.ps1"); process.exit(1); }

const b64 = (s) => Buffer.from(s).toString("base64url");
function token(p) {
  const h = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const PUBLIC = env.NEXT_PUBLIC_PARTY_PUBLIC;
  const readAs = [p];
  if (PUBLIC) readAs.push(PUBLIC);
  const pl = b64(JSON.stringify({
    "https://daml.com/ledger-api": { ledgerId: LEDGER_ID, applicationId: "Vindex-verify", actAs: [p], readAs },
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const sig = crypto.createHmac("sha256", SECRET).update(`${h}.${pl}`).digest("base64url");
  return `${h}.${pl}.${sig}`;
}
async function api(endpoint, p, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token(p)}` },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (j.status !== 200 && j.errors) throw new Error(`${endpoint}: ${JSON.stringify(j.errors)}`);
  return j.result;
}
const create = (p, e, payload) => api("/v1/create", p, { templateId: tpl(e), payload });
const exercise = (p, e, contractId, choice, argument = {}) => api("/v1/exercise", p, { templateId: tpl(e), contractId, choice, argument });
const exById = (p, e, contractId, choice, argument = {}) => exercise(p, e, contractId, choice, argument);
const query = (p, e) => api("/v1/query", p, { templateIds: [tpl(e)] });
const archive = (p, e, cid) => exercise(p, e, cid, "Archive", {});
const rel = (seconds) => ({ microseconds: String(Math.round(seconds * 1e6)) });

async function main() {
  console.log(`Ledger: ${BASE}\n`);
  const created = [];
  let projectSettled = false;
  try {
    console.log("1. Investor party + open posting ...");
    const ip = await create(INVESTOR, "InvestorParty", {
      admin: INVESTOR, members: [INVESTOR], pending: [],
      contributions: [{ investor: INVESTOR, projectFunding: "4000.0", agentFeeFunding: "300.0", weight: "1.0" }],
      config: { maxInvestors: "5", votingModel: "SimpleMajority", thresholdFraction: "0.5", weighted: false, quorumFraction: "0.5", defaultReviewWindow: rel(86400) },
      agent: AGENT,
    });
    created.push({ p: INVESTOR, e: "InvestorParty", cid: ip.contractId });
    const post = await exercise(INVESTOR, "InvestorParty", ip.contractId, "SetupAndPost", {
      postingId: "job-review-verify-" + Date.now(),
      requirements: "VERIFY review flow", briefUri: "",
      budgetAmount: "4000.0", agentFeeAmount: "300.0", agentOpCost: "50.0", commitmentRequired: "500.0",
      recruitmentMode: "OPEN_POOL",
      eligibleWorkers: ["Worker::*"],
      publicParty: env.NEXT_PUBLIC_PARTY_PUBLIC,
    });
    const postingCid = post.exerciseResult._1;

    console.log("2. Worker applies; investor selects (governance) ...");
    const app = await exercise(WORKER, "ProjectPosting", postingCid, "Apply", { applicant: WORKER, presentationHash: "p", presentationUri: "", contactLink: "c" });
    const appCid = app.exerciseResult;
    created.push({ p: WORKER, e: "Application", cid: appCid });
    const prop = await exercise(INVESTOR, "InvestorParty", ip.contractId, "OpenProposal", {
      purpose: "select", action: { tag: "SelectWinner", value: WORKER }, deadline: new Date(Date.now() + 7 * 864e5).toISOString(),
    });
    const voted = await exById(INVESTOR, "GovernanceProposal", prop.exerciseResult, "CastProposalVote", { voter: INVESTOR, vote: "ACCEPT" });
    const mandate = await exercise(INVESTOR, "ProjectPosting", postingCid, "SelectWorker", { actor: INVESTOR, proposalCid: voted.exerciseResult, applicationCid: appCid });

    console.log("3. Worker drafts plan; investor approves; worker submits milestone ...");
    const plan = await exById(WORKER, "PlanningMandate", mandate.exerciseResult, "ProposePlan", {
      milestones: [{ deliverablesHash: "h", payment: "1000.0", workerWindow: rel(172800), reviewWindow: rel(86400), violationPct: "0.1", isFinal: true }],
      maxSubmissions: "5",
    });
    const proj0 = await exById(INVESTOR, "WorkPlan", plan.exerciseResult, "ApprovePlan", { actor: INVESTOR });
    const proj1 = await exById(WORKER, "Project", proj0.exerciseResult, "SubmitMilestone", { deliverableHash: "d", deliverableUri: "" });
    let projectCid = proj1.exerciseResult;

    console.log("4. Investor REJECT (vote + reasons + finalize) — the atomic chain the UI now uses ...");
    const reviews = await query(INVESTOR, "MilestoneReview");
    const reviewCid = reviews[0].contractId;
    const rv = await exById(INVESTOR, "MilestoneReview", reviewCid, "CastVote", { voter: INVESTOR, vote: "REJECT" });
    const rr = await exById(INVESTOR, "MilestoneReview", rv.exerciseResult, "SetRejectionReasons", { actor: INVESTOR, reasons: ["missing the enterprise pricing tier", "hero CTA is a dead link"] });
    const fin = await exById(INVESTOR, "Project", projectCid, "FinalizeReview", { actor: INVESTOR, reviewCid: rr.exerciseResult });
    projectCid = fin.exerciseResult; // Some cid (RejPending)

    console.log("5. Query Projects AS THE AGENT ...\n");
    const agentProjects = await query(AGENT, "Project");
    const dispute = agentProjects.find((p) => p.payload.status === "RejPending");
    if (dispute) {
      console.log("   ✅ PASS — the AI agent sees the dispute (status RejPending).");
      console.log(`      rejectionReasons = ${JSON.stringify(dispute.payload.rejectionReasons)}\n`);
    } else {
      console.log(`   ❌ FAIL — agent sees no RejPending dispute (saw ${agentProjects.length} project(s)).\n`);
    }

    console.log("6. Resolve via AgentVerdict + clean up ...");
    await exById(AGENT, "Project", projectCid, "AgentVerdict", { rejectionValid: false }); // investor violation -> settles (final)
    projectSettled = true;
  } finally {
    console.log("   archiving leftovers ...");
    for (const c of created) {
      // Skip the project's own contracts if it settled (they're already consumed).
      if (projectSettled && (c.e === "Project")) continue;
      try { await archive(c.p, c.e, c.cid); } catch { /* may already be consumed by the flow */ }
    }
    console.log("   done. (A Settlement record may remain — it's immutable and harmless.)");
  }
}
main().catch((e) => { console.error("\nError:", e.message); process.exit(1); });

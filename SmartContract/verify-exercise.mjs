/**
 * Quick smoke-test: fetch a token via /api/daml-token, then exercise
 * InvestorParty.SetupAndPost (or just do a create if no party exists).
 * Run: node SmartContract/verify-exercise.mjs
 */
const BASE = "http://localhost:3000";
const INVESTOR = "Investor::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8";
const WORKER   = "Worker::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8";
const AGENT    = "Agent::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8";

async function main() {
  // 1. Fetch token
  console.log("== Step 1: Fetch token via /api/daml-token ==");
  const tokenRes = await fetch(`${BASE}/api/daml-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ party: INVESTOR }),
  });
  if (!tokenRes.ok) {
    console.error("Token fetch failed:", tokenRes.status, await tokenRes.text());
    process.exit(1);
  }
  const { token } = await tokenRes.json();
  console.log("  Token received, length:", token.length);
  
  // Decode sub (userId)
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  const userId = payload.sub;
  console.log("  userId (sub):", userId);

  // 2. Ping readyz
  console.log("\n== Step 2: Ping /ledger/readyz ==");
  const readyzRes = await fetch(`${BASE}/ledger/readyz`);
  console.log("  readyz status:", readyzRes.status, await readyzRes.text());

  // 3. Get ledger-end offset
  console.log("\n== Step 3: Get ledger-end ==");
  const endRes = await fetch(`${BASE}/ledger/v2/state/ledger-end`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const endJson = await endRes.json();
  console.log("  ledger-end:", JSON.stringify(endJson));
  const offset = endJson.offset ?? 0;

  // 4. Query ACS for existing InvestorParty contracts
  console.log("\n== Step 4: Query ACS for InvestorParty ==");
  const acsBody = {
    activeAtOffset: offset,
    verbose: false,
    filter: {
      filtersByParty: {
        [INVESTOR]: {
          cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }],
        },
      },
    },
  };
  const acsRes = await fetch(`${BASE}/ledger/v2/state/active-contracts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(acsBody),
  });
  const acsArr = await acsRes.json();
  const contracts = Array.isArray(acsArr) ? acsArr : [];
  console.log("  Total active contracts for Investor:", contracts.length);

  // Find InvestorParty contracts
  const parties = contracts.filter(c => {
    const ev = c?.contractEntry?.JsActiveContract?.createdEvent ??
               c?.activeContract?.createdEvent ?? c?.createdEvent;
    return ev?.templateId?.includes(":Vindex:InvestorParty");
  });
  console.log("  InvestorParty contracts found:", parties.length);

  if (parties.length > 0) {
    // We already have an InvestorParty — try exercising a read-only choice or just report
    const first = parties[0];
    const ev = first?.contractEntry?.JsActiveContract?.createdEvent ??
               first?.activeContract?.createdEvent ?? first?.createdEvent;
    console.log("  First InvestorParty contractId:", ev?.contractId);
    console.log("  First InvestorParty templateId:", ev?.templateId);
    console.log("  InvestorParty payload (admin):", ev?.createArgument?.admin ?? ev?.createArguments?.admin);
    
    // Try exercise: OpenProposal (a governance write)
    console.log("\n== Step 5: Try exercise — InvestorParty.OpenProposal ==");
    const pkgId = ev.templateId.split(":")[0];
    const exerciseCmd = {
      commands: {
        commands: [{
          ExerciseCommand: {
            templateId: `${pkgId}:Vindex:InvestorParty`,
            contractId: ev.contractId,
            choice: "OpenProposal",
            choiceArgument: {
              purpose: "Test governance proposal from verify-exercise",
              action: { tag: "ResolveContinue", value: {} },
              deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
            },
          },
        }],
        actAs: [INVESTOR],
        readAs: [INVESTOR],
        commandId: `vindex-test-${Date.now()}`,
        submissionId: `vindex-test-${Date.now()}`,
        userId,
      },
    };
    try {
      const exRes = await fetch(`${BASE}/ledger/v2/commands/submit-and-wait-for-transaction`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(exerciseCmd),
      });
      const exText = await exRes.text();
      console.log("  Exercise status:", exRes.status);
      console.log("  Exercise response:", exText.slice(0, 800));
    } catch (err) {
      console.error("  Exercise error:", err.message);
    }
  } else {
    // No InvestorParty — create one
    console.log("\n== Step 5: Create InvestorParty ==");
    const createBody = {
      commands: {
        commands: [{
          CreateCommand: {
            templateId: "24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:InvestorParty",
            createArguments: {
              admin: INVESTOR,
              members: [INVESTOR],
              contributions: [{
                investor: INVESTOR,
                projectFunding: "4000.0",
                weight: "1",
              }],
              config: {
                votingModel: "Simple",
                maxInvestors: "5",
                thresholdFraction: "0.5",
                quorumFraction: "0.5",
              },
              agent: AGENT,
              budgetAmount: "4000.0",
              agentFeeAmount: "300.0",
            },
          },
        }],
        actAs: [INVESTOR],
        readAs: [INVESTOR],
        commandId: `vindex-create-${Date.now()}`,
        submissionId: `vindex-create-${Date.now()}`,
        userId,
      },
    };
    try {
      const createRes = await fetch(`${BASE}/ledger/v2/commands/submit-and-wait-for-transaction`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(createBody),
      });
      const createText = await createRes.text();
      console.log("  Create status:", createRes.status);
      console.log("  Create response:", createText.slice(0, 800));
    } catch (err) {
      console.error("  Create error:", err.message);
    }
  }
  
  console.log("\n== Done ==");
}

main().catch(e => { console.error(e); process.exit(1); });

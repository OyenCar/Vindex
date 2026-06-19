# Verdix — Live Demo Runbook

Everything below runs against a **real Canton ledger** (local sandbox). No mocks.

## 0. Prerequisites

- Daml SDK 2.9.4 (`daml` on PATH, or use the full exe path).
- Node 18+ and the app deps installed: `cd verdix-web && npm install`.

## 1. Start the ledger (3 terminals or background)

```bash
# from the Daml project
cd Vindex

# (a) Canton sandbox — ledger API on 6865 (static time lets the deadline scenario run)
daml sandbox --static-time --port 6865

# (b) upload the contracts + allocate the demo parties
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
daml ledger allocate-parties Investor Worker Agent --host localhost --port 6865
#   → copy the printed party ids (Investor::1220…, Worker::1220…, Agent::1220…)

# (c) JSON Ledger API on 7575 (what the browser talks to)
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575 --allow-insecure-tokens
```

## 2. Prove the protocol end-to-end on the live ledger

```bash
cd Vindex
for s in testHappyPathMulti testValidRejectionRevision testInvestorViolation \
         testWorkerViolationStop testVotingModels testOverfundRejected testAgentFreezeThenTopUp; do
  daml script --dar .daml/dist/vindex-0.1.0.dar --script-name Vindex.Test:$s \
    --ledger-host localhost --ledger-port 6865 --static-time && echo "PASS $s"
done
```

All seven pass → every workflow (create→accept→pay, AI dispute, deadline penalty, governance
voting, escrow guards) executes on the actual participant.

## 3. Run the app

```bash
cd verdix-web
# put the allocated party ids into .env.local (NEXT_PUBLIC_PARTY_INVESTOR/WORKER/AGENT)
npm run dev          # http://localhost:3939/app
```

`.env.local` already points HTTP at the same-origin proxy `/ledger/` (→ :7575) and WS at
`ws://localhost:7575/`, with dev JWT issuance.

## 4. Click-through demo

### Scenario 1 — happy path (no AI)
1. `/app` → role **Investor** → **Connect party**.
2. **Create Investor Party** (set the Agent party id) → *Committed on-ledger*.
3. **Fund Budget + Agent-Fee Vaults & Post Job** (set the Worker candidate party id) → vaults
   appear under *Escrow Vaults (live)*.
4. New tab → **Worker** → **Apply**.
5. Investor → open a SelectWinner proposal + vote + **SelectWorker** (governance).
6. Worker → **Accept & deposit commitment** → **Submit milestone**.
7. Investor → **Vote Accept** → **Finalize review** → payment releases, project advances; final
   milestone → *Settlements (live)* shows the payout.

### Scenario 2 — dispute → AI verdict
- At step 7, **Vote Reject** + record reasons → status becomes *Awaiting AI verdict*.
- Connect as **AI Agent** → on the disputed project choose **Rejection invalid → enforce payout**
  (investor violation: penalty + full payment) or **Rejection valid → revision**.

### Scenario 3 — missed deadline → penalty
- With short worker windows (or via `daml script testWorkerViolationStop`), Agent panel →
  **Trigger worker violation** → commitment penalty moves; governance votes continue/stop.

### Scenario 4 — multi-investor governance
- Proven live via `testHappyPathMulti` / `testVotingModels` (simple/super/weighted). Investor
  Parties form by invite/accept; voting outcomes drive the Daml workflow.

## 5. Explorer

`/app/explorer` — live transparency layer streaming all contracts: parties, projects, milestones,
escrow/commitment/agent vaults, governance, AI disputes, settlements.

## Notes

- Static-time sandbox: advance time for deadline demos via `daml script` (uses `passTime`).
- Hosted participant: set `NEXT_PUBLIC_LEDGER_*`, `DAML_AUTH_MODE=hosted`, and a token/OIDC in
  `.env.local` (see `.env.local.example`) — the app code is identical.

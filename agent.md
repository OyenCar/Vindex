# Vindex — Agent Execution Guide

> This file is the execution guide for any future agent (human or AI) continuing development.
> Read `memory.md` first for full project context. Keep **both** files updated after every
> significant task. Derive everything from the actual codebase; do not assume.
>
> **Last updated:** 2026-06-20.

---

## 1. Mission

Deliver and continuously harden a **fully functional, demo-ready, Canton-native Vindex platform**
— an AI-governed freelance escrow protocol where:

- Daml contracts on Canton are the **single source of truth** and the enforcement engine.
- The frontend drives **every** business action as a **real ledger command** (no mocks, no
  placeholders, no fake buttons) and reflects ledger state in **real time** via streaming.
- A complete end-to-end workflow (project creation → funding → milestones → acceptance/dispute →
  payment release → completion) can be demonstrated **live** to judges/investors/users.

The protocol is considered "done for a milestone" only when it **builds, runs, connects to Canton,
executes real Daml workflows, and every user journey is verified**.

---

## 2. Current Priorities

### 2.1 Highest priority (do these first)

1. **Surface the multi-investor invite flow in the UI** (`InviteInvestor` → `AcceptInvite`). The
   contracts already work on the live ledger; the Investor panel must expose an invite form and an
   "accept invite" view so Scenario 4 (multi-investor) is click-through in the browser.
2. **Surface the full governance-proposal lifecycle in the UI** (`OpenProposal` →
   `CastProposalVote` → execute via `SelectWorker` / `ResolveAfterViolation` / `TopUpAgentFee`).
   Today only milestone-review voting is exposed.
3. **Make the worker-selection path fully click-through** (Investor posts → Worker applies →
   Investor opens SelectWinner proposal + votes → `SelectWorker` → `ProjectProposal` → Worker
   `AcceptProposal`). Pieces exist; wire them as guided steps.

### 2.2 Medium priority

4. Replace/repair the **stale landing UI** (`WalletSupport.tsx` Wagmi/RainbowKit/MetaMask copy)
   with Canton/party messaging; update `Vindex-web/README.md`.
5. Add a **transaction-history / event view** (Explorer enhancement) and surface real
   contract/update ids consistently.
6. Add a **deadline / time-advance control** for in-browser Scenario 3 (or document the
   static-time vs wall-clock demo modes clearly in the UI).
7. Add **frontend unit/integration tests** (vitest/jest + Testing Library) and a scripted live
   integration test runner.

### 2.3 Low priority

8. External **OIDC IdP** integration + a real user/identity store and login/registration screens.
9. **Containerize** the stack (Docker + compose) with a one-command bring-up (sandbox + json-api +
   web).
10. Off-ledger **artifact storage** for raw deliverables/presentations (only hashes are on-ledger).
11. Real **AI model/service** behind the Agent party (currently an operator submits the verdict).
12. Tighten **vault observer privacy** (drop losing candidates from vault stakeholders on accept).
13. Add an **`agentVerdictDeadline`** mechanism to prevent `RejPending` stalls.

---

## 3. Current Sprint

### 3.1 In progress

- (none actively mid-edit) — the live end-to-end stack is built and verified; documentation
  (`memory.md`, `agent.md`) is the current task and is complete.

### 3.2 Blocked

- **Hosted Canton participant integration** — blocked on operator credentials (JSON-API URL, a
  party-claim JWT or OIDC client creds, real party ids, DAR-uploaded confirmation). Code is
  env-ready (`.env.local.example`, `DAML_AUTH_MODE=hosted`).
- **External OIDC login** — blocked on choosing/standing up an IdP.

### 3.3 Next

- Items 1–3 from §2.1 (multi-investor + governance UI), then §2.2.

---

## 4. Active TODO List (with priority, dependencies, complexity)

Complexity scale: **S** (small, <½ day) · **M** (medium, ~1 day) · **L** (large, multi-day).

- [ ] **(Critical, M)** Invite-members UI: form on `InvestorPanel` calling `InvestorParty.InviteInvestor`; an "Invites" view for an invitee party to `AcceptInvite`. _Deps:_ existing `DamlProvider`, `useCommand`, generated bindings. _Why critical:_ unblocks live multi-investor demo.
- [ ] **(Critical, M)** Governance-proposal UI: open proposal (`OpenProposal`), list proposals (stream `GovernanceProposal`), `CastProposalVote`, and execute (`SelectWorker` / `ResolveAfterViolation` / `TopUpAgentFee`). _Deps:_ none new.
- [ ] **(Critical, M)** Worker-selection guided flow across roles (apply → propose → select → accept). _Deps:_ governance-proposal UI (for SelectWinner).
- [ ] **(High, S)** Replace stale `WalletSupport.tsx` content; fix `Vindex-web/README.md`. _Deps:_ none.
- [ ] **(High, M)** Frontend tests: component tests for panels/hooks; a Node integration test that drives a full scenario via `@daml/ledger` against a running json-api. _Deps:_ running ledger.
- [ ] **(High, S)** One-command dev bring-up script (start sandbox + json-api + allocate + write `.env.local` + start web). _Deps:_ none.
- [ ] **(Medium, M)** Transaction-history / event view in Explorer (surface update ids, archived events). _Deps:_ JSON API stream semantics.
- [ ] **(Medium, S)** In-browser time-advance control or explicit demo-mode banner for Scenario 3. _Deps:_ static-time sandbox.
- [ ] **(Medium, S)** Tighten vault `stakeholders` (drop losing candidates on accept) in `Vindex.daml`; re-test + re-codegen. _Deps:_ Daml change → rebuild → codegen.
- [ ] **(Low, L)** External OIDC IdP + user store + login/registration screens. _Deps:_ IdP choice; `/api/daml-token` hosted path.
- [ ] **(Low, M)** Docker + compose for sandbox/json-api/web. _Deps:_ none.
- [ ] **(Low, M)** Off-ledger artifact storage (S3/IPFS) keyed by the on-ledger hash. _Deps:_ storage choice.
- [ ] **(Low, L)** Real AI model/service behind the Agent party. _Deps:_ model/provider choice.
- [ ] **(Low, S)** Add `agentVerdictDeadline` to the Daml model + UI. _Deps:_ Daml change → rebuild → codegen + tests.

---

## 5. Development Rules (non-negotiable)

Future agents **must**:

1. **No mock data, no placeholders, no fake buttons.** Every button/form executes a real
   `create`/`exercise` against the deployed Daml contracts.
2. **Keep the architecture Canton-native.** Do **not** introduce Wagmi/Viem/RainbowKit/MetaMask/
   WalletConnect or any EVM tooling — they cannot reach Canton.
3. **Daml is the source of truth.** Business logic, money movement, and state machines live in the
   contracts, not in the frontend or a database. Money moves **only** inside `AssetVault` choices.
4. **Preserve existing functionality.** Run `daml build` + `daml test` + the live scenario suite +
   `next build` after changes. Do not regress passing scenarios or the money invariant.
5. **After any Daml change:** rebuild the DAR, **re-run `daml codegen js`** into
   `Vindex-web/daml.js`, and update the package id references if the package changes.
6. **Type-check against the real bindings.** Construct payloads using the generated `@daml.js/
   vindex-0.1.0` types (`Numeric`/`Int`/`Party` are strings; `RelTime = { microseconds }`).
7. **SSR-safety:** never gate rendered DOM structure on client-only values (`useReducedMotion`,
   `window`, `Math.random` in render, time). Use deterministic data, CSS media queries, and
   `MotionConfig` for reduced motion.
8. **PowerShell + daml:** check `$LASTEXITCODE`, never `$?` (the SDK-update notice on stderr
   corrupts `$?`).
9. **Verify, don't assume.** Use the live ledger + Playwright to confirm user journeys before
   claiming completion. Treat any disconnected UI element, disabled button, missing ledger
   integration, placeholder, mocked response, unfinished workflow, or untested journey as a
   **critical bug**.
10. **Update `memory.md` and `agent.md`** after every significant task so they always reflect the
    current state.

---

## 6. Testing Requirements

### 6.1 Required tests

- **Daml:** unit/workflow coverage of escrow, milestone, governance (simple/super/weighted), AI
  dispute (valid/invalid), payment release, violation, overfund, agent-fee freeze/top-up.
- **Live ledger:** each scenario re-run against a running participant (`daml script`).
- **Frontend:** component/hook tests; an integration test driving a full scenario via
  `@daml/ledger`; regression checks for hydration/CORS/hooks.

### 6.2 Existing tests (verified passing)

- `Vindex/daml/Vindex/Test.daml` — **8 Daml Scripts**: `testHappyPathMulti`,
  `testVotingModels`, `testOverfundRejected`, `testValidRejectionRevision`,
  `testInvestorViolation`, `testWorkerViolationStop`, `testAgentFreezeThenTopUp`, plus the
  `setup` init-script. `daml test` → 8/8 pass.
- **Live-ledger run:** the 7 functional scripts pass via `daml script` against the sandbox (7/7).
- **Frontend verification (manual/script, this session):**
  `Vindex-web/scripts/ledger-check.mjs` (HTTP 200), `Vindex-web/scripts/seed-and-verify.cjs`
  (`@daml/ledger` create+query round-trip), and Playwright (live connect + stream + real
  `SetupAndPost` write; 0 hydration/hooks/CORS errors).

### 6.3 Missing tests

- No automated frontend unit/integration test suite (vitest/jest) in the repo.
- No CI pipeline; no automated live-ledger regression runner.
- No tests for the API routes (`/api/daml-token`, `/api/daml-party`).

---

## 7. Known Issues

### 7.1 Bugs (currently none open; fixed this session)

- ✅ Fixed: `TopUp` choice/constructor namespace collision → renamed `VaultTopUp`.
- ✅ Fixed: invite-accept "contract not visible" → added `pending` observers + consuming
  `InviteInvestor`.
- ✅ Fixed: hydration mismatch from `useReducedMotion`-gated SVG nodes → structure invariant +
  `MotionConfig`.
- ✅ Fixed: `PartyConnect` hooks-order violation ("Rendered fewer hooks than expected") → moved
  `useState` above the early return.
- ✅ Fixed: browser↔JSON-API CORS → same-origin `/ledger/*` proxy + runtime absolute base URL.

### 7.2 Runtime errors

- Favicon 404 on the app (no `app/icon`); harmless. Optional: add an icon.
- Sandbox is in-memory: a restart **resets contracts and party ids**; `.env.local`
  `NEXT_PUBLIC_PARTY_*` must be updated with freshly-allocated ids after each restart.

### 7.3 Build issues

- `@daml/ledger`/`@daml/types` mis-declare `lodash`; it is added to `package.json` to fix
  Module-not-found. Keep it.
- `@daml/react` is incompatible with React 18 — do not add it; use `@daml/ledger` directly.

### 7.4 Architecture concerns

- `RejPending` can stall (no `agentVerdictDeadline`).
- Top-up-during-freeze latency (governance threshold required while frozen).
- Dev JWT is unsafe (unverified signature) — local only.
- Vault observer over-share (losing candidates).
- Static-time vs wall-clock demo/production divergence for deadlines.

---

## 8. Next Recommended Actions (exact)

1. **Build the invite + governance-proposal UI** (TODO items 1–2). Pattern: stream the relevant
   template with `useStreamQueries`, render a form, submit via `useCommand(() =>
   session.ledger.exercise(Vindex.X.Choice, cid, arg))`, show `TxStatus`. This makes Scenario 4
   fully click-through and matches the live-script proof.
2. **Wire the end-to-end worker-selection flow** across the three role panels as guided steps.
3. **Fix the stale landing copy** (`WalletSupport.tsx`) and the frontend README.
4. **Add a one-command dev bring-up** and a scripted live integration test, then **add frontend
   unit tests**.
5. **Re-run the full verification** (daml build/test, live scenarios, next build, Playwright
   journey) and **update `memory.md` + `agent.md`**.

---

## 9. Project-wide TODO (categorized; description · status · dependency chain · effort)

### 9.1 Critical (blocks live demo readiness)

- **Multi-investor invite UI** — _Description:_ forms for `InviteInvestor`/`AcceptInvite`.
  _Status:_ Missing (contracts done). _Dependency chain:_ DamlProvider → useCommand → bindings.
  _Effort:_ M.
- **Governance-proposal UI** — _Description:_ open/vote/execute proposals.
  _Status:_ Missing (contracts done). _Dependency chain:_ stream `GovernanceProposal` → execute
  choices. _Effort:_ M.
- **Worker-selection guided flow** — _Description:_ apply→propose→select→accept across roles.
  _Status:_ Partial (choices exist). _Dependency chain:_ governance-proposal UI. _Effort:_ M.

### 9.2 High (required for MVP)

- **Frontend test suite** — _Status:_ Missing. _Deps:_ running ledger for integration tests.
  _Effort:_ M.
- **One-command dev bring-up script** — _Status:_ Missing. _Deps:_ none. _Effort:_ S.
- **Landing-page de-Wagmi-fication + README refresh** — _Status:_ Missing. _Deps:_ none.
  _Effort:_ S.
- **Hosted participant wiring** — _Status:_ Blocked (creds). _Deps:_ operator credentials.
  _Effort:_ S once creds exist.

### 9.3 Medium (important improvements)

- **Transaction-history/event view** — _Status:_ Missing. _Deps:_ JSON API stream. _Effort:_ M.
- **Scenario-3 time-advance/demo-mode UX** — _Status:_ Missing. _Deps:_ static-time sandbox.
  _Effort:_ S.
- **Vault observer privacy tightening (Daml)** — _Status:_ Missing. _Deps:_ Daml rebuild +
  codegen + tests. _Effort:_ S.

### 9.4 Low (nice-to-have)

- **OIDC IdP + user store + login/registration** — _Status:_ Configured (hosted token path only).
  _Deps:_ IdP. _Effort:_ L.
- **Docker/compose** — _Status:_ Missing. _Deps:_ none. _Effort:_ M.
- **Off-ledger artifact storage** — _Status:_ Missing. _Deps:_ storage choice. _Effort:_ M.
- **Real AI model service** — _Status:_ Missing (operator submits verdict). _Deps:_ provider.
  _Effort:_ L.
- **`agentVerdictDeadline`** — _Status:_ Missing. _Deps:_ Daml rebuild + codegen + tests.
  _Effort:_ S.
- **Add favicon/app icon** — _Status:_ Missing. _Deps:_ none. _Effort:_ S.

---

## 10. Demo Readiness

> Status legend: **Complete** (works live, verified) · **Partial** (works but incomplete UI/flow)
> · **Missing** (not built) · **Blocked** (needs external input/creds).

| Capability | Status | Evidence / notes |
|---|---|---|
| **Authentication** | **Partial** | Party JWT auth + session + role + party-mapping + auto-reconnect: Complete & verified (live connect). OIDC/external IdP + user registration screens: Missing/Blocked (local uses dev HS256 JWT; party allocation serves as registration). |
| **Party Management** | **Partial** | Create party (party of one): Complete (live, verified). Real party allocation endpoint: Complete. Invite members / join / governance-role config UI: Missing (contracts done, UI not surfaced). |
| **Escrow** | **Complete** | Budget + Agent-Fee vaults created live via `SetupAndPost` and streamed back (BudgetV 4000.0 / AgentFeeV 300.0). Commitment vault on accept, release/spend/settle, overfund guard, money invariant: verified by live scenarios. |
| **Milestones** | **Partial** | Submit + review-vote + finalize choices exist and are verified live (scripts) and via the Investor/Worker panels; full guided multi-milestone click-through in the browser needs the selection/governance UI to be wired end-to-end. |
| **Governance** | **Partial** | Voting models (simple/super/weighted) + quorum + proposals: Complete in contracts, verified live (`testVotingModels`, `testHappyPathMulti`). UI exposes milestone-review voting only; proposal lifecycle forms: Missing. |
| **AI Arbitration** | **Complete (contracts) / Partial (UI)** | Dispute-only AI; `AgentVerdict` valid→revision and invalid→investor-violation payout: verified live (`testValidRejectionRevision`, `testInvestorViolation`). Agent panel exposes verdict + enforcement; reaching `RejPending` from the UI needs the reject+reasons+finalize path surfaced as a guided flow. |
| **Explorer** | **Complete** | `/app/explorer` streams all templates (parties, postings, projects, milestones, vaults, proposals, reviews, AI disputes, settlements) live. |
| **Real-time Updates** | **Complete** | WebSocket `streamQueries` per template; verified: a live `SetupAndPost` write appeared in the UI without refresh. Auto-reconnect via `reconnectThreshold`. |

### 10.1 Overall demo-readiness summary

- **Demoable today (live, in browser):** connect as a party → create Investor Party → fund vaults
  + post job → see vaults/projects/settlements stream live → Explorer transparency view.
- **Demoable today (live, via `daml script`):** all four scenarios end-to-end (happy path, AI
  dispute valid/invalid, deadline penalty + stop, multi-investor governance voting) — 7/7 pass on
  the live ledger.
- **Gap to "fully click-through in the browser for all four scenarios":** the multi-investor
  invite UI, the governance-proposal lifecycle UI, and the guided worker-selection + reject→AI
  flow (Critical TODOs §9.1).

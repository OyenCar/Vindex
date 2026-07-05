# Deadlines · Late-Penalty · Reputation — Design (v3)

> Consolidated from the 2026-07-04 design discussion. Supersedes the hardcoded `days(2)` window +
> hard-block deadline + always-on `WorkerViolation` penalty.

## Locked decisions

**Deadlines**
- **Per-milestone** due dates (matches the escrow-checkpoint model; the contract is already per-milestone).
- **Investor sets the terms** (deadline window + penalty policy); the **worker fits the plan within them** —
  same pattern as the `maxRevisions` ceiling we shipped.
- Enforcement uses Daml **`getTime` (ledger time)**, never client/JS time — a party can't be trusted to
  report "now". A JS date/duration picker is fine for the *value* (it's data); "is it overdue?" compares
  the stored deadline against `getTime`.
- Run the **live sandbox in wall-clock** so `getTime` advances and deadlines fire on their own.
  `daml test` keeps passing (it uses its own in-memory static time); only the "advance time on the live
  ledger via `daml script --static-time`" demo trick is lost.

**Late submission (the key model change)**
- **Late submission is ALLOWED** — remove the hard `assertMsg "deadline passed"` block in `SubmitMilestone`.
- `late = getTime > workerDeadline`. Lateness is **deterministic contract math** — the **AI never judges
  lateness** (it only judges work-quality on a dispute, unchanged).
- **Late penalty source:** the **Commitment Vault** (worker's stake) → investor, capped at balance.
- **Applied at ACCEPTANCE**, only if the *accepted* deliverable was late (revisions aren't double-charged).
- **Investor can WAIVE** the late fee at review time (forgives a technical-issue delay). A missed deadline
  is not automatically the worker's fault.

**Reputation (per-pair, Canton-private)**
- Scoped to the **investor–worker pair** → visible only to them (like `Settlement`s already are), so it does
  **not** break Canton privacy. A *global* reputation ledger would; we don't need one.
- **Good** = a `Completed` Settlement for (this investor's members, worker) — even if some milestones were
  late-with-penalty. **Bad** = **abandonment** (worker never delivered → investor marks failed).
- **INVITE_ONLY** = the investor's **proven collaborators** (good, no bad). OPEN_POOL = new hires.

## Open micro-details — recommended defaults (change if you disagree)

1. **Reputation enforcement:** start **UI-derived** (compute the trusted-worker list from the investor's
   visible `Completed` Settlements; fills `eligibleWorkers`). Private, no Daml. Upgrade to an on-ledger
   `CollaborationRecord` later if you want it trustless.
2. **Deadline representation:** per-milestone **window/duration** (e.g. "5 days"), investor-set ceiling —
   **not absolute dates**. Milestones start at unpredictable times (after the prior is accepted), so an
   absolute date would already be blown for later milestones. Window + `getTime` at activation is robust.
3. **Abandonment trigger:** **manual investor "mark failed"** action — works in any time mode and is the
   single reputation-negative event. (With wall-clock + a hard grace deadline, `WorkerViolation` could also
   auto-fire; manual is the safe default.)

## Daml changes (SmartContract)

- **Investor owns the terms:** move `violationPct` (penalty; 0 = none) and the per-milestone window
  ceiling from the worker's plan to the investor side (posting/mandate → clamp the worker's plan, like
  `maxRevisions`).
- **`SubmitMilestone`:** drop the `now <= workerDeadline` hard block; accept anytime.
- **Track lateness:** at submit, record whether `getTime > workerDeadline` (store on the Project/review),
  or recompute at finalize.
- **`FinalizeReview` (accept) + `AgentVerdict` (accept path):** if the accepted deliverable was late AND
  `violationPct > 0` AND not waived → `Spend` the late penalty from the **Commitment Vault** to the
  investor (capped). Add a `waiveLatePenalty : Bool` argument to the accept choice.
- **Abandonment:** keep an investor-triggered failure path (reuse/rename `WorkerViolation`) — the only
  "bad" record.
- **Reputation:** on-ledger record deferred (UI-derived first).

## UI changes (FrontEnd)

- **Investor terms (Post):** per-milestone deadline **window** + **penalty %** (0 = none) inputs.
- **Worker plan:** windows clamped to the investor ceiling (mirrors `maxRevisions`).
- **Review:** show "submitted late" + the pending penalty; investor gets **Accept** and
  **Accept & waive late fee**.
- **INVITE_ONLY:** a "Trusted workers" picker built from the investor's `Completed` Settlements.
- **Ops:** run the sandbox in **wall-clock** mode.

## Build sequence

1. **Daml** — investor terms (window ceiling + penalty), late-allowed submit, late-penalty-at-accept from
   commitment (capped) + waive, manual abandonment. → `daml build` + `daml test` + `codegen js` + reseed.
2. **UI** — investor term inputs, worker clamp, late/waive review controls.
3. **Reputation** — UI-derived trusted-worker list for INVITE_ONLY.

Vision/image arbitration bug + OPEN_POOL `isWorkerParty` hint fix remain parked.

---

# ⭐ STATUS — RESUME HERE (updated 2026-07-05)

## Ledger / build state
- **Package id: `51e3659419aa5a4b3533c100b258787e7300ec054d94fbcc399c558fa2db67ed`** — bindings
  regenerated (`FrontEnd/daml.js`), DAR uploaded to the live sandbox.
- `daml test` **15/15 pass**. `FrontEnd` `tsc --noEmit` **0 errors**.
- App RUNS on the **local Canton sandbox** (still static-time as last run; docs now say wall-clock — a
  restart applies it). No code work is blocked. Nothing else changed the app this session.
- Run docs (RUNBOOK/README/DEMO) now launch the sandbox **WALL-CLOCK** (dropped `--static-time`) so
  deadlines/late-penalty fire live. Restart the sandbox to pick this up (in-memory → wipes contracts
  → re-run `seed.ps1`). `daml test` unaffected. Trade-off: the `daml script --static-time`
  advance-time demo trick is gone.

## DONE this session — the deadline/late-penalty/investor-terms feature
- **Late submission ALLOWED** — removed the hard `deadline passed` block in `SubmitMilestone`; sets a
  `submittedLate : Bool` flag (`now > workerDeadline`).
- **Investor sets ALL terms at post, worker fits** — Daml fields threaded
  `SetupAndPost` → `ProjectPosting` → `PlanningMandate` → `WorkPlan` → `Project`:
  - `maxRevisions` (submission ceiling), `latePenaltyPct` (0..1), `maxWorkerWindow` (deadline ceiling).
  - `ProposePlan`/`ProposePlanAgain` assert `maxSubmissions <= maxRevisions` AND every
    `milestone.workerWindow <= maxWorkerWindow`.
- **Late penalty** — charged at ACCEPTANCE from the **Commitment Vault** (capped), in
  `acceptAndAdvance p bonus latePenalty` (now 3-arg). `FinalizeReview` gained
  `waiveLatePenalty : Bool`. Investor-violation + stale-timeout paths pass `0.0` (no late fee).
  Tests: `testLatePenalty` (200 taken), `testLatePenaltyWaived` (refunded).
- **UI** (`InvestorPanel.tsx`): Post tab inputs — "Late penalty (% of milestone)" (→ /100) and
  "Deadline per milestone (max days)" (→ `days(N)`). Review card shows "⏰ Submitted late" + an
  "Accept & Waive Late Fee" button; `acceptSubmission(review, proj, waiveLatePenalty=false)`.

## DONE this session (2026-07-04 cont.) — abandonment + reputation + wall-clock
1. **Abandonment (Daml) — DONE.** New `Project.MarkFailed` choice: investor-triggered, NOT
   deadline-gated (works under static-time), terminal. Settles the project with reason **`"Abandoned"`**
   (the SINGLE reputation-negative marker; `"Completed"` is the only good one). Worker forfeits their
   commitment stake as the abandonment penalty (`min (m.payment*m.violationPct) cv.amount`), budget
   refunded. Test `testMarkFailedAbandonment` (200 forfeited). `WorkerViolation`/`ResolveAfterViolation`
   left intact (tests depend on them; their "Stopped…" settlements are NOT counted by reputation).
2. **Reputation Step 3 (UI-derived) — DONE.** `InvestorPanel` `trustedWorkers` = workers with a
   visible `Completed` settlement and no `Abandoned` one (per-pair, Canton-private, no Daml). Post-tab
   INVITE_ONLY worker-pool now shows a "★ Trusted collaborators" quick-add row → fills `eligibleWorkers`.
   Settlement history row is reason-aware (Abandoned = red ⛔). A "Mark Abandoned" button on open
   projects in Monitor triggers `MarkFailed` (with confirm).
3. **Wall-clock ops — DONE (docs).** RUNBOOK/README/DEMO drop `--static-time`. User must restart the
   sandbox to apply (see Ledger state note).

## DevNet / testnet port — PAUSED + FULLY REVERTED (2026-07-05)
Hackathon requires the demo on a **testnet = Canton DevNet**, reached by porting onto **cn-quickstart**
(github.com/digital-asset/cn-quickstart). Explored, then **paused and completely uninstalled** — env is
clean, app untouched. Presentation ~**2026-07-13** (user has Canton allowlist access already).

**Decided approach if resumed = Port A (v1 sidecar).** Preserves the FrontEnd findings so no re-research:
- cn-quickstart exposes only **JSON Ledger API v2**; Vindex FrontEnd uses `@daml/ledger` = legacy **HTTP
  JSON API v1**. Bridge with the legacy `daml json-api` daemon (verified: **still ships in SDK 3.4.11**)
  on :7575 → participant gRPC Ledger API :3901. **No Daml changes, no frontend rewrite.** Rejected Port B
  (rewrite to v2) as too risky vs "does it work" on the timeline.
- Auth is already wired: `FrontEnd/app/api/daml-token/route.ts` has a **hosted OIDC client-credentials**
  mode → Keycloak RS256 JWT (`actAs=[party]`). Only env vars needed. `config.ts` ledger host is env-driven.
- cn-quickstart facts: toolchain via **Nix flake + direnv** (`direnv allow` at repo ROOT provisions
  `dpm`/`daml`/JDK21 — NOT plain `daml install`); `make setup` = profile prompts only; ports App-Provider
  gRPC **3901** / JSON-v2 3975 / Keycloak **8082**; DAR auto-uploads from `splice-onboarding:/canton/dars/`.
  At the profile prompt: **Observability = n** (RAM), **OAUTH2 = y** (real login).

**Why paused (env risk):** this box is **16 GB RAM** and cn-quickstart's full LocalNet stack wants
~8–12 GB → WSL wedged + Docker hung during setup, and the ~2 GB Nix toolchain download was slow. For a
*live* demo, running the whole stack locally is fragile. **On resume, strongly consider a hosted/remote
DevNet participant** (user has Canton access) so only the light Vindex sidecar+FrontEnd run on Windows —
skip the heavy local stack. (Reverted artifacts: `cn-port/` scaffold + `cn-quickstart-port` memory were
deleted; re-scaffold from this block. WSL runs Ubuntu + Docker Desktop, both kept + clean.)

## NEXT — priority order
1. **Worker-side window authoring** (code-only, no DevNet needed) — `WorkerPanel`
   `proposePlan`/`proposePlanAgain` hardcode `workerWindow: days(2)`; let the worker set per-milestone
   windows (clamped to `maxWorkerWindow`, mirrors the investor-terms pattern).
2. **DevNet port** (see block above) — Port A via cn-quickstart; prefer a hosted participant over the
   full local stack on this 16 GB box. Fix the `isWorkerParty` hint bug first (see PARKED) — it bites on
   real party allocation.
3. Restart sandbox wall-clock + `seed.ps1`, then verify late-badge/waive + trusted-picker in-app.

## GOTCHAS (read before continuing)
1. **Static-time hides the late feature in-app**: frozen clock → `submittedLate` is ALWAYS false live,
   so the late badge / waive button never appear. Tests prove the logic (`passTime`). To *see* it,
   switch to wall-clock (NEXT #3).
2. **In-memory sandbox**: any restart wipes contracts. After a restart: `SmartContract\seed.ps1`
   (upload DAR + allocate parties + write `FrontEnd\.env.local`) + **hard-reload the browser** +
   clear localStorage. Stale WS/localStorage renders GHOST contracts (memory.md §13.4).
3. **Dev script renamed**: `npm run kevinKontol` (NOT `dev`), port **3000**.
4. **After ANY Daml edit**: `daml build` → `daml codegen js .daml/dist/vindex-0.1.0.dar -o ../FrontEnd/daml.js`
   → `daml ledger upload-dar … --port 6865` → new package id → update `memory.md`.
5. **daml.exe**: `C:\Users\Lenovo\AppData\Roaming\daml\bin\daml.cmd` (or `$APPDATA/daml/bin/daml.cmd`).

## PARKED (separate threads, NOT this feature)
- **Vision/image arbitration bug** — image deliverables are fetched as text → the AI gets binary
  garbage → always rules "unjustified". Fix = send images as vision `image_url` to a vision-capable
  model in `/api/auto-arbitrate`.
- **OPEN_POOL `isWorkerParty` hint bug** (UI_UX_AUDIT C1) — registered workers can't apply; the
  allocate hint must equal exactly `"Worker"` (Canton `Hint::fingerprint`, and the Daml gate checks
  the hint segment == "Worker"). Currently `PartyConnect.tsx:63` sends `worker-<rand>`.
- **UI_UX_AUDIT.md** ship-blockers C2 (party-exists check on connect), C3 (`EarningsWidget` "Locked"
  not scoped to the worker's project) + the Canton-dev concerns (agent custody, BYOK economics, fake
  `deliverablesHash`, escrow-holds-no-value, static-time, multi-investor-UI-dead).
- **IPFS deliverable encryption** — the USER started this: `openEncrypted(...)` now backs the
  "View submitted deliverable" link in `InvestorPanel` (and likely a `FrontEnd/lib/crypto.ts`). Check
  its state before building more privacy work on top.

## Earlier this session (context, all shipped + green)
- v2 agent-fee removal (BYOK arbiter), `agentVerdictDeadline` + `ResolveStalePending` auto-accept,
  `maxRevisions`. BYOK **multiple keys** one-time Setup (sessionStorage, active+fallback), Setup as a
  labeled tab. Notification blue-dot on tabs + bell on both panels. Sticky investor tab bar.
  `/api/auto-arbitrate` uses Groq primary w/ fallback; `AiAuditSection` commits + auto-enforces.

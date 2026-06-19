# Verdix — Project Memory (Single Source of Truth)

> This file is the permanent, authoritative project memory. It is derived from a full audit of
> the actual codebase (not assumptions). A new engineer should be able to read `memory.md` and
> `agent.md` and immediately understand what Verdix is, how it works, its current status, the
> remaining work, the architecture decisions, and how to continue development.
>
> **Last full audit:** 2026-06-20.
> **Repository root:** `G:\web3\Hackathon\CantonEncode`
> **Companion file:** `agent.md` (execution guide, TODOs, demo-readiness tracking).

---

## 0. Naming, Repository Layout, and Ground Truth

### 0.1 Product name vs. package name

- **Product / brand name: "Verdix"** — used by the frontend, marketing/landing page, and all
  user-facing copy.
- **Daml package / module name: "Vindex"** — the on-ledger Daml package is named `vindex`
  (version `0.1.0`), the module is `Vindex`, and all templates live under `Vindex:*`.
- This split is intentional but is a known naming inconsistency (the protocol was originally
  prototyped as "Vindex" and the product rebranded to "Verdix"). When reading Daml code you will
  see `Vindex`; when reading the frontend you will see `Verdix`. They are the same protocol.

### 0.2 Two-project monorepo (no top-level git)

```
G:\web3\Hackathon\CantonEncode\
├── memory.md                      # THIS FILE — project long-term memory
├── agent.md                       # execution guide for future agents
├── Vindex\                        # Daml smart-contract project (has its OWN .git)
│   ├── daml.yaml                  # SDK 2.9.4, name vindex, version 0.1.0
│   ├── daml\
│   │   ├── Vindex.daml            # ALL templates + helpers (~810 lines)
│   │   └── Vindex\Test.daml       # Daml Script test suite (8 scripts)
│   ├── docs\STATE_MACHINE.md      # mermaid state + sequence diagrams + transition table
│   ├── README.md                  # protocol architecture, governance, privacy, locked decisions
│   ├── AGENTS.md                  # Daml-side agent guidance (invariants, gotchas)
│   ├── LICENSE
│   ├── .daml\dist\vindex-0.1.0.dar  # compiled DAR (build artifact)
│   └── log\canton.log, canton_errors.log  # sandbox run artifacts (safe to delete)
└── verdix-web\                    # Next.js frontend + Canton integration (NO git)
    ├── package.json               # Next 14.2.35, @daml/ledger 2.9.4, @daml/types 2.9.4
    ├── next.config.mjs            # /ledger/* → :7575 proxy (CORS fix)
    ├── tailwind.config.ts, postcss.config.mjs, tsconfig.json
    ├── .env.local                 # LIVE local config (ledger URLs + real party ids)
    ├── .env.local.example         # hosted-participant template
    ├── daml.js\                   # GENERATED TypeScript bindings from the DAR (real types)
    │   └── vindex-0.1.0\          # → npm package @daml.js/vindex-0.1.0
    ├── app\
    │   ├── layout.tsx             # root layout (Inter font, metadata)
    │   ├── page.tsx               # marketing landing (Hero + AnimatedBackground + Navbar)
    │   ├── globals.css            # design tokens + utilities + keyframes
    │   ├── api\daml-token\route.ts  # JWT issuance (dev HS256 | hosted OIDC)
    │   ├── api\daml-party\route.ts  # real Canton party allocation (registration)
    │   └── app\                   # THE DAPP (Canton-connected)
    │       ├── layout.tsx         # wraps DamlProvider + tab nav (Console / Explorer)
    │       ├── page.tsx           # Protocol Console (role-routed panels)
    │       └── explorer\page.tsx  # Verdix Explorer (live transparency dashboard)
    ├── components\
    │   ├── daml\                  # Canton integration UI
    │   │   ├── DamlProvider.tsx   # session/auth context, auto-reconnect, liveness ping
    │   │   ├── PartyConnect.tsx   # party login/registration/account mgmt
    │   │   ├── TxStatus.tsx       # transaction state UI (Canton-honest, no block confirmations)
    │   │   ├── ErrorBoundary.tsx  # dapp error boundary
    │   │   └── flows\             # role panels (real create/exercise)
    │   │       ├── InvestorPanel.tsx
    │   │       ├── WorkerPanel.tsx
    │   │       └── AgentPanel.tsx
    │   ├── ui\button.tsx          # shadcn/ui-style button + buttonVariants
    │   ├── AnimatedBackground.tsx # marketing: 5-layer animated background
    │   ├── Navbar.tsx, Hero.tsx, MetricCard.tsx, ProtocolVisualization.tsx, WalletSupport.tsx
    ├── lib\
    │   ├── daml\
    │   │   ├── config.ts          # ledger endpoints, roles, party prefill
    │   │   ├── ledger.ts          # @daml/ledger client factory + token fetch + pingLedger
    │   │   ├── useCommand.ts       # command runner: tx phases + retry
    │   │   ├── useStreamQueries.ts # live websocket subscription hook
    │   │   └── vindex.ts          # re-exports generated bindings + helpers (relTime, num, labels)
    │   └── utils.ts               # cn() class merge
    ├── scripts\
    │   ├── ledger-check.mjs       # HTTP connectivity check (mints JWT, queries JSON API)
    │   └── seed-and-verify.cjs    # @daml/ledger create+query round-trip (Node)
    ├── README.md                  # frontend README (landing-page focused, partly outdated)
    ├── COMPLETION_REPORT.md       # verification evidence + architecture + flows
    └── DEMO.md                    # live bring-up + click-through runbook
```

### 0.3 Daml package identity (ground truth from codegen)

- Package id (DAR): `6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0`
- Template ids look like:
  `6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:InvestorParty`
- npm binding package: `@daml.js/vindex-0.1.0` (generated by `daml codegen js`).

### 0.4 Toolchain ground truth

- **Daml SDK 2.9.4** installed at
  `C:\Users\Asus\AppData\Roaming\daml\sdk\2.9.4\daml\daml.exe`. **NOT on PATH** — call the full
  exe path, or add `C:\Users\Asus\AppData\Roaming\daml\bin` to PATH.
- **Node** v25.x, **npm** v11.x (system).
- A harmless `SDK 3.4.11 has been released!` notice prints on stderr for every `daml` command. In
  PowerShell this trips `NativeCommandError` and makes `$?` false even on success — **always check
  `$LASTEXITCODE`, never `$?`** for daml commands.

---

## 1. Project Overview

### 1.1 What Verdix is

Verdix is a **private, Canton-native, AI-governed freelance escrow protocol**. It lets a client
side (a single Investor or a multi-investor Organization) and a freelancer (Worker) agree on
**milestone-based work**, lock funds in **escrow vaults**, and have **payments, penalties,
deadlines, and milestone progression enforced automatically and deterministically on-ledger**.
There is **no manual dispute/arbitration layer**: when the two sides disagree, an **AI Agent acts
as the final, authoritative arbiter** and its verdict is automatically enforced by the smart
contracts.

It is implemented as:

- A set of **Daml smart contracts** running on **Canton Network** (the source of truth and the
  enforcement engine), and
- A **Next.js / TypeScript frontend** that connects to a Canton participant through the **Daml
  JSON Ledger API** to drive every business action as a real ledger command and to stream live
  state.

### 1.2 Why it exists / core business problem

Traditional freelance platforms rely on:

- A **centralized intermediary** holding funds and making subjective dispute decisions, which is
  slow, opaque, expensive, and a single point of trust/failure.
- **Manual arbitration** that is inconsistent and non-deterministic.

Verdix removes the human intermediary from the enforcement loop:

- Funds are held in **on-ledger escrow vaults** that only move via auditable contract choices.
- The **happy path is fully automatic**: if the investor accepts (or simply does not act within
  the review window), payment is released with no third party involved.
- Disputes are escalated to a **deterministically-enforced AI verdict** rather than a human
  arbiter. The AI runs off-ledger but writes its verdict on-ledger via a signed choice, and the
  contract auto-applies the consequence (revision, or investor-violation payout).

### 1.3 Target users

- **Investors / Clients** — individuals or organizations funding freelance work and wanting
  trustless escrow with governance over the engagement.
- **Multi-investor Organizations** — groups that co-fund and **govern projects by voting**
  (member selection, continue/stop after a violation, agent-fee top-up, milestone review).
- **Workers / Freelancers** — who want guaranteed escrowed payment, clear milestone terms, and
  protection from bad-faith rejection (an invalid rejection triggers an investor penalty paid to
  the worker).
- **AI Agent operators** — who run the validator that adjudicates disputes.
- **Auditors / observers** — who use the Explorer transparency layer.

### 1.4 Key differentiators

1. **AI as final arbiter, not human** — disputes resolved by an automatically-enforced AI verdict.
2. **Dispute-only AI (architecture B)** — the AI (and its fee) is consumed **only on a rejection**;
   the happy path never touches the AI, so it is cheap and fast.
3. **Canton-native privacy** — sub-transaction privacy; only the relevant parties (members,
   worker, agent) see a given project/vault/review. Applications are private per applicant.
4. **Multi-investor governance built in** — Investor Party is a multi-signatory contract; all
   investor-side actions go through a reusable voting mechanism (simple / super / weighted).
5. **Deterministic on-ledger enforcement** — escrow movement, penalties, and milestone
   transitions are contract logic, not backend code.
6. **Token-standard-ready** — funds are abstracted as `amount : Decimal` isolated inside one
   template (`AssetVault`) so a future Canton Token Standard swap touches only that template.

### 1.5 Protocol overview (one paragraph)

Investors form an **Investor Party** (a multi-signatory contract; a single investor is a party of
one), fund a **Budget Vault** and an **Agent Fee Vault**, and publish a **job posting** with
milestone specs. Workers **apply** privately. The Investor Party **selects a worker by governance
vote**, proposes the contract, and the Worker **accepts** — locking a **Commitment Vault** and
creating the master **Project** state machine. For each milestone the Worker **submits** (free, no
AI). Members **vote**; on **accept** (or inactivity/quorum-not-met **auto-accept**) the milestone
payment is **released** from the Budget Vault and the project advances. On a passing **reject**
(with quorum + recorded reasons) the project enters `RejPending` and the **AI Agent** rules: if the
rejection is **valid** the Worker revises; if **invalid** it is an **investor violation** — the
Worker receives a penalty **plus** full payment and the milestone auto-accepts. If the Worker
**misses a deadline** it is a **worker violation** — a penalty is taken from the Commitment Vault
and the Investor Party **votes** to continue or stop. On completion (or stop), all vaults are
**settled/refunded** and a `Settlement` record is written.

---

## 2. Architecture

### 2.1 High-level architecture

```
┌──────────────────────────────── Browser (Next.js / React 18) ───────────────────────────────┐
│  Marketing landing (/)            Protocol Console (/app)        Explorer (/app/explorer)     │
│        │                                  │                              │                    │
│        │                          DamlProvider (session/auth context)    │                    │
│        │                                  │                              │                    │
│                                   @daml/ledger client + @daml.js/vindex-0.1.0 (typed bindings) │
│                                     │ HTTP (create/exercise/query)   │ WebSocket (streamQueries)│
└─────────────────────────────────────┼──────────────────────────────┼──────────────────────────┘
                                       │ (same-origin via Next proxy)  │ (direct ws://)
                ┌──────────────────────▼─────────────┐                 │
                │ Next.js server                       │                │
                │  /api/daml-token  (JWT issuance)     │                │
                │  /api/daml-party  (party allocate)   │                │
                │  /ledger/* proxy  → :7575            │                │
                └──────────────────────┬───────────────┘                │
                                       ▼                                 ▼
                          ┌───────────────────── Daml JSON Ledger API (:7575) ─────────────┐
                          │ HTTP /v1/* + WebSocket /v1/stream/* ; decodes JWT → actAs party │
                          └───────────────────────────────┬────────────────────────────────┘
                                                          ▼
                                       ┌──────── Canton participant (:6865 gRPC Ledger API) ─────────┐
                                       │ executes Daml commands, holds the Active Contract Set         │
                                       │ Package: vindex-0.1.0.dar (Vindex templates)                 │
                                       └──────────────────────────────────────────────────────────────┘
```

- **Source of truth:** the Canton ledger (the Daml contracts). There is **no application
  database**. All business state lives on-ledger.
- **Frontend ↔ ledger:** the browser uses `@daml/ledger` over the JSON Ledger API. HTTP calls are
  routed through a **same-origin Next.js rewrite** (`/ledger/*` → `:7575`) to avoid CORS;
  **WebSocket streaming** connects directly (WS is not CORS-bound).
- **Auth:** the browser obtains a **JWT** from `/api/daml-token`; the JWT's `actAs` claim is the
  Canton party. Party allocation (registration) uses `/api/daml-party`.

### 2.2 Frontend architecture

- **Framework:** Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS v3.
- **Two surfaces:**
  - **Marketing landing (`/`)** — `Hero`, `Navbar`, `AnimatedBackground`, `MetricCard`,
    `ProtocolVisualization`, `WalletSupport`. Pure presentation. (NOTE: `WalletSupport.tsx` still
    shows MetaMask/WalletConnect/Coinbase + "Powered by Wagmi + RainbowKit" — **stale** relative to
    the Canton-native decision; see Technical Debt §9.)
  - **Dapp (`/app`, `/app/explorer`)** — Canton-connected. `app/app/layout.tsx` mounts
    `DamlProvider` once for both routes plus a tab nav.
- **State / data:**
  - **`DamlProvider`** holds the `Session { party, role, ledger }`, exposes `connect/disconnect`,
    persists the session in `localStorage` (auto-reconnect on reload), and polls `/ledger/readyz`
    for an online indicator.
  - **`useStreamQueries(template, queries?)`** opens a real WebSocket `streamQueries` subscription
    per template and returns the live Active Contract Set. This is the real-time engine — every
    ledger change is pushed; no manual refresh.
  - **`useCommand()`** drives a single `create`/`exercise` with explicit transaction phases
    (`idle → submitting → success | error`), bounded retry on transient (network) failures, and a
    real result reference (contract/update id).
- **Design system:** tokens in `tailwind.config.ts` + `app/globals.css` (`:root`). Inter font via
  `next/font`. Motion via Framer Motion (transform/opacity only, `prefers-reduced-motion` honored,
  `MotionConfig reducedMotion="user"`).

### 2.3 Backend architecture

- There is **no traditional backend server / database**. The "backend" is:
  1. The **Canton participant + Daml contracts** (business logic + persistence + enforcement).
  2. Two **Next.js Route Handlers** (server-side, Node runtime) that are thin and stateless:
     - `/api/daml-token` — issues a Daml Ledger-API JWT. In `dev` mode it mints an unsafe HS256
       token (for a local sandbox started with `--auth-jwt-hs256-unsafe`); in `hosted` mode it
       returns an operator-provided token or performs an **OIDC client-credentials exchange**.
     - `/api/daml-party` — allocates a real Canton party via the JSON API `/v1/parties/allocate`
       using a short-lived admin token (dev mode only).
  3. The **Next.js rewrite proxy** (`/ledger/*` → JSON API) — pure pass-through for CORS.
- **Session store:** browser `localStorage` (no Redis, no server sessions).

### 2.4 Canton architecture

- **Canton participant** exposes the gRPC Ledger API on `:6865`. It runs the Daml package and
  holds the Active Contract Set with Canton's sub-transaction privacy model.
- **Daml JSON Ledger API** (`daml json-api`, `:7575`) fronts the gRPC API with an HTTP+WebSocket
  interface that `@daml/ledger` speaks. For local dev it is started with `--allow-insecure-tokens`
  (accepts dev JWTs without verifying signatures; the sandbox itself runs with no auth).
- **Time mode:** the sandbox is run in **`--static-time`** so that `passTime`-based scenarios
  (deadlines, auto-accept) can be exercised by Daml Script. (Wall-clock mode is also valid for a
  live UI demo with short windows.)
- **Parties:** Canton party ids are namespaced fingerprints, e.g.
  `Investor::122006b6fff92355e44e8ba01c8773734f2162ee9dfe4c69e930eb473f28d6cf21b1`. They are
  allocated with `daml ledger allocate-parties` or the JSON API.
- **Hosted target:** the same frontend code points at a hosted participant by changing
  `.env.local` (`NEXT_PUBLIC_LEDGER_*`, `DAML_AUTH_MODE=hosted`, token/OIDC). No code change.

### 2.5 Daml architecture

- A single module `Vindex` (`daml/Vindex.daml`) contains **all 10 templates**, the **value
  types/enums**, and **pure helper functions** (tally, advance, settle, safe indexing).
- **Authorization model (locked decision #8):** a choice on a contract runs with the authority of
  that contract's signatories. The `Project` is signed by all Investor-Party members + the Worker,
  so any `Project` choice already carries enough authority to archive-recreate the `Project` and
  to drive the shared vaults without re-collecting signatures. Vault signatory sets are subsets of
  the `Project` signatory set, which is what makes this work.
- **State machine (locked decision #9):** transitions use **archive-recreate** — a consuming
  choice creates an updated `Project`. Submission count is reset and the worker deadline recomputed
  on each milestone advance.
- **Money isolation (locked decision #3):** all fund movement is confined to four `AssetVault`
  choices (`Release`, `Spend`, `VaultTopUp`, `Settle`). Each money point is tagged
  `MONEY MOVEMENT`. This is the Canton Token Standard swap boundary.

### 2.6 AI Agent architecture

- The AI Agent is a **Canton party** (`agent`) that is an **observer** of the `Project` and
  reviews/vaults, and the **controller** of the `AgentVerdict` choice. The model itself runs
  **off-ledger** (Daml is deterministic; AI is not); the agent operator reads the milestone
  requirements, the deliverable hash/material, and the recorded rejection reasons, decides, and
  submits the verdict as a signed `AgentVerdict` exercise.
- **Dispute-only (locked decision #6 + architecture B):** the AI is **not** invoked when a worker
  submits or when the investor accepts. The Agent fee (`agentOpCost`) is **consumed only when a
  rejection is escalated** — i.e. inside `FinalizeReview` on the REJECT→`RejPending` path. If the
  Agent Fee Vault cannot pay at that moment, the escalation reverts (the contract **freezes**);
  resuming requires a governance **top-up** vote (`TopUpAgentFee`). The AI is never auto-bypassed.
- **AI verdict is final (locked decision #11):** a vote can trigger a REJECT, but only the Agent
  decides whether the rejection complies with the contract, and the contract auto-enforces it.

### 2.7 Governance architecture

- The **Investor Party** is a multi-signatory contract holding `members`, `contributions`, and a
  `GovernanceConfig`. A single investor is simply a party of one — there is no separate
  single-investor code path (locked decision #1).
- **All investor-side actions go through governance voting** (locked decision #2): worker
  selection, continue/stop after a worker violation, and agent-fee top-up are each a
  `GovernanceProposal`; milestone reviews use the same tally mechanism (`MilestoneReview`).
- **Voting models:** `SimpleMajority`, `SuperMajority`, `Weighted`. A side passes when its voting
  power `>= thresholdFraction * totalPower`; a `quorumFraction` gates whether a REJECT is
  actionable; abstentions are neutral; each member casts one vote per cycle; weighted power is the
  member's contribution weight, else 1 per member.

---

## 3. Technologies (each: why, where, status)

> Status legend: **In use** (present and exercised) · **Configured** (wired but not fully
> exercised end-to-end) · **Not used** (explicitly absent — documented to prevent false
> assumptions).

| Technology | Why | Where | Status |
|---|---|---|---|
| **Daml 2.9.4** | Smart-contract language; deterministic on-ledger enforcement; the protocol's source of truth | `Vindex/daml/Vindex.daml`, `Test.daml`; DAR `vindex-0.1.0.dar` | **In use** — builds, 8 Script tests pass, 7 scenarios pass on the live ledger |
| **Canton Network (sandbox)** | The ledger/participant that runs Daml with sub-transaction privacy | local `daml sandbox --static-time --port 6865` | **In use** — live, DAR uploaded, parties allocated |
| **Daml JSON Ledger API** | HTTP+WebSocket bridge that `@daml/ledger` speaks | `daml json-api --http-port 7575 --allow-insecure-tokens` | **In use** — HTTP 200 verified, live streaming verified |
| **@daml/ledger 2.9.4** | Real ledger client (create/exercise/query/stream) | `lib/daml/ledger.ts`, hooks, panels, scripts | **In use** — create+query+stream verified |
| **@daml/types 2.9.4** | Daml value type encodings (Numeric/Int/Party = string, RelTime, etc.) | transitive + typing | **In use** |
| **@daml.js/vindex-0.1.0** | Generated TypeScript bindings from the DAR (real templates/choices) | `verdix-web/daml.js/`, imported via `lib/daml/vindex.ts` | **In use** — regenerate with `daml codegen js` |
| **Next.js 14.2.35 (App Router)** | React framework, routing, API route handlers, rewrite proxy | entire `verdix-web/app` | **In use** — `next build` passes |
| **React 18.3.1** | UI runtime | all components | **In use** |
| **TypeScript 5.5 (strict)** | Type safety; compiler validates every ledger payload against real bindings | whole frontend | **In use** — `tsc`/build clean |
| **Tailwind CSS 3.4** | Styling/design tokens | `tailwind.config.ts`, `globals.css` | **In use** |
| **shadcn/ui (pattern)** | Button primitive + `cva` variants (not the CLI; hand-written in the shadcn style, no Radix) | `components/ui/button.tsx` | **In use** |
| **Framer Motion 11** | Animation (landing + protocol viz + tx/UX motion) | landing components, `MotionConfig` | **In use** |
| **lucide-react 0.428** | Icon set | throughout | **In use** |
| **class-variance-authority / clsx / tailwind-merge** | Variant + class merge utilities | `button.tsx`, `lib/utils.ts` | **In use** |
| **lodash 4.17** | Required transitively by `@daml/ledger`/`@daml/types` (they `require('lodash')` but mis-declare it) | declared in `package.json` to fix a Module-not-found | **In use** (workaround dependency) |
| **OIDC** | Production party-token issuance via client-credentials exchange | `/api/daml-token` (hosted mode) | **Configured** — code path exists; no external IdP wired; local demo uses dev HS256 JWT |
| **JWT (HS256, dev)** | Local party authentication tokens | `/api/daml-token`, `scripts/*` | **In use** (dev only; unsafe by design for local sandbox) |
| **Inter (next/font)** | Body/display typeface (Helvetica Now Display is licensed and only referenced as a fallback var) | `app/layout.tsx`, `globals.css` | **In use** |
| **Playwright (MCP)** | Live browser verification (connect, stream, write, hydration/CORS checks) | used during verification (not a repo dependency) | **In use** (verification tool, not shipped) |
| **PostgreSQL** | — | — | **Not used** — Canton ledger is the source of truth; there is no application database |
| **Redis** | — | — | **Not used** — session is `localStorage`; no server-side cache/session store |
| **Docker / docker-compose** | — | — | **Not used** — no containerization files exist; services run as local processes |
| **Wagmi / Viem / RainbowKit / MetaMask / WalletConnect** | — | (only referenced as stale marketing copy in `WalletSupport.tsx`) | **Not used / explicitly rejected** — these are EVM-only and cannot reach Canton; see Decisions Log |

---

## 4. Domain Model (entities + relationships)

### 4.1 Entities

- **Investor** — an individual investor party. Records a `Contribution` (projectFunding,
  agentFeeFunding, governance weight). Member of exactly one Investor Party in a given engagement.
- **Investor Party** (`InvestorParty` template) — the **client entity**; a multi-signatory
  contract whose signatories are all member investor parties. Holds `members`, `pending` (invited
  but not yet accepted; observers), `contributions`, `GovernanceConfig`, `admin` (founder), and
  the `agent`. A single investor is a party of one.
- **Worker** — the freelancer party. Applies to postings, accepts a proposal (locking a Commitment
  Vault), submits milestone deliverables, responds to revisions.
- **AI Agent** — the validator party; observer of projects/reviews/vaults; controller of
  `AgentVerdict`. Final authority on disputes.
- **Project** (`Project` template) — the **master state machine**. Signatories: all members +
  Worker; observer: Agent. Holds the milestone list, current index, status, submission count,
  deadlines, max submissions, agent op cost, the three vault contract ids, `paidOut`, the current
  submission hash, and rejection reasons.
- **Milestone** (`MilestoneSpec` value, not a template) — deliverables hash, payment (Decimal),
  worker window (RelTime), review window (RelTime), violation percentage `p%` (0.0–1.0), `isFinal`
  flag. The `Project` carries a `[MilestoneSpec]` and a `currentIndex`.
- **Escrow / Budget Vault** (`AssetVault` with `vaultType = BudgetV`) — funded by the Investor
  Party; pays milestone payments (and investor-violation bonus) to the Worker.
- **Commitment Vault** (`AssetVault` with `vaultType = CommitmentV`) — funded by the Worker on
  accept; source of worker-violation penalties to the Investor Party.
- **Agent Fee Vault** (`AssetVault` with `vaultType = AgentFeeV`) — funded by the Investor Party;
  pays the Agent op cost when a dispute is escalated.
- **Voting** — `MilestoneReview` (per-submission cycle: votes, deadline, structured rejection
  reasons) and `GovernanceProposal` (reusable action proposals: SelectWinner / ResolveContinue /
  ResolveStop / TopUp).
- **Violations** — Worker violation (missed deadline → commitment penalty) and Investor violation
  (invalid rejection → penalty + full payment to worker).
- **Disputes** — a passing REJECT with quorum + recorded reasons puts the `Project` in
  `RejPending`, awaiting the Agent's `AgentVerdict`.
- **Settlement** (`Settlement` template) — immutable record written on completion/stop with the
  refunded amounts per vault and total paid out (used to verify the money invariant).
- **Application** (`Application` template) — a private jobseeker application (presentation hash +
  contact link); visible only to the applicant and the Investor Party.
- **Posting** (`ProjectPosting`) and **Proposal** (`ProjectProposal`) — hiring artifacts.
- **InvestorInvite** (`InvestorInvite`) — propose-accept join for adding members.

### 4.2 Relationships

```
Investor (party) ─┐
                  ├─< members >── InvestorParty ──holds── GovernanceConfig, [Contribution]
Investor (party) ─┘                   │
                                      ├── InviteInvestor ──> InvestorInvite ──AcceptInvite──> (recreated) InvestorParty (+member)
                                      ├── SetupAndPost ──> Budget Vault (AssetVault), Agent Fee Vault (AssetVault), ProjectPosting
                                      └── OpenProposal ──> GovernanceProposal ──CastProposalVote──(threshold)
Worker (party) ──Apply──> Application (private)            │
ProjectPosting ──SelectWorker(passed proposal)──> ProjectProposal ──AcceptProposal(Worker)──> Project (+ Commitment Vault)
Project (members + Worker; obs Agent)
   ├── SubmitMilestone(Worker) ──> MilestoneReview (per cycle)
   ├── CastVote(member) on MilestoneReview ; SetRejectionReasons(member)
   ├── FinalizeReview(member) ── accept/auto-accept ──> Release (Budget→Worker), advance/settle
   │                          └─ reject(+quorum) ── Spend (Agent Fee) ──> Project status RejPending
   ├── AgentVerdict(Agent) ── valid ──> Revision ; invalid ──> Release (Budget→Worker, +penalty), advance
   ├── WorkerViolation(member|Agent) ── Spend (Commitment→Investor penalty), status Failed
   ├── ResolveAfterViolation(member, passed proposal) ── continue/advance OR stop+settle
   └── TopUpAgentFee(member, passed proposal) ── VaultTopUp (Agent Fee)
Project (final accept / stop) ──> finalSettle ──> Settle (all vaults) + Settlement record
```

---

## 5. Business Rules (every protocol rule)

These are enforced by the Daml contracts (`daml/Vindex.daml`) and validated by tests.

1. **Funding / overfund check (locked decision #7):** at `SetupAndPost`, the Budget Vault must be
   funded with `budgetAmount >= Σ over milestones (payment × (1 + violationPct))`. Otherwise the
   exercise aborts ("Budget Vault underfunded"). Unused reserve is refunded on completion.
2. **Milestone submission is FREE (architecture B):** `SubmitMilestone` consumes **no** Agent fee
   and never touches the Agent. It requires status `Active` or `Revision`, `submissionCount <
   maxSubmissions`, and `now <= workerDeadline`. It creates a fresh `MilestoneReview` and sets
   status `Submitted`.
3. **Milestone acceptance (normal):** in `FinalizeReview`, if `acceptPower >= thresholdFraction *
   totalPower`, the milestone is accepted → `Release` milestone payment from Budget Vault to Worker
   → advance (or settle + complete if `isFinal`).
4. **Auto-acceptance (inactivity / quorum not met):** in `FinalizeReview`, if neither side reaches
   threshold (or a REJECT lacks quorum) **and** `now >= review deadline`, the milestone
   **auto-accepts** (same release + advance path). Never auto-accept on Agent-fee depletion.
5. **Reject → dispute escalation:** in `FinalizeReview`, if `rejectPower >= thresholdFraction *
   totalPower` **and** `castPower >= quorumFraction * totalPower`, the party must have recorded
   structured rejection reasons (`SetRejectionReasons`); then the Agent fee is **Spent** from the
   Agent Fee Vault (architecture B charge point) and the `Project` moves to `RejPending`. If the
   vault cannot pay, the whole exercise reverts (FREEZE).
6. **AI arbitration (final authority, locked decision #11):** `AgentVerdict` (controller = Agent),
   only valid in `RejPending`:
   - **rejectionValid = True** → status `Revision`; the Worker may resubmit (a new review cycle);
     unlimited revisions while the worker deadline holds.
   - **rejectionValid = False** → **Investor violation**: the Worker receives a `p%` penalty
     **plus** full milestone payment (both released from Budget Vault); the milestone auto-accepts;
     advance.
7. **Worker violation (missed deadline):** `WorkerViolation` (controller = a member or the Agent),
   valid when `now > workerDeadline` and status ∈ {Active, Submitted, Revision}. A penalty
   `min(payment × violationPct, commitmentBalance)` (capped at available commitment) is `Spent`
   from the Commitment Vault to the Investor Party; status becomes `Failed`.
8. **Failure policy is a governance vote (locked decision #5):** after a worker violation,
   `ResolveAfterViolation` requires a passed `GovernanceProposal` (`ResolveContinue` → advance to
   next milestone; `ResolveStop` → settle + refund all vaults and complete with a `Settlement`).
9. **Agent Fee freeze + top-up (locked decision #6):** when the Agent Fee Vault cannot pay an
   escalation, the action reverts (contract pauses). Resuming requires `TopUpAgentFee` backed by a
   passed `TopUp` `GovernanceProposal`. There is a documented open risk that top-up-during-freeze
   can be slow because it itself requires reaching threshold.
10. **Voting tally semantics (locked decision #10):** member power = weight (if weighted) else 1;
    `totalPower` = Σ power; a side passes when its power `>= thresholdFraction * totalPower`;
    `quorum` gates whether a REJECT is actionable (cast power must reach `quorumFraction *
    totalPower`); abstentions are neutral; each member casts at most one vote per cycle; a revision
    starts a new cycle.
11. **Worker selection is a discretionary governance vote (locked decision #4):** no bidding, no
    price auction, no tie-break logic. `SelectWorker` requires a passed `SelectWinner` proposal and
    that the chosen party matches the application's applicant.
12. **Money invariant:** for every path, `refundedBudget + refundedCommitment + refundedAgentFee +
    totalPaidOut == total initially funded`. Every vault outflow increments `Project.paidOut` by
    the same amount (releases, penalties, AND agent-op spends). Asserted via `Settlement` in tests.
13. **Completion:** when the final milestone is accepted (by any accept path), all vaults are
    settled/refunded and a `Settlement` record is written. Milestone-ending choices return
    `Optional (ContractId Project)` where `None` signals completion.
14. **No partial-function crashes:** non-empty milestone list and membership are enforced by
    `ensure`; list indexing uses the total `getAt` helper; penalty transfers are capped.

### 5.1 Open risks (documented, not silently fixed)

- **No `agentVerdictDeadline`:** while in `RejPending`, if the Agent never rules, the project
  stalls permanently.
- **Top-up during a freeze** requires reaching the governance threshold while the contract is
  frozen — potentially slow. The tension is intentional (governance gating wins over convenience).

---

## 6. Smart Contract / Daml Model

Source: `Vindex/daml/Vindex.daml`. Tests: `Vindex/daml/Vindex/Test.daml`. Diagrams + transition
table: `Vindex/docs/STATE_MACHINE.md`.

### 6.1 Value types & enums

- `VotingModel = SimpleMajority | SuperMajority | Weighted`
- `Vote = ACCEPT | REJECT`
- `MStatus = Inactive | Active | Submitted | RejPending | Revision | Accepted | Completed | Failed`
- `VaultType = BudgetV | CommitmentV | AgentFeeV`
- `ProposalAction = SelectWinner Party | ResolveContinue | ResolveStop | TopUp Decimal`
- `MilestoneSpec { deliverablesHash, payment, workerWindow, reviewWindow, violationPct, isFinal }`
- `GovernanceConfig { maxInvestors, votingModel, thresholdFraction, weighted, quorumFraction,
  defaultReviewWindow }`
- `Contribution { investor, projectFunding, agentFeeFunding, weight }`
- `Tally { acceptPower, rejectPower, castPower, total }`

### 6.2 Pure helpers

`getAt` (total, safe list index), `memberPower`, `totalPower`, `powerOf`, `tally`,
`proposalPassed` (threshold AND quorum), `requiredBudget` (overfund check), `getMilestoneU` /
`getMilestoneAtU` (controlled abort), `acceptAndAdvance` (release + advance or settle),
`finalSettle` (refund all vaults + write `Settlement`).

### 6.3 Templates, choices, signatories, observers

| Template | Signatory | Observer | Choices (controller) |
|---|---|---|---|
| `InvestorParty` | `members` | `agent`, `pending` | `InviteInvestor`(admin, consuming), `OpenProposal`(admin, nonconsuming), `SetupAndPost`(admin, nonconsuming) |
| `InvestorInvite` | `members` | `invitee` | `AcceptInvite`(invitee), `DeclineInvite`(invitee) |
| `Application` | `applicant` | `members` | (none beyond Archive) |
| `ProjectPosting` | `members` | `agent`, `candidates` | `Apply`(applicant, nonconsuming), `SelectWorker`(actor∈members, consuming) |
| `ProjectProposal` | `members` | `worker`, `agent` | `AcceptProposal`(worker), `RejectProposal`(worker) |
| `GovernanceProposal` | `members` | `agent` | `CastProposalVote`(voter) |
| `MilestoneReview` | `members`, `worker` | `agent` | `CastVote`(voter), `SetRejectionReasons`(actor∈members) |
| `AssetVault` | `funders` | `stakeholders` | `Release`/`Spend`/`VaultTopUp`/`Settle` (all `funders`) — the ONLY money movement |
| `Project` | `members`, `worker` | `agent` | `SubmitMilestone`(worker), `FinalizeReview`(actor∈members), `AgentVerdict`(agent), `WorkerViolation`(actor∈members∪{agent}), `ResolveAfterViolation`(actor∈members), `TopUpAgentFee`(actor∈members) |
| `Settlement` | `members` | `worker`, `agent` | (immutable record) |

### 6.4 Workflows / state transitions

See §4.2 (relationship graph) and `docs/STATE_MACHINE.md`. Milestone state machine:

```
[*] → Active (AcceptProposal locks Commitment Vault)
Active/Revision → Submitted (SubmitMilestone, FREE)
Submitted → Accepted (FinalizeReview ACCEPT or AUTO-ACCEPT)
Submitted → RejPending (FinalizeReview REJECT+quorum; spends Agent fee)
RejPending → Revision (AgentVerdict valid)
RejPending → Accepted (AgentVerdict invalid: investor violation, penalty+full pay)
Active/Submitted/Revision → Failed (WorkerViolation; commitment penalty)
Accepted → Active (advance) | Completed (final → settle + refund)
Failed → Active (ResolveContinue) | Completed (ResolveStop → settle + refund)
Completed → [*]
```

### 6.5 Ledger visibility (privacy)

- Applications: visible only to the applying jobseeker (signatory) and the Investor Party
  (observer). Applicants cannot see each other's applications.
- `Project`, `MilestoneReview`, `GovernanceProposal`, vaults, `Settlement`: visible only to
  Investor-Party members, the Worker, and the Agent (via signatory/observer/stakeholder lists).
- Only **hashes** of presentations and deliverables are stored on-ledger; raw artifacts stay
  off-ledger. The contact link is visible to its contract's observers only.
- Note: vault `stakeholders` currently include all `candidates` of a posting (so losing candidates
  remain vault observers) — a minor privacy over-share flagged in Technical Debt.

### 6.6 Contract lifecycle

- Most state transitions **archive and recreate** the contract (consuming choices). `Project` is
  recreated on submit, finalize, verdict, violation, resolve, and top-up. `InvestorParty` is
  recreated on invite (adds to `pending`) and accept (adds member). Vaults are recreated on every
  `Release`/`Spend`/`VaultTopUp` and consumed by `Settle`.

---

## 7. User Flows

### 7.1 Investor flow

1. Connect as the Investor party (`PartyConnect`) → JWT minted → `@daml/ledger` client.
2. **Create Investor Party** (`InvestorPanel` → `ledger.create(InvestorParty, …)`).
3. **Fund vaults + post job** (`SetupAndPost` exercise → Budget + Agent Fee vaults + posting).
4. (Governance) **Select worker** by vote, propose the contract.
5. **Review submissions + vote** Accept/Reject (`CastVote`), **Finalize** (`FinalizeReview`).
6. Observe live vault balances, projects, settlements (streamed).

### 7.2 Worker flow

1. Connect as the Worker party.
2. **Apply** to a posting (`Apply`).
3. **Accept proposal** (`AcceptProposal`) — locks the Commitment Vault (commitment fee).
4. **Submit milestone** deliverable hash (`SubmitMilestone`).
5. **Respond to revision** (resubmit) if the AI validated a rejection.
6. Track escrow/payments/settlements (streamed).

### 7.3 AI Agent flow

1. Connect as the Agent party.
2. View **disputes** (projects in `RejPending`) with milestone + rejection reasons.
3. Submit verdict (`AgentVerdict`): **invalid → enforce payout** (investor violation) or
   **valid → revision**.
4. (Enforcement) Trigger `WorkerViolation` on overdue open milestones.

### 7.4 Multi-investor flow

- Founder creates the Investor Party (party of one), `InviteInvestor` (adds invitee to `pending`),
  invitee `AcceptInvite` (becomes a signatory). Repeat sequentially for N members. (Contracts are
  complete and pass on the live ledger via `testHappyPathMulti`; the **UI does not yet surface the
  invite form** — see Technical Debt / TODO.)

### 7.5 Governance flow

- `OpenProposal` (admin) → members `CastProposalVote` → when `proposalPassed` (threshold + quorum),
  the action is executed by the relevant choice (`SelectWorker`, `ResolveAfterViolation`,
  `TopUpAgentFee`). Milestone review voting uses the same tally on `MilestoneReview`.

### 7.6 Escrow flow

- Budget Vault funded at posting; Commitment Vault locked at accept; Agent Fee Vault funded at
  posting and spent only on disputes. `Release` pays the worker; `Spend` takes penalties/agent
  fees; `Settle` refunds remaining balances on completion/stop. Money invariant holds across all
  paths.

### 7.7 Dispute flow

- Reject (with quorum + reasons) → `RejPending` (agent fee spent) → `AgentVerdict` → revision or
  investor-violation payout. The AI is the only escalation path; voting cannot override it.

---

## 8. Current Status

### 8.1 Completed features (verified)

- Daml protocol: all 10 templates + helpers; `daml build` passes; `daml test` 8/8; **7/7 scenario
  scripts pass on the LIVE Canton ledger**.
- Local Canton stack operational: sandbox (`:6865`), JSON API (`:7575`), DAR uploaded, parties
  allocated.
- Frontend builds (`next build`) with `/`, `/app`, `/app/explorer`, `/api/daml-token`,
  `/api/daml-party`.
- Real Canton integration: `@daml/ledger` create+query round-trip (Node), HTTP query 200, **live
  browser connect + WebSocket streaming + real `SetupAndPost` write committed and streamed back**
  (BudgetV 4000.0 / AgentFeeV 300.0). 0 hydration / hooks / CORS errors.
- Party authentication + session + auto-reconnect; dev JWT issuance; real party allocation.
- Investor / Worker / Agent panels wired to real choices. Explorer transparency dashboard.
- Same-origin ledger proxy (CORS fix); transaction status UI; error boundary; retry logic.
- Marketing landing page (Hero + animated background + protocol visualization).

### 8.2 Partially implemented features

- **Multi-investor governance UI:** contracts complete + live-proven; the UI exposes party-of-one
  creation + milestone voting, but **invite-members** and the **governance-proposal forms**
  (SelectWinner / ResolveContinue / ResolveStop / TopUp) are not yet surfaced.
- **Authentication:** party JWT + session + role + party-mapping done; **OIDC** is a configured
  code path (hosted mode) without an external IdP; **user registration** = party allocation only
  (no username/password user store).
- **Worker selection / proposal UI:** `OpenProposal`/`CastProposalVote`/`SelectWorker` are real
  choices but the Investor panel does not yet present the full proposal lifecycle as forms.
- **Scenario 3 (deadline) in-browser:** proven via `daml script` (static time); not click-through
  in the UI without a time-advance mechanism.

### 8.3 Broken features

- None known to be broken at the time of audit. The two bugs found during live verification
  (PartyConnect hooks-order; browser↔JSON-API CORS) were fixed and re-verified.

### 8.4 Missing features

- Invite-members UI form; full governance-proposal UI forms.
- External OIDC IdP integration + a proper user/identity store and login/registration screens.
- `agentVerdictDeadline` (open risk: `RejPending` can stall).
- Frontend component/unit tests (jest/vitest) and automated CI.
- Containerization / deployment configs (Docker, compose) and a one-command bring-up.
- Block-explorer-equivalent deep links (Canton has no public explorer; ids are shown instead).
- Transaction history retrieval view (the JSON API exposes ACS via stream; a dedicated historical
  transaction tree view is not built).

---

## 9. Technical Debt

### 9.1 Known issues

- **Stale marketing UI:** `components/WalletSupport.tsx` still renders MetaMask / WalletConnect /
  Coinbase cards and "Powered by Wagmi + RainbowKit". This contradicts the Canton-native decision
  and should be replaced with Canton/party-connect messaging (or removed from the landing page).
- **Branding split:** product "Verdix" vs Daml package "Vindex" (module/templates). Cosmetic but
  confusing; a future rename of the Daml package would change the generated package id and require
  re-codegen + frontend template-id updates.
- **Vault observer over-share:** `AssetVault.stakeholders` include all posting `candidates`, so
  losing candidates remain observers of the vaults. Minor privacy leak; tighten by recreating
  vaults with worker-only observers on accept.
- **`frontend README.md` partly outdated:** still describes the landing page / Wagmi-as-future;
  superseded by `COMPLETION_REPORT.md` + `DEMO.md`.
- **Sandbox log artifacts** (`Vindex/log/*.log`) are committed-adjacent build noise; add to
  ignore / delete.
- **Dev JWT is unsafe by design** (HS256 with a shared "secret", signature unverified by the
  sandbox). Fine for local; MUST switch to OIDC/verified tokens for any shared/hosted deployment.

### 9.2 Missing tests

- No frontend unit/integration tests (the verification is live: `scripts/*` + Playwright runs).
- No automated regression harness for the live ledger (the scenario run is a manual loop).
- No CI pipeline.

### 9.3 Missing integrations

- External OIDC identity provider (Auth0/Keycloak/etc.).
- Hosted Canton participant wiring (env-ready, but not connected — needs operator credentials).
- Off-ledger storage for raw deliverables/presentations (only hashes are on-ledger; the actual
  artifact store is not implemented).
- A real AI model/service behind the Agent party (currently the Agent's verdict is submitted by a
  human/operator action; the off-ledger model integration is a design slot, not implemented).

### 9.4 Architecture risks

- **`RejPending` stall** (no `agentVerdictDeadline`).
- **Freeze recovery latency** (top-up requires governance threshold while frozen).
- **Static-time vs wall-clock**: deadline UX differs between demo (static) and production
  (wall-clock); needs a deliberate choice + UX for production.
- **Token/ledgerId coupling**: the dev token uses `ledgerId: "sandbox"`; a different participant
  may require a different ledger id or audience-based tokens.
- **Single module Daml**: all templates in one module — fine now, but large; consider splitting if
  it grows.

---

## 10. Decisions Log

> All decisions below were made on **2026-06-20** during the initial build session unless noted.

| Date | Decision | Reasoning | Alternatives considered |
|---|---|---|---|
| 2026-06-20 | **Canton/Daml, not EVM.** Do not use Wagmi/Viem/RainbowKit/MetaMask/WalletConnect. | The protocol is implemented in Daml on Canton; EVM wallet tooling physically cannot reach a Canton participant (different auth: parties+JWT vs ECDSA addresses; no Solidity ABI). | (A) Port the whole protocol to Solidity + deploy to an EVM testnet; (C) Hybrid Daml core + EVM mirror. User explicitly chose Canton-native. |
| 2026-06-20 | **Investor Party = multi-signatory contract**; a single investor is a party of one (no separate code path). | Uniform governance model; matches the spec; avoids branching. | A separate single-investor template/path. |
| 2026-06-20 | **All investor-side actions go through governance voting** via one reusable `GovernanceProposal` + the same tally as reviews. | Consistency, auditability, multi-investor correctness. | Ad-hoc per-action authorization. |
| 2026-06-20 | **Dispute-only AI (architecture B).** Submission is free; the Agent fee is consumed only when a rejection escalates (in `FinalizeReview`), not on every submit. | Cheaper, faster happy path; minimizes the AI attack surface and Agent-fee drain; matches the "AI only on dispute" requirement. | Architecture A (AI validates every submission) — rejected as costly, slower, larger trust/attack surface. |
| 2026-06-20 | **Money isolated in `AssetVault`** (`amount : Decimal`, four choices). | Token Standard swap boundary; business logic stays clean. | Spread money logic across `Project`. |
| 2026-06-20 | **Authorization via `Project` signatories** (a choice runs with the contract signatories' authority). | Lets a single member trigger choices that recreate the multi-sig `Project` and drive shared vaults without re-signing. | Re-collecting multi-party authority per action (deadlock-prone). |
| 2026-06-20 | **State transitions use archive-recreate.** | Standard Daml state-machine pattern; clean lifecycle. | Mutable in-place updates (not possible in Daml). |
| 2026-06-20 | **Overfund the Budget Vault** (`budget >= Σ payment·(1+p)`); refund unused on completion. | Guarantees funds for the worst case (investor-violation bonus). | Fund exactly Σ payment (risks shortfall on penalties). |
| 2026-06-20 | **Naming:** Daml choice renamed `TopUp` → `VaultTopUp`. | Choice names share the data-constructor namespace; `TopUp` collided with the `ProposalAction` constructor. | Rename the `ProposalAction` constructor instead. |
| 2026-06-20 | **Invite visibility via `pending` observers; `InviteInvestor` is consuming.** | A propose-accept invitee must be an observer to `fetch`/`archive` the party it accepts into (visibility ≠ authority). | Keep `InviteInvestor` nonconsuming (caused "contract not visible" at accept). |
| 2026-06-20 | **Frontend uses `@daml/ledger` directly, NOT `@daml/react`.** | `@daml/react@2.9.4` peers React 16/17 and conflicts with React 18; `@daml/ledger` has no React peer and gives full control over hooks. | Pin React to 17 (worse); `--force` install (broken). |
| 2026-06-20 | **Same-origin Next proxy `/ledger/*` → `:7575` for HTTP; WebSocket direct.** | Browser→JSON-API HTTP is blocked by CORS (no CORS headers on the JSON API); WS is not CORS-bound. | Run app + JSON API on one origin via external reverse proxy; CORS middleware (JSON API has no flag). |
| 2026-06-20 | **Auth: dev HS256 JWT for local; hosted OIDC client-credentials path.** | Local sandbox accepts insecure tokens; production should use a verified IdP. | Browser-side token signing (insecure, secret exposure). |
| 2026-06-20 | **Verify on a local Canton sandbox; hosted is an env swap.** | Lets us prove "operational, no mocks" without operator credentials; identical app code for hosted. | Wait for hosted creds (blocks all verification). |
| 2026-06-20 | **Static-time sandbox for scenario verification.** | Daml Script `passTime` (deadlines/auto-accept) requires static time. | Wall-clock (cannot run passTime scenarios). |
| 2026-06-20 | **SSR-safe animations:** structure invariant; gate motion via CSS + `MotionConfig`, never via `useReducedMotion` in render. | A `useReducedMotion`-gated SVG node caused a hydration mismatch. | Conditionally render nodes (the original bug); client-only mount gate (loses SSR). |

---

## 11. Build / Run / Verify (quick reference)

```bash
# Daml
cd Vindex
"<daml.exe>" build                 # → .daml/dist/vindex-0.1.0.dar
"<daml.exe>" test                  # 8/8 scripts (in-memory)

# Live ledger
"<daml.exe>" sandbox --static-time --port 6865
"<daml.exe>" ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
"<daml.exe>" ledger allocate-parties Investor Worker Agent --host localhost --port 6865
"<daml.exe>" json-api --ledger-host localhost --ledger-port 6865 --http-port 7575 --allow-insecure-tokens
# run scenarios on live ledger (check $LASTEXITCODE, not $?):
"<daml.exe>" script --dar .daml/dist/vindex-0.1.0.dar --script-name Vindex.Test:testHappyPathMulti --ledger-host localhost --ledger-port 6865 --static-time

# Frontend
cd verdix-web
npm install
npm run build
npm run dev                        # http://localhost:3939/app  (uses .env.local)
node scripts/seed-and-verify.cjs "<InvestorParty::id>" "<AgentParty::id>" sandbox
```

`<daml.exe>` = `C:\Users\Asus\AppData\Roaming\daml\sdk\2.9.4\daml\daml.exe`.

Regenerate TS bindings after any Daml change:
`"<daml.exe>" codegen js .daml/dist/vindex-0.1.0.dar -o ../verdix-web/daml.js`.

---

## 12. Live State at Audit Time (2026-06-20)

- Canton sandbox **running** on `:6865` (static time).
- JSON Ledger API **running** on `:7575`.
- Next dev server **running** on `:3939`.
- Allocated parties (this session; ids reset if the sandbox restarts):
  - `Investor::122006b6fff92355e44e8ba01c8773734f2162ee9dfe4c69e930eb473f28d6cf21b1`
  - `Worker::122006b6fff92355e44e8ba01c8773734f2162ee9dfe4c69e930eb473f28d6cf21b1`
  - `Agent::122006b6fff92355e44e8ba01c8773734f2162ee9dfe4c69e930eb473f28d6cf21b1`
- One `InvestorParty` + Budget/Agent-Fee vaults seeded under the Investor party (visible in the UI).
- **Note:** the sandbox is in-memory — restarting it resets all contracts and party ids; update
  `.env.local` `NEXT_PUBLIC_PARTY_*` with freshly allocated ids after a restart.

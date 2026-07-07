# Vindex

Vindex is a Canton-native freelance escrow protocol implemented with Daml smart contracts and a
Next.js frontend branded as Vindex. The ledger is the source of truth: escrow vaults, project
state, milestone reviews, governance votes, disputes, penalties, and settlements are all modeled as
on-ledger Daml contracts.

The current workspace has two main parts:

- `SmartContract/` contains the Daml package (`vindex`) and Daml Script tests.
- `FrontEnd/` contains the Next.js app, generated Daml TypeScript bindings, Canton party
  authentication routes, and a live ledger console.

This project is not an EVM app. The real application connects to a Canton participant through the
Daml JSON Ledger API using Canton party IDs and ledger API JWTs. EVM wallet tooling such as Wagmi,
Viem, RainbowKit, MetaMask, and WalletConnect is not used by the dapp flow.

## Current Status

- Daml SDK target: `2.9.4` (`SmartContract/daml.yaml`).
- Daml package name/version: `vindex` / `0.1.0`.
- Main contract module: `SmartContract/daml/Vindex.daml`.
- Test module: `SmartContract/daml/Vindex/Test.daml`.
- Built DAR artifact: `SmartContract/.daml/dist/vindex-0.1.0.dar`.
- Frontend stack: Next.js 14, React 18, TypeScript, Tailwind CSS, `@daml/ledger` 2.9.4,
  `@daml/types` 2.9.4, and generated `@daml.js/vindex-0.1.0` bindings.
- Local default ledger target: Canton sandbox + JSON Ledger API on `localhost:6865` and
  `localhost:7575`.
- Hosted participant support exists through environment variables and server-side token issuance,
  but operator credentials must be supplied.

## Project Layout

```text
.
|-- README.md
|-- SmartContract/
|   |-- daml.yaml
|   |-- daml/
|   |   |-- Vindex.daml
|   |   `-- Vindex/Test.daml
|   |-- docs/STATE_MACHINE.md
|   `-- .daml/dist/vindex-0.1.0.dar
`-- FrontEnd/
    |-- app/
    |   |-- page.tsx
    |   |-- app/page.tsx
    |   |-- app/explorer/page.tsx
    |   |-- api/daml-token/route.ts
    |   `-- api/daml-party/route.ts
    |-- components/daml/
    |   |-- DamlProvider.tsx
    |   |-- PartyConnect.tsx
    |   `-- flows/
    |       |-- InvestorPanel.tsx
    |       |-- WorkerPanel.tsx
    |       `-- AgentPanel.tsx
    |-- daml.js/
    |-- lib/daml/
    |   |-- config.ts
    |   |-- ledger.ts
    |   |-- useCommand.ts
    |   |-- useStreamQueries.ts
    |   `-- vindex.ts
    |-- scripts/
    |   |-- ledger-check.mjs
    |   `-- seed-and-verify.cjs
    |-- .env.local.example
    |-- next.config.mjs
    `-- package.json
```

## Architecture Overview

```text
Browser
  -> Next.js app routes and UI
  -> /api/daml-token for ledger API JWTs
  -> /ledger/* rewrite for HTTP JSON API calls
  -> JSON Ledger API websocket for live streams
  -> Canton participant
  -> Vindex Daml contracts
```

- The browser uses `@daml/ledger` and generated bindings from `FrontEnd/daml.js/`.
- HTTP ledger calls can be routed through the Next.js rewrite `/ledger/* -> LEDGER_PROXY_TARGET` to
  avoid browser CORS issues.
- WebSocket streams connect directly to `NEXT_PUBLIC_LEDGER_WS_URL`.
- `DamlProvider` stores the current `{ party, role }` in `localStorage`, requests a token from
  `/api/daml-token`, creates the ledger client, and polls `/readyz`.
- `useStreamQueries` streams active contracts visible to the connected party.
- `useCommand` wraps create/exercise calls with transaction state and bounded retry for transient
  network failures.

## Smart Contract Model

All contract logic lives in `SmartContract/daml/Vindex.daml`.

| Template | Purpose |
|---|---|
| `InvestorParty` | Multi-signatory investor organization. A single investor is represented as a party of one. |
| `InvestorInvite` | Propose/accept flow for adding investor members. |
| `Contribution` | Data record for member funding and voting weight. |
| `GovernanceProposal` | Reusable vote object for worker selection, continue/stop decisions, and agent-fee top-ups. |
| `MilestoneReview` | Per-submission voting cycle with accept/reject ballots and rejection reasons. |
| `AssetVault` | Budget, commitment, and agent-fee vault abstraction. All money movement is isolated here. |
| `Application` | Private worker application with presentation hash and contact link. |
| `ProjectPosting` | Published project posting and candidate application surface. |
| `ProjectProposal` | Worker offer; accepting it locks the commitment vault and creates the project. |
| `Project` | Master milestone state machine. |
| `Settlement` | Immutable record created when a project completes or stops. |

Core protocol rules:

- Investor-side actions are governance-gated through `GovernanceProposal`.
- Voting supports simple majority, supermajority, and weighted power.
- Worker selection is discretionary governance, not bidding.
- Budget funding must cover `sum(payment * (1 + violationPct))` before posting.
- Funds are represented as `Decimal` amounts. `AssetVault` is the intended swap point for a future
  Canton Token Standard integration.
- Only hashes and private contact links are stored on-ledger; raw artifacts are off-ledger.
- Canton privacy is modeled with signatories and observers so parties only see contracts relevant to
  them.

## Dispute Model

Vindex uses a dispute-only AI model:

- A worker submission is free and does not call the Agent.
- If investors accept, or if the review deadline passes without an actionable reject, the milestone
  is accepted and payment is released without AI involvement.
- If a reject vote reaches threshold and quorum, structured rejection reasons are required.
- Only then is the Agent fee spent and the project enters `RejPending`.
- The Agent verdict is final:
  - valid rejection -> worker revises and resubmits;
  - invalid rejection -> worker receives the milestone payment plus the violation bonus.
- If the Agent Fee Vault cannot pay for escalation, the transaction reverts and the project remains
  frozen until a governance-approved top-up succeeds.

## Frontend Features

The app in `FrontEnd/` has three user-facing surfaces:

- `/` - animated landing page for the Vindex protocol.
- `/app` - role-based Canton protocol console.
- `/app/explorer` - live active-contract explorer for the connected party.

Current `/app` console capabilities:

- Connect as an Investor, Worker, or AI Agent party.
- Request a dev-mode JWT from `/api/daml-token`.
- Optionally register a new party through `/api/daml-party` in dev mode.
- Investor role:
  - create an `InvestorParty`;
  - fund Budget and Agent Fee vaults and create a `ProjectPosting`;
  - stream vaults, projects, milestone reviews, and settlements;
  - cast accept/reject review votes;
  - finalize submitted milestone reviews.
- Worker role:
  - stream visible postings;
  - apply to postings;
  - accept visible `ProjectProposal` offers;
  - submit milestone deliverable hashes;
  - view commitment and settlement state.
- Agent role:
  - stream disputed projects in `RejPending`;
  - issue `AgentVerdict`;
  - trigger `WorkerViolation` after missed deadlines;
  - view live vault state.
- Explorer:
  - streams investor parties, postings, projects, reviews, governance proposals, vaults, disputes,
    and settlements visible to the connected party.

Current UI limitations discovered during audit:

- The Daml contracts and tests support multi-investor invites, select-worker governance,
  continue/stop governance, agent-fee top-up governance, and rejection reason recording.
- The current React panels do not yet expose all of those choices. In particular, the UI does not
  currently expose `OpenProposal`, `SelectWorker`, `SetRejectionReasons`, `ResolveAfterViolation`,
  `TopUpAgentFee`, `InviteInvestor`, or `AcceptInvite`.
- Because `SetRejectionReasons` is not exposed, a UI-only reject/finalize path cannot currently
  complete a disputed rejection. The Daml scripts cover this flow.
- The landing page still includes a presentational EVM wallet strip. It is not part of the real
  Canton connection path.

## Prerequisites

- Daml SDK 2.9.x, matching `sdk-version: 2.9.4` when possible.
- Node.js 18+.
- npm.
- A Canton participant plus Daml JSON Ledger API for live usage.

## Setup

### 1. Build and test the Daml package

```bash
cd SmartContract
daml build
daml test
```

`daml build` writes the DAR to:

```text
SmartContract/.daml/dist/vindex-0.1.0.dar
```

After changing `SmartContract/daml/Vindex.daml`, regenerate the frontend bindings:

```bash
cd SmartContract
daml codegen js .daml/dist/vindex-0.1.0.dar -o ../FrontEnd/daml.js
```

Then reinstall or rebuild the frontend if package metadata changed.

### 2. Install the frontend

```bash
cd FrontEnd
npm install
```

The generated Daml package is installed through local `file:` links. If the workspace is moved or
copied and `@daml.js/vindex-0.1.0` cannot be resolved, rerun `npm install` from `FrontEnd/` to
refresh the local links.

### 3. Configure the frontend

Copy the template:

```bash
cd FrontEnd
cp .env.local.example .env.local
```

For local sandbox development, the expected shape is:

```env
NEXT_PUBLIC_LEDGER_HTTP_URL=/ledger/
NEXT_PUBLIC_LEDGER_WS_URL=ws://localhost:7575/
NEXT_PUBLIC_LEDGER_RECONNECT_MS=30000
LEDGER_PROXY_TARGET=http://localhost:7575

NEXT_PUBLIC_PARTY_INVESTOR=Investor::1220...
NEXT_PUBLIC_PARTY_WORKER=Worker::1220...
NEXT_PUBLIC_PARTY_AGENT=Agent::1220...

DAML_AUTH_MODE=dev
DAML_JWT_SECRET=secret
DAML_LEDGER_ID=sandbox
```

For hosted participant usage:

```env
NEXT_PUBLIC_LEDGER_HTTP_URL=https://your-json-api.example.com/
NEXT_PUBLIC_LEDGER_WS_URL=wss://your-json-api.example.com/
DAML_AUTH_MODE=hosted
DAML_HOSTED_TOKEN=...
```

or configure the OIDC client-credentials variables in `.env.local.example`.

> **DevNet (Canton 3.x) status.** The hosted target is the **fivenorth "Seaport" DevNet validator**.
> It exposes only **JSON Ledger API v2**, which `@daml/ledger` (v1) cannot speak — so hosted mode is
> **not yet runnable** and needs the v2 client port first. Plan + blockers:
> [`DEVNET_V2_PORT_PLAN.md`](DEVNET_V2_PORT_PLAN.md). Use the local sandbox below until it lands.

Configuration caveat:

- Browser HTTP calls are safest through `/ledger/` plus `LEDGER_PROXY_TARGET`.
- The dev-only `/api/daml-party` route currently performs a server-side fetch using
  `NEXT_PUBLIC_LEDGER_HTTP_URL`. If you use the "Register a new party" UI with a relative
  `/ledger/` value, allocation may fail. Allocate demo parties with the Daml CLI and paste their
  IDs, or use an absolute JSON API URL for party allocation.

## Running Locally

> The **local sandbox** is the current dev/demo path. The production target is **Canton DevNet**
> (v2), which is in progress — see the status note above and [`DEVNET_V2_PORT_PLAN.md`](DEVNET_V2_PORT_PLAN.md).

Start the local ledger stack from `SmartContract/`:

```bash
cd SmartContract
daml build
daml sandbox --port 6865   # wall-clock: getTime advances so deadlines/late-penalty fire live
```

In another terminal, upload the DAR and allocate demo parties:

```bash
cd SmartContract
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
daml ledger allocate-parties Investor Worker Agent --host localhost --port 6865
```

Copy the printed party IDs into `FrontEnd/.env.local`.

Start the JSON Ledger API:

```bash
cd SmartContract
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575 --allow-insecure-tokens
```

Start the frontend:

```bash
cd FrontEnd
npm run dev
```

Open:

- `http://localhost:3000/` for the landing page.
- `http://localhost:3000/app` for the protocol console.
- `http://localhost:3000/app/explorer` for the live contract explorer.

If port 3000 is busy, Next.js will offer another port.

## Usage

### Contract-level workflow

The full protocol flow is available through Daml choices and covered by Daml Script tests:

1. Create an `InvestorParty`.
2. Invite additional investor members if needed.
3. Fund Budget and Agent Fee vaults and create a `ProjectPosting`.
4. Workers apply with presentation hashes and private contact links.
5. Investors open and pass a select-worker governance proposal.
6. The selected worker accepts a `ProjectProposal` and locks a Commitment Vault.
7. The worker submits milestone deliverable hashes.
8. Investors vote accept or reject in a `MilestoneReview`.
9. Accepted milestones release payment and advance.
10. Rejected milestones escalate to the Agent only after threshold, quorum, and rejection reasons.
11. The Agent rules final validity.
12. Completion or stop creates a `Settlement`.

### UI workflow

The current frontend supports a partial click-through workflow:

1. Connect as an Investor party.
2. Create an `InvestorParty`.
3. Fund vaults and publish a posting with a candidate party.
4. Connect as a Worker party.
5. Apply to the visible posting.
6. Accept a `ProjectProposal` if one has been created by script or another client.
7. Submit a milestone.
8. Connect as Investor to vote and finalize.
9. Connect as Agent to resolve disputes or trigger deadline enforcement when those states exist.
10. Use `/app/explorer` to watch the visible active contract set update in real time.

For full end-to-end worker selection, rejection reasons, top-up, and continue/stop flows, use Daml
Script or add the missing frontend controls listed above.

## Useful Commands

Smart contracts:

```bash
cd SmartContract
daml build
daml test
daml script --dar .daml/dist/vindex-0.1.0.dar --script-name Vindex.Test:testHappyPathMulti --ledger-host localhost --ledger-port 6865 --static-time
```

Frontend:

```bash
cd FrontEnd
npm run dev
npm run build
node scripts/ledger-check.mjs "<party-id>" sandbox
node scripts/seed-and-verify.cjs "<investor-party-id>" "<agent-party-id>" sandbox
```

## Test Coverage

`SmartContract/daml/Vindex/Test.daml` includes scripts for:

- multi-investor happy path;
- overfunding guard rejection;
- simple, supermajority, and weighted voting;
- valid rejection -> revision -> resubmit -> accept;
- invalid rejection -> investor violation payout;
- worker deadline violation -> governance stop;
- empty Agent Fee Vault freeze -> governance top-up.

The frontend currently has no dedicated automated test suite in `package.json`; validation is done
through TypeScript/Next builds plus manual or scripted live-ledger checks.

## Known Risks and Gaps

- No `agentVerdictDeadline`: a project in `RejPending` can stall if the Agent never rules.
- Agent-fee top-up during a freeze still requires reaching governance threshold.
- UI coverage is behind contract coverage for several governance and dispute choices.
- `/api/daml-party` has the relative URL caveat described in Configuration.
- Production builds fetch Inter through `next/font/google`; offline or restricted CI environments
  need network access to Google Fonts, a warmed Next font cache, or a switch to a local font.
- `FrontEnd/README.md` and `FrontEnd/DEMO.md` contain older landing/demo notes and should not be
  treated as more authoritative than this root README.

## References

- State diagrams and transition table: `SmartContract/docs/STATE_MACHINE.md`.
- Daml package config: `SmartContract/daml.yaml`.
- Main contracts: `SmartContract/daml/Vindex.daml`.
- Daml tests: `SmartContract/daml/Vindex/Test.daml`.
- Frontend ledger config: `FrontEnd/lib/daml/config.ts`.
- Token route: `FrontEnd/app/api/daml-token/route.ts`.

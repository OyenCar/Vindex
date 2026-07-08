# DevNet Port — JSON Ledger API v2 Migration Plan

> Decided 2026-07-07. Target: run Vindex on the **fivenorth "Seaport" Canton DevNet validator**
> (auth verified). Chosen path: **Full v2 port** (not the dead sidecar). Presentation ~2026-07-13.

## ✅ PROGRESS (2026-07-07)

- **Endpoint verified live.** `https://ledger-api.validator.devnet.sandbox.fivenorth.io` →
  `GET /v2/version` = **Canton 3.5.7**. Token exchange works; user `sub:6`
  (`otc-canton-fund-oauth`, primaryParty `5nsandbox-devnet-2::1220a14c…`) has **ParticipantAdmin**
  + 688 CanActAs. **Note: SHARED participant** (542+ packages, many tenant parties).
- **LF blocker confirmed then cleared.** Participant enforces `ALLOWED_LANGUAGE_VERSIONS = 2.1/2.2/2.3`;
  the old SDK-2.9.4 DAR (LF 1.14) was rejected. **Ported Daml 2.9.4 → 3.5.2, pinned LF 2.1.**
  Only source change: **removed the unused contract key on `Application`** (never looked up, so no
  LF-2.3 requirement). `daml.yaml` → sdk `3.5.2`, `source: daml/Vindex.daml` (excludes `Test`),
  `build-options: [--target=2.1]`. Build tool = **`dpm`** (3.5.2).
- **DAR UPLOADED to Seaport.** `POST /v2/packages` → **HTTP 200**, package count 542 → 543.
  **Vindex now lives on the DevNet participant.**
  - New package id: `24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471`
  - Backups kept: `SmartContract/vindex-0.1.0.LF1-backup.dar`, `SmartContract/daml.yaml.LF1-backup`.

### Parties allocated + frontend ported (2026-07-07, later)

- **3 parties allocated** on the participant, all namespace `…::1220a14c…`, hints exactly
  `Investor`/`Worker`/`Agent` (so `isWorkerParty` + frontend `getRole` pass), M2M user `6` granted
  `CanActAs` each. (Ran client-side; auto-mode blocks the agent from writing to the shared node.)
- **Frontend fully ported to JSON Ledger API v2:**
  - `FrontEnd/lib/daml/v2client.ts` — low-level v2 transport (ledger-end, active-contracts,
    submit-and-wait-for-transaction). `FrontEnd/lib/daml/v2ledger.ts` — `VindexLedger` shim exposing
    `create`/`exercise`/`streamQueries` (streaming = **ACS polling** every 2.5 s, not the WS — browsers
    can't set the WS `Authorization` header). `CreateEvent`/`Query`/`Stream` types moved here from the
    dead `@daml/ledger`.
  - Codegen regenerated from the LF2.1 DAR into `FrontEnd/daml.js` (old → `daml.js.LF1-backup`);
    templateIds are v2-native (`#vindex:Vindex:…`). `@daml/types` 2.9.4 → **3.5.2**; `@daml/ledger`
    removed. Rewired `ledger.ts` / `DamlProvider.tsx` / `useStreamQueries.ts` / `config.ts`.
  - **`tsc --noEmit` = 0 errors.** `npm install` OK (removed 285 pkgs = the `@daml/ledger` tree).
- **`.env.local` → Seaport** (`.env.local.sandbox-backup` kept): `LEDGER_PROXY_TARGET` = the Seaport
  ledger-api host, `DAML_AUTH_MODE=hosted` + OIDC vars, party ids. Browser HTTP goes same-origin via the
  `next.config.mjs` `/ledger/:path*` rewrite → no CORS.
- **Read path verified LIVE through the app:** `POST /api/daml-token` (hosted OIDC) → token;
  `GET /ledger/v2/state/ledger-end` (proxied) → `{offset}` 200.

**Still to verify (runtime, needs a write = user action in the browser):** create/exercise round-trip
(`submit-and-wait-for-transaction`), ACS-poll streaming showing real contracts, and whether commands
need an explicit `synchronizerId` (set `NEXT_PUBLIC_LEDGER_SYNCHRONIZER_ID` if so). Response-envelope
parsing in `v2client.ts` is defensive across a few nesting variants — adjust from the first real error.
Only `Investor`/`Worker`/`Agent` exist on Seaport (not `Public`/`Worker2`) → the INVITE_ONLY single-worker
path is the demo path; OPEN_POOL/multi-worker needs those allocated too.

## ROADMAP — post-v2 features (decided 2026-07-07)

Order: **(A) verify the v2 write path first**, then (B) + (C).

- **(A) Verify v2 writes** — get `create`/`exercise` working on Seaport. Fixes so far: command body
  nested under `commands` (was flat → 400); templateId switched to the package-ID form
  (`#<pkgId>:…` via `templateIdWithPackageId`) to avoid package-name vetting dependence. Retest
  "Create Investor Party" in-browser; next likely issues = `synchronizerId`, response-envelope shape.
- **(B) tUSDT — Canton Token Standard (CIP-56).** Chosen: real token-standard asset (Loop wallet can
  hold/see it), NOT a simple internal token. Implement the `Holding` / `TransferInstruction` /
  `Metadata` interfaces + a registry template with a `Mint` choice (start from `splice-token-standard-test`
  examples). Heavy Daml work. Then rebuild + re-upload the DAR to Seaport.
- **(C) Loop Wallet — full auth replacement.** `@fivenorth/loop-sdk` (fivenorth's own SDK, `devnet`).
  Replace the M2M-token model: user runs `loop.connect()` (QR) → `provider.party_id` becomes the
  session party; route `create`/`exercise` through `provider.submitTransaction(damlCommand)` instead
  of the v2client M2M path; `provider.getHolding()` / `loop.wallet.transfer()` for tUSDT. Big rework of
  `DamlProvider` + the shim (add a "loop" transport mode alongside the M2M v2client one).

**Deferred:** port `Test.daml` to daml-script 3.x (not needed for the app; tests only).

## Why a rewrite, not a config swap

- App stack today = **HTTP JSON Ledger API v1**: `@daml/ledger` 2.9.4 + the `daml json-api` daemon
  (:7575) + `@daml.js/vindex` codegen. SDK `2.9.4` (`SmartContract/daml.yaml`).
- `@daml/ledger` is **v1-only** — it does not speak JSON API v2.
- JSON API **v1 was deprecated in Canton 3.3 and REMOVED in 3.4**. Current DevNet ≈ Canton 3.4/3.5
  (Splice 0.5+). So the validator exposes **only v2**, and the old `daml json-api` bridge daemon is
  gone from 3.4 — the "Port A sidecar, no code change" idea is dead against this target.

## Credential state (verified)

- Token exchange `POST https://auth.sandbox.fivenorth.io/application/o/token/` → **HTTP 200**,
  `expires_in 28800`, `token_type Bearer`.
- Access token = RS256, `sub:6`, `aud:validator-devnet-m2m`, `scope:daml_ledger_api`, iss=Authentik.
  **No `https://daml.com/ledger-api` claim** → Canton 3.x **user-based** auth: the participant maps
  `sub` → a ledger user; `actAs` comes from that **user's rights on the validator**, not the token.
- Secrets live in `FrontEnd/.env.local` only (gitignored — confirmed). Never commit them.

## Architecture — wrap, don't rewrite the panels

The entire `@daml/ledger` surface funnels through **three primitives**:

| primitive | where | used by |
|---|---|---|
| `new Ledger(...)` | `FrontEnd/lib/daml/ledger.ts` | the one client factory |
| `.create` / `.exercise` | called as `session.ledger.create/exercise(Template.Choice, cid, arg)` | `InvestorPanel.tsx`, `WorkerPanel.tsx` |
| `.streamQueries(template, queries)` | `FrontEnd/lib/daml/useStreamQueries.ts` | all reactive views |

Plan: build a **v2-backed client object with the same method signatures** so the panels and
`useStreamQueries` are (near) untouched. The typed `@daml.js` template objects already carry the
fields v2 needs — reuse them:

- `Template.templateId` → v2 `templateId` (already the fully-qualified `packageId:Module:Entity`).
- `Choice.choiceName` → v2 `choice`.
- create/choice argument encoders (`.encode`) → v2 `createArguments` / `choiceArgument` JSON.

### v1 → v2 endpoint mapping

| shim method | v2 call |
|---|---|
| `create(T, arg)` | `POST /v2/commands/submit-and-wait-for-transaction` with `commands:[{CreateCommand:{templateId, createArguments}}]` |
| `exercise(T.Ch, cid, arg)` | `POST /v2/commands/submit-and-wait-for-transaction` with `commands:[{ExerciseCommand:{templateId, contractId, choice, choiceArgument}}]` |
| `streamQueries(T, qs)` initial | `POST /v2/state/active-contracts` (snapshot at current ledger-end offset) |
| `streamQueries(T, qs)` live | **WebSocket** `GET /v2/updates` (created/archived deltas from that offset). `/v2/updates/flats` also exists but is removed in 3.5 — use `/v2/updates`. |
| ledger-end offset | `GET /v2/state/ledger-end` (needed before ACS + stream) |

Command body also needs: `actAs:[party]`, `userId`, `commandId` (uuid), `submissionId`,
optional `synchronizerId` (DevNet may require the Global Synchronizer id — TBD, see blockers).

### The two non-obvious gotchas

1. **Return values.** v1 `.exercise` returns `[result, events]`; panels destructure created cids
   (`const [voted] = await ...exercise(CastVote...)`, `const [proposalCid] = ...`). Plain
   `submit-and-wait` returns only `{updateId, completionOffset}`. → the shim MUST use
   **`submit-and-wait-for-transaction`** and parse `created`/`exercised` events out of the returned
   transaction to reconstruct the `[result, events]` tuple the panels expect.
2. **Streaming is now assemble-it-yourself.** v1 `streamQueries` handed you the whole live set of a
   template. v2 = fetch ACS snapshot at `ledger-end`, then apply created/archived deltas from the
   `/v2/updates` WebSocket. The shim rebuilds the "current set" and re-emits on each delta so
   `useStreamQueries` keeps its current contract.

### Auth wiring — already ~ready

`FrontEnd/app/api/daml-token/route.ts` `hosted` mode already does the OIDC client-credentials
exchange and returns `access_token`. Set in `.env.local`:

```
DAML_AUTH_MODE=hosted
DAML_OIDC_TOKEN_URL=https://auth.sandbox.fivenorth.io/application/o/token/
DAML_OIDC_CLIENT_ID=validator-devnet-m2m
DAML_OIDC_CLIENT_SECRET=<secret>
DAML_OIDC_AUDIENCE=validator-devnet-m2m
DAML_OIDC_SCOPE=daml_ledger_api
```

Caveat: this returns **one** token for **one** user (`sub:6`). The per-party `actAs` must be granted
on the validator (below). The WebSocket must carry the same Bearer token (v2 WS auth is via the
`Sec-WebSocket-Protocol` subprotocol or an `access_token` — confirm against the AsyncAPI spec).

## HARD external blockers — needed before ANY end-to-end run

These are not code; only the fivenorth operator/dashboard can supply them. Each can independently
make the port impossible, so confirm all three **first**:

1. **Ledger API base URL.** The creds gave only the *auth* endpoint. Need the participant's JSON
   Ledger API base (e.g. `https://<participant-host>/` serving `/v2/...`) for both HTTP + WSS.
2. **Can we upload the Vindex DAR to this participant?** Vindex's packages must exist on the
   fivenorth participant. DAR upload needs participant-admin rights, which a `daml_ledger_api`-scoped
   M2M token likely does NOT have. If the operator won't host a custom DAR, only their pre-installed
   packages (Splice/Amulet) are usable → Vindex can't run there as-is. **Biggest risk.**
3. **Party allocation + actAs grant.** Vindex needs Investor / Worker / Agent as distinct acting
   parties. The `sub:6` M2M user needs `actAs` rights on all three (Canton allows one user → many
   parties, but it's an admin action: allocate parties + grant rights).
   - Also confirm whether commands require an explicit `synchronizerId`.

## Build sequence (once blockers cleared)

1. `lib/daml/v2client.ts` — new module: token-bearing fetch; `ledgerEnd()`, `activeContracts()`,
   `submitAndWaitForTransaction()`, `updatesSocket()`. Uses `NEXT_PUBLIC_LEDGER_HTTP_URL` /
   `_WS_URL` (env-driven already in `config.ts`).
2. Adapt `lib/daml/ledger.ts` factory to return a **v2 shim** exposing `.create/.exercise/
   .streamQueries` with v1-compatible signatures + return tuples (map via `@daml.js` template meta).
3. Rebuild `useStreamQueries.ts` streaming on ACS-snapshot + `/v2/updates` deltas.
4. Point `.env.local` at the fivenorth ledger URL + `DAML_AUTH_MODE=hosted` (above). Prefill the
   real allocated party ids in `NEXT_PUBLIC_PARTY_*`.
5. Verify per flow: connect → create InvestorParty → post → apply → plan → submit → review → finalize.
   Late-penalty/waive needs wall-clock (DevNet is real time — good, the static-time gotcha disappears).

## Fallback if a blocker can't clear in time

Keep the local sandbox as the **live-demo** ledger (works today) and use the DevNet creds to show a
**single real v2 transaction** (connectivity proof) — the "hybrid demo". Preserves the demo while the
full port lands. (This was option 2; revisit if blocker #2 or #1 stalls.)

## Parked / related

- `isWorkerParty` hint bug (real party allocation will bite it) — fix during party setup.
- Vision/image arbitration bug — separate thread.

# CONTINUE.md — Vindex agent handoff

> Orientation doc for an AI agent picking up this project. Read this first, then
> [`DEVNET_V2_PORT_PLAN.md`](DEVNET_V2_PORT_PLAN.md) for the deep detail. Last updated 2026-07-07.

## What Vindex is

A **private freelance escrow protocol on the Canton Network**. An investor (a multi-signatory
"Investor Party") funds milestone-based work by a worker; funds sit in on-ledger `AssetVault`s and
release on acceptance. Milestone review is a governance vote; disputes escalate to a **neutral AI
arbiter** that is **BYOK / off-ledger** (the `Agent` party only commits a boolean verdict on-ledger).
Deadlines, late-penalty, and per-pair reputation are modelled too. Core contract:
[`SmartContract/daml/Vindex.daml`](SmartContract/daml/Vindex.daml). Frontend: Next.js 14 in
[`FrontEnd/`](FrontEnd/). Feature background: [`DEADLINE_PENALTY_REPUTATION.md`](DEADLINE_PENALTY_REPUTATION.md).

## TL;DR status (2026-07-08)

The app has been **ported off the local Daml 2.9.4 sandbox onto the fivenorth "Seaport" Canton
DevNet validator** (Canton **3.5.7**, JSON Ledger API **v2**). This was a real migration, not a
config swap: Canton 3.x removed the v1 JSON API and `@daml/ledger`.

- ✅ Daml ported **2.9.4 → 3.5.2 (LF 2.1)**, DAR uploaded to Seaport.
- ✅ 3 parties allocated + M2M user granted `actAs`.
- ✅ Frontend rewritten to JSON Ledger API **v2** (custom shim; `@daml/ledger` removed). `tsc` clean.
- ✅ **Write path verified live**: `create` works (4 `InvestorParty` contracts on-ledger).
- ✅ **Exercise (choices) verified live**: `OpenProposal` on `InvestorParty` succeeded, created a
  `GovernanceProposal` on Seaport (verified 2026-07-08 via `verify-exercise.mjs`).
- ✅ **Multi-investor invite + governance UI** fully implemented (Setup tab invites, Governance tab
  proposals/voting/execution, Monitor tab violation resolution).
- ⏳ Roadmap features not started: **(B) tUSDT CIP-56 token**, **(C) Loop Wallet auth**.

Presentation target ~**2026-07-13**.

## Seaport DevNet connection (the live target)

| Thing | Value |
|---|---|
| Ledger API base | `https://ledger-api.validator.devnet.sandbox.fivenorth.io` (serves `/v2/...`) |
| Canton version | 3.5.7 (`GET /v2/version`) |
| Auth (OIDC token) | `POST https://auth.sandbox.fivenorth.io/application/o/token/`, `grant_type=client_credentials`, `client_id=validator-devnet-m2m`, `audience=validator-devnet-m2m`, `scope=daml_ledger_api` |
| Client secret | **NOT in git.** In `FrontEnd/.env.local` (gitignored) and via `$VALIDATOR_M2M_CLIENT_SECRET` for `SmartContract/seaport-parties.sh`. |
| Ledger user | `sub=6` (`otc-canton-fund-oauth`), has **ParticipantAdmin** + 688 `CanActAs`. **SHARED multi-tenant node** — be careful. |
| Vindex package id | `24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471` |
| Parties (all `::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8`) | `Investor`, `Worker`, `Agent` — hints exact (contract `isWorkerParty` + frontend `getRole` depend on the name segment). `Public`/`Worker2` **not** allocated → use the **INVITE_ONLY single-worker** demo path. |

Admin ops (upload DAR / allocate parties / grant rights) are **plain curl against `/v2/...`** — no
SDK needed. See `SmartContract/seaport-parties.sh`. **The agent cannot run writes against Seaport**
(auto-mode blocks writes to shared infra) — hand write/allocation scripts to the user to run.

## Architecture after the port

### Daml (`SmartContract/`)
- `daml.yaml`: `sdk-version: 3.5.2`, `source: daml/Vindex.daml` (**excludes `daml/Vindex/Test.daml`**,
  which still uses 2.x daml-script and is **not yet ported**), `build-options: [--target=2.1]`.
- Build tool is **`dpm`** (Daml 3.x, replaces `daml` assistant). **`dpm` is NOT on Git Bash PATH —
  run it from PowerShell.**
- The only source change from 2.9.4 was **removing the unused contract key on `Application`** (it was
  never looked up; removing it lets us target LF 2.1 instead of requiring LF 2.3 for keys).
- The participant only accepts **LF 2.1/2.2/2.3** — the old LF 1.14 DAR is rejected
  (`ALLOWED_LANGUAGE_VERSIONS`).

Post-edit build chain:
```powershell
cd SmartContract
dpm build
dpm codegen-js .daml/dist/vindex-0.1.0.dar -o ../FrontEnd/daml.js   # regenerates @daml.js/vindex
# upload to Seaport (user runs; needs the secret):
#   curl -X POST "$LEDGER/v2/packages" -H "Content-Type: application/octet-stream" \
#        -H "Authorization: Bearer $TOKEN" --data-binary @.daml/dist/vindex-0.1.0.dar
```
Editing `Vindex.daml` changes the package id → must re-codegen AND re-upload AND update `.env.local`
consumers of the package id if any.

### Frontend (`FrontEnd/`) — JSON Ledger API v2
`@daml/ledger` (v1-only, gone in Canton 3.4) was **removed**; `@daml/types` bumped to **3.5.2**. The
whole ledger surface is 3 primitives behind a shim, so the panels/UI were untouched.

- **`lib/daml/v2client.ts`** — low-level v2 transport: `ledgerEnd`, `activeContracts`,
  `submitForTransaction`, `userIdFromToken`. Defensive response-envelope parsing.
- **`lib/daml/v2ledger.ts`** — `VindexLedger` shim exposing `create` / `exercise` (→ `[result, events]`) /
  `streamQueries`, plus the `CreateEvent` / `Query` / `Stream` types that used to come from `@daml/ledger`.
  **Streaming = ACS polling every 2.5 s** (`/v2/state/active-contracts`), NOT the `/v2/updates`
  websocket (browsers can't set the WS `Authorization` header).
- **`lib/daml/ledger.ts`** — `makeLedger(token, party)` builds the shim; `fetchToken`, `pingLedger`.
- **`components/daml/DamlProvider.tsx`** — `Session.ledger: VindexLedger`.
- **`lib/daml/useStreamQueries.ts`** — imports `CreateEvent`/`Query` from `v2ledger`.
- **`app/api/daml-token/route.ts`** — `DAML_AUTH_MODE=hosted` does the OIDC client-credentials
  exchange and returns the M2M token. **Same token for every party**; v2 sets `actAs:[party]` per
  command, and user `6` holds `CanActAs` for all three, so this is fine.
- **`next.config.mjs`** — rewrites `/ledger/:path*` → `LEDGER_PROXY_TARGET`. So the browser calls the
  same origin (`/ledger/v2/...`) and Next proxies to Seaport → **no CORS**. `.env.local` sets
  `LEDGER_PROXY_TARGET` to the Seaport ledger host.

### The v2 command shape (hard-won — don't regress)
`POST /v2/commands/submit-and-wait-for-transaction`, body:
```jsonc
{ "commands": {                       // NOTE the outer "commands" wrapper (JsCommands)
    "commands": [                     // ...containing the command array
      { "CreateCommand": {            // PascalCase tag (camelCase → 400 "CNil")
          "templateId": "24e57209...:Vindex:InvestorParty",   // bare package-id, NO leading '#'
          "createArguments": { ... } } }                      // plural "createArguments"
    ],
    "commandId": "...", "actAs": ["Investor::..."], "readAs": [...], "userId": "6" } }
```
Gotchas learned the hard way: (1) everything nests under `commands`; (2) tags are `CreateCommand` /
`ExerciseCommand` (PascalCase); (3) `createArguments` is plural; (4) templateId must be the **bare
package-id** `pkgId:Module:Entity` — a leading `#` means package-NAME ref and yields
`PACKAGE_NAMES_NOT_FOUND`. Codegen exposes both `templateId` (`#vindex:...`) and
`templateIdWithPackageId` (`#pkgId:...`); the shim strips the `#`.

## Run it

```powershell
cd FrontEnd
npm run dev          # -> http://localhost:3000/app  (.env.local already points at Seaport, hosted mode)
```
Connect as **Investor** (party id prefilled), then Create Investor Party / Setup & Post / etc. The
read path (token route → `/ledger` proxy → Seaport) and `create` are verified working live.

## Roadmap (decided with the user 2026-07-07, updated 2026-07-08)

Order: **(A) finish verifying the v2 write path** ✅, then (B), then (C).

- **(A)** `create` ✅, `exercise` ✅. Both verified live against Seaport DevNet. `OpenProposal`
  exercised successfully without needing `NEXT_PUBLIC_LEDGER_SYNCHRONIZER_ID` (the participant
  auto-selects the synchronizer). **DONE.**
- **(B) tUSDT — Canton Token Standard (CIP-56).** User chose a **real token-standard asset** (Loop
  wallet can hold it), not a simple internal token. Implement the `Holding` / `TransferInstruction` /
  `Metadata` interfaces + a registry template with a `Mint` choice (start from
  `splice-token-standard-test`). Heavy Daml work → rebuild + re-upload the DAR.
- **(C) Loop Wallet — full auth replacement.** `@fivenorth/loop-sdk` (fivenorth's own SDK, `devnet`).
  Replace the M2M model: `loop.init({appName, network:'devnet', ...})` → `loop.connect()` (QR) →
  `onAccept(provider)` gives `provider.party_id` (becomes the session party); route `create`/`exercise`
  through `provider.submitTransaction(damlCommand)` instead of the v2client M2M path;
  `provider.getHolding()` / `loop.wallet.transfer()` for tUSDT. Big rework of `DamlProvider` + the shim
  (add a "loop" transport mode alongside the M2M one).

## Gotchas / conventions

- **`dpm` only from PowerShell** (not Git Bash). `daml` 2.9.4 CLI **cannot** talk to Canton 3.x.
- **Agent can't write to Seaport** (auto-mode blocks shared-infra writes) — write/allocate/upload
  scripts are handed to the user to run.
- **Secrets**: `.env.local` and `*.local` are gitignored — put secrets there. Never hardcode in a
  tracked file (a `seaport-parties.sh` hardcode was caught by security review and moved to an env var).
- **Shared node** (`otc-canton-fund`, 688 parties): party allocation + DAR upload are additive but land
  on someone else's participant — do them deliberately.
- Streaming latency is the 2.5 s ACS poll interval, not instant.

## Rollback / local-sandbox fallback (all kept)

- `SmartContract/vindex-0.1.0.LF1-backup.dar`, `SmartContract/daml.yaml.LF1-backup`
- `FrontEnd/daml.js.LF1-backup` (old v1 codegen), `FrontEnd/.env.local.sandbox-backup`
- The local-sandbox run path still exists in [`RUNBOOK.md`](RUNBOOK.md) (needs the old 2.9.4 toolchain +
  the LF1 artifacts above).

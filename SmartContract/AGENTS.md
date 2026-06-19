# AGENTS.md — Vindex

Guidance for AI agents working in this repo. Vindex is a **Daml** smart-contract project for the
**Canton Network**: a private freelance escrow where an **AI Agent is the final validator** (no
manual dispute layer). Milestone-based, locked vaults, single- or multi-investor governance by vote.

## Build & test

The Daml SDK (2.9.4) is installed but **not on PATH**. Call the exe directly (Windows):

```
C:\Users\Asus\AppData\Roaming\daml\sdk\2.9.4\daml\daml.exe build
C:\Users\Asus\AppData\Roaming\daml\sdk\2.9.4\daml\daml.exe test
```

Or add `C:\Users\Asus\AppData\Roaming\daml\bin` to PATH and use `daml build` / `daml test`.

- `daml build` → DAR at `.daml/dist/vindex-0.1.0.dar`.
- `daml test` → runs every `Script` in `daml/Vindex/Test.daml`. **All must pass (exit 0).**
- The `SDK 3.4.11 has been released!` line on stderr is a harmless update notice, not an error.
- JVM `sun.misc.Unsafe` deprecation warnings from the scenario service are noise — ignore.

**Always run `daml build` AND `daml test` after any change to `daml/`.** Do not claim a change works
without showing both at exit 0.

## Layout

```
daml.yaml              SDK 2.9.4, source: daml, init-script Vindex.Test:setup
daml/Vindex.daml       ALL templates + pure helpers (tally, advance, settle)
daml/Vindex/Test.daml  Daml Script test-suite (one Script per workflow path)
docs/STATE_MACHINE.md  mermaid state + sequence diagrams + transition table
README.md              architecture, governance, privacy, locked decisions, risks
```

Templates: `InvestorParty`, `InvestorInvite`, `GovernanceProposal`, `MilestoneReview`,
`AssetVault`, `Application`, `ProjectPosting`, `ProjectProposal`, `Project`, `Settlement`.
`Contribution`, `GovernanceConfig`, `MilestoneSpec`, enums = plain data.

## Core invariants — do not break

1. **Money moves ONLY inside `AssetVault`** choices (`Release` / `Spend` / `VaultTopUp` / `Settle`).
   Every money point is tagged `MONEY MOVEMENT`. This is the Canton Token Standard swap boundary —
   keep all fund logic here, never in `Project`.
2. **Money invariant**: `refundedBudget + refundedCommitment + refundedAgentFee + totalPaidOut
   == total initially funded`. Every vault outflow must add the same amount to `Project.paidOut`
   (releases, penalties, AND agent-op spends). Tests assert this via `Settlement`.
3. **Authority via signatories**: a `Project` choice runs with members+worker authority (Project's
   signatories), so it can archive-recreate `Project` and drive the vaults without re-signing. Vault
   signatory sets must stay subsets of the Project signatory set.
4. **Overfund check**: `budget >= Σ payment*(1+violationPct)` (enforced in `SetupAndPost`).
5. **Dispute-only AI (architecture B)**: a submission is FREE — `SubmitMilestone` consumes no Agent
   fee and never touches the Agent. The Agent fee is `Spend`-ed only when a rejection is escalated
   (the `FinalizeReview` REJECT→`RejPending` path). An empty Agent Fee Vault there aborts the
   escalation → whole tx reverts → FREEZE. Never auto-accept on depletion; resume via a `TopUp` vote.
   Do NOT move the Agent `Spend` back onto the submit path.
6. **All investor-side actions go through `GovernanceProposal`** (select worker, continue/stop,
   top-up). `proposalPassed` = threshold AND quorum. Milestone reviews use the same `tally`.
7. **AI Agent verdict is final** on rejection validity; a vote can trigger a REJECT but cannot
   override the Agent.
8. **Milestone-ending choices return `Optional (ContractId Project)`**, `None` = completion.
9. **No partial-function crashes**: use `getAt` / `getMilestoneU` (controlled `abort`), keep `ensure`
   non-empty guards. Penalty transfers capped at vault balance (`min ... cv.amount`).

## Conventions

- Comments must mark: authorization model, every `MONEY MOVEMENT`, every governance-gated action,
  and each locked-decision point. Match the existing comment density.
- State transitions are archive-recreate (consuming choice that `create`s an updated `Project`);
  reset `submissionCount` and recompute `workerDeadline` on each advance.
- A single investor is just a party of one — there is NO separate single-investor path. Don't add one.
- Tests: one `Script` per path; assert outcomes against thresholds and assert the money invariant.

## Gotchas (already hit — don't reintroduce)

- **Choice names share the data-constructor namespace.** A choice cannot share a name with any data
  constructor (e.g. the vault top-up choice is `VaultTopUp` because `TopUp` is a `ProposalAction`).
- **Visibility ≠ authority.** A propose-accept invitee must be an *observer* of a contract to
  `fetch`/`archive` it, even when it holds the authority. `InvestorParty.pending` exists so invitees
  can see the party they accept into; `InviteInvestor` is consuming for that reason.
- `observer (agent :: pending)` etc. — parenthesize cons in `observer`/`signatory` clauses.

## Known open risks (documented, do NOT silently "fix")

- No `agentVerdictDeadline`: while `RejPending`, if the Agent never rules the project stalls forever.
- Top-up during a freeze requires reaching the governance threshold while frozen — intentionally slow.

If you change governance, vault, or authorization logic, update `README.md` and
`docs/STATE_MACHINE.md` (transition table) to match.

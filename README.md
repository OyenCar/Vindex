# Vindex

A **private freelance escrow** on the **Canton Network**, where an **AI Agent is the final,
authoritative arbiter of disputes** — there is no manual dispute layer. Milestone-based, funded by
locked vaults, governed by a **single investor or a multi-investor Organization that votes**. All
payments, penalties, deadlines, and milestone progression are enforced automatically and
deterministically on-ledger.

**Validation model — architecture B (dispute-only AI).** A submission accepted by the investor
(or by inactivity / quorum-not-met auto-accept) is approved **instantly with no AI involvement**
and payment is released. The AI Agent is invoked — and the Agent fee is consumed — **only when a
milestone is rejected** and the dispute is escalated to it. The happy path never touches the Agent;
the Agent's verdict on a rejection is final.

## Setup

Requires the Daml SDK (2.9.x).

```bash
daml build      # compile
daml test       # run the Daml Script test-suite
```

Project layout:

```
daml.yaml
daml/Vindex.daml         # all templates + helpers
daml/Vindex/Test.daml    # Daml Script tests
docs/STATE_MACHINE.md    # mermaid state + sequence diagrams + transition table
```

## Architecture overview

| Template | Role |
|---|---|
| `InvestorParty` | **Multi-signatory** Organization (all members are signatories). A single investor is a party of one — same code path. |
| `InvestorInvite` | Propose-accept join; an invitee must explicitly accept to become a signatory. |
| `Contribution` | On-chain record of a member's project funding, agent-fee funding, and governance weight. |
| `GovernanceProposal` | Reusable proposal+vote (SelectWinner / Continue / Stop / TopUp). |
| `MilestoneReview` | Per-submission voting cycle: votes, deadline, structured rejection reasons. |
| `AssetVault` | Budget / Commitment / Agent-Fee vault. **The only place funds move.** |
| `Application` | Private jobseeker application (hash + contact link). |
| `ProjectPosting` | Published posting; jobseekers `Apply`; governance `SelectWorker`. |
| `ProjectProposal` | Contract offer; worker `AcceptProposal` locks the Commitment Vault. |
| `Project` | Master state machine: milestone list, index, status, deadlines, vault cids. |
| `Settlement` | Immutable completion/stop record (used to assert the money invariant). |

See [`docs/STATE_MACHINE.md`](docs/STATE_MACHINE.md) for the diagrams and the full
choice → controller → guard → effect transition table.

## Governance model

- **Every investor-side action is a vote** — worker selection, continue/stop after a worker
  violation, and Agent-fee top-up all go through `GovernanceProposal`; milestone reviews use the
  same tally. One reusable mechanism.
- **Tally semantics**: each member's power is `1` (equal) or its weight (weighted, default basis =
  capital contribution). A side **passes** when its power `≥ thresholdFraction × totalPower`.
  Abstentions are neutral. Each member casts **one vote per cycle**; a revision starts a new cycle.
  `quorumFraction` gates whether a REJECT is actionable.
- **Voting models**: `SimpleMajority`, `SuperMajority` (e.g. 66/75/80%), `Weighted`.
- **AI Agent is final** (decision 11), and **invoked only on a rejection**: a vote can trigger a
  REJECT, but only the Agent decides whether the rejection complies with the contract, and its
  verdict is auto-enforced. Accepted/auto-accepted milestones bypass the Agent entirely.

## Authorization model

A choice on a contract runs with the authority of **that contract's signatories**. Because
`Project` is signed by all members + the worker, any `Project` choice already carries enough
authority to archive-recreate the `Project` and to drive `Release`/`Spend`/`Settle` on the shared
vaults **without re-collecting signatures**. Vault signatory sets (members, or worker) are subsets
of the `Project` signatory set, which is what makes this work. All money-movement points are
marked `MONEY MOVEMENT` in the source and isolated inside `AssetVault` — a future Canton Token
Standard swap touches only the vault, never `Project` logic.

## Privacy model (Canton)

- Applications are visible only to the applying jobseeker and the Investor Party; jobseekers
  cannot see each other's applications.
- `Project`, reviews, proposals, and vaults are visible only to Investor-Party members, the
  Worker, and the Agent (via `observer` / `stakeholders`).
- Only **hashes** of presentations and deliverables are stored on-ledger; raw artifacts stay
  off-ledger. The contact link is visible to its contract's observers only.

## Locked design decisions

1. Investor Party = multi-signatory contract; a single investor is a party of one (no separate path).
2. All investor-side actions go through governance voting (one reusable `GovernanceProposal`).
3. Funds abstracted as `amount : Decimal`; money movement isolated in `AssetVault` (token-standard swap point).
4. Worker selection is a discretionary governance vote — no bidding, no tie-break.
5. Failure policy is a governance vote: continue (advance) or stop (settle + refund).
6. Dispute-only AI + Agent Fee Vault freeze: submissions are free; the Agent fee is consumed only
   when a rejection is escalated to the Agent (`FinalizeReview` REJECT path). If the vault cannot
   pay then, the **escalation reverts** (pauses the contract). Resuming requires a top-up, itself a
   governance vote. Never auto-accept on depletion.
7. The Investor Party must **overfund** the Budget Vault: `budget ≥ Σ(payment × (1 + p%))`. Unused
   reserve is refunded on completion.
8. Authorization via `Project` signatories (see above).
9. State transitions use archive-recreate; reset submission count and recompute the worker
   deadline on each advance.
10. Voting tally semantics exactly as specified (threshold over total power, quorum gates
    actionable rejects, abstentions neutral, one vote per member per cycle, weighted via contributions).
11. The AI Agent is the final authority on rejection validity; voting cannot override it.

## Known open risks (documented, not silently fixed)

- **No `agentVerdictDeadline`**: while `RejPending`, if the Agent never rules, the project stalls
  permanently.
- **Top-up via vote during a freeze**: refilling a depleted Agent Fee Vault requires reaching the
  governance threshold *while the contract is frozen* — potentially slow. The tension is
  intentional (decision 2/6 wins over convenience).

## Acceptance-criteria checklist

| Criterion | Where |
|---|---|
| `daml build` / `daml test` pass | full project; run the commands above |
| Single investor uses the same code path | `setupSingle` (party of one) in `Vindex/Test.daml` |
| Milestone-ending choices return `Optional (ContractId Project)`, `None` = complete | `FinalizeReview`, `AgentVerdict`, `ResolveAfterViolation` |
| No partial-function crashes (non-empty lists, safe indexing) | `ensure` clauses, `getAt`, `getMilestoneU` |
| Commitment penalty capped at balance | `WorkerViolation` (`min … cv.amount`) |
| Exact vote tallies, weighted + equal both tested | `tally`/`proposalPassed`; `testVotingModels` |
| Comments mark authorization, money movement, governance, locked decisions | throughout `Vindex.daml` |
| Money invariant after each path | `assertInvariant` in happy / valid-rejection / investor-violation / worker-stop tests |
| Overfund check rejects underfunded budget | `testOverfundRejected` |
| Agent-fee freeze then top-up | `testAgentFreezeThenTopUp` |

# Vindex — Console & Explorer UI/UX Audit

> Audited 2026-07-04. Scope: the dapp `/app` (Console) and `/app/explorer` (Explorer), plus the
> shared shell (`app/app/layout.tsx`), auth (`PartyConnect`), sidebar/hero/earnings, and the
> Investor/Worker panels. Written from a Canton-developer's mindset.
>
> Severity: 🔴 broken/bug · 🟠 UX problem · 🟡 polish · 🔵 conceptual/Canton-model concern.

---

## 1. Console — functional bugs

| # | Sev | Finding | Where |
|---|-----|---------|-------|
| C1 | 🔴 | **Registering a Worker produces a party that can't apply.** The allocate hint is `` `${role}-${rand}` `` → e.g. `worker-ab12`, lowercase. Daml `isWorkerParty` requires the display name to equal `"Worker"` or be prefixed `"Worker"` (case-sensitive). So a freshly-registered worker fails every `Apply` with *"applicant must be a Worker party"*. | `PartyConnect.tsx:63`, `Vindex.daml` `isWorkerParty` |
| C2 | 🔴 | **No party-exists check on connect.** Dev tokens are minted for *any* string, so "Connect" always "succeeds"; if the prefilled/typed party isn't allocated (stale after reseed), every command later fails `UNKNOWN_SUBMITTERS`. Identity is theater. | `DamlProvider.tsx` `connect`, `PartyConnect.tsx:120` |
| C3 | 🔴 | **`EarningsWidget` "Locked" is not scoped to the current project.** It uses `vaults.find(v => vaultType==="CommitmentV")` — the *first* commitment vault, not the worker's active-project one. With ≥2 projects it shows an arbitrary vault. | `EarningsWidget.tsx:19,31` |
| C4 | 🔴 | **Agent role is unreachable but still half-referenced.** `PartyConnect` offers only Investor/Worker; `page.tsx` renders only investor/worker panels. Yet `ConsoleSidebar` maps `agent → "AI Agent"` and `AgentPanel` exists. Dead surface + confusing. | `PartyConnect.tsx:9`, `page.tsx:42-44`, `ConsoleSidebar.tsx:29` |
| C5 | 🟠 | **Stale hardcoded facts in the sidebar.** `Agent: Claude 3.5 Sonnet` is fixed — but the arbiter is now BYOK (could be Groq llama / Gemini / anything). Misleads the user about which model rules their disputes. | `ConsoleSidebar.tsx:74-76` |
| C6 | 🟠 | **Sidebar sticky offset mismatch.** `lg:sticky lg:top-14` (56px) vs the app nav ~68px → the sidebar can tuck under / misalign with the nav. (The investor tab bar uses `top-[72px]`.) | `ConsoleSidebar.tsx:40` |

## 2. Console — UI / consistency

| # | Sev | Finding | Where |
|---|-----|---------|-------|
| C7 | 🟠 | **Two clashing design languages.** `PartyConnect`, `ConsoleSidebar`, `LoginHero`, `EarningsWidget` are neo-brutalist (`brutal-card`, hard borders/shadows); the panels + Explorer are frosted `glass`. Same screen, two visual systems. | across console/ + flows/ |
| C8 | 🟠 | **`LoginHero` sells removed / overclaimed features.** "Budget, Commitment, **and Agent-Fee** funds locked" — the Agent-Fee vault was removed in v2. "AI Dispute Resolution … via **cryptographic proofs**" — the verdict is a boolean signed by the agent, not a proof of reasoning. | `LoginHero.tsx:41,43` |
| C9 | 🟡 | **No unified feedback.** Errors are inline per component; the new notification bell is per-panel. No global toast/telemetry for "payment released", "applicant arrived", tx failures. | app-wide |
| C10 | 🟡 | **Login copy vs reality.** "Select your role (Investor or Worker)" is honest, but the whole product still describes a 3-party (investor/worker/agent) protocol while the agent is server-only. | `page.tsx:31` |

## 3. Explorer — findings

| # | Sev | Finding | Where |
|---|-----|---------|-------|
| E1 | 🔵 | **"Transparency" is a misnomer under Canton.** The Explorer streams *"all contracts visible to your party"* — but Canton's sub-transaction privacy means that's **only what you can see**, not a global ledger view. Labeling it "Live Ledger Transparency Protocol" overclaims; there is no global view by design. | `explorer/page.tsx:86,115` |
| E2 | 🟠 | **Counts mislabelled.** "Investors" = number of `InvestorParty` contracts (one per job → parties-of-one), not distinct investors. "Open Reviews" counts *all* `MilestoneReview`, not just open ones. | `explorer/page.tsx:100,103` |
| E3 | 🟠 | **No loading vs empty distinction.** `.contracts.length === 0` → "No X" even while the WS is still streaming or after a reset (ghost-then-empty). No `loading` state surfaced. | `explorer/page.tsx:132…` |
| E4 | 🟡 | **Dead-end ids.** Rows show `Contract: abc…` / `ID: abc…` truncations with no copy/expand and nothing to click through to (Canton has no block explorer). Informational only. | `explorer/page.tsx:156,174,207` |
| E5 | 🟡 | **No per-party filter / time / search.** Dense but static; can't filter by status, project, or party; no historical/tx-tree view (ACS snapshot only). | explorer |

## 4. Cross-cutting UI/UX

- 🟠 **Stale-data honesty**: the "CANTON LIVE" badge is bound to an HTTP ping, not the WS stream, so it stays green over a dead/empty ledger (documented in `memory.md §13.5`). Explorer + sidebar counts can show ghosts after a sandbox reset.
- 🟡 **Accessibility**: status conveyed by color (blue dot / status pills) — has `title` but no text-equivalent; several clickable elements lack `aria-label`.
- 🟡 **Mobile**: the sticky investor tab bar `top-[72px]` assumes a single-row nav; if the nav wraps taller on very narrow screens it can overlap.

---

## 5. Canton-developer read — what's vague or doesn't make sense

> These are model/architecture concerns, not pixels. A Canton dev picking this up would stop on each.

**M1 🔵 The "Agent" party has no custody story.** The agent is a first-class Canton party (observer of everything, sole controller of `AgentVerdict`), but nobody can *connect* as it, and the server exercises on its behalf by minting an HS256 dev token (`getAgentToken`). So in production: **who hosts the agent party and holds its key?** The "neutral oracle" is really *our server acting as the agent*. That's a centralization + key-custody question the design hand-waves.

**M2 🔵 BYOK economics are backwards.** The investor supplies the AI key that pays for a verdict which can rule **against them** (unjustified → they pay penalty + full milestone). Why would a rational investor fund the compute to arbitrate their own dispute — and could they just… not, to stall? (The `ResolveStalePending` timeout is the patch, but see M5.) In real arbitration the loser or both parties pay; here the investor always pays regardless of outcome.

**M3 🔵 The on-ledger "hash commitment" is fake.** `MilestoneSpec.deliverablesHash` is set to the literal placeholder `` `sha256:milestone-${i+1}` `` in the worker's plan (`WorkerPanel.tsx`), not a hash of anything. So there is **no cryptographic binding** between the on-ledger milestone and the off-ledger deliverable. "Only hashes on-ledger" is not actually integrity-protecting the artifact. The submission CID *is* content-addressed, but nothing compares delivered-vs-expected.

**M4 🔵 "Non-custodial escrow / funds locked on-ledger" holds no value.** `AssetVault.amount : Decimal` is just a number; `Release`/`Spend` adjust an integer. There is no token, no custody, no real asset (it's the documented Token-Standard swap point — but not yet swapped). The UI ("Secured Escrows", "Non-custodial", "Locked Value") presents fictional decimals as real money.

**M5 🔵 Static-time makes half the state machine unreachable in the UI.** The sandbox runs `--static-time`, so ledger `getTime` is frozen. Every deadline path — `WorkerViolation` (`now > workerDeadline`), `ResolveStalePending` (`now > agentVerdictDeadline`), review auto-accept — can only fire after `passTime`, which only `daml script` can call. **In the live UI none of these ever trigger.** The whole deadline/violation/timeout machinery is demo-untestable without switching to wall-clock (which breaks the scripts). This tension isn't resolved.

**M6 🔵 Multi-investor governance is on-ledger but UI-dead.** Every template carries `members`, `contributions`, tallies, quorum — real multi-sig machinery — but the UI only ever creates a party-of-one and never surfaces invite/propose/vote forms. So the governance layer complicates the entire contract set for a feature the product can't reach. Is it a real feature or dead weight?

**M7 🔵 "InvestorParty per job" is an odd model.** A new `InvestorParty` contract is minted per posting, so Explorer's "Investors" is really "funding groups, one per project." A Canton dev expects one org party with many projects, not one party-of-one per job. Naming (`InvestorParty`) and cardinality fight the mental model.

**M8 🔵 Identity is unauthenticated in dev.** HS256 shared `"secret"` + `--allow-insecure-tokens` means the browser mints a token for *any* party — no proof of control. "Connect Identity" + role badges present this as authenticated identity. Fine for a local demo, but the UI shouldn't imply otherwise; production needs verified OIDC (currently a stubbed code path).

**M9 🔵 Privacy leaks to the agent + server by design.** The agent is an observer of projects/reviews/vaults, and the server holds the agent token → the server sees every dispute's content, and (for BYOK) the deliverable + reasons are shipped to a third-party LLM. The "Canton-private" pitch holds on the ledger but breaks at the AI/IPFS edges (see `memory.md §13` privacy notes).

**M10 🟡 "Revision rounds" ≠ revisions.** The `maxRevisions` ceiling maps 1:1 to `maxSubmissions` (total submissions incl. the first), so a ceiling of 3 means 2 actual revisions. Label/semantics mismatch.

---

## 6. Prioritized fixes

**Ship-blockers (🔴):**
1. C1 — capitalize the worker allocate hint (`Worker`/`Investor`), or validate the prefix, so registered workers can apply.
2. C2 — verify the party exists on connect (list-known-parties probe); reject stale ids.
3. C3 — scope `EarningsWidget` "Locked" to the worker's active project's commitment vault.

**High-value UX (🟠):**
4. C4/C10 — either remove the agent role surface entirely or make it a first-class panel; align copy.
5. C5/C8 — stop hardcoding "Claude 3.5 Sonnet" + "Agent-Fee"; reflect the active BYOK model and the v2 money model.
6. E1/E2 — rename/scope Explorer honestly ("Your visible ledger", fix "Investors"/"Open Reviews").
7. C6 — align sidebar sticky offset with the nav.

**Design debt (🟡):**
8. C7 — pick one visual language (brutal *or* glass).
9. C9 — a single toast/notification channel.

**Model decisions to make (🔵 — need product calls, not just code):**
- M1 agent custody, M2 BYOK economics, M4 real token integration, M5 time model (static vs wall-clock), M6 keep-or-cut multi-investor, M3 real deliverable hashing.

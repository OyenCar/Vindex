# Rejection Reasons — Northwind Analytics Landing Page (Milestone 1)

**From:** Investor (after a passing REJECT vote)
**Status on-ledger:** the milestone moved to `RejPending`; the AI agent now arbitrates.

In the Verdix demo these go into the investor's **"Vote Reject + record reasons"** box (one reason per
line). They are stored on-ledger in the project's `rejectionReasons` and shown to the AI agent, which
weighs each one against the to-do list and the submission.

Copy-paste the lines below (one per line) into the rejection box:

```
Pricing section is missing the Enterprise tier — the spec required exactly 3 tiers (Starter, Pro, Enterprise).
The hero CTA links to "#" instead of /signup, so the main conversion button is dead.
The contact form posts to a third-party (Formspree) and does not validate the email — this violates the no-third-party-scripts and email-validation requirements.
Mobile Lighthouse performance is 84, below the required minimum of 90.
The shade of blue in the hero is too dark for my taste and should be lighter.
```

## How a fair agent should read these

- **Reasons 1–4** map directly to checklist items 4, 2, 5/8, and 6 — these are **real, in-scope gaps**
  and are justified.
- **Reason 5** ("blue is too dark") is a **subjective preference** explicitly listed as *out of scope*
  in the to-do list, so it is **not** a justified ground for rejection.

Because genuine required items are unmet, the expected verdict is **rejection VALID → the worker
revises** (not an investor violation). The agent should still call out reason 5 as unjustified in its
breakdown.

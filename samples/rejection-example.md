# Rejection Reasons — Northwind Analytics Landing Page (Milestone 2)

**From:** Investor (after a passing REJECT vote)
**Status on-ledger:** the milestone moved to `RejPending`; the AI agent now arbitrates.
**Milestone context:** Milestone 1 (Layout & Hero) was already accepted. This dispute is about
milestone 2 (Core Sections & Polish), covering acceptance criteria items 3–7.

In the Vindex demo these go into the investor's **"Vote Reject + record reasons"** box (one reason per
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

- **Reasons 1–4** map directly to checklist items 4, 2, 5/8, and 6. Items 4, 5, and 6 are within
  milestone 2's scope (items 3–7) — these are **real, in-scope gaps** and are justified.
- **Reason 2** (hero CTA) references item 2, which belongs to **milestone 1** (already accepted).
  The agent should flag this as **out of scope for this milestone** — the worker cannot be penalized
  for an item that was already accepted in a previous milestone.
- **Reason 5** ("blue is too dark") is a **subjective preference** explicitly listed as *out of scope*
  in the project brief, so it is **not** a justified ground for rejection.

Because genuine required items within milestone 2 are unmet (pricing tiers, contact form, performance),
the expected verdict is **rejection VALID → the worker revises**. The agent should still call out
reason 2 (out-of-scope milestone) and reason 5 (subjective) as unjustified in its breakdown.

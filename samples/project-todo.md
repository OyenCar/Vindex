# Project To-Do — Northwind Analytics Marketing Landing Page

**Role:** Front-end freelancer
**Milestones:** 3 (Layout & Hero → Core Sections & Polish → Final Delivery)
**Payment:** released per milestone from the Budget Vault on acceptance

This document is the **to-do list / acceptance checklist**. In the Vindex demo the investor uploads
this file as the *project brief* (its IPFS CID is stored on-ledger as `briefUri`). The AI arbitration
agent checks the worker's submission against the numbered items below.

## Scope
Design and build a responsive marketing landing page for "Northwind Analytics" (a B2B SaaS).
Ship it as a GitHub repository plus a live deployment URL.

## Acceptance checklist (all required unless marked optional)

## Milestone 1
1. **Responsive layout** — hero, features, pricing, and footer sections; must render correctly on
   both mobile (375px) and desktop (1440px).
2. **Hero section** — a headline, one line of sub-copy, and a primary call-to-action button. The CTA
   must link to `/signup`.
## Milestone 2
3. **Features section** — exactly **4** feature cards, each with an icon, a title, and a one-line
   description.
4. **Pricing section** — exactly **3** tiers: **Starter**, **Pro**, and **Enterprise**, each showing
   a monthly price and a bullet list of included features.
5. **Contact form** — fields for name, email, and message. It must **validate the email format**
   client-side and submit to the project's own `/api/contact` endpoint.
6. **Performance** — mobile Lighthouse **Performance score ≥ 90**.
7. **Accessibility** — every image has descriptive `alt` text; text/background color contrast meets
   **WCAG AA**.
## Milestone 3
8. **No third-party tracking** — do **not** include any third-party analytics, tracking, or form
   back-end scripts (privacy requirement). All form handling stays first-party.
9. **Delivery** — a public GitHub repository **and** a working live deploy URL.
10. **README** — setup and run instructions in `README.md`.

## Out of scope (do not reject the work for these)
- Visual taste / brand color preferences beyond the contrast requirement in item 7.
- Copywriting wording, as long as the required sections exist.
- Any feature not listed above.

## Definition of done
All 10 checklist items satisfied. Subjective preferences that are not in this list are **not** grounds
for rejecting the milestone.

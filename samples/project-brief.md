# Project Brief — Northwind Analytics Marketing Landing Page

**Client:** Northwind Analytics (B2B SaaS startup)
**Posted by:** Investor Party
**Budget envelope:** 4,000 USDC (split across milestones)
**Agent fee:** 300 USDC (AI arbitration reserve)
**Worker commitment required:** 500 USDC

---

## Project Overview

We need a responsive marketing landing page for **Northwind Analytics**, a B2B SaaS company
offering data analytics and reporting tools. The page should attract potential customers, clearly
communicate the product's value, and convert visitors into sign-ups.

The deliverable is a GitHub repository with source code plus a live deployment URL.

## Technical Requirements

- **Framework:** any modern frontend framework (React, Next.js, Vue, Astro, etc.) or plain HTML/CSS/JS
- **Hosting:** any deployment platform (Vercel, Netlify, GitHub Pages, etc.)
- **Mobile-first:** must work on screens from 375px to 1440px+

---

## Milestone Plan

### Milestone 1 — Layout & Hero (Payment: 1,000 USDC)

Deliver the foundational page structure and the hero section.

**Acceptance criteria:**
1. **Responsive layout** — hero, features, pricing, and footer section containers; must render
   correctly on both mobile (375px) and desktop (1440px). Content for later sections may use
   placeholder blocks.
2. **Hero section** — a headline, one line of sub-copy, and a primary call-to-action button.
   The CTA must link to `/signup`.

**Worker window:** 7 days
**Review window:** 3 days

---

### Milestone 2 — Core Sections & Polish (Payment: 2,000 USDC)

Fill in the remaining content sections, add the contact form, and meet performance/accessibility
bars.

**Acceptance criteria:**
3. **Features section** — exactly **4** feature cards, each with an icon, a title, and a one-line
   description.
4. **Pricing section** — exactly **3** tiers: **Starter**, **Pro**, and **Enterprise**, each
   showing a monthly price and a bullet list of included features.
5. **Contact form** — fields for name, email, and message. It must **validate the email format**
   client-side and submit to the project's own `/api/contact` endpoint.
6. **Performance** — mobile Lighthouse **Performance score ≥ 90**.
7. **Accessibility** — every image has descriptive `alt` text; text/background color contrast
   meets **WCAG AA**.

**Worker window:** 10 days
**Review window:** 3 days

---

### Milestone 3 — Final Delivery (Payment: 1,000 USDC · final milestone)

Clean up, remove any third-party scripts, and hand over the finished project.

**Acceptance criteria:**
8. **No third-party tracking** — do **not** include any third-party analytics, tracking, or form
   back-end scripts (privacy requirement). All form handling stays first-party.
9. **Delivery** — a public GitHub repository **and** a working live deploy URL.
10. **README** — setup and run instructions in `README.md`.

**Worker window:** 5 days
**Review window:** 3 days

---

## Out of Scope

The following are **not** grounds for rejecting any milestone:

- Visual taste or brand color preferences beyond the contrast requirement in item 7
- Copywriting wording, as long as the required sections exist
- Any feature or requirement not listed above

## Notes for the AI Arbitration Agent

This brief is the **single source of truth** for all milestone evaluations. Each milestone should
be judged ONLY against its own numbered acceptance criteria. Items belonging to other milestones
are not relevant to the current verdict.

The numbered items (1–10) map directly to the acceptance checklist in the project to-do list.

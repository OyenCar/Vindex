# Milestone Submission — Northwind Analytics Landing Page

**From:** Worker (freelancer)
**Re:** Milestone 2 of 3 — Core Sections & Polish
**Previous:** Milestone 1 (Layout & Hero) — accepted ✓

In the Vindex demo the worker uploads this file as the *deliverable* (its IPFS CID is stored
on-ledger as the project's `currentSubmissionUri`). The AI arbitration agent reads it and matches it
against the project to-do list — specifically the acceptance criteria for **milestone 2** only.

## What I delivered

- **Repository:** https://github.com/example/northwind-landing
- **Live deploy:** https://northwind-landing.vercel.app

## Notes per section

### Layout
Responsive across mobile and desktop. Verified at 375px and 1440px in Chrome and Firefox. Hero,
features, pricing, and footer all present.

### Hero
Headline ("Decisions, backed by data"), one line of sub-copy, and a primary CTA button.
> The CTA currently points to `#` as a placeholder — I wasn't sure of the final signup route, so I
> left it as an anchor to wire up later.

### Features
Four feature cards, each with an icon, a title, and a one-line description:
Real-time dashboards · Automated reports · Team workspaces · API access.

### Pricing
Two tiers implemented: **Starter** ($29/mo) and **Pro** ($99/mo), each with a feature bullet list.
> I left out the Enterprise tier because there was no pricing number for it in the assets — happy to
> add "Contact us" if needed.

### Contact form
Name, email, and message fields. The form submits through **Formspree** (a hosted form service) so it
works without a backend. Email is not specifically validated beyond the browser's default `type=email`.

### Performance
Mobile Lighthouse: **Performance 84**, Accessibility 100, Best-Practices 100, SEO 100. The 84 is mostly
the hero image; I can compress it further in a follow-up.

### Accessibility
All images have descriptive `alt` text. Color contrast checked with the WAVE tool — passes AA.

### README
`README.md` includes install (`npm i`), run (`npm run dev`), and deploy steps.

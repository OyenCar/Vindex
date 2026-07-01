# Vindex — Landing Hero

A production-grade, fullscreen hero section for **Vindex**, an AI-governed freelance
escrow protocol. Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer
Motion, Lucide, and shadcn/ui-style primitives.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Components

| File | Responsibility |
|---|---|
| `components/AnimatedBackground.tsx` | 5-layer cinematic background: gradient, grid, glowing particles, animated network lines, governance constellation, glass auroras + mouse parallax. |
| `components/Navbar.tsx` | Transparent floating navbar (max-w 1280), scroll-aware glass, animated mobile slide-over. |
| `components/Hero.tsx` | Eyebrow badge, gradient headline, description, CTAs, staggered reveal; composes metrics + visualization + wallets. |
| `components/ProtocolVisualization.tsx` | Live SVG protocol diagram (Investor Party → Escrow Vault → Worker → AI Agent) with a travelling packet cycling 3 scenarios: instant release (green), AI arbitration (purple), penalty (amber). |
| `components/MetricCard.tsx` | Glassmorphism metric card with scroll-triggered count-up + floating motion. |
| `components/WalletSupport.tsx` | Floating wallet cards (MetaMask / WalletConnect / Coinbase Wallet). |
| `components/ui/button.tsx` | shadcn/ui-style button + `buttonVariants`. |

## Design system

- Tokens live in `tailwind.config.ts` + `app/globals.css` (`:root`), matching the brief's
  palette (`--background #0B1020`, `--accent #7C3AED`, success/warning, etc.).
- Body type: **Inter** via `next/font`. Display type falls back to Inter — drop a licensed
  **Helvetica Now Display** face in and update `--font-display` in `globals.css` to switch.
- Motion primitives: `fade-up`, `glow-pulse`, `float`, `gradient-x`, animated edges
  (`flow-dash`), and mouse parallax. All animations use transform/opacity for 60fps and
  honor `prefers-reduced-motion`.

## Notes on Wagmi / RainbowKit

The wallet section is **presentational** so the page builds and runs with zero config (no
WalletConnect `projectId` required). To wire real connections, add `wagmi`, `viem`,
`@rainbow-me/rainbowkit`, and `@tanstack/react-query`, create a `Providers` client component
with `WagmiProvider` + `RainbowKitProvider`, wrap `app/layout.tsx`, and replace the cards in
`WalletSupport.tsx` with RainbowKit's `ConnectButton`.

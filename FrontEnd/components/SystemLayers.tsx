"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Lock,
  ListChecks,
  Scale,
  ReceiptText,
  Layers,
  type LucideIcon,
} from "lucide-react";

interface Layer {
  tag: string;
  name: string;
  icon: LucideIcon;
  blurb: string;
  points: string[];
  stat: { k: string; v: string }[];
}

const LAYERS: Layer[] = [
  {
    tag: "Layer 01",
    name: "Governance",
    icon: Landmark,
    blurb:
      "Funders pool capital as a multi-signatory Investor Party and steer every decision by vote.",
    points: [
      "Simple, super-majority & weighted voting",
      "Every investor action is a governance proposal",
      "Worker selection is a discretionary vote — not bidding",
    ],
    stat: [
      { k: "Voting models", v: "3" },
      { k: "Quorum", v: "configurable" },
    ],
  },
  {
    tag: "Layer 02",
    name: "Escrow",
    icon: Lock,
    blurb:
      "Funds sit in on-ledger vaults the moment a job is posted — never with a custodian.",
    points: [
      "Budget, Commitment & Agent-Fee vaults",
      "Budget must overfund Σ payment · (1 + penalty)",
      "Money moves only inside the vault — the tokenization swap point",
    ],
    stat: [
      { k: "Vault types", v: "3" },
      { k: "Custodian", v: "none" },
    ],
  },
  {
    tag: "Layer 03",
    name: "Execution",
    icon: ListChecks,
    blurb:
      "Work is delivered against milestones with real deadlines and a hard submission cap.",
    points: [
      "Per-milestone worker & review windows",
      "Deliverables pinned to IPFS, hashes on-ledger",
      "Capped attempts per milestone, enforced by contract",
    ],
    stat: [
      { k: "Storage", v: "IPFS" },
      { k: "On-ledger", v: "hash only" },
    ],
  },
  {
    tag: "Layer 04",
    name: "Arbitration",
    icon: Scale,
    blurb:
      "The AI agent is a paid last resort — it rules only when a rejection is contested.",
    points: [
      "The happy path never touches the agent",
      "Structured reasons required before escalation",
      "Verdict is final: worker revises, or is paid with penalty",
    ],
    stat: [
      { k: "Happy-path AI cost", v: "0" },
      { k: "Verdict", v: "final" },
    ],
  },
  {
    tag: "Layer 05",
    name: "Settlement",
    icon: ReceiptText,
    blurb:
      "Each accepted milestone pays out instantly; an immutable record closes the project.",
    points: [
      "Per-milestone release straight to the worker",
      "Penalties capped at the commitment deposit",
      "Conservation invariant proven in the contract tests",
    ],
    stat: [
      { k: "Payout", v: "per milestone" },
      { k: "Record", v: "immutable" },
    ],
  },
];

export function SystemLayers() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.idx));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const jump = (i: number) =>
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section id="system" className="relative mx-auto w-full max-w-shell px-5 py-24 sm:px-8 lg:py-32">
      {/* Heading */}
      <div className="max-w-2xl">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-primary">
          <Layers className="h-3.5 w-3.5 text-accent-soft" />
          The system
        </span>
        <h2
          className="mt-6 font-display font-black tracking-tightest text-text-primary text-balance"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.02 }}
        >
          One protocol, <span className="text-gradient-animated">five layers.</span>
        </h2>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-text-secondary">
          Verdix is a vertical stack — governance on top, settlement at the base. Each layer is
          enforced by Daml contracts on Canton, so the rules can&apos;t be bypassed off the ledger.
        </p>
      </div>

      {/* Sticky rail + content */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        {/* Left sticky nav */}
        <div className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-1.5">
            {LAYERS.map((l, i) => {
              const on = i === active;
              return (
                <button
                  key={l.name}
                  onClick={() => jump(i)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all ${
                    on ? "glass" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                      on ? "bg-accent/20 text-accent-soft" : "bg-white/[0.04] text-text-secondary"
                    }`}
                  >
                    <l.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[10px] uppercase tracking-[0.16em] ${on ? "text-accent-soft" : "text-text-secondary/70"}`}>
                      {l.tag}
                    </span>
                    <span className={`block text-[14px] font-semibold ${on ? "text-text-primary" : "text-text-secondary"}`}>
                      {l.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content blocks */}
        <div className="flex flex-col gap-6">
          {LAYERS.map((l, i) => (
            <motion.div
              key={l.name}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-idx={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-soft shadow-glow-sm">
                    <l.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-accent-soft">
                      {l.tag}
                    </span>
                    <span className="block text-xl font-semibold text-text-primary">{l.name}</span>
                  </div>
                </div>
                {/* mini mockup stat panel */}
                <div className="flex gap-2">
                  {l.stat.map((s) => (
                    <div
                      key={s.k}
                      className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-center"
                    >
                      <div className="text-[13px] font-semibold text-text-primary">{s.v}</div>
                      <div className="text-[10px] uppercase tracking-wide text-text-secondary">{s.k}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-secondary">
                {l.blurb}
              </p>

              <ul className="mt-5 grid gap-2.5">
                {l.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[14px] text-text-primary/90">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

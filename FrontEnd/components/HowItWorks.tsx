"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Vote,
  Upload,
  Gavel,
  BadgeCheck,
  Route,
  type LucideIcon,
} from "lucide-react";

interface Step {
  n: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Fund & post",
    body: "Investors lock the budget into escrow and publish a job with milestones and deadlines.",
    icon: Wallet,
  },
  {
    n: "02",
    title: "Hire by vote",
    body: "Candidates apply with a portfolio. Investors pick the worker through a governance vote.",
    icon: Vote,
  },
  {
    n: "03",
    title: "Deliver milestones",
    body: "The worker uploads each deliverable to IPFS; only its hash is recorded on the ledger.",
    icon: Upload,
  },
  {
    n: "04",
    title: "Approve or dispute",
    body: "Agree and payment releases instantly. Disagree, and the AI agent rules on the dispute.",
    icon: Gavel,
  },
  {
    n: "05",
    title: "Settle",
    body: "The final milestone pays out and an immutable settlement record closes the project.",
    icon: BadgeCheck,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto w-full max-w-shell px-5 py-16 sm:px-8 lg:py-20">
      <div className="max-w-2xl">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-primary">
          <Route className="h-3.5 w-3.5 text-accent-soft" />
          How it works
        </span>
        <h2
          className="mt-6 font-display font-black tracking-tightest text-text-primary text-balance"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.02 }}
        >
          From brief to payout, <span className="text-gradient-animated">in five steps.</span>
        </h2>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-text-secondary">
          No intermediaries hold the money and no one needs to trust a counterparty — the contract
          enforces every step.
        </p>
      </div>

      <div className="relative mt-14">
        {/* connecting rail */}
        <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-accent/40 via-white/10 to-transparent sm:block" />
        <div className="flex flex-col gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-start gap-5"
            >
              <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl glass-strong text-accent-soft">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="glass flex-1 rounded-2xl p-5 sm:p-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-sm font-bold text-accent-soft">{s.n}</span>
                  <h3 className="text-lg font-semibold text-text-primary">{s.title}</h3>
                </div>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

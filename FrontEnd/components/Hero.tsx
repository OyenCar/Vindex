"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard, type Metric } from "@/components/MetricCard";
import { ProtocolVisualization } from "@/components/ProtocolVisualization";
import { WalletSupport } from "@/components/WalletSupport";

const METRICS: Metric[] = [
  { label: "Escrow Secured", icon: ShieldCheck, prefix: "$", value: 12.4, suffix: "M+", decimals: 1 },
  { label: "Disputes Resolved", icon: Scale, value: 98.7, suffix: "%", decimals: 1 },
  { label: "Average Settlement Time", icon: Timer, prefix: "< ", value: 2, suffix: " min" },
  { label: "Investor Parties", icon: Users, value: 1200, suffix: "+", separator: true },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-screen w-full max-w-shell flex-col px-5 pb-20 pt-32 sm:px-8 lg:pt-36">
      <div className="grid flex-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-10">
        {/* Left — copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-[720px]"
        >
          {/* Eyebrow badge */}
          <motion.div variants={item} className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-accent/25 blur-md animate-glow-pulse" />
            <span className="glass relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
              Powered by AI Arbitration
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="mt-6 font-display font-black tracking-tightest text-text-primary text-balance"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.95 }}
          >
            Freelance Payments{" "}
            <span className="text-gradient-animated">Without Human Disputes.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={item}
            className="mt-7 max-w-[640px] text-[17px] leading-relaxed text-text-secondary sm:text-lg"
          >
            Verdix combines escrow vaults, milestone-based payments, investor
            governance, and AI-powered dispute resolution into a single trustless
            protocol. If both parties agree, payments move instantly. If they
            disagree, AI enforces the contract.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="shadow-glow">
                Start Building
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" variant="secondary">
                <Shield className="h-[18px] w-[18px]" />
                Explore Protocol
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust line */}
          <motion.div
            variants={item}
            className="mt-8 flex items-center gap-2 text-[13px] text-text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#10B981]" />
            Non-custodial · Deterministic on-chain enforcement · Canton Network
          </motion.div>
        </motion.div>

        {/* Right — live protocol visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="w-full"
        >
          <ProtocolVisualization />
        </motion.div>
      </div>

      {/* Metrics */}
      <div className="mt-16 grid grid-cols-2 gap-4 lg:mt-20 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* Wallet support */}
      <div className="mt-14 border-t border-white/[0.06] pt-10">
        <WalletSupport />
      </div>
    </section>
  );
}

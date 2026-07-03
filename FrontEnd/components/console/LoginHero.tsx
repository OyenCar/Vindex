"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Zap } from "lucide-react";

export function LoginHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    animate(heroRef.current.querySelectorAll("[data-anim]"), {
      opacity: [0, 1],
      translateY: [20, 0],
      easing: "easeOutCubic",
      duration: 600,
      delay: stagger(100),
    });
  }, []);

  return (
    <div ref={heroRef} className="brutal-card p-6 sm:p-8 flex flex-col gap-5">
      <div data-anim className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-[var(--accent)] border-2 border-[var(--border)]">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight font-display text-[var(--text-primary)]">
          Protocol Console
        </h2>
      </div>

      <p data-anim className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
        Vindex is a Canton-native freelance escrow. Milestone-based vaults, multi-sig governance, and AI arbitration — no middlemen.
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {[
          { n: "01", title: "Secured Escrows", desc: "Budget, Commitment, and Agent-Fee funds locked on-ledger." },
          { n: "02", title: "Multi-sig Governance", desc: "Investors manage projects via votes and milestone reviews." },
          { n: "03", title: "AI Dispute Resolution", desc: "Disputed milestones resolved by AI Agent via cryptographic proofs." },
        ].map((item) => (
          <div key={item.n} data-anim className="flex gap-3 items-start">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--border)] bg-[var(--accent)] font-mono text-xs font-black text-white">
              {item.n}
            </span>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-primary)]">{item.title}</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

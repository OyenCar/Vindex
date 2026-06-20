"use client";

import { motion } from "framer-motion";
import {
  Network,
  FileCode2,
  Atom,
  Boxes,
  BrainCircuit,
  Braces,
  Cpu,
  type LucideIcon,
} from "lucide-react";

interface Tech {
  name: string;
  role: string;
  icon: LucideIcon;
  layer: string;
}

const STACK: Tech[] = [
  { name: "Canton Network", role: "Privacy-preserving ledger — the source of truth.", icon: Network, layer: "Ledger" },
  { name: "Daml", role: "Smart-contract language encoding the protocol logic.", icon: FileCode2, layer: "Contracts" },
  { name: "Next.js 14 · React", role: "The app console and landing experience.", icon: Atom, layer: "Frontend" },
  { name: "IPFS · Pinata", role: "Content-addressed, off-ledger file storage.", icon: Boxes, layer: "Storage" },
  { name: "Claude", role: "AI arbitration agent — an off-ledger oracle.", icon: BrainCircuit, layer: "Intelligence" },
  { name: "TypeScript · Tailwind", role: "Typed UI bindings and the design system.", icon: Braces, layer: "Tooling" },
];

export function TechStack() {
  return (
    <section id="stack" className="relative mx-auto w-full max-w-shell px-5 py-24 sm:px-8 lg:py-32">
      <div className="max-w-2xl">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-primary">
          <Cpu className="h-3.5 w-3.5 text-accent-soft" />
          Tech stack
        </span>
        <h2
          className="mt-6 font-display font-black tracking-tightest text-text-primary text-balance"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.02 }}
        >
          Built on <span className="text-gradient-animated">production infrastructure.</span>
        </h2>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-text-secondary">
          Nothing bespoke where a proven layer exists. The ledger governs; files and intelligence
          stay off-ledger and verifiable.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5 }}
            className="glass group rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-soft transition-shadow group-hover:shadow-glow-sm">
                <t.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                {t.layer}
              </span>
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-text-primary">{t.name}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{t.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

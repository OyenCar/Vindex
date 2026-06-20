"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

// Canton party-access strip. Verdix authenticates Canton parties via the Daml JSON Ledger API
// (party id + ledger JWT) — NOT EVM wallets. This intentionally replaces the old MetaMask /
// WalletConnect / Wagmi strip, which advertised the exact Web3/wallet paradigm Verdix is not.
const RAILS = [
  { name: "Investor Party", glyph: "🏛️", tint: "#8B5CF6" },
  { name: "Worker", glyph: "🛠️", tint: "#10B981" },
  { name: "AI Agent", glyph: "🧠", tint: "#7C3AED" },
];

export function WalletSupport() {
  return (
    <div className="flex flex-col items-center gap-4 lg:items-start">
      <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-text-secondary">
        <KeyRound className="h-3.5 w-3.5" />
        Connect as a Canton party
      </span>

      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        {RAILS.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href="/app"
              className="glass group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-lg text-sm"
                style={{
                  background: `${r.tint}1f`,
                  boxShadow: `inset 0 0 0 1px ${r.tint}40`,
                }}
              >
                {r.glyph}
              </span>
              <span className="text-[13px] font-medium text-text-primary">
                {r.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <span className="text-[12px] text-text-secondary">
        Powered by{" "}
        <span className="font-medium text-text-primary">Canton</span> +{" "}
        <span className="font-medium text-text-primary">Daml</span>
      </span>
    </div>
  );
}

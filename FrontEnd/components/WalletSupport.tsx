"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

const WALLETS = [
  { name: "MetaMask", glyph: "🦊", tint: "#F6851B" },
  { name: "WalletConnect", glyph: "🔗", tint: "#3B99FC" },
  { name: "Coinbase Wallet", glyph: "🔵", tint: "#2563EB" },
];

export function WalletSupport() {
  return (
    <div className="flex flex-col items-center gap-4 lg:items-start">
      <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-text-secondary">
        <Wallet className="h-3.5 w-3.5" />
        Connect with
      </span>

      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        {WALLETS.map((w, i) => (
          <motion.div
            key={w.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-lg text-sm"
              style={{
                background: `${w.tint}1f`,
                boxShadow: `inset 0 0 0 1px ${w.tint}40`,
              }}
            >
              {w.glyph}
            </span>
            <span className="text-[13px] font-medium text-text-primary">
              {w.name}
            </span>
          </motion.div>
        ))}
      </div>

      <span className="text-[12px] text-text-secondary">
        Powered by{" "}
        <span className="font-medium text-text-primary">Wagmi</span> +{" "}
        <span className="font-medium text-text-primary">RainbowKit</span>
      </span>
    </div>
  );
}

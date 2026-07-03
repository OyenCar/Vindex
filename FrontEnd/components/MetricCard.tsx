"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface Metric {
  label: string;
  icon: LucideIcon;
  prefix?: string;
  value: number;
  suffix?: string;
  decimals?: number;
  separator?: boolean;
}

function format(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withSep}.${dec}` : withSep;
}

function useCountUp(target: number, run: boolean, duration = 1600) {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration, reduce]);

  return val;
}

export function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const value = useCountUp(metric.value, inView);
  const Icon = metric.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 6 + index,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.4,
        }}
        className="glass relative overflow-hidden rounded-2xl p-5"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-light)] bg-black/[0.03] dark:bg-white/[0.04] text-accent-soft">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>

        <div className="font-display text-3xl font-bold tracking-tight tabular-nums text-text-primary sm:text-[34px]">
          {metric.prefix}
          {format(value, metric.decimals ?? 0, metric.separator ?? false)}
          {metric.suffix}
        </div>
        <div className="mt-1 text-[13px] text-text-secondary">{metric.label}</div>
      </motion.div>
    </motion.div>
  );
}

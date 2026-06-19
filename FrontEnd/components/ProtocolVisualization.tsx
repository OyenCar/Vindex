"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  BrainCircuit,
  Hammer,
  Landmark,
  Vault,
  type LucideIcon,
} from "lucide-react";

type Pt = [number, number];

type NodeId = "inv" | "vault" | "worker" | "ai";

interface NodeDef {
  id: NodeId;
  label: string;
  sub: string;
  icon: LucideIcon;
  c: Pt; // center in 400x540 space
}

const NODES: NodeDef[] = [
  { id: "inv", label: "Investor Party", sub: "Governance", icon: Landmark, c: [200, 64] },
  { id: "vault", label: "Escrow Vault", sub: "Locked funds", icon: Vault, c: [200, 204] },
  { id: "worker", label: "Worker", sub: "Milestones", icon: Hammer, c: [200, 344] },
  { id: "ai", label: "AI Agent", sub: "Final authority", icon: BrainCircuit, c: [200, 484] },
];

const TONE = {
  success: "#10B981",
  arbitration: "#7C3AED",
  violation: "#F59E0B",
};

interface Seg {
  a: Pt;
  b: Pt;
  lit: NodeId[];
}

interface Scenario {
  id: number;
  caption: string;
  short: string;
  color: string;
  segments: Seg[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 0,
    color: TONE.success,
    short: "Instant Release",
    caption: "Worker Submit → Investor Accept → Payment Released",
    segments: [
      { a: [200, 98], b: [200, 170], lit: ["inv", "vault"] },
      { a: [200, 238], b: [200, 310], lit: ["vault", "worker"] },
    ],
  },
  {
    id: 1,
    color: TONE.arbitration,
    short: "AI Arbitration",
    caption: "Submit → Reject → AI Review → Payment Released",
    segments: [
      { a: [200, 378], b: [200, 450], lit: ["worker", "ai"] },
      { a: [300, 484], b: [346, 484], lit: ["ai"] },
      { a: [346, 484], b: [346, 204], lit: ["ai", "vault"] },
      { a: [346, 204], b: [300, 204], lit: ["vault"] },
      { a: [200, 238], b: [200, 310], lit: ["vault", "worker"] },
    ],
  },
  {
    id: 2,
    color: TONE.violation,
    short: "Penalty",
    caption: "Deadline Missed → Violation Triggered → Penalty Executed",
    segments: [
      { a: [200, 310], b: [200, 238], lit: ["worker", "vault"] },
      { a: [200, 170], b: [200, 98], lit: ["vault", "inv"] },
    ],
  },
];

interface Frame extends Seg {
  color: string;
  sceneId: number;
  caption: string;
  short: string;
  lastInScene: boolean;
}

const TIMELINE: Frame[] = SCENARIOS.flatMap((s) =>
  s.segments.map((seg, i) => ({
    ...seg,
    color: s.color,
    sceneId: s.id,
    caption: s.caption,
    short: s.short,
    lastInScene: i === s.segments.length - 1,
  })),
);

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function Node({
  node,
  activeColor,
}: {
  node: NodeDef;
  activeColor: string | null;
}) {
  const Icon = node.icon;
  const active = activeColor !== null;
  return (
    <motion.div
      className="glass absolute flex w-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl px-3.5 py-3"
      style={{ left: pct(node.c[0], 400), top: pct(node.c[1], 540) }}
      animate={{
        scale: active ? 1.05 : 1,
        borderColor: active ? activeColor! : "rgba(255,255,255,0.08)",
        boxShadow: active
          ? `0 0 0 1px ${activeColor}, 0 14px 40px -12px ${activeColor}`
          : "0 14px 40px -22px rgba(0,0,0,0.9)",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors"
        style={{ color: active ? activeColor! : "#A78BFA" }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight text-text-primary">
          {node.label}
        </span>
        <span className="block truncate text-[11px] leading-tight text-text-secondary">
          {node.sub}
        </span>
      </span>
      <span
        className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
        style={{
          background: active ? activeColor! : "rgba(148,163,184,0.4)",
          boxShadow: active ? `0 0 8px ${activeColor}` : "none",
        }}
      />
    </motion.div>
  );
}

export function ProtocolVisualization() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "-80px" });
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const frame = TIMELINE[step];

  // Advance through the timeline only while visible (saves cycles off-screen).
  const handleComplete = () => {
    if (reduce || !inView) return;
    timer.current = setTimeout(
      () => setStep((s) => (s + 1) % TIMELINE.length),
      frame.lastInScene ? 750 : 140,
    );
  };

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  // Kick the loop back into motion when it scrolls into view.
  useEffect(() => {
    if (!reduce && inView) {
      timer.current = setTimeout(
        () => setStep((s) => (s + 1) % TIMELINE.length),
        600,
      );
    }
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Deterministic at initial render (no client-only value) → hydration-safe.
  // `reduce` only governs the auto-advance loop below, never the rendered tree.
  const litColor = (id: NodeId): string | null =>
    frame.lit.includes(id) ? frame.color : null;

  return (
    // reducedMotion="user" stops Framer motion for those users without altering the DOM tree.
    <MotionConfig reducedMotion="user">
    <div ref={rootRef} className="relative mx-auto w-[min(420px,92vw)]">
      {/* Scenario caption */}
      <div className="mb-4 flex h-8 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={frame.sceneId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: frame.color, boxShadow: `0 0 10px ${frame.color}` }}
            />
            <span className="text-[12px] font-medium text-text-secondary">
              {frame.caption}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative aspect-[400/540] w-full">
        <svg
          viewBox="0 0 400 540"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <defs>
            <filter id="packetGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base edges (always faint, with idle flow) */}
          {[
            "M200,98 L200,170",
            "M200,238 L200,310",
            "M200,378 L200,450",
          ].map((d, i) => (
            <g key={i}>
              <path d={d} stroke="rgba(148,163,184,0.18)" strokeWidth={2} />
              {/* Always rendered; the moving stroke is a CSS animation (reduced-motion-safe). */}
              <path
                d={d}
                stroke="rgba(124,58,237,0.5)"
                strokeWidth={2}
                strokeDasharray="4 120"
                className="animate-flow-dash"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            </g>
          ))}
          {/* Redirect lane (AI → Vault) used during arbitration */}
          <path
            d="M300,484 H346 V204 H300"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Active segment highlight — always rendered (identical SSR/CSR initial state). */}
          <motion.line
            key={`hl-${step}`}
            x1={frame.a[0]}
            y1={frame.a[1]}
            x2={frame.b[0]}
            y2={frame.b[1]}
            stroke={frame.color}
            strokeWidth={2.6}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: 0.25 }}
            transition={{ duration: 0.95, ease: "easeInOut" }}
          />

          {/* Travelling packet — always rendered; the loop advance is gated in handleComplete. */}
          <motion.g
            key={`pk-${step}`}
            initial={{ x: frame.a[0], y: frame.a[1] }}
            animate={{ x: frame.b[0], y: frame.b[1] }}
            transition={{ duration: 0.95, ease: "easeInOut" }}
            onAnimationComplete={handleComplete}
            filter="url(#packetGlow)"
          >
            <circle r={11} fill={frame.color} opacity={0.18} />
            <circle r={5} fill={frame.color} />
            <circle r={2} fill="#ffffff" opacity={0.85} />
          </motion.g>
        </svg>

        {/* HTML nodes overlay */}
        {NODES.map((n) => (
          <Node key={n.id} node={n} activeColor={litColor(n.id)} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center gap-5">
        {SCENARIOS.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full transition-all"
              style={{
                background: s.id === frame.sceneId ? s.color : "rgba(148,163,184,0.35)",
                boxShadow: s.id === frame.sceneId ? `0 0 8px ${s.color}` : "none",
              }}
            />
            <span
              className="text-[11px] transition-colors"
              style={{
                color:
                  s.id === frame.sceneId ? "#F8FAFC" : "rgba(148,163,184,0.7)",
              }}
            >
              {s.short}
            </span>
          </div>
        ))}
      </div>
    </div>
    </MotionConfig>
  );
}

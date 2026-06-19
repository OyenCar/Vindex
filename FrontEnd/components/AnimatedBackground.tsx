"use client";

import { useEffect } from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* Deterministic PRNG so server and client render identical particles (no hydration drift). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260620);

const PARTICLES = Array.from({ length: 34 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  size: 1 + rand() * 2.6,
  delay: rand() * 6,
  duration: 6 + rand() * 8,
  opacity: 0.18 + rand() * 0.5,
}));

/* A faint constellation used for the "governance graph" layer. */
const GRAPH_NODES = Array.from({ length: 7 }, (_, i) => ({
  x: 12 + rand() * 76,
  y: 12 + rand() * 76,
  r: 2 + rand() * 2,
  key: i,
}));
const GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 4],
  [4, 5],
  [5, 6],
  [2, 6],
];

const NETWORK_PATHS = [
  "M-50,180 C 320,80 620,300 1490,150",
  "M-50,470 C 360,560 780,360 1490,520",
  "M-50,720 C 420,640 900,820 1490,700",
];

/**
 * Parallax layer. Initial transform is 0 on both server and client → hydration-safe.
 * The spring only starts moving after the mousemove effect fires post-mount.
 */
function ParallaxLayer({
  depth,
  mx,
  my,
  className,
  children,
}: {
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  className?: string;
  children: React.ReactNode;
}) {
  const x = useSpring(useTransform(mx, (v) => v * depth), {
    stiffness: 60,
    damping: 20,
  });
  const y = useSpring(useTransform(my, (v) => v * depth), {
    stiffness: 60,
    damping: 20,
  });
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedBackground() {
  // Plain MotionValues default to 0 — identical SSR/CSR. Never read `window` during render.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    // reducedMotion="user" disables Framer animations for those users WITHOUT changing the DOM tree.
    <MotionConfig reducedMotion="user">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      >
        {/* Layer 1 — dark base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#161f3a_0%,#0b1020_45%,#070a16_100%)]" />

        {/* Layer 5a — large glassy aurora blobs (parallax) */}
        <ParallaxLayer depth={18} mx={mx} my={my} className="absolute inset-0">
          <div className="absolute left-[8%] top-[6%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.30),transparent_62%)] blur-3xl animate-glow-pulse" />
          <div className="absolute right-[4%] top-[34%] h-[34vw] w-[34vw] rounded-full bg-[radial-gradient(circle,rgba(56,89,224,0.22),transparent_62%)] blur-3xl" />
          <div className="absolute bottom-[-12%] left-[34%] h-[36vw] w-[36vw] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.10),transparent_60%)] blur-3xl" />
        </ParallaxLayer>

        {/* Layer 2 — technical grid */}
        <div className="absolute inset-0 grid-overlay opacity-70" />

        {/* Layer 4 — subtle governance graph constellation (parallax) */}
        <ParallaxLayer depth={34} mx={mx} my={my} className="absolute inset-0">
          <svg
            className="absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 opacity-50"
            viewBox="0 0 100 100"
            fill="none"
          >
            {GRAPH_EDGES.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={GRAPH_NODES[a].x}
                y1={GRAPH_NODES[a].y}
                x2={GRAPH_NODES[b].x}
                y2={GRAPH_NODES[b].y}
                stroke="rgba(124,58,237,0.22)"
                strokeWidth={0.18}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.4 + i * 0.18 }}
              />
            ))}
            {GRAPH_NODES.map((n) => (
              <g key={n.key}>
                <circle cx={n.x} cy={n.y} r={n.r * 1.8} fill="rgba(124,58,237,0.10)" />
                <circle cx={n.x} cy={n.y} r={n.r * 0.5} fill="rgba(167,139,250,0.8)" />
              </g>
            ))}
          </svg>
        </ParallaxLayer>

        {/* Layer 3 — animated network lines. SAME node tree on server and client;
            the moving stroke is a CSS animation (`animate-flow-dash`) that globals.css
            disables under `prefers-reduced-motion`, so structure stays invariant. */}
        <svg
          className="absolute inset-0 h-full w-full opacity-50"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(124,58,237,0)" />
              <stop offset="50%" stopColor="rgba(124,58,237,0.5)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </linearGradient>
          </defs>
          {NETWORK_PATHS.map((d, i) => (
            <g key={i}>
              <path d={d} stroke="rgba(148,163,184,0.10)" strokeWidth={1} />
              <path
                d={d}
                stroke="url(#edgeGrad)"
                strokeWidth={1.6}
                strokeDasharray="6 240"
                className="animate-flow-dash"
                style={{ animationDelay: `${i * 1.1}s` }}
              />
            </g>
          ))}
        </svg>

        {/* Layer 2b — floating glowing particles (deterministic positions) */}
        <div className="absolute inset-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-accent-soft will-change-transform animate-float"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                boxShadow: "0 0 8px rgba(167,139,250,0.8)",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Layer 5b — vignette + top glow to seat content */}
        <div className="absolute inset-0 bg-[radial-gradient(100%_60%_at_50%_0%,rgba(124,58,237,0.10),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>
    </MotionConfig>
  );
}

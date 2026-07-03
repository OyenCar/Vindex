"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * Neo-brutalist animated background using anime.js.
 * Clean grid lines with subtle animated accents — no heavy blobs or parallax.
 */
export function AnimatedBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const didAnimate = useRef(false);

  useEffect(() => {
    if (!svgRef.current || didAnimate.current) return;
    didAnimate.current = true;

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Animate grid lines entrance
    animate(svgRef.current.querySelectorAll(".grid-line"), {
      strokeDashoffset: [2000, 0],
      opacity: [0, 0.15],
      easing: "easeInOutQuad",
      duration: 2000,
      delay: stagger(80),
    });

    // Animate accent dots
    animate(svgRef.current.querySelectorAll(".accent-dot"), {
      scale: [0, 1],
      opacity: [0, 1],
      easing: "easeOutBack",
      duration: 600,
      delay: stagger(120, { start: 800 }),
    });

    // Pulse accent dots continuously
    animate(svgRef.current.querySelectorAll(".accent-dot"), {
      opacity: [0.6, 1, 0.6],
      easing: "easeInOutSine",
      duration: 3000,
      delay: stagger(400, { start: 2000 }),
      loop: true,
    });

    // Animate radar pulse rings (animating SVG attributes: r and opacity)
    animate(svgRef.current.querySelectorAll(".pulse-circle"), {
      r: [3, 24],
      opacity: [0.5, 0],
      easing: "easeOutQuart",
      duration: 3000,
      delay: stagger(400, { start: 1500 }),
      loop: true,
    });

    // Animate horizontal grid particles (animating SVG attribute: cx)
    animate(svgRef.current.querySelectorAll(".moving-particle-h"), {
      cx: ["0%", "100%"],
      opacity: [0, 0.7, 0.7, 0],
      easing: "linear",
      duration: 12000,
      delay: stagger(2500, { start: 500 }),
      loop: true,
    });

    // Animate vertical grid particles (animating SVG attribute: cy)
    animate(svgRef.current.querySelectorAll(".moving-particle-v"), {
      cy: ["0%", "100%"],
      opacity: [0, 0.7, 0.7, 0],
      easing: "linear",
      duration: 9000,
      delay: stagger(3000, { start: 1000 }),
      loop: true,
    });
  }, []);

  // Deterministic grid positions
  const GRID_SPACING = 48;
  const hLines = Array.from({ length: 20 }, (_, i) => i * GRID_SPACING);
  const vLines = Array.from({ length: 30 }, (_, i) => i * GRID_SPACING);

  // Deterministic accent dot positions (at grid intersections)
  const DOTS = [
    { x: 192, y: 144 },
    { x: 480, y: 288 },
    { x: 768, y: 192 },
    { x: 336, y: 432 },
    { x: 624, y: 528 },
    { x: 960, y: 336 },
    { x: 1104, y: 480 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle grid pattern */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Horizontal grid lines */}
        {hLines.map((y) => (
          <line
            key={`h-${y}`}
            className="grid-line"
            x1="0"
            y1={y}
            x2="100%"
            y2={y}
            stroke="var(--border-light)"
            strokeWidth="0.5"
            strokeDasharray="2000"
            strokeDashoffset="2000"
            opacity="0"
          />
        ))}
        {/* Vertical grid lines */}
        {vLines.map((x) => (
          <line
            key={`v-${x}`}
            className="grid-line"
            x1={x}
            y1="0"
            x2={x}
            y2="100%"
            stroke="var(--border-light)"
            strokeWidth="0.5"
            strokeDasharray="2000"
            strokeDashoffset="2000"
            opacity="0"
          />
        ))}
        {/* Accent dots at intersections */}
        {DOTS.map((d, i) => (
          <circle
            key={i}
            className="accent-dot"
            cx={d.x}
            cy={d.y}
            r="3"
            fill="var(--accent)"
            opacity="0"
          />
        ))}
        {/* Radar pulses */}
        {DOTS.map((d, i) => (
          <circle
            key={`pulse-${i}`}
            className="pulse-circle"
            cx={d.x}
            cy={d.y}
            r="3"
            stroke="var(--accent)"
            strokeWidth="0.5"
            fill="none"
            opacity="0"
          />
        ))}
        {/* Moving light particles along grid lines */}
        <circle className="moving-particle-h" cy="144" r="1.5" fill="var(--accent)" opacity="0" />
        <circle className="moving-particle-h" cy="288" r="1.5" fill="var(--accent)" opacity="0" />
        <circle className="moving-particle-h" cy="432" r="1.5" fill="var(--accent)" opacity="0" />
        <circle className="moving-particle-v" cx="336" r="1.5" fill="var(--accent)" opacity="0" />
        <circle className="moving-particle-v" cx="624" r="1.5" fill="var(--accent)" opacity="0" />
      </svg>

      {/* Gradient fade at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, var(--bg) 100%)`,
        }}
      />
    </div>
  );
}

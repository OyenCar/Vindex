"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowRight, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// In-page sections (these anchors now resolve to real sections on the landing page) plus the
// live console route.
const NAV_LINKS = [
  { label: "System", href: "#system" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Tech Stack", href: "#stack" },
  { label: "Console", href: "/app" },
];

const DOCS_URL = "https://github.com/OyenCar/Vindex";

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center">
        <span className="absolute inset-0 rounded-xl bg-accent/30 blur-md" />
        <svg
          viewBox="0 0 32 32"
          className="relative h-9 w-9"
          fill="none"
          aria-hidden
        >
          <rect
            width="32"
            height="32"
            rx="9"
            fill="url(#logoGrad)"
          />
          <path
            d="M9 11.5 L16 22 L23 11.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="9.5" r="1.7" fill="white" />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="text-[19px] font-semibold tracking-tight text-text-primary">
        Verdix
      </span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-shell items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
          scrolled
            ? "glass-strong shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "border border-transparent bg-transparent",
        )}
      >
        <a href="#" aria-label="Verdix home" className="shrink-0">
          <Logo />
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <FileText className="h-4 w-4" />
            Documentation
          </a>
          <Link
            href="/app"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl text-text-primary md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="glass-strong fixed right-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col gap-2 p-6 md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-xl text-text-secondary hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-lg text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  <FileText className="h-4 w-4" />
                  Documentation
                </a>
                <Link
                  href="/app"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "primary", size: "lg" })}
                >
                  Launch App
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

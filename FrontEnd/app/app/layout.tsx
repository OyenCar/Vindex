"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DamlProvider } from "@/components/daml/DamlProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", label: "Console" },
  { href: "/app/explorer", label: "Explorer" },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="url(#navmark)" />
      <path d="M9 11.5 L16 22 L23 11.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="9.5" r="1.7" fill="white" />
      <defs>
        <linearGradient id="navmark" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <DamlProvider>
      <AnimatedBackground />
      <div className="relative min-h-screen">
        <nav className="sticky top-0 z-40 flex justify-center border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
          <div className="flex w-full max-w-shell items-center gap-1 px-5 py-2.5 sm:px-8">
            <Link href="/" className="mr-4 flex items-center gap-2">
              <Mark />
              <span className="text-[15px] font-semibold tracking-tight">Vindex</span>
            </Link>
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  pathname === t.href
                    ? "bg-accent/15 text-accent-soft"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
        {children}
      </div>
    </DamlProvider>
  );
}

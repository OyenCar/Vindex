"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DamlProvider, useDaml } from "@/components/daml/DamlProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, LogOut } from "lucide-react";

const NAV_LINKS = [
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

function NavContent() {
  const pathname = usePathname();
  const { session, online, disconnect } = useDaml();

  function shorten(p: string) {
    return p.length > 20 ? `${p.slice(0, 10)}…${p.slice(-6)}` : p;
  }

  const roleColor: Record<string, string> = {
    investor: "text-violet-400 bg-violet-500/10 border-violet-500/25",
    worker: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    agent: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-shell items-center gap-1 px-5 py-2.5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="mr-4 flex shrink-0 items-center gap-2">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">Vindex</span>
        </Link>

        {/* Tab Nav */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                pathname === t.href
                  ? "bg-accent/15 text-accent-soft"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Server status */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
            online
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 bg-white/[0.04] text-text-secondary",
          )}
        >
          {online ? (
            <>
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Canton Online</span>
              <span className="sm:hidden">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Connecting…</span>
            </>
          )}
        </div>

        {/* User info — only shown when connected */}
        {session && (
          <>
            <span className="mx-2 h-4 w-px shrink-0 bg-white/10" />
            <div className="flex shrink-0 items-center gap-2">
              {/* Role badge */}
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                  roleColor[session.role] ?? "border-white/10 bg-white/[0.04] text-text-secondary",
                )}
              >
                {session.role}
              </span>
              {/* Truncated party address */}
              <span
                className="hidden font-mono text-[12px] text-text-secondary sm:block"
                title={session.party}
              >
                {shorten(session.party)}
              </span>
              {/* Disconnect button */}
              <button
                onClick={disconnect}
                className="flex items-center gap-1 h-7 px-2.5 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-medium text-text-secondary hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="h-3 w-3" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DamlProvider>
      <AnimatedBackground />
      <div className="relative min-h-screen">
        <NavContent />
        {children}
      </div>
    </DamlProvider>
  );
}

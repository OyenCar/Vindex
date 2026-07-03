"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DamlProvider, useDaml } from "@/components/daml/DamlProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, LogOut, Sun, Moon } from "lucide-react";

const NAV_LINKS = [
  { href: "/app", label: "Console" },
  { href: "/app/explorer", label: "Explorer" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vindex-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("vindex-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shadow-sm"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function NavContent() {
  const pathname = usePathname();
  const { session, online, disconnect } = useDaml();

  function shorten(p: string) {
    return p.length > 20 ? `${p.slice(0, 10)}…${p.slice(-6)}` : p;
  }

  return (
    <div className="sticky top-0 z-40 w-full px-4 pt-4">
      <nav className="mx-auto flex w-full max-w-shell items-center gap-2 rounded-full px-6 py-2.5 glass-strong shadow-lg border border-[var(--border-light)]">
        {/* Logo */}
        <Link href="/" className="mr-4 flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--accent)] shadow-sm">
            <span className="text-sm font-black text-white font-display">V</span>
          </div>
          <span className="text-[15px] font-black tracking-tight font-display uppercase">Vindex</span>
        </Link>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-[var(--border-light)]">
          {NAV_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-full",
                pathname === t.href
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
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
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors shadow-sm",
            online
              ? "bg-[var(--success)] text-white border-transparent"
              : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border-light)]",
          )}
        >
          {online ? (
            <>
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">CANTON LIVE</span>
              <span className="sm:hidden">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 animate-pulse" />
              <span className="hidden sm:inline">CONNECTING…</span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User info — only shown when connected */}
        {session && (
          <>
            <span className="mx-1 h-5 w-px shrink-0 bg-[var(--border-light)]" />
            <div className="flex shrink-0 items-center gap-2">
              {/* Role badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-[var(--border-light)] bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {session.role}
              </span>
              {/* Truncated party address */}
              <span
                className="hidden font-mono text-[11px] text-[var(--text-muted)] sm:block"
                title={session.party}
              >
                {shorten(session.party)}
              </span>
              {/* Disconnect button */}
              <button
                onClick={disconnect}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-[var(--border-light)] bg-[var(--surface)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--danger)] hover:text-white hover:border-transparent transition-all duration-200 cursor-pointer shrink-0 shadow-sm"
              >
                <LogOut className="h-3 w-3" />
                Exit
              </button>
            </div>
          </>
        )}
      </nav>
    </div>
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

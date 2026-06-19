"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DamlProvider } from "@/components/daml/DamlProvider";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", label: "Console" },
  { href: "/app/explorer", label: "Explorer" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <DamlProvider>
      <div className="relative min-h-screen">
        <nav className="sticky top-0 z-40 flex justify-center border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
          <div className="flex w-full max-w-shell items-center gap-1 px-5 py-2 sm:px-8">
            <Link href="/" className="mr-3 text-sm font-semibold tracking-tight">
              Verdix
            </Link>
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] transition-colors",
                  pathname === t.href
                    ? "bg-white/10 text-text-primary"
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

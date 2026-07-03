"use client";

import { useDaml } from "@/components/daml/DamlProvider";
import { ErrorBoundary } from "@/components/daml/ErrorBoundary";
import { PartyConnect } from "@/components/daml/PartyConnect";
import { ConsoleSidebar } from "@/components/console/ConsoleSidebar";
import { EarningsWidget } from "@/components/console/EarningsWidget";
import { LoginHero } from "@/components/console/LoginHero";
import dynamic from "next/dynamic";

// Dynamic imports to optimize bundle size and boost performance
const InvestorPanel = dynamic(() => import("@/components/daml/flows/InvestorPanel").then((mod) => mod.InvestorPanel), {
  loading: () => <div className="animate-pulse h-[300px] rounded-2xl bg-white/[0.02] border border-white/5" />,
  ssr: false,
});
const WorkerPanel = dynamic(() => import("@/components/daml/flows/WorkerPanel").then((mod) => mod.WorkerPanel), {
  loading: () => <div className="animate-pulse h-[300px] rounded-2xl bg-white/[0.02] border border-white/5" />,
  ssr: false,
});

function Dapp() {
  const { session } = useDaml();

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-shell px-5 py-8 sm:px-8">
      {!session ? (
        <div className="grid gap-6 lg:grid-cols-2 items-start mt-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-[var(--text-primary)] font-display">Connect Identity</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Select your role (Investor or Worker) and enter your Canton Party ID.
            </p>
            <PartyConnect />
          </div>
          <LoginHero />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start mt-4">
          <ConsoleSidebar />
          <div className="flex flex-col gap-6">
            <ErrorBoundary>
              {session.role === "worker" && <EarningsWidget />}
              {session.role === "investor" && <InvestorPanel />}
              {session.role === "worker" && <WorkerPanel />}
            </ErrorBoundary>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProtocolConsole() {
  return <Dapp />;
}

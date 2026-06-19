"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDaml } from "@/components/daml/DamlProvider";
import { ErrorBoundary } from "@/components/daml/ErrorBoundary";
import { PartyConnect } from "@/components/daml/PartyConnect";
import { InvestorPanel } from "@/components/daml/flows/InvestorPanel";
import { WorkerPanel } from "@/components/daml/flows/WorkerPanel";
import { AgentPanel } from "@/components/daml/flows/AgentPanel";
import { damlConfig } from "@/lib/daml/config";

function Dapp() {
  const { session } = useDaml();

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-shell px-5 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary transition-colors hover:text-text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-lg font-semibold tracking-tight">Verdix Protocol Console</span>
          <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-text-secondary sm:inline">
            Canton · {damlConfig.httpBaseUrl}
          </span>
        </div>
      </header>

      <div className="mb-8 max-w-md">
        <PartyConnect />
      </div>

      {!session ? (
        <div className="glass max-w-2xl rounded-2xl p-6">
          <h2 className="mb-2 text-lg font-semibold">Connect a party to begin</h2>
          <p className="text-sm text-text-secondary">
            Authenticate as an Investor, Worker, or AI Agent party. Every action below executes a
            real <span className="text-text-primary">create</span> or{" "}
            <span className="text-text-primary">exercise</span> command against the deployed Vindex
            Daml contracts on the participant, and all dashboards stream live from the ledger.
          </p>
        </div>
      ) : (
        <ErrorBoundary>
          {session.role === "investor" && <InvestorPanel />}
          {session.role === "worker" && <WorkerPanel />}
          {session.role === "agent" && <AgentPanel />}
        </ErrorBoundary>
      )}
    </main>
  );
}

export default function ProtocolConsole() {
  return <Dapp />;
}

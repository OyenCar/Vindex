"use client";

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
    <main className="relative mx-auto min-h-screen w-full max-w-shell px-5 py-10 sm:px-8">
      <header className="mb-8">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#10B981]" />
          Live on Canton · {damlConfig.httpBaseUrl}
        </span>
        <h1
          className="mt-5 font-display font-black tracking-tightest text-text-primary"
          style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", lineHeight: 1.02 }}
        >
          Protocol <span className="text-gradient-animated">Console</span>
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-text-secondary">
          Connect as an Investor, Worker, or AI Agent. Every action runs a real Daml command on the
          participant — and every panel streams live from the ledger.
        </p>
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

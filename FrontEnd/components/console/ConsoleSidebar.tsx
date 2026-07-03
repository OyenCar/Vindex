"use client";

import { useState } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { Check, Copy } from "lucide-react";

export function ConsoleSidebar() {
  const { session, online } = useDaml();
  const [copied, setCopied] = useState(false);

  const postings = useStreamQueries(Vindex.ProjectPosting);
  const projects = useStreamQueries(Vindex.Project);
  const proposals = useStreamQueries(Vindex.GovernanceProposal);
  const reviews = useStreamQueries(Vindex.MilestoneReview);

  if (!session) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.party);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleText: Record<string, string> = {
    investor: "Investor",
    worker: "Worker",
    agent: "AI Agent",
  };

  const ledgerStats = [
    { label: "Postings", value: postings.contracts.length },
    { label: "Projects", value: projects.contracts.length },
    { label: "Reviews", value: reviews.contracts.length },
    { label: "Proposals", value: proposals.contracts.length },
  ];

  return (
    <aside className="brutal-card flex flex-col gap-4 p-5 lg:sticky lg:top-14 h-fit">
      {/* Connected identity */}
      <div className="flex flex-col gap-2 border-b-2 border-[var(--border-light)] pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-muted)]">Identity</span>
          <span className={`status-dot ${online ? "bg-[var(--success)]" : "bg-[var(--text-muted)]"}`} />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">{roleText[session.role] || session.role}</div>
          <div className="flex items-center gap-1.5 border-2 border-[var(--border-light)] px-2 py-1.5 font-mono text-[10px] text-[var(--text-muted)]">
            <span className="truncate flex-1" title={session.party}>{session.party}</span>
            <button onClick={handleCopy} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Ledger Stats */}
      <div className="flex flex-col gap-2 border-b-2 border-[var(--border-light)] pb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-muted)]">Ledger</span>
        <div className="grid grid-cols-2 gap-2">
          {ledgerStats.map((s) => (
            <div key={s.label} className="flex flex-col border-2 border-[var(--border-light)] p-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{s.label}</span>
              <span className="font-mono text-base font-black text-[var(--text-primary)] mt-0.5">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network info */}
      <div className="flex flex-col gap-1.5 text-[11px]">
        {[
          ["Escrow", "Non-custodial"],
          ["Agent", "Claude 3.5 Sonnet"],
          ["Consensus", "Canton Sync"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-[var(--text-muted)] uppercase font-bold tracking-wider text-[10px]">{k}</span>
            <span className="text-[var(--text-primary)] font-mono text-[11px]">{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

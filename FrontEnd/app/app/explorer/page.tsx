"use client";

import Link from "next/link";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { StatusBadge } from "@/components/daml/StatusBadge";
import { 
  Users, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  Vote, 
  Lock, 
  Coins,
  ArrowRight,
  TrendingUp,
  Activity,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bg: string;
}

function Stat({ label, value, icon: Icon, color, bg }: StatProps) {
  return (
    <div className={cn("glass flex items-center justify-between gap-3 rounded-2xl p-4 transition-all hover:scale-[1.02]", bg)}>
      <div className="flex flex-col gap-0.5">
        <span className={cn("font-display text-xl font-bold tabular-nums", color)}>{value}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">{label}</span>
      </div>
      <Icon className={cn("h-5 w-5 shrink-0 opacity-80", color)} />
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("glass overflow-hidden rounded-2xl flex flex-col justify-between", className)}>
      <div>
        <h3 className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-primary bg-white/[0.01]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-soft shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
          {title}
        </h3>
        <div className="divide-y divide-white/[0.04]">{children}</div>
      </div>
    </section>
  );
}

function Row({ left, right, subtitle }: { left: React.ReactNode; right: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] hover:bg-white/[0.01] transition-colors">
      <div className="flex flex-col min-w-0">
        <span className="min-w-0 truncate text-text-primary font-medium">{left}</span>
        {subtitle && <span className="text-[10px] text-text-secondary truncate font-mono mt-0.5">{subtitle}</span>}
      </div>
      <span className="shrink-0 font-mono text-text-primary text-xs">{right}</span>
    </div>
  );
}

export default function Explorer() {
  const { session } = useDaml();

  const parties = useStreamQueries(Vindex.InvestorParty);
  const postings = useStreamQueries(Vindex.ProjectPosting);
  const proposals = useStreamQueries(Vindex.GovernanceProposal);
  const projects = useStreamQueries(Vindex.Project);
  const reviews = useStreamQueries(Vindex.MilestoneReview);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);

  if (!session) {
    return (
      <main className="mx-auto max-w-shell px-5 py-12 sm:px-8">
        <div className="glass max-w-md rounded-2xl p-6">
          <h2 className="mb-2 text-lg font-semibold">Connect a party</h2>
          <p className="mb-4 text-sm text-text-secondary leading-relaxed">
            The explorer streams live contracts visible to your party. Please authenticate first.
          </p>
          <Link href="/app" className="text-sm font-semibold text-accent-soft hover:underline flex items-center gap-1">
            Go to the console to connect
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const totalLocked = vaults.contracts.reduce((s, v) => s + Number(v.payload.amount), 0);

  const stats = [
    { label: "Investors", value: parties.contracts.length, icon: Users, color: "text-violet-400", bg: "bg-violet-500/5 border-violet-500/10" },
    { label: "Postings", value: postings.contracts.length, icon: FileText, color: "text-sky-400", bg: "bg-sky-500/5 border-sky-500/10" },
    { label: "Projects", value: projects.contracts.length, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
    { label: "Open Reviews", value: reviews.contracts.length, icon: CheckSquare, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
    { label: "Proposals", value: proposals.contracts.length, icon: Vote, color: "text-pink-400", bg: "bg-pink-500/5 border-pink-500/10" },
    { label: "Vaults Count", value: vaults.contracts.length, icon: Lock, color: "text-teal-400", bg: "bg-teal-500/5 border-teal-500/10" },
    { label: "Locked Value", value: totalLocked.toFixed(0), icon: Coins, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/10" },
  ];

  return (
    <main className="mx-auto max-w-shell px-5 py-6 sm:px-8">
      {/* Compact breadcrumb header for dense layout */}
      <div className="mb-4 flex items-center justify-between text-[11px] text-text-secondary border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-success animate-glow-pulse" />
          <span>Live Ledger Transparency Protocol</span>
        </div>
        <span className="font-mono text-text-primary/70">Party: {session.party.slice(0, 16)}…</span>
      </div>

      {/* 7-column stat cards row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      {/* 3-column grids to optimize density */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Col 1 */}
        <div className="flex flex-col gap-4">
          <Section title="Projects & Milestones">
            {projects.contracts.length === 0 ? (
              <Row left="No active projects" right="—" />
            ) : (
              projects.contracts.map((p) => (
                <Row
                  key={p.contractId}
                  left={`Milestone ${Number(p.payload.currentIndex) + 1}/${p.payload.milestones.length}`}
                  subtitle={`Submissions: ${p.payload.submissionCount}`}
                  right={<StatusBadge status={p.payload.status} />}
                />
              ))
            )}
          </Section>

          <Section title="AI Disputes & Arbitration">
            {projects.contracts.filter((p) => p.payload.status === "RejPending").length === 0 ? (
              <Row left="No active disputes" right="—" />
            ) : (
              projects.contracts
                .filter((p) => p.payload.status === "RejPending")
                .map((p) => (
                  <Row
                    key={p.contractId}
                    left={`Awaiting ruling on M${Number(p.payload.currentIndex) + 1}`}
                    subtitle={`Contract: ${p.contractId.slice(0, 12)}…`}
                    right={`${(p.payload.rejectionReasons ?? []).length} reason(s)`}
                  />
                ))
            )}
          </Section>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col gap-4">
          <Section title="Vaults & Locking Ledger">
            {vaults.contracts.length === 0 ? (
              <Row left="No vaults" right="—" />
            ) : (
              vaults.contracts.map((v) => (
                <Row 
                  key={v.contractId} 
                  left={v.payload.vaultType} 
                  subtitle={`ID: ${v.contractId.slice(0, 14)}…`}
                  right={v.payload.amount} 
                />
              ))
            )}
          </Section>

          <Section title="Milestone Reviews">
            {reviews.contracts.length === 0 ? (
              <Row left="No open reviews" right="—" />
            ) : (
              reviews.contracts.map((r) => (
                <Row
                  key={r.contractId}
                  left={`Milestone ${Number(r.payload.milestoneIndex) + 1}`}
                  subtitle={`Cycle ${r.payload.cycle} review process`}
                  right={`${r.payload.votes.length} vote(s)`}
                />
              ))
            )}
          </Section>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col gap-4">
          <Section title="Governance Decisions">
            {proposals.contracts.length === 0 ? (
              <Row left="No proposals" right="—" />
            ) : (
              proposals.contracts.map((p) => (
                <Row
                  key={p.contractId}
                  left={p.payload.purpose}
                  subtitle={`ID: ${p.contractId.slice(0, 12)}…`}
                  right={`${p.payload.votes.length} vote(s)`}
                />
              ))
            )}
          </Section>

          <Section title="Settlements History">
            {settlements.contracts.length === 0 ? (
              <Row left="No settlements" right="—" />
            ) : (
              settlements.contracts.map((s) => (
                <Row 
                  key={s.contractId} 
                  left={s.payload.reason} 
                  subtitle={`Vault closed`}
                  right={`paid ${s.payload.totalPaidOut}`} 
                />
              ))
            )}
          </Section>
        </div>
      </div>
    </main>
  );
}

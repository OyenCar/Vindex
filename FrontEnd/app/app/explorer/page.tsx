"use client";

import Link from "next/link";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { Vindex } from "@/lib/daml/vindex";
import { StatusBadge } from "@/components/daml/StatusBadge";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-gradient font-display text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-text-secondary">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass overflow-hidden rounded-2xl">
      <h3 className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 text-sm font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-soft shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
        {title}
      </h3>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </section>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
      <span className="min-w-0 truncate text-text-secondary">{left}</span>
      <span className="shrink-0 font-mono text-text-primary">{right}</span>
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
          <p className="mb-4 text-sm text-text-secondary">
            The explorer streams live contracts visible to your party.
          </p>
          <Link href="/app" className="text-sm text-accent-soft hover:underline">
            → Go to the console to connect
          </Link>
        </div>
      </main>
    );
  }

  const totalLocked = vaults.contracts.reduce((s, v) => s + Number(v.payload.amount), 0);

  return (
    <main className="mx-auto max-w-shell px-5 py-10 sm:px-8">
      <header className="mb-8">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_#10B981] animate-glow-pulse" />
          Live transparency layer
        </span>
        <h1
          className="mt-5 font-display font-black tracking-tightest text-text-primary"
          style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", lineHeight: 1.02 }}
        >
          Live <span className="text-gradient-animated">Explorer</span>
        </h1>
        <p className="mt-3 text-[13px] text-text-secondary">
          Streaming from the participant · party{" "}
          <span className="font-mono text-text-primary/80">{session.party}</span>
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Investor Parties" value={parties.contracts.length} />
        <Stat label="Postings" value={postings.contracts.length} />
        <Stat label="Projects" value={projects.contracts.length} />
        <Stat label="Open Reviews" value={reviews.contracts.length} />
        <Stat label="Proposals" value={proposals.contracts.length} />
        <Stat label="Vaults" value={vaults.contracts.length} />
        <Stat label="Locked Value" value={totalLocked.toFixed(0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Projects & Milestones">
          {projects.contracts.length === 0 ? (
            <Row left="No projects" right="—" />
          ) : (
            projects.contracts.map((p) => (
              <Row
                key={p.contractId}
                left={`Milestone ${Number(p.payload.currentIndex) + 1}/${p.payload.milestones.length} · sub ${p.payload.submissionCount}`}
                right={<StatusBadge status={p.payload.status} />}
              />
            ))
          )}
        </Section>

        <Section title="Escrow / Commitment / Agent Vaults">
          {vaults.contracts.length === 0 ? (
            <Row left="No vaults" right="—" />
          ) : (
            vaults.contracts.map((v) => (
              <Row key={v.contractId} left={v.payload.vaultType} right={v.payload.amount} />
            ))
          )}
        </Section>

        <Section title="Governance Activity">
          {proposals.contracts.length === 0 ? (
            <Row left="No proposals" right="—" />
          ) : (
            proposals.contracts.map((p) => (
              <Row
                key={p.contractId}
                left={p.payload.purpose}
                right={`${p.payload.votes.length} vote(s)`}
              />
            ))
          )}
        </Section>

        <Section title="Milestone Reviews (voting)">
          {reviews.contracts.length === 0 ? (
            <Row left="No open reviews" right="—" />
          ) : (
            reviews.contracts.map((r) => (
              <Row
                key={r.contractId}
                left={`Milestone ${Number(r.payload.milestoneIndex) + 1} · cycle ${r.payload.cycle}`}
                right={`${r.payload.votes.length} vote(s)`}
              />
            ))
          )}
        </Section>

        <Section title="AI Decisions / Disputes">
          {projects.contracts.filter((p) => p.payload.status === "RejPending").length === 0 ? (
            <Row left="No active disputes" right="—" />
          ) : (
            projects.contracts
              .filter((p) => p.payload.status === "RejPending")
              .map((p) => (
                <Row
                  key={p.contractId}
                  left={`Awaiting AI verdict · M${Number(p.payload.currentIndex) + 1}`}
                  right={(p.payload.rejectionReasons ?? []).length + " reason(s)"}
                />
              ))
          )}
        </Section>

        <Section title="Settlements (completed / stopped)">
          {settlements.contracts.length === 0 ? (
            <Row left="No settlements yet" right="—" />
          ) : (
            settlements.contracts.map((s) => (
              <Row key={s.contractId} left={s.payload.reason} right={`paid ${s.payload.totalPaidOut}`} />
            ))
          )}
        </Section>
      </div>
    </main>
  );
}

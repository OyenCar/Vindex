"use client";

import { useState, useEffect, useRef } from "react";
import { useDaml } from "@/components/daml/DamlProvider";
import { useStreamQueries } from "@/lib/daml/useStreamQueries";
import { useCommand } from "@/lib/daml/useCommand";
import { TxStatus } from "@/components/daml/TxStatus";
import { FileUpload } from "@/components/daml/FileUpload";
import { Button } from "@/components/ui/button";
import { damlConfig } from "@/lib/daml/config";
import { ipfsUrl } from "@/lib/daml/storage";
import { Vindex, num, hours, STATUS_LABEL } from "@/lib/daml/vindex";
import { cn } from "@/lib/utils";
import { Info, Settings, ShieldAlert, Award, ChevronDown, ChevronUp, Cpu, Loader2 } from "lucide-react";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="brutal-input"
      />
    </label>
  );
}

/** Number-only field that rejects negative and zero values with inline feedback. */
function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const parsed = Number(value);
  const hasInput = value.trim().length > 0;
  const isValid = hasInput && Number.isFinite(parsed) && parsed > 0;
  const showError = hasInput && !isValid;
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <input
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || /^\d*\.?\d*$/.test(raw)) onChange(raw);
        }}
        placeholder={placeholder}
        inputMode="decimal"
        className={cn(
          "brutal-input",
          showError && "border-[var(--danger)] focus:shadow-[2px_2px_0px_var(--danger)]",
        )}
      />
      {showError && (
        <span className="text-[10px] font-bold text-[var(--danger)]">MUST BE {'>'} 0</span>
      )}
    </label>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("brutal-card flex flex-col gap-3 p-5", className)}>
      <h3 className="text-[13px] font-black uppercase tracking-wider text-[var(--text-primary)] font-display">{title}</h3>
      {children}
    </section>
  );
}

// ─── AI Audit Section ────────────────────────────────────────────────────────

interface AiVerdict {
  rejectionValid: boolean;
  confidence: number;
  summary: string;
  checklist?: { item: string; met: boolean; evidence: string }[];
  rejectionAssessment?: { reason: string; justified: boolean; note: string }[];
}

function AiAuditSection({
  project,
  milestoneIndex,
  milestoneSpec,
  aiProvider,
  aiKey,
  onResolveStale,
}: {
  project: any;
  milestoneIndex: number;
  milestoneSpec: any;
  aiProvider?: string;
  aiKey?: string;
  onResolveStale?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<AiVerdict | null>(null);

  const storageKey = `vindex:verdict:${project.payload.briefUri || project.payload.requirements}-${milestoneIndex}`;

  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setVerdict(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }
  }, [storageKey]);

  // Runs the AI AND commits Project.AgentVerdict on-ledger via /api/auto-arbitrate (NOT the
  // display-only /api/agent-verdict). This is what actually RELEASES the worker's payment when the
  // verdict is UNJUSTIFIED — the old path only printed "Release payout" text but moved no money.
  // This panel shows only while the milestone is RejPending, so it also serves as a retry if the
  // reject-time auto-arbitration failed.
  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auto-arbitrate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectCid: project.contractId,
          agentParty: project.payload.agent,
          todoText: project.payload.requirements,
          todoUri: project.payload.briefUri,
          submissionUri: project.payload.currentSubmissionUri || null,
          rejectionReasons: project.payload.rejectionReasons || ["Deliverable needs verification"],
          milestoneIndex,
          totalMilestones: project.payload.milestones.length,
          milestoneSpec,
          aiProvider,
          aiKey: aiKey?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI arbitration failed");
      }
      setVerdict(data.verdict);
      localStorage.setItem(storageKey, JSON.stringify(data.verdict));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Auto-enforce ONCE per project contract: while a milestone is stuck in RejPending with no
  // verdict yet, run the arbiter automatically (commits the verdict on-ledger → releases the
  // worker's payment when unjustified) with NO investor click. Guarded per contractId and delayed
  // so it never races the reject-time arbitration; the timer is cleared on unmount — i.e. as soon
  // as the dispute resolves and this panel disappears, so it can't double-fire.
  const autoEnforcedCid = useRef<string | null>(null);
  useEffect(() => {
    if (project.payload.status !== "RejPending") return;
    if (verdict || loading) return;
    if (autoEnforcedCid.current === project.contractId) return;
    autoEnforcedCid.current = project.contractId;
    const t = setTimeout(() => { void runAudit(); }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.contractId, project.payload.status]);

  return (
    <div className="mt-2 border-t border-white/5 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] text-accent-soft hover:text-white transition-colors cursor-pointer outline-none select-none"
      >
        <Cpu className="h-3.5 w-3.5" />
        <span>AI Arbitration / Audit</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 p-2.5 rounded-lg border border-white/5 bg-black/10 flex flex-col gap-2">
          {verdict ? (
            <div className="flex flex-col gap-2">
              <div className={cn(
                "p-2 rounded border text-[11px]",
                verdict.rejectionValid
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              )}>
                <p className="font-bold uppercase tracking-wider text-[9px] mb-0.5">
                  AI Verdict ({Math.round(verdict.confidence * 100)}% confidence)
                </p>
                <p className="font-semibold mb-1">
                  {verdict.rejectionValid
                    ? "REJECTION JUSTIFIED → Work revision required."
                    : "REJECTION UNJUSTIFIED → Release payout / pass milestone."}
                </p>
                <p className="text-[10px] text-text-secondary leading-relaxed">{verdict.summary}</p>
              </div>

              {verdict.checklist && verdict.checklist.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">Requirements Checklist:</span>
                  <ul className="flex flex-col gap-1">
                    {verdict.checklist.map((item, idx) => (
                      <li key={idx} className="text-[10px] flex items-start gap-1.5 bg-white/[0.01] p-1.5 rounded">
                        <span className={item.met ? "text-emerald-400 font-bold shrink-0" : "text-amber-400 font-bold shrink-0"}>
                          {item.met ? "✓" : "✗"}
                        </span>
                        <div className="flex-1">
                          <p className="text-text-primary font-medium">{item.item}</p>
                          <p className="text-text-secondary text-[9px] leading-normal">{item.evidence}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-[11px] text-text-secondary mb-2">
                No verdict yet. Run the AI arbiter — it rules on the dispute and enforces the result
                on-ledger (unjustified → releases the worker&apos;s payment).
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={runAudit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] h-7"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Arbitrating &amp; enforcing…
                  </>
                ) : (
                  "Run AI Arbitration & Enforce"
                )}
              </Button>
            </div>
          )}

          {error && (
            <p className="text-[10px] text-red-400 font-medium">⚠️ Error: {error}</p>
          )}

          {/* BYOK liveness fallback: if the Agent never ruled before the verdict deadline, the
              investor (or worker) can force the milestone to auto-accept and pay the worker. */}
          {onResolveStale && project.payload.agentVerdictDeadline &&
            new Date(project.payload.agentVerdictDeadline).getTime() < Date.now() && (
              <div className="mt-1 flex flex-col gap-1 border-t border-white/5 pt-2">
                <p className="text-[10px] text-amber-300">
                  Verdict overdue — the Agent never ruled. Release the milestone to the worker
                  (an unsubstantiated rejection loses).
                </p>
                <Button size="sm" variant="secondary" onClick={onResolveStale} className="w-full text-[11px] h-7">
                  Release to worker (verdict overdue)
                </Button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const INVESTOR_TABS = [
  { id: "post", label: "Post Job" },
  { id: "monitor", label: "Monitor" },
] as const;

type InvestorTab = "setup" | "post" | "monitor";

function TabBar({
  active,
  onChange,
  badges,
}: {
  active: InvestorTab;
  onChange: (t: InvestorTab) => void;
  badges?: Partial<Record<InvestorTab, number>>;
}) {
  return (
    <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-full border border-[var(--border-light)] max-w-fit">
      {INVESTOR_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer flex items-center justify-center gap-1.5",
            active === t.id
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5",
          )}
        >
          {t.label}
          {badges?.[t.id] ? (
            <span className={cn(
              "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-black",
              active === t.id ? "bg-white text-[var(--accent)]" : "bg-[var(--accent)] text-white"
            )}>
              {badges[t.id]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Setup Tab ────────────────────────────────────────────────────────────────

function SetupTab({
  myParty,
  newPartyMode,
  agent,
  setAgent,
  budget,
  setBudget,
  aiProvider,
  setAiProvider,
  aiKey,
  setAiKey,
  createParty,
  createCmd,
  setNewPartyMode,
}: any) {
  const budgetOk = Number(budget) > 0;
  const formReady = agent.trim().length > 0 && budgetOk;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Setup form or active party details */}
      <div className="flex flex-col gap-4">
        {!myParty || newPartyMode ? (
          <Card title="Create Investor Party">
            <p className="text-[12px] text-[var(--text-secondary)]">
              Each project is its own Investor Party (a fresh funding pool + governance group).
            </p>

            <div className="border-2 border-[var(--accent)] bg-[var(--accent-muted)] p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-[12px] font-black uppercase tracking-wider text-[var(--text-primary)]">AI Governance Agent</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Assign the AI Agent that will arbitrate disputes. Required before posting.
              </p>
              <Field label="Agent party ID" value={agent} onChange={setAgent} placeholder="Agent::1220…" />
            </div>

            <NumField label="Budget funding" value={budget} onChange={setBudget} placeholder="e.g. 4000" />

            {/* BYOK: the investor brings their own AI provider key. Session-only; used server-side
                for a single arbitration call and never written on-ledger. */}
            <div className="border-2 border-[var(--border-light)] p-3.5 flex flex-col gap-2 rounded-xl">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--text-primary)]">
                Arbiter AI Key (BYOK)
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Bring your own model key — it pays for disputes you escalate. Session-only, never stored.
              </p>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Provider</span>
                <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)} className="brutal-input">
                  <option value="groq">Groq</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </label>
              <Field label="API key" value={aiKey} onChange={setAiKey} placeholder="optional; falls back to server key" />
            </div>
            <Button onClick={createParty} disabled={!formReady || createCmd.phase === "submitting"}>
              Create Investor Party
            </Button>
            {myParty && (
              <Button variant="ghost" size="sm" onClick={() => setNewPartyMode(false)}>
                Cancel
              </Button>
            )}
            <TxStatus status={createCmd} />
          </Card>
        ) : (
          <Card title="Investor Party Details">
            <div className="border-2 border-[var(--success)] bg-[var(--success)]/10 px-4 py-3">
              <p className="text-[12px] text-[var(--success)] font-black uppercase tracking-wider">✓ Party Active</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {myParty.payload.members.length} member(s) · Agent:{" "}
                <span className="font-mono text-[var(--text-primary)] text-[10px]">{myParty.payload.agent}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNewPartyMode(true)}>
              + New Project
            </Button>
          </Card>
        )}
      </div>

      {/* Right Col: Setup Instructions */}
      <Card title="Investor Guide">
        <div className="flex flex-col gap-3 text-[12px] text-text-secondary leading-relaxed">
          <div className="flex gap-2">
            <Settings className="h-4 w-4 text-accent-soft shrink-0" />
            <p>Define project parameters and deploy a specialized multi-sig governance party.</p>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
            <h4 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">Setup Checklist:</h4>
            <ul className="flex flex-col gap-2 list-disc pl-4 text-[11px]">
              <li><span className="text-text-primary font-medium">Configure the AI Agent</span> — required for automated dispute resolution.</li>
              <li>Provide budget funding to cover milestones.</li>
              <li>Bring your own AI key — you pay only for disputes you escalate.</li>
              <li>Setup is on-ledger, giving finality of governance rules.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Post Job Tab ─────────────────────────────────────────────────────────────

function PostTab({
  myParty,
  myPostings,
  applications,
  requirements,
  setRequirements,
  briefCid,
  setBriefCid,
  isOpenPool,
  setIsOpenPool,
  workers,
  newWorkerInput,
  setNewWorkerInput,
  addWorker,
  removeWorker,
  budget,
  setBudget,
  commitment,
  setCommitment,
  maxRevisions,
  setMaxRevisions,
  fundAndPost,
  postCmd,
  editingPostingCid,
  setEditingPostingCid,
  editingRequirements,
  setEditingRequirements,
  handleEditDescription,
  handleTakeDown,
  selectApplicant,
  selectCmd,
}: any) {
  const budgetNum = Number(budget);
  const budgetValid = Number.isFinite(budgetNum) && budgetNum > 0;
  const commitmentNum = Number(commitment);
  const commitmentValid = Number.isFinite(commitmentNum) && commitmentNum > 0;
  const numbersValid = budgetValid && commitmentValid;

  // Idempotency guard: block re-posting a job whose requirements match an already-active
  // posting. Stops the "spam Fund Vaults & Post Job" duplicate flood. myPostings is the live
  // set of active ProjectPosting contracts, so a taken-down/archived posting frees the text.
  const trimmedReq = (requirements ?? "").trim();
  const dupPosting =
    trimmedReq.length > 0 &&
    Array.isArray(myPostings) &&
    myPostings.some((p: any) => ((p?.payload?.requirements ?? "") as string).trim() === trimmedReq);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
      {/* Left Col: Setup vaults and post job */}
      <div className="flex flex-col gap-4">
        {myParty ? (
          <Card title="Fund Vaults &amp; Publish Job">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-secondary">Project description</span>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={2}
                className="brutal-input font-sans"
              />
            </label>
            <FileUpload label="Project brief / reference files (→ IPFS)" cid={briefCid} onUploaded={setBriefCid} />

            {/* Posting mode toggle */}
            <div className="flex justify-between items-center border-2 border-[var(--border-light)] p-3 rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)]">Posting Mode</span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {isOpenPool
                    ? "Open Pool — visible to all Worker parties"
                    : "Invite Only — only listed workers can apply"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenPool(!isOpenPool)}
                className={`relative flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOpenPool ? "bg-[var(--accent)]" : "bg-black/15 dark:bg-white/15"
                }`}
                role="switch"
                aria-checked={isOpenPool}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOpenPool ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Worker pool */}
            {!isOpenPool && (
              <div className="border-2 border-[var(--border-light)] p-3 flex flex-col gap-2 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-text-primary font-medium">
                    Invited Workers
                  </span>
                  <span className="text-[11px] text-text-secondary">{workers.length} added</span>
                </div>
                {workers.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {workers.map((w: string) => (
                      <li key={w} className="flex justify-between items-center gap-2 rounded bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--border-light)] px-2 py-1 text-[11px] font-mono">
                        <span className="truncate text-text-secondary" title={w}>{w}</span>
                        <button
                          type="button"
                          onClick={() => removeWorker(w)}
                          className="text-text-secondary hover:text-red-400 transition-colors px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-amber-300">
                    Invite Only is active — add at least one worker party below so they can see and apply to this job.
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  <input
                    value={newWorkerInput}
                    onChange={(e) => setNewWorkerInput(e.target.value)}
                    placeholder="Worker::1220..."
                    className="flex-1 rounded border border-[var(--border-light)] bg-black/[0.02] dark:bg-white/[0.03] px-2 py-1.5 text-[12px] text-text-primary outline-none focus:border-accent/50 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addWorker(); }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addWorker}>Add</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <NumField label="Budget envelope (cap)" value={budget} onChange={setBudget} placeholder="e.g. 4000" />
              <NumField label="Required worker stake" value={commitment} onChange={setCommitment} placeholder="e.g. 500" />
            </div>
            <NumField label="Max revision rounds (ceiling)" value={maxRevisions} onChange={setMaxRevisions} placeholder="e.g. 3" />
            <p className="text-[11px] text-text-secondary">
              You fund the budget <span className="text-text-primary">envelope</span>, set the worker
              stake, and cap how many revision rounds the worker may propose. After you select a worker,
              they draft the milestone plan (bounded by your ceiling) for you to approve.
            </p>
            <Button
              onClick={fundAndPost}
              disabled={postCmd.phase === "submitting" || !numbersValid || dupPosting || (!isOpenPool && workers.length === 0)}
            >
              Fund Vaults &amp; Post Job
            </Button>
            {dupPosting && (
              <p className="text-[11px] text-amber-300">
                You already have an active posting with these requirements. Edit the description, or
                take down the existing posting before posting again.
              </p>
            )}
            <TxStatus status={postCmd} />
          </Card>
        ) : (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-[13px] text-text-secondary">
              Go to the <span className="text-text-primary font-medium">Setup</span> tab to create an Investor Party first.
            </p>
          </div>
        )}
      </div>

      {/* Right Col: Active Job Postings & Applicants list */}
      <div className="flex flex-col gap-4">
        <Card title="Active Postings & Applicants">
          {myPostings.length === 0 ? (
            <p className="text-[12px] text-text-secondary leading-relaxed">
              No active job postings. Publish a job on the left to start collecting worker applications.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {myPostings.map((post: any) => {
                const isEditing = editingPostingCid === post.contractId;
                const openApplications = applications.contracts.filter(
                  (a: any) => a.payload.postingCid === post.contractId,
                );
                return (
                  <div key={post.contractId} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.01] p-3.5">
                    <div>
                      <span className="text-[11px] text-text-secondary block mb-1">Requirements:</span>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingRequirements}
                            onChange={(e) => setEditingRequirements(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50 font-sans"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditDescription(post.contractId, editingRequirements)} disabled={postCmd.phase === "submitting"}>
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingPostingCid(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-[12px] text-text-primary bg-white/[0.02] border border-white/5 rounded-lg p-2 whitespace-pre-wrap">
                            {post.payload.requirements}
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => { setEditingRequirements(post.payload.requirements); setEditingPostingCid(post.contractId); }}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-text-secondary border-t border-white/5 pt-2">
                      <div className="flex justify-between">
                        <span>Required Stake:</span>
                        <span className="font-mono text-text-primary font-semibold">{post.payload.commitmentRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recruitment Mode:</span>
                        <span className="text-text-primary font-semibold">
                          {post.payload.recruitmentMode === "OPEN_POOL" ? "Open Pool" : "Invite Only"}
                        </span>
                      </div>
                    </div>

                    {/* Applicants */}
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-[11px] text-text-secondary block mb-1.5 font-semibold">Applicants:</span>
                      {openApplications.length === 0 ? (
                        <p className="text-[11px] text-text-secondary italic">No applicants yet.</p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {openApplications.map((a: any) => (
                            <li key={a.contractId} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-[11px]">
                              <div className="flex flex-col">
                                <span className="font-mono text-text-secondary truncate" title={a.payload.applicant}>
                                  {a.payload.applicant}
                                </span>
                                {ipfsUrl(a.payload.presentationUri) ? (
                                  <a href={ipfsUrl(a.payload.presentationUri)!} target="_blank" rel="noreferrer" className="text-[10px] text-accent-soft hover:underline mt-0.5">
                                    View portfolio ↗
                                  </a>
                                ) : (
                                  a.payload.contactLink && (
                                    <span className="truncate text-[10px] text-text-secondary mt-0.5">{a.payload.contactLink}</span>
                                  )
                                )}
                              </div>
                              <Button size="sm" className="w-full mt-1" onClick={() => selectApplicant(a)} disabled={selectCmd.phase === "submitting"}>
                                Select &amp; Offer
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-2 mt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                        onClick={() => handleTakeDown(post.contractId)}
                        disabled={postCmd.phase === "submitting"}
                      >
                        Archive Posting
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <TxStatus status={selectCmd} />
        </Card>
      </div>
    </div>
  );
}

// ─── Monitor Tab ──────────────────────────────────────────────────────────────

function MonitorTab({
  myVaults,
  vaults,
  myReviews,
  myProjects,
  mySettlements,
  reasonsText,
  setReasonsText,
  submissionPaste,
  setSubmissionPaste,
  voteCmd,
  acceptSubmission,
  rejectSubmission,
  autoArbitrateStatus,
  autoArbitrateError,
  autoArbitrateVerdict,
  aiProvider,
  aiKey,
  resolveStale,
  // SOW plan approvals sub section parameters:
  myMandates = [],
  myPlans = [],
  planCmd = { phase: "idle" },
  approvePlan,
  rejectPlan,
  planRequired,
}: any) {
  const hasActivePlans = myMandates.length > 0 || myPlans.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: SOW approvals, Milestone Reviews & Projects status */}
      <div className="flex flex-col gap-4">
        {/* Subsection: Statement of Work (SOW) Approvals */}
        {hasActivePlans && (
          <Card title="Worker SOW Approvals">
            <ul className="flex flex-col gap-3">
              {myMandates.map((m: any) => (
                <li key={m.contractId} className="rounded-lg border border-white/8 px-3 py-2 text-[12px] text-text-secondary">
                  Worker selected — waiting for{" "}
                  <span className="font-mono text-text-primary">{m.payload.worker}</span> to submit a plan…
                </li>
              ))}
              {myPlans.map((pl: any) => {
                const required = planRequired ? planRequired(pl) : 0;
                return (
                  <li key={pl.contractId} className="flex flex-col gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <p className="text-[12px] text-text-secondary font-medium">
                      Plan from <span className="font-mono text-text-primary">{pl.payload.worker}</span>
                    </p>
                    <ul className="flex flex-col gap-1 text-[12px] border-t border-b border-white/5 py-1.5 my-1">
                      {pl.payload.milestones.map((m: any, i: number) => (
                        <li key={i} className="flex justify-between py-0.5">
                          <span className="text-text-secondary">
                            Milestone {i + 1}{m.isFinal ? " (final)" : ""}
                          </span>
                          <span className="font-mono text-text-primary font-semibold">{m.payment}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-text-secondary">
                      {pl.payload.milestones.length} milestone(s) · max {pl.payload.maxSubmissions} submissions · needs ≥{" "}
                      <span className="text-text-primary font-semibold">{required.toFixed(0)}</span> from the envelope
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Button size="sm" onClick={() => approvePlan(pl)} disabled={planCmd.phase === "submitting"}>
                        Approve &amp; Start
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => rejectPlan(pl)} disabled={planCmd.phase === "submitting"}>
                        Reject &amp; Ask to Revise
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <TxStatus status={planCmd} />
          </Card>
        )}

        {/* Review Submissions */}
        <Card title="Active Milestone Reviews">
          {myReviews.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No open milestone reviews.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {myReviews.map((r: any) => {
                const proj = myProjects.find(
                  (p: any) =>
                    p.payload.status === "Submitted" &&
                    Number(p.payload.currentIndex) === Number(r.payload.milestoneIndex),
                );
                const submissionUrl = proj && ipfsUrl(proj.payload.currentSubmissionUri);
                const busy = voteCmd.phase === "submitting";
                return (
                  <li key={r.contractId} className="rounded-lg border border-white/8 p-3.5">
                    <p className="mb-2 text-[12px] text-text-secondary">
                      Milestone #{Number(r.payload.milestoneIndex) + 1} · cycle {r.payload.cycle} · {r.payload.votes.length} vote(s)
                    </p>
                    {submissionUrl && (
                      <a href={submissionUrl} target="_blank" rel="noreferrer" className="mb-3 inline-block text-[12px] text-accent-soft hover:underline">
                        View submitted deliverable ↗
                      </a>
                    )}
                    {!proj ? (
                      <p className="text-[12px] text-text-secondary">Waiting for worker submission upload…</p>
                    ) : (
                      <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                        <Button size="sm" onClick={() => acceptSubmission(r, proj)} disabled={busy || autoArbitrateStatus === "running"}>
                          Accept &amp; Release Payment
                        </Button>
                        <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                          <span className="text-[11px] text-text-secondary font-medium">
                            Reject &amp; Escalate to AI Agent (one reason per line):
                          </span>
                          <textarea
                            value={reasonsText}
                            onChange={(e) => setReasonsText(e.target.value)}
                            rows={2}
                            placeholder="Reason for rejection…"
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] text-text-primary outline-none focus:border-accent/50 font-sans"
                            disabled={autoArbitrateStatus === "running"}
                          />
                          {(!proj.payload.currentSubmissionUri ||
                            proj.payload.currentSubmissionUri.startsWith("local-")) && (
                            <>
                              <span className="text-[11px] text-amber-300">
                                Deliverable isn&apos;t on IPFS (not pinned) — paste it so the AI can audit it:
                              </span>
                              <textarea
                                value={submissionPaste}
                                onChange={(e) => setSubmissionPaste(e.target.value)}
                                rows={3}
                                placeholder="Paste the worker's deliverable text…"
                                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[12px] text-text-primary outline-none focus:border-accent/50 font-sans"
                                disabled={autoArbitrateStatus === "running"}
                              />
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => rejectSubmission(r, proj)}
                            disabled={busy || autoArbitrateStatus === "running"}
                          >
                            {autoArbitrateStatus === "running" ? "Arbitrating..." : "Reject → Escalate"}
                          </Button>

                          {/* Auto Arbitration Status Messages */}
                          {autoArbitrateStatus === "running" && (
                            <div className="mt-2 text-[11px] text-sky-400 flex items-center gap-1.5 animate-pulse">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                              Running automatic AI audit &amp; arbitration...
                            </div>
                          )}
                          {autoArbitrateStatus === "failed" && autoArbitrateError && (
                            <div className="mt-2 text-[11px] text-red-400 font-medium">
                              ⚠️ Auto-arbitration failed: {autoArbitrateError}
                            </div>
                          )}
                          {autoArbitrateStatus === "done" && autoArbitrateVerdict && (
                            <div className={`mt-2 text-[11px] p-2.5 rounded-lg border ${
                              autoArbitrateVerdict.rejectionValid 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-300" 
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                            }`}>
                              <p className="font-bold uppercase tracking-wider text-[9px] mb-0.5">
                                AI Arbitration Verdict ({Math.round(autoArbitrateVerdict.confidence * 100)}% confidence)
                              </p>
                              <p className="font-semibold mb-1">
                                {autoArbitrateVerdict.rejectionValid 
                                  ? "REJECTION JUSTIFIED → Sent to worker for revision." 
                                  : "REJECTION UNJUSTIFIED → Penalty applied & escrow released to worker!"}
                              </p>
                              <p className="text-[10px] text-text-secondary leading-relaxed">{autoArbitrateVerdict.summary}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <TxStatus status={voteCmd} />
        </Card>

        {/* Projects & Settlements list */}
        <Card title="Projects &amp; Settlements History">
          {myProjects.length === 0 && mySettlements.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No active projects or settlements yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[13px]">
              {myProjects.map((p: any) => {
                const idx = Number(p.payload.currentIndex);
                return (
                  <div key={p.contractId} className="flex flex-col gap-3 rounded-lg border border-white/8 p-3.5 mb-2 bg-white/[0.01]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <p className="text-[12px] font-bold text-text-primary">
                          Project: {p.payload.requirements.slice(0, 50)}{p.payload.requirements.length > 50 ? "..." : ""}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          Milestone {idx + 1}/{p.payload.milestones.length}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold bg-accent-soft/10 text-accent-soft px-2 py-0.5 rounded">
                        {STATUS_LABEL[p.payload.status] ?? p.payload.status}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {p.payload.milestones.map((m: any, i: number) => {
                        const paid = i < idx;
                        const current = i === idx;
                        return (
                          <li key={i} className="flex flex-col gap-1 rounded-lg bg-white/[0.01] border border-white/5 p-3 text-[12px]">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "font-medium",
                                  paid ? "text-success" : current ? "text-accent-soft" : "text-text-secondary"
                                )}
                              >
                                {paid ? "✓ paid" : current ? "▶ current" : "• upcoming"} · Milestone {i + 1}
                                {m.isFinal ? " (final)" : ""}
                              </span>
                              <span className="font-mono text-text-primary font-semibold">{m.payment}</span>
                            </div>

                            {/* AI arbitration only surfaces AFTER the investor rejects: show it on the
                                current milestone only while the dispute is live (RejPending). Not on
                                past/paid milestones, not before a reject. The reject flow itself
                                (rejectSubmission → /api/auto-arbitrate) already runs the AI + commits
                                the verdict automatically; this panel is the read-only view of it. */}
                            {current && p.payload.status === "RejPending" && (
                              <AiAuditSection
                                project={p}
                                milestoneIndex={i}
                                milestoneSpec={m}
                                aiProvider={aiProvider}
                                aiKey={aiKey}
                                onResolveStale={() => resolveStale(p)}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {mySettlements.map((s: any) => (
                <li key={s.contractId} className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-3 py-2">
                  <span className="text-text-secondary font-medium">✅ Settled · {s.payload.reason}</span>
                  <span className="font-mono text-success font-bold">paid {s.payload.totalPaidOut}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Right Col: Escrow Vaults live status */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-20">
        <Card title="Escrow Vaults State">
          {vaults.loading ? (
            <p className="text-[12px] text-text-secondary">Syncing ledger vaults…</p>
          ) : myVaults.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No active escrow vaults.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {myVaults.map((v: any) => (
                <li key={v.contractId} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.01] px-3.5 py-2.5 text-[12.5px]">
                  <span className="text-text-secondary font-medium">{v.payload.vaultType}</span>
                  <span className="font-mono text-text-primary font-bold">{v.payload.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Plan Audit Guidelines Card (merged from SOW guidelines) */}
        {hasActivePlans && (
          <Card title="Plan Audit Guidelines">
            <div className="flex flex-col gap-3 text-[12px] text-[var(--text-secondary)] leading-relaxed">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <p>Review the SOW proposal. Your approval locks the escrow vault and starts the project.</p>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[var(--border-light)] pt-3">
                <h4 className="font-semibold text-[var(--text-primary)] text-[11px] uppercase tracking-wider">Review Steps:</h4>
                <ul className="flex flex-col gap-2 list-disc pl-4 text-[11px]">
                  <li>Validate the milestone count against project requirements.</li>
                  <li>Ensure the sum matches the agreed freelance terms.</li>
                  <li>Approval creates the live project contract instantly on Canton.</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Extra Audit Badge */}
        <Card title="Secured Vaults">
          <div className="flex flex-col gap-2 text-[11px] text-text-secondary leading-relaxed">
            <div className="flex gap-2 items-start">
              <Award className="h-4 w-4 text-emerald-400 shrink-0" />
              <p>Escrow balances are programmatically locked in multi-party Canton contracts. Neither party can unilaterally withdraw funds.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function InvestorPanel() {
  const { session } = useDaml();
  const party = session!.party;

  const parties = useStreamQueries(Vindex.InvestorParty);
  const postings = useStreamQueries(Vindex.ProjectPosting);
  const mandates = useStreamQueries(Vindex.PlanningMandate);
  const plans = useStreamQueries(Vindex.WorkPlan);
  const projects = useStreamQueries(Vindex.Project);
  const reviews = useStreamQueries(Vindex.MilestoneReview);
  const vaults = useStreamQueries(Vindex.AssetVault);
  const settlements = useStreamQueries(Vindex.Settlement);
  const applications = useStreamQueries(Vindex.Application);

  const createCmd = useCommand<unknown>();
  const postCmd = useCommand<unknown>();
  const voteCmd = useCommand<unknown>();
  const selectCmd = useCommand<unknown>();
  const planCmd = useCommand<unknown>();

  const [agent, setAgent] = useState(damlConfig.parties.agent);
  const [budget, setBudget] = useState("4000");
  const [commitment, setCommitment] = useState("500");
  const [maxRevisions, setMaxRevisions] = useState("3");
  // BYOK arbiter (v2): the investor supplies their own AI provider key; it is sent to
  // /api/auto-arbitrate for a single call and is NEVER persisted (session-only state).
  const [aiProvider, setAiProvider] = useState("groq");
  const [aiKey, setAiKey] = useState("");
  const [reasonsText, setReasonsText] = useState("Deliverable does not meet the milestone spec");
  const [submissionPaste, setSubmissionPaste] = useState("");
  const [requirements, setRequirements] = useState("Build the Vindex milestone deliverables");
  const [briefCid, setBriefCid] = useState("");
  const [workers, setWorkers] = useState<string[]>(damlConfig.workerPool);
  const [newWorkerInput, setNewWorkerInput] = useState("");
  const [isOpenPool, setIsOpenPool] = useState(true);
  const [editingPostingCid, setEditingPostingCid] = useState<string | null>(null);
  const [editingRequirements, setEditingRequirements] = useState("");
  const [newPartyMode, setNewPartyMode] = useState(false);
  const [preferredPartyCid, setPreferredPartyCid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InvestorTab>("setup");

  const [autoArbitrateStatus, setAutoArbitrateStatus] = useState<string | null>(null);
  const [autoArbitrateError, setAutoArbitrateError] = useState<string | null>(null);
  const [autoArbitrateVerdict, setAutoArbitrateVerdict] = useState<any | null>(null);

  const addWorker = () => {
    const w = newWorkerInput.trim();
    if (w && !workers.includes(w)) { setWorkers([...workers, w]); setNewWorkerInput(""); }
  };
  const removeWorker = (w: string) => setWorkers(workers.filter((item) => item !== w));

  const myPostings = postings.contracts.filter((p) => p.payload.members.includes(party));
  const myMandates = mandates.contracts.filter((m) => m.payload.members.includes(party));
  const myPlans = plans.contracts.filter((p) => p.payload.members.includes(party));
  const myProjects = projects.contracts.filter((p) => p.payload.members.includes(party));
  const myReviews = reviews.contracts.filter((r) => r.payload.members.includes(party));
  const myVaults = vaults.contracts.filter(
    (v) => v.payload.funders.includes(party) || v.payload.stakeholders.includes(party),
  );
  const mySettlements = settlements.contracts.filter((s) => s.payload.members.includes(party));
  const myParties = parties.contracts.filter((c) => c.payload.members.includes(party));
  const myParty =
    (preferredPartyCid ? myParties.find((c) => c.contractId === preferredPartyCid) : undefined) ||
    myParties[0];

  // Tab badges
  const badges: Partial<Record<InvestorTab, number>> = {};
  const pendingCount = myPlans.length + myReviews.length;
  if (pendingCount > 0) badges.monitor = pendingCount;

  const createParty = () =>
    createCmd
      .run(
        async () => {
          const created = await session!.ledger.create(Vindex.InvestorParty, {
            admin: party,
            members: [party],
            pending: [],
            contributions: [{ investor: party, projectFunding: num(budget), weight: num(1) }],
            config: {
              maxInvestors: num(5),
              votingModel: "SimpleMajority",
              thresholdFraction: num(0.5),
              weighted: false,
              quorumFraction: num(0.5),
              defaultReviewWindow: hours(24),
            },
            agent,
          });
          setPreferredPartyCid(created.contractId);
          setNewPartyMode(false);
          return created;
        },
        { refOf: (r) => (r as { contractId: string }).contractId },
      )
      .catch(() => undefined);

  const fundAndPost = () => {
    if (!myParty) return;
    const postingId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
    postCmd
      .run(
        () =>
          session!.ledger.exercise(Vindex.InvestorParty.SetupAndPost, myParty.contractId, {
            postingId,
            requirements,
            briefUri: briefCid,
            budgetAmount: num(budget),
            commitmentRequired: num(commitment),
            maxRevisions: num(Math.max(1, Math.floor(Number(maxRevisions) || 3))),
            recruitmentMode: isOpenPool ? "OPEN_POOL" : "INVITE_ONLY",
            eligibleWorkers: isOpenPool ? ["Worker::*"] : workers,
            publicParty: damlConfig.parties.public,
          }),
        { refOf: (r) => JSON.stringify((r as unknown[])[0]) },
      )
      .catch(() => undefined);
  };

  const approvePlan = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => session!.ledger.exercise(Vindex.WorkPlan.ApprovePlan, plan.contractId, { actor: party }))
      .catch(() => undefined);

  const rejectPlan = (plan: (typeof plans.contracts)[number]) =>
    planCmd
      .run(() => session!.ledger.exercise(Vindex.WorkPlan.RejectPlan, plan.contractId, { actor: party }))
      .catch(() => undefined);

  const handleEditDescription = (postingCid: any, newRequirements: string) => {
    postCmd
      .run(() =>
        session!.ledger.exercise(Vindex.ProjectPosting.EditPostingDescription, postingCid, {
          actor: party,
          newRequirements,
        }),
      )
      .then(() => setEditingPostingCid(null))
      .catch(() => undefined);
  };

  const handleTakeDown = (postingCid: any) => {
    if (confirm("Are you sure you want to take down this job? This will archive the posting and refund your vaults.")) {
      postCmd
        .run(() => session!.ledger.exercise(Vindex.ProjectPosting.TakeDownPosting, postingCid, { actor: party }))
        .catch(() => undefined);
    }
  };

  const planRequired = (p: (typeof plans.contracts)[number]) =>
    p.payload.milestones.reduce(
      (sum, m) => sum + Number(m.payment) * (1 + Number(m.violationPct)),
      0,
    );

  const acceptSubmission = (
    review: (typeof reviews.contracts)[number],
    proj: (typeof projects.contracts)[number],
  ) =>
    voteCmd
      .run(async () => {
        let reviewCid = review.contractId;
        if (!review.payload.votes.some((v) => v._1 === party)) {
          const [voted] = await session!.ledger.exercise(Vindex.MilestoneReview.CastVote, review.contractId, {
            voter: party,
            vote: "ACCEPT",
          });
          reviewCid = voted;
        }
        return session!.ledger.exercise(Vindex.Project.FinalizeReview, proj.contractId, { actor: party, reviewCid });
      })
      .catch(() => undefined);

  // BYOK liveness fallback: if the Agent never rules within agentVerdictDeadline, any member can
  // force the stalled dispute to auto-accept — the worker is paid (an unsubstantiated rejection loses).
  const resolveStale = (proj: (typeof projects.contracts)[number]) =>
    voteCmd
      .run(() => session!.ledger.exercise(Vindex.Project.ResolveStalePending, proj.contractId, { actor: party }))
      .catch(() => undefined);

  const rejectSubmission = (
    review: (typeof reviews.contracts)[number],
    proj: (typeof projects.contracts)[number],
  ) => {
    setAutoArbitrateStatus("running");
    setAutoArbitrateError(null);
    setAutoArbitrateVerdict(null);

    return voteCmd
      .run(async () => {
        const reasons = reasonsText.split("\n").map((s) => s.trim()).filter(Boolean);
        if (reasons.length === 0) throw new Error("At least one rejection reason is required");
        let reviewCid = review.contractId;
        if (!review.payload.votes.some((v) => v._1 === party)) {
          const [voted] = await session!.ledger.exercise(Vindex.MilestoneReview.CastVote, review.contractId, {
            voter: party,
            vote: "REJECT",
          });
          reviewCid = voted;
        }
        const [withReasons] = await session!.ledger.exercise(Vindex.MilestoneReview.SetRejectionReasons, reviewCid, {
          actor: party,
          reasons,
        });

        // Finalize review (escalates status to RejPending on ledger)
        const [finalizedCidOpt] = await session!.ledger.exercise(Vindex.Project.FinalizeReview, proj.contractId, { actor: party, reviewCid: withReasons });

        // Extract contract ID from ledger result
        const nextCid = (finalizedCidOpt as any)?.value || finalizedCidOpt;
        const nextProjectCid = typeof nextCid === "string" ? nextCid : proj.contractId;

        // Perform background AI Arbitration
        try {
          const input = {
            projectCid: nextProjectCid,
            agentParty: proj.payload.agent,
            todoText: proj.payload.requirements,
            todoUri: proj.payload.briefUri,
            // Prefer the pasted deliverable text when the file isn't on real IPFS (a `local-` CID
            // means Pinata pinning failed → the server can't fetch it). Falls back to IPFS otherwise.
            submissionText: submissionPaste.trim() || undefined,
            submissionUri: proj.payload.currentSubmissionUri,
            rejectionReasons: reasons,
            milestoneIndex: Number(proj.payload.currentIndex),
            totalMilestones: proj.payload.milestones.length,
            milestoneSpec: proj.payload.milestones[Number(proj.payload.currentIndex)],
            // BYOK: the investor's own provider key (session-only). The server uses it neutrally.
            aiProvider,
            aiKey: aiKey.trim() || undefined,
          };

          const res = await fetch("/api/auto-arbitrate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(input),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error ?? "AI arbitration transaction failed");
          }

          setAutoArbitrateVerdict(data.verdict);
          const storageKey = `vindex:verdict:${proj.payload.briefUri || proj.payload.requirements}-${Number(proj.payload.currentIndex)}`;
          localStorage.setItem(storageKey, JSON.stringify(data.verdict));
          setAutoArbitrateStatus("done");
        } catch (err: any) {
          console.error("Auto arbitration failed:", err);
          setAutoArbitrateError(err.message ?? String(err));
          setAutoArbitrateStatus("failed");
        }

        return finalizedCidOpt;
      })
      .catch((err) => {
        setAutoArbitrateStatus("failed");
        setAutoArbitrateError(err.message ?? String(err));
        return undefined;
      });
  };

  const selectApplicant = (app: (typeof applications.contracts)[number]) =>
    selectCmd
      .run(async () => {
        if (!myParty) throw new Error("Create an Investor Party first");
        const deadline = new Date(Date.now() + 7 * 86_400_000).toISOString();
        const [proposalCid] = await session!.ledger.exercise(Vindex.InvestorParty.OpenProposal, myParty.contractId, {
          purpose: "Select project worker",
          action: { tag: "SelectWinner", value: app.payload.applicant },
          deadline,
        });
        const [votedCid] = await session!.ledger.exercise(Vindex.GovernanceProposal.CastProposalVote, proposalCid, {
          voter: party,
          vote: "ACCEPT",
        });
        return session!.ledger.exercise(Vindex.ProjectPosting.SelectWorker, app.payload.postingCid, {
          actor: party,
          proposalCid: votedCid,
          applicationCid: app.contractId,
        });
      })
      .catch(() => undefined);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap border-b border-[var(--border-light)] pb-4">
        <TabBar active={activeTab} onChange={setActiveTab} badges={badges} />

        <button
          onClick={() => setActiveTab("setup")}
          className={cn(
            "p-2 rounded-xl border-2 transition-all duration-200 flex items-center justify-center cursor-pointer",
            activeTab === "setup"
              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-glow-sm"
              : "bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] border-[var(--border-light)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)] hover:bg-black/10 dark:hover:bg-white/10"
          )}
          title="Setup Investor Party"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {activeTab === "setup" && (
        <SetupTab
          myParty={myParty}
          newPartyMode={newPartyMode}
          agent={agent}
          setAgent={setAgent}
          budget={budget}
          setBudget={setBudget}
          aiProvider={aiProvider}
          setAiProvider={setAiProvider}
          aiKey={aiKey}
          setAiKey={setAiKey}
          createParty={createParty}
          createCmd={createCmd}
          setNewPartyMode={setNewPartyMode}
        />
      )}

      {activeTab === "post" && (
        <PostTab
          myParty={myParty}
          myPostings={myPostings}
          applications={applications}
          requirements={requirements}
          setRequirements={setRequirements}
          briefCid={briefCid}
          setBriefCid={setBriefCid}
          isOpenPool={isOpenPool}
          setIsOpenPool={setIsOpenPool}
          workers={workers}
          newWorkerInput={newWorkerInput}
          setNewWorkerInput={setNewWorkerInput}
          addWorker={addWorker}
          removeWorker={removeWorker}
          budget={budget}
          setBudget={setBudget}
          commitment={commitment}
          setCommitment={setCommitment}
          maxRevisions={maxRevisions}
          setMaxRevisions={setMaxRevisions}
          fundAndPost={fundAndPost}
          postCmd={postCmd}
          editingPostingCid={editingPostingCid}
          setEditingPostingCid={setEditingPostingCid}
          editingRequirements={editingRequirements}
          setEditingRequirements={setEditingRequirements}
          handleEditDescription={handleEditDescription}
          handleTakeDown={handleTakeDown}
          selectApplicant={selectApplicant}
          selectCmd={selectCmd}
        />
      )}

      {activeTab === "monitor" && (
        <MonitorTab
          myVaults={myVaults}
          vaults={vaults}
          myReviews={myReviews}
          myProjects={myProjects}
          mySettlements={mySettlements}
          reasonsText={reasonsText}
          setReasonsText={setReasonsText}
          submissionPaste={submissionPaste}
          setSubmissionPaste={setSubmissionPaste}
          voteCmd={voteCmd}
          acceptSubmission={acceptSubmission}
          rejectSubmission={rejectSubmission}
          autoArbitrateStatus={autoArbitrateStatus}
          autoArbitrateError={autoArbitrateError}
          autoArbitrateVerdict={autoArbitrateVerdict}
          aiProvider={aiProvider}
          aiKey={aiKey}
          resolveStale={resolveStale}
          myMandates={myMandates}
          myPlans={myPlans}
          planCmd={planCmd}
          approvePlan={approvePlan}
          rejectPlan={rejectPlan}
          planRequired={planRequired}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
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
import { Info, HelpCircle, FileText, Settings, ShieldAlert, Award } from "lucide-react";

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
      <span className="text-[11px] text-text-secondary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50 font-sans"
      />
    </label>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("glass flex flex-col gap-3 rounded-2xl p-5", className)}>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const INVESTOR_TABS = [
  { id: "setup", label: "Setup" },
  { id: "post", label: "Post Job" },
  { id: "review", label: "Review" },
  { id: "monitor", label: "Monitor" },
] as const;

type InvestorTab = (typeof INVESTOR_TABS)[number]["id"];

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
    <div className="mb-5 flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
      {INVESTOR_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex-1 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
            active === t.id
              ? "bg-accent/15 text-accent-soft shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {t.label}
          {badges?.[t.id] ? (
            <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent/30 px-1 text-[10px] font-semibold text-accent-soft">
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
  agentFee,
  setAgentFee,
  createParty,
  createCmd,
  setNewPartyMode,
}: any) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Setup form or active party details */}
      <div className="flex flex-col gap-4">
        {!myParty || newPartyMode ? (
          <Card title="Create Investor Party">
            <p className="text-[12px] text-text-secondary">
              Each project is its own Investor Party (a fresh funding pool + governance group).
            </p>
            <Field label="AI Agent party id" value={agent} onChange={setAgent} placeholder="Agent::1220…" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Budget funding" value={budget} onChange={setBudget} />
              <Field label="Agent-fee funding" value={agentFee} onChange={setAgentFee} />
            </div>
            <Button onClick={createParty} disabled={!agent || createCmd.phase === "submitting"}>
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
            <div className="rounded-lg border border-success/25 bg-success/5 px-4 py-3">
              <p className="text-[12px] text-success font-semibold">✓ Investor Party active</p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {myParty.payload.members.length} member(s) · Agent:{" "}
                <span className="font-mono text-text-primary text-[10px]">{myParty.payload.agent}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNewPartyMode(true)}>
              + Start a separate project (new Investor Party)
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
              <li>Specify a valid AI Agent party ID for automated dispute resolution arbitration.</li>
              <li>Provide budget funding to overfund milestones.</li>
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
  agentFee,
  setAgentFee,
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
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent/50 font-sans"
              />
            </label>
            <FileUpload label="Project brief / reference files (→ IPFS)" cid={briefCid} onUploaded={setBriefCid} />

            {/* Posting mode toggle */}
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/8 rounded-xl p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-text-primary">Posting Mode</span>
                <span className="text-[11px] text-text-secondary">
                  {isOpenPool ? "Open Pool (any Worker can apply)" : "Invite Only (only pool members can apply)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenPool(!isOpenPool)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  isOpenPool ? "bg-emerald-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOpenPool ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Worker pool */}
            <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-primary font-medium">
                  {isOpenPool ? "Worker Audience (Open Pool)" : "Invited Workers (Invite Only)"}
                </span>
                <span className="text-[11px] text-text-secondary">{workers.length} worker(s)</span>
              </div>
              {workers.length > 0 ? (
                <ul className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {workers.map((w: string) => (
                    <li key={w} className="flex justify-between items-center gap-2 rounded bg-white/[0.03] border border-white/5 px-2 py-1 text-[11px] font-mono">
                      <span className="truncate text-text-secondary" title={w}>{w}</span>
                      <button
                        type="button"
                        onClick={() => removeWorker(w)}
                        className="text-text-secondary hover:text-red-400 transition-colors px-1"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-amber-300">
                  {isOpenPool
                    ? "No workers pre-added. The system will accept any Worker:: party."
                    : "No workers added. Add at least one worker party below so they can see and apply to this job."}
                </p>
              )}
              <div className="flex gap-2 mt-1">
                <input
                  value={newWorkerInput}
                  onChange={(e) => setNewWorkerInput(e.target.value)}
                  placeholder="Worker::1220..."
                  className="flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[12px] text-text-primary outline-none focus:border-accent/50 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addWorker(); }
                  }}
                />
                <Button type="button" size="sm" onClick={addWorker}>Add</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Budget envelope (cap)" value={budget} onChange={setBudget} />
              <Field label="Required worker stake" value={commitment} onChange={setCommitment} />
            </div>
            <p className="text-[11px] text-text-secondary">
              You fund the budget <span className="text-text-primary">envelope</span> and set the worker
              stake. After you select a worker, they draft the milestone plan for you to approve.
            </p>
            {!budgetValid && (
              <p className="text-[11px] text-amber-300">Enter a budget envelope greater than 0.</p>
            )}
            <Button
              onClick={fundAndPost}
              disabled={postCmd.phase === "submitting" || !budgetValid || (!isOpenPool && workers.length === 0)}
            >
              Fund Vaults &amp; Post Job
            </Button>
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

// ─── Review Tab ───────────────────────────────────────────────────────────────

function ReviewTab({
  myMandates,
  myPlans,
  planCmd,
  approvePlan,
  rejectPlan,
  planRequired,
}: any) {
  const hasActivePlans = myMandates.length > 0 || myPlans.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: list of submitted worker plans */}
      <Card title="Worker SOW Approvals">
        {!hasActivePlans ? (
          <p className="text-[12px] text-text-secondary">
            No plans yet. After you select a worker, they draft a plan here for your approval.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myMandates.map((m: any) => (
              <li key={m.contractId} className="rounded-lg border border-white/8 px-3 py-2 text-[12px] text-text-secondary">
                Worker selected — waiting for{" "}
                <span className="font-mono text-text-primary">{m.payload.worker}</span> to submit a plan…
              </li>
            ))}
            {myPlans.map((pl: any) => {
              const required = planRequired(pl);
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
        )}
        <TxStatus status={planCmd} />
      </Card>

      {/* Right Col: Review Guidelines */}
      <Card title="Plan Audit Guidelines">
        <div className="flex flex-col gap-3 text-[12px] text-text-secondary leading-relaxed">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-accent-soft shrink-0" />
            <p>Review the SOW proposal. Your approval locks the escrow vault and starts the project.</p>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
            <h4 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">Review Steps:</h4>
            <ul className="flex flex-col gap-2 list-disc pl-4 text-[11px]">
              <li>Validate the milestone count against project requirements.</li>
              <li>Ensure the sum matches the agreed freelance terms.</li>
              <li>Approval creates the live project contract instantly on Canton.</li>
            </ul>
          </div>
        </div>
      </Card>
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
  voteCmd,
  acceptSubmission,
  rejectSubmission,
}: any) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Col: Milestone Reviews & Projects status */}
      <div className="flex flex-col gap-4">
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
                        <Button size="sm" onClick={() => acceptSubmission(r, proj)} disabled={busy}>
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
                          />
                          <Button size="sm" variant="secondary" onClick={() => rejectSubmission(r, proj)} disabled={busy}>
                            Reject → Escalate
                          </Button>
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
              {myProjects.map((p: any) => (
                <li key={p.contractId} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2">
                  <span className="text-text-secondary">
                    Milestone {Number(p.payload.currentIndex) + 1}/{p.payload.milestones.length}
                  </span>
                  <span className="text-text-primary font-semibold">{STATUS_LABEL[p.payload.status] ?? p.payload.status}</span>
                </li>
              ))}
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

  const [agent, setAgent] = useState("");
  const [budget, setBudget] = useState("4000");
  const [agentFee, setAgentFee] = useState("300");
  const [commitment, setCommitment] = useState("500");
  const [reasonsText, setReasonsText] = useState("Deliverable does not meet the milestone spec");
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
  if (myPlans.length > 0) badges.review = myPlans.length;
  if (myReviews.length > 0) badges.monitor = myReviews.length;

  const createParty = () =>
    createCmd
      .run(
        async () => {
          const created = await session!.ledger.create(Vindex.InvestorParty, {
            admin: party,
            members: [party],
            pending: [],
            contributions: [{ investor: party, projectFunding: num(budget), agentFeeFunding: num(agentFee), weight: num(1) }],
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
            agentFeeAmount: num(agentFee),
            agentOpCost: num(50),
            commitmentRequired: num(commitment),
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

  const rejectSubmission = (
    review: (typeof reviews.contracts)[number],
    proj: (typeof projects.contracts)[number],
  ) =>
    voteCmd
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
        return session!.ledger.exercise(Vindex.Project.FinalizeReview, proj.contractId, { actor: party, reviewCid: withReasons });
      })
      .catch(() => undefined);

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
      <TabBar active={activeTab} onChange={setActiveTab} badges={badges} />

      {activeTab === "setup" && (
        <SetupTab
          myParty={myParty}
          newPartyMode={newPartyMode}
          agent={agent}
          setAgent={setAgent}
          budget={budget}
          setBudget={setBudget}
          agentFee={agentFee}
          setAgentFee={setAgentFee}
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
          agentFee={agentFee}
          setAgentFee={setAgentFee}
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

      {activeTab === "review" && (
        <ReviewTab
          myMandates={myMandates}
          myPlans={myPlans}
          planCmd={planCmd}
          approvePlan={approvePlan}
          rejectPlan={rejectPlan}
          planRequired={planRequired}
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
          voteCmd={voteCmd}
          acceptSubmission={acceptSubmission}
          rejectSubmission={rejectSubmission}
        />
      )}
    </div>
  );
}

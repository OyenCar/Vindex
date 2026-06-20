"use client";

/**
 * Client wrapper for the off-ledger AI arbitration agent (/api/agent-verdict).
 * The AI's reasoning lives here only as a recommendation; the binding decision is the
 * `Project.AgentVerdict` choice the Agent party then exercises on-ledger.
 */

export interface ChecklistItem {
  item: string;
  met: boolean;
  evidence: string;
}

export interface RejectionAssessment {
  reason: string;
  justified: boolean;
  note: string;
}

export interface AgentVerdictResult {
  model: string;
  rejectionValid: boolean;
  confidence: number;
  summary: string;
  checklist: ChecklistItem[];
  rejectionAssessment: RejectionAssessment[];
}

export interface AgentVerdictInput {
  todoText?: string;
  todoUri?: string | null;
  submissionText?: string;
  submissionUri?: string | null;
  rejectionReasons: string[];
}

export async function runAgentVerdict(input: AgentVerdictInput): Promise<AgentVerdictResult> {
  const res = await fetch("/api/agent-verdict", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<AgentVerdictResult> & { error?: string };
  if (!res.ok || typeof data.rejectionValid !== "boolean") {
    throw new Error(data.error ?? `AI verdict failed (${res.status})`);
  }
  return data as AgentVerdictResult;
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Vindex } from "@/lib/daml/vindex";

export const runtime = "nodejs";

interface MilestoneSpecPayload {
  deliverablesHash?: string;
  payment?: string;
  workerWindow?: { microseconds: string };
  reviewWindow?: { microseconds: string };
  violationPct?: string;
  isFinal?: boolean;
}

interface AutoArbitrateBody {
  projectCid: string;
  agentParty: string;
  todoText?: string;
  todoUri?: string | null;
  submissionText?: string;
  submissionUri?: string | null;
  rejectionReasons?: string[];
  milestoneIndex?: number;
  totalMilestones?: number;
  milestoneSpec?: MilestoneSpecPayload | null;
  // BYOK (v2): the investor's own provider + key (session-only). Used server-side only; the
  // neutral server still builds the prompt and commits the verdict, so the arbiter stays neutral.
  aiProvider?: string;
  aiKey?: string;
  aiModel?: string;
}

const GATEWAY = process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
const GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN ?? "";
const MODEL = (process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || "gemini-2.0-flash").trim();

async function fetchFromIpfs(cid: string): Promise<string> {
  if (cid.startsWith("local-")) {
    throw new Error("file stored with offline fallback — paste text instead");
  }
  const url = `${GATEWAY}/ipfs/${cid}${GATEWAY_TOKEN ? `?pinataGatewayToken=${GATEWAY_TOKEN}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not fetch ${cid} from IPFS (${res.status})`);
  return (await res.text()).slice(0, 20_000);
}

async function resolveText(text: string | undefined, uri: string | null | undefined, label: string): Promise<string> {
  if (text && text.trim()) return text.trim();
  if (uri && uri.trim()) return fetchFromIpfs(uri.trim());
  throw new Error(`missing ${label}: provide text or IPFS CID`);
}

async function resolveTodo(text: string | undefined, uri: string | null | undefined): Promise<string> {
  if (uri && uri.trim() && !uri.trim().startsWith("local-")) {
    try {
      return await fetchFromIpfs(uri.trim());
    } catch {
      // ignore
    }
  }
  if (text && text.trim()) return text.trim();
  throw new Error("missing to-do list: no project description or brief");
}

function buildSystemPrompt(milestoneIndex?: number, totalMilestones?: number): string {
  let msContext = "";
  if (milestoneIndex != null && totalMilestones != null) {
    msContext = `\n\nMILESTONE CONTEXT: The dispute is about milestone ${milestoneIndex + 1} of ${totalMilestones}.`;
    if (milestoneIndex > 0) {
      msContext += `\nMilestones 1 through ${milestoneIndex} have already been ACCEPTED and completed.`;
      msContext += `\nDo NOT re-evaluate items from those earlier milestones — they are settled.`;
    }
    msContext += `\nThe to-do list may cover ALL milestones, but you MUST evaluate ONLY the items that belong to`;
    msContext += `\nmilestone ${milestoneIndex + 1}. Items belonging to other milestones are NOT relevant to this`;
    msContext += `\nverdict — do not penalize the worker for items scoped to a different milestone, and do not accept`;
    msContext += `\na rejection that cites requirements from a different milestone as justification.`;
  }

  return `You are Vindex's arbitration agent for a Canton/Daml freelance escrow protocol.
A worker delivered a milestone; the investor REJECTED it with stated reasons. Your job is to decide,
strictly and impartially, whether that rejection is JUSTIFIED by checking the SUBMISSION against the
project TO-DO LIST and against the investor's REJECTION REASONS.
${msContext}

Rules:
- Judge ONLY against the to-do list items scoped to the CURRENT milestone and the rejection reasons.
  Do not invent new requirements. Do not evaluate items from other milestones.
- A rejection is JUSTIFIED (valid) when one or more required to-do items FOR THIS MILESTONE are
  genuinely unmet AND the rejection reasons point at those real gaps.
- A rejection is UNJUSTIFIED (invalid) when the submission reasonably satisfies THIS MILESTONE's
  to-do items and the rejection reasons are not supported by the evidence (this penalizes the investor).
- If a rejection reason references a requirement that belongs to a DIFFERENT milestone, that reason
  is NOT justified — the worker cannot be held accountable for work outside this milestone's scope.
- Be concrete: map each relevant to-do item to evidence in the submission.
- Evaluate milestone ${milestoneIndex != null ? milestoneIndex + 1 : "the current milestone"} ONLY.
  Set "milestoneEvaluated" to exactly ${milestoneIndex != null ? milestoneIndex + 1 : "that number"}
  and NEVER cite, discuss, or judge any OTHER milestone number anywhere in your answer.

Respond with ONLY a JSON object, no prose, in exactly this shape:
{
  "rejectionValid": boolean,
  "confidence": number,            // 0.0 - 1.0
  "summary": string,               // 1-3 sentences explaining the decision
  "milestoneEvaluated": number,    // the milestone number this verdict applies to (1-indexed)
  "checklist": [                   // one entry per to-do item FOR THIS MILESTONE ONLY
    { "item": string, "met": boolean, "evidence": string }
  ],
  "rejectionAssessment": [         // one entry per rejection reason
    { "reason": string, "justified": boolean, "note": string }
  ]
}`;
}

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function getAgentToken(agentParty: string): string {
  const secret = process.env.DAML_JWT_SECRET ?? "secret";
  const ledgerId = process.env.DAML_LEDGER_ID ?? "sandbox";
  const header = { alg: "HS256", typ: "JWT" };
  const publicParty = process.env.NEXT_PUBLIC_PARTY_PUBLIC ?? "";
  const readAs = [agentParty];
  if (publicParty && !readAs.includes(publicParty)) {
    readAs.push(publicParty);
  }
  const payload = {
    "https://daml.com/ledger-api": {
      ledgerId,
      applicationId: "Vindex",
      actAs: [agentParty],
      readAs,
    },
    exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5 min expiry
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const groqModel = process.env.GROQ_MODEL?.trim();

  let body: AutoArbitrateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { projectCid, agentParty } = body;
  if (!projectCid || !agentParty) {
    return NextResponse.json({ error: "projectCid and agentParty are required" }, { status: 400 });
  }

  // Provider selection — BYOK first: the investor's own key/provider (from the request) wins; else
  // fall back to the server's env keys (dev convenience). Either way OUR server builds the prompt and
  // commits the verdict, so the arbiter stays neutral (locked decision: neutral arbiter).
  const byokKey = body.aiKey?.trim();
  const byokProvider = (body.aiProvider ?? "").trim().toLowerCase();
  let provider: "groq" | "openrouter" | "gemini";
  let apiKey: string | undefined;
  let usedModel: string;
  if (byokKey) {
    provider = byokProvider === "gemini" ? "gemini" : byokProvider === "openrouter" ? "openrouter" : "groq";
    apiKey = byokKey;
    usedModel =
      body.aiModel?.trim() ||
      (provider === "groq"
        ? groqModel || "llama-3.3-70b-versatile"
        : provider === "openrouter"
          ? process.env.OPENROUTER_MODEL?.trim() || "google/gemma-2-9b-it:free"
          : process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash");
  } else if (groqModel && groqKey) {
    provider = "groq";
    apiKey = groqKey;
    usedModel = groqModel;
  } else if (MODEL.includes("/") || (openrouterKey && !geminiKey) || (openrouterKey && openrouterKey.startsWith("sk-or-"))) {
    provider = "openrouter";
    apiKey = openrouterKey;
    usedModel = MODEL;
  } else {
    provider = "gemini";
    apiKey = geminiKey || openrouterKey;
    usedModel = MODEL;
  }
  if (!apiKey) {
    return NextResponse.json(
      { error: "No AI key — supply your BYOK key, or set GROQ_API_KEY / OPENROUTER_API_KEY / GEMINI_API_KEY." },
      { status: 503 },
    );
  }

  let todo: string;
  let submission: string;
  try {
    todo = await resolveTodo(body.todoText, body.todoUri);
    submission = await resolveText(body.submissionText, body.submissionUri, "submission");
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }

  const reasons = (body.rejectionReasons ?? []).filter((r) => r && r.trim());
  const msIdx = body.milestoneIndex;
  const msTotal = body.totalMilestones;
  const msSpec = body.milestoneSpec;

  const milestoneSection: string[] = [];
  if (msIdx != null && msTotal != null) {
    milestoneSection.push(
      `## CURRENT MILESTONE`,
      `This dispute concerns **milestone ${msIdx + 1} of ${msTotal}**.`,
      ...(msIdx > 0
        ? [`Milestones 1–${msIdx} have already been accepted and are NOT under review.`]
        : []),
      `Evaluate ONLY the to-do items scoped to milestone ${msIdx + 1}.`,
    );
    if (msSpec) {
      const details: string[] = [];
      if (msSpec.payment) details.push(`Payment on acceptance: ${msSpec.payment}`);
      if (msSpec.violationPct) details.push(`Violation penalty %: ${Number(msSpec.violationPct) * 100}%`);
      if (msSpec.isFinal) details.push(`This is the FINAL milestone.`);
      if (details.length) milestoneSection.push("", ...details);
    }
    milestoneSection.push("");
  }

  const promptParts: string[] = [];
  promptParts.push(...milestoneSection);
  promptParts.push("## PROJECT TO-DO LIST");
  promptParts.push(todo);
  promptParts.push("", "## WORKER SUBMISSION");
  promptParts.push(submission);
  promptParts.push(
    "",
    "## INVESTOR REJECTION REASONS",
    reasons.length ? reasons.map((r, i) => `${i + 1}. ${r}`).join("\n") : "(none provided)",
    "",
    msIdx != null
      ? `Decide whether the rejection is justified FOR MILESTONE ${msIdx + 1} ONLY and return the JSON verdict.`
      : "Decide whether the rejection is justified and return the JSON verdict."
  );

  const userContent = promptParts.join("\n");
  let aiRaw = "";

  try {
    if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: usedModel,
          max_completion_tokens: 4096,
          messages: [
            { role: "system", content: buildSystemPrompt(msIdx, msTotal) },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Groq API error (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}` },
          { status: 502 },
        );
      }
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `Groq API: ${data.error.message ?? "unknown error"}` }, { status: 502 });
      }
      aiRaw = data.choices?.[0]?.message?.content ?? "";
    } else if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          "X-Title": "Vindex",
        },
        body: JSON.stringify({
          model: usedModel,
          max_tokens: 1500,
          messages: [
            { role: "system", content: buildSystemPrompt(msIdx, msTotal) },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: `OpenRouter API error (${res.status})` }, { status: 502 });
      }
      const data = await res.json();
      aiRaw = data.choices?.[0]?.message?.content ?? "";
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          systemInstruction: { parts: [{ text: buildSystemPrompt(msIdx, msTotal) }] },
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: `Gemini API error (${res.status})` }, { status: 502 });
      }
      const data = await res.json();
      aiRaw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
  } catch (e) {
    return NextResponse.json({ error: `failed to reach AI API: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  let verdict: any;
  try {
    verdict = extractJson(aiRaw);
  } catch {
    return NextResponse.json({ error: "could not parse the AI verdict" }, { status: 502 });
  }

  if (typeof verdict.rejectionValid !== "boolean") {
    return NextResponse.json({ error: "AI verdict missing 'rejectionValid'" }, { status: 502 });
  }

  // AI run succeeded! Now execute Vindex.Project.AgentVerdict choice on the ledger
  try {
    const rawBase = process.env.LEDGER_PROXY_TARGET ?? "http://localhost:7575";
    const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
    const token = getAgentToken(agentParty);

    const exerciseRes = await fetch(`${base}v1/exercise`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        templateId: Vindex.Project.templateId,
        contractId: projectCid,
        choice: "AgentVerdict",
        argument: {
          rejectionValid: verdict.rejectionValid,
        },
      }),
    });

    const text = await exerciseRes.text();
    if (!exerciseRes.ok) {
      return NextResponse.json({
        error: `Ledger AgentVerdict exercise failed (${exerciseRes.status}): ${text.slice(0, 300)}`,
        verdict,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      // Force the milestone number to the disputed index so a drifting model can't mislabel the
      // verdict as belonging to a different milestone.
      verdict: {
        ...verdict,
        milestoneEvaluated: msIdx != null ? msIdx + 1 : verdict.milestoneEvaluated,
        model: usedModel,
      },
      ledgerResponse: JSON.parse(text),
    });
  } catch (e) {
    return NextResponse.json({
      error: `Ledger connection failed: ${e instanceof Error ? e.message : String(e)}`,
      verdict,
    }, { status: 502 });
  }
}

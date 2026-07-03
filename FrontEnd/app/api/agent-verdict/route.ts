import { NextRequest, NextResponse } from "next/server";

// Runs server-side so OPENROUTER_API_KEY never reaches the browser.
export const runtime = "nodejs";

/**
 * Vindex AI arbitration agent (the "oracle").
 *
 * The AI is called through OpenRouter (an OpenAI-compatible gateway — pick any model via
 * OPENROUTER_MODEL). The Agent party is an ORACLE: the AI runs OFF-ledger here, and only its
 * boolean verdict is written back on-ledger via the `Project.AgentVerdict` choice. No AI runs
 * inside a Daml contract — contracts are deterministic. This route:
 *
 *   1. resolves the project TO-DO LIST (from the brief CID or pasted text),
 *   2. resolves the worker's SUBMISSION (from the deliverable CID or pasted text),
 *   3. asks Claude to check the submission against the to-do list AND against the investor's
 *      stated rejection reasons, and to decide whether the rejection is VALID.
 *
 * Verdict semantics (must mirror Vindex.daml `AgentVerdict`):
 *   rejectionValid = true  -> the rejection is justified; the worker revises.
 *   rejectionValid = false -> the rejection is unjustified (investor violation); the worker is
 *                             paid in full plus the penalty.
 */

interface MilestoneSpecPayload {
  deliverablesHash?: string;
  payment?: string;
  workerWindow?: { microseconds: string };
  reviewWindow?: { microseconds: string };
  violationPct?: string;
  isFinal?: boolean;
}

interface VerdictBody {
  todoText?: string;
  todoUri?: string | null;
  submissionText?: string;
  submissionUri?: string | null;
  rejectionReasons?: string[];
  milestoneIndex?: number;
  totalMilestones?: number;
  milestoneSpec?: MilestoneSpecPayload | null;
}

const GATEWAY = process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
// Optional: dedicated-gateway access token, appended when the gateway restricts retrieval.
const GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN ?? "";
// Any Gemini model slug (e.g. gemini-2.0-flash or gemini-2.5-flash). Override with GEMINI_MODEL.
const MODEL = (process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || "gemini-2.0-flash").trim();

/** Pull text out of an IPFS CID via the gateway (server-side, avoids browser CORS). */
async function fetchFromIpfs(cid: string): Promise<string> {
  if (cid.startsWith("local-")) {
    throw new Error("file was stored with the offline fallback (no real IPFS pin) — paste its text instead");
  }
  const url = `${GATEWAY}/ipfs/${cid}${GATEWAY_TOKEN ? `?pinataGatewayToken=${GATEWAY_TOKEN}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not fetch ${cid} from IPFS (${res.status})`);
  return (await res.text()).slice(0, 20_000); // cap to keep the prompt bounded
}

async function resolveText(text: string | undefined, uri: string | null | undefined, label: string): Promise<string> {
  if (text && text.trim()) return text.trim();
  if (uri && uri.trim()) return fetchFromIpfs(uri.trim());
  throw new Error(`missing ${label}: provide its text or an IPFS CID`);
}

// To-do list: prefer the richer brief FILE when it's a real, fetchable pin; otherwise fall back to
// the on-ledger project-description text so the agent always has something to compare against (even
// if the brief upload failed and landed as a local- stand-in).
async function resolveTodo(text: string | undefined, uri: string | null | undefined): Promise<string> {
  if (uri && uri.trim() && !uri.trim().startsWith("local-")) {
    try {
      return await fetchFromIpfs(uri.trim());
    } catch {
      /* brief unreachable — fall through to the on-ledger text */
    }
  }
  if (text && text.trim()) return text.trim();
  throw new Error("missing to-do list: no project description on-ledger and no brief pinned");
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
export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groq = process.env.GROQ_API_KEY?.trim();

  // Determine if we should route to OpenRouter or Google Gemini Direct
  const useOpenRouter = MODEL.includes("/") || (openrouterKey && !geminiKey) || (openrouterKey && openrouterKey.startsWith("sk-or-"));
  const groqModel = process.env.GROQ_MODEL;

  const apiKey = groqModel ? groq : useOpenRouter ? openrouterKey : (geminiKey || openrouterKey);
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not set — add GEMINI_API_KEY or OPENROUTER_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  let body: VerdictBody;
  try {
    body = (await req.json()) as VerdictBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
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

  let aiRaw: string = "";
  try {
    if (groqModel) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groq}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: groqModel,
          max_completion_tokens: 4096, // Diperbaiki: ditambah 's'
          messages: [ // Diperbaiki: diganti jadi 'messages'
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
      
      // SEKARANG aiRaw terisi dengan benar!
      aiRaw = data.choices?.[0]?.message?.content ?? "";
      console.log(aiRaw);
    }
    else if (useOpenRouter) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          "X-Title": "Vindex",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          messages: [
            { role: "system", content: buildSystemPrompt(msIdx, msTotal) },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `OpenRouter API error (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}` },
          { status: 502 },
        );
      }
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `OpenRouter API: ${data.error.message ?? "unknown error"}` }, { status: 502 });
      }
      aiRaw = data.choices?.[0]?.message?.content ?? "";
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userContent }],
            },
          ],
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(msIdx, msTotal) }],
          },
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: `Gemini API error (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}` },
          { status: 502 },
        );
      }
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({ error: `Gemini API: ${data.error.message ?? "unknown error"}` }, { status: 502 });
      }
      aiRaw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
  } catch (e) {
    return NextResponse.json({ error: `failed to reach AI API: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  let verdict: Record<string, unknown>;
  try {
    verdict = extractJson(aiRaw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "could not parse the AI verdict", raw: aiRaw.slice(0, 500) }, { status: 502 });
  }

  if (typeof verdict.rejectionValid !== "boolean") {
    return NextResponse.json({ error: "AI verdict missing a boolean 'rejectionValid'", raw: aiRaw.slice(0, 500) }, { status: 502 });
  }

  return NextResponse.json({ model: MODEL, ...verdict });
}

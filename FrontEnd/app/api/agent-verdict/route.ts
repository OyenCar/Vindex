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

interface VerdictBody {
  todoText?: string;
  todoUri?: string | null;
  submissionText?: string;
  submissionUri?: string | null;
  rejectionReasons?: string[];
}

const GATEWAY = process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
// Optional: dedicated-gateway access token, appended when the gateway restricts retrieval.
const GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN ?? "";
// Any OpenRouter model slug (see https://openrouter.ai/models). Override with OPENROUTER_MODEL.
const MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-sonnet";

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

const SYSTEM_PROMPT = `You are Vindex's arbitration agent for a Canton/Daml freelance escrow protocol.
A worker delivered a milestone; the investor REJECTED it with stated reasons. Your job is to decide,
strictly and impartially, whether that rejection is JUSTIFIED by checking the SUBMISSION against the
project TO-DO LIST and against the investor's REJECTION REASONS.

Rules:
- Judge ONLY against the to-do list items and the rejection reasons. Do not invent new requirements.
- A rejection is JUSTIFIED (valid) when one or more required to-do items are genuinely unmet AND the
  rejection reasons point at those real gaps.
- A rejection is UNJUSTIFIED (invalid) when the submission reasonably satisfies the to-do list and the
  rejection reasons are not supported by the evidence (this penalizes the investor).
- Be concrete: map each to-do item to evidence in the submission.

Respond with ONLY a JSON object, no prose, in exactly this shape:
{
  "rejectionValid": boolean,
  "confidence": number,            // 0.0 - 1.0
  "summary": string,               // 1-3 sentences explaining the decision
  "checklist": [                   // one entry per to-do item
    { "item": string, "met": boolean, "evidence": string }
  ],
  "rejectionAssessment": [         // one entry per rejection reason
    { "reason": string, "justified": boolean, "note": string }
  ]
}`;

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set — add it to .env.local to enable the AI agent (or rule manually)." },
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
  const userContent = [
    "## PROJECT TO-DO LIST",
    todo,
    "",
    "## WORKER SUBMISSION",
    submission,
    "",
    "## INVESTOR REJECTION REASONS",
    reasons.length ? reasons.map((r, i) => `${i + 1}. ${r}`).join("\n") : "(none provided)",
    "",
    "Decide whether the rejection is justified and return the JSON verdict.",
  ].join("\n");

  let aiRaw: string;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        // Optional OpenRouter attribution headers.
        "X-Title": "Vindex",
        ...(process.env.OPENROUTER_SITE_URL ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (data.error) {
      return NextResponse.json({ error: `OpenRouter: ${data.error.message ?? "unknown error"}` }, { status: 502 });
    }
    aiRaw = data.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    return NextResponse.json({ error: `failed to reach OpenRouter: ${e instanceof Error ? e.message : e}` }, { status: 502 });
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

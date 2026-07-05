import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Vindex } from "@/lib/daml/vindex";
import { unpackUri, decryptBytes } from "@/lib/crypto";

export const runtime = "nodejs";

// WebCrypto polyfill for Node < 20 (globalThis.crypto not always present) so decryptBytes works.
if (!(globalThis as { crypto?: Crypto }).crypto) {
  (globalThis as { crypto?: Crypto }).crypto = crypto.webcrypto as unknown as Crypto;
}

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
  // Multiple saved BYOK keys, ORDERED (active first, then fallbacks). Tried in order until one works.
  aiKeys?: { provider: string; key: string; model?: string }[];
}

const GATEWAY = process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
const GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN ?? "";
const MODEL = (process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || "gemini-2.0-flash").trim();

async function fetchBytesFromIpfs(uri: string): Promise<Uint8Array> {
  const { cid, keyB64 } = unpackUri(uri);
  if (cid.startsWith("local-")) {
    throw new Error("file stored with offline fallback — paste text instead");
  }
  const url = `${GATEWAY}/ipfs/${cid}${GATEWAY_TOKEN ? `?pinataGatewayToken=${GATEWAY_TOKEN}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not fetch ${cid} from IPFS (${res.status})`);
  const buf = await res.arrayBuffer();
  // Encrypted artifacts carry the key on-ledger (unpacked above) — decrypt to raw bytes.
  return keyB64 ? await decryptBytes(buf, keyB64) : new Uint8Array(buf);
}

async function fetchFromIpfs(uri: string): Promise<string> {
  return new TextDecoder().decode(await fetchBytesFromIpfs(uri)).slice(0, 20_000);
}

/** Detect a common image type from magic bytes (the content-type is lost once encrypted). */
function sniffImageMime(b: Uint8Array): string | null {
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 3 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (
    b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

/** Resolve the worker's submission as either TEXT or an IMAGE (data URL) for vision models. Pasted
 *  text wins; otherwise fetch+decrypt the deliverable and sniff its type. */
async function resolveSubmission(
  text: string | undefined,
  uri: string | null | undefined,
): Promise<{ text?: string; imageDataUrl?: string }> {
  if (text && text.trim()) return { text: text.trim() };
  if (uri && uri.trim()) {
    const bytes = await fetchBytesFromIpfs(uri.trim());
    const mime = sniffImageMime(bytes);
    if (mime) {
      return { imageDataUrl: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}` };
    }
    return { text: new TextDecoder().decode(bytes).slice(0, 20_000) };
  }
  throw new Error("missing submission: provide text or IPFS CID");
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

/** Default model per provider when the investor didn't specify one. */
function providerDefaultModel(provider: string): string {
  if (provider === "gemini") return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  if (provider === "openrouter") return process.env.OPENROUTER_MODEL?.trim() || "google/gemma-2-9b-it:free";
  return process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
}

/** Call ONE provider and return the raw model text. Throws on any failure so the caller can fall
 *  back to the next key. The API key is used only here and is NEVER logged. */
async function callModel(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  imageDataUrl?: string,
): Promise<string> {
  // OpenAI-compatible providers (Groq, OpenRouter): attach an image as an image_url content part
  // (requires a VISION-capable model, e.g. llama-4-scout / gpt-4o).
  if (provider === "groq" || provider === "openrouter") {
    const userMsg = imageDataUrl
      ? { role: "user", content: [{ type: "text", text: userContent }, { type: "image_url", image_url: { url: imageDataUrl } }] }
      : { role: "user", content: userContent };
    const endpoint = provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";
    const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" };
    if (provider === "openrouter") headers["X-Title"] = "Vindex";
    const reqBody: Record<string, unknown> = { model, messages: [{ role: "system", content: systemPrompt }, userMsg] };
    reqBody[provider === "groq" ? "max_completion_tokens" : "max_tokens"] = provider === "groq" ? 4096 : 1500;
    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(reqBody) });
    if (!res.ok) throw new Error(`${provider} ${res.status}: ${(await res.text().catch(() => "")).slice(0, 150)}`);
    const data = await res.json();
    if (data.error) throw new Error(`${provider}: ${data.error.message ?? "error"}`);
    return data.choices?.[0]?.message?.content ?? "";
  }
  // Gemini: attach an image as inline_data.
  const parts: Record<string, unknown>[] = [{ text: userContent }];
  if (imageDataUrl) {
    const m = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text().catch(() => "")).slice(0, 150)}`);
  const data = await res.json();
  if (data.error) throw new Error(`Gemini: ${data.error.message ?? "error"}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

  // Build the ORDERED candidate list. BYOK keys (investor-provided, active first) are tried first;
  // server-side env keys are ALWAYS appended as fallbacks so an invalid/expired BYOK key doesn't
  // brick arbitration. The neutral server always builds the prompt + commits the verdict, so BYOK
  // never affects arbiter neutrality.
  const norm = (p?: string) => {
    const s = (p ?? "").trim().toLowerCase();
    return s === "gemini" || s === "openrouter" ? s : "groq";
  };

  // 1. BYOK candidates (investor's own keys, active first)
  const byokList = (body.aiKeys ?? []).filter((k) => k && k.key && k.key.trim());
  let candidates: { provider: string; apiKey: string; model: string }[] = [];
  if (byokList.length > 0) {
    candidates = byokList.map((k) => ({
      provider: norm(k.provider),
      apiKey: k.key.trim(),
      model: k.model?.trim() || providerDefaultModel(norm(k.provider)),
    }));
  } else if (body.aiKey?.trim()) {
    const p = norm(body.aiProvider);
    candidates.push({ provider: p, apiKey: body.aiKey.trim(), model: body.aiModel?.trim() || providerDefaultModel(p) });
  }

  // 2. Server-side env keys as fallbacks (always appended, deduplicated against BYOK)
  const envCandidates: { provider: string; apiKey: string; model: string }[] = [];
  if (groqModel && groqKey) {
    envCandidates.push({ provider: "groq", apiKey: groqKey, model: groqModel });
  }
  if (openrouterKey) {
    envCandidates.push({ provider: "openrouter", apiKey: openrouterKey, model: process.env.OPENROUTER_MODEL?.trim() || MODEL });
  }
  if (geminiKey) {
    envCandidates.push({ provider: "gemini", apiKey: geminiKey, model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash" });
  }
  // Deduplicate: don't add an env key if the investor already supplied the exact same key
  const existingKeys = new Set(candidates.map((c) => c.apiKey));
  for (const ec of envCandidates) {
    if (!existingKeys.has(ec.apiKey)) {
      candidates.push(ec);
      existingKeys.add(ec.apiKey);
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "No AI key — add a key in Setup (BYOK), or set GROQ_API_KEY / OPENROUTER_API_KEY / GEMINI_API_KEY." },
      { status: 503 },
    );
  }

  let todo: string;
  let sub: { text?: string; imageDataUrl?: string };
  try {
    todo = await resolveTodo(body.todoText, body.todoUri);
    sub = await resolveSubmission(body.submissionText, body.submissionUri);
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
  promptParts.push(
    sub.imageDataUrl
      ? "(The deliverable is the ATTACHED IMAGE — evaluate it visually against the to-do list.)"
      : sub.text ?? "(no submission content)",
  );
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

  // Try each candidate in order until one returns a parseable verdict. Errors (bad key, rate limit,
  // model down) fall through to the next key. Keys are never logged.
  const systemPrompt = buildSystemPrompt(msIdx, msTotal);
  let verdict: any = null;
  let usedModel = "";
  let lastErr = "no candidates";
  for (const c of candidates) {
    try {
      const aiRaw = await callModel(c.provider, c.apiKey, c.model, systemPrompt, userContent, sub.imageDataUrl);
      const parsed: any = extractJson(aiRaw);
      if (typeof parsed.rejectionValid !== "boolean") {
        lastErr = "model did not return a boolean 'rejectionValid'";
        continue;
      }
      verdict = parsed;
      usedModel = c.model;
      break;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  if (!verdict) {
    return NextResponse.json({ error: `AI arbitration failed (all keys): ${lastErr}` }, { status: 502 });
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

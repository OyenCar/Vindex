// Smoke-test the AI arbitration agent against OpenRouter, using the sample files.
// Mirrors the request /api/agent-verdict makes, so a PASS here means the route will work.
//
//   node SmartContract/verify-agent.mjs
//
// Reads OPENROUTER_API_KEY / OPENROUTER_MODEL from FrontEnd/.env.local and the demo inputs
// from samples/. Makes ONE chat-completion call (use a :free model to avoid cost).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readEnv() {
  const text = fs.readFileSync(path.join(root, "FrontEnd/.env.local"), "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = readEnv();
const KEY = env.OPENROUTER_API_KEY;
const MODEL = env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in FrontEnd/.env.local");
  process.exit(1);
}

const todo = fs.readFileSync(path.join(root, "samples/project-todo.md"), "utf8");
const submission = fs.readFileSync(path.join(root, "samples/submission-example.md"), "utf8");
const rejectionReasons = [
  "Pricing section is missing the Enterprise tier — the spec required exactly 3 tiers.",
  'The hero CTA links to "#" instead of /signup, so the main conversion button is dead.',
  "The contact form posts to a third-party (Formspree) and does not validate the email.",
  "Mobile Lighthouse performance is 84, below the required minimum of 90.",
  "The shade of blue in the hero is too dark for my taste and should be lighter.",
];

// Mirror of the route's system prompt.
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
  "confidence": number,
  "summary": string,
  "checklist": [ { "item": string, "met": boolean, "evidence": string } ],
  "rejectionAssessment": [ { "reason": string, "justified": boolean, "note": string } ]
}`;

const userContent = [
  "## PROJECT TO-DO LIST", todo, "",
  "## WORKER SUBMISSION", submission, "",
  "## INVESTOR REJECTION REASONS",
  rejectionReasons.map((r, i) => `${i + 1}. ${r}`).join("\n"), "",
  "Decide whether the rejection is justified and return the JSON verdict.",
].join("\n");

function extractJson(raw) {
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s === -1 || e < s) throw new Error("no JSON in response");
  return JSON.parse(raw.slice(s, e + 1));
}

console.log(`Model: ${MODEL}\nCalling OpenRouter ...\n`);
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json", "X-Title": "Vindex" },
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
  console.error(`OpenRouter HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
const data = await res.json();
if (data.error) {
  console.error(`OpenRouter error: ${data.error.message ?? JSON.stringify(data.error)}`);
  process.exit(1);
}
const raw = data.choices?.[0]?.message?.content ?? "";

let v;
try {
  v = extractJson(raw);
} catch (e) {
  console.error(`Could not parse verdict (${e.message}). Raw:\n${raw.slice(0, 600)}`);
  process.exit(1);
}

console.log(`Verdict: rejectionValid = ${v.rejectionValid}  (confidence ${Math.round((v.confidence ?? 0) * 100)}%)`);
console.log(`Summary: ${v.summary}\n`);
for (const c of v.checklist ?? []) console.log(`  ${c.met ? "✓" : "✗"} ${c.item}`);
console.log();
for (const r of v.rejectionAssessment ?? [])
  console.log(`  [${r.justified ? "justified" : "not justified"}] ${r.reason}`);
console.log(`\n${typeof v.rejectionValid === "boolean" ? "✅ PASS — model returned a valid verdict." : "❌ FAIL — missing boolean."}`);

// Smoke-test the AI arbitration agent against OpenRouter, using the sample files.
// Mirrors the request /api/agent-verdict makes, so a PASS here means the route will work.
//
//   node SmartContract/verify-agent.mjs                    # defaults to milestone 1
//   node SmartContract/verify-agent.mjs --milestone 2      # test milestone 2 of N
//
// Reads OPENROUTER_API_KEY / OPENROUTER_MODEL from FrontEnd/.env.local and the demo inputs
// from samples/. Auto-detects total milestones from "## Milestone N" headers in project-todo.md.
// Makes ONE chat-completion call (use a :free model to avoid cost).

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
const KEY = env.GEMINI_API_KEY || env.OPENROUTER_API_KEY;
const MODEL = env.GEMINI_MODEL || "gemini-1.5-flash";
if (!KEY) {
  console.error("GEMINI_API_KEY is not set in FrontEnd/.env.local");
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

// ---------------------------------------------------------------------------
// Milestone context — parsed from CLI + auto-detected from the to-do file.
//   node SmartContract/verify-agent.mjs --milestone 2
// If omitted, defaults to milestone 1.
// ---------------------------------------------------------------------------

// Count "## Milestone" headers in the to-do to auto-detect total milestones.
const milestoneHeaders = todo.match(/^##\s+Milestone\s+\d+/gim) ?? [];
const TOTAL_MILESTONES = Math.max(milestoneHeaders.length, 1);

// Parse --milestone N from CLI (1-indexed, human-friendly).
const msFlag = process.argv.indexOf("--milestone");
const cliMilestone = msFlag !== -1 ? parseInt(process.argv[msFlag + 1], 10) : 1;
if (isNaN(cliMilestone) || cliMilestone < 1 || cliMilestone > TOTAL_MILESTONES) {
  console.error(`Invalid --milestone value. Must be 1..${TOTAL_MILESTONES} (found ${TOTAL_MILESTONES} milestones in project-todo.md).`);
  process.exit(1);
}
const MILESTONE_INDEX = cliMilestone - 1; // convert to 0-indexed

console.log(`Milestone: ${MILESTONE_INDEX + 1} of ${TOTAL_MILESTONES}`);

// Mirror of the route's system prompt (milestone-aware).
function buildSystemPrompt(milestoneIndex, totalMilestones) {
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

const SYSTEM_PROMPT = buildSystemPrompt(MILESTONE_INDEX, TOTAL_MILESTONES);

const url_content = [
  "## CURRENT MILESTONE",
  `This dispute concerns **milestone ${MILESTONE_INDEX + 1} of ${TOTAL_MILESTONES}**.`,
  ...(MILESTONE_INDEX > 0
    ? [`Milestones 1–${MILESTONE_INDEX} have already been accepted and are NOT under review.`]
    : []),
  `Evaluate ONLY the to-do items scoped to milestone ${MILESTONE_INDEX + 1}.`,
  "",
  "## PROJECT TO-DO LIST", todo, "",
  "## WORKER SUBMISSION", submission, "",
  "## INVESTOR REJECTION REASONS",
  rejectionReasons.map((r, i) => `${i + 1}. ${r}`).join("\n"), "",
  `Decide whether the rejection is justified FOR MILESTONE ${MILESTONE_INDEX + 1} ONLY and return the JSON verdict.`,
].join("\n");

function extractJson(raw) {
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s === -1 || e < s) throw new Error("no JSON in response");
  return JSON.parse(raw.slice(s, e + 1));
}

let raw = "";
let apiUsed = "Google Gemini (Direct)";

// 1. Try native Google Gemini API first
if (KEY && KEY !== "undefined") {
  try {
    console.log(`Model: ${MODEL}\nCalling Google Gemini (Direct) ...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: url_content }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        raw = data.candidates[0].content.parts[0].text;
      }
    } else {
      console.warn(`Direct Gemini API returned HTTP ${res.status}, trying OpenRouter fallback...`);
    }
  } catch (e) {
    console.warn("Direct Gemini API fetch failed, trying OpenRouter fallback...");
  }
}

// 2. Fall back to OpenRouter
if (!raw) {
  const openrouterKey = env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    console.error("Direct Gemini call failed and no OPENROUTER_API_KEY is available in .env.local.");
    process.exit(1);
  }
  
  let orModel = MODEL;
  if (!orModel.includes("/")) {
    if (orModel.includes("gemini")) {
      orModel = `google/${orModel}`;
    } else {
      orModel = `google/gemini-flash-1.5`;
    }
  }

  apiUsed = `OpenRouter (${orModel})`;
  console.log(`Calling Gemini via OpenRouter (${orModel}) ...`);
  
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      "content-type": "application/json",
      "X-Title": "Vindex",
    },
    body: JSON.stringify({
      model: orModel,
      max_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: url_content },
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
  raw = data.choices?.[0]?.message?.content ?? "";
}

console.log(`Using API: ${apiUsed}\n`);

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

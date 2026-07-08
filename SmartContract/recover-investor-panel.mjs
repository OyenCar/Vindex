/**
 * Reconstructs the exact edits made to InvestorPanel.tsx in steps 140-212.
 * Run: node SmartContract/recover-investor-panel.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transcriptPath = 'C:/Users/Asus/.gemini/antigravity-ide/brain/595259fd-e0bd-4e98-a4e4-8a8ff7867cf3/.system_generated/logs/transcript_full.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript file not found");
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let out = "";

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index >= 140 && obj.step_index <= 250 && obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (JSON.stringify(tc).includes("InvestorPanel.tsx")) {
          out += `\n### STEP ${obj.step_index} (${tc.name})\n`;
          if (tc.args.Instruction || tc.args.instruction) {
            out += `  Instruction: ${tc.args.Instruction || tc.args.instruction}\n`;
          }
          if (tc.args.TargetContent || tc.args.targetContent) {
            out += `  Target:\n${tc.args.TargetContent || tc.args.targetContent}\n`;
          }
          if (tc.args.ReplacementContent || tc.args.replacementContent) {
            out += `  Replacement:\n${tc.args.ReplacementContent || tc.args.replacementContent}\n`;
          }
          if (tc.args.ReplacementChunks || tc.args.replacementChunks) {
            out += `  Chunks:\n${JSON.stringify(tc.args.ReplacementChunks || tc.args.replacementChunks, null, 2)}\n`;
          }
        }
      }
    }
  } catch (e) {
    // Ignore
  }
}

fs.writeFileSync(path.join(__dirname, 'recovered-code.txt'), out);
console.log("Recovered code written to recovered-code.txt");

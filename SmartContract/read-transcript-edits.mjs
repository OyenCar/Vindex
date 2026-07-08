/**
 * Helper to extract edit chunks for InvestorPanel.tsx from the transcript.
 * Run: node SmartContract/read-transcript-edits.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transcriptPath = 'C:/Users/Asus/.gemini/antigravity-ide/brain/595259fd-e0bd-4e98-a4e4-8a8ff7867cf3/.system_generated/logs/transcript.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript file not found at:", transcriptPath);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const hasInvestorPanel = JSON.stringify(obj).includes("InvestorPanel.tsx");
    if (hasInvestorPanel) {
      console.log(`\n================ STEP ${obj.step_index} (${obj.type}) ================`);
      if (obj.tool_calls) {
        // Find the replace_file_content tool calls and print their replacement chunk content
        for (const tc of obj.tool_calls) {
          if (tc.name === "replace_file_content" || tc.name === "multi_replace_file_content") {
            console.log("Tool:", tc.name);
            console.log("Instruction:", tc.args.Instruction || tc.args.instruction);
            console.log("Target:", tc.args.TargetContent || tc.args.targetContent);
            console.log("Replacement:", tc.args.ReplacementContent || tc.args.replacementContent);
          } else {
            console.log("Other Tool Call:", tc.name, JSON.stringify(tc.args));
          }
        }
      } else if (obj.content) {
        console.log("Content snippet (first 1000 chars):", obj.content.slice(0, 1000));
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
}

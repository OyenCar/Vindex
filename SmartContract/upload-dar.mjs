/**
 * Script to automatically upload the compiled DAR to Seaport DevNet validator.
 * Run: node SmartContract/upload-dar.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse FrontEnd/.env.local to avoid dotenv dependency
const envPath = path.join(__dirname, '../FrontEnd/.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').replace(/\r/g, '').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const tokenUrl = env.DAML_OIDC_TOKEN_URL;
const clientId = env.DAML_OIDC_CLIENT_ID;
const clientSecret = env.DAML_OIDC_CLIENT_SECRET;
const ledgerBaseUrl = env.LEDGER_PROXY_TARGET;

console.log("Parsed from .env.local:");
console.log("  tokenUrl:", tokenUrl);
console.log("  clientId:", clientId);
console.log("  clientSecret:", clientSecret ? "PRESENTS (length " + clientSecret.length + ")" : "MISSING");
console.log("  ledgerBaseUrl:", ledgerBaseUrl);

const darPath = path.join(__dirname, 'daml/dist/vindex-0.2.0.dar');

if (!fs.existsSync(darPath)) {
  // Try .daml/dist/vindex-0.2.0.dar
  const altPath = path.join(__dirname, '.daml/dist/vindex-0.2.0.dar');
  if (fs.existsSync(altPath)) {
    console.log("Using alternative DAR path:", altPath);
    process.env.DAR_PATH = altPath;
  } else {
    console.error("DAR file not found at:", darPath);
    process.exit(1);
  }
} else {
  process.env.DAR_PATH = darPath;
}

async function uploadDar() {
  console.log("Fetching access token...");
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('audience', clientId);
  params.append('scope', 'daml_ledger_api');

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    body: params,
  });

  if (!tokenRes.ok) {
    console.error("Failed to fetch token:", tokenRes.status, await tokenRes.text());
    process.exit(1);
  }

  const { access_token } = await tokenRes.json();
  console.log("Token obtained successfully.");

  const darData = fs.readFileSync(process.env.DAR_PATH);
  console.log(`Uploading DAR (${darData.length} bytes) to ${ledgerBaseUrl}/v2/packages ...`);

  const uploadRes = await fetch(`${ledgerBaseUrl}/v2/packages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: darData,
  });

  const uploadText = await uploadRes.text();
  console.log("Upload Status:", uploadRes.status);
  console.log("Response:", uploadText);
  if (uploadRes.status === 200 || uploadRes.status === 201 || uploadRes.status === 204) {
    console.log("DAR uploaded successfully!");
  } else {
    console.error("Failed to upload DAR");
    process.exit(1);
  }
}

uploadDar().catch(err => {
  console.error(err);
  process.exit(1);
});

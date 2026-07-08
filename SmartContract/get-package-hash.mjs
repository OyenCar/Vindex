/**
 * Script to fetch packages from Seaport DevNet validator and find our new package hash.
 * Run: node SmartContract/get-package-hash.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse FrontEnd/.env.local
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

async function main() {
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

  console.log("Listing packages from /v2/packages...");
  const res = await fetch(`${ledgerBaseUrl}/v2/packages`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch packages:", res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  // The structure of v2 packages list is usually an array of package IDs,
  // or a wrapper. Let's log it.
  console.log("Response structure keys:", Object.keys(data));
  console.log("Data length/type:", Array.isArray(data) ? `Array of ${data.length}` : typeof data);
  
  // Let's print the first few package IDs, or if it's an array, look for the package details.
  const pkgIds = Array.isArray(data) ? data : (data.packageIds || data.packages || []);
  console.log("Total package IDs on validator:", pkgIds.length);

  // Often, /v2/packages returns just the package hashes. We can fetch the metadata for each,
  // or search our local .dar for its own hash!
  // Wait, let's find the hash of the local .dar file using the daml command or reading the manifest.
  // Actually, we can read the DAR using standard zip tool or just fetch package metadata.
  // But wait, the compiled DAR hash is also printed when doing codegen or building or we can run:
  // "daml damlc inspect-dar" or "dpm" commands.
}

main().catch(console.error);

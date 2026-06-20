# Verdix seed helper — run AFTER the sandbox is up ("Canton sandbox is ready.").
# Uploads the DAR, allocates Investor/Worker/Agent, and writes the new party ids into
# FrontEnd/.env.local. Then restart json-api and `npm run dev`.
#
#   cd SmartContract
#   .\seed.ps1
#
param(
  [int]$Port = 6865,
  [string]$DamlExe = "$env:APPDATA\daml\bin\daml.cmd",
  [string]$EnvFile = "$PSScriptRoot\..\FrontEnd\.env.local"
)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path $DamlExe)) { $DamlExe = "daml" }  # fall back to PATH

Write-Host "==> Uploading DAR to localhost:$Port ..." -ForegroundColor Cyan
& $DamlExe ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port $Port

Write-Host "==> Allocating parties ..." -ForegroundColor Cyan
& $DamlExe ledger allocate-parties Investor Worker Agent --host localhost --port $Port | Out-Null

# Pull the authoritative ids from the ledger (works whether or not they already existed).
$lp = (& $DamlExe ledger list-parties --host localhost --port $Port | Out-String)
function Get-Party([string]$role) {
  if ($lp -match "($role::[0-9a-fA-F]+)") { return $Matches[1] } else { return $null }
}
$inv = Get-Party "Investor"; $wor = Get-Party "Worker"; $agt = Get-Party "Agent"
if (-not ($inv -and $wor -and $agt)) { throw "Could not read all party ids from list-parties." }

Write-Host "  Investor = $inv"
Write-Host "  Worker   = $wor"
Write-Host "  Agent    = $agt"

# Rewrite the three NEXT_PUBLIC_PARTY_* lines in .env.local (UTF-8, no BOM).
$envPath = (Resolve-Path $EnvFile).Path
$lines = Get-Content $envPath | ForEach-Object {
  if     ($_ -match '^\s*NEXT_PUBLIC_PARTY_INVESTOR=') { "NEXT_PUBLIC_PARTY_INVESTOR=$inv" }
  elseif ($_ -match '^\s*NEXT_PUBLIC_PARTY_WORKER=')   { "NEXT_PUBLIC_PARTY_WORKER=$wor" }
  elseif ($_ -match '^\s*NEXT_PUBLIC_PARTY_AGENT=')    { "NEXT_PUBLIC_PARTY_AGENT=$agt" }
  else { $_ }
}
[System.IO.File]::WriteAllLines($envPath, $lines)

Write-Host "==> .env.local updated. Now restart json-api and 'npm run dev'." -ForegroundColor Green

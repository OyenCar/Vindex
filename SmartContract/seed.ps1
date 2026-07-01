# Vindex seed helper — run AFTER the sandbox is up ("Canton sandbox is ready.").
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
# NOTE: keep this "Continue", NOT "Stop". The Daml CLI prints an "SDK x released" notice to
# stderr; under ErrorActionPreference=Stop, PowerShell 5.1 wraps native stderr as a terminating
# NativeCommandError and kills the script mid-run (DAR uploads, then allocate-parties never runs).
# We check $LASTEXITCODE for real failures instead. Do NOT add 2>$null on native calls — the
# redirect itself triggers the same wrapping under Stop.
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

if (-not (Test-Path $DamlExe)) { $DamlExe = "daml" }  # fall back to PATH

Write-Host "==> Uploading DAR to localhost:$Port ..." -ForegroundColor Cyan
& $DamlExe ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port $Port
if ($LASTEXITCODE -ne 0) { Write-Error "upload-dar failed (exit $LASTEXITCODE)"; exit 1 }

Write-Host "==> Allocating parties ..." -ForegroundColor Cyan
& $DamlExe ledger allocate-parties Investor Worker Agent Public --host localhost --port $Port | Out-Null

# Pull the authoritative ids from the ledger (works whether or not they already existed).
$lp = (& $DamlExe ledger list-parties --host localhost --port $Port | Out-String)
function Get-Party([string]$role) {
  if ($lp -match "($role::[0-9a-fA-F]+)") { return $Matches[1] } else { return $null }
}
$inv = Get-Party "Investor"; $wor = Get-Party "Worker"; $agt = Get-Party "Agent"; $pub = Get-Party "Public"
if (-not ($inv -and $wor -and $agt -and $pub)) { throw "Could not read all party ids from list-parties." }

Write-Host "  Investor = $inv"
Write-Host "  Worker   = $wor"
Write-Host "  Agent    = $agt"
Write-Host "  Public   = $pub"

# Upsert the party ids + worker pool in .env.local (UTF-8, no BOM). Replace matching lines;
# append any that don't exist yet (WORKER_POOL is new). The pool lists both workers
# so an open posting is visible to both and a real multi-applicant selection vote can happen.
$envPath = (Resolve-Path $EnvFile).Path
$want = [ordered]@{
  "NEXT_PUBLIC_PARTY_INVESTOR" = $inv
  "NEXT_PUBLIC_PARTY_WORKER"   = $wor
  "NEXT_PUBLIC_PARTY_AGENT"    = $agt
  "NEXT_PUBLIC_PARTY_PUBLIC"   = $pub
  "NEXT_PUBLIC_WORKER_POOL"    = "$wor"
}
$seen = @{}
$lines = @(Get-Content $envPath | ForEach-Object {
  $line = $_
  foreach ($k in $want.Keys) {
    if ($line -match "^\s*$k=") { $seen[$k] = $true; $line = "$k=$($want[$k])"; break }
  }
  $line
})
foreach ($k in $want.Keys) { if (-not $seen[$k]) { $lines += "$k=$($want[$k])" } }
[System.IO.File]::WriteAllLines($envPath, $lines)

Write-Host "==> .env.local updated. Now restart json-api and 'npm run dev'." -ForegroundColor Green

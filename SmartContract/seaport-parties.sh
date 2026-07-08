#!/usr/bin/env bash
# Allocate Investor/Worker/Agent on the Seaport DevNet participant and grant the M2M user (sub=6)
# actAs on each. Run in Git Bash:  bash SmartContract/seaport-parties.sh
# Requires: curl. Party hints MUST be exactly Investor/Worker/Agent (contract isWorkerParty +
# frontend getRole depend on the name segment before "::").
set -euo pipefail

LEDGER="https://ledger-api.validator.devnet.sandbox.fivenorth.io"
CLIENT_ID="validator-devnet-m2m"
# Secret is NOT hardcoded. Export it first:  export VALIDATOR_M2M_CLIENT_SECRET='...'
CLIENT_SECRET="${VALIDATOR_M2M_CLIENT_SECRET:?set VALIDATOR_M2M_CLIENT_SECRET before running}"
USER_ID="6"   # ledger user the M2M token maps to (JWT sub)

echo "== mint admin token =="
TOKEN=$(curl -s -X POST 'https://auth.sandbox.fivenorth.io/application/o/token/' \
  -d grant_type=client_credentials -d "client_id=$CLIENT_ID" -d "client_secret=$CLIENT_SECRET" \
  -d audience="$CLIENT_ID" -d scope=daml_ledger_api \
  | sed -E 's/.*"access_token": *"([^"]+)".*/\1/')
[ -n "$TOKEN" ] || { echo "no token"; exit 1; }

declare -A PID
for HINT in Investor Worker Agent; do
  echo "== allocate $HINT =="
  RESP=$(curl -sS -X POST "$LEDGER/v2/parties" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"partyIdHint\":\"$HINT\",\"identityProviderId\":\"\"}")
  echo "$RESP"
  P=$(echo "$RESP" | grep -oE "\"party\":\"$HINT::[^\"]+\"" | head -1 | sed -E 's/"party":"([^"]+)"/\1/')
  if [ -z "$P" ]; then
    echo "!! could not allocate/parse $HINT (maybe the hint is already taken on this namespace)."
    echo "   Inspect the response above; may need a fix to isWorkerParty or a different hint."
    exit 1
  fi
  PID[$HINT]="$P"
  echo "   -> ${PID[$HINT]}"
done

echo "== grant CanActAs to user $USER_ID =="
for HINT in Investor Worker Agent; do
  curl -sS -X POST "$LEDGER/v2/users/$USER_ID/rights" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"rights\":[{\"kind\":{\"CanActAs\":{\"value\":{\"party\":\"${PID[$HINT]}\"}}}}]}" \
    -w "  grant $HINT HTTP=%{http_code}\n"
  echo
done

echo
echo "==================== .env.local (paste into FrontEnd/.env.local) ===================="
echo "NEXT_PUBLIC_PARTY_INVESTOR=${PID[Investor]}"
echo "NEXT_PUBLIC_PARTY_WORKER=${PID[Worker]}"
echo "NEXT_PUBLIC_PARTY_AGENT=${PID[Agent]}"
echo "NEXT_PUBLIC_WORKER_POOL=${PID[Worker]}"
echo "===================================================================================="

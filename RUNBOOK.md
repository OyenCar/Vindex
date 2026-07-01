# Vindex — Run & Demo Runbook

Everything needed to start the app from a cold machine, the full feature list, and a click‑through
demo script. Windows / PowerShell paths are shown; on macOS/Linux use the same commands with `daml`
on your `PATH`.

> On Windows the Daml CLI lives at `C:\Users\<you>\AppData\Roaming\daml\bin\daml.cmd`. If `daml`
> isn't recognized in a fresh terminal, add that folder to your PATH (or call the full path).

---

## 0. Prerequisites (one time)

| Tool | Version | Check |
|---|---|---|
| Daml SDK | 2.9.4 | `daml version` |
| Java (JDK) | 11–17 (works on newer) | `java -version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Pinata account | free | for real IPFS uploads (optional) |

The Daml contract is already built — `SmartContract/.daml/dist/vindex-0.1.0.dar` — and the frontend
bindings are generated under `FrontEnd/daml.js/`. You only rebuild those after editing the contract
(see §6).

---

## 1. Start the ledger stack

You need **three** long‑running processes. Keep the **sandbox** running for the whole session — it
is in‑memory, so stopping it wipes all contracts **and** the party ids.

**Terminal A — Canton sandbox (leave running):**
```powershell
cd "D:\code progression\web3'\hackathon\Vindex\SmartContract"
daml sandbox --static-time --port 6865
# wait for: "Canton sandbox is ready."
```

**Terminal B — upload contracts + allocate parties (run once per sandbox start):**
```powershell
cd "D:\code progression\web3'\hackathon\Vindex\SmartContract"
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
daml ledger allocate-parties Investor Worker Agent --host localhost --port 6865
# copy the three printed party ids (Investor::1220…, Worker::1220…, Agent::1220…)
```

**Terminal C — JSON Ledger API (leave running):**
```powershell
cd "D:\code progression\web3'\hackathon\Vindex\SmartContract"
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575 --allow-insecure-tokens
# wait until http://localhost:7575/readyz returns 200
```

---

## 2. Configure the frontend (`FrontEnd/.env.local`)

```env
# Local sandbox: browser HTTP via the Next /ledger/ proxy; websocket direct to json-api.
NEXT_PUBLIC_LEDGER_HTTP_URL=/ledger/
NEXT_PUBLIC_LEDGER_WS_URL=ws://localhost:7575/
NEXT_PUBLIC_LEDGER_RECONNECT_MS=30000
LEDGER_PROXY_TARGET=http://localhost:7575

# Paste the ids printed by allocate-parties (they change every fresh sandbox).
NEXT_PUBLIC_PARTY_INVESTOR=Investor::1220...
NEXT_PUBLIC_PARTY_WORKER=Worker::1220...
NEXT_PUBLIC_PARTY_AGENT=Agent::1220...

# Dev-mode token signing (must be "dev" for a local sandbox).
DAML_AUTH_MODE=dev
DAML_JWT_SECRET=secret
DAML_LEDGER_ID=sandbox

# Real IPFS uploads (optional — falls back to a local hash if unset).
PINATA_JWT=eyJ...
PINATA_GATEWAY=https://gateway.pinata.cloud
```

> **Lost the party ids?** `daml ledger list-parties --host localhost --port 6865`.

---

## 3. Run the app

**Terminal D — frontend (leave running):**
```powershell
cd "D:\code progression\web3'\hackathon\Vindex\FrontEnd"
npm install        # first time only
npm run dev
```

Open:
- `http://localhost:3000/` — landing page
- `http://localhost:3000/app` — protocol console
- `http://localhost:3000/app/explorer` — live explorer

> **Restart `npm run dev` whenever you edit `.env.local`** — Next only reads it at startup.

---

## 4. Feature list

**Landing (`/`)**
- Hero + live protocol visualization
- System (five‑layer vertical), How It Works, Tech Stack sections, footer
- CTAs into the console / explorer

**Console (`/app`)** — connect as a party, then per role:
- **Investor:** create Investor Party · write a description + upload a brief (IPFS) · fund Budget +
  Agent‑Fee vaults & post a job (with a worker candidate) · review applicants & **Select & make
  offer** · vote Accept · **Vote Reject + reasons** · Finalize review
- **Worker:** view postings (+ brief) · upload portfolio & **Apply** · accept the offer (locks the
  commitment vault) · upload a deliverable (IPFS) & **Submit milestone**
- **Agent:** see disputes in `RejPending` · open the deliverable · rule **valid / invalid** ·
  trigger a worker‑deadline violation

**Explorer (`/app/explorer`)** — live counts + tables for parties, postings, projects, reviews,
governance proposals, vaults, disputes, and settlements.

**Validation / safety built in:** budget must cover Σ payment·(1+penalty); can't post a milestone
larger than the budget; can't double‑post a job; human‑readable ledger errors.

---

## 5. Demo script (end‑to‑end, ~5 min)

1. **Investor** — connect (Investor tile → Connect). Create Investor Party (paste the **Agent** id
   in the agent field). Write a description, upload a brief file, set the **Worker candidate id** to
   your Worker party, fund and **Post Job**.
2. **Worker** — disconnect, connect as Worker. The posting (with the brief) appears. Upload a
   portfolio and **Apply**.
3. **Investor** — reconnect. The applicant shows under **Applicants** → **Select & make offer**.
4. **Worker** — reconnect. Accept the offer (commitment vault locks). Upload a deliverable file and
   **Submit milestone**.
5. **Investor** — reconnect. **Vote Accept** → **Finalize review** → payment releases and the
   project settles. *(Or: Vote Reject + reasons → Finalize → it moves to the Agent.)*
6. **Agent** — connect. If you took the reject path, open the deliverable and rule valid/invalid.
7. **Explorer** — watch vaults, project status badges, and the settlement update live.

> **Static‑time note:** the sandbox clock doesn't advance, so deadline‑based actions
> ("Trigger worker violation", auto‑accept on review timeout) can't fire in a normal click‑through.
> They are covered by the Daml Script tests (`daml test` in `SmartContract/`).

---

## 6. After editing the Daml contract

Editing `SmartContract/daml/Vindex.daml` changes the package id, so regenerate and re‑upload:
```powershell
cd "D:\code progression\web3'\hackathon\Vindex\SmartContract"
daml build
daml codegen js .daml/dist/vindex-0.1.0.dar -o ../FrontEnd/daml.js
cd ..\FrontEnd; npm install                      # relink the regenerated bindings
cd ..\SmartContract
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
# restart json-api (Terminal C) and npm run dev (Terminal D)
```

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Token request failed (500): hosted mode…` | `DAML_AUTH_MODE` ≠ dev | set `DAML_AUTH_MODE=dev`, restart dev server |
| `Failed to fetch` / "Connecting…" forever | `.env.local` points at the placeholder host | use `/ledger/` + `ws://localhost:7575/`, restart dev server |
| `Cannot resolve template ID` / "ledger doesn't have the Vindex package" | DAR not on the sandbox (or sandbox restarted) | re‑upload the DAR, restart json‑api |
| `Unexpected end of JSON input` on "Register a new party" | not needed — parties already allocated | pick a role tile and **Connect** |
| Party actions fail after a sandbox restart | fresh sandbox = new party ids | re‑allocate, paste new ids into `.env.local`, restart dev server |
| `WorkerViolation` errors out | worker deadline hasn't passed (static time) | expected — use `daml test` to exercise it |

---

## 8. Quick recovery (sandbox was restarted)

The sandbox is in‑memory: every restart wipes the DAR **and** re‑randomizes the party ids. Run the
**sandbox in its own terminal** (background processes that another tool starts can be killed). Once
it says "ready", seed it in one command:

```powershell
cd "D:\code progression\web3'\hackathon\Vindex\SmartContract"
.\seed.ps1        # uploads the DAR, allocates parties, rewrites FrontEnd/.env.local
```

Then restart `json-api` and `npm run dev`. Manual equivalent:
```powershell
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
daml ledger allocate-parties Investor Worker Agent --host localhost --port 6865
daml ledger list-parties --host localhost --port 6865   # copy ids → FrontEnd/.env.local
```

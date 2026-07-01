# Creating a New Individual (Account) on Vindex

An "account" / "individual" in Vindex is a **Canton party** — a ledger identity like
`Investor2::1220ab…`. There's no email/password; you authenticate by holding a token for a party
(the dev sandbox mints one for you). One party = one independent user.

> The local sandbox is **in-memory**: every sandbox restart re-randomizes party ids. After a restart,
> re-create / re-seed parties and use the new ids. The id suffix (`::1220…`) is the participant's
> namespace fingerprint — it's the same for every party allocated in one sandbox run.

---

## 3 ways to create a new party

### 1. In-app — easiest (no terminal)
1. Open `http://localhost:3000/app`.
2. On the connect card, click **"+ Register a new party on the ledger"**.
   - This calls `/api/daml-party`, allocates a brand-new party on the participant, and fills its id
     into the **Party ID** box.
3. Pick a role tile (Investor / Worker / AI Agent) for the UI, then **Connect party**.

Use this when you just need a throwaway identity quickly.

### 2. CLI — named, reusable
```powershell
$daml = "$env:APPDATA\daml\bin\daml.cmd"   # or just "daml" if on PATH

# allocate one (name is a hint; the real id gets the ::1220… suffix)
& $daml ledger allocate-parties Investor2 --host localhost --port 6865

# read its full id back
& $daml ledger list-parties --host localhost --port 6865
```
Copy the printed `Investor2::1220…` id.

### 3. seed.ps1 — the standard demo set
`SmartContract/seed.ps1` allocates **Investor / Worker / Worker2 / Agent** and writes their ids into
`FrontEnd/.env.local` (and the worker pool). Run it after the sandbox is up:
```powershell
cd SmartContract
.\seed.ps1
```

---

## Logging in as the new account (separate accounts = separate browsers)
A session is stored **per browser** (localStorage). To run two accounts at once, use two browser
contexts:

1. **Browser / profile A** → `http://localhost:3000/app` → pick a role tile → **Connect** (uses the
   prefilled id).
2. **Browser / profile B (or an incognito window)** → `http://localhost:3000/app` → paste the *other*
   party's id into the **Party ID** box → **Connect**.

Each context is an independent account. The same trick separates Investor / Worker / Worker2 / Agent.

---

## Your freshly-allocated investor
Ready to use right now (this sandbox run):
```
Investor2::122089e5044cc17cef19aa0db813166e3f807f1f98db9fb7c9d617f770b77d9d9aa4
```
To use it: open the app in a separate browser/incognito window → **Investor Party** tile → replace the
**Party ID** with the id above → **Connect**. Then create its own Investor Party and post a job — it's
fully independent from the default `Investor` account.

> Want this prefilled as a tab on the connect screen instead of pasting? Add
> `NEXT_PUBLIC_PARTY_INVESTOR2=Investor2::1220…` to `.env.local` and ask me to wire a second investor
> preset — but for true "separate accounts" the paste-in-another-browser flow above is the real model.

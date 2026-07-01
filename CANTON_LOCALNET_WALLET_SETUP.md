# Troubleshooting Guide: Canton LocalNet Wallet UI

## Problem Diagnosis

You are running the **gRPC Ledger API backend** on port 6865, but the **Web UI Wallet does not appear** at `http://wallet.localhost:2000`.

### Root Cause

❌ **Port 6865 is the Canton Participant Ledger API, not the complete LocalNet stack**

If you only run:
```bash
daml sandbox --port 6865
```

Then **only the sandbox** runs, without:
- ❌ Canton Coin Wallet frontend
- ❌ Nginx gateway
- ❌ PQS (Participant Query Store)
- ❌ HTTP JSON API endpoints
- ❌ Scan UI
- ❌ SV (Super Validator) services

---

## Solution 1: Run the Complete Canton Network LocalNet (RECOMMENDED)

### Prerequisites

```bash
# Install tools
git
docker
docker-compose
make
direnv  # optional but highly recommended
```

### Setup Steps

#### 1. Clone the Canton Network Quickstart Repository

```bash
cd G:\web3\Hackathon\CantonEncode\

git clone https://github.com/digital-asset/cn-quickstart.git
cd cn-quickstart
```

#### 2. Allow direnv (Optional)

```bash
direnv allow
```

#### 3. Navigate to the Quickstart Directory

```bash
cd quickstart
```

#### 4. Install the Daml SDK

```bash
make install-daml-sdk
```

#### 5. Setup the Environment

```bash
make setup
```

**Options during setup:**
- **Deployment profile**: Choose `Standard` (includes the Wallet UI)
- **OAuth2**: Choose `Yes` if you want authentication, `No` for demo mode

This will generate a `.env.local` file in the `quickstart/` directory.

#### 6. Build the Application

```bash
make build
```

This process will:
- Compile Daml contracts
- Build the Java backend
- Build the React frontend (including the Wallet UI)

#### 7. Start the LocalNet Stack

```bash
make start
```

Docker Compose will launch the **entire stack**:
- 3 Canton Participants (App User, App Provider, SV)
- 3 Validators
- PostgreSQL databases
- **Nginx gateway** (essential for routing `*.localhost`)
- **Wallet UIs** on ports 2000 and 3000
- HTTP JSON API endpoints
- PQS instances
- Scan UI (optional)

#### 8. Verify Services

```bash
make status
```

Correct output:
```
NAME                    STATUS    PORTS
nginx                   Up        0.0.0.0:2000->2000/tcp, 0.0.0.0:3000->3000/tcp, ...
canton                  Up        0.0.0.0:2901->2901/tcp, 0.0.0.0:3901->3901/tcp, ...
wallet-app-user         Up        (behind nginx)
wallet-app-provider     Up        (behind nginx)
postgres                Up        0.0.0.0:5432->5432/tcp
...
```

#### 9. Access the Wallet UI

Add the following to `C:\Windows\System32\drivers\etc\hosts` (run as Administrator):

```
127.0.0.1   wallet.localhost
127.0.0.1   ans.localhost
127.0.0.1   app-provider.localhost
127.0.0.1   scan.localhost
127.0.0.1   sv.localhost
127.0.0.1   keycloak.localhost
```

**Access URLs:**

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| App User Wallet | http://wallet.localhost:2000 | 2000 | User wallet interface |
| App User ANS | http://ans.localhost:2000 | 2000 | Address Name Service |
| App Provider Wallet | http://wallet.localhost:3000 | 3000 | Provider wallet interface |
| App Provider ANS | http://ans.localhost:3000 | 3000 | ANS for provider |
| Scan UI | http://scan.localhost:4000 | 4000 | Transaction explorer |
| SV UI | http://sv.localhost:4000 | 4000 | Super Validator UI |

#### 10. Login Credentials

**Default users** (if OAuth2 is disabled):
- **App User**: username `app-user`
- **App Provider**: username `app-provider`
- **SV**: username `sv`

**If OAuth2 is enabled** (Keycloak):
- Keycloak Admin Console: http://keycloak.localhost:8082
- Default admin credentials: `admin` / `admin` (check `.env.local`)

---

## Solution 2: Daml Navigator (Minimal Alternative)

If you **do not need the Canton Coin wallet** but simply want a web browser UI to inspect contracts, use **Daml Navigator**.

### Setting Up Navigator

#### 1. Create a `daml.yaml` file in the Vindex project

**File: `SmartContract/daml.yaml`** (ensure it contains):

```yaml
sdk-version: 2.9.4
name: vindex
version: 0.1.0
source: daml
dependencies:
  - daml-prim
  - daml-stdlib
data-dependencies: []

parties:
  - Investor
  - Worker
  - Agent

navigator-options:
  - --port=4000
```

#### 2. Start Sandbox + Navigator

**Terminal 1: Start Sandbox**
```bash
cd G:\web3\Hackathon\CantonEncode\Vindex\SmartContract

daml sandbox --port 6865 --static-time
```

**Terminal 2: Start Navigator**
```bash
cd G:\web3\Hackathon\CantonEncode\Vindex\SmartContract

# Option 1: Start automatically with daml start
daml start --sandbox-port 6865 --navigator-port 4000

# Option 2: Start manually (if sandbox is already running)
daml navigator server localhost 6865 --port 4000
```

#### 3. Access Navigator

Open your browser and navigate to:
```
http://localhost:4000
```

Log in using the allocated party ID:
- `Investor` or `Investor::1220...` (the full party ID from allocate-parties)
- `Worker::1220...`
- `Agent::1220...`

### Navigator Features

✅ **View contracts**: See all active contracts visible to the logged-in party.
✅ **Exercise choices**: Click on a contract and trigger a choice with parameters.
✅ **Create contracts**: Submit creation commands via generated forms.
❌ **Not a wallet**: Navigator is a contract viewer, not a transaction-oriented token wallet.

---

## Solution 3: Canton Console (Developer Tool)

If you want **full control** via the command-line:

### 1. Start Canton with the Console Enabled

```bash
cd cn-quickstart/quickstart

make canton-console
```

Or manually:

```bash
cd SmartContract

canton -c canton-config.conf --bootstrap bootstrap.canton console
```

### 2. Example Canton Console Commands

```scala
// List participants
participants.list

// List parties
participant1.parties.list()

// Allocate party
participant1.parties.enable("Investor")

// Upload DAR
participant1.dars.upload(".daml/dist/vindex-0.1.0.dar")

// List contracts
participant1.ledger_api.acs.of_all()
```

---

## Port Reference: Canton LocalNet

### Web UIs

| Service | Port | URL Pattern | Description |
|---------|------|-------------|------------|
| App User Wallet | **2000** | `wallet.localhost:2000` | User wallet & ANS |
| App Provider Wallet | **3000** | `wallet.localhost:3000` | Provider wallet & app frontend |
| SV/Scan UI | **4000** | `sv.localhost:4000`, `scan.localhost:4000` | Admin & explorer |
| Daml Navigator | 4000 | `localhost:4000` | Contract browser (if using daml navigator) |

### Backend APIs

| Service | Port | Description |
|---------|------|------------|
| **App User** Ledger API | **2901** | gRPC |
| **App User** Admin API | 2902 | gRPC |
| **App User** JSON API | 2975 | HTTP |
| **App User** Validator API | 2903 | HTTP |
| **App Provider** Ledger API | **3901** | gRPC |
| **App Provider** Admin API | 3902 | gRPC |
| **App Provider** JSON API | 3975 | HTTP |
| **App Provider** Validator API | 3903 | HTTP |
| **SV** Ledger API | 4901 | gRPC |
| **SV** Admin API | 4902 | gRPC |
| **SV** JSON API | 4975 | HTTP |
| **SV** Validator API | 4903 | HTTP |
| PostgreSQL | **5432** | Database |
| Keycloak (via nginx) | 8082 | OAuth2 IdP |
| Grafana (if observability) | 3030 | Metrics dashboard |

---

## Troubleshooting Common Issues

### Issue 1: `wallet.localhost:2000` → ERR_CONNECTION_REFUSED

**Cause**: The Nginx gateway is not running or the wallet container failed to start.

**Fix**:
```bash
cd cn-quickstart/quickstart

# Check status
make status

# Restart if any container is Exited
make restart

# Check nginx logs
docker logs nginx

# Check app user wallet logs
docker logs $(docker ps -qf "name=wallet.*app-user")
```

### Issue 2: `wallet.localhost:2000` → DNS_PROBE_FINISHED_NXDOMAIN

**Cause**: The hosts file is missing the required local domain entries.

**Fix**:
1. Open Notepad **as Administrator**.
2. Open the file: `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following lines:
   ```
   127.0.0.1   wallet.localhost
   127.0.0.1   ans.localhost
   127.0.0.1   app-provider.localhost
   127.0.0.1   scan.localhost
   127.0.0.1   sv.localhost
   ```
4. Save the file, restart your browser, and try again.

### Issue 3: Docker Compose Memory Error

**Cause**: The Docker Desktop resource limits are configured too low.

**Fix**:
1. Open Docker Desktop → Settings → Resources.
2. Set **Memory** to at least **8 GB** (12 GB recommended).
3. Set **CPUs** to at least **4 cores**.
4. Apply and restart Docker.

### Issue 4: Container Health Check Failed

**Cause**: Services did not start in time or there is a port conflict on the host.

**Fix**:
```bash
# Stop everything
make stop

# Clean volumes
make clean-all

# Check for port conflicts on the host
netstat -ano | findstr "2000"
netstat -ano | findstr "3000"
netstat -ano | findstr "6865"

# Rebuild and start fresh
make build
make start
```

### Issue 5: `make start` Stuck at "Waiting for services..."

**Cause**: A crucial dependency service is not healthy or is slow to initialize.

**Fix**:
```bash
# Open a new terminal and check the logs
make logs

# Or inspect a specific service
docker logs postgres
docker logs canton
docker logs splice-onboarding

# Postgres or Canton might need a few minutes to start up.
```

---

## Comparison: LocalNet vs Sandbox vs Navigator

| Feature | **LocalNet (cn-quickstart)** | **Daml Sandbox** | **Daml Navigator** |
|---------|------------------------------|------------------|--------------------|
| **Wallet UI** | ✅ Canton Coin Wallet | ❌ None | ❌ None |
| **Contract Viewer** | ✅ Via Wallet & Scan | ❌ None | ✅ Web UI |
| **Multi-participant** | ✅ 3 participants | ❌ Single | ❌ Single |
| **Canton Coin** | ✅ Token transfers | ❌ None | ❌ None |
| **JSON API** | ✅ Built-in | ⚠️ Manual start required | ⚠️ Manual start required |
| **Setup Complexity** | 🔴 High (Docker stack) | 🟢 Low (1 command) | 🟢 Low (1 command) |
| **Resource Usage** | 🔴 Heavy (8+ GB RAM) | 🟢 Light (~500 MB) | 🟢 Light (~300 MB) |
| **Use Case** | Production-like testing | Contract logic testing | Contract exploration |

---

## Recommendations for the Vindex Project

### For Vindex Contract Development

**Use: Daml Sandbox + Navigator**
```bash
cd SmartContract
daml start --sandbox-port 6865 --navigator-port 4000
```

**Reasoning:**
- Vindex contracts **do not require the Canton Coin wallet**.
- The sandbox is much lighter and faster for iterating on Daml code.
- Navigator is sufficient for testing contract choices.

### For End-to-End Demo with Frontend

**Use: The existing Vindex Next.js Frontend**
```bash
# Terminal 1: Ledger stack
cd SmartContract
daml sandbox --port 6865
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575

# Terminal 2: Frontend
cd FrontEnd
npm run dev
```

**Access:** http://localhost:3000/app

**Reasoning:**
- The Vindex frontend already contains customized panel interfaces for Investors, Workers, and Agents.
- Vindex uses its own `AssetVault` contracts instead of Canton Coin.
- The workflow is simpler than launching the full cn-quickstart LocalNet stack.

### For Exploring Canton Network Features

**Use: cn-quickstart LocalNet**

**Reasoning:**
- Ideal if you want to learn about Canton Coin, AMT, and Validator workflows.
- Required if you want to test multi-participant scenarios.
- Useful configuration reference for deploying to a Canton DevNet.

---

## Quick Start Cheat Sheet

### LocalNet (Full Stack)

```bash
# Clone & setup
git clone https://github.com/digital-asset/cn-quickstart.git
cd cn-quickstart/quickstart
make install-daml-sdk
make setup   # select Standard, OAuth2 optional
make build
make start

# Access
# http://wallet.localhost:2000 (App User)
# http://wallet.localhost:3000 (App Provider)
# http://scan.localhost:4000 (Explorer)

# Management
make status        # Check running services
make stop          # Stop all
make restart       # Restart all
make clean-all     # Clean data & rebuild
make logs          # View logs
make canton-console # Open Canton console
```

### Daml Navigator (Minimal UI)

```bash
# Start sandbox + navigator together
cd SmartContract
daml start --sandbox-port 6865 --navigator-port 4000

# Or separately
daml sandbox --port 6865  # Terminal 1
daml navigator server localhost 6865 --port 4000  # Terminal 2

# Access
# http://localhost:4000
```

### Vindex Frontend (Custom UI)

```bash
# Terminal 1: Ledger stack
cd SmartContract
daml build
daml sandbox --port 6865
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575

# Terminal 2: Upload DAR & allocate parties
daml ledger upload-dar .daml/dist/vindex-0.1.0.dar --host localhost --port 6865
daml ledger allocate-parties Investor Worker Agent --host localhost --port 6865
# Copy the resulting party IDs into FrontEnd/.env.local

# Terminal 3: Frontend
cd ../FrontEnd
npm install
npm run dev

# Access
# http://localhost:3000/app
```

---

## Summary

To **answer your question directly**:

### 1️⃣ **Correct Web UI Ports:**
- **Canton Coin Wallet** (LocalNet): Port **2000** (App User), **3000** (App Provider), **4000** (SV/Scan)
- **Daml Navigator**: Port **4000** (configurable)

### 2️⃣ **Docker Compose command:**
```bash
cd cn-quickstart/quickstart
make start  # This launches docker-compose with the full configuration
```

Or manually:
```bash
docker compose --profile app-provider --profile app-user --profile sv up -d
```

### 3️⃣ **Daml Navigator config:**

**File: `daml.yaml`**
```yaml
sdk-version: 2.9.4
name: vindex
version: 0.1.0
source: daml

navigator-options:
  - --port=4000
```

**Command:**
```bash
daml navigator server localhost 6865 --port 4000
```

---

## Actions You Should Take Now

**Select one path:**

### A. To run the full Canton Coin Wallet UI:
```bash
cd G:\web3\Hackathon\CantonEncode\
git clone https://github.com/digital-asset/cn-quickstart.git
cd cn-quickstart/quickstart
make install-daml-sdk
make setup
make build
make start
```
Then edit `C:\Windows\System32\drivers\etc\hosts` and access http://wallet.localhost:2000.

### B. If you only need a contract viewer:
```bash
cd G:\web3\Hackathon\CantonEncode\Vindex\SmartContract
daml start --sandbox-port 6865 --navigator-port 4000
```
Access http://localhost:4000.

### C. To continue developing Vindex with the existing UI:
```bash
# Terminal 1
cd G:\web3\Hackathon\CantonEncode\Vindex\SmartContract
daml sandbox --port 6865
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575

# Terminal 2
cd G:\web3\Hackathon\CantonEncode\Vindex\FrontEnd
npm run dev
```
Access http://localhost:3000/app.

Good luck! 🚀

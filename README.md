# ReleasePilot

**AI-powered release readiness analysis platform.**

ReleasePilot uses IBM Bob 2.0 to orchestrate a parallel multi-agent analysis of a target codebase, producing an evidence-based release readiness report.

```
READY / READY_WITH_WARNINGS / WARNING / BLOCKED
```

---

## Architecture

```
Target Project
    ↓
ReleasePilot API (Express)          ← creates analysis session
    ↓
IBM Bob Release Orchestrator        ← agents/AGENTS.md
    ↓ (parallel)
┌────────────────┬────────────────┬────────────────────┐
│ Code Risk      │ Test Analysis  │ Docs/Config        │
│ Subagent       │ Subagent       │ Subagent           │
└────────────────┴────────────────┴────────────────────┘
                    ↓
              Critic / Reviewer
                    ↓
          Evidence-Based Findings
                    ↓
    POST /api/analysis/:id/results
                    ↓
       READY / READY_WITH_WARNINGS / WARNING / BLOCKED
```

---

## How the ReleasePilot + IBM Bob workflow works

1. **ReleasePilot creates the analysis session.**  
   When the user clicks _Start Analysis_, the frontend POSTs to `/api/analysis` and a session JSON file is created with `status: "pending"`.  
   The UI immediately navigates to the report view and begins polling every 3 seconds.

2. **The user copies a Bob prompt and starts a Bob Agent session.**  
   The UI generates a ready-to-paste prompt containing the session ID, project path, and API base URL.

3. **Bob marks the session as `running`.**  
   The first thing Bob does is `PATCH /api/analysis/:id/status` with `{"status":"running"}`.  
   This updates the UI from "Pending" to "Running…".

4. **Bob delegates focused work to three subagents in parallel.**
   - **Code Risk** (`agents/subagents/code-risk/AGENTS.md`) — inspects source files for security vulnerabilities, reliability issues, and technical debt.
   - **Test Analysis** (`agents/subagents/test-analysis/AGENTS.md`) — runs existing tests where possible, identifies coverage gaps and unhealthy tests.
   - **Docs & Config** (`agents/subagents/docs-config/AGENTS.md`) — checks README, environment variables, CI/CD, and deployment configuration.

5. **A Critic reviews the findings.**  
   The orchestrator reviews every finding: drops those without concrete file+evidence, deduplicates cross-subagent findings, and adjusts severity if warranted.

6. **Final evidence-backed findings are submitted to ReleasePilot.**  
   Bob POSTs the reviewed findings array to `POST /api/analysis/:id/results`.

7. **ReleasePilot derives the final release status and displays the report.**  
   The server computes the status, saves the complete report JSON, and the polling UI renders the full findings list.

### Release status logic

| Findings contain | Status |
|-----------------|--------|
| Any `critical` | `BLOCKED` |
| Any `high` (no critical) | `WARNING` |
| Only `medium` (no higher) | `READY_WITH_WARNINGS` |
| Only `low` or none | `READY` |

---

## API Contract — what Bob uses to submit results

### Step 1 — Mark session as running

```http
PATCH http://localhost:3001/api/analysis/{id}/status
Content-Type: application/json

{"status": "running"}
```

### Step 2 — Submit findings

```http
POST http://localhost:3001/api/analysis/{id}/results
Content-Type: application/json

{
  "findings": [
    {
      "agent": "code-risk",
      "severity": "critical",
      "category": "security",
      "description": "One sentence describing the problem.",
      "affectedFiles": ["relative/path/to/file.js"],
      "evidence": "Exact quoted text or file:line reference.",
      "impact": "What breaks if this is not fixed.",
      "recommendation": "Specific actionable fix."
    }
  ]
}
```

**Response:**
```json
{ "id": "...", "status": "BLOCKED" }
```

### Mark as failed (if Bob cannot complete)

```http
PATCH http://localhost:3001/api/analysis/{id}/status
Content-Type: application/json

{"status": "failed"}
```

---

## Project Structure

```
releasepilot/
├── AGENTS.md                       # Developer/agent guidance for this repo
├── agents/                         # Bob orchestration instructions
│   ├── AGENTS.md                   # Orchestrator entry point (used by Bob)
│   └── subagents/
│       ├── code-risk/AGENTS.md
│       ├── test-analysis/AGENTS.md
│       └── docs-config/AGENTS.md
├── backend/                        # Node.js + Express API (port 3001)
│   ├── src/
│   │   ├── index.js
│   │   ├── controllers/            # analysisController, reportController
│   │   ├── routes/                 # analysis.js, reports.js
│   │   └── store/reportStore.js    # JSON file persistence
│   ├── tests/
│   └── data/reports/               # Auto-created; stores <uuid>.json
├── frontend/                       # React dashboard (port 3000)
│   └── src/
│       ├── App.js
│       ├── api/client.js
│       └── components/
└── package.json                    # Root — runs both services concurrently
```

---

## Quick Start (local)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Start both services

```bash
npm start
```

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

---

## Deploying to the Cloud

ReleasePilot uses a two-service deployment:

| Service | Platform | What it runs |
|---------|----------|-------------|
| Backend API | **Render** (free tier) | Node.js + Express |
| Frontend | **Vercel** (free tier) | React static build |

### Step 1 — Deploy the backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New → Web Service** and connect the `ReleasePilot` repo.
3. Render auto-detects `render.yaml` — confirm the settings match.
4. Add the environment variable in the Render dashboard:
   - `FRONTEND_URL` → *(leave blank for now — fill in after Vercel deploy)*
5. Click **Deploy**. Wait for the service to show **Live**.
6. Note your backend URL, e.g. `https://releasepilot-api.onrender.com`

> **Ephemeral storage warning** — Render free tier wipes the filesystem on every deploy/restart. Reports are lost. Fine for demos; for persistence upgrade to a paid disk or swap `reportStore.js` for a database.

---

### Step 2 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and import the `ReleasePilot` repo.
3. Set **Framework Preset** to `Create React App`.
4. Set **Root Directory** to `frontend`.
5. Add the environment variable:
   - `REACT_APP_API_URL` → `https://releasepilot-api.onrender.com` *(no trailing slash)*
6. Click **Deploy**. Note your URL, e.g. `https://releasepilot.vercel.app`

---

### Step 3 — Wire the two services together

1. Go back to **Render dashboard** → your service → **Environment**.
2. Set `FRONTEND_URL` → `https://releasepilot.vercel.app`
3. Render redeploys automatically. CORS is now locked to your frontend domain.

---

### Step 4 — Verify

```bash
curl https://releasepilot-api.onrender.com/api/health

curl -X POST https://releasepilot-api.onrender.com/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"/smoke","projectName":"smoke-test","branch":"main"}'
```

Open your Vercel URL — the UI should load and connect to the live API.

---

### Environment variable reference

**Backend (Render)**

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | auto | Set by Render automatically |
| `NODE_ENV` | auto | Set to `production` by Render |
| `FRONTEND_URL` | yes | Your Vercel URL — restricts CORS |

**Frontend (Vercel)**

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | yes | Your Render backend URL (no trailing slash) |

---

## Running an Analysis

### Via the UI (recommended)

1. Open http://localhost:3000
2. Click **New Analysis**
3. Enter the absolute path to the target project (e.g. `/home/user/DocuRAG`)
4. Click **Start Analysis**
5. Copy the generated Bob prompt
6. Open IBM Bob in Agent mode and paste the prompt
7. Bob will analyze the project and submit findings — the UI updates automatically

### Running Bob against DocuRAG

After clicking Start Analysis in the UI, a prompt like this is generated (copy it from the UI):

```
You are the Release Orchestrator for ReleasePilot. Follow the instructions in agents/AGENTS.md exactly.

Session details:
- analysisId: <uuid from UI>
- projectPath: /absolute/path/to/DocuRAG
- projectName: DocuRAG
- branch: main
- apiBase: http://localhost:3001/api

Step 1: PATCH http://localhost:3001/api/analysis/<uuid>/status with body {"status":"running"}
Step 2: Spawn three subagents IN PARALLEL...
Step 3: Critic pass...
Step 4: POST findings to http://localhost:3001/api/analysis/<uuid>/results
```

Paste this into a Bob Agent session with the ReleasePilot workspace open.

### Via the API directly

```bash
# 1. Create session
curl -X POST http://localhost:3001/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"/path/to/DocuRAG","projectName":"DocuRAG","branch":"main"}'
# → {"id":"<uuid>","status":"pending","createdAt":"..."}

# 2. Mark running
curl -X PATCH http://localhost:3001/api/analysis/<uuid>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"running"}'

# 3. Submit findings
curl -X POST http://localhost:3001/api/analysis/<uuid>/results \
  -H "Content-Type: application/json" \
  -d '{"findings":[{"agent":"code-risk","severity":"high",...}]}'

# 4. Get report
curl http://localhost:3001/api/reports/<uuid>
```

---

## Testing

```bash
# Backend (19 tests)
cd backend && npm test

# Single backend test
cd backend && npm run test:single -- tests/routes/analysis.test.js

# Frontend (19 tests)
cd frontend && CI=true npm test -- --watchAll=false

# Single frontend test
cd frontend && CI=true npm test -- --watchAll=false --testPathPattern StatusBadge
```

---

## Adding a New Analysis Subagent

1. Create `agents/subagents/<name>/AGENTS.md` following the existing subagent pattern.
2. Add a row to the parallel spawn table in `agents/AGENTS.md`.
3. No backend or frontend changes are needed — the API accepts any `agent` name string.

---

## Report JSON Schema

Stored in `backend/data/reports/<id>.json`:

```json
{
  "id": "uuid",
  "projectName": "DocuRAG",
  "projectPath": "/absolute/path",
  "branch": "main",
  "status": "READY | READY_WITH_WARNINGS | WARNING | BLOCKED | pending | running | failed",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "completedAt": "ISO timestamp or null",
  "findings": [
    {
      "agent": "code-risk | test-analysis | docs-config",
      "severity": "critical | high | medium | low",
      "category": "string",
      "description": "string",
      "affectedFiles": ["string"],
      "evidence": "string",
      "impact": "string",
      "recommendation": "string"
    }
  ]
}
```
## 🚀 Live Demo

| Component                    | Link                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| 🌐 **ReleasePilot Frontend** | [Open Live Demo](https://release-pilot-nine.vercel.app/)   |
| ⚙️ **Backend API**           | [Open Backend](https://releasepilot-backend.onrender.com/) |

### How the live demo works

1. Open the **ReleasePilot Frontend**.
2. Select a target project and start an analysis.
3. ReleasePilot generates the orchestration task for **IBM Bob Agent**.
4. Run the task in IBM Bob IDE.
5. Bob coordinates the Code Risk, Test, and Docs & Config analysis agents.
6. The reviewed findings are sent back to ReleasePilot.
7. View the final release-readiness report in the dashboard.

> **Note:** IBM Bob Agent is currently initiated through the Bob IDE using the task generated by ReleasePilot. The deployed frontend and backend provide the ReleasePilot workflow and report interface.

# ReleasePilot

**AI-powered release readiness analysis platform.**

ReleasePilot uses IBM Bob 2.0 to orchestrate a parallel multi-agent analysis of a target codebase, producing an evidence-based release readiness report.

```
READY / WARNING / BLOCKED
```

---

## Architecture

```
Target Project
    ↓
ReleasePilot API (Express)
    ↓
IBM Bob Release Orchestrator  ←── agents/AGENTS.md
    ↓
┌────────────────┬────────────────┬────────────────────┐
│ Code Risk      │ Test Analysis  │ Docs/Config        │
│ Subagent       │ Subagent       │ Subagent           │
└────────────────┴────────────────┴────────────────────┘
                    ↓
              Critic / Reviewer
                    ↓
          Evidence-Based Findings
                    ↓
          Release Readiness Report
                    ↓
       READY / WARNING / BLOCKED
```

---

## Project Structure

```
releasepilot/
├── agents/                         # Bob orchestration instructions
│   ├── AGENTS.md                   # Orchestrator instructions
│   └── subagents/
│       ├── code-risk/AGENTS.md     # Code Risk subagent
│       ├── test-analysis/AGENTS.md # Test Analysis subagent
│       └── docs-config/AGENTS.md   # Docs & Config subagent
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── index.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── store/                  # JSON file persistence
│   ├── tests/
│   └── data/reports/               # Auto-created; stores report JSON
├── frontend/                       # React dashboard
│   └── src/
│       ├── App.js
│       ├── api/client.js
│       └── components/
└── package.json                    # Root — runs both services
```

---

## Quick Start

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

## Running an Analysis

### Via the UI

1. Open http://localhost:3000
2. Click **New Analysis**
3. Enter the absolute path to the target project
4. Click **Start Analysis** — the session ID is created immediately

### Supplying Bob with analysis context

When invoking Bob, provide the session details from the API response and point Bob at `agents/AGENTS.md`:

```bash
# Example (Bob CLI — adapt to your setup)
bob agent --instructions agents/AGENTS.md \
  --var analysisId=<id> \
  --var projectPath=/path/to/target \
  --var projectName=my-app \
  --var branch=main \
  --var apiBase=http://localhost:3001/api
```

Bob will spawn three subagents in parallel, run a critic pass, and POST findings back to the API.  
The API will compute `READY / WARNING / BLOCKED` and store the full report.

### Via API directly

```bash
# Start analysis
curl -X POST http://localhost:3001/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"/path/to/app","projectName":"my-app","branch":"main"}'

# Submit findings (from Bob or manually)
curl -X POST http://localhost:3001/api/analysis/<id>/results \
  -H "Content-Type: application/json" \
  -d '{"findings":[{"agent":"code-risk","severity":"high",...}]}'

# Get report
curl http://localhost:3001/api/reports/<id>
```

---

## Testing

```bash
# Backend
cd backend && npm test

# Run a single backend test
cd backend && npm run test:single -- tests/routes/analysis.test.js

# Frontend
cd frontend && npm test

# Run a single frontend test
cd frontend && npm run test:single -- StatusBadge
```

---

## Adding a New Analysis Subagent

1. Create `agents/subagents/<agent-name>/AGENTS.md` with instructions (follow the existing subagent pattern).
2. Add a row to the parallel spawn table in `agents/AGENTS.md`.
3. The backend accepts any `agent` name string in the findings schema — no backend changes needed.

---

## Report JSON Schema

Stored in `backend/data/reports/<id>.json`:

```json
{
  "id": "uuid",
  "projectName": "my-app",
  "projectPath": "/path/to/app",
  "branch": "main",
  "status": "READY | WARNING | BLOCKED | pending",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
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

### Release Status Logic

| Findings contain | Status |
|-----------------|--------|
| Any `critical` | `BLOCKED` |
| Any `high` (no critical) | `WARNING` |
| Only `medium` / `low` / none | `READY` |

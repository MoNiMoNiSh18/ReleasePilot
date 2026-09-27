# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project

ReleasePilot is a release readiness analysis platform with a Node.js/Express backend, a React frontend, and an IBM Bob 2.0 agentic analysis layer.

**Live deployment:**
- Frontend: Vercel (`frontend/` directory, `Create React App`)
- Backend: Render (`backend/` directory, Node.js web service, `render.yaml`)

## Commands

```bash
# Install all dependencies (run from repo root)
npm run install:all

# Start both services concurrently (root)
npm start

# Backend only (port 3001)
cd backend && npm run dev

# Frontend only (port 3000, proxies /api → 3001)
cd frontend && npm start

# Backend tests
cd backend && npm test

# Single backend test file
cd backend && npm run test:single -- tests/routes/analysis.test.js

# Frontend tests (non-interactive)
cd frontend && CI=true npm test -- --watchAll=false

# Single frontend test
cd frontend && CI=true npm test -- --watchAll=false --testPathPattern StatusBadge
```

## API Endpoints (complete list)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analysis` | Create session — returns `{ id, status: "pending" }` |
| `GET` | `/api/analysis` | List sessions (summary) |
| `GET` | `/api/analysis/:id` | Get full session |
| `PATCH` | `/api/analysis/:id/status` | Set status to `running` or `failed` |
| `POST` | `/api/analysis/:id/results` | Submit findings — computes release status |
| `GET` | `/api/reports` | List all reports |
| `GET` | `/api/reports/:id` | Get single full report |
| `GET` | `/api/health` | Health check |

## Critical Architecture Facts

- **Frontend proxy**: `frontend/package.json` has `"proxy": "http://localhost:3001"` — all `/api/*` calls from React go to the backend **in development only**. In production Vercel uses the `REACT_APP_API_URL` env var set in `frontend/src/api/client.js`. Do not hardcode `localhost:3001` anywhere.
- **Backend CORS**: when `FRONTEND_URL` env var is set, CORS is restricted to that origin. When unset (local dev), all origins are allowed.
- **JSON storage**: Reports are written to `backend/data/reports/<uuid>.json` by `backend/src/store/reportStore.js`. Directory is auto-created on first write.
- **Release status** is derived server-side in `deriveReleaseStatus()` in `analysisController.js`:
  - `critical` → `BLOCKED`
  - `high` → `WARNING`
  - `medium` (no higher) → `READY_WITH_WARNINGS`
  - `low` / empty → `READY`
- **Bob orchestration entry point** is `agents/AGENTS.md` — not the repo root AGENTS.md (this file).
- **Bob workflow**: Bob must PATCH status to `running` before analysis, then POST findings when done. The UI polls every 3 seconds until status is terminal.
- **Frontend polling**: `ReportDetail` polls `GET /api/reports/:id` every 3 s while `status` is `pending` or `running`. Polling stops when status becomes terminal.

## Finding Schema (contract between Bob and the API)

```json
{
  "agent": "code-risk | test-analysis | docs-config",
  "severity": "critical | high | medium | low",
  "category": "security | reliability | test-coverage | documentation | configuration | performance | debt",
  "description": "One sentence describing the problem.",
  "affectedFiles": ["relative/path/to/file.ext"],
  "evidence": "Exact quote or concrete file+line reference.",
  "impact": "What breaks if this is not fixed.",
  "recommendation": "Specific actionable fix."
}
```

## Code Style

- **Backend**: CommonJS (`require`/`module.exports`). No ES modules in `backend/`.
- **Frontend**: ES modules (`import`/`export`). Functional React components only. Each component has a co-located `.css` file.
- **No TypeScript** — plain JavaScript throughout.
- **Severity values** (canonical, lowercase): `critical`, `high`, `medium`, `low`.
- **Status values** (canonical): `pending`, `running`, `failed`, `READY`, `READY_WITH_WARNINGS`, `WARNING`, `BLOCKED`.

## Testing Notes

- Backend tests use Jest + Supertest. `reportStore` is always mocked in route tests (`jest.mock('../../src/store/reportStore')`).
- Frontend tests use React Testing Library. Test files go in `frontend/src/__tests__/`.
- Do **not** run tests from the repo root — run from `backend/` or `frontend/` respectively.

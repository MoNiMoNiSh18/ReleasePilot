# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project

ReleasePilot is a release readiness analysis platform with a Node.js/Express backend, a React frontend, and an IBM Bob 2.0 agentic analysis layer.

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

# Frontend tests
cd frontend && npm test

# Single frontend test pattern
cd frontend && npm run test:single -- StatusBadge
```

## Critical Architecture Facts

- **Frontend proxy**: `frontend/package.json` has `"proxy": "http://localhost:3001"` — all `/api/*` calls from React go to the backend automatically in dev. Do not hardcode `localhost:3001` in frontend code.
- **JSON storage**: Reports are written to `backend/data/reports/<uuid>.json` by `backend/src/store/reportStore.js`. There is no database. The directory is auto-created on first write.
- **Release status** is derived server-side in `deriveReleaseStatus()` in `analysisController.js` — `critical` → BLOCKED, `high` → WARNING, else READY. The frontend never computes status.
- **Bob orchestration entry point** is `agents/AGENTS.md`, not the repo root AGENTS.md. The repo root AGENTS.md (this file) is for working on ReleasePilot itself.
- **Subagent instructions** live in `agents/subagents/<name>/AGENTS.md`. Adding a subagent requires only a new directory + entry in the parallel spawn table in `agents/AGENTS.md`.

## Finding Schema (contract between Bob and the API)

Every finding POSTed to `/api/analysis/:id/results` **must** include all eight fields: `agent`, `severity`, `category`, `description`, `affectedFiles`, `evidence`, `impact`, `recommendation`. The API accepts any string for `agent` — no registration needed.

## Code Style

- **Backend**: CommonJS (`require`/`module.exports`). No ES modules in `backend/`.
- **Frontend**: ES modules (`import`/`export`). Functional React components only. Each component has a co-located `.css` file with the same name.
- **No TypeScript** — plain JavaScript throughout.
- **Severity values** (canonical, lowercase): `critical`, `high`, `medium`, `low`.
- **Status values** (canonical, uppercase): `READY`, `WARNING`, `BLOCKED`, `pending`.

## Testing Notes

- Backend tests use Jest + Supertest. `reportStore` is always mocked in route tests (`jest.mock('../../src/store/reportStore')`).
- Frontend tests use React Testing Library. Test files go in `frontend/src/__tests__/`.
- Do **not** run tests from the repo root — run from `backend/` or `frontend/` respectively.

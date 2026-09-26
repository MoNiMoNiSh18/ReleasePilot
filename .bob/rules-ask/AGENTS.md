# Project Documentation Context (Non-Obvious Only)

- **`agents/AGENTS.md` is the Bob orchestrator instructions** — not developer documentation. It is consumed by Bob at runtime when running an analysis. Do not confuse it with the repo root `AGENTS.md` (which is for developers/agents working on ReleasePilot itself).
- **`agents/subagents/*/AGENTS.md`** are runtime instructions for Bob subagents. Each is a standalone prompt — they do not share context with each other or the orchestrator except through the finding schema.
- **The proxy is invisible in production.** `frontend/package.json` `"proxy"` only works with `react-scripts start`. In production builds the frontend must be served behind the same origin as the API or CORS must be configured separately.
- **`backend/data/reports/`** is gitignored. It does not exist in a fresh clone — `reportStore.js` creates it automatically on first write.
- **There are two README files:** root `README.md` (user-facing, covers the full system) and `backend/README.md` (API reference for integrators). The root README is the canonical reference.

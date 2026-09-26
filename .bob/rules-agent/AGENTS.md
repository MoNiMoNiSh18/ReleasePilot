# Project Coding Rules (Non-Obvious Only)

- **Backend is CommonJS only.** Never use `import`/`export` in `backend/src/`. Using ES module syntax will crash the Node.js process.
- **reportStore is always mocked in backend route tests.** Call `jest.mock('../../src/store/reportStore')` at the top of every route test file — never let tests write real files.
- **All eight finding fields are required.** `agent`, `severity`, `category`, `description`, `affectedFiles`, `evidence`, `impact`, `recommendation`. The critic step drops findings missing `evidence`.
- **Bob must PATCH `/api/analysis/:id/status` with `{"status":"running"}` before starting analysis** — otherwise the UI shows "Pending" indefinitely even when Bob is working.
- **Bob must PATCH with `{"status":"failed"}` if it cannot complete** — this stops frontend polling and shows the failed state.
- **`READY_WITH_WARNINGS` is a valid final status** — produced when the worst finding is `medium`. StatusBadge and StatusBadge.css both handle it. Do not forget it in any switch/conditional that branches on status.
- **Frontend polling interval is 3 s** (`POLL_INTERVAL_MS` in `ReportDetail.js`). Polling stops when status is not in `['pending', 'running']`.
- **Do not add a database.** Persistence is JSON files via `backend/src/store/reportStore.js`. Any persistence change must go through that module only.
- **Status is derived server-side only.** `deriveReleaseStatus()` in `analysisController.js` is the single source of truth. Never replicate this logic on the frontend.
- **New subagents need only a new directory + `agents/AGENTS.md` table entry.** No backend or frontend code changes required.
- **Each React component must have a co-located CSS file** with the same base name.

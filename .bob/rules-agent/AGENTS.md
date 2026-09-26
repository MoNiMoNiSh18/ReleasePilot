# Project Coding Rules (Non-Obvious Only)

- **Backend is CommonJS only.** Never use `import`/`export` in `backend/src/`. Use `require`/`module.exports`. Using ES module syntax will crash the Node.js process.
- **reportStore is always mocked in backend route tests.** Call `jest.mock('../../src/store/reportStore')` at the top of every route test file — never let tests write real files.
- **All eight finding fields are required.** When writing code that constructs or validates findings, all of `agent`, `severity`, `category`, `description`, `affectedFiles`, `evidence`, `impact`, `recommendation` must be present. The critic step in `agents/AGENTS.md` explicitly drops findings missing `evidence`.
- **Do not add a database.** The MVP data layer is intentionally JSON files via `backend/src/store/reportStore.js`. Any persistence change must go through that module.
- **Status is derived server-side only.** `deriveReleaseStatus()` in `backend/src/controllers/analysisController.js` is the single source of truth. Never replicate this logic on the frontend.
- **Frontend never imports from backend.** The only coupling is the HTTP API. Do not create shared JS modules across the `frontend/` and `backend/` directories.
- **Each React component must have a co-located CSS file.** `ComponentName.js` and `ComponentName.css` live in the same directory. Do not use inline styles or a single global stylesheet for component-specific styles.
- **New subagents need only a new directory + `agents/AGENTS.md` table entry.** No backend or frontend code changes are required to add analysis capabilities.

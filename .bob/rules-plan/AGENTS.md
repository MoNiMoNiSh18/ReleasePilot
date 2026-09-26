# Project Architecture Rules (Non-Obvious Only)

- **The finding schema is the integration contract.** The only coupling between the Bob agentic layer and the backend is the eight-field finding object. Any architectural change that breaks this schema breaks the entire pipeline.
- **Subagents are stateless and parallel.** Each subagent receives only its inputs (`analysisId`, `projectPath`, `projectName`, `branch`) and returns a findings array. They share no state. The orchestrator merges results after all three complete.
- **The critic pass is mandatory, not optional.** The orchestrator in `agents/AGENTS.md` runs a review step that can downgrade or drop findings. Do not bypass this by having subagents POST directly to the API.
- **Status derivation is a pure function with a strict priority order.** `critical` always beats `high` beats everything else. Adding new severity levels requires updating `deriveReleaseStatus()` in `analysisController.js` and the severity guide in `agents/AGENTS.md` together.
- **JSON file storage is intentionally flat.** Each report is one file. There are no relations, indexes, or queries. If query/search requirements emerge, the entire `reportStore.js` module is the migration boundary — controllers and routes do not need to change.
- **Frontend state is ephemeral.** There is no client-side state management library. All data comes from API calls. Adding persistent client state requires either a state library (Redux, Zustand) or API-backed persistence — do not use localStorage.
- **The `concurrently` package at root only runs dev.** The root `package.json` has no production start script. Production deployment requires separate process management for backend and a static file server for the built frontend.

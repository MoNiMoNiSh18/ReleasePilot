# Project Architecture Rules (Non-Obvious Only)

- **The finding schema is the integration contract.** The only coupling between the Bob agentic layer and the backend is the eight-field finding object. Any architectural change that breaks this schema breaks the entire pipeline.
- **Subagents are stateless and parallel.** Each subagent receives only its inputs and returns a findings array. They share no state. The orchestrator merges results after all three complete.
- **The PATCH status → `running` step is mandatory** before spawning subagents. The UI polls every 3 s and will display "Pending" forever if Bob skips this step.
- **The critic pass is mandatory, not optional.** The orchestrator runs a review step that can downgrade or drop findings. Subagents must not POST directly to the API.
- **If Bob fails mid-analysis, it must PATCH status → `failed`** so the UI stops polling and shows the failure state.
- **Status derivation is a pure function with a strict priority order:** `critical` > `high` > `medium` > `low`. Adding new severity levels requires updating `deriveReleaseStatus()` in `analysisController.js` and the severity guide in `agents/AGENTS.md` together.
- **JSON file storage is intentionally flat.** Each report is one file. No relations, indexes, or queries. If query requirements emerge, `reportStore.js` is the migration boundary — controllers and routes do not need to change.
- **Frontend state is ephemeral.** All data comes from API calls. No client-side state management library. Do not use localStorage.
- **The `concurrently` package at root only runs dev.** Production requires separate process management for backend and a static file server for the built frontend.
- **`READY_WITH_WARNINGS` is a distinct status** from `WARNING`. WARNING = any `high` finding. READY_WITH_WARNINGS = only `medium` findings. Architecture decisions that collapse these are wrong.

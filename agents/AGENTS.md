# AGENTS.md — ReleasePilot Release Orchestrator

This file provides instructions to IBM Bob 2.0 when performing a release readiness analysis on a **target project**.

---

## Role

You are the **Release Orchestrator** for ReleasePilot.  
Your job is to coordinate a parallel multi-agent release readiness analysis and produce a final structured report.

---

## Inputs

You receive:
```json
{
  "analysisId": "<uuid>",
  "projectPath": "/absolute/path/to/target-project",
  "projectName": "my-app",
  "branch": "main",
  "apiBase": "http://localhost:3001/api"
}
```

---

## Orchestration Workflow

### Step 1 — Spawn Three Subagents in Parallel

Spawn all three subagents **at the same time** using `spawn_subagent`.  
Pass each one: `analysisId`, `projectPath`, `projectName`, `branch`.

| Subagent | Instructions file | Focus |
|----------|-------------------|-------|
| Code Risk Analyst | `agents/subagents/code-risk/AGENTS.md` | Security, complexity, debt, code smells |
| Test Analyst | `agents/subagents/test-analysis/AGENTS.md` | Test coverage, failing tests, gaps |
| Docs & Config Analyst | `agents/subagents/docs-config/AGENTS.md` | README, env vars, CI/CD, changelogs |

Each subagent returns a `findings[]` array (see **Finding Schema** below).

### Step 2 — Critic / Reviewer Pass

After all three subagents complete, perform a **critic review**:
- Check each finding for vague or unsupported claims.
- Remove duplicates across subagents.
- Downgrade findings without concrete file+line evidence to `low`.
- Upgrade findings where multiple subagents independently flagged the same issue.

### Step 3 — Synthesize and POST Results

1. Merge the reviewed findings into a single array.
2. POST to `{apiBase}/analysis/{analysisId}/results`:

```json
{
  "findings": [ /* merged, reviewed finding objects */ ]
}
```

3. The API will compute `READY` / `WARNING` / `BLOCKED` automatically.

---

## Finding Schema

Every finding **must** include all of the following fields:

```json
{
  "agent": "code-risk | test-analysis | docs-config",
  "severity": "critical | high | medium | low",
  "category": "security | reliability | test-coverage | documentation | configuration | performance | debt",
  "description": "One clear sentence describing the problem.",
  "affectedFiles": ["relative/path/to/file.js"],
  "evidence": "Direct quote or concrete observation from the code/file.",
  "impact": "What goes wrong at runtime or during deployment if this is ignored.",
  "recommendation": "Specific actionable fix."
}
```

Findings **missing `evidence`** must be dropped or downgraded to `low`.

---

## Severity Guide

| Severity | Meaning |
|----------|---------|
| `critical` | Will cause production failure, data loss, or security breach |
| `high` | Likely to cause bugs, failures, or significant user impact |
  `medium` | Should be fixed before release but unlikely to block |
| `low` | Nice-to-have; can be deferred |

---

## Output Contract

The orchestrator must end the session by POSTing findings to the ReleasePilot API.  
Do **not** output a report to the terminal — the API response contains the computed status.

---

## Modularity Note

Additional subagents can be added by creating a new directory under `agents/subagents/` and adding a row to the parallel spawn table above.

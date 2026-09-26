# ReleasePilot Backend

Node.js + Express API server for ReleasePilot.

## Setup

```bash
npm install
```

## Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts on **http://localhost:3001** by default.  
Set `PORT` env var to override.

## Testing

```bash
# Run all tests
npm test

# Run a single test file
npm run test:single -- tests/routes/analysis.test.js
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analysis` | Start a new analysis session |
| `GET` | `/api/analysis` | List all sessions |
| `GET` | `/api/analysis/:id` | Get session detail |
| `POST` | `/api/analysis/:id/results` | Submit findings from Bob orchestrator |
| `GET` | `/api/reports` | List all reports |
| `GET` | `/api/reports/:id` | Get a single full report |
| `GET` | `/api/health` | Health check |

### Start Analysis — Request Body

```json
{
  "projectPath": "/absolute/path/to/target-project",
  "projectName": "my-app",
  "branch": "main"
}
```

### Submit Results — Request Body

```json
{
  "findings": [
    {
      "agent": "code-risk",
      "severity": "critical",
      "category": "security",
      "description": "SQL injection vulnerability in UserController",
      "affectedFiles": ["src/controllers/UserController.js"],
      "evidence": "Line 42: db.query(`SELECT * FROM users WHERE id = ${req.params.id}`)",
      "impact": "Arbitrary SQL execution by unauthenticated users",
      "recommendation": "Use parameterized queries"
    }
  ]
}
```

### Release Status Logic

| Findings contain | Status |
|-----------------|--------|
| Any `critical` finding | `BLOCKED` |
| Any `high` finding (no critical) | `WARNING` |
| Only `medium` / `low` / none | `READY` |

## Data Storage

Reports are stored as JSON files in `data/reports/<id>.json`.

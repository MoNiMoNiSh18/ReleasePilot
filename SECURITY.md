# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` branch | ✅ Active development |

---

## Reporting a Vulnerability

If you discover a security vulnerability in ReleasePilot, **please do not open a public GitHub issue**.

Report it privately by emailing the maintainer or opening a [GitHub Security Advisory](https://github.com/MoNiMoNiSh18/ReleasePilot/security/advisories/new).

Please include:

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We aim to acknowledge reports within **48 hours** and resolve confirmed vulnerabilities within **14 days**.

---

## Scope

The following are **in scope** for security reports:

- **Backend API** (`backend/src/`) — injection, auth bypass, data exposure, path traversal
- **Report storage** (`backend/data/reports/`) — insecure data handling, information leakage
- **Bob orchestration layer** (`agents/`) — prompt injection, unvalidated findings being accepted
- **Frontend** (`frontend/src/`) — XSS, exposed secrets in client-side code

The following are **out of scope**:

- Vulnerabilities in third-party `node_modules` (report those upstream)
- Denial-of-service via intentionally malformed large inputs in a local dev environment
- Issues in the target project being analysed (not ReleasePilot's codebase)

---

## Security Design Notes

### API key handling

ReleasePilot itself does not use any API keys. The backend stores reports as plain JSON files and exposes no authentication. It is **intended for local / trusted-network use only**.

> ⚠️ Do not expose the ReleasePilot backend (`localhost:3001`) on a public network without adding authentication. There is no auth layer by design for the MVP.

### Report data

Analysis reports stored in `backend/data/reports/` may contain sensitive information about the analysed project (file paths, code snippets used as evidence). This directory is:

- Listed in `.gitignore` — **not committed to version control**
- Listed in `.bobignore` — **not read by Bob agents**

### Bob orchestration

The Bob orchestration layer (`agents/AGENTS.md`) does not execute arbitrary code. It instructs Bob to:

1. Read files from a user-supplied `projectPath`
2. POST structured JSON findings to `localhost:3001`

A malicious `projectPath` could direct Bob to read sensitive files on the local machine. Only run analyses against project paths you own and trust.

### Dependency security

Run `npm audit` in `backend/` and `frontend/` regularly to check for known vulnerabilities in dependencies.

```bash
cd backend  && npm audit
cd frontend && npm audit
```

---

## Known Limitations (MVP)

- The backend has **no authentication**. Anyone who can reach `localhost:3001` can create sessions and read reports.
- The `POST /api/analysis/:id/results` endpoint accepts findings from anyone — there is no token to verify the submitter is the intended Bob session.
- Reports are stored in plaintext JSON on disk with no access controls beyond filesystem permissions.

These are accepted trade-offs for a hackathon MVP and should be addressed before any public deployment.

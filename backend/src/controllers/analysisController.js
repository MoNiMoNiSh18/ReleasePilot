const { v4: uuidv4 } = require('uuid');
const { readReport, writeReport, listReports } = require('../store/reportStore');

/**
 * Create a new analysis session.
 * The Bob orchestrator is expected to:
 *   1. PATCH /api/analysis/:id/status  { "status": "running" }   — when it starts
 *   2. POST  /api/analysis/:id/results { "findings": [...] }      — when it finishes
 */
function startAnalysis(req, res) {
  const { projectPath, projectName, branch } = req.body;

  if (!projectPath) {
    return res.status(400).json({ error: 'projectPath is required' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();
  const session = {
    id,
    projectPath,
    projectName: projectName || projectPath.split('/').pop(),
    branch: branch || 'main',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    findings: null,
  };

  writeReport(id, session);
  res.status(201).json({ id, status: session.status, createdAt: session.createdAt });
}

/**
 * Update the status of an analysis session (used by Bob to mark running/failed).
 * Allowed transitions: pending → running, running → failed
 * Results endpoint handles running → READY/WARNING/BLOCKED.
 */
function updateStatus(req, res) {
  const { id } = req.params;
  const session = readReport(id);

  if (!session) {
    return res.status(404).json({ error: 'Analysis session not found' });
  }

  const { status } = req.body;
  const allowed = ['running', 'failed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const updated = {
    ...session,
    status,
    updatedAt: new Date().toISOString(),
  };

  writeReport(id, updated);
  res.json({ id, status });
}

/**
 * Receive analysis results from the Bob orchestrator and compute final status.
 */
function receiveResults(req, res) {
  const { id } = req.params;
  const session = readReport(id);

  if (!session) {
    return res.status(404).json({ error: 'Analysis session not found' });
  }

  const { findings } = req.body;

  if (!Array.isArray(findings)) {
    return res.status(400).json({ error: 'findings must be an array' });
  }

  const status = deriveReleaseStatus(findings);
  const now = new Date().toISOString();

  const updated = {
    ...session,
    status,
    findings,
    updatedAt: now,
    completedAt: now,
  };

  writeReport(id, updated);
  res.json({ id, status });
}

/**
 * Get the current status/result of an analysis session.
 */
function getAnalysis(req, res) {
  const { id } = req.params;
  const session = readReport(id);

  if (!session) {
    return res.status(404).json({ error: 'Analysis session not found' });
  }

  res.json(session);
}

/**
 * List all analysis sessions (summary only).
 */
function listAnalyses(req, res) {
  const all = listReports();
  const summaries = all.map(({ id, projectName, branch, status, createdAt, updatedAt, completedAt }) => ({
    id,
    projectName,
    branch,
    status,
    createdAt,
    updatedAt,
    completedAt,
  }));
  res.json(summaries);
}

/**
 * Derive release status from a findings array.
 *
 * critical           → BLOCKED
 * high               → WARNING
 * medium (no higher) → READY_WITH_WARNINGS
 * low / none         → READY
 */
function deriveReleaseStatus(findings) {
  const severities = findings.map((f) => (f.severity || '').toLowerCase());

  if (severities.includes('critical')) return 'BLOCKED';
  if (severities.includes('high')) return 'WARNING';
  if (severities.includes('medium')) return 'READY_WITH_WARNINGS';
  return 'READY';
}

module.exports = { startAnalysis, updateStatus, receiveResults, getAnalysis, listAnalyses };

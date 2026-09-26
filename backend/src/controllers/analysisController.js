const { v4: uuidv4 } = require('uuid');
const { readReport, writeReport, listReports } = require('../store/reportStore');

/**
 * Create a new analysis session.
 * The Bob orchestrator is expected to POST findings back via /api/analysis/:id/results.
 */
function startAnalysis(req, res) {
  const { projectPath, projectName, branch } = req.body;

  if (!projectPath) {
    return res.status(400).json({ error: 'projectPath is required' });
  }

  const id = uuidv4();
  const session = {
    id,
    projectPath,
    projectName: projectName || projectPath.split('/').pop(),
    branch: branch || 'main',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings: null,
    report: null,
  };

  writeReport(id, session);
  res.status(201).json({ id, status: session.status, createdAt: session.createdAt });
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

  const updated = {
    ...session,
    status,
    findings,
    updatedAt: new Date().toISOString(),
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
  const summaries = all.map(({ id, projectName, branch, status, createdAt, updatedAt }) => ({
    id,
    projectName,
    branch,
    status,
    createdAt,
    updatedAt,
  }));
  res.json(summaries);
}

/**
 * Derive READY / WARNING / BLOCKED from a findings array.
 *
 * Severity levels: critical → BLOCKED, high → WARNING, medium/low → READY
 * Any single CRITICAL finding blocks the release.
 * Any HIGH finding without CRITICAL produces WARNING.
 */
function deriveReleaseStatus(findings) {
  const severities = findings.map((f) => (f.severity || '').toLowerCase());

  if (severities.includes('critical')) return 'BLOCKED';
  if (severities.includes('high')) return 'WARNING';
  return 'READY';
}

module.exports = { startAnalysis, receiveResults, getAnalysis, listAnalyses };

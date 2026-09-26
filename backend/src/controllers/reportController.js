const { readReport, listReports } = require('../store/reportStore');

/**
 * Get a single full report by analysis ID.
 */
function getReport(req, res) {
  const { id } = req.params;
  const report = readReport(id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json(report);
}

/**
 * List all stored reports (full objects).
 */
function listAllReports(req, res) {
  const reports = listReports();
  res.json(reports);
}

module.exports = { getReport, listAllReports };

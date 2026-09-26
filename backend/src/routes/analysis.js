const express = require('express');
const router = express.Router();
const {
  startAnalysis,
  updateStatus,
  receiveResults,
  getAnalysis,
  listAnalyses,
} = require('../controllers/analysisController');

// POST  /api/analysis              — start a new analysis session
router.post('/', startAnalysis);

// GET   /api/analysis              — list all sessions (summary)
router.get('/', listAnalyses);

// GET   /api/analysis/:id          — get a specific session
router.get('/:id', getAnalysis);

// PATCH /api/analysis/:id/status   — Bob sets status to running/failed
router.patch('/:id/status', updateStatus);

// POST  /api/analysis/:id/results  — Bob posts final reviewed findings
router.post('/:id/results', receiveResults);

module.exports = router;

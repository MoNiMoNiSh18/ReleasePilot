const express = require('express');
const router = express.Router();
const {
  startAnalysis,
  receiveResults,
  getAnalysis,
  listAnalyses,
} = require('../controllers/analysisController');

// POST /api/analysis          — start a new analysis session
router.post('/', startAnalysis);

// GET  /api/analysis          — list all sessions
router.get('/', listAnalyses);

// GET  /api/analysis/:id      — get a specific session
router.get('/:id', getAnalysis);

// POST /api/analysis/:id/results — Bob orchestrator posts findings here
router.post('/:id/results', receiveResults);

module.exports = router;

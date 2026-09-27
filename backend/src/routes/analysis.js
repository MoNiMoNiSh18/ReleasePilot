const express = require('express');
const router = express.Router();
const {
  startAnalysis,
  updateStatus,
  receiveResults,
  getAnalysis,
  listAnalyses,
} = require('../controllers/analysisController');

router.post('/', startAnalysis);
router.get('/', listAnalyses);
router.get('/:id', getAnalysis);
router.patch('/:id/status', updateStatus);
router.post('/:id/results', receiveResults);

module.exports = router;

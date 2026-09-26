const express = require('express');
const router = express.Router();
const { getReport, listAllReports } = require('../controllers/reportController');

// GET /api/reports       — list all reports
router.get('/', listAllReports);

// GET /api/reports/:id   — get a single report
router.get('/:id', getReport);

module.exports = router;

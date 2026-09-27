const express = require('express');
const router = express.Router();
const { getReport, listAllReports } = require('../controllers/reportController');

router.get('/', listAllReports);
router.get('/:id', getReport);

module.exports = router;

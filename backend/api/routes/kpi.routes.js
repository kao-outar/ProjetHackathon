const router = require('express').Router();
const verifyToken = require('../../middleware/verifyToken');
const verifyAdmin = require('../../middleware/verifyAdmin');
const kpiController = require('../../controllers/kpi.controller.js');

// GET /api/kpi - Get KPI data (admin only)
router.get('/', verifyToken(true), verifyAdmin, kpiController.getKpis);

module.exports = router;

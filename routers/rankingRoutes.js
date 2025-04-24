// routes/rankingRoutes.js
const express = require('express');
const { getMonthlyRanking } = require('../controller/rankingController');
const authMiddleware = require('../middlewares/errorMiddleWare');
const router = express.Router();

// Lấy bảng xếp hạng theo tháng (mặc định tháng hiện tại)
router.get('/', authMiddleware, getMonthlyRanking);

module.exports = router;

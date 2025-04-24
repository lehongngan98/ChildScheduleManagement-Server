// routes/userRoutes.js
const express = require('express');
const { getAllUsers, getUserById, deleteUser } = require('../controller/userController');
const authMiddleware = require('../middlewares/errorMiddleWare');
const router = express.Router();

// Chỉ admin được truy cập
router.use(authMiddleware);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

module.exports = router;
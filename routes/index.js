const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');

router.use('/api/users', userRoutes);
router.use('/api/tasks', taskRoutes);

module.exports = router;
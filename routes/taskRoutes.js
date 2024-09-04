const express = require('express');
const router = express.Router();
const passport = require('passport');
const checkRole = require('../middleware/checkRole')
const {createTask,getTasks,updateTask, deleteTask,assignTask,viewAssignedTasksByManager,updateTaskStatus,updateTaskAssignment} = require('../controllers/taskController');
const { generalRateLimiter } = require('../middleware/rateLimiter');


// Task Management Routes
router.post('/createTask',generalRateLimiter, passport.authenticate('jwt', { session: false }), checkRole(['Manager','Admin']), createTask);
router.get('/getTasks', generalRateLimiter, passport.authenticate('jwt', { session: false }), getTasks);
router.put('/update/:taskId', generalRateLimiter, passport.authenticate('jwt', { session: false }), checkRole(['Manager','Admin']), updateTask);
router.delete('/delete/:taskId', generalRateLimiter, passport.authenticate('jwt', { session: false }), checkRole(['Manager','Admin']), deleteTask);
router.put('/updateStatus',generalRateLimiter, passport.authenticate('jwt', { session: false }),updateTaskStatus);
router.put('/updateAssignee/:taskId', generalRateLimiter, passport.authenticate('jwt', { session: false }), checkRole(['Manager','Admin']),updateTaskAssignment);

// // Task Assignment Routes
router.post('/assign/:taskId', generalRateLimiter, passport.authenticate('jwt', { session: false }), checkRole(['Manager','Admin']), assignTask);
router.get('/assignedByManager', generalRateLimiter, passport.authenticate('jwt', { session: false }),checkRole(['Manager','Admin']), viewAssignedTasksByManager);

module.exports = router;
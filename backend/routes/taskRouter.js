const express = require('express');
const router = express.Router();
const {createTask, updateTask, getTask, getManyTasks, deleteTask, cleanup} = require('../controllers/taskController')

router.post('/create', createTask)

router.get('/read', getTask)
router.get('/readMany', getManyTasks)

router.put('/update', updateTask)

router.post('/delete', deleteTask)
router.get('/cleanup', cleanup)


module.exports = router; 
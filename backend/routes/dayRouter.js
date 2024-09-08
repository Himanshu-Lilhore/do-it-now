const express = require('express');
const router = express.Router();
const {createDay, getDay, updateDay, deleteDay} = require('../controllers/dayController')

router.post('/create', createDay)

router.post('/read', getDay)

router.put('/update', updateDay)

router.post('/delete', deleteDay)


module.exports = router; 
const express = require('express');
const router = express.Router();
const {rollDice, getRollStats, updateRollStats, taskPass, taskFail} = require('../controllers/diceController')

router.get('/roll', rollDice)

router.get('/read', getRollStats)

router.put('/update', updateRollStats)

router.get('/pass', taskPass)
router.get('/fail', taskFail)


module.exports = router; 
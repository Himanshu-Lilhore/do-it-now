const express = require('express');
const router = express.Router();
const {rollDice, getRollStats, updateRollStats} = require('../controllers/diceController')

router.get('/roll', rollDice)

router.get('/read', getRollStats)

router.put('/update', updateRollStats)


module.exports = router; 
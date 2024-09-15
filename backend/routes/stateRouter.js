const express = require('express');
const router = express.Router();
const { getCurrState, setCurrState, predict } = require('../controllers/stateController');

router.get('/read', getCurrState)
router.get('/predict', predict)
router.post('/set', setCurrState)


module.exports = router;

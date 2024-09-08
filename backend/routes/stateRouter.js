const express = require('express');
const router = express.Router();
const { getCurrState, setCurrState, handleEOD } = require('../controllers/stateController');

router.get('/read', getCurrState)
router.post('/set', setCurrState)
router.post('/EOD', handleEOD)


module.exports = router;

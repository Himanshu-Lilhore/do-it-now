const express = require('express');
const router = express.Router();
const { calcAvg } = require('../controllers/statController')

router.post('/calcAvg', calcAvg)

module.exports = router;
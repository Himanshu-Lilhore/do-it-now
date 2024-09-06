const express = require('express');
const router = express.Router();
const {createChunk, getChunk, updateChunk, deleteChunk} = require('../controllers/chunkController')

router.post('/create', createChunk)

router.get('/read', getChunk)

router.put('/update', updateChunk)

router.delete('/delete', deleteChunk)


module.exports = router; 
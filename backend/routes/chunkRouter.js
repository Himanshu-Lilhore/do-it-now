const express = require('express');
const router = express.Router();
const {createChunk, getChunk, updateChunk, deleteChunk, deleteAllChunks} = require('../controllers/chunkController')

router.post('/create', createChunk)

router.get('/read', getChunk)

router.put('/update', updateChunk)

router.post('/delete', deleteChunk)

router.get('/deleteAll', deleteAllChunks)


module.exports = router; 
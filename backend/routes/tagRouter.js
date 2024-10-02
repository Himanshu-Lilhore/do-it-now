const express = require('express');
const router = express.Router();
const {createTag, fetchTags, updateTag, deleteTag} = require('../controllers/tagController')

router.post('/create', createTag)

router.get('/read', fetchTags)

router.put('/update', updateTag)

router.post('/delete', deleteTag)


module.exports = router; 
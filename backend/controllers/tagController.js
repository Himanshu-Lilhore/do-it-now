const Tag = require('../models/tagModel');

const createTag = async (req, res) => {
    try {
        const newTag = await Tag.create({
            ...req.body
        })
        console.log("Tag created !!")
        res.status(200).json(newTag)
    } catch (err) {
        console.log("Error creating Tag")
        res.status(400).json({ error: err.message })
    }
}

const updateTag = async (req, res) => {
    try {
        const TagId = req.body._id
        const updatedTag = await Tag.findByIdAndUpdate(TagId, { ...req.body }, { new: true });
        console.log(`Tag updated : ${updatedTag}`)
        res.status(200).json(updatedTag)
    } catch (err) {
        console.log("Error updating Tag")
        res.status(400).json({ error: err.message })
    }
}

const fetchTags = async (req, res) => {
    try {
        const myTags = await Tag.find()
        console.log("Tags read !!")
        res.status(200).json(myTags)
    } catch (err) {
        console.log("Error fetching Tags")
        res.status(400).json({ error: err.message })
    }
}


const deleteTag = async (req, res) => {
    try {
        const delTag = await Tag.deleteOne({ _id: req.body._id })
        console.log(`Tag deleted : ${delTag._id}`)
        res.status(200).json(`Tag deleted !`)
    } catch (err) {
        console.log("Error deleting the Tag")
        res.status(400).json({ error: err.message })
    }
}
 

module.exports = { createTag, updateTag, fetchTags, deleteTag }
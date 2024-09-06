const Chunk = require('../models/chunkModel');
const Task = require('../models/taskModel');


const createChunk = async (req, res) => {
    try {
        const newChunk = await Chunk.create({
            ...req.body
        })
        console.log("Chunk created !!")
        res.status(200).json(newChunk)
    } catch (err) {
        console.log("Error creating Chunk")
        res.status(400).json({ error: err.message })
    }
}

const updateChunk = async (req, res) => {
    try {
        const ChunkId = req.body._id
        const updatedChunk = await Chunk.findByIdAndUpdate(ChunkId, { ...req.body }, { new: true }).populate('tasks');
        console.log("Chunk updated !!")
        res.status(200).json(updatedChunk)
    } catch (err) {
        console.log("Error updating Chunk")
        res.status(400).json({ error: err.message })
    }
}

const getChunk = async (req, res) => {
    try {
        const myChunk = await Chunk.findOne({...req.body}).populate('tasks')
        console.log("Chunk read !!")
        res.status(200).json(myChunk)
    } catch (err) {
        console.log("Error finding Chunk")
        res.status(400).json({ error: err.message })
    }
}


const deleteChunk = async (req, res) => {
    try {
        const delChunk = await Chunk.deleteOne({_id: req.body._id})
        console.log(`Chunk deleted : ${delChunk._id}`)
        res.status(200).json(`Chunk deleted !`)
    } catch (err) {
        console.log("Error deleting the Chunk")
        res.status(400).json({ error: err.message })
    }
}


module.exports = { createChunk, updateChunk, getChunk, deleteChunk }
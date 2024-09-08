const Chunk = require('../models/chunkModel');
const Day = require('../models/dayModel');
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
        console.log(`Chunk updated : ${updatedChunk.duration}`)
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
    const session = await Chunk.startSession();
    session.startTransaction();

    try {
        const delChunk = await Chunk.deleteOne({ _id: req.body._id }, { session });
        console.log(`Chunk deleted: ${req.body._id}`);

        let myDay = await Day.findOne({ _id: req.body.day_id }).session(session);
        if (!myDay) {
            throw new Error("Day not found");
        }

        // Use string comparison for ObjectId
        const newChunks = myDay.chunks.filter(item => item.toString() !== req.body._id.toString());
        myDay.chunks = newChunks;

        await myDay.save({ session });
        console.log(`Updated day`);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(myDay);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.log("Error deleting the chunk or updating the day:", err);
        res.status(400).json({ error: err.message });
    }
};


const deleteAllChunks = async (req, res) => {
    try { 
        console.log('deleting all chunks ...')
        const response = await Chunk.deleteMany({});
        console.log("deleted all chunks")
        res.status(200).json('deleted all chunks !!!')
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
 

module.exports = { createChunk, updateChunk, getChunk, deleteChunk, deleteAllChunks }
const Day = require('../models/dayModel');
const Task = require('../models/taskModel');
const Chunk = require('../models/chunkModel');

const createDay = async (req, res) => {
    try {
        console.log("creating day...")
        const newDay = await Day.create({
            startOfDay: new Date(),
            ...req.body
        })
        console.log("Day created !!")
        res.status(200).json(newDay)
    } catch (err) {
        console.log("Error creating Day")
        res.status(400).json({ error: err.message })
    }
}

const updateDay = async (req, res) => {
    try {
        const DayId = req.body._id
        const updatedDay = await Day.findByIdAndUpdate(DayId, { ...req.body }, { new: true })
            .populate({
                path: 'chunks',
                populate: {
                    path: 'tasks'
                }
            });
        console.log("Day updated !!")
        res.status(200).json(updatedDay)
    } catch (err) {
        console.log("Error updating Day")
        res.status(400).json({ error: err.message })
    }
}

const getDay = async (req, res) => {
    try {
        const myDay = await Day.findOne({ ...req.body })
            .populate({
                path: 'chunks',
                populate: {
                    path: 'tasks',
                }
            });
        console.log("Day read !!")
        res.status(200).json(myDay)
    } catch (err) {
        console.log("Error finding Day")
        res.status(400).json({ error: err.message })
    }
}


const deleteDay = async (req, res) => {
    try {
        const delDay = await Day.deleteOne({ _id: req.body._id })
        console.log(`Day deleted : ${delDay._id}`)
        res.status(200).json(`Day deleted !`)
    } catch (err) {
        console.log("Error deleting the Day")
        res.status(400).json({ error: err.message })
    }
}


module.exports = { createDay, updateDay, getDay, deleteDay }
const Task = require('../models/taskModel');
const Tag = require('../models/tagModel');


const createTask = async (req, res) => {
    try {
        const newTask = await Task.create({
            ...req.body
        })
        console.log("Task created !!")
        res.status(200).json(newTask)
    } catch (err) {
        console.log("Error creating task")
        res.status(400).json({ error: err.message })
    }
}

const updateTask = async (req, res) => {
    try {
        const taskId = req.body._id
        console.log(taskId)
        const updatedTask = await Task.findByIdAndUpdate(taskId, { ...req.body }, { new: true });
        console.log(`Task updated !!`)
        res.status(200).json(updatedTask)
    } catch (err) {
        console.log("Error updating task")
        res.status(400).json({ error: err.message })
    }
}

const getTask = async (req, res) => {
    try {
        const myTask = await Task.findOne({...req.body})
        console.log("Task read !!")
        res.status(200).json(myTask)
    } catch (err) {
        console.log("Error finding task")
        res.status(400).json({ error: err.message })
    }
}

const getManyTasks = async (req, res) => {
    try {
        const aggregatedTasks = await Task.aggregate([
            {
                $match: req.body
            },
            {
                $addFields: {
                    statusOrder: {
                        $cond: { if: { $eq: ["$status", "done"] }, then: 1, else: 0 }
                    }
                }
            },
            {
                $sort: {
                    statusOrder: 1,
                    updatedAt: -1,
                    createdAt: -1
                }
            }
        ]);

        if (!aggregatedTasks || aggregatedTasks.length === 0) {
            console.log("No tasks found !");
            return res.status(404).json({ message: "No tasks found" });
        }

        // const allTasks = await Task.populate(aggregatedTasks, { path: 'tags' });


        res.status(200).json(aggregatedTasks)
    } catch (err) {
        console.log("Error finding tasks")
        res.status(400).json({ error: err.message })
    }
}

const deleteTask = async (req, res) => {
    try {
        await Task.deleteOne({_id: req.body._id})
        console.log("Task deleted !!")
        res.status(200).json("Task deleted !")
    } catch (err) {
        console.log("Error deleting the task")
        res.status(400).json({ error: err.message })
    }
}


module.exports = { createTask, updateTask, getTask, getManyTasks, deleteTask }
const Chunk = require('../models/chunkModel');
const Task = require('../models/taskModel');
const Dice = require('../models/diceModel');

const createIfNotFound = async (req, res) => {
    try {
        let diceStats = await Dice.findOne()

        // if(diceStats) await Dice.deleteOne({ _id: diceStats._id })////////////////
        // diceStats = null; ///////////////////////

        if (!diceStats) {
            diceStats = await Dice.create({
                season: 1,
                coins: 0,
                bias: 1,
                rollResult: 'productive',
                streak: 0,
                streakHighscore: 0,
                cooldown: new Date(),
                currTask: null
            })
            console.log("Dice stats initialised !!")
        }
        return diceStats.toObject();
    } catch (err) {
        console.log("Error initializing Dice stats (createIfNotFound)")
        return null;
    }
}

const rollDice = async (req, res) => {
    try {
        let diceStats = await createIfNotFound();

        if (diceStats) {
            const roll = Math.random();
            let allTasks = await Task.find().populate('tags').lean();
            allTasks = allTasks.map(task => {task.tags = task.tags.map(tag => tag.category); return task}).filter(task => task.status !== 'done')
            if (roll > diceStats.bias / (diceStats.bias + 1)) {
                // unproductive
                diceStats.rollResult = 'unproductive';
                allTasks = allTasks.filter(task => !task.tags.includes('productive'))
            } else {
                // productive
                diceStats.rollResult = 'productive';
                allTasks = allTasks.filter(task => task.tags.includes('productive'))
            }
            diceStats = await Dice.findByIdAndUpdate(diceStats._id, {
                ...diceStats,
                bias: diceStats.bias+1,
                cooldown: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),  // 2 hrs of cooldown by default
                currTask: allTasks[Math.floor((Math.random())*(allTasks.length))]._id
            }, { new: true })
            console.log(`Rolled a dice (${diceStats.rollResult}) !!`)
            res.status(200).json(diceStats)
        } else {
            res.status(401).json({ error: "Error initializing Dice stats" })
        }

    } catch (err) {
        console.log("Error rolling the dice")
        res.status(400).json({ error: err.message })
    }
}

const getRollStats = async (req, res) => {
    try {
        const diceStats = await createIfNotFound();
        res.status(200).json(diceStats);
    } catch (err) {
        console.log("Error fetching dice stats")
        res.status(400).json({ error: err.message })
    }
}

const updateRollStats = async (req, res) => {
    try {
        const diceStats = await createIfNotFound();
        await Dice.findByIdAndUpdate(diceStats._id, {...req.body})
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}


module.exports = { rollDice, getRollStats, updateRollStats }
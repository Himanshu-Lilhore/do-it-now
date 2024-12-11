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
                resultDeclared: true,
                spinTime: new Date(),
                season: 1,
                coins: 0,
                bias: 1,
                rollResult: 'productive',
                streak: 0,
                streakHighscore: 0,
                cooldown: new Date(),
                defaultCooldown: 2,
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
            allTasks = allTasks.map(task => { task.tags = task.tags.map(tag => tag.category); return task }).filter(task => task.status !== 'done')
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
                resultDeclared: false,
                spinTime: new Date(),
                bias: diceStats.bias + 1,
                cooldown: new Date(new Date().getTime() + (diceStats.defaultCooldown) * 60 * 60 * 1000),  // hrs of cooldown by default
                currTask: allTasks[Math.floor((Math.random()) * (allTasks.length))]._id
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
        let diceStats = await createIfNotFound();
        diceStats = await Dice.findByIdAndUpdate(diceStats._id, { ...diceStats, ...req.body }, { new: true }).lean();
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}

const taskPass = async (req, res) => {
    try {
        let diceStats = await createIfNotFound();
        console.log(diceStats)
        const val = ((diceStats.cooldown.getTime() - diceStats.spinTime.getTime()) / (60 * 60 * 1000));
        const additionalcoins = Math.round(Math.random() * 10 * val);
        const upgrades = {
            resultDeclared: true,
            cooldown: new Date(),
            coins: diceStats.coins + additionalcoins
        }
        diceStats = await Dice.findByIdAndUpdate(diceStats._id, upgrades, { new: true }).lean()
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}
const taskFail = async (req, res) => {
    try {
        let diceStats = await createIfNotFound();
        const upgrades = {
            resultDeclared: true,
            cooldown: new Date(),
            coins: diceStats.coins - 5
        }
        diceStats = await Dice.findByIdAndUpdate(diceStats._id, upgrades, { new: true }).lean()
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}

module.exports = { rollDice, getRollStats, updateRollStats, taskPass, taskFail }
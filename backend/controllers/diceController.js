const CurrState = require('../models/currStateModel');
const Task = require('../models/taskModel');
const Dice = require('../models/diceModel');


const createNewSeason = async (prev) => {
    try {
        const diceStats = await Dice.create({
            resultDeclared: true,
            spinTime: new Date(),
            season: prev.season + 1,
            seasonLimit: 5,
            coins: prev.coins,
            bias: 1,
            rollResult: 'productive',
            streak: prev.streak,
            streakHighscore: prev.streakHighscore,
            cooldown: new Date(),
            defaultCooldown: 2,
            currTask: null
        })
        console.log("New dice season initialised !!")

        try {
            let updatedState = await CurrState.findOne({})
            if (updatedState) {
                updatedState.set({ diceId: diceStats._id });
                await updatedState.save()
                console.log("new season id set to state manager")
            }
        } catch (e) {
            console.log("Error sending new season id to state manager", e)
        }

        return (diceStats.toObject());
    } catch (err) {
        console.log("Error creating new season", err)
        return null;
    }
}


const rollDice = async (req, res) => {
    try {
        let diceStats = (await Dice.findOne({ _id: (await CurrState.findOne({})).diceId })).toObject()

        if (diceStats.seasonLimit === diceStats.bias) {
            diceStats = await createNewSeason(diceStats)
            console.log('1')
        }
        if (diceStats) {
            const roll = Math.random();
            let allTasks = await Task.find().populate('tags').lean();
            console.log('2')
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
            console.log('3')
            console.log(diceStats)
            diceStats = await Dice.findByIdAndUpdate(diceStats._id, {
                ...diceStats,
                resultDeclared: false,
                spinTime: new Date(),
                bias: diceStats.bias + 1,
                cooldown: new Date(new Date().getTime() + (diceStats.defaultCooldown) * 60 * 60 * 1000),  // hrs of cooldown by default
                currTask: allTasks[Math.floor((Math.random()) * (allTasks.length))]._id
            }, { new: true })
            console.log('4')
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
        let diceStats = (await Dice.findOne({ _id: (await CurrState.findOne({})).diceId })).toObject()

        res.status(200).json(diceStats);
    } catch (err) {
        console.log("Error fetching dice stats")
        res.status(400).json({ error: err.message })
    }
}


const updateRollStats = async (req, res) => {
    try {
        let diceStats = (await Dice.findOne({ _id: (await CurrState.findOne({})).diceId })).toObject()
        
        diceStats = await Dice.findByIdAndUpdate(diceStats._id, { ...diceStats, ...req.body }, { new: true }).lean();
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}


const taskPass = async (req, res) => {
    try {
        let diceStats = (await Dice.findOne({ _id: (await CurrState.findOne({})).diceId })).toObject()
        const val = ((diceStats.cooldown.getTime() - diceStats.spinTime.getTime()) / (60 * 60 * 1000));
        const additionalcoins = diceStats.rollResult === 'productive' ? Math.round((3 + Math.random()*7) * val) : 1;
        const highscore = diceStats.streakHighscore < diceStats.streak ? diceStats.streak : diceStats.streakHighscore;
        const upgrades = {
            resultDeclared: true,
            cooldown: new Date(),
            coins: diceStats.coins + additionalcoins,
            streak: diceStats.streak + 1,
            streakHighscore: highscore
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
        let diceStats = (await Dice.findOne({ _id: (await CurrState.findOne({})).diceId })).toObject()
        const upgrades = {
            resultDeclared: true,
            cooldown: new Date(),
            coins: diceStats.coins - 5,
            streak: 0
        }
        diceStats = await Dice.findByIdAndUpdate(diceStats._id, upgrades, { new: true }).lean()
        res.status(200).json(diceStats)
    } catch (err) {
        console.log("Error updating dice stats")
        res.status(400).json({ error: err.message })
    }
}

module.exports = { rollDice, getRollStats, updateRollStats, taskPass, taskFail }
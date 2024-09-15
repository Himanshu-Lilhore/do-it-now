const Chunk = require('../models/chunkModel');
const Day = require('../models/dayModel');
const Tag = require('../models/tagModel');
const Task = require('../models/taskModel');
const Stat = require('../models/statModel');
const CurrState = require('../models/currStateModel')
const Axios = require('axios');


const setCurrState = async (req, res) => {
    try {
        let updatedState = await CurrState.findOne({})
        if (!updatedState) {
            updatedState = await CurrState.create({
                ...req.body
            })
            console.log("Created fresh state !")
        } else {
            updatedState.set(req.body);
            await updatedState.save()
        }
        console.log("State set successfully !")
        res.status(200).json(updatedState)
    } catch (err) {
        console.log("Error setting the state !")
        res.status(400).json({ error: err.message })
    }
}


const getCurrState = async (req, res) => {
    try {
        let currState = await CurrState.findOne({})
            .populate({
                path: 'today',
                populate: {
                    path: 'chunks',
                    populate: {
                        path: 'tasks',
                        populate: {
                            path: 'tags'
                        }
                    }
                }
            })
        if (!currState) {
            currState = await CurrState.create({
                state: 'awake'
            })
            console.log("Created fresh state !")
        }
        console.log("Fetched currState !")
        res.status(200).json(currState)
    } catch (err) {
        console.log("Error fetching currState ! : ", err)
        res.status(400).json({ error: err.message })
    }
}



const predict = async (req, res) => {
    try {
        let currState = await CurrState.findOne({});
        let stats = await Stat.findOne({})

        if (!stats) {
            stats = await Stat.create({})
            console.log("initiated stat !")
        }
        if (!currState) {
            currState = await CurrState.create({
                state: 'asleep'
            })
            console.log("Created fresh state !")
        }

        let thisDay = await Day.findById(currState.today);
        let yesterday = await Day.findById(currState.yesterday);
        if (currState.today) {
            thisDay = await Day.findById(currState.today);
            if (!thisDay) {
                console.log("Day not present in currState");
                return res.status(300).json("Day not present in currState");
            }
        }

        let workingHoursYesterday = (yesterday.sleep.start - yesterday.startOfDay) / (1000 * 60 * 60);
        let sleepHrsYesterday = (yesterday.sleep.end - yesterday.sleep.start) / (1000 * 60 * 60);

        let requiredSleepYesterday = Math.max(stats.avgSleepHrs, workingHoursYesterday*0.5) + Math.max(stats.sleepDebt*0.85, 0);;

        let sleepDebtChange = sleepHrsYesterday - requiredSleepYesterday;

        if (sleepDebtChange >= 0) {
            stats.sleepDebt = stats.sleepDebt*0.85 - sleepDebtChange;
        } else {
            stats.sleepDebt = stats.sleepDebt*0.85 + Math.abs(sleepDebtChange);
        }


        let predictedWorkHrs = stats.avgWorkHrs + (stats.sleepDebt < 0 ? -stats.sleepDebt*0.75 : stats.sleepDebt*0.85);
        let predictedSleepHrs = stats.avgSleepHrs + Math.max(stats.sleepDebt*0.85, 0);
        currState.workHrs = predictedWorkHrs;
        currState.sleepHrs = predictedSleepHrs
        console.log(`
            working hrs yesterday : ${workingHoursYesterday}
            req sleep yesterday : ${requiredSleepYesterday}
            sleep hrs yesterday : ${sleepHrsYesterday}
            sleep debt now : ${stats.sleepDebt}
            today workhrs prediction : ${currState.workHrs}
            today sleephrs prediction : ${currState.sleepHrs}
            `)

        await currState.save();
        await stats.save();

        console.log("prediction successful !")
        res.status(200).json(currState)
    } catch (err) {
        console.log("Error doing prediction !")
        res.status(400).json({ error: err.message })

    }
}


module.exports = { getCurrState, setCurrState, predict }
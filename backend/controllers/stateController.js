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
                        path: 'tasks'
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
        let stats = await Stat.findOne({});

        if (!stats) {
            stats = await Stat.create({});
            console.log("initiated stat !");
        }
        if (!currState) {
            currState = await CurrState.create({
                state: 'asleep',
            });
            console.log("Created fresh state !");
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

        // Calculate working and sleeping hours for yesterday
        let workingHoursYesterday =
            (yesterday.sleep.start - yesterday.startOfDay) / (1000 * 60 * 60);
        let sleepHrsYesterday =
            (yesterday.sleep.end - yesterday.sleep.start) / (1000 * 60 * 60);

        // Define target values for ideal hours
        const targetWorkHrs = 16;
        const targetSleepHrs = 8;

        // Calculate moving averages closer to targets
        let adjustedAvgWorkHrs = (stats.avgWorkHrs * 0.7 + targetWorkHrs * 0.3);
        let adjustedAvgSleepHrs = (stats.avgSleepHrs * 0.7 + targetSleepHrs * 0.3);

        // Define dynamic boundaries based on adjusted averages
        const workHrsLowerBound = adjustedAvgWorkHrs * 0.85;
        const workHrsUpperBound = adjustedAvgWorkHrs * 1.15;
        const sleepHrsLowerBound = adjustedAvgSleepHrs * 0.85;
        const sleepHrsUpperBound = adjustedAvgSleepHrs * 1.15;

        // Calculate required sleep for yesterday using dynamic adjusted averages
        let requiredSleepYesterday = adjustedAvgSleepHrs;

        // Adjust required sleep based on yesterday's workload deviation
        if (workingHoursYesterday > workHrsUpperBound) {
            // If more work than upper bound, increase required sleep
            requiredSleepYesterday += (workingHoursYesterday - adjustedAvgWorkHrs) * 0.3;
        } else if (workingHoursYesterday < workHrsLowerBound) {
            // If less work than lower bound, decrease required sleep
            requiredSleepYesterday -= (adjustedAvgWorkHrs - workingHoursYesterday) * 0.2;
        }

        // Include sleep debt with diminishing impact for large debts
        requiredSleepYesterday += Math.max(stats.sleepDebt * 0.4, 0);

        // Ensure required sleep stays within reasonable bounds
        requiredSleepYesterday = Math.min(
            Math.max(requiredSleepYesterday, sleepHrsLowerBound),
            sleepHrsUpperBound
        );

        // Calculate sleep debt change based on yesterday's sleep vs. required
        let sleepDebtChange = sleepHrsYesterday - requiredSleepYesterday;

        // Update sleep debt, reducing its impact over time
        if (sleepDebtChange >= 0) {
            stats.sleepDebt = Math.max(
                0,
                stats.sleepDebt * 0.75 - sleepDebtChange * 0.5 // Diminish oversleeping impact
            );
        } else {
            stats.sleepDebt = stats.sleepDebt * 0.75 + Math.abs(sleepDebtChange);
        }

        // Predict today's work and sleep hours with a slight pull towards target values
        let predictedWorkHrs =
            adjustedAvgWorkHrs +
            stats.sleepDebt * 0.3 + // Adjust based on sleep debt
            (targetWorkHrs - adjustedAvgWorkHrs) * 0.2; // Pull towards target work hours

        let predictedSleepHrs =
            adjustedAvgSleepHrs +
            Math.max(stats.sleepDebt * 0.4, 0) + // Adjust based on sleep debt
            (targetSleepHrs - adjustedAvgSleepHrs) * 0.2; // Pull towards target sleep hours

        // Clamp predictions to ensure they stay within reasonable ranges
        currState.workHrs = Math.min(Math.max(predictedWorkHrs, workHrsLowerBound), workHrsUpperBound);
        currState.sleepHrs = Math.min(Math.max(predictedSleepHrs, sleepHrsLowerBound), sleepHrsUpperBound);

        console.log(`
            AVG sleep hrs : ${stats.avgSleepHrs}
            req sleep yesterday : ${requiredSleepYesterday}
            sleep hrs yesterday : ${sleepHrsYesterday}
            AVG work hrs : ${stats.avgWorkHrs}
            working hrs yesterday : ${workingHoursYesterday}
            sleep debt now : ${stats.sleepDebt}
            today workhrs prediction : ${currState.workHrs}
            today sleephrs prediction : ${currState.sleepHrs}
          `);

        await currState.save();
        await stats.save();

        console.log("Prediction successful!");
        res.status(200).json(currState);
    } catch (err) {
        console.log("Error doing prediction!");
        res.status(400).json({ error: err.message });
    }
};




module.exports = { getCurrState, setCurrState, predict }
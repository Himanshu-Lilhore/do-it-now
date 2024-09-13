const Chunk = require('../models/chunkModel');
const Day = require('../models/dayModel');
const Tag = require('../models/tagModel');
const Task = require('../models/taskModel');
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



const handleEOD = async (req, res) => {
    try {
        let currState = await CurrState.findOne({});

        if (!currState) {
            currState = await CurrState.create({
                state: 'asleep'
            })
            console.log("Created fresh state !")
        }

        let thisDay = await Day.findById(currState.today);
        if (currState.today) {
            thisDay = await Day.findById(currState.today);
            if (!thisDay) {
                console.log("Day not present in currState");
                return res.status(300).json("Day not present in currState");
            }
        }

        if (currState.state === 'awake') {
            currState.state = 'asleep'
            thisDay.sleep.start = new Date()
            console.log("Sleeping now.. 😴")
        } else {
            currState.state = 'awake'
            thisDay.sleep.end = new Date()
            currState.dayLength = Math.round((thisDay.sleep.end - thisDay.sleep.start)/(1000*60*60))
            const newDay = await Axios.post(`${process.env.BACKEND_URL}day/create`)
            currState.today = newDay.data._id
            console.log("Woke up.. 🌻")
        }

        await currState.save();
        await thisDay.save();

        console.log("EOD handled successfully !")
        res.status(200).json(currState)
    } catch (err) {
        console.log("Error handling EOD !")
        res.status(400).json({ error: err.message })

    }
}

module.exports = { getCurrState, setCurrState, handleEOD }
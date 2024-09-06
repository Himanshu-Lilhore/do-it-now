const Chunk = require('../models/chunkModel');
const Day = require('../models/dayModel');
const CurrState = require('../models/currStateModel');


const currState = async () => {
    try{
        const state = await User.findOne({})

        if (!state) {
            const newState = new currState({})
            console.log("Initialized state object")

            newState.save()
            .then(() => console.log('Initialized state object'))
            .catch(err => console.error('Error initializing state obj :', err.message));

            return res.status(200).json(newState);
        } else {
            return res.status(200).json(state);
        }

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: err.message })
    }
}


const createChunk = async (req, res) => {
    try {
        const newChunk = new Chunk({
            startTime: new Date(), // start date
            duration: 2 * 60 * 60 * 1000 // duration in milliseconds
        });

        const endTime = new Date(newChunk.startTime.getTime() + newChunk.duration);

        console.log('End Date:', endTime);

        newChunk.save()
            .then(() => console.log('Chunk saved successfully'))
            .catch(err => console.error('Error saving newly created chunk :', err.message));

        return res.status(200).json(newChunk);
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: err.message })
    }
}


const createDay = async (req, res) => {
    try {
        const newDay = await Day.create({})

        newDay.save()
            .then(() => console.log('New day created'))
            .catch(err => console.error('Error saving newly created day :', err.message));

        return res.status(200).json(newDay)
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: err.message })
    }
}



module.exports = {createChunk, currState}
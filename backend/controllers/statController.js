const Stat = require('../models/statModel');
const CurrState = require('../models/currStateModel')
const Day = require('../models/dayModel')
const Axios = require('axios');
const dayModel = require('../models/dayModel');


const calcAvg = async (req, res) => {
    try {
        console.log("Doing stats...")
        let stats = await Stat.findOne({})

        if (!stats) {
            stats = await Stat.create({})
            console.log("initiated stat !")
        }

        let currState = await CurrState.findOne({});
        let thisDay = await Day.find({_id: currState.today})

        stats.totalDays += 1

        let sleepHrsToday = (thisDay.sleep.end - thisDay.sleep.start) / (1000 * 60 * 60)
        stats.totalSleepHrs += sleepHrsToday
        let workHrsToday = (thisDay.sleep.end - thisDay.startOfDay) / (1000 * 60 * 60)
        stats.totalWorkHrs += workHrsToday

        stats.avgSleepHrs = stats.totalSleepHrs / stats.totalDays
        stats.avgWorkHrs = stats.totalWorkHrs / stats.totalDays

        console.log(`Stats calculated -
            totalWorkHrs = ${stats.totalWorkHrs}
            avgWorkHrs = ${stats.avgWorkHrs}
            totalSleepHrs = ${stats.totalSleepHrs}
            avgSleepHrs = ${stats.avgSleepHrs}
            totalDays = ${stats.totalDays}
            `)
        await stats.save()
        console.log("Stats calculated successfully !")
        res.status(200).json(stats)
    } catch (err) {
        console.log("Error calculating avg in stats !")
        res.status(400).json({ error: err.message })

    }
}


module.exports = { calcAvg }
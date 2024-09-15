const mongoose = require('mongoose');

const StatSchema = new mongoose.Schema({
    totalDays: {
        type: Number,
        default: 0
    },
    avgWorkHrs: {
        type: Number,
        default: 16
    },
    avgSleepHrs: {
        type: Number,
        default: 8
    },
    sleepDebt: {
        type: Number,
        default: 0
    },
    totalSleepHrs: {
        type: Number,
        default: 0
    },
    totalWorkHrs: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Stat', StatSchema);

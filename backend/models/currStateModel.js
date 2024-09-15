const mongoose = require('mongoose');

const CurrStateSchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['asleep', 'awake'],
        default: 'asleep'
    },
    today: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Day',
        default: null
    },
    yesterday: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Day',
        default: null
    },
    workHrs: {
        type: Number,
        default: 16
    },
    sleepHrs: {
        type: Number,
        default: 8
    }
}, {timestamps: true});

module.exports = mongoose.model('CurrState', CurrStateSchema);

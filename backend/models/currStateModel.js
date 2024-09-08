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
    dayLength: {
        type: Number,
        default: 24
    }
}, {timestamps: true});

module.exports = mongoose.model('CurrState', CurrStateSchema);

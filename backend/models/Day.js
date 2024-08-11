const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['sleep', 'awake'],
        required: true
    },
    chunks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chunk'
    }],
    endOfDay: Date,
    sleepHrs: {
        type: Number,
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model('CurrentState', DaySchema);

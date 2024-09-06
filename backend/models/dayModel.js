const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
    chunks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chunk'
    }],
    startOfDay: {
        type: Date,
        required: true
    },
    endOfDay: {
        type: Date,
        default: null
    },
    sleep: {
        start: {
            type: Date,
            default: null
        },
        end: {
            type: Date,
            default: null
        }
    },
    chunksRemaining: {
        type: Number,
        default: 5,
        min: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Day', DaySchema);

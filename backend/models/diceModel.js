const mongoose = require('mongoose');

const DiceSchema = new mongoose.Schema({
    resultDeclared: {
        type: Boolean
    },
    spinTime: {
        type: Date
    },
    season: {
        type: Number
    },
    coins: {
        type: Number
    },
    bias: { // bias/(1+bias) will be the the probability of getting productive task
        type: Number,
        default: 1
    },
    rollResult: {
        type: String,
        enum: ['productive', 'unproductive'],
        required: true
    },
    streak: {
        type: Number,
        default: 0
    },
    streakHighscore: {
        type: Number,
        default: 0
    },
    cooldown: {
        type: Date,
    },
    defaultCooldown: {  // in hours
        type: Number
    },
    currTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }
}, { timestamps: true });

module.exports = mongoose.model('Dice', DiceSchema);

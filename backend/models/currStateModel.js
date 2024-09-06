const mongoose = require('mongoose');

const CurrStateSchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['sleep', 'awake'],
        default: 'awake'
    },
    today: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Day',
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model('CurrState', CurrStateSchema);

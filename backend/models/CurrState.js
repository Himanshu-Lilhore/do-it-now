const mongoose = require('mongoose');

const CurrStateSchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['sleep', 'awake'],
        required: true
    },
    today: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Day'
    }
}, {timestamps: true});

module.exports = mongoose.model('CurrState', CurrStateSchema);

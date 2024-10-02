const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['productive', 'semi-productive', 'unproductive'],
        required: true
    },
    color: {
        type: String,
        default: '#646464'
    }
}, {timestamps: true});

module.exports = mongoose.model('Tag', TagSchema);

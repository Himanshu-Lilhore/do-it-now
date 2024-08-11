const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    rating: { 
        type: Number,
        min: 0, // least productive
        max: 10, // most productive
        default: null
    },
    activity: {
        type: String,
        default: 'undefined'
    }
}, {timestamps: true});

module.exports = mongoose.model('Chunk', ChunkSchema);

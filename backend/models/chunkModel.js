const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
    title: {
        type: String
    },
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
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    isFrozen: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

module.exports = mongoose.model('Chunk', ChunkSchema);

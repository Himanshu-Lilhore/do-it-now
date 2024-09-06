const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'done'],
        required: true
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }]
}, {timestamps: true});

module.exports = mongoose.model('Task', TaskSchema);

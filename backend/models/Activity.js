const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['productive', 'semi-productive', 'unproductive'],
        required: true
    }
});

module.exports = mongoose.model('Activity', ActivitySchema);

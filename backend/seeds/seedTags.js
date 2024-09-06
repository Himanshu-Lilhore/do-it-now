const mongoose = require('mongoose');
const Tag = require('../models/tagModel');
const connectDB = require('../config/db')

const seedTags = async () => {
    const tags = [
        { name: 'learning', category: 'productive' },
        { name: 'project', category: 'productive' },
        { name: 'work', category: 'productive' },
        { name: 'essentials', category: 'semi-productive' },
        { name: 'planning', category: 'semi-productive' },
        { name: 'outdoors', category: 'unproductive' },
        { name: 'chores', category: 'unproductive' },
        { name: 'entertainment', category: 'unproductive' },
        { name: 'leisure', category: 'unproductive' },
        { name: 'undefined', category: 'unproductive' }
    ];

    try {
        const ll = await connectDB()

        await Tag.deleteMany({});
        console.log('Cleared existing tags.');

        for (const tag of tags) {
            const newTag = new Tag(tag);
            await newTag.save();
            console.log(`Inserted: ${tag.name}`);
        }

        console.log('All tags have been seeded.');
    } catch (error) {
        console.error('Error seeding tags:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedTags();

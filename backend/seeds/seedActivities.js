const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const connectDB = require('../config/db')

const seedActivities = async () => {
    const activities = [
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

        await Activity.deleteMany({});
        console.log('Cleared existing activities.');

        for (const activity of activities) {
            const newActivity = new Activity(activity);
            await newActivity.save();
            console.log(`Inserted: ${activity.name}`);
        }

        console.log('All activities have been seeded.');
    } catch (error) {
        console.error('Error seeding activities:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedActivities();

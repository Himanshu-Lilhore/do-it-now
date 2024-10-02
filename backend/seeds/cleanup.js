const mongoose = require('mongoose');
const Task = require('../models/taskModel'); // Adjust the path as necessary
const Tag = require('../models/tagModel');
const connectDB = require('../config/db');

const removeInvalidTagIds = async () => {
  try {
    await connectDB();

    // Retrieve all valid tag IDs from the tags collection
    const validTags = await Tag.find({}, '_id'); // Fetch only the _id field
    const validTagIds = validTags.map(tag => tag._id.toString()); // Convert to string for comparison

    // Fetch all tasks to update them
    const tasks = await Task.find();

    for (const task of tasks) {
      // Filter out invalid tag IDs
      const updatedTags = task.tags.filter(tagId => validTagIds.includes(tagId.toString()));

      // Update the task's tags field
      task.tags = updatedTags;

      // Save the updated task
      await task.save();
    }

    console.log(`All tasks have been checked and updated.`);
  } catch (error) {
    console.error('Error removing invalid tag IDs:', error);
  } finally {
    mongoose.connection.close();
  }
};

removeInvalidTagIds();

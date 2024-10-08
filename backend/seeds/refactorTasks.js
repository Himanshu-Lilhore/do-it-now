const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const Stat = require('../models/statModel'); // Assuming this is your Stat model
const connectDB = require('../config/db');

const updateTasks = async () => {
  try {
    await connectDB();

    // Step 1: Fetch the current totalTasks count from the Stat schema.
    const stat = await Stat.findOne({});
    if (!stat) {
      console.error('Stat schema does not exist.');
      return;
    }
    
    let currentTaskNum = stat.totalTasks || 0;

    // Step 2: Find all tasks that do not have a `taskNum` or `repeat` field and update them.
    const tasks = await Task.find({
      $or: [{ taskNum: { $exists: false } }, { repeat: { $exists: false } }]
    });

    for (const task of tasks) {
      // Update missing fields in the task
      if (task.taskNum === undefined) {
        currentTaskNum += 1;
        task.taskNum = currentTaskNum;
      }
      if (task.repeat === undefined) {
        task.repeat = false; // Default value
      }
      await task.save();
      console.log(`Updated Task: ${task.title}, taskNum: ${task.taskNum}, repeat: ${task.repeat}`);
    }

    // Step 3: Update the totalTasks count in the Stat schema.
    stat.totalTasks = currentTaskNum;
    await stat.save();
    console.log(`Updated totalTasks count in Stat schema to ${stat.totalTasks}.`);

  } catch (error) {
    console.error('Error updating tasks:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateTasks();

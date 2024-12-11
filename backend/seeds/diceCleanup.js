const mongoose = require('mongoose');
const Dice = require('../models/diceModel'); // Adjust the path to your Dice model
const connectDB = require('../config/db'); // Ensure this points to your DB connection script

const removeInvalidDices = async () => {
  try {
    await connectDB();

    // Specify the ID to keep
    const idToKeep = '6759af0816c6455a0af87c6e';

    // Delete all Dices where _id is not equal to idToKeep
    const result = await Dice.deleteMany({ _id: { $ne: idToKeep } });

    console.log(`${result.deletedCount} invalid Dices have been removed.`);
  } catch (error) {
    console.error('Error removing invalid Dices:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

removeInvalidDices();

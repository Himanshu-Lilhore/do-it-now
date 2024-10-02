const mongoose = require('mongoose');
const Tag = require('../models/tagModel');
const connectDB = require('../config/db');

const seedTags = async () => {
  const tags = [
    // Productive Tags - Light and motivating colors for productivity
    { name: 'learning', category: 'productive', color: '#B2FF66' }, // Light Lime Green
    { name: 'project', category: 'productive', color: '#A2D2FF' }, // Light Sky Blue
    { name: 'work', category: 'productive', color: '#C5CAE9' }, // Light Blue-Grey

    // Semi-Productive Tags - Warm and moderate colors for semi-productivity
    { name: 'essentials', category: 'semi-productive', color: '#FFD699' }, // Light Orange (soft and welcoming)
    { name: 'planning', category: 'semi-productive', color: '#FFECB3' }, // Light Warm Yellow

    // Unproductive Tags - Muted and dull colors to reflect a less engaging vibe
    { name: 'outdoors', category: 'unproductive', color: '#BCAAA4' }, // Muted Beige Brown
    { name: 'chores', category: 'unproductive', color: '#CFD8DC' }, // Muted Slate Grey
    { name: 'entertainment', category: 'unproductive', color: '#E1BEE7' }, // Light Mauve (less attention-grabbing pink)
    { name: 'leisure', category: 'unproductive', color: '#D7CCC8' }, // Dull Taupe (muted brownish)
    { name: 'undefined', category: 'unproductive', color: '#BDBDBD' }, // Dull Grey
  ];

  try {
    const ll = await connectDB();

    await Tag.deleteMany({});
    console.log('Cleared existing tags.');

    for (const tag of tags) {
      const newTag = new Tag(tag);
      await newTag.save();
      console.log(`Inserted: ${tag.name} with color: ${tag.color}`);
    }

    console.log('All tags have been seeded.');
  } catch (error) {
    console.error('Error seeding tags:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTags();

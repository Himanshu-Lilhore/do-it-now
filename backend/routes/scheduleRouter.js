const express = require('express');
const Chunk = require('../models/Chunk');
const router = express.Router();

// New chunk addition
router.get('/', async (req, res) => {
  try {
    const newChunk = new Chunk({
      startTime: new Date(), // start date
      duration: 2 * 60 * 60 * 1000 // duration in milliseconds
    });

    const endTime = new Date(newChunk.startTime.getTime() + newChunk.duration);

    console.log('End Date:', endTime);

    newChunk.save()
      .then(() => console.log('Chunk saved successfully'))
      .catch(err => console.error('Error saving chunk:', err.message));

    res.json(newChunk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET all schedules
// router.get('/', async (req, res) => {
//   try {
//     const schedules = await Schedule.find(); // This should return an array
//     res.json(schedules);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// start of day
router.post('/start', async (req, res) => {
  const startOfDay = new Date();
  const chunkDuration = (24 / 5) * 60 * 60 * 1000; // in ms
  const chunks = Array.from({ length: 5 }, (_, i) => ({
    startTime: new Date(startOfDay.getTime() + i * chunkDuration),
    rating: null,
  }));
  const schedule = new Schedule({ startOfDay, chunks });
  await schedule.save();
  res.json(schedule);
});


// Update chunks with rating
router.put('/rate/:id', async (req, res) => {
  const { id } = req.params;
  const { chunkIndex, rating } = req.body;
  const schedule = await Schedule.findById(id);
  schedule.chunks[chunkIndex].rating = rating;
  await schedule.save();
  res.json(schedule);
});

// End of the day
router.post('/end/:id', async (req, res) => {
  const { id } = req.params;
  const schedule = await Schedule.findById(id);
  schedule.endOfDay = new Date();
  schedule.sleepDuration = (new Date() - new Date(schedule.endOfDay)) / (1000 * 60 * 60);
  await schedule.save();
  res.json(schedule);
});

module.exports = router;

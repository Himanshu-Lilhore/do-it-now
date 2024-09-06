const express = require('express');
const router = express.Router();
const {createChunk, currState} = require('../controllers/homeController')

router.get('/', currState)

// router.post('/chunk/create', createChunk)
// router.post('/day/create', createDay)
// router.put('/chunk/update', updateChunk)
// router.delete('/chunk/delete', deleteChunk)



// GET all schedules
// router.get('/', async (req, res) => {
//   try {
//     const schedules = await Schedule.find(); // This should return an array
//     res.json(schedules);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });




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

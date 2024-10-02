const Task = require('../models/taskModel');
const Tag = require('../models/tagModel');
const axios = require('axios');

const createTask = async (req, res) => {
    try {
        let { title, status } = req.body;
        const url = title;
        let description = '';
        let tags = [];

        // Check if the title is a YouTube URL
        const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
        const match = title.match(youtubeRegex);

        if (match) {
            const videoId = match[2];
            console.log(`Fetching details for YouTube video ID: ${videoId}`);

            // Fetch YouTube video details using YouTube Data API
            const apiKey = process.env.YOUTUBE_DATA_API_KEY;
            const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;
            
            const response = await axios.get(youtubeUrl);
            if (response.data.items.length > 0) {
                const videoDetails = response.data.items[0];
                const videoTitle = videoDetails.snippet.title;
                const videoDuration = convertDurationToReadableFormat(videoDetails.contentDetails.duration);
                const uploadDate = videoDetails.snippet.publishedAt;
                const channel = videoDetails.snippet.channelTitle
                const responseObj = JSON.stringify(response.data)
                title = videoTitle;
                description = `Channel : ${channel}\nDuration : ${videoDuration}\nUpload Date : ${new Date(uploadDate).toLocaleDateString()}\nURL : ${url}\nResponseObj : ${responseObj}`;
                
                const youtubeTag = await Tag.findOne({ name: 'youtube' });
                if (youtubeTag) {
                    tags.push(youtubeTag._id);
                }
            } else {
                console.error("YouTube video details not found.");
                return res.status(400).json({ error: 'Unable to fetch YouTube video details.' });
            }
        }

        const newTask = await Task.create({
            title,
            description,
            status,
            tags
        });

        console.log("Task created successfully!!");
        res.status(200).json(newTask);
    } catch (err) {
        console.log("Error creating task:", err);
        res.status(400).json({ error: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const taskId = req.body._id
        console.log(taskId)
        const updatedTask = await Task.findByIdAndUpdate(taskId, { ...req.body }, { new: true });
        console.log(`Task updated !!`)
        res.status(200).json(updatedTask)
    } catch (err) {
        console.log("Error updating task")
        res.status(400).json({ error: err.message })
    }
}

const getTask = async (req, res) => {
    try {
        const myTask = await Task.findOne({...req.body})
        console.log("Task read !!")
        res.status(200).json(myTask)
    } catch (err) {
        console.log("Error finding task")
        res.status(400).json({ error: err.message })
    }
}

const getManyTasks = async (req, res) => {
    try {
        const aggregatedTasks = await Task.aggregate([
            {
                $match: req.body
            },
            {
                $addFields: {
                    statusOrder: {
                        $cond: { if: { $eq: ["$status", "done"] }, then: 1, else: 0 }
                    }
                }
            },
            {
                $sort: {
                    statusOrder: 1,
                    updatedAt: -1,
                    createdAt: -1
                }
            }
        ]);

        if (!aggregatedTasks || aggregatedTasks.length === 0) {
            console.log("No tasks found !");
            return res.status(404).json({ message: "No tasks found" });
        }

        // const allTasks = await Task.populate(aggregatedTasks, { path: 'tags' });


        res.status(200).json(aggregatedTasks)
    } catch (err) {
        console.log("Error finding tasks")
        res.status(400).json({ error: err.message })
    }
}

const deleteTask = async (req, res) => {
    try {
        await Task.deleteOne({_id: req.body._id})
        console.log("Task deleted !!")
        res.status(200).json("Task deleted !")
    } catch (err) {
        console.log("Error deleting the task")
        res.status(400).json({ error: err.message })
    }
}


function convertDurationToReadableFormat(duration) {
    // Regular expression to match ISO 8601 duration format
    const match = duration.match(/P(?:([\d.]+)Y)?(?:([\d.]+)M)?(?:([\d.]+)D)?T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?/);

    // Extract the time values (hours and minutes)
    const hours = parseInt(match[4] || 0); // If no hours found, default to 0
    const minutes = parseInt(match[5] || 0); // If no minutes found, default to 0

    // Construct the formatted string based on availability
    return `${hours > 0 ? hours + ' hours ' : ''}${minutes > 0 ? minutes + ' minutes' : ''}`.trim();
}

module.exports = { createTask, updateTask, getTask, getManyTasks, deleteTask }
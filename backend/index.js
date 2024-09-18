require('dotenv').config()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db')
const PORT = process.env.PORT
const stateRouter = require('./routes/stateRouter')
const statRouter = require('./routes/statRouter')
const taskRouter = require('./routes/taskRouter')
const chunkRouter = require('./routes/chunkRouter')
const dayRouter = require('./routes/dayRouter')

const app = express();
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function (origin, callback) {
        if (!origin ||
            origin.startsWith(process.env.FRONTEND_URL)) {
            callback(null, true)
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}));


app.use('/state', stateRouter)
app.use('/task', taskRouter)
app.use('/chunk', chunkRouter)
app.use('/day', dayRouter)
app.use('/stat', statRouter)


app.listen(PORT, () => {
    console.log("server is running on :", PORT)
})
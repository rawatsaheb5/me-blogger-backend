const express = require("express");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const dotenv = require("dotenv");
const path = require('path');
const authRoutes = require("./route/user");

const profileRoute = require('./route/profile')
const postRoute = require('./route/post')
const commentRoute = require('./route/comment')
const likeRoute = require('./route/like')
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8000;

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);

app.use('/api/profile',profileRoute )
app.use('/api/post',postRoute )
app.use('/api/comment', commentRoute)
app.use('/api/like', likeRoute);

app.get("/", (req, res)=>{
  app.send('server chal rha h sab mast h')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});


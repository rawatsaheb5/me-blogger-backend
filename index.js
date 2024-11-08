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
const port = process.env.PORT || 8000;

dotenv.config();
connectDB();


const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/profile',profileRoute )
app.use('/api/post',postRoute )
app.use('/api/comment', commentRoute)
app.use('/api/like', likeRoute);

app.get("/", (req, res)=>{
  res.send('server is running fine ')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});


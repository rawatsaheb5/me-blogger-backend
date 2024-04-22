const express = require('express');
const verifyToken = require('../middleware/auth');
const { createPostLike, } = require('../controller/like');


const router = express.Router();

router.post('/create-like/:postId', verifyToken,createPostLike )


module.exports = router;

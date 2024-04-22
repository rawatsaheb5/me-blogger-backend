const express = require('express');
const { getAllCommentsForPost, addComment, deleteComment, editComment } = require('../controller/comment');
const verifyToken = require('../middleware/auth');
const router = express.Router();




router.get('/single-comment/:commentId', );
router.get('/all-comments/:postId', getAllCommentsForPost);
router.post('/create-comment/:postId', verifyToken, addComment);
router.delete('/delete-comment/:commentId', verifyToken, deleteComment);
router.put('/edit-comment/:commentId', verifyToken,editComment);
module.exports = router;

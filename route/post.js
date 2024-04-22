const express = require('express');
const { handleGetAllPost,  createPost, handleGetAllYourPost, deletePost, updatePost, upload, handleGetAuthor, handleGetSinglePost } = require('../controller/post');
const verifyToken = require('../middleware/auth');

const router = express.Router();


router.get('/single/:postId', handleGetSinglePost)
router.get('/all', handleGetAllPost);
router.get('/author/:postId', handleGetAuthor);



// for logged in user 

router.post('/create',verifyToken,upload.single('image'), createPost);
router.get('/all-posts', verifyToken, handleGetAllYourPost);
router.delete('/delete-post/:postId',verifyToken, deletePost);
router.put('/edit-post/:postId',verifyToken,upload.single('image'), updatePost);


module.exports = router;

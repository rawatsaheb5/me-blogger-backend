const express = require('express');


const verifyToken = require('../middleware/auth');
const { updateProfile, deleteProfile, getProfile, } = require('../controller/profile');
const { upload } = require('../controller/post');

const router = express.Router();



router.put('/', verifyToken, upload.single('profilePic'), updateProfile);
router.get('/',verifyToken,getProfile );
router.delete('/:id',verifyToken,deleteProfile );
module.exports = router;

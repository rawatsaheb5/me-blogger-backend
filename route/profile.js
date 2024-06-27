const express = require('express');


const verifyToken = require('../middleware/auth');
const { updateProfile, deleteProfile, getProfile, } = require('../controller/profile');
const upload = require('../config/multer');


const router = express.Router();



router.put('/', verifyToken, upload.single('profilePic'), updateProfile);
router.get('/',verifyToken,getProfile );
router.delete('/',verifyToken,deleteProfile );
module.exports = router;

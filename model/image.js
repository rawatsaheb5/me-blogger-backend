const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: String,
  cloudinary_id: String,
});

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image

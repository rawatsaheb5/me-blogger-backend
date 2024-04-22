const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Post Schema
const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  image: {
    type: String,
    default: 'default_post_image.jpg'
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps to the document
});

// Create and export the Post model
const Post = mongoose.model('Post', postSchema);
module.exports = Post;

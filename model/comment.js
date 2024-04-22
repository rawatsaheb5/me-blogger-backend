const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Comment Schema
const commentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps to the document
});

// Create and export the Comment model
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

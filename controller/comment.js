const express = require("express");

const Post = require("../model/post");
const User = require("../model/user");
const Comment = require('../model/comment')


const addComment = async (req, res) => {
  const postId = req.params.postId;
  const { text } = req.body;
  const userId = req.user.userId; // Assuming user ID is extracted from authentication middleware

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create a new comment instance
    const newComment = new Comment({
      text,
      author: userId,
      post: postId,
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();
    await Post.findByIdAndUpdate(postId, { $push: { comments: savedComment._id } });
    res.status(201).json(savedComment); // Send the saved comment as a JSON response
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Controller function to get all comments for a specific post
const getAllCommentsForPost = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find all comments for the specified post ID and populate the 'author' field with 'username'
    const comments = await Comment.find({ post: postId }).populate({
      path: 'author',
      populate: {
        path: 'profilePic'
      }
    });
      

    // If no comments are found for the post ID, return an empty array
    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: 'No comments found for the specified post' });
    }

    //console.log(comments)
    // Prepare the response data by extracting relevant fields
    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      text: comment.text,
      author: comment.author.username, // Access the username via the populated author field
      post: comment.post,
      createdAt: comment.createdAt,
      profilePic:comment.author.profilePic,
      createdAt: comment.createdAt
    }));

    // Return the formatted comments array with usernames
    res.status(200).json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId
  try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the post associated with the comment
    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ message: 'Associated post not found' });
    }

    // Remove the comment ID from the post's 'comments' array
    post.comments = post.comments.filter((c) => c.toString() !== commentId);
    await post.save();

    // Delete the comment from the database
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}

const editComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { text } = req.body;

  try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update the comment text
    comment.text = text;
    await comment.save();

    res.json({ message: 'Comment updated successfully', updatedComment: comment });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'Failed to edit comment' });
  }
}

module.exports = {
  addComment,
  getAllCommentsForPost,
  deleteComment,
  editComment,
};

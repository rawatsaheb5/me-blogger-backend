const Post = require("../model/post");
const User = require("../model/user");

// Controller function to create a like for a post
const createPostLike = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.userId; // Assuming user ID is extracted from authentication middleware

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already liked the post
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
      await post.save();
      res.json({
        message: "Post like deleted successfully",
        updatedPost: post,
      });
      //return res.status(400).json({ message: 'User already liked this post' });
    } else {
      // Add the user's ID to the likes array of the post
      post.likes.push(userId);
      await post.save();
      res
        .status(201)
        .json({ message: "Post liked successfully", likedPost: post });
    }
  } catch (error) {
    console.error("Error creating post like:", error);
    res.status(500).json({ message: "Failed to create post like" });
  }
};



module.exports = {
  createPostLike,
  
};

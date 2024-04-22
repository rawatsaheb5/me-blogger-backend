const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // For generating unique filenames
const fs = require("fs");
const Post = require("../model/post");
const User = require("../model/user");
const Comment = require("../model/comment");




/*---------------------controller for all ------------------------------------------------------------*/

const handleGetAllPost = async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find();

    res.json(posts); // Send the array of posts as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get single post
const handleGetSinglePost = async (req, res) => {
  const postId = req.params.postId;
  try {
    // Fetch all posts from the database
    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post); // Send the array of posts as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*----------------controller to get the author of the post-------------*/ 
const handleGetAuthor = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by ID and populate the 'author' field
    const post = await Post.findById(postId).populate("author", "-password");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Extract the author details from the populated 'author' field
    const { author } = post;

    res.status(200).json({ author });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*---------------------------controllers for logged in users------------------------------*/ 

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create the uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Specify the directory where uploaded files should be stored
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename); // Generate a unique filename for the uploaded file
  },
});

// Initialize multer with the specified storage configuration
const upload = multer({ storage: storage });



/*---------------controller to create post------------------------*/ 

const createPost = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId; // Assuming user ID is extracted from authentication middleware

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    // extracting the file from FormData object
    const imageUrl = req.file.filename;

    // Create a new post instance
    const newPost = new Post({
      title,
      description,
      image: imageUrl, // Save the image URL in the post
      author: userId, // Set the author ID to the authenticated user's ID
    });

    // Save the new post to the database
    const savedPost = await newPost.save();

    // Update the user's posts array with the new post ID
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    res.status(201).json(savedPost); // Send the saved post as a JSON response
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};


/*---------------controller to delete post------------------------*/

const deletePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.userId; // Assuming user ID is extracted from authentication middleware

  try {
    // Find the post by ID

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the requesting user is the author of the post
    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    // Delete associated comments of the post
    await Comment.deleteMany({ post: postId });

    // Remove the post ID from the user's posts array
    const user = await User.findById(userId);
    if (user) {
      user.posts = user.posts.filter((p) => p.toString() !== postId);
      await user.save();
    }

    // Delete the uploaded image file from the server

    const imagePath = path.join(__dirname, `../uploads/${post.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Synchronously delete the file
    }
    console.log(imagePath);
    await Post.deleteOne({ _id: postId });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};



const handleGetAllYourPost = async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const userPosts = await Post.find({ author: userId }).populate(
      "author",
      "_id"
    );

    res.json(userPosts); // Send the array of user posts as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*---------------------controller to update the post ----------------*/ 
const updatePost = async (req, res) => {
  const postId = req.params.postId; // Assuming postId is passed in the request parameters
  const { title, description } = req.body;
  const userId = req.user.userId; // Assuming user ID is extracted from authentication middleware

  try {
    //Find the existing post by postId
    const existingPost = await Post.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the authenticated user is the author of the post
    if (existingPost.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }

    // Save the current image filename to delete later (if replaced)
    let oldImageFilename = existingPost.image;

    // Update the post fields if new values are provided
    if (title !== undefined) {
      existingPost.title = title;
    }
    if (description !== undefined) {
      existingPost.description = description;
    }

    //Check if a new image file was uploaded
    if (req.file) {
      existingPost.image = req.file.filename;

      // Remove the old image file from the server
      if (oldImageFilename !== "default_post_image.jpg") {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          oldImageFilename
        );

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the old image file
        }
      }
    }

    // Save the updated post
    const updatedPost = await existingPost.save();

    res.status(200).json(updatedPost); // Send the updated post as a JSON response
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
};

module.exports = {
  handleGetAllYourPost,
  handleGetAllPost,
  handleGetSinglePost,
  createPost,
  deletePost,
  updatePost,
  upload,
  handleGetAuthor,
};

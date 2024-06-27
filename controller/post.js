const Post = require("../model/post");
const User = require("../model/user");
const Comment = require("../model/comment");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const Image = require("../model/image");
/*---------------------controller for all ------------------------------------------------------------*/

const handleGetAllPost = async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find().populate("image");

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
    const post = await Post.findById({ _id: postId }).populate("image");
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
    const post = await Post.findById(postId).populate({
      path: 'author',
      populate: {
        path: 'profilePic'
      }
    });

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
    const uploadedImage = await cloudinary.uploader.upload(req.file.path);
    if (!uploadedImage) {
      return res.status(404).json({ error: "Image upload failed" });
    }
    const img = new Image({
      url: uploadedImage.secure_url,
      cloudinary_id: uploadedImage.public_id,
    });
    const image = await img.save();
    // Create a new post instance
    const newPost = new Post({
      title,
      description,
      image: image._id, // Save the image URL in the post
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

    const image = await Image.findById(post.image);

    await cloudinary.uploader.destroy(image.cloudinary_id);
    await Image.findByIdAndDelete(post.image);

    // Remove the post ID from the user's posts array
    const user = await User.findById(userId);
    if (user) {
      user.posts = user.posts.filter((p) => p.toString() !== postId);
      await user.save();
    }

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
    const userPosts = await Post.find({ author: userId })
      .populate("author", "_id")
      .populate("image");

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

    // Update the post fields if new values are provided
    if (title !== undefined) {
      existingPost.title = title;
    }
    if (description !== undefined) {
      existingPost.description = description;
    }

    if (req.file) {
      const image = await Image.findById(existingPost.image);
      if (!image) return res.status(404).json({ error: "Image not found" });
      const deletedOldPhoto = await cloudinary.uploader.destroy(
        image.cloudinary_id
      );
      if (!deletedOldPhoto) {
        return res
          .status(404)
          .json({ error: "Image is not replaced in cloudinary" });
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      image.url = result.secure_url;
      image.cloudinary_id = result.public_id;
      await image.save();
      existingPost.image = image._id;
    }
    await existingPost.save();

    res.status(200).json(existingPost); // Send the updated post as a JSON response
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

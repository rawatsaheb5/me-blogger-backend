const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // For generating unique filenames
const fs = require("fs");
const User = require("../model/user");

// controller to update user profile
const updateProfile = async (req, res) => {

  // const userId = req.params.userId;
  const userId = req.user.userId;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save the current profile picture filename to delete later (if replaced)
    let oldProfilePicFilename = user.profilePic;

    // Update user's firstname and lastname
    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;

    // Check if a new profile picture was uploaded
    if (req.file) {

      // Update profilePic with the new filename
      user.profilePic = req.file.filename;

      // Remove the old profile picture from the server
      if (oldProfilePicFilename !== "default_post_image.jpg") {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          oldProfilePicFilename
        );

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the old profile picture file
        }
      }
    }

    // Save updated user profile
    const updatedUser = await user.save();
    // Create a sanitized user object without the password field
    const sanitizedUser = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      // Add any other non-sensitive fields you want to include
    };

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: sanitizedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const getProfile = async (req, res) => {
  
  const userId = req.user.userId;
  

  try {
    //Find the user by ID and update the profile
    const dbUser = await User.findById({ _id: userId });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        username: dbUser.username,
        email: dbUser.email,
        profilePic: dbUser.profilePic,
        firstname: dbUser.firstname,
        lastname: dbUser.lastname,
        createdAt: dbUser.createdAt,
        updatedAt:dbUser.updatedAt,
      },
      message: "profile fetch successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Route to delete a user account
const deleteProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all posts created by the user
    await Post.deleteMany({ author: userId });
    // delete all comments created by user
    await Comment.deleteMany({ author: userId });
    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteProfile,
  updateProfile,
  getProfile,
};

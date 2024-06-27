const User = require("../model/user");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const Image = require("../model/image");
const Post = require("../model/post");
const Comment = require("../model/comment");



// controller to update user profile
const updateProfile = async (req, res) => {
 
  const userId = req.user.userId;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's firstname and lastname
    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;

    // Check if a new profile picture was uploaded
    if (req.file) {
      if (user.profilePic) {
        const image = await Image.findById(user.profilePic);
        if (!image) return res.status(404).json({ error: "Image not found" });
        //Delete the old image from Cloudinary
        const deletedOldProfile = await cloudinary.uploader.destroy(
          image.cloudinary_id
        );
        if (!deletedOldProfile) {
          return res
            .status(404)
            .json({ error: "Image is not replaced in cloudinary" });
        }
        const result = await cloudinary.uploader.upload(req.file.path);
        image.url = result.secure_url;
        image.cloudinary_id = result.public_id;
        await image.save();
        user.profilePic = image._id;
      } else {
        const result = await cloudinary.uploader.upload(req.file.path);
        if (!result) {
          return res.status(404).json({ error: "Image upload failed" });
        }
        const img = new Image({
          url: result.secure_url,
          cloudinary_id: result.public_id,
        });

        await img.save();
        user.profilePic = img._id;
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
    const dbUser = await User.findById({ _id: userId }).populate("profilePic");

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
        updatedAt: dbUser.updatedAt,
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

    //Delete the old image from Cloudinary

    if (user.profilePic) {
      const image = await Image.findById(user.profilePic);

      await cloudinary.uploader.destroy(image.cloudinary_id);
      await Image.findByIdAndDelete(user.profilePic);
    }
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

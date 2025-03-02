import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";



// 📌 Get User Profile by Username
export const getProfile = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            const error = new Error("User not found");
            res.status(404);
            return next(error);
        }
        res.status(200).json(user);
    } catch (error) {
        // console.error(`Error in getProfile: ${error}`);
        // res.status(500).json({ error: "Internal server error" });
        next(error);
    }
};

// 📌 Follow / Unfollow User
export const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);
        const userToModify = await User.findById(id);

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow
            currentUser.following.pull(id);
            userToModify.followers.pull(req.user._id);
            await currentUser.save();
            await userToModify.save();
            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            // Follow
            currentUser.following.push(id);
            userToModify.followers.push(req.user._id);
            await currentUser.save();
            await userToModify.save();

            // Send Notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();

            return res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.error(`Error in followUnFollowUser: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 📌 Get Suggested Users (Exclude those already followed)
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } },
            { $sample: { size: 10 } },
        ]);

        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error(`Error in getSuggestedUsers: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 📌 Update User Profile
export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Handle Password Update
        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Both current and new passwords are required" });
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Incorrect current password" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // ✅ Upload Profile Image
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        // ✅ Upload Cover Image
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        // ✅ Update User Fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        await user.save();

        // Hide password in response
        user.password = undefined;
        res.status(200).json(user);
    } catch (error) {
        console.error(`Error in updateUser: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

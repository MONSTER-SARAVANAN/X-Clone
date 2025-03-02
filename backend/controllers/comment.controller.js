import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Video from "../models/video.js";

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }

        if (!text) return res.status(400).json({ error: "Comment text is required" });

        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ error: "Video not found" });

        const comment = new Comment({ video: videoId, user: userId, text });
        await comment.save();

        res.status(201).json(comment);
    } catch (error) {
        console.error(`Error in addComment: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete Comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: "Invalid comment ID" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(`Error in deleteComment: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Comments for a Video
export const getComments = async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid video ID" });
        }

        const comments = await Comment.find({ video: videoId })
            .populate("user", "username profileImg")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.error(`Error in getComments: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

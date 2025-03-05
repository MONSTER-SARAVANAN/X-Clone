import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Video from "../models/video.js";
import Post from "../models/post.model.js";

// 📝 Add Comment (for Posts or Videos)
export const addComment = async (req, res) => {
  try {
    const { postId, videoId, text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    let newComment;

    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });

      newComment = new Comment({ post: postId, user: userId, text });
      await newComment.save();

      await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    } 
    else if (videoId) {
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }

      const video = await Video.findById(videoId);
      if (!video) return res.status(404).json({ error: "Video not found" });

      newComment = new Comment({ video: videoId, user: userId, text });
      await newComment.save();

      await Video.findByIdAndUpdate(videoId, { $push: { comments: newComment._id } });
    } 
    else {
      return res.status(400).json({ error: "Either postId or videoId is required" });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📝 Delete Comment
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
    console.error("Error in deleteComment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📝 Get Comments (for a Post or Video)
export const getComments = async (req, res) => {
  try {
    const { postId, videoId } = req.params;

    let query = {};
    if (postId) query.post = postId;
    if (videoId) query.video = videoId;

    if (!Object.keys(query).length) {
      return res.status(400).json({ error: "Either postId or videoId is required" });
    }

    const comments = await Comment.find(query)
      .populate("user", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

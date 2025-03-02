import ShortComment from "../models/short.comment.js";


// ✅ Add Comment to a Short
export const addComment = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const newComment = await ShortComment.create({ short: shortId, user: userId, text });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// ✅ Get All Comments for a Short
export const getComments = async (req, res) => {
  try {
    const { shortId } = req.params;

    const comments = await ShortComment.find({ short: shortId }).populate("user", "username profileImg");

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

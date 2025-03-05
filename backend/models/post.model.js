import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    img: { type: String },
    video: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    isShort: { type: Boolean, default: false }, // ✅ This marks it as a short video
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;

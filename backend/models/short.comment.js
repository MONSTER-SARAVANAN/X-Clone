import mongoose from "mongoose";

const ShortCommentSchema = new mongoose.Schema(
  {
    short: { type: mongoose.Schema.Types.ObjectId, ref: "Short", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ShortComment", ShortCommentSchema);

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user receiving the notification
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who triggered the notification
    type: { type: String, enum: ["like", "comment", "follow"], required: true }, // Notification type
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Optional: Post related to the notification
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" }, // Optional: Video related to the notification
    isRead: { type: Boolean, default: false }, // Tracks whether the user has read the notification
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

import mongoose from "mongoose";

const shortSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Video uploader
		videoUrl: { type: String, required: true }, // Cloudinary video URL
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the short
		views: { type: Number, default: 0 }, // Number of views
	},
	{ timestamps: true }
);

const Short = mongoose.model("Short", shortSchema);

export default Short;

import Short from "../models/short.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const uploadShort = async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: "No video uploaded" });

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			resource_type: "video",
		});

		// Remove temp file
		fs.unlinkSync(req.file.path);

		// Save to DB
		const newShort = await Short.create({
			user: req.user._id,
			videoUrl: result.secure_url,
		});

		res.status(201).json(newShort);
	} catch (error) {
		res.status(500).json({ error: "Failed to upload short" });
	}
};

export const getShorts = async (req, res) => {
    try {
        const shorts = await Short.find().sort({ createdAt: -1 });
        res.status(200).json(shorts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shorts" });
    }
};

// ✅ Like/Unlike a Short

export const likeShort = async (req, res) => {
	try {
		const { shortId } = req.params;
		const userId = req.user._id;

		const short = await Short.findById(shortId);
		if (!short) return res.status(404).json({ error: "Short not found" });

		const isLiked = short.likes.includes(userId);
		if (isLiked) {
			// Unlike
			short.likes = short.likes.filter((id) => id.toString() !== userId.toString());
		} else {
			// Like
			short.likes.push(userId);
		}

		await short.save();
		res.json({ message: isLiked ? "Unliked" : "Liked", likes: short.likes.length });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

// ✅ Increment View Count
export const viewShort = async (req, res) => {
	try {
		const { shortId } = req.params;
		await Short.findByIdAndUpdate(shortId, { $inc: { views: 1 } });
		res.json({ message: "View recorded" });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

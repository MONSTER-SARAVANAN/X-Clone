import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Video from "../models/video.js";
import Notification from "../models/notification.model.js";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Video to Cloudinary
export const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Upload using buffer instead of file.path
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "video", folder: "videos" },
                (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(req.file.buffer);
        });

        const video = new Video({
            user: req.user._id,
            url: result.secure_url,
            caption: req.body.caption,
            duration: req.body.duration,
        });

        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error(`Error in uploadVideo: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Like/Unlike Video
export const likeVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        let video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const isLiked = video.likes.includes(userId);

        if (isLiked) {
            // Unlike video
            video.likes = video.likes.filter(id => id.toString() !== userId.toString());

            // Remove notification (if exists)
            await Notification.findOneAndDelete({ from: userId, to: video.user, type: "like" });

        } else {
            // Like video
            video.likes.push(userId);

            // Create notification only if user is liking someone else's video
            if (video.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    from: userId,
                    to: video.user,
                    type: "like"
                });
                await notification.save();
            }
        }

        await video.save();
        res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likes: video.likes.length });

    } catch (error) {
        console.error(`Error in likeVideo: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Shorts & Reels (videos < 60s)
export const getShorts = async (req, res) => {
    try {
        const shorts = await Video.find({ duration: { $lt: 60 } }).sort({ createdAt: -1 });
        res.status(200).json(shorts);
    } catch (error) {
        console.error(`Error in getShorts: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Track Video Views
export const trackView = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ error: "Video not found" });

        video.views += 1;
        await video.save();

        res.status(200).json({ message: "View counted", views: video.views });
    } catch (error) {
        console.error(`Error in trackView: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// 🔥 Get Trending Videos (Based on Likes & Views)
export const getTrendingVideos = async (req, res) => {
    try {
        const trendingVideos = await Video.find()
            .sort({ likes: -1, views: -1 }) // Sort by likes first, then views
            .limit(10) // Get top 10 trending videos
            .populate("user", "username profileImg"); // Get user details

        res.status(200).json(trendingVideos);
    } catch (error) {
        console.error(`Error in getTrendingVideos: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




// 🌍 Get Explore Feed (Mix of New & Trending Videos)
export const getExploreFeed = async (req, res) => {
    try {
        const latestVideos = await Video.find()
            .sort({ createdAt: -1 }) // Sort by newest videos first
            .limit(10)
            .populate("user", "username profileImg");

        const trendingVideos = await Video.find()
            .sort({ likes: -1, views: -1 })
            .limit(5)
            .populate("user", "username profileImg");

        // Combine latest and trending videos
        const exploreFeed = [...latestVideos, ...trendingVideos];

        res.status(200).json(exploreFeed);
    } catch (error) {
        console.error(`Error in getExploreFeed: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

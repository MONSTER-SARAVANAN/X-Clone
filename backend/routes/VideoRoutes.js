import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import multer from "multer";
import { uploadVideo, likeVideo, getShorts } from "../controllers/video.controller.js";
import { trackView, getTrendingVideos, getExploreFeed } from "../controllers/video.controller.js";

const router = express.Router();

// Multer setup for video uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Routes
router.post("/upload", protectRoute, upload.single("video"), uploadVideo);
router.post("/like/:videoId", protectRoute, likeVideo);
router.get("/shorts", getShorts);
router.post("/:videoId/view", trackView); // Track views
// Route to get trending videos
router.get("/trending", getTrendingVideos);
// Route to get explore feed
router.get("/explore", getExploreFeed);

export default router;





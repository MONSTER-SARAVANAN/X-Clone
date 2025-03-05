import express from "express";
import { getShorts, uploadShort } from "../controllers/shorts.controller.js";
import { likeShort, viewShort } from "../controllers/shorts.controller.js";

import protect from "../middleware/protectRoute.js";

import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

router.get("/", protect, getShorts);
router.post("/upload", protect, upload.single("video"), uploadShort); // ✅ Upload Shorts
router.post("/:shortId/like", protect, likeShort); // ✅ Like/Unlike a Short
router.post("/:shortId/view", viewShort); // ✅ Record View

export default router;



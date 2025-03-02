import express from "express";
import protect from "../middleware/protectRoute.js";

import { addComment, deleteComment, getComments } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/:videoId", protect, addComment);
router.delete("/:commentId", protect, deleteComment);

router.get("/:videoId", getComments);

export default router;

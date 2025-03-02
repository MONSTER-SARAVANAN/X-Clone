import express from "express";
import { addComment, getComments } from "../controllers/shortComment.controller.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/:shortId", verifyToken, addComment); // Add a comment
router.get("/:shortId", getComments); // Get all comments for a short

export default router;

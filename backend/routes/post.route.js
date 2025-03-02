import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import { createPost, deletePost, createComment, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts, getShorts } from "../controllers/post.controller.js";

import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router =express.Router();

router.get("/all", protectRoute, getAllPosts)
router.get("/following", protectRoute, getFollowingPosts)
router.get("/likes/:id", protectRoute, getLikedPosts)
router.get("/user/:username", protectRoute, getUserPosts)
router.post("/create" , protectRoute, createPost)
router.post("/like/:id" , protectRoute, likeUnlikePost)
router.post("/comment/:id" , protectRoute, createComment)
router.delete("/:id" , protectRoute, deletePost)
router.get("/shorts", getShorts);
router.post("/create", verifyToken, upload.fields([{ name: "img" }, { name: "video" }]), createPost);

export default router;

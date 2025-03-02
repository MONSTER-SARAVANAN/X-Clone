import express from "express";
import limiter from "../middleware/rateLimit.js";
import { loginUser, signupUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", limiter, loginUser);  // Limit login attempts
router.post("/signup", limiter, signupUser); // Limit signups

export default router;

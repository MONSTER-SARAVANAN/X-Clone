import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for a user
router.get("/all", protectRoute, getNotifications);

// Delete all notifications for a user
router.delete("/delete", protectRoute, deleteNotifications);

export default router;

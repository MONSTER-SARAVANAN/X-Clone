import Notification from "../models/notification.model.js";

// Get Notifications & Mark as Read
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ to: userId })
            .populate({ path: "from", select: "username profileImg" })
            .sort({ createdAt: -1 });

        await Notification.updateMany({ to: userId }, { $set: { read: true } });

        res.status(200).json(notifications);
    } catch (error) {
        console.error(`Error in getNotifications: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete All Notifications for User
export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ to: userId });

        res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
        console.error(`Error in deleteNotifications: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

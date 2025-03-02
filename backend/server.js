import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cloudinary from "cloudinary"
import cors from "cors";
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import videoRoutes from "./routes/VideoRoutes.js"
import commentRoutes from "./routes/comment.route.js";
import notificationRoute from "./routes/notificationRoute.js"
import connectDB from "./db/connectDB.js"
import errorHandler from "./middleware/errorHandler.js"; 
import shortsRoutes from "./routes/shorts.js"; 
import shortCommentRoutes from "./routes/shortComments.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const app = express();
const server = http.createServer(app); // ✅ Attach Express to HTTP Server

const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }, // Match frontend URL
});

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials : true
}))

const PORT = process.env.PORT || 5000; // Ensure a default port

app.use(express.json({ limit : "5mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended : true }));

app.use("/api/auth" , authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/videos", videoRoutes);
app.use("/api/shorts", shortsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/short-comments", shortCommentRoutes);
app.use("/api/notifications", notificationRoute);

// Global Error Handler
app.use(errorHandler);

// ✅ WebSocket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("likeShort", ({ shortId, userId }) => {
    io.emit("updateLike", { shortId, userId }); 
  });

  socket.on("newComment", ({ shortId, comment }) => {
    io.emit("updateComments", { shortId, comment }); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Corrected: Start WebSocket and Express Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});

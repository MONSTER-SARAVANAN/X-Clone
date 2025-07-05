import path from "path";
import { fileURLToPath } from "url";  //gt
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

import connectDB from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";


dotenv.config();
const app = express();
const PORT          = process.env.PORT || 5000;
const FRONTEND_URL  = process.env.FRONTEND_URL || "http://localhost:5173";
const __filename    = fileURLToPath(import.meta.url);
const __dirname     = path.resolve();


["CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET_KEY"]
  .forEach((key) => {
    if (!process.env[key])
      throw new Error(`❌ Missing ${key} in .env – Cloudinary cannot start`);
  });

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

app.use(cors({
	origin : FRONTEND_URL,
	credentials : true
}))


app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());



// app.get("/", (req, res) => {
//   res.json({ message: "API is running" });
// });

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "frontend/dist" )));

	app.use("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectDB();
});

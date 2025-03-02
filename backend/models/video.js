import mongoose from "mongoose";

const videoSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    url: {
        type: String,
        required: true
    },
    caption: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    views: {  
        type: Number,
        default: 0
    }
}, { timestamps: true });

videoSchema.index({ likes: -1 }); // Helps in sorting by likes
videoSchema.index({ views: -1 }); // Helps in sorting trending videos
videoSchema.index({ createdAt: -1 }); // Optimizes recent videos query

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;

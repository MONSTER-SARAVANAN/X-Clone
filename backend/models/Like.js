import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }
}, { timestamps: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;

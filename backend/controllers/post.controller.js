import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import cloudinary from "../utils/cloudinary.js";
import Post from "../models/post.model.js";


export const createPost = async (req, res) => {
	try {
		const { text, isShort } = req.body; // Get isShort field from frontend
		let imgUrl = null;
		let videoUrl = null;

		// Upload image if exists
		if (req.files?.img) {
			const imgUpload = await cloudinary.uploader.upload(req.files.img[0].path);
			imgUrl = imgUpload.secure_url;
		}

		// Upload video if exists
		if (req.files?.video) {
			const videoUpload = await cloudinary.uploader.upload(req.files.video[0].path, { resource_type: "video" });
			videoUrl = videoUpload.secure_url;
		}

		// Create new post (Shorts will have only videos)
		const post = await Post.create({
			text,
			img: imgUrl,
			video: videoUrl,
			user: req.user._id,
			isShort: isShort || false, // Default to false unless specified
		});

		res.status(201).json(post);
	} catch (error) {
		res.status(500).json({ error: "Failed to create post" });
	}
};

export const deletePost = async (req,res) => {
    try {
        const {id} = req.params;

        const post = await Post.findOne({_id :id});
        if(!post){
            return res.status(404).json({error : "Post not found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            res.status(401).json({error : "You are not authorized to delete this post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete({_id :id});
        res.status(200).json({message : "Post deleted successfully"})

    } catch (error) {
        console.log(`Error in deleting post controller : ${error}`);
        res.status(400).json({error : "Internal server Error"})   
    }
}
export const createComment = async (req,res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({error : "comment text is required"})
        }
        const post = await Post.findOne({_id : postId});

        if(!post){
            return res.status(404).json({error : "Post not found"})
        }
        const comment = {
            user : userId,
            text
        }
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);

    } catch (error) {
        console.log(`Error in create comment controller : ${error}`);
        res.status(400).json({error : "Internal server Error"}) 
    }
}
export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            // Unlike post
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            // Remove notification
            await Notification.findOneAndDelete({ from: userId, to: post.user, type: "like" });

        } else {
            // Like post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

            // Send notification if liking someone else's post
            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like"
                });
                await notification.save();
            }
        }

        await post.save();
        res.status(200).json(post.likes);

    } catch (error) {
        console.error(`Error in likeUnlikePost: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getAllPosts = async (req,res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select :[ "-password", "-createdAt", "-updatedAt", "-__v", "-email", "-following", "-followers", "-bio","-link"]
        })
        if(posts.length === 0){
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        console.log(`Error in get All post controller : ${error}`);
        res.status(400).json({error : "Internal server Error"}) 
    }
}
export const getLikedPosts = async (req,res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById({_id : userId})
        if(!user){
            return res.status(404).json({error : "User not found"})
        }
        const likedPosts = await Post.find({_id :{$in : user.likedPosts}})
                .populate({
                    path : "user",
                    select : "-password" 
                })
                .populate({
                    path : "comments.user",
                    select :[ "-password", "-createdAt", "-updatedAt", "-__v", "-email", "-following", "-followers", "-bio","-link"]
                })
        res.status(200).json(likedPosts)
    } catch (error) {
        console.log(`Error in get Liked posts controller : ${error}`);
        res.status(400).json({error : "Internal server Error"}) 
    }
}
export const getFollowingPosts = async (req,res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById({_id : userId})
        if(!user){
            return res.status(404).json({error :"User not found"})
        }
        const following = user.following;
        const feedPosts = await Post.find({user : {$in : following}})
                          .sort({createdAt : -1})
                          .populate({
                            path : "user",
                            select : "-password"
                          })
                          .populate({
                            path : "comments.user",
                            select :[ "-password", "-createdAt", "-updatedAt", "-__v", "-email", "-following", "-followers", "-bio","-link"]
                        })
        res.status(200).json(feedPosts)
    } catch (error) {
        console.log(`Error in get Following posts controller : ${error}`);
        res.status(400).json({error : "Internal server Error"}) 
    }
}
export const getUserPosts = async (req,res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username})
        if(!user){
            return res.status(404).json({error : "User not found"})
        }
        const posts = await Post.find({user : user._id}).sort({createdAt: -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select :[ "-password", "-createdAt", "-updatedAt", "-__v", "-email", "-following", "-followers", "-bio","-link"]
        })
        res.status(200).json(posts)
    } catch (error) {
        console.log(`Error in get User posts controller : ${error}`);
        res.status(400).json({error : "Internal server Error"}) 
    }
}
export const getShorts = async (req, res) => {
	try {
		const shorts = await Post.find({ isShort: true }).sort({ createdAt: -1 }).limit(20);
		res.status(200).json(shorts);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch shorts" });
	}
};

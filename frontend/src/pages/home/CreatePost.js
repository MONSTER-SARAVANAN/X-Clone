import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [video, setVideo] = useState(null);
	const imgRef = useRef(null);
	const videoRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img, video }) => {
			const formData = new FormData();
			formData.append("text", text);
			if (img) formData.append("img", img);  // Append image file
			if (video) formData.append("video", video); // Append video file
	
			try {
				const res = await fetch(`${baseUrl}/api/posts/create`, {
					method: "POST",
					credentials: "include",
					body: formData,  // Send formData instead of JSON
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	
		onSuccess: () => {
			setText("");
			setImg(null);
			setVideo(null);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
	
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!text && !img && !video) {
			toast.error("Post cannot be empty!");
			return;
		}
		createPost({ text, img, video });
	};
	

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImg(file);  // Store the file instead of base64
		}
	};
	
	const handleVideoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setVideo(file);  // Store the file instead of base64
		}
	};
	

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} alt=""/>
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={img} className='w-full mx-auto h-72 object-contain rounded' alt="img"/>
					</div>
				)}
				{video && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setVideo(null);
								videoRef.current.value = null;
							}}
						/>
						<video className='w-full mx-auto h-72 object-contain rounded' controls>
							<source src={video} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />
					<input type='file' accept='video/*' hidden ref={videoRef} onChange={handleVideoChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? <LoadingSpinner size="sm"/> : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;

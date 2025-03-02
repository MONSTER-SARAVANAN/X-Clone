import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../constant/url";

const ShortsUpload = () => {
	const [video, setVideo] = useState(null);
	const queryClient = useQueryClient();

	const { mutate: uploadShort, isLoading } = useMutation({
		mutationFn: async (formData) => {
			const res = await fetch(`${baseUrl}/api/shorts/upload`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			return data;
		},
		onSuccess: () => {
			toast.success("Short uploaded!");
			queryClient.invalidateQueries(["shorts"]);
			setVideo(null);
		},
		onError: () => toast.error("Upload failed"),
	});

	const handleUpload = (e) => {
		e.preventDefault();
		if (!video) return toast.error("Select a video");

		const formData = new FormData();
		formData.append("video", video);
		uploadShort(formData);
	};

	return (
		<form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
			<input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
			<button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 py-2 rounded">
				{isLoading ? "Uploading..." : "Upload Short"}
			</button>
		</form>
	);
};

export default ShortsUpload;

import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";

const Posts = ({ feedType, username, userId }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return `${baseUrl}/api/posts/all`;
			case "following":
				return `${baseUrl}/api/posts/following`;
			case "posts":
				return `${baseUrl}/api/posts/user/${username}`;
			case "likes":
				return `${baseUrl}/api/posts/likes/${userId}`;
			default:
				return `${baseUrl}/api/posts/all`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		isFetching,
	} = useQuery({
		queryKey: ["posts", feedType, username], // ✅ Dynamic queryKey for auto-fetching
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "include", // ✅ Corrected from `true` to `"include"`
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	return (
		<>
			{(isLoading || isFetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isFetching && posts?.length === 0 && (
				<p className='text-center my-4 text-gray-500'>No posts available. Try exploring more! 🚀</p>
			)}
			{!isLoading && !isFetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;

import { useEffect, useState } from "react"; 
import { useQuery, useMutation } from "@tanstack/react-query"; 
import { baseUrl } from "../../constant/url";
import { io } from "socket.io-client";

const socket = io(baseUrl); 

const ShortsPage = () => {
  const [selectedShort, setSelectedShort] = useState(null);
  const [commentText, setCommentText] = useState("");

  // ✅ Fetch Shorts
  const { data: shorts } = useQuery({
    queryKey: ["shorts"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/shorts`, { credentials: "include" });
      return res.json();
    }
  });

  // ✅ Fetch Comments for Selected Short
  const { data: comments, refetch } = useQuery({
    queryKey: ["shortComments", selectedShort],
    queryFn: async () => {
      if (!selectedShort) return [];
      const res = await fetch(`${baseUrl}/api/shorts/${selectedShort}/comments`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedShort,
  });

  // ✅ Add Comment Mutation with WebSocket
  const { mutate: addComment } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/shorts/${selectedShort}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");

      socket.emit("newComment", { shortId: selectedShort, comment: data }); // ✅ Emit WebSocket event
      return data;
    },
    onSuccess: () => {
      setCommentText(""); // Clear input
    },
  });

  // ✅ Listen for New Comments in Real-Time
  useEffect(() => {
    socket.on("updateComments", ({ shortId, comment }) => {
      if (shortId === selectedShort) {
        refetch(); // Refresh only if the comment belongs to the selected video
      }
    });

    return () => socket.off("updateComments");
  }, [selectedShort, refetch]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold text-white">Shorts</h1>
      <div className="w-full max-w-md flex flex-col gap-4">
        {shorts?.map((short) => (
          <div key={short._id} className="relative border p-4 rounded-lg">
            <video controls className="w-full rounded-lg" onClick={() => setSelectedShort(short._id)}>
              <source src={short.videoUrl} type="video/mp4" />
            </video>
            <div className="mt-2 flex justify-between items-center">
              <button className="text-blue-400" onClick={() => setSelectedShort(short._id)}>
                💬 {short.commentsCount || 0} Comments
              </button>
            </div>
            {selectedShort === short._id && (
              <div className="mt-2">
                <h2 className="text-lg font-bold">Comments</h2>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => addComment()}
                  className="mt-2 bg-blue-500 px-4 py-2 rounded-md text-white"
                >
                  Post
                </button>
                {comments?.map((comment) => (
                  <p key={comment._id} className="mt-2 text-gray-300">
                    <strong>{comment.user.username}</strong>: {comment.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortsPage;

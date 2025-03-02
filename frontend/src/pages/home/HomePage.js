import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  // Helper function to determine active tab styling
  const isActive = (type) =>
    feedType === type ? "bg-primary h-1 w-10 rounded-full absolute bottom-0" : "";

  return (
    <main className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
      {/* Header */}
      <div className="flex w-full border-b border-gray-700">
        <div
          className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
          onClick={() => feedType !== "forYou" && setFeedType("forYou")}
        >
          For You
          <div className={`absolute ${isActive("forYou")}`} />
        </div>
        <div
          className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
          onClick={() => feedType !== "following" && setFeedType("following")}
        >
          Following
          <div className={`absolute ${isActive("following")}`} />
        </div>
      </div>

      {/* Create Post Input */}
      <CreatePost />

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </main>
  );
};

export default HomePage;

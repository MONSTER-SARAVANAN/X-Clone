import React from "react";
import ReactPlayer from "react-player";
import { FaRegHeart, FaRegComment } from "react-icons/fa";

const Video = ({ video }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ReactPlayer
        url={video.url}
        playing
        loop
        muted
        controls={false}
        width="100%"
        height="100%"
      />
      <div className="absolute bottom-10 left-5 right-5 flex justify-between items-center text-white">
        <div>
          <button>
            <FaRegHeart className="text-2xl" />
          </button>
          <span>{video.likes}</span>
        </div>
        <div>
          <button>
            <FaRegComment className="text-2xl mx-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Video;

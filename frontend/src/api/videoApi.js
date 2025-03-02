// src/api/videoApi.js
const baseUrl = "http://localhost:5000/api/videos"; // Replace with your actual backend URL

// Fetch videos based on feed type (for you or following)
export const fetchVideos = async (feedType) => {
  let url = `${baseUrl}?feedType=${feedType}`;

  // Here you can modify the backend query based on the feedType parameter,
  // such as getting random videos for "forYou" or getting videos of followed users for "following"
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

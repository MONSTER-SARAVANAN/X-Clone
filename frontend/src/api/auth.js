import axios from "axios";

export const fetchAuthUser = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/auth/me", {
      withCredentials: true, // Ensure cookies (JWT) are sent
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if using localStorage
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Handle gracefully
  }
};

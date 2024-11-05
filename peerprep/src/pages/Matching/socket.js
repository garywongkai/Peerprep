import io from "socket.io-client";

const accessToken = localStorage.getItem("accessToken");
const displayName = localStorage.getItem("displayName");
const selectedCategory = localStorage.getItem("selectedCategory");
const selectedDifficulty = localStorage.getItem("selectedDifficulty");
const uid = localStorage.getItem("uid");

if (accessToken) {
  console.log("Token obtained from localStorage");
} else {
  console.log("User is not authorized yet");
}

const URL =
  process.env.REACT_APP_ENV === "development"
    ? "http://localhost:5002"
    : "https://matching-service-327190433280.asia-southeast1.run.app";

export const socket = io(URL, {
  query: {
    token: accessToken, // accessToken
    displayName: displayName, // User's display name
    selectedCategory: selectedCategory, // Selected category
    selectedDifficulty: selectedDifficulty, // Selected difficulty
    uid: uid, // User ID
  },
});

socket.on("connect", () => {
  console.log("Socket connected successfully. Socket ID:", socket.id);
});
socket.on("connect_error", (error) => {
  console.log("Socket connection failed:", error);
});

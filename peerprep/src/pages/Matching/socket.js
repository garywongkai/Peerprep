import io from 'socket.io-client';
import { getCookie } from '../../utils/cookieUtils';

const cookieToken = getCookie('access_token');
const displayName = getCookie('displayName');
const selectedCategory = getCookie('selectedCategory');
const selectedDifficulty = getCookie('selectedDifficulty');
const uid = getCookie('uid');

if (cookieToken) {
    console.log("Token obtained from cookies");
} else {
    console.log("User is not authorized yet");
}


const URL = process.env.REACT_APP_ENV === "development"
? "http://localhost:5002"
: "https://matching-service-327190433280.asia-southeast1.run.app";

export const socket = io(URL, {
    query: {
        token: cookieToken,  // access_token
        displayName: displayName,  // User's display name
        selectedCategory: selectedCategory,  // Selected category
        selectedDifficulty: selectedDifficulty,  // Selected difficulty
        uid: uid  // User ID
    }
});

socket.on('connect', () => {
    console.log('Socket connected successfully. Socket ID:', socket.id);
});
socket.on('connect_error', (error) => {
    console.log('Socket connection failed:', error);
});
require("dotenv").config(); // 加载环境变量
// const firebase = require("firebase/app");

const { initializeApp } = require("firebase/app");
// const { getAnalytics } = require("firebase/analytics");
const {
    getAuth,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
// const { getDatabase } = require("firebase/database");
// const {
//     getDownloadURL,
//     getStorage,
//     ref,
//     uploadBytes,
// } = require("firebase/storage");
// const admin = require("firebase-admin");
// import * as admin from 'firebase-admin';

// const firebaseService = {
//     type: process.env.USER_SERVICE_TYPE,
//     project_id: process.env.USER_SERVICE_PROJECT_ID,
//     private_key_id: process.env.USER_SERVICE_PRIVATE_KEY_ID,
//     private_key: process.env.USER_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle multiline private key
//     client_email: process.env.USER_SERVICE_CLIENT_EMAIL,
//     client_id: process.env.USER_SERVICE_CLIENT_ID,
//     auth_uri: process.env.USER_SERVICE_AUTH_URI,
//     token_uri: process.env.USER_SERVICE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//         process.env.USER_SERVICE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.USER_SERVICE_CLIENT_X509_CERT_URL,
//     universe_domain: process.env.USER_SERVICE_UNIVERSE_DOMAIN,
// };

// admin.initializeApp({
//     credential: admin.credential.cert(firebaseService),
// });

// Firebase 配置，从 .env 文件中读取环境变量
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// firebase.initializeApp(firebaseConfig);


// 初始化 Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
// const googleProvider = new GoogleAuthProvider();
// const storage = getStorage();
// const realtime = getDatabase();

// 上传图片的辅助函数
// async function uploadimage(file, currentUser, setLoading) {
//     const fileRef = ref(storage, currentUser.uid + ".png");

//     setLoading(true);

//     const snapshot = await uploadBytes(fileRef, file);
//     const photoURL = await getDownloadURL(fileRef);

//     updateProfile(currentUser, { photoURL });

//     setLoading(false);
//     alert("Uploaded file!");
// }

// 导出需要的模块
module.exports = { db, getAuth};

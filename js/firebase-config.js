// Firebase App Configuration & SDK Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMrjgGsmuFaIDmtF0z4Ue2CCmZdtFbA7s",
  authDomain: "clock-e460d.firebaseapp.com",
  projectId: "clock-e460d",
  storageBucket: "clock-e460d.firebasestorage.app",
  messagingSenderId: "570510944860",
  appId: "1:570510944860:web:fb724abc2c8bf9e117d499"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
window.firebaseApp = firebaseApp;
console.log("🔥 Firebase initialized successfully for clock-e460d");

// Firebase App Configuration & SDK Initialization for clock-964f5
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPlSj4zIG99iicJVxyuG5fTsH4mMVRYZw",
  authDomain: "clock-964f5.firebaseapp.com",
  projectId: "clock-964f5",
  storageBucket: "clock-964f5.firebasestorage.app",
  messagingSenderId: "1019001291795",
  appId: "1:1019001291795:web:5e541a770e1891530b6be6",
  measurementId: "G-J1S0CMLPT6"
};

// Initialize Firebase & Analytics
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics initialized in supported environment.");
}

window.firebaseApp = app;
window.firebaseAnalytics = analytics;
console.log("🔥 Firebase initialized successfully for project: clock-964f5");

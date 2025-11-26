// academy/js/firebase.js
// Firebase initialization for Academy section

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw8zLcIc8bB9ru8yQzqf4s5S3eJdYEgl0",
  authDomain: "yalthundersauth.firebaseapp.com",
  projectId: "yalthundersauth",
  storageBucket: "yalthundersauth.firebasestorage.app",
  messagingSenderId: "4689191399",
  appId: "1:4689191399:web:e76187186ff48b0af45d42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


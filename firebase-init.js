// firebase-init.js

// Import functions directly from the Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// !!! PASTE YOUR FIREBASE CONFIG OBJECT HERE !!!
// (Using the config you shared earlier)
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

// Export the services to be used by other files
// app: The initialized Firebase app
// auth: Handles user login, registration, etc.
// db: Handles the Cloud Firestore database
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
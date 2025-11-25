// /api/_firebase.js

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SENİN GERÇEK FIREBASE CONFIGİN
const firebaseConfig = {
  apiKey: "AIzaSyBw8zLcIc8bB9ru8yQzqf4s5S3eJdYEgl0",
  authDomain: "yalthundersauth.firebaseapp.com",
  projectId: "yalthundersauth",
  storageBucket: "yalthundersauth.firebasestorage.app",
  messagingSenderId: "4689191399",
  appId: "1:4689191399:web:e76187186ff48b0af45d42"
};

// Firebase'i server kapanmasın diye tekrar tekrar başlatmayalım:
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore bağlantısı
export const db = getFirestore(app);

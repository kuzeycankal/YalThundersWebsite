// firebase-init.js
// Firebase'i NPM'den değil, CDN'den (internetten) import et
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// !!! KENDİ FIREBASE CONFIG BİLGİLERİNİ BURAYA YAPIŞTIR !!!
// (Daha önce paylaştığın bilgileri kullanıyorum)
const firebaseConfig = {
  apiKey: "AIzaSyBw8zLcIc8bB9ru8yQzqf4s5S3eJdYEgl0",
  authDomain: "yalthundersauth.firebaseapp.com",
  projectId: "yalthundersauth",
  storageBucket: "yalthundersauth.firebasestorage.app",
  messagingSenderId: "4689191399",
  appId: "1:4689191399:web:e76187186ff48b0af45d42"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Diğer dosyalarda kullanmak için servisleri export et
export const auth = getAuth(app);
export const db = getFirestore(app);
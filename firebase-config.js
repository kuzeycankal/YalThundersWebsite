// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, getDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0yNDsRoPT4m4K6MhwAD8aP3dxDkdrVOI",
  authDomain: "yaltevent.firebaseapp.com",
  projectId: "yaltevent",
  storageBucket: "yaltevent.firebasestorage.app",
  messagingSenderId: "287692640973",
  appId: "1:287692640973:web:e974542e18983253e6cf84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin secret code
const ADMIN_SECRET_CODE = "YAL2026ADMIN";

console.log("🔥 Firebase initialized!");

// Helper: Get current user data
async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return { uid: user.uid, ...userDoc.data() };
  }
  return null;
}

// Helper: Increment user contributions
async function incrementUserContributions(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      eventContributions: increment(1),
      lastEventDate: new Date().toISOString()
    });
    console.log('✅ User contributions incremented');
  } catch (error) {
    console.error('Error incrementing contributions:', error);
  }
}

// Export for use in other files
export { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  getDoc,
  serverTimestamp, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  ADMIN_SECRET_CODE,
  getCurrentUserData,
  incrementUserContributions,
  increment
};
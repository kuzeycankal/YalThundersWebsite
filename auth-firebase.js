// ----------------------------
// Firebase Imports
// ----------------------------
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase-init.js";


// ===============================
// AUTO UI UPDATE ON LOGIN STATUS
// ===============================

function updateHeaderUI(user) {
    const authButtons = document.getElementById("authButtons");
    const mobileAuth = document.getElementById("mobileAuthButtons");

    if (!authButtons) return;

    // Check if we're on Turkish page
    const isTurkish = window.location.pathname.startsWith('/tr/');
    const profilePath = isTurkish ? '/tr/profile.html' : '/profile.html';
    const loginPath = isTurkish ? '/tr/login.html' : '/login.html';
    const registerPath = isTurkish ? '/tr/register.html' : '/register.html';

    if (user) {
        const userName = user.displayName || user.email?.split('@')[0] || 'User';
        authButtons.innerHTML = `
            <a href="${profilePath}" class="user-profile-btn">
                <i class="fa-solid fa-user-circle"></i>
                <span>${userName}</span>
            </a>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <a href="${profilePath}" class="user-profile-btn">
                    <i class="fa-solid fa-user-circle"></i>
                    <span>${userName}</span>
                </a>
                <button id="logoutBtnMobile" class="logout-btn">Logout</button>
            `;
        }

        document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);
        document.getElementById("logoutBtnMobile")?.addEventListener("click", logoutUser);
    } 
    else {
        authButtons.innerHTML = `
            <a href="${loginPath}" class="login-btn">Login</a>
            <a href="${registerPath}" class="register-btn">Register</a>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <a href="${loginPath}" class="login-btn">Login</a>
                <a href="${registerPath}" class="register-btn">Register</a>
            `;
        }
    }
}

// Make it available globally for other scripts
window.updateAuthButtons = function() {
    const user = auth.currentUser;
    updateHeaderUI(user);
};



// ===============================
// ADMIN CHECK
// ===============================

export async function checkAdmin() {
    const user = auth.currentUser;
    if (!user) return false;

    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    return adminDoc.exists();
}



// ===============================
// LOGIN HANDLER
// ===============================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMessage");

    msg.textContent = "Logging in...";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        msg.textContent = "Success! Redirecting...";
        setTimeout(() => { window.location.href = "/index.html"; }, 800);
    } 
    catch (err) {
        msg.textContent = err.message;
    }
}



// ===============================
// REGISTER HANDLER
// ===============================

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("registerPasswordConfirm").value;
    const adminCode = document.getElementById("adminCode").value;
    const msg = document.getElementById("registerMessage");

    msg.textContent = "Creating account...";

    if (password !== confirm) {
        msg.textContent = "Passwords do not match!";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Admin kaydı
        if (adminCode === "YALTHUNDERS2026") {
            await setDoc(doc(db, "admins", user.uid), { admin: true });
        }

        msg.textContent = "Account created! Redirecting...";
        setTimeout(() => window.location.href = "/index.html", 800);
    } 
    catch (err) {
        msg.textContent = err.message;
    }
}



// ===============================
// LOGOUT
// ===============================

async function logoutUser() {
    await signOut(auth);
    window.location.href = "/index.html";
}



// ===============================
// EVENT LISTENERS ON PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
});


// ===============================
// AUTH STATE CHANGE LISTENER
// ===============================

let authReady = false;
let currentUserData = null;
let currentUserProfileData = null;

onAuthStateChanged(auth, async (user) => {
    updateHeaderUI(user);
    
    if (user) {
        // Get user profile from Firestore
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                currentUserProfileData = {
                    name: userDoc.data().name || user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    createdAt: userDoc.data().createdAt || user.metadata.creationTime,
                    attendedEvents: userDoc.data().attendedEvents || 0,
                    isAdmin: userDoc.data().isAdmin || false
                };
            } else {
                // Create user profile if it doesn't exist
                currentUserProfileData = {
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    createdAt: user.metadata.creationTime,
                    attendedEvents: 0,
                    isAdmin: false
                };
                await setDoc(doc(db, "users", user.uid), {
                    name: currentUserProfileData.name,
                    email: currentUserProfileData.email,
                    createdAt: currentUserProfileData.createdAt,
                    attendedEvents: 0
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            currentUserProfileData = {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                createdAt: user.metadata.creationTime,
                attendedEvents: 0,
                isAdmin: false
            };
        }
        currentUserData = user;
    } else {
        currentUserData = null;
        currentUserProfileData = null;
    }
    
    if (!authReady) {
        authReady = true;
        document.dispatchEvent(new CustomEvent('authStateReady'));
    }
});

// ===============================
// EXPORTED FUNCTIONS
// ===============================

export function getCurrentUser() {
    return currentUserData;
}

export function getCurrentUserProfile() {
    return currentUserProfileData;
}

export function isAuthReady() {
    return authReady;
}

export async function logout() {
    await signOut(auth);
    const isTurkish = window.location.pathname.startsWith('/tr/');
    window.location.href = isTurkish ? '/tr/index.html' : '/index.html';
}

// Export
export { auth, db };

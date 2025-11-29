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
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { app } from "./firebase-init.js";

const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// AUTO UI UPDATE ON LOGIN STATUS
// ===============================

function updateHeaderUI(user) {
    const authButtons = document.getElementById("authButtons");
    const mobileAuth = document.getElementById("mobileAuthButtons");

    if (!authButtons) return;

    if (user) {
        // Determine language for profile link
        const isTurkish = window.location.pathname.startsWith('/tr/');
        const profileLink = isTurkish ? '/tr/profile.html' : '/profile.html';
        const accountLink = isTurkish ? '/tr/profile.html' : '/profile.html';
        
        // Get user initials for avatar
        const displayName = user.displayName || user.email;
        const initials = displayName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().slice(0, 2);
        
        authButtons.innerHTML = `
            <div class="user-menu-container">
                <a href="${profileLink}" class="user-profile-btn">
                    <div class="user-avatar">${initials}</div>
                    <span>${displayName.split(' ')[0] || 'Account'}</span>
                    <i class="fa-solid fa-caret-down"></i>
                </a>
                <div class="user-dropdown-menu">
                    <a href="${profileLink}" class="dropdown-item">
                        <i class="fa-solid fa-user"></i>
                        <span>Profile</span>
                    </a>
                    <a href="${accountLink}" class="dropdown-item">
                        <i class="fa-solid fa-cog"></i>
                        <span>Account</span>
                    </a>
                    <button id="logoutBtn" class="dropdown-item logout-dropdown-btn">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <a href="${profileLink}" class="user-profile-btn">
                    <div class="user-avatar">${initials}</div>
                    <span>Profile</span>
                </a>
                <button id="logoutBtnMobile" class="logout-btn">Logout</button>
            `;
        }

        // Add dropdown toggle functionality
        const profileBtn = document.querySelector('.user-profile-btn');
        const dropdownMenu = document.querySelector('.user-dropdown-menu');
        
        if (profileBtn && dropdownMenu) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);
        document.getElementById("logoutBtnMobile")?.addEventListener("click", logoutUser);
    } 
    else {
        // Determine language for login/register links
        const isTurkish = window.location.pathname.startsWith('/tr/');
        const loginLink = isTurkish ? '/tr/login.html' : '/login.html';
        const registerLink = isTurkish ? '/tr/register.html' : '/register.html';
        
        authButtons.innerHTML = `
            <a href="${loginLink}" class="auth-btn login-btn">Login</a>
            <a href="${registerLink}" class="auth-btn register-btn">Register</a>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <a href="${loginLink}" class="auth-btn login-btn">Login</a>
            `;
        }
    }
}



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

onAuthStateChanged(auth, user => {
    updateHeaderUI(user);
});


// Export
export { auth, db };

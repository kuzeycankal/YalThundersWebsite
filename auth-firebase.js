// auth-firebase.js
// Imports functions from Firebase CDN and our local 'firebase-init.js'
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js"; // Our local init file

// Module-level variables to track auth state
let currentUser = null;
let userProfile = null; // This will hold data from Firestore (name, isAdmin, etc.)
let authReady = false;

/**
 * This listener is the core of our new auth system.
 * It runs when the page loads and any time the user logs in or out.
 */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        currentUser = user;
        userProfile = await fetchUserProfile(user.uid);
        console.log("Auth State: Logged In", userProfile);
    } else {
        // User is logged out
        currentUser = null;
        userProfile = null;
        console.log("Auth State: Logged Out");
    }
    authReady = true;
    // Notify other scripts (like events.html) that auth is ready
    document.dispatchEvent(new Event("authStateReady"));
});

/**
 * Fetches the user's custom profile data (name, admin status) from Firestore.
 * @param {string} uid The user's unique ID from Firebase Auth
 * @returns {object | null} The user profile data or null
 */
async function fetchUserProfile(uid) {
    try {
        const userDocRef = doc(db, "users", uid); // Path: /users/{userId}
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.error("User profile (in Firestore) not found!");
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
    }
}

// --- Public Functions ---
// These are exported so other scripts can access them
export function isLoggedIn() { return currentUser !== null; }
export function getCurrentUser() { return currentUser; } // Firebase auth object (uid, email)
export function getCurrentUserProfile() { return userProfile; } // Firestore profile object (name, isAdmin)
export function isAuthReady() { return authReady; }

// --- Auth Actions ---

/**
 * Handles the registration form submission.
 */
async function handleRegister(e) {
    e.preventDefault();
    const registerForm = e.target;
    const name = registerForm.registerName.value.trim();
    const email = registerForm.registerEmail.value.trim().toLowerCase();
    const password = registerForm.registerPassword.value;
    const adminCode = registerForm.adminCode ? registerForm.adminCode.value.trim() : '';

    let isAdmin = false;
    if (adminCode) {
        if (adminCode === 'YALTHUNDERS2026') { // Your admin code
            isAdmin = true;
        } else {
            showMessage('registerMessage', 'Invalid Admin Code', 'error');
            return;
        }
    }

    try {
        // 1. Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Create their profile document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            name: name,
            email: email,
            isAdmin: isAdmin,
            attendedEvents: 0,
            registeredEvents: 0,
            createdAt: new Date().toISOString()
        });
        
        showMessage('registerMessage', 'Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = '/login.html'; }, 2000);

    } catch (error) {
        console.error("Registration Error:", error);
        showMessage('registerMessage', `Registration failed: ${mapFirebaseError(error.code)}`, 'error');
    }
}

/**
 * Handles the login form submission.
 */
async function handleLogin(e) {
    e.preventDefault();
    const loginForm = e.target;
    const email = loginForm.loginEmail.value.trim().toLowerCase();
    const password = loginForm.loginPassword.value;
    const rememberMe = loginForm.rememberMe.checked;

    try {
        // Set persistence (session vs. local)
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        
        showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = '/index.html'; }, 1500);

    } catch (error) {
        console.error("Login Error:", error);
        showMessage('loginMessage', `Login failed: ${mapFirebaseError(error.code)}`, 'error');
    }
}

/**
 * Handles user sign-out.
 */
export async function logout() {
    try {
        await signOut(auth);
        // onAuthStateChanged will fire and handle the redirect
        window.location.href = '/login.html';
    } catch (error) {
        console.error("Sign out error:", error);
    }
}

// --- Helper Functions ---

/**
 * Translates Firebase error codes into user-friendly messages.
 * @param {string} errorCode The error code from Firebase
 * @returns {string} A user-friendly error message
 */
function mapFirebaseError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email format.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password is too weak (min. 6 characters).';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        default:
            return 'An unknown error occurred: ' + errorCode;
    }
}

/**
 * Displays a success or error message on the auth forms.
 */
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
    setTimeout(() => { 
        if (element) element.style.display = 'none'; 
    }, 5000);
}

/**
 * Sets up the show/hide password toggle buttons.
 */
function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// --- Page Initialization ---

/**
 * Attaches listeners to login/register forms.
 */
function initAuthPage() {
    initPasswordToggle();
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    // Check if user is already logged in and should be redirected
    if (!isAuthReady()) {
        document.addEventListener('authStateReady', checkAuthRedirect);
    } else {
        checkAuthRedirect();
    }
}

/**
 * Redirects logged-in users away from login/register pages.
 */
function checkAuthRedirect() {
    if (isLoggedIn() && (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html'))) {
        window.location.href = '/index.html';
    }
}

// Run initAuthPage only on login/register pages
if (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html')) {
    document.addEventListener('DOMContentLoaded', initAuthPage);
}

/**
 * Updates the header auth buttons (Login/Register or Profile)
 * This runs on EVERY page.
 */
function updateAuthButtons() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;

    if (isLoggedIn() && userProfile) {
        // User is logged in and profile is loaded
        const initials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        authButtonsContainer.innerHTML = `
            <div class="user-menu-container">
                <button class="user-profile-btn" onclick="toggleUserMenu(event)">
                    <span class="user-avatar">${initials}</span>
                    <span>${userProfile.name.split(' ')[0]}</span>
                    <i class="fa-solid fa-caret-down"></i>
                </button>
                <div class="user-dropdown-menu" id="userDropdown">
                    <a href="/profile.html" class="dropdown-item">
                        <i class="fa-solid fa-user"></i>
                        <span>My Profile</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" onclick="logout()">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Sign Out</span>
                    </a>
                </div>
            </div>
        `;
    } else {
        // User is logged out
        authButtonsContainer.innerHTML = `
            <a href="/login.html" class="auth-btn login-btn">
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>Login</span>
            </a>
            <a href="/register.html" class="auth-btn register-btn">
                <i class="fa-solid fa-user-plus"></i>
                <span>Register</span>
            </a>
        `;
    }
}

// Update buttons as soon as auth state is known, and again on DOM load
document.addEventListener('authStateReady', updateAuthButtons);
document.addEventListener('DOMContentLoaded', updateAuthButtons);

// --- Make essential functions globally available for inline onclicks ---
// (We keep these for simplicity in HTML, e.g., onclick="logout()")
window.toggleUserMenu = (event) => {
    event.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('show');
};
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const userBtn = document.querySelector('.user-profile-btn');
    if (dropdown && userBtn && !dropdown.contains(event.target) && !userBtn.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});
window.logout = logout; // Make logout function global
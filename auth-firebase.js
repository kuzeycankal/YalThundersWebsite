// auth-firebase.js
// Firebase'i CDN'den ve 'firebase-init.js'den import et
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
import { auth, db } from "./firebase-init.js"; // Yerel dosyamız

let currentUser = null;
let userProfile = null;
let authReady = false;

// Firebase oturumunu dinle
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userProfile = await fetchUserProfile(user.uid);
        console.log("Auth State: Logged In", userProfile);
    } else {
        currentUser = null;
        userProfile = null;
        console.log("Auth State: Logged Out");
    }
    authReady = true;
    document.dispatchEvent(new Event("authStateReady"));
});

async function fetchUserProfile(uid) {
    try {
        const userDocRef = doc(db, "users", uid);
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

// Dışarıdan erişim için fonksiyonlar
export function isLoggedIn() { return currentUser !== null; }
export function getCurrentUser() { return currentUser; }
export function getCurrentUserProfile() { return userProfile; }
export function isAuthReady() { return authReady; }

// Register
async function handleRegister(e) {
    e.preventDefault();
    const registerForm = e.target;
    const name = registerForm.registerName.value.trim();
    const email = registerForm.registerEmail.value.trim().toLowerCase();
    const password = registerForm.registerPassword.value;
    const adminCode = registerForm.adminCode ? registerForm.adminCode.value.trim() : '';

    let isAdmin = false;
    if (adminCode) {
        if (adminCode === 'YALTHUNDERS2026') { // Admin kodu
            isAdmin = true;
        } else {
            showMessage('registerMessage', 'Invalid Admin Code', 'error');
            return;
        }
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
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
        showMessage('registerMessage', `Registration failed: ${mapFirebaseError(error.code)}`, 'error');
    }
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    const loginForm = e.target;
    const email = loginForm.loginEmail.value.trim().toLowerCase();
    const password = loginForm.loginPassword.value;
    const rememberMe = loginForm.rememberMe.checked;

    try {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        await signInWithEmailAndPassword(auth, email, password);
        
        showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = '/index.html'; }, 1500);

    } catch (error) {
        showMessage('loginMessage', `Login failed: ${mapFirebaseError(error.code)}`, 'error');
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = '/login.html';
    } catch (error) {
        console.error("Sign out error:", error);
    }
}

// Hata mesajı çevirileri
function mapFirebaseError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return 'Invalid email format.';
        case 'auth/email-already-in-use': return 'This email is already registered.';
        case 'auth/weak-password': return 'Password is too weak (min. 6 characters).';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        default: return 'An unknown error occurred: ' + errorCode;
    }
}

// UI Fonksiyonları
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
    setTimeout(() => { element.style.display = 'none'; }, 5000);
}

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

// Sayfa Yükleme
function initAuthPage() {
    initPasswordToggle();
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    if (!isAuthReady()) {
        document.addEventListener('authStateReady', checkAuthRedirect);
    } else {
        checkAuthRedirect();
    }
}

function checkAuthRedirect() {
    if (isLoggedIn() && (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html'))) {
        window.location.href = '/index.html';
    }
}

// login.html ve register.html'de çalıştır
if (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html')) {
    document.addEventListener('DOMContentLoaded', initAuthPage);
}

// Header Butonlarını Güncelle (Tüm sayfalarda çalışacak)
function updateAuthButtons() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;

    if (isLoggedIn() && userProfile) {
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

document.addEventListener('authStateReady', updateAuthButtons);
document.addEventListener('DOMContentLoaded', updateAuthButtons);

// Global (window) Fonksiyonları (onclick'ler için)
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
window.logout = logout; // 'logout' fonksiyonunu global yap
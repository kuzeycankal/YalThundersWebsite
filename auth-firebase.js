// auth-firebase.js
import { auth, db } from "/firebase-init.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --------------------------------------
// ADMIN LIST (Şimdilik mail ile kontrol)
// --------------------------------------
const ADMINS = [
    "kuzeycankal@gmail.com"
];

// --------------------------------------
// HEADER BUTTONS
// --------------------------------------
function updateAuthButtons(userProfile) {
    const authButtons = document.getElementById("authButtons");
    const mobileButtons = document.getElementById("mobileAuthButtons");

    if (!authButtons || !mobileButtons) return;

    if (!userProfile) {
        // Not logged in
        authButtons.innerHTML = `
            <button class="login-btn" onclick="location.href='/login.html'">Login</button>
            <button class="register-btn" onclick="location.href='/register.html'">Register</button>
        `;
        mobileButtons.innerHTML = authButtons.innerHTML;
        return;
    }

    // Logged in
    const isAdmin = userProfile.isAdmin === true;

    authButtons.innerHTML = `
        ${isAdmin ? `<a href="/academy/academy-admin.html" class="admin-link">Admin Panel</a>` : ""}
        <button class="logout-btn" id="logoutBtn">Logout</button>
    `;

    mobileButtons.innerHTML = authButtons.innerHTML;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await signOut(auth);
            location.href = "/";
        };
    }
}

// --------------------------------------
// USER PROFILE LOADING (FIRESTORE)
// --------------------------------------
async function loadUserProfile(uid, email) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    // Eğer kullanıcı ilk kez giriyorsa kaydet
    if (!snap.exists()) {
        const isAdmin = ADMINS.includes(email);

        await setDoc(ref, {
            email,
            isAdmin
        });

        return { email, isAdmin };
    }

    return snap.data();
}

// --------------------------------------
// AUTH STATE LISTENER
// --------------------------------------
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        updateAuthButtons(null);
        return;
    }

    const profile = await loadUserProfile(user.uid, user.email);

    updateAuthButtons(profile);

    // Eğer admin ise admin sayfasına yönlendir
    if (profile.isAdmin && location.pathname.includes("login")) {
        location.href = "/academy/academy-admin.html";
    }
});

// --------------------------------------
// LOGIN HANDLER
// --------------------------------------
export async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// --------------------------------------
// REGISTER HANDLER
// --------------------------------------
export async function register(email, password, code) {
    const REQUIRED_CODE = "YALTHUNDERS2026";

    if (code !== REQUIRED_CODE) {
        return { success: false, message: "Invalid registration code" };
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

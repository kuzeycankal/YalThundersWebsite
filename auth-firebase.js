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

    if (user) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span>${user.displayName || user.email}</span>
                <button id="logoutBtn" class="logout-btn">Logout</button>
            </div>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <button id="logoutBtnMobile" class="logout-btn">Logout</button>
            `;
        }

        document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);
        document.getElementById("logoutBtnMobile")?.addEventListener("click", logoutUser);
    } 
    else {
        authButtons.innerHTML = `
            <a href="/login.html" class="login-btn">Login</a>
            <a href="/register.html" class="register-btn">Register</a>
        `;

        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <a href="/login.html" class="login-btn">Login</a>
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

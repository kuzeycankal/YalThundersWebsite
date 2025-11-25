// academy/js/admin.js
// Admin kontrol sistemi (Firebase Auth + Admin e-mail listesi)

console.log("Admin Panel JS Loaded");

// Admin e-mail listesi
const ADMINS = ["kuzeycankal@gmail.com"];

// Firebase yüklenmiş olmalı
function waitForFirebase() {
    return new Promise(resolve => {
        const check = () => {
            if (window.firebase && firebase.auth) resolve();
            else setTimeout(check, 50);
        };
        check();
    });
}

async function checkAdmin() {
    await waitForFirebase();

    firebase.auth().onAuthStateChanged(user => {
        const lock = document.getElementById("adminLock");
        const content = document.getElementById("adminContent");

        if (!user) {
            lock.textContent = "You must be logged in to access the admin panel.";
            return;
        }

        // Admin kontrolü
        if (!ADMINS.includes(user.email)) {
            lock.textContent = "You are not an admin.";
            return;
        }

        // Admin ise:
        lock.style.display = "none";
        content.style.display = "block";
    });
}

checkAdmin();

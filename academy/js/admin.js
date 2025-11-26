// academy/js/admin.js
// Admin panel authentication and authorization

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Admin Panel JS Loaded");

// Admin email list (fallback method)
const ADMIN_EMAILS = [
    "kuzeycankal@gmail.com"
];

// Check if user is admin (checks both email list and Firestore)
async function checkIfAdmin(user) {
    if (!user) return false;
    
    // First check email list (faster and always works)
    if (ADMIN_EMAILS.includes(user.email)) {
        console.log("Admin verified by email:", user.email);
        return true;
    }
    
    // Then check Firestore (for users added via admin code during registration)
    try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
            console.log("Admin verified by Firestore:", user.email);
            return true;
        }
    } catch (err) {
        console.error("Error checking admin status in Firestore:", err);
        // Continue anyway, email check already failed
    }
    
    return false;
}

// Verify admin and show/hide content
async function verifyAdmin() {
    const statusElement = document.getElementById("adminStatus");
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (statusElement) {
                statusElement.textContent = "❌ You must be logged in to access the admin panel.";
                statusElement.style.color = "#ff4444";
            }
            
            // Hide admin content
            const adminGrid = document.querySelector(".admin-grid");
            if (adminGrid) adminGrid.style.display = "none";
            
            return;
        }

        // Check if user is admin
        const isAdmin = await checkIfAdmin(user);
        
        if (!isAdmin) {
            if (statusElement) {
                statusElement.textContent = "❌ You do not have admin privileges.";
                statusElement.style.color = "#ff4444";
            }
            
            // Hide admin content
            const adminGrid = document.querySelector(".admin-grid");
            if (adminGrid) adminGrid.style.display = "none";
            
            return;
        }

        // User is admin
        if (statusElement) {
            statusElement.textContent = `✅ Authenticated as ${user.displayName || user.email}`;
            statusElement.style.color = "#44ff44";
        }
        
        // Show admin content
        const adminGrid = document.querySelector(".admin-grid");
        if (adminGrid) adminGrid.style.display = "grid";
    });
}

// Initialize
verifyAdmin();

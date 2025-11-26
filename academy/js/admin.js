// academy/js/admin.js
// Admin panel authentication and authorization

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Admin Panel JS Loaded");

// Check if user is admin
async function checkIfAdmin(user) {
    try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        return adminDoc.exists();
    } catch (err) {
        console.error("Error checking admin status:", err);
        return false;
    }
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

// academy/js/meetings.js
// Meeting creation and management functionality

import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

console.log("Meetings JS Loaded");

// Admin email list (fallback method)
const ADMIN_EMAILS = [
    "kuzeycankal@gmail.com"
];

// Check if user is admin
async function checkIfAdmin(user) {
    if (!user) return false;
    
    // First check email list
    if (ADMIN_EMAILS.includes(user.email)) {
        return true;
    }
    
    // Then check Firestore
    try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        return adminDoc.exists();
    } catch (err) {
        console.error("Error checking admin status:", err);
        return false;
    }
}

// Handle meeting creation
async function handleMeetingCreate(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageElement = document.getElementById("meetingCreateMessage");
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Check if user is logged in
    if (!auth.currentUser) {
        if (messageElement) {
            messageElement.textContent = "❌ You must be logged in to create meetings.";
            messageElement.style.color = "#ff4444";
        }
        return;
    }
    
    // Get form data
    const title = document.getElementById("meetingTitle").value.trim();
    const description = document.getElementById("meetingDescription").value.trim();
    const dateTime = document.getElementById("meetingDate").value;
    const joinCode = document.getElementById("meetingCode").value.trim();
    
    if (!title || !dateTime || !joinCode) {
        if (messageElement) {
            messageElement.textContent = "❌ Please fill in all required fields.";
            messageElement.style.color = "#ff4444";
        }
        return;
    }
    
    // Disable submit button
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    }
    
    try {
        // Check if user is admin
        const isAdmin = await checkIfAdmin(auth.currentUser);
        
        if (!isAdmin) {
            if (messageElement) {
                messageElement.textContent = "❌ You do not have permission to create meetings.";
                messageElement.style.color = "#ff4444";
            }
            return;
        }
        
        // Create meeting
        await addDoc(collection(db, "meetings"), {
            title: title,
            description: description,
            dateTime: dateTime,
            joinCode: joinCode,
            createdBy: auth.currentUser.uid,
            creatorName: auth.currentUser.displayName || auth.currentUser.email,
            createdAt: serverTimestamp()
        });
        
        // Success
        if (messageElement) {
            messageElement.textContent = "✅ Meeting created successfully!";
            messageElement.style.color = "#44ff44";
        }
        
        // Reset form
        form.reset();
        
    } catch (err) {
        console.error("Meeting creation error:", err);
        if (messageElement) {
            messageElement.textContent = `❌ Failed to create meeting: ${err.message}`;
            messageElement.style.color = "#ff4444";
        }
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-plus"></i> Create Meeting';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const meetingForm = document.getElementById('meetingCreateForm');
    if (meetingForm) {
        meetingForm.addEventListener('submit', handleMeetingCreate);
    }
});

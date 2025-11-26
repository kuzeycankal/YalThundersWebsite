// academy/js/list-meetings.js
// Fetch and display list of meetings

import { db, auth } from './firebase.js';
import { collection, getDocs, deleteDoc, doc, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("List Meetings JS Loaded");

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

// Fetch all meetings
async function fetchMeetings() {
    try {
        const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return meetings;
    } catch (err) {
        console.error("Error fetching meetings:", err);
        return [];
    }
}

// Delete a meeting
async function deleteMeeting(meetingId) {
    try {
        await deleteDoc(doc(db, "meetings", meetingId));
        return true;
    } catch (err) {
        console.error("Error deleting meeting:", err);
        return false;
    }
}

// Render meetings to the list
async function renderMeetings(meetings) {
    const listElement = document.getElementById("meetingsList");
    const emptyState = document.getElementById("meetingsEmptyState");
    
    if (!listElement) return;
    
    // Check if user is admin
    const isAdmin = await checkIfAdmin(auth.currentUser);
    
    // Clear list
    listElement.innerHTML = "";
    
    // Show empty state if no meetings
    if (meetings.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        listElement.style.display = "none";
        return;
    }
    
    // Hide empty state
    if (emptyState) emptyState.style.display = "none";
    listElement.style.display = "grid";
    
    // Render each meeting
    meetings.forEach(meeting => {
        const card = document.createElement('div');
        card.className = 'meeting-card';
        
        const meetingDate = meeting.dateTime ? new Date(meeting.dateTime).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        }) : 'Date not set';
        
        const isPast = meeting.dateTime && new Date(meeting.dateTime) < new Date();
        const statusClass = isPast ? 'meeting-past' : 'meeting-upcoming';
        const statusText = isPast ? 'Past' : 'Upcoming';
        
        card.innerHTML = `
            <div class="meeting-status ${statusClass}">
                <i class="fa-solid fa-circle"></i> ${statusText}
            </div>
            <h3 class="meeting-title">${meeting.title || 'Untitled Meeting'}</h3>
            <div class="meeting-date">
                <i class="fa-solid fa-calendar"></i> ${meetingDate}
            </div>
            <p class="meeting-description">${meeting.description || 'No description provided.'}</p>
            <div class="meeting-code">
                <i class="fa-solid fa-key"></i> Join Code: <strong>${meeting.joinCode || 'N/A'}</strong>
            </div>
            <div class="meeting-creator">
                <i class="fa-solid fa-user"></i> Created by: ${meeting.creatorName || 'Unknown'}
            </div>
            ${isAdmin ? `
                <button class="meeting-delete-btn" data-id="${meeting.id}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            ` : ''}
        `;
        
        // Add delete handler if admin
        if (isAdmin) {
            const deleteBtn = card.querySelector('.meeting-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (!confirm('Are you sure you want to delete this meeting?')) return;
                    
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
                    
                    const success = await deleteMeeting(meeting.id);
                    
                    if (success) {
                        card.remove();
                        
                        // Check if list is now empty
                        const remainingCards = listElement.querySelectorAll('.meeting-card');
                        if (remainingCards.length === 0) {
                            if (emptyState) emptyState.style.display = "flex";
                            listElement.style.display = "none";
                        }
                    } else {
                        alert('Failed to delete meeting. Please try again.');
                        deleteBtn.disabled = false;
                        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
                    }
                });
            }
        }
        
        listElement.appendChild(card);
    });
}

// Initialize
async function init() {
    try {
        const meetings = await fetchMeetings();
        await renderMeetings(meetings);
    } catch (err) {
        console.error("Error initializing meetings list:", err);
        
        const listElement = document.getElementById("meetingsList");
        if (listElement) {
            listElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #ffcc00; margin-bottom: 20px;"></i>
                    <h3>Error Loading Meetings</h3>
                    <p style="color: #a7a7a7;">Please try refreshing the page.</p>
                </div>
            `;
        }
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// academy/js/admin.js
// Admin panel with video upload and meeting creation (Vercel Blob)

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Admin Panel JS Loaded - Cloudflare R2");

// Admin email list
const ADMIN_EMAILS = ["kuzeycankal@gmail.com"];

// Check if user is admin
async function checkIfAdmin(user) {
    if (!user) return false;
    if (ADMIN_EMAILS.includes(user.email)) return true;
    
    try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        return adminDoc.exists();
    } catch (err) {
        console.error("Admin check error:", err);
        return false;
    }
}

// Upload file to R2 via the API proxy
async function uploadToR2(file, type) {
    try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `academy/${type}s/${timestamp}_${safeName}`;

        console.log(`📤 Uploading ${type} to R2:`, filename);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', filename);
        formData.append('type', type);

        const response = await fetch('/api/r2-upload', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', response.status, errorText);
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Upload failed');
        
        console.log(`✅ ${type} uploaded to R2:`, data.url);
        return data.url;
    } catch (err) {
        console.error(`❌ ${type} upload error:`, err);
        throw err;
    }
}

// Handle video upload
async function handleVideoUpload(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById("videoUploadMessage");
    const submitBtn = document.querySelector('#videoUploadForm button[type="submit"]');
    
    if (!auth.currentUser) {
        messageEl.textContent = "❌ You must be logged in";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    const isAdmin = await checkIfAdmin(auth.currentUser);
    if (!isAdmin) {
        messageEl.textContent = "❌ Admin access required";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    const title = document.getElementById("videoTitle").value.trim();
    const description = document.getElementById("videoDescription").value.trim();
    const category = document.getElementById("videoCategory").value;
    const videoFile = document.getElementById("videoFile").files[0];
    const thumbnailFile = document.getElementById("thumbnailFile").files[0];
    
    if (!videoFile || !thumbnailFile) {
        messageEl.textContent = "❌ Select both video and thumbnail";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    
    try {
        // Upload thumbnail
        messageEl.textContent = "⏳ Uploading thumbnail...";
        messageEl.style.color = "#10b981";
        const thumbnailURL = await uploadToR2(thumbnailFile, 'thumbnail');
        
        // Upload video
        messageEl.textContent = "⏳ Uploading video...";
        const videoURL = await uploadToR2(videoFile, 'video');
        
        // Save to Firestore
        messageEl.textContent = "⏳ Saving...";
        await addDoc(collection(db, "videos"), {
            title,
            description,
            category,
            videoUrl: videoURL,
            thumbnail: thumbnailURL,
            uploadedBy: auth.currentUser.uid,
            uploaderName: auth.currentUser.displayName || auth.currentUser.email,
            createdAt: serverTimestamp()
        });
        
        messageEl.textContent = "✅ Video uploaded successfully!";
        messageEl.style.color = "#10b981";
        document.getElementById("videoUploadForm").reset();
        
    } catch (err) {
        console.error("Upload error:", err);
        messageEl.textContent = `❌ Upload failed: ${err.message}`;
        messageEl.style.color = "#ef4444";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
    }
}

// Handle meeting creation
async function handleMeetingCreate(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById("meetingCreateMessage");
    const submitBtn = document.querySelector('#meetingCreateForm button[type="submit"]');
    
    if (!auth.currentUser) {
        messageEl.textContent = "❌ You must be logged in";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    const isAdmin = await checkIfAdmin(auth.currentUser);
    if (!isAdmin) {
        messageEl.textContent = "❌ Admin access required";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    const title = document.getElementById("meetingTitle").value.trim();
    const description = document.getElementById("meetingDescription").value.trim();
    const dateTime = document.getElementById("meetingDate").value;
    const joinCode = document.getElementById("meetingCode").value.trim();
    
    if (!title || !dateTime || !joinCode) {
        messageEl.textContent = "❌ Fill in all required fields";
        messageEl.style.color = "#ef4444";
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    
    try {
        await addDoc(collection(db, "meetings"), {
            title,
            description,
            dateTime,
            joinCode,
            createdBy: auth.currentUser.uid,
            creatorName: auth.currentUser.displayName || auth.currentUser.email,
            createdAt: serverTimestamp()
        });
        
        messageEl.textContent = "✅ Meeting created successfully!";
        messageEl.style.color = "#10b981";
        document.getElementById("meetingCreateForm").reset();
        
    } catch (err) {
        console.error("Meeting creation error:", err);
        messageEl.textContent = `❌ Failed: ${err.message}`;
        messageEl.style.color = "#ef4444";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Meeting';
    }
}

// Verify admin and show/hide UI
async function verifyAdmin() {
    const statusEl = document.getElementById("adminStatus");
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (statusEl) {
                statusEl.textContent = "❌ You must be logged in";
                statusEl.style.color = "#ef4444";
            }
            const adminGrid = document.querySelector(".admin-grid");
            if (adminGrid) adminGrid.style.display = "none";
            return;
        }

        const isAdmin = await checkIfAdmin(user);
        
        if (!isAdmin) {
            if (statusEl) {
                statusEl.textContent = "❌ Admin access required";
                statusEl.style.color = "#ef4444";
            }
            const adminGrid = document.querySelector(".admin-grid");
            if (adminGrid) adminGrid.style.display = "none";
            return;
        }

        if (statusEl) {
            statusEl.textContent = `✅ Admin: ${user.displayName || user.email}`;
            statusEl.style.color = "#10b981";
        }
        
        const adminGrid = document.querySelector(".admin-grid");
        if (adminGrid) adminGrid.style.display = "grid";
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.getElementById('videoUploadForm');
    const meetingForm = document.getElementById('meetingCreateForm');
    
    if (videoForm) videoForm.addEventListener('submit', handleVideoUpload);
    if (meetingForm) meetingForm.addEventListener('submit', handleMeetingCreate);
    
    verifyAdmin();
});

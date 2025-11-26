// academy/js/upload.js
// Video upload functionality for admin panel (Vercel compatible)

import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Upload JS Loaded");

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

// Upload file to Vercel Blob Storage via API
async function uploadFileToVercel(file, type) {
    try {
        console.log(`Starting ${type} upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(errorData.error || 'Upload failed');
        }
        
        const data = await response.json();
        console.log(`${type} uploaded successfully:`, data.url);
        return data.url;
        
    } catch (err) {
        console.error(`${type} upload error:`, err);
        throw err;
    }
}

// Save video metadata to Firestore
async function saveVideoToFirestore(videoData) {
    try {
        await addDoc(collection(db, "videos"), {
            title: videoData.title,
            description: videoData.description,
            category: videoData.category,
            videoUrl: videoData.videoUrl,
            thumbnail: videoData.thumbnail,
            uploadedBy: auth.currentUser.uid,
            uploaderName: auth.currentUser.displayName || auth.currentUser.email,
            createdAt: serverTimestamp()
        });
        console.log("Video metadata saved to Firestore");
        return true;
    } catch (err) {
        console.error("Firestore save error:", err);
        throw err;
    }
}

// Handle video upload form
async function handleVideoUpload(e) {
    e.preventDefault();
    
    const messageElement = document.getElementById("videoUploadMessage");
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Check if user is logged in
    if (!auth.currentUser) {
        if (messageElement) {
            messageElement.textContent = "❌ You must be logged in to upload videos.";
            messageElement.style.color = "#ff4444";
        }
        return;
    }
    
    // Check if user is admin
    const isAdmin = await checkIfAdmin(auth.currentUser);
    if (!isAdmin) {
        if (messageElement) {
            messageElement.textContent = "❌ You do not have admin privileges.";
            messageElement.style.color = "#ff4444";
        }
        return;
    }
    
    // Get form data
    const title = document.getElementById("videoTitle").value.trim();
    const description = document.getElementById("videoDescription").value.trim();
    const category = document.getElementById("videoCategory").value;
    const videoFile = document.getElementById("videoFile").files[0];
    const thumbnailFile = document.getElementById("thumbnailFile").files[0];
    
    if (!videoFile || !thumbnailFile) {
        if (messageElement) {
            messageElement.textContent = "❌ Please select both video and thumbnail files.";
            messageElement.style.color = "#ff4444";
        }
        return;
    }
    
    // Disable submit button
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    }
    
    try {
        // Upload thumbnail
        if (messageElement) {
            messageElement.textContent = "⏳ Uploading thumbnail...";
            messageElement.style.color = "#10b981";
        }
        
        const thumbnailURL = await uploadFileToVercel(thumbnailFile, 'thumbnail');
        
        // Upload video
        if (messageElement) {
            messageElement.textContent = "⏳ Uploading video... This may take a while.";
            messageElement.style.color = "#10b981";
        }
        
        const videoURL = await uploadFileToVercel(videoFile, 'video');
        
        // Save to Firestore
        if (messageElement) {
            messageElement.textContent = "⏳ Saving video data...";
            messageElement.style.color = "#10b981";
        }
        
        await saveVideoToFirestore({
            title,
            description,
            category,
            videoUrl: videoURL,
            thumbnail: thumbnailURL
        });
        
        // Success
        if (messageElement) {
            messageElement.textContent = "✅ Video uploaded successfully!";
            messageElement.style.color = "#10b981";
        }
        
        // Reset form
        document.getElementById("videoUploadForm").reset();
        
    } catch (err) {
        console.error("Upload error:", err);
        if (messageElement) {
            messageElement.textContent = `❌ Upload failed: ${err.message}`;
            messageElement.style.color = "#ff4444";
        }
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('videoUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }
});


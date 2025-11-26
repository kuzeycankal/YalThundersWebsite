// academy/js/upload.js
// Video upload functionality for admin panel

import { auth, db, storage } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
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

// Upload file to Firebase Storage
async function uploadFile(file, path, onProgress) {
    try {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (err) {
        console.error("Upload error:", err);
        throw err;
    }
}

// Handle video upload form
async function handleVideoUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageElement = document.getElementById("videoUploadMessage");
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Check if user is logged in
    if (!auth.currentUser) {
        if (messageElement) {
            messageElement.textContent = "❌ You must be logged in to upload videos.";
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
        // Check if user is admin
        const isAdmin = await checkIfAdmin(auth.currentUser);
        
        if (!isAdmin) {
            if (messageElement) {
                messageElement.textContent = "❌ You do not have permission to upload videos.";
                messageElement.style.color = "#ff4444";
            }
            return;
        }
        
        // Upload thumbnail
        if (messageElement) {
            messageElement.textContent = "⏳ Uploading thumbnail...";
            messageElement.style.color = "#ffcc00";
        }
        
        const thumbnailPath = `academy/thumbnails/${Date.now()}_${thumbnailFile.name}`;
        const thumbnailURL = await uploadFile(thumbnailFile, thumbnailPath);
        
        // Upload video
        if (messageElement) {
            messageElement.textContent = "⏳ Uploading video... This may take a while.";
            messageElement.style.color = "#ffcc00";
        }
        
        const videoPath = `academy/videos/${Date.now()}_${videoFile.name}`;
        const videoURL = await uploadFile(videoFile, videoPath, (progress) => {
            if (messageElement) {
                messageElement.textContent = `⏳ Uploading video... ${Math.round(progress)}%`;
            }
        });
        
        // Save to Firestore
        if (messageElement) {
            messageElement.textContent = "⏳ Saving video data...";
            messageElement.style.color = "#ffcc00";
        }
        
        await addDoc(collection(db, "videos"), {
            title: title,
            description: description,
            category: category,
            videoUrl: videoURL,
            thumbnail: thumbnailURL,
            uploadedBy: auth.currentUser.uid,
            uploaderName: auth.currentUser.displayName || auth.currentUser.email,
            createdAt: serverTimestamp()
        });
        
        // Success
        if (messageElement) {
            messageElement.textContent = "✅ Video uploaded successfully!";
            messageElement.style.color = "#44ff44";
        }
        
        // Reset form
        form.reset();
        
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

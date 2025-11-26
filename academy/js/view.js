// academy/js/view.js
// Video viewing page with Firebase integration

import { db } from './firebase.js';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("View Video JS Loaded");

// Get video ID from URL
function getVideoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Fetch a single video by ID
async function fetchVideo(videoId) {
    try {
        const videoDoc = await getDoc(doc(db, "videos", videoId));
        
        if (videoDoc.exists()) {
            return {
                id: videoDoc.id,
                ...videoDoc.data()
            };
        }
        return null;
    } catch (err) {
        console.error("Error fetching video:", err);
        return null;
    }
}

// Fetch related videos
async function fetchRelatedVideos(currentVideoId, category) {
    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        
        const videos = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentVideoId) {
                videos.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });
        
        return videos;
    } catch (err) {
        console.error("Error fetching related videos:", err);
        return [];
    }
}

// Render the main video
function renderVideo(video) {
    const videoPlayer = document.getElementById("videoPlayer");
    const videoSource = document.getElementById("videoSource");
    const videoTitle = document.getElementById("videoTitle");
    const videoCategory = document.getElementById("videoCategory");
    const videoDescription = document.getElementById("videoDescription");

    if (!video) {
        if (videoTitle) videoTitle.textContent = "Video not found";
        if (videoDescription) videoDescription.textContent = "This video does not exist or was removed.";
        if (videoPlayer) videoPlayer.style.display = "none";
        return;
    }

    // Set video source
    if (videoSource && video.videoUrl) {
        videoSource.src = video.videoUrl;
    }
    
    // Set poster
    if (videoPlayer && video.thumbnail) {
        videoPlayer.poster = video.thumbnail;
    }
    
    // Load video
    if (videoPlayer) {
        videoPlayer.load();
    }

    // Set metadata
    if (videoTitle) videoTitle.textContent = video.title || 'Untitled Video';
    if (videoCategory) {
        const categoryIcon = getCategoryIcon(video.category);
        videoCategory.innerHTML = `${categoryIcon} ${video.category || 'Uncategorized'}`;
    }
    if (videoDescription) videoDescription.textContent = video.description || 'No description available.';
}

// Render related videos
function renderRelatedVideos(videos) {
    const container = document.getElementById("relatedVideos");
    
    if (!container) return;
    
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: #a7a7a7;">No related videos</p>';
        return;
    }
    
    container.innerHTML = '';
    
    videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'related-video-item';
        
        const thumbnail = video.thumbnail || '/yal_thunders_logo.png';
        const title = video.title || 'Untitled Video';
        
        item.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <div class="related-video-info">
                <h4>${title}</h4>
                <span>${video.category || 'Uncategorized'}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            window.location.href = `/academy/video.html?id=${video.id}`;
        });
        
        container.appendChild(item);
    });
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'software': '<i class="fa-solid fa-code"></i>',
        'design': '<i class="fa-solid fa-pencil-ruler"></i>',
        'robotics': '<i class="fa-solid fa-robot"></i>',
        'cad': '<i class="fa-solid fa-cube"></i>'
    };
    return icons[(category || '').toLowerCase()] || '<i class="fa-solid fa-video"></i>';
}

// Initialize page
async function init() {
    const videoId = getVideoId();
    
    if (!videoId) {
        renderVideo(null);
        return;
    }

    try {
        // Fetch the video
        const video = await fetchVideo(videoId);
        renderVideo(video);
        
        // Fetch related videos
        if (video) {
            const relatedVideos = await fetchRelatedVideos(videoId, video.category);
            renderRelatedVideos(relatedVideos);
        }
    } catch (err) {
        console.error("Error initializing video page:", err);
        renderVideo(null);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

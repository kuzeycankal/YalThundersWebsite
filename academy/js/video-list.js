// academy/js/video-list.js
// Handles video listing, filtering, and search on the academy main page

import { db } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Academy Video List JS Loaded");

let allVideos = [];

// Fetch videos from Firestore
async function fetchVideos() {
    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const videos = [];
        snapshot.forEach(doc => {
            videos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return videos;
    } catch (err) {
        console.error("Error fetching videos:", err);
        return [];
    }
}

// Render videos to the grid
function renderVideos(videos) {
    const grid = document.getElementById("videoGrid");
    const emptyState = document.getElementById("videoEmptyState");
    const countBadge = document.getElementById("videoCount");
    
    if (!grid) return;
    
    // Update count
    if (countBadge) {
        countBadge.textContent = `${videos.length} video${videos.length !== 1 ? 's' : ''}`;
    }
    
    // Clear grid
    grid.innerHTML = "";
    
    // Show empty state if no videos
    if (videos.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        grid.style.display = "none";
        return;
    }
    
    // Hide empty state
    if (emptyState) emptyState.style.display = "none";
    grid.style.display = "grid";
    
    // Render each video card
    videos.forEach(video => {
        const card = document.createElement("div");
        card.className = "academy-video-card";
        
        const thumbnail = video.thumbnail || '/yal_thunders_logo.png';
        const title = video.title || 'Untitled Video';
        const category = video.category || 'uncategorized';
        const description = video.description || '';
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${title}">
                <div class="video-duration">${video.duration || ''}</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${title}</h3>
                <p class="video-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
                <span class="video-category">${getCategoryIcon(category)} ${category}</span>
            </div>
        `;
        
        // Click handler to view video
        card.addEventListener("click", () => {
            window.location.href = `/academy/video.html?id=${video.id}`;
        });
        
        grid.appendChild(card);
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
    return icons[category.toLowerCase()] || '<i class="fa-solid fa-video"></i>';
}

// Setup category filters
function setupFilters(videos) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!filterButtons.length) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter videos
            const category = btn.dataset.category;
            if (category === 'all') {
                renderVideos(videos);
            } else {
                const filtered = videos.filter(v => 
                    v.category && v.category.toLowerCase() === category.toLowerCase()
                );
                renderVideos(filtered);
            }
        });
    });
}

// Setup search
function setupSearch(videos) {
    const searchInput = document.getElementById('videoSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search is empty, check which filter is active
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.dataset.category : 'all';
            
            if (category === 'all') {
                renderVideos(videos);
            } else {
                const filtered = videos.filter(v => 
                    v.category && v.category.toLowerCase() === category.toLowerCase()
                );
                renderVideos(filtered);
            }
        } else {
            // Filter by search term
            const filtered = videos.filter(v => {
                const title = (v.title || '').toLowerCase();
                const description = (v.description || '').toLowerCase();
                const category = (v.category || '').toLowerCase();
                
                return title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       category.includes(searchTerm);
            });
            renderVideos(filtered);
        }
    });
}

// Initialize the page
async function init() {
    try {
        // Fetch all videos
        allVideos = await fetchVideos();
        
        // Initial render
        renderVideos(allVideos);
        
        // Setup filters and search
        setupFilters(allVideos);
        setupSearch(allVideos);
        
    } catch (err) {
        console.error("Error initializing academy page:", err);
        
        const grid = document.getElementById("videoGrid");
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #ffcc00; margin-bottom: 20px;"></i>
                    <h3>Error Loading Videos</h3>
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


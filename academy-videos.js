import { db, auth } from "./firebase-init.js";
import { 
    collection, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getCurrentUserProfile, onUserStateReady } from "./auth-firebase.js";

/* DOM elements */
const videoGrid = document.getElementById("videoGrid");
const videoGridEmpty = document.getElementById("videoGridEmpty");
const searchInput = document.getElementById("videoSearchInput");
const adminLink = document.getElementById("academyAdminLink");

/* FILTER STATE */
let allVideos = [];
let filteredVideos = [];
let selectedCategory = "all";

/* ================
   LOAD VIDEOS
================ */
async function loadVideos() {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    allVideos = [];
    snap.forEach(doc => {
        allVideos.push({
            id: doc.id,
            ...doc.data()
        });
    });

    filteredVideos = allVideos;
    renderVideos();
}

/* ================
   RENDER VIDEO GRID
================ */
function renderVideos() {
    videoGrid.innerHTML = "";

    const list = filteredVideos;

    if (list.length === 0) {
        videoGridEmpty.style.display = "block";
        return;
    }

    videoGridEmpty.style.display = "none";

    list.forEach(v => {
        const card = document.createElement("a");
        card.className = "video-card";
        card.href = `/video.html?id=${v.id}`;

        const thumb = v.thumbnailUrl || "/assets/default-thumb.png";

        card.innerHTML = `
            <img src="${thumb}">
            <div class="video-card-info">
                <h3>${v.title}</h3>
                <p>${v.description?.substring(0, 90) || ""}...</p>
            </div>
        `;

        videoGrid.appendChild(card);
    });
}

/* ================
   FILTER BY CATEGORY
================ */
function filterVideos() {
    filteredVideos = allVideos.filter(v => {
        if (selectedCategory === "all") return true;
        return v.category === selectedCategory;
    });

    renderVideos();
}

/* ================
   SEARCH FUNCTION
================ */
function applySearch() {
    const value = searchInput.value.toLowerCase();

    filteredVideos = allVideos.filter(v =>
        v.title.toLowerCase().includes(value) ||
        v.description?.toLowerCase().includes(value)
    );

    renderVideos();
}

/* EVENT LISTENERS */
document.querySelectorAll(".academy-nav-item").forEach(btn => {
    if (!btn.hasAttribute("data-category")) return;

    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".academy-nav-item")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        selectedCategory = btn.getAttribute("data-category");
        filterVideos();
    });
});

searchInput?.addEventListener("input", applySearch);

/* ================
   CHECK ADMIN LINK
================ */
onUserStateReady(() => {
    const profile = getCurrentUserProfile();
    if (profile?.isAdmin) {
        adminLink.style.display = "block";
    } else {
        adminLink.style.display = "none";
    }
});

/* INITIAL LOAD */
loadVideos();

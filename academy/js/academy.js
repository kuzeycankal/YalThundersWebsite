// academy/js/academy.js

console.log("Academy Videos JS Loaded");

// API’den video listesi çek
async function fetchVideos() {
    try {
        const res = await fetch("/api/list-videos");
        return await res.json();
    } catch (err) {
        console.error("Video fetch error:", err);
        return [];
    }
}

function renderVideos(videos) {
    const list = document.getElementById("videoList");
    list.innerHTML = "";

    videos.forEach(v => {
        const card = document.createElement("div");
        card.className = "video-card";

        card.innerHTML = `
            <img src="${v.thumbnail}" alt="${v.title}">
            <div class="info">
                <div class="title">${v.title}</div>
                <div class="cat">${v.category}</div>
            </div>
        `;

        card.addEventListener("click", () => {
            window.location.href = `/academy/view.html?id=${v.id}`;
        });

        list.appendChild(card);
    });
}

// Filtre sistemi
function setupFilter(videos) {
    const buttons = document.querySelectorAll(".video-filter button");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            if (filter === "all") {
                renderVideos(videos);
            } else {
                const filtered = videos.filter(v => v.category === filter);
                renderVideos(filtered);
            }
        });
    });
}

(async () => {
    const videos = await fetchVideos();
    renderVideos(videos);
    setupFilter(videos);
})();

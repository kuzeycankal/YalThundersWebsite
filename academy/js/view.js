// academy/js/view.js
// Video izleme sayfası

console.log("View Video JS Loaded");

// URL'den video id çek
function getVideoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// API'den video listesi çek
async function fetchVideos() {
    try {
        const res = await fetch("/api/list-videos");
        return await res.json();
    } catch (err) {
        console.error("Video fetch error:", err);
        return [];
    }
}

// Sayfayı video ile doldur
function renderVideo(video) {
    const container = document.getElementById("videoContainer");

    if (!video) {
        container.innerHTML = `
            <h2>Video not found</h2>
            <p>This video does not exist or was removed.</p>
        `;
        return;
    }

    container.innerHTML = `
        <video controls src="${video.video}" poster="${video.thumbnail}"></video>

        <h1>${video.title}</h1>

        <div class="video-description">
            ${video.description || ""}
        </div>

        <div class="video-category">
            <strong>Category:</strong> ${video.category}
        </div>
    `;
}

// Çalıştır
(async () => {
    const id = getVideoId();
    if (!id) {
        renderVideo(null);
        return;
    }

    const videos = await fetchVideos();
    const video = videos.find(v => v.id === id);

    renderVideo(video);
})();

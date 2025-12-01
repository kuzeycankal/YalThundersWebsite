// academy/js/upload.js

// Helper: file -> base64 (payload için)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(",")[1]; // "data:...;base64,XXXX" kısmından sadece XXXX
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("videoUploadForm");
    const msgEl = document.getElementById("videoUploadMessage");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msgEl.textContent = "Uploading...";
        
        const title = document.getElementById("videoTitle").value.trim();
        const description = document.getElementById("videoDescription").value.trim();
        const category = document.getElementById("videoCategory").value;
        const videoFile = document.getElementById("videoFile").files[0];
        const thumbFile = document.getElementById("thumbnailFile").files[0];

        if (!videoFile || !thumbFile) {
            msgEl.textContent = "Please select both a video and a thumbnail.";
            return;
        }

        try {
            // 1) Dosyaları base64'e çevir
            const [videoBase64, thumbnailBase64] = await Promise.all([
                fileToBase64(videoFile),
                fileToBase64(thumbFile)
            ]);

            // 2) Videoyu Blob'a yükle
            const videoRes = await fetch("/api/upload-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoBase64
                })
            });

            const videoJson = await videoRes.json();
            if (!videoRes.ok || !videoJson.videoUrl) {
                console.error("Video upload error:", videoJson);
                msgEl.textContent = "Video upload failed.";
                return;
            }

            const videoUrl = videoJson.videoUrl;

            // 3) Thumbnail'i Blob'a yükle
            const thumbRes = await fetch("/api/upload-thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    thumbnailBase64
                })
            });

            const thumbJson = await thumbRes.json();
            if (!thumbRes.ok || !thumbJson.thumbnailUrl) {
                console.error("Thumbnail upload error:", thumbJson);
                msgEl.textContent = "Thumbnail upload failed.";
                return;
            }

            const thumbnailUrl = thumbJson.thumbnailUrl;

            // 4) Metadata'yı Firestore'a kaydet
            const saveRes = await fetch("/api/save-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    videoUrl,
                    thumbnailUrl
                })
            });

            const saveJson = await saveRes.json();
            if (!saveRes.ok) {
                console.error("Save video error:", saveJson);
                msgEl.textContent = "Failed to save video data.";
                return;
            }

            msgEl.textContent = "Video successfully uploaded!";
            form.reset();

        } catch (err) {
            console.error(err);
            msgEl.textContent = "Unexpected error occurred.";
        }
    });
});

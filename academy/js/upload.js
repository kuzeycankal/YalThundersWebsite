// academy/js/upload.js
// Video upload sistemi

// Helper: file -> base64 (payload için)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(",")[1]; // "data:...;base64,XXXX" kısmından sadece XXXX
            resolve(base64);
        };
        check();
    });
}

// ADMIN KONTROL
async function verifyAdmin() {
    await waitForFirebase();

    firebase.auth().onAuthStateChanged(user => {
        const msg = document.getElementById("uploadMsg");

        if (!user) {
            msg.innerHTML = "You must be logged in.";
            msg.style.color = "red";
            return;
        }

        if (!ADMINS.includes(user.email)) {
            msg.innerHTML = "You are not an admin.";
            msg.style.color = "red";
            return;
        }

        console.log("Admin verified:", user.email);
    });
}

// FORM ELEMENTLERİ
const form = document.getElementById("videoUploadForm");
const msg = document.getElementById("uploadMsg");

async function uploadFileToBlob(file, fileType) {
    try {
        const res = await fetch(`/api/upload-${fileType}`, {
            method: "POST",
            body: file
        });

        const data = await res.json();
        return data.url; // Blob URL
    } catch (err) {
        console.error("Blob upload error:", err);
        return null;
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.innerHTML = "Uploading...";
    msg.style.color = "yellow";

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;

    const videoFile = document.getElementById("videoFile").files[0];
    const thumbnailFile = document.getElementById("thumbnailFile").files[0];

    if (!videoFile || !thumbnailFile) {
        msg.innerHTML = "Select both video and thumbnail.";
        msg.style.color = "red";
        return;
    }

    // 🔥 VİDEO YÜKLE
    const videoURL = await uploadFileToBlob(videoFile, "video");
    if (!videoURL) {
        msg.innerHTML = "Video upload failed.";
        msg.style.color = "red";
        return;
    }

    // 🔥 THUMBNAIL YÜKLE
    const thumbnailURL = await uploadFileToBlob(thumbnailFile, "thumbnail");
    if (!thumbnailURL) {
        msg.innerHTML = "Thumbnail upload failed.";
        msg.style.color = "red";
        return;
    }

    // 🔥 VERİTABANINA KAYIT GÖNDER
    const res = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            description,
            category,
            video: videoURL,
            thumbnail: thumbnailURL
        })
    });

    const data = await res.json();

    if (data.success) {
        msg.innerHTML = "Video uploaded successfully!";
        msg.style.color = "lime";

        form.reset();
    } else {
        msg.innerHTML = "Database error.";
        msg.style.color = "red";
    }
});
verifyAdmin();


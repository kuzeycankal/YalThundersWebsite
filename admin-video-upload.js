// INIT FIREBASE
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ===============================
      VERIFY ADMIN
=============================== */
function verifyAdmin() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                alert("You must be logged in.");
                window.location.href = "/login.html";
                return;
            }

            const snap = await db.collection("users").doc(user.uid).get();

            if (!snap.exists || !snap.data().isAdmin) {
                alert("You are not an admin.");
                window.location.href = "/index.html";
                return;
            }

            resolve(user);
        });
    });
}

/* ===============================
      BLOB UPLOAD
=============================== */
async function uploadToBlob(file) {
    const uploadUrl = `/api/upload-file?filename=${encodeURIComponent(Date.now() + "-" + file.name)}`;

    const response = await fetch(uploadUrl, {
        method: "POST",
        body: file
    });

    const data = await response.json();

    if (!data.url) {
        throw new Error("Blob upload failed");
    }

    return data.url;
}

/* ===============================
      MAIN LOGIC
=============================== */
document.addEventListener("DOMContentLoaded", async () => {

    const user = await verifyAdmin();  // Admin kontrolü

    const form = document.getElementById("videoUploadForm");
    const statusMsg = document.getElementById("videoUploadMsg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("videoTitle").value.trim();
        const description = document.getElementById("videoDescription").value.trim();
        const category = document.getElementById("videoCategory").value;

        const videoFile = document.getElementById("videoFile").files[0];
        const thumbFile = document.getElementById("thumbFile").files[0];

        if (!videoFile || !thumbFile) {
            statusMsg.innerText = "Please select both a video and a thumbnail.";
            statusMsg.style.color = "red";
            return;
        }

        statusMsg.innerText = "Uploading files...";
        statusMsg.style.color = "black";

        try {
            // UPLOAD TO BLOB STORAGE
            const videoUrl = await uploadToBlob(videoFile);
            const thumbnailUrl = await uploadToBlob(thumbFile);

            statusMsg.innerText = "Saving to Firestore...";

            // SAVE METADATA TO FIRESTORE
            await db.collection("videos").add({
                title,
                description,
                category,
                videoUrl,
                thumbnailUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: user.uid
            });

            statusMsg.innerText = "Upload successful!";
            statusMsg.style.color = "green";

            form.reset();

        } catch (err) {
            console.error(err);
            statusMsg.innerText = "Error: " + err.message;
            statusMsg.style.color = "red";
        }
    });
});

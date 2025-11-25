import { auth, db } from "./firebase-init.js";
import {
    doc, getDoc,
    collection, addDoc,
    query, where, orderBy, getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCurrentUserProfile, isLoggedIn } from "./auth-firebase.js";


// -------------------------
// GET VIDEO ID FROM URL
// -------------------------
function getVideoId() {
    return new URLSearchParams(window.location.search).get("id");
}


// -------------------------
// LOAD VIDEO DATA
// -------------------------
async function loadVideo() {
    const videoId = getVideoId();
    if (!videoId) return;

    const snap = await getDoc(doc(db, "videos", videoId));
    if (!snap.exists()) {
        document.getElementById("videoTitle").innerText = "Video not found.";
        return;
    }

    const v = snap.data();

    // SET VIDEO PLAYER
    document.getElementById("videoSource").src = v.videoUrl;
    document.getElementById("academyVideoPlayer").load();

    // SET INFO
    document.getElementById("videoTitle").innerText = v.title;
    document.getElementById("videoDescription").innerText = v.description || "";

    document.getElementById("videoCategory").innerText = v.category || "General";

    if (v.createdAt)
        document.getElementById("videoDate").innerText =
            new Date(v.createdAt.toDate()).toLocaleDateString();
    else
        document.getElementById("videoDate").innerText = "";

    // LOAD COMMENTS
    loadComments(videoId);

    // RENDER COMMENT INPUT
    renderCommentBox(videoId);
}


// -------------------------
// LOAD COMMENTS
// -------------------------
async function loadComments(videoId) {
    const list = document.getElementById("commentList");
    list.innerHTML = "Loading comments...";

    const q = query(
        collection(db, "comments"),
        where("videoId", "==", videoId),
        orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
        list.innerHTML = "<p>No comments yet.</p>";
        return;
    }

    list.innerHTML = "";

    snap.forEach((d) => {
        const c = d.data();
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `
            <strong>${c.userName || "User"}</strong>
            <p>${c.text}</p>
        `;
        list.appendChild(div);
    });
}


// -------------------------
// RENDER COMMENT INPUT
// -------------------------
function renderCommentBox(videoId) {
    const wrapper = document.getElementById("commentInputWrapper");

    if (!isLoggedIn()) {
        wrapper.innerHTML = `<p><a href="/login.html">Login to comment.</a></p>`;
        return;
    }

    wrapper.innerHTML = `
        <textarea id="commentText" placeholder="Write a comment..."></textarea>
        <button id="sendCommentBtn">Send</button>
    `;

    document.getElementById("sendCommentBtn").onclick = async () => {
        const text = document.getElementById("commentText").value.trim();
        if (!text) return;

        const user = auth.currentUser;
        const profile = getCurrentUserProfile();

        await addDoc(collection(db, "comments"), {
            videoId,
            userId: user.uid,
            userName: profile?.name || "User",
            text,
            createdAt: serverTimestamp()
        });

        document.getElementById("commentText").value = "";
        loadComments(videoId);
    };
}


// -------------------------
// START
// -------------------------
loadVideo();

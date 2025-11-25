// academy/js/meetings.js
// Meetings Page – Create + List Meetings

console.log("Meetings JS Loaded");

const ADMINS = ["kuzeycankal@gmail.com"];

// Firebase hazır olana kadar bekle
function waitForFirebase() {
    return new Promise(resolve => {
        const check = () => {
            if (window.firebase && firebase.auth) resolve();
            else setTimeout(check, 50);
        };
        check();
    });
}

// ADMIN KONTROL
async function verifyAdminAccess() {
    await waitForFirebase();

    firebase.auth().onAuthStateChanged(user => {
        const msg = document.getElementById("meetingMsg");
        const form = document.getElementById("meetingForm");

        if (!user) {
            msg.innerHTML = "You must be logged in to create a meeting.";
            msg.style.color = "red";
            form.style.display = "none";
            return;
        }

        if (!ADMINS.includes(user.email)) {
            msg.innerHTML = "You are not an admin.";
            msg.style.color = "red";
            form.style.display = "none";
            return;
        }

        // Admin ise
        msg.innerHTML = "";
        form.style.display = "flex";
    });
}

// API'den toplantıları çek
async function fetchMeetings() {
    try {
        const res = await fetch("/api/list-meetings");
        return await res.json();
    } catch (err) {
        console.error("Meeting fetch error:", err);
        return [];
    }
}

// Toplantıları listele
function renderMeetings(meetings) {
    const list = document.getElementById("meetingList");
    list.innerHTML = "";

    meetings.forEach(m => {
        const div = document.createElement("div");
        div.className = "meeting-card";

        const dateText = new Date(m.date).toLocaleString();

        div.innerHTML = `
            <h3>${m.title}</h3>
            <small>${dateText}</small>
            <p>${m.description}</p>

            <div>
                <strong>Join Code:</strong> ${m.joinCode}
            </div>

            <button class="btn delete-btn" data-id="${m.id}">Delete</button>
        `;

        // Silme
        div.querySelector(".delete-btn").addEventListener("click", async () => {
            if (!confirm("Delete this meeting?")) return;

            const res = await fetch("/api/delete-meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: m.id })
            });

            const data = await res.json();

            if (data.success) {
                alert("Meeting deleted!");
                loadMeetings();
            } else {
                alert("Delete failed.");
            }
        });

        list.appendChild(div);
    });
}

// Yeni toplantı oluşturma
const form = document.getElementById("meetingForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = document.getElementById("meetingMsg");

    const title = document.getElementById("meetingTitle").value.trim();
    const description = document.getElementById("meetingDescription").value.trim();
    const date = document.getElementById("meetingDate").value;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (!title || !date) {
        msg.innerHTML = "Please enter all required fields.";
        msg.style.color = "red";
        return;
    }

    msg.innerHTML = "Creating...";
    msg.style.color = "yellow";

    const res = await fetch("/api/create-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, joinCode })
    });

    const data = await res.json();

    if (data.success) {
        msg.innerHTML = "Meeting created successfully!";
        msg.style.color = "lime";
        form.reset();
        loadMeetings();
    } else {
        msg.innerHTML = "Failed to create meeting.";
        msg.style.color = "red";
    }
});

// Meetings yükle
async function loadMeetings() {
    const meetings = await fetchMeetings();
    renderMeetings(meetings);
}

verifyAdminAccess();
loadMeetings();

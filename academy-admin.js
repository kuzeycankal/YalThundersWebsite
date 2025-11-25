// FIREBASE INIT
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/*
    ADMIN PAGE CONTROLLER
    - checks admin
    - unlocks admin panel
    - handles meeting creation
*/

document.addEventListener("DOMContentLoaded", () => {
    checkAdmin();
});

/* ===========================
      CHECK ADMIN STATUS
=========================== */
async function checkAdmin() {
    const adminLock = document.getElementById("adminLock");
    const adminContent = document.getElementById("adminContent");

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            adminLock.innerText = "You must be logged in.";
            window.location.href = "/login.html";
            return;
        }

        const snap = await db.collection("users").doc(user.uid).get();

        if (!snap.exists || !snap.data().isAdmin) {
            adminLock.innerText = "You are not an admin.";
            window.location.href = "/index.html";
            return;
        }

        adminLock.style.display = "none";
        adminContent.style.display = "block";
    });
}

/* ===========================
        MEETING CREATION
=========================== */
const meetingForm = document.getElementById("meetingForm");

meetingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("meetingTitle").value;
    const description = document.getElementById("meetingDescription").value;
    const dateTime = document.getElementById("meetingDateTime").value;
    const joinCode = document.getElementById("meetingJoinCode").value;

    if (!title || !dateTime || !joinCode) {
        alert("Please fill all fields");
        return;
    }

    const meetingData = {
        title,
        description,
        dateTime,
        joinCode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("meetings").add(meetingData);

        document.getElementById("meetingMsg").innerText = "Meeting created successfully!";
        meetingForm.reset();

    } catch (err) {
        console.error(err);
        document.getElementById("meetingMsg").innerText = "Error creating meeting.";
    }
});

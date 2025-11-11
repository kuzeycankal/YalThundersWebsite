// event-manager-firebase.js
import { db } from "./firebase-init.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    increment, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore Data Paths:
// /users/{userId} -> User profile (name, admin, event counts)
// /events/{eventId}/registrations/{userId} -> User's registration for an event (role, team, checkin status)
// /perks/{perkId} -> Single-use vouchers (meal, etc.)

export async function registerForEvent(eventId, user, profile, extraData) {
    if (!user) return { success: false, message: 'You must be logged in.' };
    
    const regRef = doc(db, "events", eventId, "registrations", user.uid);
    
    const docSnap = await getDoc(regRef);
    if (docSnap.exists()) {
        return { success: false, message: 'You are already registered for this event.' };
    }

    const registrationData = {
        userId: user.uid,
        userName: profile.name, // Get name from main profile
        userEmail: user.email,
        role: extraData.role,
        teamNumber: extraData.teamNumber,
        registeredAt: new Date().toISOString(),
        checkedIn: false,
        checkInTime: null,
        registrationId: `${eventId}-${user.uid}-${Date.now()}`
    };

    try {
        await setDoc(regRef, registrationData);
        
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            registeredEvents: increment(1)
        });
        
        return { 
            success: true, 
            message: 'Registration successful!',
            registration: registrationData
        };
    } catch (error) {
        console.error("Firestore registration error: ", error);
        return { success: false, message: 'Database registration failed: ' + error.message };
    }
}

export async function getUserRegistration(eventId, userId) {
    if (!userId) return null;
    const regRef = doc(db, "events", eventId, "registrations", userId);
    const docSnap = await getDoc(regRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function isUserRegistered(eventId, userId) {
    if (!userId) return false;
    const regRef = doc(db, "events", eventId, "registrations", userId);
    const docSnap = await getDoc(regRef);
    return docSnap.exists();
}

export async function checkInUser(qrDataString) {
    let qrData;
    try {
        qrData = JSON.parse(qrDataString);
        if (!qrData.eventId || !qrData.userId || !qrData.registrationId) {
             return { success: false, message: 'Invalid QR Code (Missing Data)' };
        }
    } catch (e) {
        return { success: false, message: 'Invalid QR Code (JSON Error)' };
    }

    const { eventId, userId } = qrData;
    const regRef = doc(db, "events", eventId, "registrations", userId);

    try {
        const docSnap = await getDoc(regRef);
        if (!docSnap.exists()) {
            return { success: false, message: 'Registration not found' };
        }
        const registration = docSnap.data();
        
        if (registration.checkedIn) {
            return { 
                success: false, 
                message: 'Already checked in',
                registration: registration
            };
        }

        await updateDoc(regRef, {
            checkedIn: true,
            checkInTime: new Date().toISOString()
        });
        
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            attendedEvents: increment(1)
        });
        
        const updatedRegistration = { ...registration, checkedIn: true };
        return {
            success: true,
            message: 'Check-in successful!',
            registration: updatedRegistration
        };

    } catch (error) {
        console.error("Check-in error: ", error);
        return { success: false, message: 'Database error: ' + error.message };
    }
}

export async function generatePerkQRCode(eventId, user, profile, perkType) {
    if (!user) return { success: false, message: "User not found." };

    const perkId = `${eventId}_${user.uid}_${perkType}`;
    const perkRef = doc(db, "perks", perkId);

    try {
        const docSnap = await getDoc(perkRef);
        
        if (docSnap.exists()) {
            console.log("Existing perk found:", perkId);
            const existingPerk = docSnap.data();
            return { 
                success: true, 
                qrData: JSON.stringify(existingPerk), 
                used: existingPerk.used 
            };
        }

        const newPerk = {
            perkId: perkId,
            eventId: eventId,
            userId: user.uid,
            userName: profile.name, // Get name from profile
            perkType: perkType,
            used: false,
            redeemedAt: null,
            createdAt: new Date().toISOString()
        };

        await setDoc(perkRef, newPerk);
        console.log("New perk created:", perkId);
        
        return { 
            success: true, 
            qrData: JSON.stringify(newPerk), 
            used: false 
        };

    } catch (error) {
        console.error("Perk generation error: ", error);
        return { success: false, message: "Could not generate perk: " + error.message };
    }
}

export async function redeemPerk(qrDataString) {
    let perkData;
    try {
        perkData = JSON.parse(qrDataString);
        if (!perkData.perkId || !perkData.userId) {
             return { success: false, message: 'Invalid Perk Code (Missing Data)' };
        }
    } catch (e) {
        return { success: false, message: 'Invalid Perk Code (JSON Error)' };
    }

    const perkRef = doc(db, "perks", perkData.perkId);

    try {
        const docSnap = await getDoc(perkRef);
        if (!docSnap.exists()) {
            return { success: false, message: 'Perk not found' };
        }
        const perk = docSnap.data();
        if (perk.used) {
            return { 
                success: false, 
                message: 'This perk has already been used!',
                perk: perk
            };
        }
        await updateDoc(perkRef, {
            used: true,
            redeemedAt: new Date().toISOString()
        });
        const updatedPerk = { ...perk, used: true };
        return { 
            success: true, 
            message: 'Perk redeemed successfully!',
            perk: updatedPerk
        };
    } catch (error) {
        console.error("Perk redemption error: ", error);
        return { success: false, message: "Database error: " + error.message };
    }
}

export async function getAllRegistrations(eventId) {
    try {
        const registrationsRef = collection(db, "events", eventId, "registrations");
        const querySnapshot = await getDocs(registrationsRef);
        const registrations = [];
        querySnapshot.forEach((doc) => registrations.push(doc.data()));
        return registrations;
    } catch (error) {
        console.error("Failed to fetch all registrations: ", error);
        return [];
    }
}
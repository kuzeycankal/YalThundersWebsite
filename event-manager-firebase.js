// event-manager-firebase.js
// Imports functions from Firebase CDN and our local 'firebase-init.js'
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

// --- Firestore Data Paths ---
// /users/{userId} -> User profile (name, admin, event counts)
// /events/{eventId}/registrations/{userId} -> User's registration for an event (role, team, checkin status)
// /perks/{perkId} -> Single-use vouchers (meal, etc.)

/**
 * Registers a user for a specific event in Firestore.
 */
export async function registerForEvent(eventId, user, profile, extraData) {
    if (!user || !profile) {
        return { success: false, message: 'You must be logged in to register.' };
    }
    
    // Create a reference to where the registration will be stored
    const regRef = doc(db, "events", eventId, "registrations", user.uid);
    
    const docSnap = await getDoc(regRef);
    if (docSnap.exists()) {
        return { success: false, message: 'You are already registered for this event.' };
    }

    // Prepare the data to be saved
    const registrationData = {
        userId: user.uid,
        userName: profile.name, // Get name from the main user profile
        userEmail: user.email,
        role: extraData.role,
        teamNumber: extraData.teamNumber,
        registeredAt: new Date().toISOString(),
        checkedIn: false,
        checkInTime: null,
        registrationId: `${eventId}-${user.uid}-${Date.now()}` // Unique ID for the QR code
    };

    try {
        // Save the registration document
        await setDoc(regRef, registrationData);
        
        // Also update the main user profile to increment their registered event count
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

/**
 * Fetches a user's specific registration document for an event.
 */
export async function getUserRegistration(eventId, userId) {
    if (!userId) return null;
    const regRef = doc(db, "events", eventId, "registrations", userId);
    const docSnap = await getDoc(regRef);
    return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Checks if a user is registered for an event (quicker than fetching the whole doc).
 */
export async function isUserRegistered(eventId, userId) {
    if (!userId) return false;
    const regRef = doc(db, "events", eventId, "registrations", userId);
    const docSnap = await getDoc(regRef);
    return docSnap.exists();
}

/**
 * Checks in a user by validating their QR code data and updating Firestore.
 */
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
        
        // Check if already checked in
        if (registration.checkedIn) {
            return { 
                success: false, 
                message: 'Already checked in',
                registration: registration // Still return data for the badge
            };
        }

        // --- Mark as checked in ---
        await updateDoc(regRef, {
            checkedIn: true,
            checkInTime: new Date().toISOString()
        });
        
        // --- Increment the user's main profile 'attendedEvents' counter ---
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            attendedEvents: increment(1)
        });
        
        // Return the newly updated registration data
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

/**
 * Generates or retrieves a single-use perk (like a meal voucher).
 */
export async function generatePerkQRCode(eventId, user, profile, perkType) {
    if (!user || !profile) return { success: false, message: "User or profile not found." };

    // Create a unique ID for this specific perk (e.g., kickoff-2026_USERID_meal)
    const perkId = `${eventId}_${user.uid}_${perkType}`;
    const perkRef = doc(db, "perks", perkId); // All perks are stored in one collection

    try {
        const docSnap = await getDoc(perkRef);
        
        // If perk voucher already exists, just return it
        if (docSnap.exists()) {
            console.log("Existing perk found:", perkId);
            const existingPerk = docSnap.data();
            return { 
                success: true, 
                qrData: JSON.stringify(existingPerk), // Return the existing QR data
                used: existingPerk.used 
            };
        }

        // Perk doesn't exist, create a new one
        const newPerk = {
            perkId: perkId,
            eventId: eventId,
            userId: user.uid,
            userName: profile.name, // Get name from profile
            perkType: perkType, // e.g., 'meal'
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

/**
 * Redeems (uses) a single-use perk QR code.
 */
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
                perk: perk // Still return data to show who used it
            };
        }

        // Mark as used
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

/**
 * [Admin] Fetches all registrations for a specific event.
 */
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
/**
 * YAL Thunders Event Management System
 * Handles event registration, QR generation, check-in, and admin functions
 */

// Storage Keys
const EVENTS_KEY = 'yal_events';
const EVENT_REGISTRATIONS_KEY = 'yal_event_registrations';
const EVENT_CHECKINS_KEY = 'yal_event_checkins';
const ADMIN_CODE = 'YALTHUNDERS2026'; // Admin registration code

// Event structure
const EVENTS_DATA = {
    'kickoff-2026': {
        id: 'kickoff-2026',
        name: 'FRC 2026 Kick-Off Event',
        nameTR: '2026 FRC Kick-Off Etkinliği',
        date: '2026-01-10T00:00:00+03:00',
        location: 'YAL Thunders Workshop',
        locationTR: 'YAL Thunders Atölyesi',
        description: 'Join us for the official FRC 2026 season kick-off! Meet the team, see the new game, and participate in exciting activities.',
        descriptionTR: 'FRC 2026 sezonunun resmi açılışı için bize katılın! Takımla tanışın, yeni oyunu görün ve heyecan verici etkinliklere katılın.',
        maxCapacity: 100,
        registrationOpen: true,
        image: '/kickoff_event.jpg'
    }
};

// Initialize events data
function initializeEvents() {
    const events = localStorage.getItem(EVENTS_KEY);
    if (!events) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(EVENTS_DATA));
    }
}

// Get all events
function getAllEvents() {
    const events = localStorage.getItem(EVENTS_KEY);
    return events ? JSON.parse(events) : EVENTS_DATA;
}

// Get event by ID
function getEventById(eventId) {
    const events = getAllEvents();
    return events[eventId] || null;
}

// Get all registrations
function getAllRegistrations() {
    const registrations = localStorage.getItem(EVENT_REGISTRATIONS_KEY);
    return registrations ? JSON.parse(registrations) : {};
}

// Get registrations for specific event
function getEventRegistrations(eventId) {
    const allRegistrations = getAllRegistrations();
    return allRegistrations[eventId] || [];
}

// Check if user is registered for event
function isUserRegistered(eventId, userId) {
    const registrations = getEventRegistrations(eventId);
    return registrations.some(reg => reg.userId === userId);
}

// Register user for event
// GÜNCELLENDİ: 'extraData' parametresi eklendi
function registerForEvent(eventId, user, extraData) {
    const event = getEventById(eventId);
    if (!event) {
        return { success: false, message: 'Event not found' };
    }

    if (!event.registrationOpen) {
        return { success: false, message: 'Registration is closed' };
    }

    const registrations = getEventRegistrations(eventId);
    
    if (registrations.length >= event.maxCapacity) {
        return { success: false, message: 'Event is full' };
    }

    if (isUserRegistered(eventId, user.id)) {
        return { success: false, message: 'Already registered' };
    }

    // Generate unique QR code data
    const qrData = {
        eventId: eventId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        registrationId: `${eventId}-${user.id}-${Date.now()}`,
        registeredAt: new Date().toISOString()
    };

    // GÜNCELLENDİ: '...extraData' (rol, takım no vb.) eklendi
    const registration = {
        ...qrData,
        checkedIn: false,
        checkInTime: null,
        ...extraData // Formdan gelen ekstra veriler (rol, takım no)
    };

    // Save registration
    const allRegistrations = getAllRegistrations();
    if (!allRegistrations[eventId]) {
        allRegistrations[eventId] = [];
    }
    allRegistrations[eventId].push(registration);
    localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(allRegistrations));

    // Update user's event count
    updateUserEventCount(user.id, 'register');

    return { 
        success: true, 
        message: 'Registration successful!',
        qrData: JSON.stringify(qrData),
        registration: registration
    };
}

// Get user's registration for event
function getUserRegistration(eventId, userId) {
    const registrations = getEventRegistrations(eventId);
    return registrations.find(reg => reg.userId === userId);
}

// Check-in user
// GÜNCELLENDİ: Yaka kartı için tüm kayıt bilgisini döndürür
function checkInUser(registrationData) {
    try {
        console.log('checkInUser called with:', registrationData);
        
        const data = typeof registrationData === 'string' ? JSON.parse(registrationData) : registrationData;
        const { eventId, userId, registrationId } = data;

        console.log('Parsed data:', { eventId, userId, registrationId });

        const allRegistrations = getAllRegistrations();
        console.log('All registrations:', allRegistrations);
        
        const eventRegistrations = allRegistrations[eventId];
        
        if (!eventRegistrations) {
            console.error('No registrations found for eventId:', eventId);
            return { success: false, message: 'No registrations found for this event' };
        }

        console.log('Event registrations:', eventRegistrations);

        const regIndex = eventRegistrations.findIndex(reg => 
            reg.registrationId === registrationId && reg.userId === userId
        );

        console.log('Found registration at index:', regIndex);

        if (regIndex === -1) {
            console.error('Registration not found. Looking for:', { registrationId, userId });
            console.error('Available registrations:', eventRegistrations.map(r => ({ id: r.registrationId, userId: r.userId })));
            return { success: false, message: 'Registration not found' };
        }

        // GÜNCELLENDİ: Zaten giriş yapmışsa bile yaka kartı için bilgiyi döndür
        if (eventRegistrations[regIndex].checkedIn) {
            return { 
                success: false, 
                message: 'Already checked in',
                checkInTime: eventRegistrations[regIndex].checkInTime,
                registration: eventRegistrations[regIndex] // Yaka kartı için eklendi
            };
        }

        // Mark as checked in
        eventRegistrations[regIndex].checkedIn = true;
        eventRegistrations[regIndex].checkInTime = new Date().toISOString();

        localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(allRegistrations));

        // Update user's attended events count
        updateUserEventCount(userId, 'checkin');

        // GÜNCELLENDİ: Yaka kartı için tüm kayıt objesini döndür
        return {
            success: true,
            message: 'Check-in successful!',
            registration: eventRegistrations[regIndex] // 'user:' ve 'checkInTime:' yerine bu
        };
    } catch (error) {
        console.error('Error in checkInUser:', error);
        return { success: false, message: 'Invalid QR code: ' + error.message };
    }
}

// Update user's event count in localStorage
function updateUserEventCount(userId, action) {
    const CURRENT_USER_KEY = 'yal_current_user';
    const USERS_KEY = 'yal_users';

    // Update current user if matches
    let currentUser = localStorage.getItem(CURRENT_USER_KEY);
    let sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
    
    if (currentUser) {
        currentUser = JSON.parse(currentUser);
        if (currentUser.id === userId) {
            if (action === 'register') {
                currentUser.registeredEvents = (currentUser.registeredEvents || 0);
            } else if (action === 'checkin') {
                currentUser.attendedEvents = (currentUser.attendedEvents || 0) + 1;
            }
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }

    if (sessionUser) {
        sessionUser = JSON.parse(sessionUser);
        if (sessionUser.id === userId) {
            if (action === 'register') {
                sessionUser.registeredEvents = (sessionUser.registeredEvents || 0);
            } else if (action === 'checkin') {
                sessionUser.attendedEvents = (sessionUser.attendedEvents || 0) + 1;
            }
            sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        }
    }

    // Update users database
    const users = localStorage.getItem(USERS_KEY);
    if (users) {
        const usersArray = JSON.parse(users);
        const userIndex = usersArray.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            if (action === 'register') {
                usersArray[userIndex].registeredEvents = (usersArray[userIndex].registeredEvents || 0);
            } else if (action === 'checkin') {
                usersArray[userIndex].attendedEvents = (usersArray[userIndex].attendedEvents || 0) + 1;
            }
            localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
        }
    }
}

// Get event statistics
function getEventStatistics(eventId) {
    const registrations = getEventRegistrations(eventId);
    const checkedInCount = registrations.filter(reg => reg.checkedIn).length;
    
    return {
        totalRegistrations: registrations.length,
        checkedIn: checkedInCount,
        notCheckedIn: registrations.length - checkedInCount,
        registrations: registrations // Admin panel tablosu için tüm veriyi yolla
    };
}

// Admin: Get all events statistics
function getAllEventsStatistics() {
    const allRegistrations = getAllRegistrations();
    const stats = {};
    
    Object.keys(allRegistrations).forEach(eventId => {
        stats[eventId] = getEventStatistics(eventId);
    });
    
    return stats;
}

// Check if user is admin
function isAdmin(user) {
    return user && user.isAdmin === true;
}

// Verify admin code
function verifyAdminCode(code) {
    return code === ADMIN_CODE;
}

// Get user's registered events
function getUserRegisteredEvents(userId) {
    const allRegistrations = getAllRegistrations();
    const userEvents = [];

    Object.keys(allRegistrations).forEach(eventId => {
        const registration = allRegistrations[eventId].find(reg => reg.userId === userId);
        if (registration) {
            const event = getEventById(eventId);
            userEvents.push({
                ...event,
                registration: registration
            });
        }
    });

    return userEvents;
}

// Initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeEvents();
    });
}

// NEW Storage Key
const EVENT_PERKS_KEY = 'yal_event_perks';

/**
 * NEW FUNCTION 1: Generates a single-use Perk QR Code
 * (e.g., 'meal', 'drink', 'raffle')
 */
function generatePerkQRCode(eventId, user, perkType) {
    const allPerks = localStorage.getItem(EVENT_PERKS_KEY) ? JSON.parse(localStorage.getItem(EVENT_PERKS_KEY)) : {};
    
    // Find perks for this user at this event
    const userEventPerks = allPerks[`${eventId}_${user.id}`] || [];
    
    // Check if a perk of this type was already created
    let existingPerk = userEventPerks.find(p => p.perkType === perkType);
    
    if (existingPerk) {
        // Already created, return the existing QR data (prevents re-creation)
        console.log('Existing perk found:', existingPerk.perkId);
        return { 
            success: true, 
            qrData: JSON.stringify(existingPerk), 
            used: existingPerk.used 
        };
    }

    // Create a new perk
    const newPerk = {
        eventId: eventId,
        userId: user.id,
        userName: user.name, // For the admin to see
        perkType: perkType, // 'meal'
        perkId: `${perkType}-${user.id}-${Date.now()}`, // Unique ID
        used: false,
        redeemedAt: null
    };
    
    // Save
    userEventPerks.push(newPerk);
    allPerks[`${eventId}_${user.id}`] = userEventPerks;
    localStorage.setItem(EVENT_PERKS_KEY, JSON.stringify(allPerks));
    
    console.log('New perk created:', newPerk.perkId);
    return { 
        success: true, 
        qrData: JSON.stringify(newPerk), 
        used: false 
    };
}

/**
 * NEW FUNCTION 2: Redeems (uses) a Perk QR Code
 */
function redeemPerk(qrDataString) {
    let perkData;
    try {
        perkData = JSON.parse(qrDataString);
        if (!perkData.eventId || !perkData.userId || !perkData.perkId) {
             return { success: false, message: 'Invalid Perk Code (Missing Data)' };
        }
    } catch (e) {
        return { success: false, message: 'Invalid Perk Code (JSON Error)' };
    }
    
    const allPerks = localStorage.getItem(EVENT_PERKS_KEY) ? JSON.parse(localStorage.getItem(EVENT_PERKS_KEY)) : {};
    const userEventPerks = allPerks[`${perkData.eventId}_${perkData.userId}`];

    if (!userEventPerks) {
        return { success: false, message: 'User not found for this perk' };
    }

    const perkIndex = userEventPerks.findIndex(p => p.perkId === perkData.perkId);

    if (perkIndex === -1) {
        return { success: false, message: 'Perk not found' };
    }
    
    if (userEventPerks[perkIndex].used) {
        // ALREADY USED!
        return { 
            success: false, 
            message: 'This perk has already been used!',
            perk: userEventPerks[perkIndex]
        };
    }

    // MARK AS USED
    userEventPerks[perkIndex].used = true;
    userEventPerks[perkIndex].redeemedAt = new Date().toISOString();
    
    // Update database
    allPerks[`${perkData.eventId}_${perkData.userId}`] = userEventPerks;
    localStorage.setItem(EVENT_PERKS_KEY, JSON.stringify(allPerks));
    
    return { 
        success: true, 
        message: 'Perk redeemed successfully!',
        perk: userEventPerks[perkIndex]
    };
}


// Export functions for global use
window.EventManager = {
    initializeEvents,
    getAllEvents,
    getEventById,
    isUserRegistered,
    registerForEvent, // Güncellendi
    getUserRegistration,
    checkInUser, // Güncellendi
    getEventStatistics,
    getAllEventsStatistics,
    isAdmin,
    verifyAdminCode,
    getUserRegisteredEvents,
    generatePerkQRCode, 
    redeemPerk,         
    ADMIN_CODE
};
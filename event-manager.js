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
function registerForEvent(eventId, user) {
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

    const registration = {
        ...qrData,
        checkedIn: false,
        checkInTime: null
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
function checkInUser(registrationData) {
    try {
        const data = typeof registrationData === 'string' ? JSON.parse(registrationData) : registrationData;
        const { eventId, userId, registrationId } = data;

        const allRegistrations = getAllRegistrations();
        const eventRegistrations = allRegistrations[eventId];
        
        if (!eventRegistrations) {
            return { success: false, message: 'No registrations found for this event' };
        }

        const regIndex = eventRegistrations.findIndex(reg => 
            reg.registrationId === registrationId && reg.userId === userId
        );

        if (regIndex === -1) {
            return { success: false, message: 'Registration not found' };
        }

        if (eventRegistrations[regIndex].checkedIn) {
            return { 
                success: false, 
                message: 'Already checked in',
                checkInTime: eventRegistrations[regIndex].checkInTime
            };
        }

        // Mark as checked in
        eventRegistrations[regIndex].checkedIn = true;
        eventRegistrations[regIndex].checkInTime = new Date().toISOString();

        localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(allRegistrations));

        // Update user's attended events count
        updateUserEventCount(userId, 'checkin');

        return {
            success: true,
            message: 'Check-in successful!',
            user: {
                name: eventRegistrations[regIndex].userName,
                email: eventRegistrations[regIndex].userEmail
            },
            checkInTime: eventRegistrations[regIndex].checkInTime
        };
    } catch (error) {
        return { success: false, message: 'Invalid QR code' };
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
        registrations: registrations
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

// Export functions for global use
window.EventManager = {
    initializeEvents,
    getAllEvents,
    getEventById,
    isUserRegistered,
    registerForEvent,
    getUserRegistration,
    checkInUser,
    getEventStatistics,
    getAllEventsStatistics,
    isAdmin,
    verifyAdminCode,
    getUserRegisteredEvents,
    ADMIN_CODE
};
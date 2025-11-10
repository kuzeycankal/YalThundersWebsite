/**
 * YAL Thunders Event Management System
 * Handles event registration, QR generation, check-in, and admin functions
 */

// Storage Keys
const EVENTS_KEY = 'yal_events';
const EVENT_REGISTRATIONS_KEY = 'yal_event_registrations';
const EVENT_CHECKINS_KEY = 'yal_event_checkins';
const ADMIN_CODE = 'YALTHUNDERS2026'; // Admin registration code
const EVENT_PERKS_KEY = 'yal_event_perks'; // YEMEK FİŞİ KEY'İ

// Event structure (Bu bölümdeki 'name' ve 'description' alanları veritabanıdır,
// çoklu dil desteği için bunları da _tr objelerine taşımak gerekir, ama şimdilik böyle kalabilir)
const EVENTS_DATA = {
    'kickoff-2026': {
        id: 'kickoff-2026',
        name: 'FRC 2026 Kick-Off Event',
        nameTR: '2026 FRC Kick-Off Etkinliği', // Türkçe isim
        date: '2026-01-10T00:00:00+03:00',
        location: 'YAL Thunders Workshop',
        description: 'Join us for the official FRC 2026 season kick-off!',
        maxCapacity: 100,
        registrationOpen: true,
        image: 'kickoff_event.jpg'
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
function registerForEvent(eventId, user, extraData) {
    const event = getEventById(eventId);
    if (!event) {
        return { success: false, message: 'Etkinlik bulunamadı' }; // TÜRKÇE
    }

    if (!event.registrationOpen) {
        return { success: false, message: 'Kayıtlar kapandı' }; // TÜRKÇE
    }

    const registrations = getEventRegistrations(eventId);
    
    if (registrations.length >= event.maxCapacity) {
        return { success: false, message: 'Etkinlik kapasitesi doldu' }; // TÜRKÇE
    }

    if (isUserRegistered(eventId, user.id)) {
        return { success: false, message: 'Bu etkinliğe zaten kayıtlısınız' }; // TÜRKÇE
    }

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
        checkInTime: null,
        ...extraData
    };

    const allRegistrations = getAllRegistrations();
    if (!allRegistrations[eventId]) {
        allRegistrations[eventId] = [];
    }
    allRegistrations[eventId].push(registration);
    localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(allRegistrations));

    updateUserEventCount(user.id, 'register');

    return { 
        success: true, 
        message: 'Kayıt başarılı!', // TÜRKÇE
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
        console.log('checkInUser ham veri:', registrationData);
        
        let data;
        try {
            data = JSON.parse(registrationData);
        } catch (e) {
            return { success: false, message: 'Geçersiz QR Kod (JSON Hatası)' }; // TÜRKÇE
        }
        
        if (typeof data !== 'object' || data === null) {
            return { success: false, message: 'Geçersiz QR Kod (Obje değil)' }; // TÜRKÇE
        }

        const { eventId, userId, registrationId } = data;

        if (!eventId || !userId || !registrationId) {
            return { success: false, message: 'Geçersiz QR Kod (Eksik Bilgi)' }; // TÜRKÇE
        }
        
        console.log('Ayrıştırılmış veri:', { eventId, userId, registrationId });

        const allRegistrations = getAllRegistrations();
        const eventRegistrations = allRegistrations[eventId];
        
        if (!eventRegistrations) {
            return { success: false, message: 'Bu etkinlik için kayıt bulunamadı' }; // TÜRKÇE
        }

        const regIndex = eventRegistrations.findIndex(reg => 
            reg.registrationId === registrationId && reg.userId === userId
        );

        if (regIndex === -1) {
            return { success: false, message: 'Kayıt bulunamadı' }; // TÜRKÇE
        }

        if (eventRegistrations[regIndex].checkedIn) {
            return { 
                success: false, 
                message: 'Zaten giriş yapılmış', // TÜRKÇE
                checkInTime: eventRegistrations[regIndex].checkInTime,
                registration: eventRegistrations[regIndex]
            };
        }

        eventRegistrations[regIndex].checkedIn = true;
        eventRegistrations[regIndex].checkInTime = new Date().toISOString();
        localStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(allRegistrations));

        updateUserEventCount(userId, 'checkin');

        return {
            success: true,
            message: 'Giriş başarılı!', // TÜRKÇE
            registration: eventRegistrations[regIndex]
        };
    } catch (error) {
        console.error('checkInUser Hatası:', error);
        return { success: false, message: 'Geçersiz QR Kod: ' + error.message }; // TÜRKÇE
    }
}

// Update user's event count in localStorage
function updateUserEventCount(userId, action) {
    const CURRENT_USER_KEY = 'yal_current_user';
    const USERS_KEY = 'yal_users';

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

/**
 * YENİ FONKSİYON 1: Tek Kullanımlık Fiş (Perk) QR Kodu Oluşturur
 */
function generatePerkQRCode(eventId, user, perkType) {
    const allPerks = localStorage.getItem(EVENT_PERKS_KEY) ? JSON.parse(localStorage.getItem(EVENT_PERKS_KEY)) : {};
    const userEventPerks = allPerks[`${eventId}_${user.id}`] || [];
    let existingPerk = userEventPerks.find(p => p.perkType === perkType);
    
    if (existingPerk) {
        console.log('Mevcut fiş bulundu:', existingPerk.perkId);
        return { 
            success: true, 
            qrData: JSON.stringify(existingPerk), 
            used: existingPerk.used 
        };
    }

    const newPerk = {
        eventId: eventId,
        userId: user.id,
        userName: user.name,
        perkType: perkType,
        perkId: `${perkType}-${user.id}-${Date.now()}`,
        used: false,
        redeemedAt: null
    };
    
    userEventPerks.push(newPerk);
    allPerks[`${eventId}_${user.id}`] = userEventPerks;
    localStorage.setItem(EVENT_PERKS_KEY, JSON.stringify(allPerks));
    
    console.log('Yeni fiş oluşturuldu:', newPerk.perkId);
    return { 
        success: true, 
        qrData: JSON.stringify(newPerk), 
        used: false 
    };
}

/**
 * YENİ FONKSİYON 2: Fiş (Perk) QR Kodunu Okutup Kullanır
 */
function redeemPerk(qrDataString) {
    let perkData;
    try {
        perkData = JSON.parse(qrDataString);
        if (!perkData.eventId || !perkData.userId || !perkData.perkId) {
             return { success: false, message: 'Geçersiz Fiş Kodu (Eksik Bilgi)' }; // TÜRKÇE
        }
    } catch (e) {
        return { success: false, message: 'Geçersiz Fiş Kodu (JSON Hatası)' }; // TÜRKÇE
    }
    
    const allPerks = localStorage.getItem(EVENT_PERKS_KEY) ? JSON.parse(localStorage.getItem(EVENT_PERKS_KEY)) : {};
    const userEventPerks = allPerks[`${perkData.eventId}_${perkData.userId}`];

    if (!userEventPerks) {
        return { success: false, message: 'Bu fiş için kullanıcı bulunamadı' }; // TÜRKÇE
    }

    const perkIndex = userEventPerks.findIndex(p => p.perkId === perkData.perkId);

    if (perkIndex === -1) {
        return { success: false, message: 'Fiş bulunamadı' }; // TÜRKÇE
    }
    
    if (userEventPerks[perkIndex].used) {
        return { 
            success: false, 
            message: 'Bu fiş zaten kullanılmış!', // TÜRKÇE
            perk: userEventPerks[perkIndex]
        };
    }

    userEventPerks[perkIndex].used = true;
    userEventPerks[perkIndex].redeemedAt = new Date().toISOString();
    
    allPerks[`${perkData.eventId}_${perkData.userId}`] = userEventPerks;
    localStorage.setItem(EVENT_PERKS_KEY, JSON.stringify(allPerks));
    
    return { 
        success: true, 
        message: 'Fiş başarıyla kullanıldı!', // TÜRKÇE
        perk: userEventPerks[perkIndex]
    };
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
    ADMIN_CODE,
    generatePerkQRCode,
    redeemPerk
};
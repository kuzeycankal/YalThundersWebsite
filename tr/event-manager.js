/**
 * YAL Thunders Event Management System
 * Hata mesajları Türkçeye çevrildi.
 */

// Storage Keys
const EVENTS_KEY = 'yal_events';
const EVENT_REGISTRATIONS_KEY = 'yal_event_registrations';
const EVENT_CHECKINS_KEY = 'yal_event_checkins';
const ADMIN_CODE = 'YALTHUNDERS2026';
const EVENT_PERKS_KEY = 'yal_event_perks'; 

const EVENTS_DATA = {
    'kickoff-2026': {
        id: 'kickoff-2026',
        name: 'FRC 2026 Kick-Off Event',
        nameTR: '2026 FRC Kick-Off Etkinliği',
        date: '2026-01-10T00:00:00+03:00',
        location: 'YAL Thunders Workshop',
        description: 'Join us for the official FRC 2026 season kick-off!',
        maxCapacity: 100,
        registrationOpen: true,
        image: '/kickoff_event.jpg' // YOL / İLE BAŞLAMALI
    }
};

// ... (initializeEvents, getAllEvents, getEventById, getAllRegistrations, getEventRegistrations, isUserRegistered fonksiyonları aynı) ...

function initializeEvents() {
    const events = localStorage.getItem(EVENTS_KEY);
    if (!events) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(EVENTS_DATA));
    }
}
function getAllEvents() {
    const events = localStorage.getItem(EVENTS_KEY);
    return events ? JSON.parse(events) : EVENTS_DATA;
}
function getEventById(eventId) {
    const events = getAllEvents();
    return events[eventId] || null;
}
function getAllRegistrations() {
    const registrations = localStorage.getItem(EVENT_REGISTRATIONS_KEY);
    return registrations ? JSON.parse(registrations) : {};
}
function getEventRegistrations(eventId) {
    const allRegistrations = getAllRegistrations();
    return allRegistrations[eventId] || [];
}
function isUserRegistered(eventId, userId) {
    const registrations = getEventRegistrations(eventId);
    return registrations.some(reg => reg.userId === userId);
}

function registerForEvent(eventId, user, extraData) {
    const event = getEventById(eventId);
    if (!event) {
        return { success: false, message: 'Etkinlik bulunamadı' };
    }
    if (!event.registrationOpen) {
        return { success: false, message: 'Kayıtlar kapandı' };
    }
    const registrations = getEventRegistrations(eventId);
    if (registrations.length >= event.maxCapacity) {
        return { success: false, message: 'Etkinlik kapasitesi doldu' };
    }
    if (isUserRegistered(eventId, user.id)) {
        return { success: false, message: 'Bu etkinliğe zaten kayıtlısınız' };
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
        message: 'Kayıt başarılı!',
        qrData: JSON.stringify(qrData),
        registration: registration
    };
}

function getUserRegistration(eventId, userId) {
    const registrations = getEventRegistrations(eventId);
    return registrations.find(reg => reg.userId === userId);
}

function checkInUser(registrationData) {
    try {
        let data;
        try {
            data = JSON.parse(registrationData);
        } catch (e) {
            return { success: false, message: 'Geçersiz QR Kod (JSON Hatası)' };
        }
        if (typeof data !== 'object' || data === null) {
            return { success: false, message: 'Geçersiz QR Kod (Obje değil)' };
        }
        const { eventId, userId, registrationId } = data;
        if (!eventId || !userId || !registrationId) {
            return { success: false, message: 'Geçersiz QR Kod (Eksik Bilgi)' };
        }
        const allRegistrations = getAllRegistrations();
        const eventRegistrations = allRegistrations[eventId];
        if (!eventRegistrations) {
            return { success: false, message: 'Bu etkinlik için kayıt bulunamadı' };
        }
        const regIndex = eventRegistrations.findIndex(reg => 
            reg.registrationId === registrationId && reg.userId === userId
        );
        if (regIndex === -1) {
            return { success: false, message: 'Kayıt bulunamadı' };
        }
        if (eventRegistrations[regIndex].checkedIn) {
            return { 
                success: false, 
                message: 'Zaten giriş yapılmış',
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
            message: 'Giriş başarılı!',
            registration: eventRegistrations[regIndex]
        };
    } catch (error) {
        console.error('checkInUser Hatası:', error);
        return { success: false, message: 'Geçersiz QR Kod: ' + error.message };
    }
}

// ... (updateUserEventCount fonksiyonu aynı) ...
function updateUserEventCount(userId, action) {
    const CURRENT_USER_KEY = 'yal_current_user';
    const USERS_KEY = 'yal_users';
    let currentUser = localStorage.getItem(CURRENT_USER_KEY);
    let sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
        currentUser = JSON.parse(currentUser);
        if (currentUser.id === userId) {
            if (action === 'checkin') {
                currentUser.attendedEvents = (currentUser.attendedEvents || 0) + 1;
            }
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }
    if (sessionUser) {
        sessionUser = JSON.parse(sessionUser);
        if (sessionUser.id === userId) {
            if (action === 'checkin') {
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
            if (action === 'checkin') {
                usersArray[userIndex].attendedEvents = (usersArray[userIndex].attendedEvents || 0) + 1;
            }
            localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
        }
    }
}

// ... (getEventStatistics, getAllEventsStatistics, isAdmin, verifyAdminCode, getUserRegisteredEvents fonksiyonları aynı) ...
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
function getAllEventsStatistics() {
    const allRegistrations = getAllRegistrations();
    const stats = {};
    Object.keys(allRegistrations).forEach(eventId => {
        stats[eventId] = getEventStatistics(eventId);
    });
    return stats;
}
function isAdmin(user) {
    return user && user.isAdmin === true;
}
function verifyAdminCode(code) {
    return code === ADMIN_CODE;
}
function getUserRegisteredEvents(userId) {
    const allRegistrations = getAllRegistrations();
    const userEvents = [];
    Object.keys(allRegistrations).forEach(eventId => {
        const registration = allRegistrations[eventId].find(reg => reg.userId === userId);
        if (registration) {
            const event = getEventById(eventId);
            userEvents.push({ ...event, registration: registration });
        }
    });
    return userEvents;
}


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

function redeemPerk(qrDataString) {
    let perkData;
    try {
        perkData = JSON.parse(qrDataString);
        if (!perkData.eventId || !perkData.userId || !perkData.perkId) {
             return { success: false, message: 'Geçersiz Fiş Kodu (Eksik Bilgi)' };
        }
    } catch (e) {
        return { success: false, message: 'Geçersiz Fiş Kodu (JSON Hatası)' };
    }
    const allPerks = localStorage.getItem(EVENT_PERKS_KEY) ? JSON.parse(localStorage.getItem(EVENT_PERKS_KEY)) : {};
    const userEventPerks = allPerks[`${perkData.eventId}_${perkData.userId}`];
    if (!userEventPerks) {
        return { success: false, message: 'Bu fiş için kullanıcı bulunamadı' };
    }
    const perkIndex = userEventPerks.findIndex(p => p.perkId === perkData.perkId);
    if (perkIndex === -1) {
        return { success: false, message: 'Fiş bulunamadı' };
    }
    if (userEventPerks[perkIndex].used) {
        return { 
            success: false, 
            message: 'Bu fiş zaten kullanılmış!',
            perk: userEventPerks[perkIndex]
        };
    }
    userEventPerks[perkIndex].used = true;
    userEventPerks[perkIndex].redeemedAt = new Date().toISOString();
    allPerks[`${perkData.eventId}_${perkData.userId}`] = userEventPerks;
    localStorage.setItem(EVENT_PERKS_KEY, JSON.stringify(allPerks));
    return { 
        success: true, 
        message: 'Fiş başarıyla kullanıldı!',
        perk: userEventPerks[perkIndex]
    };
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeEvents();
    });
}

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
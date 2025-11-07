/**
 * YAL Thunders Authentication System
 * localStorage tabanlı güvenli kullanıcı yönetimi
 */

// Kullanıcı verilerini localStorage'da sakla
const USERS_KEY = 'yal_users';
const CURRENT_USER_KEY = 'yal_current_user';

// Basit şifreleme fonksiyonu (production'da bcrypt kullanılmalı)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Kullanıcıları al
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

// Kullanıcıları kaydet
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Email validasyonu
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Şifre gücü kontrolü
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
}

// Şifre görünürlüğünü değiştir
function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Mesaj göster
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Register fonksiyonu
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    // Validasyon
    if (name.length < 3) {
        showMessage('registerMessage', 'Name must be at least 3 characters long', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('registerMessage', 'Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('registerMessage', 'Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage('registerMessage', 'Passwords do not match', 'error');
        return;
    }
    
    // Kullanıcı zaten var mı kontrol et
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showMessage('registerMessage', 'This email is already registered', 'error');
        return;
    }
    
    // Yeni kullanıcı oluştur
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    showMessage('registerMessage', 'Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

// Login fonksiyonu
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!isValidEmail(email)) {
        showMessage('loginMessage', 'Please enter a valid email address', 'error');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (!user) {
        showMessage('loginMessage', 'Invalid email or password', 'error');
        return;
    }
    
    // Kullanıcı bilgilerini sakla (şifre hariç)
    const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        loginTime: new Date().toISOString()
    };
    
    if (rememberMe) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
    
    showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1500);
}

// Logout fonksiyonu
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '/login.html';
}

// Mevcut kullanıcıyı al
function getCurrentUser() {
    const localUser = localStorage.getItem(CURRENT_USER_KEY);
    const sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
    return localUser ? JSON.parse(localUser) : (sessionUser ? JSON.parse(sessionUser) : null);
}

// Kullanıcı giriş yapmış mı kontrol et
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Header'daki auth butonlarını güncelle
function updateAuthButtons() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Kullanıcı giriş yapmışsa
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        authButtonsContainer.innerHTML = `
            <a href="#" class="user-profile-btn">
                <span class="user-avatar">${initials}</span>
                <span>${currentUser.name.split(' ')[0]}</span>
            </a>
            <button onclick="logout()" class="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </button>
        `;
    } else {
        // Kullanıcı giriş yapmamışsa
        authButtonsContainer.innerHTML = `
            <a href="/login.html" class="auth-btn login-btn">
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>Login</span>
            </a>
            <a href="/register.html" class="auth-btn register-btn">
                <i class="fa-solid fa-user-plus"></i>
                <span>Register</span>
            </a>
        `;
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Password toggle başlat
    initPasswordToggle();
    
    // Auth butonlarını güncelle
    updateAuthButtons();
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Şifre gücü göstergesi
        const passwordInput = document.getElementById('registerPassword');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (passwordInput && strengthFill && strengthText) {
            passwordInput.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                const percentage = (strength / 5) * 100;
                
                strengthFill.style.width = percentage + '%';
                
                if (strength <= 1) {
                    strengthFill.style.backgroundColor = '#e74c3c';
                    strengthText.textContent = 'Weak password';
                } else if (strength <= 3) {
                    strengthFill.style.backgroundColor = '#f39c12';
                    strengthText.textContent = 'Medium password';
                } else {
                    strengthFill.style.backgroundColor = '#27ae60';
                    strengthText.textContent = 'Strong password';
                }
            });
        }
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Eğer zaten giriş yapılmışsa ve login/register sayfasındaysa, ana sayfaya yönlendir
    if (isLoggedIn() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = '/index.html';
    }
});

// Global olarak kullanılabilir fonksiyonlar
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.updateAuthButtons = updateAuthButtons;
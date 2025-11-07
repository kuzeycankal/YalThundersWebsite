/* =========================================================
   AUTH / USER MENU HANDLER
   Basit localStorage tabanlı demo kimlik sistemi
   ========================================================= */

/* Kullanıcıyı localStorage'dan getir */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        console.warn('currentUser parse error', e);
        return null;
    }
}

/* currentUser kaydet (profil değişikliklerinde) */
function setCurrentUser(userObj) {
    localStorage.setItem('currentUser', JSON.stringify(userObj));
}

/* Çıkış */
function logout(redirect = true) {
    localStorage.removeItem('currentUser');
    if (redirect) {
        window.location.href = '/index.html';
    }
}

/* Hesap silme */
function deleteAccount() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (!confirm('⚠️ Hesabını silmek istediğine emin misin?')) return;
    if (!confirm('Bu işlem GERİ ALINAMAZ. Devam?')) return;
    const check = prompt('Onaylamak için kullanıcı adını yaz:');
    if (check !== currentUser.username) {
        alert('Kullanıcı adı eşleşmedi. Silme iptal edildi.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.username !== currentUser.username);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    alert('Hesabın silindi.');
    window.location.href = '/index.html';
}

/* Dropdown HTML üret */
function buildUserMenuHTML(user) {
    const safeUsername = escapeHTML(user.username || 'User');
    const safeEmail = escapeHTML(user.email || '');
    return `
        <div class="user-menu-container">
            <button class="user-menu-button" id="userMenuButton" aria-haspopup="true" aria-expanded="false">
                <i class="fa-solid fa-user-circle" aria-hidden="true"></i>
                <span class="user-menu-username">${safeUsername}</span>
                <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
            </button>
            <div class="user-dropdown" id="userDropdown" role="menu" aria-hidden="true">
                <div class="user-dropdown-header">
                    <i class="fa-solid fa-user-circle" aria-hidden="true"></i>
                    <div>
                        <div class="user-dropdown-name">${safeUsername}</div>
                        <div class="user-dropdown-email">${safeEmail}</div>
                    </div>
                </div>
                <div class="user-dropdown-divider"></div>

                <a href="/profile.html" class="user-dropdown-item" role="menuitem" tabindex="0">
                    <i class="fa-solid fa-user"></i>
                    <span>My Profile</span>
                </a>

                <!-- İstersen Change Email / Change Password direkt linkleri ekleyebilirsin
                <a href="/profile.html#change-email" class="user-dropdown-item" role="menuitem">
                    <i class="fa-solid fa-envelope"></i>
                    <span>Change Email</span>
                </a>
                <a href="/profile.html#change-password" class="user-dropdown-item" role="menuitem">
                    <i class="fa-solid fa-key"></i>
                    <span>Change Password</span>
                </a>
                -->

                <div class="user-dropdown-divider"></div>

                <button class="user-dropdown-item user-dropdown-danger" id="deleteAccountBtn" role="menuitem" type="button">
                    <i class="fa-solid fa-trash"></i>
                    <span>Delete Account</span>
                </button>

                <button class="user-dropdown-item" id="logoutBtn" role="menuitem" type="button">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    `;
}

/* Auth butonlarını güncelle */
function updateAuthButtons() {
    const container = document.getElementById('authButtons');
    if (!container) return;

    const user = getCurrentUser();

    if (user) {
        container.innerHTML = buildUserMenuHTML(user);
        attachUserMenuEvents();
    } else {
        container.innerHTML = `
            <a href="/login.html" class="auth-btn login-btn">Login</a>
            <a href="/register.html" class="auth-btn register-btn">Sign Up</a>
        `;
    }
}

/* Menü eventleri */
function attachUserMenuEvents() {
    const button = document.getElementById('userMenuButton');
    const dropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteBtn = document.getElementById('deleteAccountBtn');

    if (!button || !dropdown) return;

    function openMenu() {
        dropdown.classList.add('show');
        button.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('aria-hidden', 'false');
        // İlk focuslanabilir elemana focus
        const firstItem = dropdown.querySelector('.user-dropdown-item, button.user-dropdown-item');
        if (firstItem) firstItem.focus();
    }

    function closeMenu() {
        dropdown.classList.remove('show');
        button.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('show');
        if (isOpen) {
            closeMenu();
        } else {
            closeMenuAll(); // başka açık varsa kapat
            openMenu();
        }
    });

    // Escape & klavye navigasyonu
    dropdown.addEventListener('keydown', (e) => {
        const items = Array.from(dropdown.querySelectorAll('.user-dropdown-item, button.user-dropdown-item'));
        if (!items.length) return;

        const currentIndex = items.indexOf(document.activeElement);

        switch (e.key) {
            case 'Escape':
                closeMenu();
                button.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                items[(currentIndex + 1) % items.length].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                items[(currentIndex - 1 + items.length) % items.length].focus();
                break;
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
        }
    });

    // Dışarı tıklama
    document.addEventListener('click', docClickClose, { capture: true });

    function docClickClose(e) {
        if (!dropdown.contains(e.target) && e.target !== button) {
            closeMenu();
        }
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout(true));
    }

    // Delete account
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteAccount);
    }
}

/* Açık başka menüleri kapat (gelecekte başka menüler eklersen kullanışlı) */
function closeMenuAll() {
    document.querySelectorAll('.user-dropdown.show').forEach(dd => {
        dd.classList.remove('show');
        const button = document.getElementById('userMenuButton');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
    });
}

/* Basit HTML escape */
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* Sayfa yüklendiğinde */
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
});

/* Swup ile sayfa geçişlerinde tekrar çağırmak istersen (varsa) 
   swup.hooks.on('page:view', updateAuthButtons); 
*/
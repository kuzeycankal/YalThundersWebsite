// academy/js/theme.js
// Theme switcher for Academy pages (synced with main site)

console.log("Academy Theme JS Loaded");

const STORAGE_KEY = 'theme-preference';

// Get current theme
function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeIcon(theme);
}

// Update theme toggle icon
function updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    const icon = toggle.querySelector('i');
    if (!icon) return;
    
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme
function initTheme() {
    const theme = getTheme();
    setTheme(theme);
    
    // Add click handler to theme toggle button
    const toggle = document.getElementById('theme-toggle');
    if (toggle && !toggle.hasAttribute('data-theme-listener')) {
        toggle.addEventListener('click', toggleTheme);
        toggle.setAttribute('data-theme-listener', 'true');
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Export for use in other scripts
export { getTheme, setTheme, toggleTheme };




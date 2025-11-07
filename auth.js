// auth.js

// Function for user registration
function registerUser(username, password) {
    // Check password strength
    if (!isPasswordStrong(password)) {
        console.log('Password is not strong enough!');
        return;
    }
    // Save user data to localStorage
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User registered successfully!');
}

// Function for user login
function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username] && users[username] === password) {
        console.log('Login successful!');
        localStorage.setItem('currentUser', username);
    } else {
        console.log('Invalid username or password!');
    }
}

// Function for user logout
function logoutUser() {
    localStorage.removeItem('currentUser');
    console.log('User logged out successfully!');
}

// Function to check password strength
function isPasswordStrong(password) {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/; // must have at least one number, one lowercase, one uppercase, and one special character
    return password.length >= 8 && regex.test(password);
}
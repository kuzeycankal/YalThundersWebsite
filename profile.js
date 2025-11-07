// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = '/login.html';
}

// Display user info
document.getElementById('profileUsername').textContent = currentUser.username;
document.getElementById('profileEmail').textContent = currentUser.email;
document.getElementById('currentEmailDisplay').value = currentUser.email;

// ============================================
// CHANGE EMAIL WITH VERIFICATION CODE
// ============================================
let emailVerificationCode = null;
let newEmailToChange = null;

document.getElementById('sendEmailCodeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newEmail = document.getElementById('newEmail').value.trim();
    const errorDiv = document.getElementById('emailError');
    
    if (!newEmail || !newEmail.includes('@')) {
        errorDiv.textContent = 'Please enter a valid email address.';
        return;
    }
    
    if (newEmail === currentUser.email) {
        errorDiv.textContent = 'New email cannot be the same as current email.';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === newEmail)) {
        errorDiv.textContent = 'This email is already in use.';
        return;
    }
    
    // Generate 6-digit code
    emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    newEmailToChange = newEmail;
    
    console.log('==============================================');
    console.log('EMAIL VERIFICATION CODE:');
    console.log(emailVerificationCode);
    console.log('==============================================');
    
    // Show verification form
    document.getElementById('sendEmailCodeForm').style.display = 'none';
    document.getElementById('verifyEmailCodeForm').style.display = 'block';
    document.getElementById('sentToEmail').textContent = newEmail;
    
    alert(`Verification code sent to ${newEmail}\n\nFor demo: ${emailVerificationCode}\n\n(Check console F12)`);
    
    errorDiv.textContent = '';
});

document.getElementById('verifyEmailCodeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const enteredCode = document.getElementById('emailVerificationCode').value.trim();
    const errorDiv = document.getElementById('emailVerifyError');
    
    if (enteredCode !== emailVerificationCode) {
        errorDiv.textContent = 'Invalid verification code. Please try again.';
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        users[userIndex].email = newEmailToChange;
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser.email = newEmailToChange;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Email changed successfully!');
        location.reload();
    } else {
        errorDiv.textContent = 'Error updating email. Please try again.';
    }
});

document.getElementById('resendEmailCodeBtn').addEventListener('click', () => {
    emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('==============================================');
    console.log('NEW EMAIL VERIFICATION CODE:');
    console.log(emailVerificationCode);
    console.log('==============================================');
    
    alert(`New code sent!\n\nFor demo: ${emailVerificationCode}`);
    
    document.getElementById('emailVerifyError').textContent = '';
    document.getElementById('emailVerificationCode').value = '';
});

// ============================================
// CHANGE PASSWORD
// ============================================
document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    if (currentPassword !== currentUser.password) {
        errorDiv.textContent = 'Current password is incorrect.';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = 'New password must be at least 6 characters.';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'New passwords do not match.';
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Password changed successfully!');
        document.getElementById('changePasswordForm').reset();
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = 'Error updating password. Please try again.';
    }
});

// ============================================
// DELETE ACCOUNT
// ============================================
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to delete your account?\n\nThis action CANNOT be undone!')) {
        if (confirm('⚠️ FINAL WARNING!\n\nAll your data will be permanently deleted.\n\nType your username to confirm: ' + currentUser.username)) {
            const confirmUsername = prompt('Enter your username to confirm deletion:');
            
            if (confirmUsername === currentUser.username) {
                let users = JSON.parse(localStorage.getItem('users')) || [];
                users = users.filter(u => u.username !== currentUser.username);
                localStorage.setItem('users', JSON.stringify(users));
                
                localStorage.removeItem('currentUser');
                
                alert('Your account has been deleted.');
                window.location.href = '/index.html';
            } else {
                alert('Username does not match. Account deletion cancelled.');
            }
        }
    }
});
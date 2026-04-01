/**
 * HACKER CHAT - Login System
 * Secure authentication with session management
 */

// ========================================
// CONFIGURATION - Edit these credentials
// ========================================
// Default credentials - Change these for production
// In Vercel, you can set these as Environment Variables
const CONFIG = {
    // Multiple user accounts supported
    users: [
        { username: 'admin', password: 'hacker123', accessCode: '1337', role: 'ADMIN' },
        { username: 'operator', password: 'secureshell', accessCode: '4242', role: 'OPERATOR' },
        { username: 'guest', password: 'guestpass', accessCode: '0000', role: 'GUEST' }
    ],
    sessionDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// DOM Elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const accessCodeInput = document.getElementById('accessCode');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const sessionTimer = document.getElementById('sessionTimer');

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate a random session ID
 */
function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Hash password (simple hash for demo - use bcrypt in production)
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

/**
 * Show error message
 */
function showError(message) {
    errorMsg.textContent = `[ERROR] ${message}`;
    errorMsg.classList.add('show');
    successMsg.classList.remove('show');
    
    // Play error sound effect (optional)
    playSound('error');
}

/**
 * Show success message
 */
function showSuccess(message) {
    successMsg.textContent = `[SUCCESS] ${message}`;
    successMsg.classList.add('show');
    errorMsg.classList.remove('show');
    
    // Play success sound effect (optional)
    playSound('success');
}

/**
 * Play sound effect (placeholder)
 */
function playSound(type) {
    // Sound effects can be added here
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.play().catch(() => {});
}

/**
 * Update session timer display
 */
function updateSessionTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    sessionTimer.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

/**
 * Validate user credentials
 */
function validateCredentials(username, password, accessCode) {
    const user = CONFIG.users.find(u => 
        u.username === username && 
        u.password === password && 
        u.accessCode === accessCode
    );
    
    return user || null;
}

/**
 * Create user session
 */
function createSession(user) {
    const session = {
        id: generateSessionId(),
        username: user.username,
        role: user.role,
        loginTime: Date.now(),
        expiresAt: Date.now() + CONFIG.sessionDuration
    };
    
    // Store session in localStorage
    localStorage.setItem('hackerChat_session', JSON.stringify(session));
    
    // Set session start time for chat cleanup
    localStorage.setItem('hackerChat_sessionStart', Date.now().toString());
    
    return session;
}

/**
 * Check if user is already logged in
 */
function checkExistingSession() {
    const sessionStr = localStorage.getItem('hackerChat_session');
    
    if (sessionStr) {
        try {
            const session = JSON.parse(sessionStr);
            
            // Check if session is still valid
            if (Date.now() < session.expiresAt) {
                // Valid session, redirect to chat
                window.location.href = 'index.html';
                return true;
            } else {
                // Session expired, clear it
                localStorage.removeItem('hackerChat_session');
                localStorage.removeItem('hackerChat_sessionStart');
            }
        } catch (e) {
            // Invalid session data
            localStorage.removeItem('hackerChat_session');
            localStorage.removeItem('hackerChat_sessionStart');
        }
    }
    
    return false;
}

/**
 * Handle login
 */
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const accessCode = accessCodeInput.value.trim();
    
    // Validation
    if (!username) {
        showError('Username required');
        usernameInput.focus();
        return;
    }
    
    if (!password) {
        showError('Password required');
        passwordInput.focus();
        return;
    }
    
    if (!accessCode) {
        showError('Access code required');
        accessCodeInput.focus();
        return;
    }
    
    // Validate credentials
    const user = validateCredentials(username, password, accessCode);
    
    if (user) {
        // Success
        showSuccess('Authentication successful. Redirecting...');
        
        // Create session
        createSession(user);
        
        // Disable inputs
        usernameInput.disabled = true;
        passwordInput.disabled = true;
        accessCodeInput.disabled = true;
        loginBtn.disabled = true;
        
        // Redirect to chat
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        // Failed
        showError('Invalid credentials. Access denied.');
        
        // Clear inputs
        passwordInput.value = '';
        accessCodeInput.value = '';
        passwordInput.focus();
        
        // Add shake animation
        loginBtn.classList.add('shake');
        setTimeout(() => loginBtn.classList.remove('shake'), 500);
    }
}

// ========================================
// MATRIX BACKGROUND EFFECT
// ========================================

function initMatrixBackground() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('matrixBg');
    
    if (!container) return;
    
    container.appendChild(canvas);
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    setInterval(draw, 35);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check existing session
    if (checkExistingSession()) {
        return;
    }
    
    // Initialize matrix background
    initMatrixBackground();
    
    // Update session timer
    updateSessionTimer();
    setInterval(updateSessionTimer, 1000);
    
    // Login button click
    loginBtn.addEventListener('click', handleLogin);
    
    // Enter key on inputs
    [usernameInput, passwordInput, accessCodeInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    });
    
    // Focus username on load
    usernameInput.focus();
    
    // Typing effect for system info
    const typingTexts = document.querySelectorAll('.typing-text');
    typingTexts.forEach((text, index) => {
        text.style.opacity = '0';
        setTimeout(() => {
            text.style.opacity = '1';
            text.style.transition = 'opacity 0.5s ease';
        }, index * 300);
    });
});

// Prevent right-click (optional security)
document.addEventListener('contextmenu', (e) => {
    // Uncomment to disable right-click
    // e.preventDefault();
});

// Console warning
console.log('%c[SYSTEM] HACKER CHAT v2.0.4', 'color: #00ff41; font-size: 16px; font-weight: bold;');
console.log('%c[WARNING] Unauthorized access is prohibited.', 'color: #ff0000; font-size: 12px;');

/**
 * HACKER CHAT - Chat System
 * Local storage based chat with 24h auto-delete
 */

// ========================================
// CONFIGURATION
// ========================================
const CHAT_CONFIG = {
    messageExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxMessages: 1000, // Maximum messages to store
    cleanupInterval: 60 * 1000, // Check for expired messages every minute
    storageKey: 'hackerChat_messages',
    typingSimulation: true
};

// ========================================
// STATE
// ========================================
let currentUser = null;
let session = null;
let messageCount = 0;
let uptime = 0;
let typingTimeout = null;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const currentUserEl = document.getElementById('currentUser');
const userAvatarEl = document.getElementById('userAvatar');
const sidebarUserEl = document.getElementById('sidebarUser');
const messageCountEl = document.getElementById('messageCount');
const uptimeEl = document.getElementById('uptime');
const sessionExpiryEl = document.getElementById('sessionExpiry');
const clockEl = document.getElementById('clock');
const toast = document.getElementById('toast');
const clearChatBtn = document.getElementById('clearChatBtn');
const logoutBtn = document.getElementById('logoutBtn');
const typingIndicator = document.getElementById('typingIndicator');

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate unique message ID
 */
function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('error');
    }
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Play notification sound (optional)
 */
function playNotificationSound() {
    // Can be implemented with Web Audio API
}

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * Check and validate session
 */
function checkSession() {
    const sessionStr = localStorage.getItem('hackerChat_session');
    
    if (!sessionStr) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        session = JSON.parse(sessionStr);
        
        // Check if session expired
        if (Date.now() > session.expiresAt) {
            // Session expired
            logout();
            return false;
        }
        
        currentUser = session.username;
        return true;
    } catch (e) {
        logout();
        return false;
    }
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('hackerChat_session');
    localStorage.removeItem('hackerChat_sessionStart');
    window.location.href = 'login.html';
}

/**
 * Update user interface
 */
function updateUserInterface() {
    if (currentUser) {
        currentUserEl.textContent = currentUser;
        sidebarUserEl.textContent = currentUser;
        userAvatarEl.textContent = currentUser.charAt(0).toUpperCase();
    }
}

/**
 * Update session expiry display
 */
function updateSessionExpiry() {
    if (session) {
        const timeLeft = session.expiresAt - Date.now();
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            sessionExpiryEl.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            logout();
        }
    }
}

// ========================================
// MESSAGE STORAGE & MANAGEMENT
// ========================================

/**
 * Get all messages from storage
 */
function getMessages() {
    const messagesStr = localStorage.getItem(CHAT_CONFIG.storageKey);
    if (!messagesStr) return [];
    
    try {
        return JSON.parse(messagesStr);
    } catch (e) {
        return [];
    }
}

/**
 * Save messages to storage
 */
function saveMessages(messages) {
    localStorage.setItem(CHAT_CONFIG.storageKey, JSON.stringify(messages));
}

/**
 * Add new message
 */
function addMessage(content, sender = null, type = 'normal') {
    const messages = getMessages();
    
    const message = {
        id: generateMessageId(),
        content: content,
        sender: sender || currentUser,
        timestamp: Date.now(),
        type: type,
        expiresAt: Date.now() + CHAT_CONFIG.messageExpiry
    };
    
    messages.push(message);
    
    // Limit max messages
    if (messages.length > CHAT_CONFIG.maxMessages) {
        messages.shift();
    }
    
    saveMessages(messages);
    
    // Broadcast to other tabs (for multi-tab support)
    broadcastMessage(message);
    
    return message;
}

/**
 * Clean up expired messages
 */
function cleanupExpiredMessages() {
    const messages = getMessages();
    const now = Date.now();
    
    const validMessages = messages.filter(msg => msg.expiresAt > now);
    
    if (validMessages.length !== messages.length) {
        saveMessages(validMessages);
        console.log(`[SYSTEM] Cleaned up ${messages.length - validMessages.length} expired messages`);
        
        // Reload messages if some were deleted
        if (validMessages.length < messages.length) {
            loadMessages();
            showToast(`${messages.length - validMessages.length} expired messages deleted`, 'success');
        }
    }
    
    return validMessages;
}

/**
 * Clear all messages
 */
function clearAllMessages() {
    localStorage.removeItem(CHAT_CONFIG.storageKey);
    chatMessages.innerHTML = '';
    
    // Add system message
    addSystemMessage('All messages have been cleared by ' + currentUser);
    
    messageCount = 0;
    updateStats();
    showToast('All messages cleared');
}

// ========================================
// MESSAGE DISPLAY
// ========================================

/**
 * Create message element
 */
function createMessageElement(message) {
    const isOwn = message.sender === currentUser;
    const isSystem = message.type === 'system';
    
    if (isSystem) {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.innerHTML = `
            <span class="timestamp">[${formatTime(message.timestamp)}]</span>
            <span class="message-content">${escapeHtml(message.content)}</span>
        `;
        return div;
    }
    
    const div = document.createElement('div');
    div.className = `message ${isOwn ? 'own' : ''}`;
    div.dataset.messageId = message.id;
    
    div.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${escapeHtml(message.sender)}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="message-content">${escapeHtml(message.content)}</div>
    `;
    
    return div;
}

/**
 * Display a message
 */
function displayMessage(message, scroll = true) {
    const messageEl = createMessageElement(message);
    chatMessages.appendChild(messageEl);
    
    if (scroll) {
        scrollToBottom();
    }
    
    messageCount++;
    updateStats();
}

/**
 * Load all messages
 */
function loadMessages() {
    chatMessages.innerHTML = '';
    
    // Add welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'system-message';
    welcomeDiv.innerHTML = `
        <span class="timestamp">[SYSTEM]</span>
        <span class="message-content">
            Welcome to HACKER CHAT v2.0.4<br>
            Connection established. Encryption: AES-256-GCM<br>
            All messages are stored locally and will be automatically deleted after 24 hours.<br>
            Type /help for available commands.
        </span>
    `;
    chatMessages.appendChild(welcomeDiv);
    
    // Load stored messages
    const messages = getMessages();
    messages.forEach(msg => {
        displayMessage(msg, false);
    });
    
    scrollToBottom();
    messageCount = messages.length;
    updateStats();
}

/**
 * Add system message
 */
function addSystemMessage(content) {
    const message = addMessage(content, 'SYSTEM', 'system');
    displayMessage(message);
}

/**
 * Scroll to bottom of chat
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// COMMANDS
// ========================================

const commands = {
    '/help': {
        description: 'Show available commands',
        execute: () => {
            const helpText = `
Available Commands:
/help - Show this help message
/clear - Clear chat history
/stats - Show chat statistics
/time - Show current time
/users - Show online users
/me <action> - Send action message
/quit - Logout from system

Shortcuts:
↑ - Previous message
↓ - Next message
Ctrl+L - Clear screen
            `;
            addSystemMessage(helpText);
        }
    },
    '/clear': {
        description: 'Clear chat history',
        execute: () => {
            clearAllMessages();
        }
    },
    '/stats': {
        description: 'Show chat statistics',
        execute: () => {
            const messages = getMessages();
            const stats = `
Chat Statistics:
Total Messages: ${messages.length}
Session Uptime: ${formatUptime(uptime)}
Storage Used: ${(JSON.stringify(messages).length / 1024).toFixed(2)} KB
Message Expiry: 24 hours
            `;
            addSystemMessage(stats);
        }
    },
    '/time': {
        description: 'Show current time',
        execute: () => {
            addSystemMessage(`Current time: ${formatDate(Date.now())} ${formatTime(Date.now())}`);
        }
    },
    '/users': {
        description: 'Show online users',
        execute: () => {
            addSystemMessage(`Online users: ${currentUser} (You)`);
        }
    },
    '/quit': {
        description: 'Logout from system',
        execute: () => {
            addSystemMessage(`${currentUser} has disconnected.`);
            setTimeout(logout, 1000);
        }
    }
};

/**
 * Process command
 */
function processCommand(input) {
    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    if (commands[cmd]) {
        commands[cmd].execute(args);
        return true;
    }
    
    // Handle /me command
    if (cmd === '/me') {
        addMessage(`* ${currentUser} ${args}`, 'ACTION', 'action');
        loadMessages();
        return true;
    }
    
    return false;
}

// ========================================
// MESSAGE HANDLING
// ========================================

/**
 * Send message
 */
function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    // Check if it's a command
    if (content.startsWith('/')) {
        if (processCommand(content)) {
            messageInput.value = '';
            return;
        }
    }
    
    // Add message
    const message = addMessage(content);
    displayMessage(message);
    
    // Clear input
    messageInput.value = '';
    
    // Simulate typing indicator for other users (visual effect)
    showTypingIndicator();
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    typingIndicator.textContent = '';
    clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 1000);
}

/**
 * Broadcast message to other tabs
 */
function broadcastMessage(message) {
    // Use storage event to notify other tabs
    localStorage.setItem('hackerChat_broadcast', JSON.stringify({
        message: message,
        timestamp: Date.now()
    }));
}

/**
 * Listen for messages from other tabs
 */
function setupBroadcastListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'hackerChat_broadcast') {
            try {
                const data = JSON.parse(e.newValue);
                if (data.message && data.message.sender !== currentUser) {
                    // Message from another tab
                    displayMessage(data.message);
                    playNotificationSound();
                }
            } catch (err) {
                console.error('Error parsing broadcast:', err);
            }
        }
    });
}

// ========================================
// STATS & UPDATES
// ========================================

/**
 * Update statistics display
 */
function updateStats() {
    messageCountEl.textContent = messageCount;
}

/**
 * Format uptime
 */
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Update clock
 */
function updateClock() {
    clockEl.textContent = formatTime(Date.now());
}

/**
 * Update uptime
 */
function updateUptime() {
    uptime++;
    uptimeEl.textContent = formatUptime(uptime);
}

// ========================================
// MATRIX BACKGROUND
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

function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Clear chat button
    clearChatBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all messages?')) {
            clearAllMessages();
        }
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to disconnect?')) {
            addSystemMessage(`${currentUser} has disconnected.`);
            setTimeout(logout, 500);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+L to clear screen
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            chatMessages.innerHTML = '';
        }
    });
    
    // Focus input on load
    messageInput.focus();
    
    // Keep focus on input when clicking chat area
    chatMessages.addEventListener('click', () => {
        messageInput.focus();
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check session
    if (!checkSession()) {
        return;
    }
    
    // Initialize UI
    updateUserInterface();
    
    // Load messages
    loadMessages();
    
    // Setup listeners
    setupEventListeners();
    setupBroadcastListener();
    
    // Initialize matrix background
    initMatrixBackground();
    
    // Start timers
    setInterval(updateClock, 1000);
    setInterval(updateUptime, 1000);
    setInterval(updateSessionExpiry, 1000);
    setInterval(cleanupExpiredMessages, CHAT_CONFIG.cleanupInterval);
    
    // Initial calls
    updateClock();
    updateSessionExpiry();
    
    // Welcome message
    setTimeout(() => {
        addSystemMessage(`User ${currentUser} has joined the channel.`);
    }, 1000);
    
    console.log('%c[SYSTEM] HACKER CHAT v2.0.4 - Connected', 'color: #00ff41; font-size: 14px;');
    console.log('%c[USER] ' + currentUser, 'color: #00ffff; font-size: 12px;');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Could send disconnect message here
});

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    // Uncomment to show confirmation dialog
    // e.preventDefault();
    // e.returnValue = '';
});

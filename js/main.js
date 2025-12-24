/* ===================================
   MAIN.JS - Core Utilities & Helpers
   Shared functions used across all pages
   =================================== */

// ===================================
// MODAL CONTROLS
// ===================================

/**
 * Open a modal by ID
 * @param {string} modalId - The ID of the modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // SOUND: Play click sound if available
        if (window.clickSound) {
            window.clickSound.currentTime = 0;
            window.clickSound.play();
        }
    }
}

/**
 * Close a modal by ID
 * @param {string} modalId - The ID of the modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        // SOUND: Play click sound if available
        if (window.clickSound) {
            window.clickSound.currentTime = 0;
            window.clickSound.play();
        }
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

/**
 * Setup modal close on outside click
 */
function setupModalClickOutside() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===================================
// SOUND EFFECTS SYSTEM
// ===================================

/**
 * Play a sound effect
 * @param {string} soundId - ID of the audio element
 */
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => {
            console.log('Sound play failed:', err);
        });
    }
}

/**
 * Add sound effects to all interactive elements
 */
function initializeSoundEffects() {
    // Hover sound for buttons
    document.querySelectorAll('button, .btn, .action-btn').forEach(element => {
        element.addEventListener('mouseenter', () => {
            playSound('hoverSound');
        });
        
        element.addEventListener('click', () => {
            playSound('clickSound');
        });
    });
}

// ===================================
// NOTIFICATION SYSTEM
// ===================================

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - Type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #8a7a5e;
        color: #f4e4c1;
        font-family: 'Spectral', serif;
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 0 30px rgba(138, 122, 94, 0.5);
    `;
    
    // Type-specific colors
    if (type === 'success') notification.style.borderColor = '#27ae60';
    if (type === 'error') notification.style.borderColor = '#e74c3c';
    if (type === 'warning') notification.style.borderColor = '#f1c40f';
    
    // Add to page
    document.body.appendChild(notification);
    
    // Play notification sound
    playSound('notificationSound');
    
    // Remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ===================================
// CONFIRMATION DIALOG
// ===================================

/**
 * Show a confirmation dialog
 * @param {string} message - The message to display
 * @param {function} onConfirm - Callback if user confirms
 * @param {function} onCancel - Callback if user cancels
 */
function showConfirmDialog(message, onConfirm, onCancel) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: rgba(10, 10, 10, 0.95);
        border: 3px solid #8a7a5e;
        padding: 30px;
        max-width: 500px;
        text-align: center;
        box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
    `;
    
    // Message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        color: #f4e4c1;
        font-family: 'Spectral', serif;
        font-size: 16px;
        margin-bottom: 30px;
        line-height: 1.6;
    `;
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
    `;
    
    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.className = 'btn btn-success';
    confirmBtn.onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };
    
    // Assemble dialog
    buttonsContainer.appendChild(confirmBtn);
    buttonsContainer.appendChild(cancelBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonsContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    });
}

// ===================================
// NUMBER FORMATTING
// ===================================

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format money with $ symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted money string
 */
function formatMoney(amount) {
    return '$' + amount.toLocaleString();
}

/**
 * Abbreviate large numbers (1000 -> 1K, 1000000 -> 1M)
 * @param {number} num - Number to abbreviate
 * @returns {string} Abbreviated number
 */
function abbreviateNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ===================================
// DATE & TIME UTILITIES
// ===================================

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Get time difference in readable format
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Time difference (e.g., "5 minutes ago")
 */
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return days + ' day' + (days > 1 ? 's' : '') + ' ago';
    if (hours > 0) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    if (minutes > 0) return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
    return 'Just now';
}

// ===================================
// RANDOM UTILITIES
// ===================================

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===================================
// STRING UTILITIES
// ===================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

// ===================================
// VALIDATION UTILITIES
// ===================================

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===================================
// LOCAL STORAGE HELPERS
// ===================================

/**
 * Save data to localStorage with JSON encoding
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

/**
 * Load data from localStorage with JSON decoding
 * @param {string} key - Storage key
 * @returns {*} Stored data or null
 */
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from storage:', error);
        return null;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
}

// ===================================
// SCREEN NAVIGATION
// ===================================

/**
 * Navigate to another page with fade effect
 * @param {string} url - URL to navigate to
 */
function navigateWithFade(url) {
    document.body.style.transition = 'opacity 0.5s';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

// ===================================
// INITIALIZATION
// ===================================

/**
 * Initialize main utilities when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup modal click outside to close
    setupModalClickOutside();
    
    // Initialize sound effects
    initializeSoundEffects();
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

/**
 * Add keyboard shortcut
 * @param {string} key - Key to bind (e.g., 'Escape', 'Enter')
 * @param {function} callback - Function to call
 */
function addKeyboardShortcut(key, callback) {
    document.addEventListener('keydown', (e) => {
        if (e.key === key) {
            callback(e);
        }
    });
}

// Add ESC to close modals
addKeyboardShortcut('Escape', () => {
    closeAllModals();
});

// ===================================
// EXPORTS (Make functions available globally)
// ===================================

window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.playSound = playSound;
window.showNotification = showNotification;
window.showConfirmDialog = showConfirmDialog;
window.formatNumber = formatNumber;
window.formatMoney = formatMoney;
window.abbreviateNumber = abbreviateNumber;
window.formatDate = formatDate;
window.getTimeAgo = getTimeAgo;
window.randomInt = randomInt;
window.randomChoice = randomChoice;
window.shuffleArray = shuffleArray;
window.capitalize = capitalize;
window.truncate = truncate;
window.isEmpty = isEmpty;
window.isValidEmail = isValidEmail;
window.saveToStorage = saveToStorage;
window.loadFromStorage = loadFromStorage;
window.removeFromStorage = removeFromStorage;
window.navigateWithFade = navigateWithFade;
window.addKeyboardShortcut = addKeyboardShortcut;
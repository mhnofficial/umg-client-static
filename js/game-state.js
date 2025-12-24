// js/game-state.js - Global Game State Management (Client-side)

// This file is now primarily responsible for holding client-side state 
// derived from the authoritative server state, and updating the UI based on that.

// The global authoritative state is held in window.gameState (managed by game-core.js)

// The old single-player 'gameState' object is replaced by the server's authoritative state.

/**
 * Updates the statistics panel based on the current player's stats received from the server.
 * This is called by window.updateGameState in js/game-core.js.
 * @param {object} stats - The stats object for the local player.
 */
function updateStatsDisplay(stats) {
    if (!stats) return;

    const elements = {
        money: document.getElementById('money'),
        population: document.getElementById('population'),
        territories: document.getElementById('territories'),
        military: document.getElementById('military'),
        allies: document.getElementById('allies'),
        income: document.getElementById('income')
    };
    
    // Note: The structure of the stats object must match what the server sends
    if (elements.money) elements.money.textContent = `$${stats.money.toLocaleString()}`;
    if (elements.population) elements.population.textContent = stats.population.toLocaleString();
    if (elements.territories) elements.territories.textContent = stats.territories;
    if (elements.military) elements.military.textContent = stats.military;
    if (elements.allies) elements.allies.textContent = stats.allies;
    if (elements.income) elements.income.textContent = `+$${stats.income}`;
}

/**
 * Adds an event message to the log.
 * The server is now the source of truth for the current day/turn.
 * @param {string} message - The event message.
 */
function addEvent(message) {
    const eventLog = document.getElementById('eventLog');
    if (!eventLog) return;
    
    const currentDay = window.gameState?.currentDay || 1; // Use server-side day if available
    
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `
        <span class="event-day">Day ${currentDay}</span>
        <span class="event-message">${message}</span>
    `;
    
    eventLog.insertBefore(eventDiv, eventLog.firstChild);
    
    // Keep only last 10 events
    while (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

// --- UI Utility Exports ---
// These functions are pure UI interactions and can remain, but they must not contain game logic.

function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function playSound(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// --- Deprecated Multiplayer Functions (Removed: saveGameState, loadGameState, quitGame, nextTurn, startTurnLoop, initGameState) ---

// Export necessary functions globally
if (typeof window !== 'undefined') {
    // Expose the core update functions needed by other client files (or the HTML script block)
    window.updateStatsDisplay = updateStatsDisplay;
    window.addEvent = addEvent;
    
    // Expose UI functions
    window.openSettings = openSettings;
    window.closeModal = closeModal;
    window.openModal = openModal;
    window.playSound = playSound;
}

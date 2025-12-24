// ===================================
// GAME-STATE.JS - Global Game State Management
// ===================================

const gameState = {
    currentTurn: 1,
    playerNation: {
        name: '',
        description: '',
        money: 5000,
        population: 10000,
        military: 20,
        territories: 1,
        allies: 0,
        income: 500,
        populationGrowth: 100
    },
    gameStarted: false,
    isPaused: false
};

// Initialize game state
function initGameState(nationName, nationDesc, startingTerritory) {
    gameState.playerNation.name = nationName;
    gameState.playerNation.description = nationDesc;
    gameState.gameStarted = true;
    
    // Calculate income from territory
    const terrainData = TERRAIN_TYPES[startingTerritory.terrain];
    gameState.playerNation.income = terrainData.income;
    
    console.log('✅ Game state initialized:', nationName);
    
    // Update UI
    updateStatsDisplay();
    
    // Start AI nations
    generateAINations(5).then(() => {
        startAITurnLoop();
    });
    
    // Start turn loop
    startTurnLoop();
}

// Update stats display
function updateStatsDisplay() {
    const elements = {
        money: document.getElementById('money'),
        population: document.getElementById('population'),
        territories: document.getElementById('territories'),
        military: document.getElementById('military'),
        allies: document.getElementById('allies'),
        income: document.getElementById('income')
    };
    
    if (elements.money) elements.money.textContent = `$${gameState.playerNation.money.toLocaleString()}`;
    if (elements.population) elements.population.textContent = gameState.playerNation.population.toLocaleString();
    if (elements.territories) elements.territories.textContent = gameState.playerNation.territories;
    if (elements.military) elements.military.textContent = gameState.playerNation.military;
    if (elements.allies) elements.allies.textContent = gameState.playerNation.allies;
    if (elements.income) elements.income.textContent = `+$${gameState.playerNation.income}`;
}

// Start turn loop
function startTurnLoop() {
    setInterval(() => {
        if (!gameState.isPaused && gameState.gameStarted) {
            nextTurn();
        }
    }, 10000); // 10 seconds per turn
}

// Advance to next turn
function nextTurn() {
    gameState.currentTurn++;
    
    // Apply income
    gameState.playerNation.money += gameState.playerNation.income;
    
    // Apply population growth
    gameState.playerNation.population += gameState.playerNation.populationGrowth;
    
    // Update UI
    updateStatsDisplay();
    
    const gameTime = document.getElementById('gameTime');
    if (gameTime) {
        gameTime.textContent = `Day ${gameState.currentTurn}`;
    }
    
    addEvent(`🌅 Turn ${gameState.currentTurn} begins`);
}

// Add event to log
function addEvent(message) {
    const eventLog = document.getElementById('eventLog');
    if (!eventLog) return;
    
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `
        <span class="event-day">Day ${gameState.currentTurn}</span>
        <span class="event-message">${message}</span>
    `;
    
    eventLog.insertBefore(eventDiv, eventLog.firstChild);
    
    // Keep only last 10 events
    while (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

// Save game state
function saveGameState() {
    const saveData = {
        gameState: gameState,
        worldMap: {
            territories: worldMap.territories,
            width: worldMap.width,
            height: worldMap.height
        },
        aiNations: AI_NATIONS_STATE.nations,
        inventions: inventionState?.inventions || []
    };
    
    // Note: Since we can't use localStorage in artifacts, this would need to be
    // implemented by the user in their own environment
    console.log('Game state to save:', saveData);
    alert('Save feature coming soon! (localStorage not available in this environment)');
}

// Load game state
function loadGameState() {
    alert('Load feature coming soon!');
}

// Quit game
function quitGame() {
    if (confirm('Are you sure you want to quit? Progress will be lost.')) {
        window.location.href = 'index.html';
    }
}

// Open settings
function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Play sound
function playSound(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.initGameState = initGameState;
    window.updateStatsDisplay = updateStatsDisplay;
    window.nextTurn = nextTurn;
    window.addEvent = addEvent;
    window.saveGameState = saveGameState;
    window.loadGameState = loadGameState;
    window.quitGame = quitGame;
    window.openSettings = openSettings;
    window.closeModal = closeModal;
    window.openModal = openModal;
    window.playSound = playSound;
}
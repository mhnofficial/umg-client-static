// js/game-core.js - CORE CLIENT LOGIC AND UI BINDINGS

// =========================================================================
// 1. NETWORK CALLBACK FUNCTIONS
//   These functions are called directly by the network bridge (js/server.js)
//   when it receives a message from the Node.js server.
// =========================================================================

// Global store for the local player ID and the authoritative game state
window.playerID = null;
window.gameState = {}; // Will store the full game state from the server

/**
 * Handles system messages, connection errors, and successful connection logs.
 * This function is used by js/server.js's internal error/status handler.
 * It calls the lower-level addChatMessage function defined in server-game.html's script block.
 * @param {string} text - The message content.
 * @param {string} type - 'system', 'chat', or 'error'.
 */
window.logMessage = function(text, type = 'system') {
    // Check if the base function (addChatMessage) is available (defined in the HTML script block)
    const statusDiv = document.getElementById('connectionStatus');
    const statusIndicator = statusDiv ? statusDiv.querySelector('span:first-child') : null;
    const statusText = statusDiv ? statusDiv.querySelector('span:last-child') : null;

    if (typeof addChatMessage === 'function') {
        const author = (type === 'chat' ? '' : 'System');
        addChatMessage(author, text, type === 'system' || type === 'error');
        
        // Also update the visual connection status indicator
        if (statusDiv) {
            if (text.includes('Connected to game server.')) {
                statusDiv.classList.remove('disconnected');
                statusDiv.classList.add('connected');
                if (statusIndicator) statusIndicator.style.background = '#27ae60';
                if (statusText) statusText.textContent = 'Connected';
            } else if (text.includes('Disconnected from game server') || type === 'error') {
                statusDiv.classList.remove('connected');
                statusDiv.classList.add('disconnected');
                if (statusIndicator) statusIndicator.style.background = '#e74c3c';
                if (statusText) statusText.textContent = 'Disconnected';
            }
        }
    } else {
        console.warn('logMessage called, but addChatMessage is not defined in the HTML.');
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
};


/**
 * Called when the client successfully joins the server and receives initial data.
 * **(Renamed from handleWelcome to match common Socket.IO naming)**
 * @param {object} initialState - Initial data bundle containing { server, playerID, players, gameData, worldMap }.
 */
window.handleInitialState = function(initialState) {
    console.log("handleInitialState: Received initial data.", initialState);
    
    // Store authoritative data globally
    window.gameState = initialState;
    window.playerID = initialState.playerID; // Save the ID assigned by the server

    window.logMessage('Received initial game state. Game loaded.', 'system');

    // 1. Update Server Info Display
    if (typeof updateServerInfo === 'function' && initialState.server) {
        updateServerInfo(initialState.server); // Defined in server-game.html
    }
    
    // 2. Update all UI elements using the complete state
    window.updateGameState(initialState);
};


/**
 * The main update loop handler. Called by js/server.js every time the server
 * sends a full, authoritative game state update.
 * @param {object} newState - The complete, current game state object.
 */
window.updateGameState = function(newState) {
    console.log('updateGameState: Received new game state.', newState);
    
    // Always store the latest authoritative state
    window.gameState = newState;
    const localPlayer = newState.players[window.playerID];

    // --- UI UPDATES ---

    // 1. Update Player List (Defined in the HTML script block)
    if (typeof updatePlayersList === 'function' && newState.players) {
        updatePlayersList(newState.players);
    }
    
    // 2. Update Game Time and Phase
    const gameTime = document.getElementById('gameTime');
    if (gameTime && newState.currentDay) {
        gameTime.textContent = `Day ${newState.currentDay} • Multiplayer`;
    }

    // 3. Update Local Player Stats (if the player object exists in the update)
    if (localPlayer) {
        // Update Nation Name
        const nationNameDisplay = document.getElementById('nationNameDisplay');
        if (nationNameDisplay) nationNameDisplay.textContent = localPlayer.name;

        // Update Stats Panel
        if (typeof updateStatsDisplay === 'function') {
             // Pass the stats data from the localPlayer object to the function defined in game-state.js
             updateStatsDisplay(localPlayer.stats); 
        }
        
        // Update Turn Indicator
        const turnIndicator = document.getElementById('turnIndicator');
        const isMyTurn = newState.currentTurnPlayerId === window.playerID;
        if (turnIndicator) {
             turnIndicator.classList.toggle('active', isMyTurn);
             turnIndicator.textContent = isMyTurn ? 'YOUR TURN' : `${newState.players[newState.currentTurnPlayerId].name}'s TURN`;
        }
    }
    
    // 4. Redraw Map/Game Visualization (Placeholder for your map logic)
    if (typeof drawGameMap === 'function' && newState.worldMap) {
        drawGameMap(newState.worldMap, newState.players); 
    }
};

// =========================================================================
// 2. ACTION HANDLING HELPERS
// =========================================================================

// Exposing the network emitter (defined in js/server.js) globally for use by action buttons
window.sendActionToNetwork = window.sendActionToNetwork || function(actionData) {
     console.error("sendActionToNetwork not available. Check js/server.js load order.");
};

window.sendChatMessageToNetwork = window.sendChatMessageToNetwork || function(message) {
     console.error("sendChatMessageToNetwork not available. Check js/server.js load order.");
};

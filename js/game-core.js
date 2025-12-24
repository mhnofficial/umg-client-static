// js/game-core.js - CORE CLIENT LOGIC AND UI BINDINGS

// =========================================================================
// 1. NETWORK CALLBACK FUNCTIONS
//    These functions are called directly by the network bridge (js/server.js)
//    when it receives a message from the Node.js server.
// =========================================================================

/**
 * Handles system messages, connection errors, and successful connection logs.
 * This function is used by js/server.js's internal error/status handler.
 * It calls the lower-level addChatMessage function defined in server-game.html's script block.
 * * @param {string} text - The message content.
 * @param {string} type - 'system', 'chat', or 'error'.
 */
window.logMessage = function(text, type = 'system') {
    // Check if the base function (addChatMessage) is available (defined in the HTML script block)
    if (typeof addChatMessage === 'function') {
        const author = (type === 'chat' ? '' : 'System');
        addChatMessage(author, text, type === 'system' || type === 'error');
        
        // Also update the visual connection status indicator
        const statusDiv = document.getElementById('connectionStatus');
        const statusIndicator = statusDiv ? statusDiv.querySelector('span:first-child') : null;
        const statusText = statusDiv ? statusDiv.querySelector('span:last-child') : null;

        if (statusDiv) {
            if (text.includes('Connected to server successfully')) {
                statusDiv.classList.remove('disconnected');
                statusDiv.classList.add('connected');
                if (statusIndicator) statusIndicator.style.background = '#27ae60';
                if (statusText) statusText.textContent = 'Connected';
            } else if (text.includes('Connection Error:') || text.includes('Connection failed')) {
                statusDiv.classList.remove('connected');
                statusDiv.classList.add('disconnected');
                if (statusIndicator) statusIndicator.style.background = '#e74c3c';
                if (statusText) statusText.textContent = 'Failed';
            }
        }
    } else {
        console.warn('logMessage called, but addChatMessage is not defined in the HTML.');
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
};


/**
 * Called when the client successfully joins the server and receives initial data.
 * This is the function the network connection error reported was missing!
 * * @param {object} data - Initial data bundle containing server, player, and game info.
 */
window.handleWelcome = function(data) {
    console.log("handleWelcome: Received initial data.", data);

    // Call UI functions defined in the HTML script block
    if (typeof updateServerInfo === 'function') {
        updateServerInfo(data.server);
    }
    
    if (data.player) {
        const nationNameDisplay = document.getElementById('nationNameDisplay');
        if (nationNameDisplay) {
             nationNameDisplay.textContent = data.player.name;
        }
    }
    
    window.logMessage(`Welcome to ${data.server ? data.server.serverName : 'the server'}!`, 'system');
};


/**
 * The main update loop handler. Called by js/server.js every time the server
 * sends a full, authoritative game state update.
 * * @param {object} newState - The complete, current game state object.
 */
window.updateGameState = function(newState) {
    console.log('updateGameState: Received new game state.', newState);
    
    // ⚠️ IMPLEMENTATION REQUIRED HERE:
    // 1. Update global game state variable (if you use one, like window.serverState)
    // 2. Call updatePlayersList() (defined in the HTML script block)
    // 3. Update all your statistics (money, population, etc.)
    // 4. Redraw the map (the core game visualization)
    
    // Example: Update the game time display
    const gameTime = document.getElementById('gameTime');
    if (gameTime && newState.currentDay) {
         gameTime.textContent = `Day ${newState.currentDay} • Multiplayer`;
    }

    // Example: Update player stats if player data is available
    if (newState.playerData) {
        document.getElementById('money').textContent = `$${newState.playerData.money.toLocaleString()}`;
        document.getElementById('population').textContent = newState.playerData.population.toLocaleString();
        // ... (Update other stats)
    }
    
    // If you define updatePlayersList and updateServerInfo globally (which you did in the HTML script block), call them here:
    if (typeof updatePlayersList === 'function' && newState.players) {
        updatePlayersList(newState.players); // You might need to adjust how updatePlayersList expects data
    }
    
};

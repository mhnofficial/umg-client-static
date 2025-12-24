// js/server.js - Client-Side Network Bridge
// This script enables real-time communication between the browser (client) and the Node.js server.

let socket = null;
// ⚠️ CRITICAL: Replace with your actual deployed server URL when running online.
// For local testing, use 'http://localhost:3000' if your Node.js server is running on that port.
const SERVER_URL = 'http://localhost:3000'; 

// --- 1. CORE CONNECTION ---

/**
 * Establishes the WebSocket connection using Socket.IO.
 * Sets up listeners for core events like state updates and chat messages.
 */
function connectSocket() {
    if (socket && socket.connected) return socket;
    
    // Connect to the Node.js server
    socket = io(SERVER_URL);
    
    socket.on('connect', () => {
        console.log('Connected to server successfully.');
    });

    socket.on('connect_error', (err) => {
        console.error('Connection Error:', err.message);
        // logMessage is a function assumed to be in server-game.html
        if (typeof window.logMessage === 'function') {
            window.logMessage('Connection failed. Server might be offline or URL is wrong.', 'error');
        }
    });

    // --- 2. GAME LOBBY LISTENERS (Used by server-pick.html) ---
    
    // Server sends the list of available games
    socket.on('serverList', (servers) => {
        // displayServers is a function defined in server-pick.html
        if (typeof window.displayServers === 'function') {
            window.displayServers(servers);
        }
    });

    // --- 3. GAME ROOM LISTENERS (Used by server-game.html) ---

    // Initial state received right after joining a game room
    socket.on('initialState', (state) => {
        console.log('Received initial game state.');
        // updateGameState is a function defined in server-game.html
        if (typeof window.updateGameState === 'function') {
            window.updateGameState(state);
        }
    });

    // Full state update from the server after any player action
    socket.on('stateUpdate', (newState) => {
        console.log('Received state update from server.');
        if (typeof window.updateGameState === 'function') {
            window.updateGameState(newState);
        }
    });

    // Handle global chat messages
    socket.on('globalChat', (message, type = 'system') => {
        if (typeof window.logMessage === 'function') {
            window.logMessage(message, type);
        }
    });
    
    // Handle join failures
    socket.on('joinFailed', (message) => {
        alert('Failed to join server: ' + message);
        // Redirect back to server list on failure
        window.location.href = 'server-pick.html'; 
    });

    return socket;
}

// --- 4. EXPORTED FUNCTIONS CALLED BY HTML FILES ---

/**
 * Called by server-pick.html (Refresh button). Requests the server list.
 */
window.requestServerList = function() {
    connectSocket().emit('requestServerList');
}

/**
 * Called by server-pick.html (Join button). Attempts to join a specific server.
 */
window.joinServerNetwork = function(serverID, password) {
    connectSocket().emit('joinServer', { serverID, password });
}

/**
 * Called by server-create.html (Create button). Sends new server configuration to backend.
 */
window.createServerOnNetwork = function(serverData) {
    connectSocket().emit('createServer', serverData);
}

/**
 * Called by server-game.html (Action buttons, End Turn). Sends a player action to the server.
 */
window.sendActionToNetwork = function(actionData) {
    if (socket && socket.connected) {
        // actionData example: { type: 'CLAIM_TERRITORY', territoryId: 'T-01' }
        socket.emit('playerAction', actionData);
    } else {
        window.logMessage('Not connected to server. Action failed.', 'error');
    }
}

/**
 * Called by server-game.html (Chat input). Sends a chat message.
 */
window.sendChatMessageToNetwork = function(message) {
    if (socket && socket.connected) {
        socket.emit('chatMessage', message);
    }
}

/**
 * Called by server-game.html on load to ensure connection is open.
 */
window.initMultiplayerConnection = function() {
    connectSocket();
}
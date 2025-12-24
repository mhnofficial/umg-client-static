// js/server.js - Client-Side Network Bridge

// 🛑 STEP 1: CRITICALLY IMPORTANT! REPLACE THIS WITH YOUR LIVE RENDER URL!
// Example: const SERVER_URL = 'https://umg-multiplayer-server.onrender.com';
const SERVER_URL = 'https://umg-game-server.onrender.com'; 

// Initialize Socket.IO connection
const socket = io(SERVER_URL, {
    // Add a small timeout setting for debugging (though not strictly required)
    timeout: 10000 
});

// --- Utility Functions ---
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const serverID = getQueryParam('server');
// Use a generic placeholder name for joining since the client will update it later
const initialJoinData = {
    serverID: serverID,
    password: '', 
    hostName: 'GitHub Player' 
};
// ----------------------------

// --- SOCKET EVENT HANDLERS ---

// Event fired when the HTTP handshake fails or the server rejects the connection
socket.on('connect_error', (err) => {
    const errorReason = err.message || 'Unknown network error.'; 
    console.error("Socket.IO Connection Failed:", err);
    
    // Use the global function defined in server-game.html to display the error
    if (window.addChatMessage) {
        window.addChatMessage('System', `CONNECTION FAILED! Reason: ${errorReason}. Check console for details.`, true);
    }
    
    // Update the UI status to show definite failure
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusEl.querySelector('span:last-child').textContent = 'Disconnected: Error';
    }
});

// Event fired if the connection was established but then dropped
socket.on('disconnect', (reason) => {
    if (window.addChatMessage) {
        window.addChatMessage('System', `DISCONNECTED! Reason: ${reason}. Attempting to reconnect...`, true);
    }
    
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusEl.querySelector('span:last-child').textContent = 'Disconnected';
    }
});


socket.on('connect', () => {
    // 1. Connection to the socket bridge is established.
    if (window.logMessage) {
        window.logMessage('Successfully connected to server bridge.', 'system');
    }
    
    // 2. Now, try to join the game room using the ID from the URL
    if (serverID) {
        socket.emit('joinServer', initialJoinData);
        window.logMessage(`Attempting to join server: ${serverID}...`, 'system');
        
        // Update UI to show tentative connection status
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.classList.remove('disconnected');
            statusEl.classList.add('connected');
            statusEl.querySelector('span:last-child').textContent = 'Connected (Joining...)';
        }
    } else {
        window.logMessage('Connected to server bridge, but no server ID provided in URL.', 'system');
    }
});


// [1] Initial State from Server (Success)
socket.on('initialState', (data) => {
    window.logMessage('Joined server successfully!', 'system');
    window.handleWelcome(data); // Calls function in js/game-core.js
    
    // Final UI update after successful join
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('disconnected');
        statusEl.classList.add('connected');
        statusEl.querySelector('span:last-child').textContent = 'Connected';
    }
});

// [2] State Updates
socket.on('stateUpdate', (newState) => {
    window.updateGameState(newState); // Calls function in js/game-core.js
});

// [3] Global Chat
socket.on('globalChat', (text, type) => {
    window.logMessage(text, type); // Calls function in js/game-core.js
});

// [4] Join Failed
socket.on('joinFailed', (reason) => {
    window.logMessage(`Join failed: ${reason}`, 'error');
    
    // Set UI back to disconnected state
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusEl.querySelector('span:last-child').textContent = `Join Failed`;
    }
});


// --- EXPORTED FUNCTIONS (for actions) ---

window.sendChatMessageToNetwork = function(message) {
    socket.emit('chatMessage', message);
};

window.sendActionToNetwork = function(action) {
    socket.emit('playerAction', action);
};

window.requestServerList = function() {
    socket.emit('requestServerList');
};

window.createServer = function(data) {
    socket.emit('createServer', data);
};

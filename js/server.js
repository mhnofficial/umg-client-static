// js/server.js - Client-Side Network Bridge

// 🛑 STEP 1: CRITICALLY IMPORTANT! This is your live Render URL.
const SERVER_URL = 'https://umg-game-server.onrender.com'; 

// Initialize Socket.IO connection
// CRITICAL FIX: Forces the client to use HTTP Polling first to bypass cloud hosting restrictions.
const socket = io(SERVER_URL, {
    timeout: 10000, 
    transports: ['polling'] 
});

// --- Utility Functions ---
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const serverID = getQueryParam('server');
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
    
    // Uses the function defined in the HTML file's script block
    if (window.addChatMessage) {
        window.addChatMessage('System', `CONNECTION FAILED! Reason: ${errorReason}. Check browser console for details.`, true);
    }
    
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
    // This relies on window.logMessage being defined in the HTML file before this script runs.
    if (window.logMessage) {
        window.logMessage('Successfully connected to server bridge.', 'system');
    }
    
    // 2. Now, try to join the game room using the ID from the URL
    if (serverID) {
        socket.emit('joinServer', initialJoinData);
        if (window.logMessage) {
             window.logMessage(`Attempting to join server: ${serverID}...`, 'system');
        }
       
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.classList.remove('disconnected');
            statusEl.classList.add('connected');
            statusEl.querySelector('span:last-child').textContent = 'Connected (Joining...)';
        }
    } else {
        if (window.logMessage) {
            window.logMessage('Connected to server bridge, but no server ID provided in URL.', 'system');
        }
    }
});


// [1] Initial State from Server (Success)
socket.on('initialState', (data) => {
    if (window.logMessage) {
        window.logMessage('Joined server successfully!', 'system');
    }
    // This relies on window.handleWelcome being defined in js/game-core.js
    if (window.handleWelcome) {
        window.handleWelcome(data);
    }
    
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('disconnected');
        statusEl.classList.add('connected');
        statusEl.querySelector('span:last-child').textContent = 'Connected';
    }
});

// [2] State Updates
socket.on('stateUpdate', (newState) => {
    if (window.updateGameState) {
        window.updateGameState(newState);
    }
});

// [3] Global Chat
socket.on('globalChat', (text, type) => {
    if (!window.addChatMessage) return;

    if (type === 'system' || type === 'error') {
         window.addChatMessage('System', text, true);
    } else {
        const parts = text.split(': ', 2);
        const author = parts[0] || 'Unknown';
        const message = parts[1] || text;
        window.addChatMessage(author, message, false);
    }
});

// [4] Join Failed
socket.on('joinFailed', (reason) => {
    if (window.logMessage) {
        window.logMessage(`Join failed: ${reason}`, 'error');
    }
    
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusEl.querySelector('span:last-child').textContent = `Join Failed`;
    }
});

// [5] Server List
socket.on('serverList', (servers) => {
    if (window.updateServerListUI) {
        window.updateServerListUI(servers);
    }
});

// [6] Server Created
socket.on('serverCreated', (newServerID) => {
    window.location.href = `server-game.html?server=${newServerID}`;
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

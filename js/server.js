// js/server.js (Client-side logic)

// --- Configuration ---
// IMPORTANT: Replace this with your actual Render server URL
const SERVER_URL = "https://umg-game-server.onrender.com"; 
// ---------------------

let socket;
let isConnected = false;

// Helper to get URL query parameters
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Global functions (stubs for the browser/game pages to call)
window.logMessage = window.logMessage || console.log;
window.addChatMessage = window.addChatMessage || function(text, author, type) { 
    console.log(`[${type}] ${author}: ${text}`);
};

/**
 * Initiates the Socket.IO connection.
 */
function initializeSocket() {
    // Avoid double connection
    if (socket && isConnected) return;

    socket = io(SERVER_URL, {
        reconnectionAttempts: 5,
        timeout: 5000,
        // Enforce polling first to bypass common firewall/network issues
        transports: ['polling', 'websocket'] 
    });

    // --- Socket Event Handlers ---

    socket.on('connect', () => {
        isConnected = true;
        logMessage("Connected to game server.", 'system');

        // Check if we are on the game page (indicated by 'server' URL param)
        const serverID = getQueryParam('server');
        const playerName = getQueryParam('name') || 'Guest';

        if (serverID) {
            // Automatically try to join if the URL contains a server ID
            const initialJoinData = {
                serverID: serverID,
                hostName: playerName,
                password: '' // Assume no password for auto-join, unless handled differently
            };
            socket.emit('joinServer', initialJoinData);
        } else if (typeof window.requestServerList === 'function' && window.location.pathname.includes('server-browser.html')) {
             // If we are on the server browser page, request the list immediately
             window.requestServerList();
        }
    });

    socket.on('disconnect', () => {
        isConnected = false;
        logMessage("Disconnected from game server. Attempting to reconnect...", 'error');
    });

    socket.on('connect_error', (error) => {
        logMessage(`Connection Error: ${error.message}`, 'error');
    });

    // --- Custom Game Server Events ---

    // 1. RECEIVE SERVER LIST (For server-browser.html)
    socket.on('serverList', (servers) => {
        logMessage(`Received ${servers.length} active servers.`);
        // This function is defined in server-browser.html to update the UI
        if (typeof window.displayServers === 'function') {
            window.displayServers(servers);
        }
    });

    // 2. SERVER CREATED SUCCESS (For server-create.html)
    socket.on('serverCreated', (serverID) => {
        logMessage(`Successfully created server: ${serverID}. Redirecting...`, 'system');
        
        // Host should immediately join the game room after creation
        const hostName = document.getElementById('hostName')?.value || 'Host';
        
        // This initiates the join process, which the server will then handle
        const initialJoinData = {
            serverID: serverID,
            hostName: hostName,
            password: '' // Password already checked on creation, but can be passed for server verification
        };
        socket.emit('joinServer', initialJoinData);

        // Redirect the user to the game page after creation
        // Note: The hostName is passed in the URL for the next page to use
        window.location.href = `server-game.html?server=${serverID}&name=${encodeURIComponent(hostName)}`;
    });

    // 3. JOIN FAILED (For both browser and game pages)
    socket.on('joinFailed', (message) => {
        logMessage(`Join failed: ${message}`, 'error');
        alert(`Failed to join server: ${message}`);
        
        // If join fails on server-game.html, send them back to the browser
        if (window.location.pathname.includes('server-game.html')) {
             window.location.href = 'server-browser.html';
        }
    });

    // 4. INITIAL GAME STATE (For server-game.html)
    socket.on('initialState', (gameState) => {
        logMessage('Received initial game state. Game loaded.', 'system');
        // This function is expected to be defined in server-game.html
        if (typeof window.handleInitialState === 'function') {
            window.handleInitialState(gameState);
        }
    });

    // 5. GAME STATE UPDATES (For server-game.html)
    socket.on('stateUpdate', (newState) => {
        // This function is expected to be defined in server-game.html
        if (typeof window.updateGameState === 'function') {
            window.updateGameState(newState);
        }
    });

    // 6. GLOBAL CHAT/SYSTEM MESSAGES
    socket.on('globalChat', (message, type) => {
        // This function is expected to be defined in server-game.html (or browser for system messages)
        if (typeof window.addChatMessage === 'function') {
            window.addChatMessage(message, 'System', type);
        }
    });
}

// Initialize the socket when the script loads
initializeSocket();


// ----------------------------------------------------------------------
// --- FUNCTIONS EXPOSED TO THE CLIENT HTML (server-browser.html, etc.) ---
// ----------------------------------------------------------------------

/**
 * Public function to request the list of active servers from the backend.
 * Called by server-browser.html.
 */
window.requestServerList = function() {
    if (isConnected) {
        // Emit an event the backend server.js must listen for.
        socket.emit('requestServerList');
    } else {
        logMessage("Not connected to server. Please wait or refresh.", 'error');
    }
};

/**
 * Public function to create a new server instance on the network.
 * Called by server-create.html.
 * @param {Object} serverData - All settings from the create form.
 */
window.createServerOnNetwork = function(serverData) {
    if (isConnected) {
        // Emit the event with all the detailed server settings.
        socket.emit('createServer', serverData);
    } else {
        logMessage("Not connected to server. Cannot create game.", 'error');
    }
};

/**
 * Public function to join an existing server.
 * Called by server-browser.html after selecting a server (and entering password).
 * @param {string} serverID - The unique ID of the server to join.
 * @param {string} [password=''] - The password if the server is private.
 */
window.joinServerNetwork = function(serverID, password = '') {
    const playerName = document.getElementById('hostName')?.value || 'Guest'; // Try to get name if available
    
    if (!serverID) {
        logMessage("Error: Missing Server ID.", 'error');
        return;
    }
    
    if (isConnected) {
        const joinData = {
            serverID: serverID,
            hostName: playerName,
            password: password 
        };
        // Emit the event to the backend server.js
        socket.emit('joinServer', joinData);
    } else {
        logMessage("Not connected to server. Cannot join game.", 'error');
        alert("Server connection failed. Please try refreshing the page.");
    }
};

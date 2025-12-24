// ===================================
// WS-CLIENT.JS - WebSocket Client Connection
// This connects your HTML pages to the Node.js server
// ===================================

let serverSocket = null;
let serverState = {
    connected: false,
    serverId: null,
    playerData: null,
    isHost: false,
    players: [],
    currentServer: null
};

// ===================================
// CONNECT TO SERVER
// ===================================
function connectToServer() {
    return new Promise((resolve, reject) => {
        try {
            serverSocket = new WebSocket('ws://localhost:8080');
            
            serverSocket.onopen = () => {
                console.log('✅ Connected to game server');
                serverState.connected = true;
                updateConnectionStatus(true);
                resolve();
            };
            
            serverSocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleServerMessage(message);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };
            
            serverSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                serverState.connected = false;
                updateConnectionStatus(false);
            };
            
            serverSocket.onclose = () => {
                console.log('🔴 Disconnected from server');
                serverState.connected = false;
                updateConnectionStatus(false);
            };
            
        } catch (error) {
            console.error('Failed to connect:', error);
            reject(error);
        }
    });
}

// ===================================
// HANDLE SERVER MESSAGES
// ===================================
function handleServerMessage(message) {
    console.log('📨 Server message:', message.type);
    
    switch (message.type) {
        case 'welcome':
            handleWelcome(message);
            break;
            
        case 'serverList':
            handleServerList(message);
            break;
            
        case 'serverCreated':
            handleServerCreated(message);
            break;
            
        case 'playerJoined':
            handlePlayerJoined(message);
            break;
            
        case 'playerLeft':
            handlePlayerLeft(message);
            break;
            
        case 'chat':
            handleChatMessage(message);
            break;
            
        case 'turnUpdate':
            handleTurnUpdate(message);
            break;
            
        case 'gameAction':
            handleGameAction(message);
            break;
            
        case 'error':
            console.error('Server error:', message.message);
            alert('Server Error: ' + message.message);
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

// ===================================
// MESSAGE HANDLERS
// ===================================
function handleWelcome(data) {
    console.log('Welcome to server:', data);
    
    serverState.serverId = data.server?.id;
    serverState.playerData = data.player;
    serverState.isHost = data.isHost || false;
    serverState.players = data.players || [];
    serverState.currentServer = data.server;
    
    if (typeof updatePlayersList === 'function') {
        updatePlayersList();
    }
    
    if (typeof updateServerInfo === 'function' && data.server) {
        updateServerInfo(data.server);
    }
}

function handleServerList(data) {
    console.log('Received server list:', data.servers.length, 'servers');
    
    if (typeof displayServers === 'function') {
        displayServers(data.servers);
    }
}

function handleServerCreated(data) {
    console.log('Server created:', data.server);
    alert('Server created successfully!');
}

function handlePlayerJoined(data) {
    console.log('Player joined:', data.player);
    
    if (!serverState.players.find(p => p.id === data.player.id)) {
        serverState.players.push(data.player);
    }
    
    if (typeof updatePlayersList === 'function') {
        updatePlayersList();
    }
    
    if (typeof addChatMessage === 'function') {
        addChatMessage('System', `${data.player.name} joined the game`, true);
    }
}

function handlePlayerLeft(data) {
    console.log('Player left:', data.playerName);
    
    serverState.players = serverState.players.filter(p => p.id !== data.playerId);
    
    if (typeof updatePlayersList === 'function') {
        updatePlayersList();
    }
    
    if (typeof addChatMessage === 'function') {
        addChatMessage('System', `${data.playerName} left the game`, true);
    }
}

function handleChatMessage(data) {
    if (typeof addChatMessage === 'function') {
        addChatMessage(data.author, data.message, false);
    }
}

function handleTurnUpdate(data) {
    if (typeof updateTurn === 'function') {
        updateTurn(data.turn);
    }
}

function handleGameAction(data) {
    console.log('Game action:', data.action, 'by', data.playerName);
    
    if (typeof addEvent === 'function') {
        addEvent(`${data.playerName} performed action: ${data.action}`);
    }
}

// ===================================
// UPDATE CONNECTION STATUS UI
// ===================================
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.className = 'connection-status connected';
        statusEl.innerHTML = `
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27ae60;margin-right:8px;"></span>
            <span>Connected</span>
        `;
    } else {
        statusEl.className = 'connection-status disconnected';
        statusEl.innerHTML = `
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#e74c3c;margin-right:8px;"></span>
            <span>Disconnected</span>
        `;
    }
}

// ===================================
// CLIENT FUNCTIONS (called from UI)
// ===================================

// Request server list
function requestServerList() {
    if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }
    
    serverSocket.send(JSON.stringify({
        type: 'getServerList'
    }));
}

// Create server
function createServerOnNetwork(serverData) {
    if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }
    
    serverSocket.send(JSON.stringify({
        type: 'createServer',
        serverData: serverData
    }));
}

// Join server
function joinServerNetwork(serverId, password = null) {
    if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }
    
    const playerData = {
        id: 'player_' + Date.now(),
        name: prompt('Enter your name:') || 'Player'
    };
    
    serverSocket.send(JSON.stringify({
        type: 'joinServer',
        serverId: serverId,
        password: password,
        playerData: playerData
    }));
}

// Send chat message
function sendGlobalChat() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }
    
    serverSocket.send(JSON.stringify({
        type: 'chat',
        author: serverState.playerData?.name || 'Player',
        message: message,
        playerId: serverState.playerData?.id
    }));
    
    input.value = '';
}

// End turn
function endTurn() {
    if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) {
        console.error('Not connected to server');
        return;
    }
    
    serverSocket.send(JSON.stringify({
        type: 'endTurn',
        playerId: serverState.playerData?.id
    }));
    
    if (typeof addEvent === 'function') {
        addEvent('⏭️ Turn ended');
    }
}

// Leave server
function leaveServer() {
    if (confirm('Are you sure you want to leave the server?')) {
        if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
            serverSocket.send(JSON.stringify({
                type: 'leave'
            }));
        }
        
        setTimeout(() => {
            window.location.href = 'server-pick.html';
        }, 500);
    }
}

// ===================================
// AUTO-CONNECT ON PAGE LOAD
// ===================================
window.addEventListener('load', () => {
    // Only connect on server-related pages
    const isServerPage = window.location.pathname.includes('server-pick') ||
                        window.location.pathname.includes('server-game') ||
                        window.location.pathname.includes('server-create');
    
    if (isServerPage) {
        console.log('🌐 Attempting to connect to server...');
        connectToServer().catch(error => {
            console.error('Failed to connect to server:', error);
            alert('Cannot connect to game server. Make sure the server is running with: node server.js');
        });
    }
});

// Export for global use
window.serverSocket = serverSocket;
window.serverState = serverState;
window.connectToServer = connectToServer;
window.requestServerList = requestServerList;
window.createServerOnNetwork = createServerOnNetwork;
window.joinServerNetwork = joinServerNetwork;
window.sendGlobalChat = sendGlobalChat;
window.endTurn = endTurn;
window.leaveServer = leaveServer;
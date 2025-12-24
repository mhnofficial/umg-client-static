/* ===================================
   ACTIONS/WAR.JS - War & Battle System
   =================================== */

// Declare war
window.declareWar = function() {
    const targetId = document.getElementById('warTarget').value;
    const message = document.getElementById('warMessage').value;
    
    if (!targetId) {
        showNotification('Please select a target nation!', 'warning');
        return;
    }
    
    const target = getAINation(targetId);
    if (!target) return;
    
    // Check if already at war
    if (gameState.player.wars.includes(targetId)) {
        showNotification('Already at war with this nation!', 'warning');
        return;
    }
    
    // Check if allied
    if (gameState.player.allies.includes(targetId)) {
        showNotification('Cannot declare war on an ally! Break alliance first.', 'error');
        return;
    }
    
    // Declare war
    gameState.player.wars.push(targetId);
    modifyRelation(targetId, -50);
    
    // Play sound
    if (window.warSound) {
        warSound.currentTime = 0;
        warSound.play();
    }
    
    // Add event
    addEvent(`⚔️ War declared on ${target.name}!`);
    showNotification(`War declared on ${target.name}!`, 'error', 4000);
    
    // AI response
    setTimeout(() => {
        const response = aiRespondToWar(target, gameState.player);
        addEvent(`💬 ${target.name}: ${response.message}`);
    }, 2000);
    
    // Start war mechanics
    initiateWar(targetId);
    
    // Update UI
    updateAllUI();
    renderAINations();
    closeModal('warModal');
}

// Initiate war mechanics
function initiateWar(targetId) {
    // Schedule battles
    const warInterval = setInterval(() => {
        if (!gameState.player.wars.includes(targetId)) {
            clearInterval(warInterval);
            return;
        }
        
        conductBattle(targetId);
    }, 15000); // Battle every 15 seconds
    
    // Store interval for cleanup
    if (!gameState.warIntervals) gameState.warIntervals = {};
    gameState.warIntervals[targetId] = warInterval;
}

// Conduct battle
function conductBattle(targetId) {
    const target = getAINation(targetId);
    if (!target) return;
    
    const playerStrength = gameState.player.military;
    const enemyStrength = target.military;
    
    // Calculate battle outcome
    const playerAdvantage = playerStrength / (playerStrength + enemyStrength);
    const battleRoll = Math.random();
    
    if (battleRoll < playerAdvantage) {
        // Player wins
        const casualties = Math.floor(Math.random() * 5) + 3;
        target.military -= casualties;
        gameState.player.military -= Math.floor(casualties / 2);
        
        addEvent(`⚔️ Victory in battle against ${target.name}! Enemy casualties: ${casualties}`);
        
        // Chance to capture territory
        if (target.territories.length > 0 && Math.random() > 0.7) {
            captureTerritoryFromAI(target);
        }
    } else {
        // Player loses
        const casualties = Math.floor(Math.random() * 8) + 5;
        gameState.player.military -= casualties;
        target.military -= Math.floor(casualties / 3);
        
        addEvent(`⚔️ Defeat in battle against ${target.name}! Your casualties: ${casualties}`);
        
        // Lose money
        const moneyLost = Math.floor(Math.random() * 500) + 200;
        gameState.player.money -= moneyLost;
        addEvent(`💰 War costs: -$${moneyLost.toLocaleString()}`);
    }
    
    // Check if war should end
    if (gameState.player.military < 10) {
        addEvent(`⚠️ Military too weak! Forced peace with ${target.name}.`);
        makePeace(targetId);
    }
    
    if (target.military < 10 && target.territories.length === 0) {
        addEvent(`🎉 ${target.name} has been defeated!`);
        makePeace(targetId);
    }
    
    updateAllUI();
}

// Capture territory from AI
function captureTerritoryFromAI(target) {
    if (target.territories.length === 0) return;
    
    // Take one territory
    const territoryId = target.territories.pop();
    const territory = gameState.map.territories.find(t => t.id === territoryId);
    
    if (territory) {
        territory.owner = 'player';
        gameState.player.territories++;
        
        territory.cells.forEach(cellId => {
            const cell = gameState.map.cells[cellId];
            if (cell) cell.owner = 'player';
        });
        
        addEvent(`🗺️ Captured territory from ${target.name}!`);
        updateIncome();
    }
}

// Make peace / end war
window.makePeace = function(targetId) {
    const index = gameState.player.wars.indexOf(targetId);
    if (index === -1) return false;
    
    gameState.player.wars.splice(index, 1);
    modifyRelation(targetId, 30);
    
    // Clear war interval
    if (gameState.warIntervals && gameState.warIntervals[targetId]) {
        clearInterval(gameState.warIntervals[targetId]);
        delete gameState.warIntervals[targetId];
    }
    
    // Track peace count for tasks
    gameState.player.peaceCount = (gameState.player.peaceCount || 0) + 1;
    
    const target = getAINation(targetId);
    if (target) {
        addEvent(`🕊️ Peace treaty signed with ${target.name}`);
        showNotification(`Peace restored with ${target.name}`, 'success');
    }
    
    updateAllUI();
    renderAINations();
    return true;
}

// Propose truce (from modal)
window.proposeTruce = function() {
    const targetId = document.getElementById('truceTarget').value;
    
    if (!targetId) {
        showNotification('Select a nation!', 'warning');
        return;
    }
    
    const target = getAINation(targetId);
    if (!target) return;
    
    if (!gameState.player.wars.includes(targetId)) {
        showNotification('Not at war with this nation!', 'warning');
        return;
    }
    
    // AI decides
    const accepts = aiRespondToTruce(target, gameState.player);
    
    if (accepts) {
        makePeace(targetId);
        showNotification(`${target.name} accepted the truce!`, 'success');
    } else {
        addEvent(`${target.name} rejected your truce offer!`);
        showNotification(`${target.name} rejected your truce!`, 'error');
    }
    
    closeModal('truceModal');
}

// War statistics
function getWarStats() {
    return {
        activeWars: gameState.player.wars.length,
        military: gameState.player.military,
        warsWon: gameState.player.warsWon || 0,
        warsLost: gameState.player.warsLost || 0,
        territoriesCaptured: gameState.player.territoriesCaptured || 0
    };
}

// Export functions
window.getWarStats = getWarStats;
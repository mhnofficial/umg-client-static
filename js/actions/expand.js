/* ===================================
   ACTIONS/EXPAND.JS - Territory Expansion
   =================================== */

// Calculate expansion cost
function getExpansionCost() {
    const baseCost = 3000;
    const territoriesOwned = gameState.player.territories;
    
    // Cost increases exponentially
    return Math.floor(baseCost * Math.pow(1.5, territoriesOwned - 1));
}

// Find expandable territories
function getExpandableTerritories() {
    if (!gameState.map || !gameState.map.territories) return [];
    
    const playerTerritories = gameState.map.territories.filter(t => t.owner === 'player');
    const expandable = [];
    
    // Find unclaimed territories adjacent to player's territories
    gameState.map.territories.forEach(territory => {
        if (territory.claimed || territory.size === 'huge') return;
        
        // Check if adjacent to player territory
        const isAdjacent = territory.cells.some(cellId => {
            const cell = gameState.map.cells[cellId];
            if (!cell) return false;
            
            return cell.neighbors.some(neighborId => {
                const neighbor = gameState.map.cells[neighborId];
                return neighbor && neighbor.owner === 'player';
            });
        });
        
        if (isAdjacent) {
            expandable.push(territory);
        }
    });
    
    return expandable;
}

// ===================================
// EXPAND LAND
// ===================================
window.expandLand = function() {
    const cost = getExpansionCost();
    
    // Check if can afford
    if (gameState.player.money < cost) {
        showNotification(`Need $${cost.toLocaleString()} to expand territory!`, 'error');
        return;
    }
    
    // Find expandable territories
    const expandable = getExpandableTerritories();
    
    if (expandable.length === 0) {
        showNotification('No adjacent territories available for expansion!', 'warning');
        return;
    }
    
    // Show expansion options
    showExpansionModal(expandable, cost);
}

// ===================================
// EXPANSION MODAL
// ===================================
function showExpansionModal(territories, cost) {
    // Create modal dynamically
    let modal = document.getElementById('expansionModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'expansionModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const territoriesHTML = territories.slice(0, 5).map((territory, index) => {
        return `
            <div class="upgrade-item" style="cursor: pointer;" onclick="selectExpansionTerritory(${index})">
                <div>
                    <strong>🗺️ ${territory.id.replace('country_', 'Territory ')}</strong><br>
                    <small>Size: ${capitalize(territory.size)} | Terrain: ${capitalize(territory.terrain)}</small><br>
                    <small style="color: #3498db;">Cells: ${territory.cells.length}</small>
                </div>
                <div>
                    <button class="upgrade-btn">
                        Select
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal('expansionModal')">&times;</span>
            <h2>🗺️ Expand Territory</h2>
            <p style="color: #f1c40f; font-size: 18px; margin-bottom: 20px;">
                Cost: $${cost.toLocaleString()}
            </p>
            <p style="margin-bottom: 20px;">Select an adjacent territory to claim:</p>
            ${territoriesHTML}
            ${territories.length > 5 ? `<p style="color: #8a7a5e; margin-top: 15px;">...and ${territories.length - 5} more options</p>` : ''}
        </div>
    `;
    
    // Store territories for selection
    window.currentExpansionTerritories = territories;
    window.currentExpansionCost = cost;
    
    modal.classList.add('active');
}

// ===================================
// SELECT & CLAIM TERRITORY
// ===================================
window.selectExpansionTerritory = function(index) {
    const territories = window.currentExpansionTerritories;
    const cost = window.currentExpansionCost;
    
    if (!territories || index >= territories.length) return;
    
    const territory = territories[index];
    
    // Deduct cost
    gameState.player.money -= cost;
    
    // Claim territory
    territory.claimed = true;
    territory.owner = 'player';
    gameState.player.territories++;
    
    // Update cells
    territory.cells.forEach(cellId => {
        const cell = gameState.map.cells[cellId];
        if (cell) {
            cell.owner = 'player';
            cell.claimed = true;
        }
    });
    
    // Play sound
    if (window.upgradeSound) {
        upgradeSound.currentTime = 0;
        upgradeSound.play();
    }
    
    // Update UI
    updateAllUI();
    updateIncome();
    renderGameMap();
    
    // Add event
    addEvent(`🗺️ Expanded into ${territory.id.replace('country_', 'Territory ')}!`);
    showNotification(`Territory claimed! Now controlling ${gameState.player.territories} territories.`, 'success', 4000);
    
    // Close modal
    closeModal('expansionModal');
}

// ===================================
// AUTO EXPANSION (AI feature)
// ===================================
function attemptAutoExpansion() {
    const expandable = getExpandableTerritories();
    if (expandable.length === 0) return false;
    
    const cost = getExpansionCost();
    if (gameState.player.money < cost * 2) return false; // Keep reserve
    
    // Auto-expand if affordable and beneficial
    if (Math.random() > 0.9) { // 10% chance per check
        const territory = expandable[0];
        
        gameState.player.money -= cost;
        territory.claimed = true;
        territory.owner = 'player';
        gameState.player.territories++;
        
        territory.cells.forEach(cellId => {
            const cell = gameState.map.cells[cellId];
            if (cell) {
                cell.owner = 'player';
                cell.claimed = true;
            }
        });
        
        updateIncome();
        addEvent(`🗺️ Peacefully expanded into new territory!`);
        return true;
    }
    
    return false;
}

// ===================================
// EXPANSION STATS
// ===================================
function getExpansionStats() {
    return {
        currentTerritories: gameState.player.territories,
        expandableTerritories: getExpandableTerritories().length,
        nextExpansionCost: getExpansionCost(),
        territoryValue: gameState.player.territories * 1000
    };
}

// Helper function
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export functions
window.getExpansionCost = getExpansionCost;
window.getExpandableTerritories = getExpandableTerritories;
window.getExpansionStats = getExpansionStats;
window.attemptAutoExpansion = attemptAutoExpansion;
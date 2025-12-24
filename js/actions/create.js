/* ===================================
   ACTIONS/CREATE.JS - Building System
   =================================== */

// Structure definitions
const STRUCTURES = [
    {
        name: 'Farm',
        icon: '🌾',
        cost: 500,
        benefit: 'Produces food and increases population growth',
        effect: () => {
            gameState.player.populationGrowthBonus = (gameState.player.populationGrowthBonus || 0) + 0.0003;
        }
    },
    {
        name: 'Factory',
        icon: '🏭',
        cost: 1500,
        benefit: 'Generates +$150 income per day',
        effect: () => {
            updateIncome();
        }
    },
    {
        name: 'Mine',
        icon: '⛏️',
        cost: 1200,
        benefit: 'Provides raw materials and +$80 income',
        effect: () => {
            updateIncome();
        }
    },
    {
        name: 'Port',
        icon: '⚓',
        cost: 2000,
        benefit: 'Enables trade bonuses and +$100 income',
        effect: () => {
            gameState.player.tradeBonus = (gameState.player.tradeBonus || 1) * 1.1;
            updateIncome();
        }
    },
    {
        name: 'Barracks',
        icon: '🏰',
        cost: 1800,
        benefit: 'Trains military units (+10 strength)',
        effect: () => {
            gameState.player.military += 10;
        }
    },
    {
        name: 'Research Lab',
        icon: '🔬',
        cost: 2500,
        benefit: 'Speeds up inventions and research',
        effect: () => {
            gameState.player.researchSpeed = (gameState.player.researchSpeed || 1) * 1.2;
        }
    },
    {
        name: 'Market',
        icon: '🏪',
        cost: 1000,
        benefit: 'Increases trade income by 15%',
        effect: () => {
            gameState.player.tradeBonus = (gameState.player.tradeBonus || 1) * 1.15;
            updateIncome();
        }
    },
    {
        name: 'School',
        icon: '🎓',
        cost: 1500,
        benefit: 'Increases population growth and research',
        effect: () => {
            gameState.player.populationGrowthBonus = (gameState.player.populationGrowthBonus || 0) + 0.0002;
            gameState.player.researchSpeed = (gameState.player.researchSpeed || 1) * 1.1;
        }
    },
    {
        name: 'Hospital',
        icon: '🏥',
        cost: 2000,
        benefit: 'Significantly increases population growth',
        effect: () => {
            gameState.player.populationGrowthBonus = (gameState.player.populationGrowthBonus || 0) + 0.0005;
        }
    },
    {
        name: 'Temple',
        icon: '⛪',
        cost: 1800,
        benefit: 'Improves happiness and population loyalty',
        effect: () => {
            gameState.player.happiness = (gameState.player.happiness || 50) + 5;
        }
    },
    {
        name: 'Wall',
        icon: '🧱',
        cost: 2500,
        benefit: 'Increases defense (+15 military strength)',
        effect: () => {
            gameState.player.military += 15;
            gameState.player.defense = (gameState.player.defense || 0) + 20;
        }
    },
    {
        name: 'Library',
        icon: '📚',
        cost: 1200,
        benefit: 'Boosts research and cultural development',
        effect: () => {
            gameState.player.researchSpeed = (gameState.player.researchSpeed || 1) * 1.15;
            gameState.player.culture = (gameState.player.culture || 0) + 10;
        }
    }
];

// ===================================
// RENDER STRUCTURE OPTIONS
// ===================================
function renderStructureOptions() {
    const container = document.getElementById('structureOptions');
    if (!container) return;
    
    const structureHTML = STRUCTURES.map((structure, index) => {
        const canAfford = gameState.player.money >= structure.cost;
        const count = gameState.player.structures.filter(s => s === structure.name).length;
        
        return `
            <div class="structure-option">
                <div class="structure-info">
                    <strong>${structure.icon} ${structure.name}</strong>
                    ${count > 0 ? `<span style="color: #3498db; margin-left: 10px;">(${count} built)</span>` : ''}
                    <br>
                    <small>${structure.benefit}</small>
                </div>
                <div>
                    <span class="structure-cost">$${structure.cost.toLocaleString()}</span>
                    <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="buildStructure(${index})">
                        Build
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = structureHTML;
}

// ===================================
// BUILD STRUCTURE
// ===================================
window.buildStructure = function(structureIndex) {
    const structure = STRUCTURES[structureIndex];
    
    // Check if can afford
    if (gameState.player.money < structure.cost) {
        showNotification('Not enough money!', 'error');
        return;
    }
    
    // Build structure
    gameState.player.money -= structure.cost;
    gameState.player.structures.push(structure.name);
    
    // Apply effects
    structure.effect();
    
    // Play sound
    if (window.clickSound) {
        clickSound.currentTime = 0;
        clickSound.play();
    }
    
    // Update UI
    updateAllUI();
    renderStructureOptions();
    
    // Add event
    addEvent(`🏗️ Built ${structure.name}!`);
    showNotification(`${structure.name} constructed!`, 'success');
}

// ===================================
// GET STRUCTURE COUNTS
// ===================================
function getStructureCount(structureName) {
    return gameState.player.structures.filter(s => s === structureName).length;
}

// ===================================
// GET TOTAL CONSTRUCTION COST
// ===================================
function getTotalConstructionValue() {
    return gameState.player.structures.reduce((total, structureName) => {
        const structure = STRUCTURES.find(s => s.name === structureName);
        return total + (structure ? structure.cost : 0);
    }, 0);
}

// Export functions
window.renderStructureOptions = renderStructureOptions;
window.getStructureCount = getStructureCount;
window.getTotalConstructionValue = getTotalConstructionValue;
window.STRUCTURES = STRUCTURES;
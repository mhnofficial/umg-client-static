/* ===================================
   UPGRADES.JS - Nation Upgrade System
   =================================== */

// Upgrade costs for each level (1-5)
const UPGRADE_COSTS = {
    government: [1000, 2500, 5000, 10000, 20000],
    agriculture: [800, 2000, 4000, 8000, 16000],
    military: [1500, 3000, 6000, 12000, 24000],
    landQuality: [1200, 2800, 5500, 11000, 22000],
    materials: [1000, 2400, 4800, 9600, 19200],
    income: [2000, 4000, 8000, 16000, 32000]
};

// Upgrade effects descriptions
const UPGRADE_EFFECTS = {
    government: {
        name: 'Government',
        icon: '🏛️',
        effects: [
            'Increases population growth',
            'Unlocks new diplomatic options',
            'Reduces corruption',
            'Improves efficiency',
            'Enables advanced policies'
        ]
    },
    agriculture: {
        name: 'Agriculture',
        icon: '🌾',
        effects: [
            'Increases food production',
            'Boosts population growth',
            'Reduces famine risk',
            'Enables crop variety',
            'Maximizes yield efficiency'
        ]
    },
    military: {
        name: 'Military',
        icon: '⚔️',
        effects: [
            'Increases army strength',
            'Improves defense',
            'Unlocks better weapons',
            'Enables special units',
            'Maximizes combat power'
        ]
    },
    landQuality: {
        name: 'Land Quality',
        icon: '🗺️',
        effects: [
            'Improves terrain fertility',
            'Increases resource output',
            'Enables better construction',
            'Unlocks new possibilities',
            'Maximizes land potential'
        ]
    },
    materials: {
        name: 'Materials',
        icon: '⚒️',
        effects: [
            'Increases resource gathering',
            'Unlocks better tools',
            'Improves construction',
            'Enables advanced crafting',
            'Maximizes production'
        ]
    },
    income: {
        name: 'Income',
        icon: '💰',
        effects: [
            'Increases tax revenue',
            'Boosts trade income',
            'Reduces expenses',
            'Unlocks investments',
            'Maximizes wealth generation'
        ]
    }
};

// ===================================
// RENDER UPGRADES UI
// ===================================
function renderUpgrades() {
    const container = document.getElementById('upgradeList');
    if (!container) return;
    
    const upgradeHTML = Object.keys(gameState.player.upgrades).map(upgradeType => {
        const currentLevel = gameState.player.upgrades[upgradeType];
        const maxLevel = 5;
        const isMaxLevel = currentLevel >= maxLevel;
        const cost = UPGRADE_COSTS[upgradeType][currentLevel - 1];
        const canAfford = gameState.player.money >= cost;
        const upgradeInfo = UPGRADE_EFFECTS[upgradeType];
        
        return `
            <div class="upgrade-item">
                <div class="upgrade-info">
                    <strong>${upgradeInfo.icon} ${upgradeInfo.name}</strong><br>
                    <small style="color: #d4c4a8;">Level ${currentLevel}/${maxLevel}</small><br>
                    <small style="color: #8a7a5e; font-style: italic;">${upgradeInfo.effects[currentLevel - 1]}</small>
                    ${currentLevel < maxLevel ? `<br><small style="color: #3498db;">Next: ${upgradeInfo.effects[currentLevel]}</small>` : ''}
                    <div class="upgrade-progress">
                        ${Array(maxLevel).fill('').map((_, i) => 
                            `<span class="progress-dot ${i < currentLevel ? 'filled' : ''}"></span>`
                        ).join('')}
                    </div>
                </div>
                <div>
                    ${isMaxLevel ? 
                        '<span style="color: #2ecc71; font-weight: bold;">MAX</span>' :
                        `<button class="upgrade-btn" ${!canAfford ? 'disabled' : ''} onclick="purchaseUpgrade('${upgradeType}')">
                            Upgrade<br>$${cost.toLocaleString()}
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = upgradeHTML;
    
    // Add CSS for progress dots
    if (!document.getElementById('upgradeProgressStyles')) {
        const style = document.createElement('style');
        style.id = 'upgradeProgressStyles';
        style.textContent = `
            .upgrade-progress {
                display: flex;
                gap: 5px;
                margin-top: 8px;
            }
            .progress-dot {
                width: 12px;
                height: 12px;
                border: 2px solid #8a7a5e;
                border-radius: 50%;
                display: inline-block;
            }
            .progress-dot.filled {
                background: #2ecc71;
                border-color: #27ae60;
                box-shadow: 0 0 8px rgba(46, 204, 113, 0.6);
            }
            .upgrade-info {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===================================
// PURCHASE UPGRADE
// ===================================
window.purchaseUpgrade = function(upgradeType) {
    const currentLevel = gameState.player.upgrades[upgradeType];
    const cost = UPGRADE_COSTS[upgradeType][currentLevel - 1];
    
    // Check if can afford
    if (gameState.player.money < cost) {
        showNotification('Not enough money!', 'error');
        return;
    }
    
    // Check max level
    if (currentLevel >= 5) {
        showNotification('Already at max level!', 'warning');
        return;
    }
    
    // Purchase upgrade
    gameState.player.money -= cost;
    gameState.player.upgrades[upgradeType]++;
    
    // Apply effects
    applyUpgradeEffects(upgradeType, currentLevel + 1);
    
    // Play sound
    if (window.upgradeSound) {
        upgradeSound.currentTime = 0;
        upgradeSound.play();
    }
    
    // Update UI
    updateAllUI();
    renderUpgrades();
    
    // Add event
    const upgradeName = UPGRADE_EFFECTS[upgradeType].name;
    addEvent(`⬆️ Upgraded ${upgradeName} to level ${currentLevel + 1}!`);
    
    showNotification(`${upgradeName} upgraded to level ${currentLevel + 1}!`, 'success');
}

// ===================================
// APPLY UPGRADE EFFECTS
// ===================================
function applyUpgradeEffects(upgradeType, newLevel) {
    switch (upgradeType) {
        case 'government':
            // Increase population growth multiplier
            gameState.player.populationGrowthBonus = (gameState.player.populationGrowthBonus || 0) + 0.0005;
            break;
            
        case 'agriculture':
            // Increase food production and population growth
            gameState.player.populationGrowthBonus = (gameState.player.populationGrowthBonus || 0) + 0.001;
            break;
            
        case 'military':
            // Increase military strength
            gameState.player.military += 10;
            break;
            
        case 'landQuality':
            // Increase resource gathering
            gameState.player.resourceBonus = (gameState.player.resourceBonus || 1) * 1.15;
            break;
            
        case 'materials':
            // Increase construction speed and resource gathering
            gameState.player.resourceBonus = (gameState.player.resourceBonus || 1) * 1.1;
            break;
            
        case 'income':
            // Increase income per day
            gameState.player.income += Math.floor(gameState.player.income * 0.25);
            break;
    }
}

// ===================================
// GET UPGRADE BONUS
// ===================================
function getUpgradeBonus(upgradeType) {
    const level = gameState.player.upgrades[upgradeType];
    return 1 + (level - 1) * 0.2; // 20% bonus per level
}

// ===================================
// EXPORT FUNCTIONS
// ===================================
window.renderUpgrades = renderUpgrades;
window.getUpgradeBonus = getUpgradeBonus;
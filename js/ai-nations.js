// ===================================
// AI-NATIONS.JS - AI Nation System
// Generates and manages AI-controlled nations
// ===================================

const AI_NATION_NAMES = [
    'Valoria', 'Ashford', 'Thornhaven', 'Silvermere', 'Ironhold',
    'Windcrest', 'Stormkeep', 'Goldspire', 'Ravenwood', 'Stonehearth',
    'Frostholm', 'Emberfall', 'Crystalvale', 'Shadowpeak', 'Brightwater'
];

const PERSONALITIES = {
    peaceful: {
        description: 'Prefers diplomacy and trade over conflict',
        warChance: 0.1,
        allianceChance: 0.7,
        tradeChance: 0.8
    },
    neutral: {
        description: 'Balanced approach to diplomacy and warfare',
        warChance: 0.3,
        allianceChance: 0.5,
        tradeChance: 0.6
    },
    aggressive: {
        description: 'Focused on military expansion and conquest',
        warChance: 0.6,
        allianceChance: 0.2,
        tradeChance: 0.3
    },
    merchant: {
        description: 'Heavily focused on trade and economic growth',
        warChance: 0.15,
        allianceChance: 0.6,
        tradeChance: 0.9
    }
};

const AI_NATIONS_STATE = {
    nations: [],
    relationships: {}
};

// ===================================
// GENERATE AI NATIONS
// ===================================
async function generateAINations(count = 5) {
    console.log(`🤖 Generating ${count} AI nations...`);
    
    AI_NATIONS_STATE.nations = [];
    
    // Get available territories
    const availableTerritories = worldMap.territories.filter(t => 
        !t.claimed && (t.size === 'small' || t.size === 'tiny')
    );
    
    if (availableTerritories.length < count) {
        console.warn(`Only ${availableTerritories.length} territories available for ${count} nations`);
        count = availableTerritories.length;
    }
    
    // Shuffle territories
    const shuffled = availableTerritories.sort(() => Math.random() - 0.5);
    
    // Create AI nations
    for (let i = 0; i < count; i++) {
        const territory = shuffled[i];
        const personality = ['peaceful', 'neutral', 'aggressive', 'merchant'][Math.floor(Math.random() * 4)];
        
        const nation = {
            id: `ai_${i}`,
            name: AI_NATION_NAMES[i % AI_NATION_NAMES.length],
            personality: personality,
            money: 5000 + Math.floor(Math.random() * 3000),
            population: 8000 + Math.floor(Math.random() * 5000),
            military: 15 + Math.floor(Math.random() * 15),
            territories: [territory.id],
            allies: [],
            wars: [],
            opinion: 50, // Opinion of player (0-100)
            relationshipStatus: 'neutral'
        };
        
        // Claim territory
        territory.claimed = true;
        territory.owner = nation.id;
        
        territory.cells.forEach(cellId => {
            const cell = worldMap.cells[cellId];
            if (cell) {
                cell.claimed = true;
                cell.owner = nation.id;
            }
        });
        
        AI_NATIONS_STATE.nations.push(nation);
        
        // Initialize relationships
        AI_NATIONS_STATE.relationships[nation.id] = {};
    }
    
    console.log(`✅ Generated ${AI_NATIONS_STATE.nations.length} AI nations`);
    
    // Render nations list
    if (typeof renderAINations === 'function') {
        renderAINations();
    }
    
    return AI_NATIONS_STATE.nations;
}

// ===================================
// RENDER AI NATIONS IN UI
// ===================================
function renderAINations() {
    const container = document.getElementById('nationsList');
    if (!container) return;
    
    if (AI_NATIONS_STATE.nations.length === 0) {
        container.innerHTML = '<p class="empty-text">No nations yet...</p>';
        return;
    }
    
    const nationsHTML = AI_NATIONS_STATE.nations.map(nation => {
        const personalityInfo = PERSONALITIES[nation.personality];
        const relationColor = getRelationshipColor(nation.relationshipStatus);
        
        return `
            <div class="nation-item" style="border-left: 3px solid ${relationColor};">
                <div class="nation-info">
                    <strong>${nation.name}</strong>
                    <small style="color: ${relationColor};">${nation.relationshipStatus}</small>
                </div>
                <div class="nation-stats">
                    <small>💰 $${abbreviateNumber(nation.money)}</small>
                    <small>⚔️ ${nation.military}</small>
                    <small>👥 ${abbreviateNumber(nation.population)}</small>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = nationsHTML;
}

// ===================================
// AI TURN LOOP
// ===================================
function startAITurnLoop() {
    setInterval(() => {
        if (!gameState.gameStarted) return;
        
        AI_NATIONS_STATE.nations.forEach(nation => {
            updateAINation(nation);
        });
        
        renderAINations();
    }, 10000); // AI acts every 10 seconds
}

// ===================================
// UPDATE AI NATION
// ===================================
function updateAINation(nation) {
    // Income
    nation.money += 300 + (nation.territories.length * 150);
    
    // Population growth
    nation.population += Math.floor(nation.population * 0.01);
    
    // Random AI actions based on personality
    const personality = PERSONALITIES[nation.personality];
    
    // War decision
    if (Math.random() < personality.warChance * 0.1 && nation.wars.length === 0) {
        // Consider declaring war
        if (nation.military > 30 && nation.money > 5000) {
            attemptAIWar(nation);
        }
    }
    
    // Alliance decision
    if (Math.random() < personality.allianceChance * 0.05 && nation.allies.length < 2) {
        attemptAIAlliance(nation);
    }
    
    // Military buildup
    if (nation.money > 3000) {
        const buildAmount = Math.floor(Math.random() * 5) + 1;
        nation.military += buildAmount;
        nation.money -= buildAmount * 100;
    }
}

// ===================================
// AI DIPLOMACY FUNCTIONS
// ===================================

// AI attempts to declare war
function attemptAIWar(nation) {
    if (Math.random() > 0.3) return; // 70% chance to not declare war
    
    // Declare war on player
    if (!nation.wars.includes('player') && nation.opinion < 30) {
        nation.wars.push('player');
        nation.relationshipStatus = 'war';
        
        if (!gameState.player.wars) gameState.player.wars = [];
        gameState.player.wars.push(nation.id);
        
        addEvent(`⚔️ ${nation.name} has declared war on you!`);
        showNotification(`${nation.name} declared war!`, 'error', 5000);
    }
}

// AI attempts to form alliance
function attemptAIAlliance(nation) {
    if (Math.random() > 0.2) return; // 80% chance to not propose
    
    // Propose alliance to player
    if (!nation.allies.includes('player') && nation.opinion > 60 && nation.relationshipStatus === 'neutral') {
        addEvent(`🤝 ${nation.name} proposes an alliance!`);
        showNotification(`${nation.name} wants to ally with you`, 'info', 4000);
        
        // Auto-accept for simplicity (can be made interactive)
        if (Math.random() > 0.5) {
            nation.allies.push('player');
            nation.relationshipStatus = 'allied';
            
            if (!gameState.player.allies) gameState.player.allies = [];
            gameState.player.allies.push(nation.id);
            
            addEvent(`🤝 Alliance formed with ${nation.name}!`);
        }
    }
}

// ===================================
// AI RESPONSE FUNCTIONS
// ===================================

// AI responds to alliance proposal
function aiRespondToAlliance(aiNation, player) {
    const personality = PERSONALITIES[aiNation.personality];
    
    let acceptChance = personality.allianceChance;
    
    // Modify based on opinion
    acceptChance += (aiNation.opinion - 50) / 100;
    
    // Already at war? Very unlikely
    if (aiNation.wars.includes('player')) {
        acceptChance -= 0.8;
    }
    
    return Math.random() < acceptChance;
}

// AI responds to trade proposal
function aiRespondToTrade(aiNation, tradeOffer, player) {
    const personality = PERSONALITIES[aiNation.personality];
    
    let acceptChance = personality.tradeChance;
    
    // Modify based on relationship
    if (aiNation.allies.includes('player')) {
        acceptChance += 0.2;
    }
    if (aiNation.wars.includes('player')) {
        acceptChance = 0;
    }
    
    return Math.random() < acceptChance;
}

// AI responds to war
function aiRespondToWar(aiNation, player) {
    const responses = {
        aggressive: [
            "You dare challenge us? We accept your declaration!",
            "War it is! Prepare for battle!",
            "Your aggression will be met with force!"
        ],
        peaceful: [
            "This is unfortunate... we hoped for peace.",
            "Very well, if war is what you seek...",
            "We will defend ourselves, though we wished otherwise."
        ],
        neutral: [
            "So be it. We are ready.",
            "War has been declared. We will respond.",
            "Your challenge is acknowledged."
        ],
        merchant: [
            "This will hurt both our economies!",
            "War is bad for business, but we'll defend ourselves.",
            "A costly decision for both of us."
        ]
    };
    
    const personality = aiNation.personality;
    const responseList = responses[personality] || responses.neutral;
    const message = responseList[Math.floor(Math.random() * responseList.length)];
    
    return { accepted: true, message: message };
}

// AI responds to truce
function aiRespondToTruce(aiNation, player) {
    // More likely to accept if losing
    const militaryRatio = aiNation.military / player.military;
    const acceptChance = militaryRatio < 0.8 ? 0.7 : 0.4;
    
    return Math.random() < acceptChance;
}

// Generate AI chat response (fallback)
function generateAIChatResponse(aiNation, playerMessage, player) {
    const personality = PERSONALITIES[aiNation.personality];
    
    const templates = {
        peaceful: [
            "We value peace and cooperation between our nations.",
            "Perhaps we can find common ground through dialogue.",
            "Trade and friendship benefit us both."
        ],
        aggressive: [
            "Strength is what matters in this world.",
            "We do not fear conflict.",
            "Your words mean little without power."
        ],
        neutral: [
            "We hear your words.",
            "Let us see where this leads.",
            "Actions speak louder than words."
        ],
        merchant: [
            "Business is always better than warfare.",
            "Profitable partnerships interest us.",
            "Gold speaks louder than swords."
        ]
    };
    
    const responses = templates[aiNation.personality] || templates.neutral;
    return responses[Math.floor(Math.random() * responses.length)];
}

// ===================================
// HELPER FUNCTIONS
// ===================================

// Get AI nation by ID
function getAINation(nationId) {
    return AI_NATIONS_STATE.nations.find(n => n.id === nationId);
}

// Modify relationship opinion
function modifyRelation(nationId, amount) {
    const nation = getAINation(nationId);
    if (!nation) return;
    
    nation.opinion = Math.max(0, Math.min(100, nation.opinion + amount));
    
    // Update relationship status based on opinion
    if (nation.opinion < 20) {
        nation.relationshipStatus = 'hostile';
    } else if (nation.opinion < 40) {
        nation.relationshipStatus = 'unfriendly';
    } else if (nation.opinion < 60) {
        nation.relationshipStatus = 'neutral';
    } else if (nation.opinion < 80) {
        nation.relationshipStatus = 'friendly';
    } else {
        nation.relationshipStatus = 'very friendly';
    }
}

// Check if allied
function isAllied(nationId) {
    return gameState.player.allies && gameState.player.allies.includes(nationId);
}

// Check if at war
function isAtWar(nationId) {
    return gameState.player.wars && gameState.player.wars.includes(nationId);
}

// Get relationship color
function getRelationshipColor(status) {
    const colors = {
        'allied': '#27ae60',
        'friendly': '#2ecc71',
        'very friendly': '#2ecc71',
        'neutral': '#95a5a6',
        'unfriendly': '#e67e22',
        'hostile': '#e74c3c',
        'war': '#c0392b'
    };
    return colors[status] || '#95a5a6';
}

// Abbreviate numbers
function abbreviateNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ===================================
// EXPORT FUNCTIONS
// ===================================
window.generateAINations = generateAINations;
window.renderAINations = renderAINations;
window.startAITurnLoop = startAITurnLoop;
window.getAINation = getAINation;
window.modifyRelation = modifyRelation;
window.isAllied = isAllied;
window.isAtWar = isAtWar;
window.aiRespondToAlliance = aiRespondToAlliance;
window.aiRespondToTrade = aiRespondToTrade;
window.aiRespondToWar = aiRespondToWar;
window.aiRespondToTruce = aiRespondToTruce;
window.generateAIChatResponse = generateAIChatResponse;
window.AI_NATIONS_STATE = AI_NATIONS_STATE;
window.PERSONALITIES = PERSONALITIES;
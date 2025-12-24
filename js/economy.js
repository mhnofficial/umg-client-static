/* ===================================
   ECONOMY.JS - Money & Resource System
   =================================== */

// Base income calculation
function calculateIncome() {
    let income = 500; // Base income
    
    // Territory bonus
    income += gameState.player.territories * 200;
    
    // Population bonus (per 1000 people)
    income += Math.floor(gameState.player.population / 1000) * 10;
    
    // Structure bonuses
    const factories = gameState.player.structures.filter(s => s === 'Factory').length;
    const ports = gameState.player.structures.filter(s => s === 'Port').length;
    const mines = gameState.player.structures.filter(s => s === 'Mine').length;
    
    income += factories * 150;
    income += ports * 100;
    income += mines * 80;
    
    // Upgrade bonuses
    const incomeUpgrade = gameState.player.upgrades.income;
    income = Math.floor(income * (1 + (incomeUpgrade - 1) * 0.25));
    
    // Alliance bonuses
    income += gameState.player.allies.length * 50;
    
    return Math.floor(income);
}

// Update income (call this when things change)
function updateIncome() {
    gameState.player.income = calculateIncome();
}

// Daily income distribution
function distributeDailyIncome() {
    const income = gameState.player.income;
    gameState.player.money += income;
    
    // Random bonus/penalty events
    if (Math.random() > 0.95) {
        const event = Math.random();
        if (event > 0.5) {
            const bonus = Math.floor(income * 0.5);
            gameState.player.money += bonus;
            addEvent(`💰 Trade surplus! +$${bonus.toLocaleString()}`);
        } else {
            const penalty = Math.floor(income * 0.3);
            gameState.player.money -= penalty;
            addEvent(`📉 Unexpected expenses. -$${penalty.toLocaleString()}`);
        }
    }
}

// Expense calculation
function calculateExpenses() {
    let expenses = 0;
    
    // Military upkeep
    expenses += gameState.player.military * 5;
    
    // Structure maintenance
    expenses += gameState.player.structures.length * 20;
    
    // Territory maintenance
    expenses += gameState.player.territories * 50;
    
    return Math.floor(expenses);
}

// Pay expenses
function payExpenses() {
    const expenses = calculateExpenses();
    gameState.player.money -= expenses;
    
    if (gameState.player.money < 0) {
        // Bankruptcy handling
        addEvent(`⚠️ Warning: Treasury is negative!`);
        
        // Reduce military if bankrupt
        if (gameState.player.money < -5000) {
            gameState.player.military = Math.max(10, gameState.player.military - 10);
            addEvent(`⚔️ Military reduced due to lack of funds!`);
        }
    }
}

// Resource system (for future expansion)
const RESOURCES = {
    food: { name: 'Food', icon: '🌾' },
    wood: { name: 'Wood', icon: '🪵' },
    stone: { name: 'Stone', icon: '🪨' },
    iron: { name: 'Iron', icon: '⚙️' },
    gold: { name: 'Gold', icon: '💎' }
};

function initializeResources() {
    if (!gameState.player.resources) {
        gameState.player.resources = {
            food: 100,
            wood: 50,
            stone: 30,
            iron: 20,
            gold: 10
        };
    }
}

function updateResources() {
    if (!gameState.player.resources) return;
    
    // Farms produce food
    const farms = gameState.player.structures.filter(s => s === 'Farm').length;
    gameState.player.resources.food += farms * 5;
    
    // Mines produce resources
    const mines = gameState.player.structures.filter(s => s === 'Mine').length;
    gameState.player.resources.stone += mines * 2;
    gameState.player.resources.iron += mines * 1;
    
    // Population consumes food
    const foodConsumption = Math.floor(gameState.player.population / 500);
    gameState.player.resources.food -= foodConsumption;
    
    // Check for food shortage
    if (gameState.player.resources.food < 0) {
        gameState.player.resources.food = 0;
        // Population growth penalty
        addEvent(`🌾 Food shortage! Population growth slowed.`);
    }
}

// Trade system helper
function getResourceValue(resource, amount) {
    const basePrices = {
        food: 5,
        wood: 8,
        stone: 10,
        iron: 15,
        gold: 50
    };
    
    return (basePrices[resource] || 10) * amount;
}

// Economy stats
function getEconomyStats() {
    return {
        income: gameState.player.income,
        expenses: calculateExpenses(),
        netIncome: gameState.player.income - calculateExpenses(),
        money: gameState.player.money,
        incomePerCapita: Math.floor(gameState.player.income / (gameState.player.population / 1000))
    };
}

// Initialize economy
function initializeEconomy() {
    updateIncome();
    initializeResources();
}

// Export functions
window.calculateIncome = calculateIncome;
window.updateIncome = updateIncome;
window.distributeDailyIncome = distributeDailyIncome;
window.calculateExpenses = calculateExpenses;
window.payExpenses = payExpenses;
window.updateResources = updateResources;
window.getResourceValue = getResourceValue;
window.getEconomyStats = getEconomyStats;
window.initializeEconomy = initializeEconomy;
window.RESOURCES = RESOURCES;
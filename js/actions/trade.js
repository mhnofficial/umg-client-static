/* ===================================
   ACTIONS/TRADE.JS - Trade System
   =================================== */

window.proposeTrade = function() {
    const targetId = document.getElementById('tradeTarget').value;
    const offering = document.getElementById('tradeOffer').value;
    const requesting = document.getElementById('tradeRequest').value;
    
    if (!targetId || !offering || !requesting) {
        showNotification('Fill all trade fields!', 'warning');
        return;
    }
    
    const target = getAINation(targetId);
    if (!target) return;
    
    // AI decides
    const accepts = aiRespondToTrade(target, { offering, requesting }, gameState.player);
    
    if (accepts) {
        // Process trade
        const tradeValue = Math.floor(Math.random() * 2000) + 1000;
        gameState.player.money += tradeValue;
        
        // Apply trade bonus
        const bonus = Math.floor(tradeValue * (gameState.player.tradeBonus || 1) - tradeValue);
        if (bonus > 0) {
            gameState.player.money += bonus;
            addEvent(`📦 Trade completed with ${target.name}! (+$${tradeValue.toLocaleString()} + $${bonus} bonus)`);
        } else {
            addEvent(`📦 Trade completed with ${target.name}! (+$${tradeValue.toLocaleString()})`);
        }
        
        showNotification(`Trade successful! +$${(tradeValue + bonus).toLocaleString()}`, 'success', 4000);
        
        // Improve relations
        modifyRelation(targetId, 10);
    } else {
        addEvent(`${target.name} rejected your trade offer.`);
        showNotification(`${target.name} rejected your trade.`, 'error');
    }
    
    closeModal('tradeModal');
    updateAllUI();
}

// Quick trade function
function conductQuickTrade(targetId) {
    const target = getAINation(targetId);
    if (!target) return;
    
    if (gameState.player.allies.includes(targetId)) {
        // Allied trade bonus
        const tradeIncome = Math.floor(Math.random() * 800) + 400;
        gameState.player.money += tradeIncome;
        addEvent(`📦 Allied trade with ${target.name}: +$${tradeIncome.toLocaleString()}`);
    }
}

// Export
window.conductQuickTrade = conductQuickTrade;
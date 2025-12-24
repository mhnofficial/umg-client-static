/* ===================================
   ACTIONS/ALLIANCE.JS - Alliance System
   =================================== */

window.proposeAlliance = function() {
    const targetId = document.getElementById('allyTarget').value;
    const message = document.getElementById('allyMessage').value;
    
    if (!targetId) {
        showNotification('Select a nation!', 'warning');
        return;
    }
    
    const target = getAINation(targetId);
    if (!target) return;
    
    // Check if already allied
    if (gameState.player.allies.includes(targetId)) {
        showNotification('Already allied with this nation!', 'warning');
        return;
    }
    
    // Check if at war
    if (gameState.player.wars.includes(targetId)) {
        showNotification('Cannot ally with a nation you are at war with!', 'error');
        return;
    }
    
    // AI decides
    const accepts = aiRespondToAlliance(target, gameState.player);
    
    if (accepts) {
        formAlliance(targetId);
        addEvent(`🤝 Alliance formed with ${target.name}!`);
        showNotification(`${target.name} accepted your alliance!`, 'success', 4000);
    } else {
        addEvent(`${target.name} rejected your alliance proposal.`);
        showNotification(`${target.name} rejected your proposal.`, 'error');
    }
    
    closeModal('allyModal');
    updateAllUI();
    renderAINations();
}

// Break alliance
window.breakAlliance = function(targetId) {
    if (!confirm(`Break alliance with ${getAINation(targetId)?.name}?`)) return;
    
    const success = window.breakAlliance(targetId);
    if (success) {
        updateAllUI();
        renderAINations();
    }
}

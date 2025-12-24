// ===================================
// TRUCE.JS - Truce/Peace System
// Handles cease-fires and peace treaties
// ===================================

// Truce state
const truceState = {
    activeTruces: [],
    pendingTruceProposals: []
};

// Initialize truce system
function initTruceSystem() {
    console.log('🕊️ Truce system initialized');
    
    // Check for expired truces every turn
    setInterval(checkExpiredTruces, 5000);
}

// Open truce modal
function openTruceModal() {
    const modal = document.getElementById('truceModal');
    if (!modal) return;
    
    // Populate target dropdown
    populateTruceTargets();
    
    modal.classList.add('active');
}

// Populate truce target dropdown
function populateTruceTargets() {
    const select = document.getElementById('truceTarget');
    if (!select) return;
    
    // Get all nations/players you're at war with or have tensions with
    const potentialTruceTargets = gameState.nations.filter(nation => {
        return nation.id !== gameState.playerNation.id && 
               (nation.relationshipStatus === 'war' || 
                nation.relationshipStatus === 'hostile');
    });
    
    select.innerHTML = '<option value="">Select a nation...</option>';
    
    potentialTruceTargets.forEach(nation => {
        const option = document.createElement('option');
        option.value = nation.id;
        option.textContent = `${nation.name} (${nation.relationshipStatus})`;
        select.appendChild(option);
    });
    
    if (potentialTruceTargets.length === 0) {
        select.innerHTML = '<option value="">No nations to propose truce with</option>';
    }
}

// Propose truce
function proposeTruce() {
    const targetId = document.getElementById('truceTarget')?.value;
    const duration = document.getElementById('truceDuration')?.value;
    const terms = document.getElementById('truceTerms')?.value;
    
    if (!targetId) {
        showNotification('Please select a nation', 'error');
        return;
    }
    
    const targetNation = gameState.nations.find(n => n.id === parseInt(targetId));
    if (!targetNation) {
        showNotification('Nation not found', 'error');
        return;
    }
    
    // Check if already have active truce
    const existingTruce = truceState.activeTruces.find(t => 
        t.nationA === gameState.playerNation.id && t.nationB === targetNation.id ||
        t.nationA === targetNation.id && t.nationB === gameState.playerNation.id
    );
    
    if (existingTruce) {
        showNotification('You already have an active truce with this nation', 'error');
        return;
    }
    
    // Create truce proposal
    const truceProposal = {
        id: Date.now(),
        proposer: gameState.playerNation.id,
        target: targetNation.id,
        duration: duration === 'permanent' ? 'permanent' : parseInt(duration),
        terms: terms || 'Standard cease-fire agreement',
        proposedTurn: gameState.currentTurn,
        status: 'pending'
    };
    
    truceState.pendingTruceProposals.push(truceProposal);
    
    // Add to event log
    addEvent(`You proposed a truce to ${targetNation.name}`);
    
    // If multiplayer, send to server
    if (typeof serverSocket !== 'undefined' && serverSocket) {
        serverSocket.send(JSON.stringify({
            type: 'truceProposal',
            proposal: truceProposal
        }));
    } else {
        // In solo play, AI responds automatically
        setTimeout(() => {
            aiRespondToTruceProposal(truceProposal);
        }, 2000 + Math.random() * 3000);
    }
    
    showNotification(`Truce proposal sent to ${targetNation.name}`, 'success');
    closeModal('truceModal');
    
    // Clear form
    if (document.getElementById('truceTerms')) {
        document.getElementById('truceTerms').value = '';
    }
}

// AI responds to truce proposal (solo play)
function aiRespondToTruceProposal(proposal) {
    const targetNation = gameState.nations.find(n => n.id === proposal.target);
    const proposerNation = gameState.nations.find(n => n.id === proposal.proposer);
    
    if (!targetNation || !proposerNation) return;
    
    // Calculate acceptance chance based on:
    // - Current war status
    // - Military strength comparison
    // - Economic situation
    // - AI personality
    
    const militaryRatio = targetNation.military / proposerNation.military;
    const economicPressure = targetNation.money < 10000 ? 0.3 : 0;
    const warWeariness = targetNation.relationshipStatus === 'war' ? 0.2 : 0;
    
    let acceptanceChance = 0.4;
    
    // Losing the war? More likely to accept
    if (militaryRatio < 0.7) acceptanceChance += 0.3;
    
    // Economic pressure
    acceptanceChance += economicPressure;
    
    // War weariness
    acceptanceChance += warWeariness;
    
    // AI personality modifier
    if (targetNation.personality === 'peaceful') acceptanceChance += 0.2;
    if (targetNation.personality === 'aggressive') acceptanceChance -= 0.2;
    
    const accepted = Math.random() < acceptanceChance;
    
    if (accepted) {
        acceptTruce(proposal);
    } else {
        rejectTruce(proposal);
    }
}

// Accept truce
function acceptTruce(proposal) {
    const targetNation = gameState.nations.find(n => n.id === proposal.target);
    const proposerNation = gameState.nations.find(n => n.id === proposal.proposer);
    
    if (!targetNation || !proposerNation) return;
    
    // Create active truce
    const truce = {
        id: proposal.id,
        nationA: proposal.proposer,
        nationB: proposal.target,
        duration: proposal.duration,
        terms: proposal.terms,
        startTurn: gameState.currentTurn,
        endTurn: proposal.duration === 'permanent' ? null : gameState.currentTurn + proposal.duration,
        status: 'active'
    };
    
    truceState.activeTruces.push(truce);
    
    // Remove from pending
    truceState.pendingTruceProposals = truceState.pendingTruceProposals.filter(p => p.id !== proposal.id);
    
    // Update relationship status
    if (proposerNation.id === gameState.playerNation.id) {
        targetNation.relationshipStatus = 'truce';
    } else {
        proposerNation.relationshipStatus = 'truce';
    }
    
    // Add to event log
    if (proposerNation.id === gameState.playerNation.id) {
        addEvent(`✅ ${targetNation.name} accepted your truce proposal!`);
        showNotification(`${targetNation.name} accepted the truce!`, 'success');
    } else {
        addEvent(`✅ You accepted the truce with ${proposerNation.name}`);
    }
    
    // Play sound
    playSound('notificationSound');
}

// Reject truce
function rejectTruce(proposal) {
    const targetNation = gameState.nations.find(n => n.id === proposal.target);
    const proposerNation = gameState.nations.find(n => n.id === proposal.proposer);
    
    if (!targetNation || !proposerNation) return;
    
    // Remove from pending
    truceState.pendingTruceProposals = truceState.pendingTruceProposals.filter(p => p.id !== proposal.id);
    
    // Add to event log
    if (proposerNation.id === gameState.playerNation.id) {
        addEvent(`❌ ${targetNation.name} rejected your truce proposal`);
        showNotification(`${targetNation.name} rejected the truce`, 'error');
    } else {
        addEvent(`❌ You rejected the truce with ${proposerNation.name}`);
    }
}

// Receive truce proposal (multiplayer or from AI)
function receiveTruceProposal(proposal) {
    const proposerNation = gameState.nations.find(n => n.id === proposal.proposer);
    if (!proposerNation) return;
    
    truceState.pendingTruceProposals.push(proposal);
    
    // Show notification
    showNotification(`${proposerNation.name} proposed a truce!`, 'info');
    addEvent(`📨 ${proposerNation.name} proposed a truce`);
    
    // Show truce proposal modal
    showTruceProposalDialog(proposal);
}

// Show truce proposal dialog
function showTruceProposalDialog(proposal) {
    const proposerNation = gameState.nations.find(n => n.id === proposal.proposer);
    if (!proposerNation) return;
    
    const durationText = proposal.duration === 'permanent' ? 
        'Permanent Peace' : 
        `${proposal.duration} Turns`;
    
    const dialog = document.createElement('div');
    dialog.className = 'modal active';
    dialog.innerHTML = `
        <div class="modal-content">
            <h2>🕊️ Truce Proposal</h2>
            <p style="color: #f4e4c1; font-size: 18px; margin: 20px 0;">
                <strong>${proposerNation.name}</strong> has proposed a truce
            </p>
            <div style="background: rgba(138, 122, 94, 0.2); padding: 20px; border: 2px solid #8a7a5e; margin: 20px 0;">
                <p><strong>Duration:</strong> ${durationText}</p>
                <p><strong>Terms:</strong></p>
                <p style="font-style: italic; color: #d4c4a8;">${proposal.terms}</p>
            </div>
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="btn btn-danger" onclick="respondToTruce(${proposal.id}, false)" style="flex: 1;">Reject</button>
                <button class="btn btn-success" onclick="respondToTruce(${proposal.id}, true)" style="flex: 1;">Accept</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// Respond to truce proposal
function respondToTruce(proposalId, accept) {
    const proposal = truceState.pendingTruceProposals.find(p => p.id === proposalId);
    if (!proposal) return;
    
    // Remove dialog
    const dialogs = document.querySelectorAll('.modal');
    dialogs.forEach(d => {
        if (d.textContent.includes('Truce Proposal')) {
            d.remove();
        }
    });
    
    if (accept) {
        acceptTruce(proposal);
        
        // If multiplayer, send acceptance to server
        if (typeof serverSocket !== 'undefined' && serverSocket) {
            serverSocket.send(JSON.stringify({
                type: 'truceResponse',
                proposalId: proposalId,
                accepted: true
            }));
        }
    } else {
        rejectTruce(proposal);
        
        // If multiplayer, send rejection to server
        if (typeof serverSocket !== 'undefined' && serverSocket) {
            serverSocket.send(JSON.stringify({
                type: 'truceResponse',
                proposalId: proposalId,
                accepted: false
            }));
        }
    }
}

// Break truce
function breakTruce(truceId) {
    const truce = truceState.activeTruces.find(t => t.id === truceId);
    if (!truce) return;
    
    const otherNationId = truce.nationA === gameState.playerNation.id ? truce.nationB : truce.nationA;
    const otherNation = gameState.nations.find(n => n.id === otherNationId);
    
    if (!otherNation) return;
    
    // Remove truce
    truceState.activeTruces = truceState.activeTruces.filter(t => t.id !== truceId);
    
    // Update relationship - breaking a truce is serious
    otherNation.relationshipStatus = 'hostile';
    otherNation.opinion -= 30; // Significant opinion penalty
    
    // Add event
    addEvent(`⚠️ You broke the truce with ${otherNation.name}! Their opinion of you has decreased.`);
    showNotification(`Truce with ${otherNation.name} broken! They are now hostile.`, 'warning');
    
    // If multiplayer, notify server
    if (typeof serverSocket !== 'undefined' && serverSocket) {
        serverSocket.send(JSON.stringify({
            type: 'truceBroken',
            truceId: truceId,
            breaker: gameState.playerNation.id
        }));
    }
    
    playSound('warSound');
}

// Check for expired truces
function checkExpiredTruces() {
    if (!gameState || !gameState.currentTurn) return;
    
    const expiredTruces = truceState.activeTruces.filter(truce => {
        return truce.endTurn !== null && gameState.currentTurn >= truce.endTurn;
    });
    
    expiredTruces.forEach(truce => {
        const nationA = gameState.nations.find(n => n.id === truce.nationA);
        const nationB = gameState.nations.find(n => n.id === truce.nationB);
        
        if (!nationA || !nationB) return;
        
        // Remove truce
        truceState.activeTruces = truceState.activeTruces.filter(t => t.id !== truce.id);
        
        // Update relationship status to neutral
        if (nationA.id === gameState.playerNation.id) {
            nationB.relationshipStatus = 'neutral';
        } else if (nationB.id === gameState.playerNation.id) {
            nationA.relationshipStatus = 'neutral';
        }
        
        // Notify player
        const otherNation = nationA.id === gameState.playerNation.id ? nationB : nationA;
        addEvent(`⏱️ Truce with ${otherNation.name} has expired`);
        showNotification(`Truce with ${otherNation.name} has ended`, 'info');
    });
}

// Get active truces for a nation
function getActiveTruces(nationId) {
    return truceState.activeTruces.filter(truce => 
        truce.nationA === nationId || truce.nationB === nationId
    );
}

// Check if two nations have a truce
function hasTruce(nationA, nationB) {
    return truceState.activeTruces.some(truce => 
        (truce.nationA === nationA && truce.nationB === nationB) ||
        (truce.nationA === nationB && truce.nationB === nationA)
    );
}

// Get truce details
function getTruceDetails(nationA, nationB) {
    return truceState.activeTruces.find(truce => 
        (truce.nationA === nationA && truce.nationB === nationB) ||
        (truce.nationA === nationB && truce.nationB === nationA)
    );
}

// Display active truces in UI
function displayActiveTruces() {
    const playerTruces = getActiveTruces(gameState.playerNation.id);
    
    if (playerTruces.length === 0) return;
    
    const truceContainer = document.createElement('div');
    truceContainer.className = 'truce-display';
    truceContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #8a7a5e;
        padding: 15px 25px;
        font-family: 'Cinzel', serif;
        font-size: 14px;
        color: #f4e4c1;
        z-index: 50;
    `;
    
    const truceText = playerTruces.map(truce => {
        const otherNationId = truce.nationA === gameState.playerNation.id ? truce.nationB : truce.nationA;
        const otherNation = gameState.nations.find(n => n.id === otherNationId);
        const turnsLeft = truce.duration === 'permanent' ? '∞' : truce.endTurn - gameState.currentTurn;
        
        return `🕊️ Truce with ${otherNation.name} (${turnsLeft} turns left)`;
    }).join(' | ');
    
    truceContainer.textContent = truceText;
    
    // Remove old display if exists
    const oldDisplay = document.querySelector('.truce-display');
    if (oldDisplay) oldDisplay.remove();
    
    document.body.appendChild(truceContainer);
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        initTruceSystem();
    });
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        proposeTruce,
        receiveTruceProposal,
        respondToTruce,
        breakTruce,
        checkExpiredTruces,
        getActiveTruces,
        hasTruce,
        getTruceDetails,
        displayActiveTruces
    };
}
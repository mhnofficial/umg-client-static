/* ===================================
   INVENT.JS - AI-Powered Invention System
   Uses Claude API for realistic responses
   🤖 USES CLAUDE AI API
   =================================== */

// ===================================
// SUBMIT INVENTION
// ===================================
async function submitInvention() {
    const input = document.getElementById('inventInput').value.trim();
    const chatBox = document.getElementById('inventChat');
    
    if (!input) {
        showNotification('Please describe your invention!', 'warning');
        return;
    }
    
    // Add user message to chat
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message';
    userMsg.innerHTML = `<strong>You:</strong> ${input}`;
    chatBox.appendChild(userMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Show loading
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-message';
    loadingMsg.innerHTML = `<strong>AI Advisor:</strong> <em>Analyzing invention...</em>`;
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Clear input
    document.getElementById('inventInput').value = '';
    
    try {
        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `You are an advisor in a medieval/fantasy nation-building game. A player wants to invent: "${input}"

Evaluate this invention and respond with:
1. Whether it's feasible for their civilization level
2. What benefits it would provide (military, economic, or social)
3. Any potential drawbacks or costs
4. A creative name for the invention

Keep response under 100 words, enthusiastic tone, medieval fantasy style.`
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Remove loading message
        chatBox.removeChild(loadingMsg);
        
        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message';
        aiMsg.innerHTML = `<strong>AI Advisor:</strong> ${aiResponse}`;
        chatBox.appendChild(aiMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Add invention to player's list
        const invention = {
            name: input,
            description: aiResponse,
            timestamp: Date.now()
        };
        
        gameState.player.inventions.push(invention);
        
        // Apply benefits (simplified)
        const benefits = analyzeInventionBenefits(input);
        applyInventionBenefits(benefits);
        
        // Update UI
        updateInventionsList();
        
        // Play sound
        if (window.upgradeSound) {
            upgradeSound.currentTime = 0;
            upgradeSound.play();
        }
        
        showNotification(`✨ Invention created: ${input}!`, 'success');
        
    } catch (error) {
        console.error('Invention API error:', error);
        
        // Remove loading
        chatBox.removeChild(loadingMsg);
        
        // Fallback response
        const fallbackMsg = document.createElement('div');
        fallbackMsg.className = 'chat-message';
        fallbackMsg.innerHTML = `<strong>AI Advisor:</strong> Fascinating concept! Your invention "${input}" shows great promise. It could improve your nation's capabilities. This innovation will serve your people well!`;
        chatBox.appendChild(fallbackMsg);
        
        gameState.player.inventions.push({
            name: input,
            description: 'Innovative technology',
            timestamp: Date.now()
        });
        
        updateInventionsList();
        showNotification(`✨ Invention created: ${input}!`, 'success');
    }
}

// ===================================
// ANALYZE & APPLY BENEFITS
// ===================================
function analyzeInventionBenefits(inventionText) {
    const text = inventionText.toLowerCase();
    const benefits = {
        military: 0,
        income: 0,
        population: 0
    };
    
    // Military keywords
    if (text.includes('weapon') || text.includes('sword') || text.includes('armor') || 
        text.includes('military') || text.includes('defense') || text.includes('attack') ||
        text.includes('war') || text.includes('battle') || text.includes('gun') ||
        text.includes('cannon') || text.includes('shield')) {
        benefits.military = 5 + Math.floor(Math.random() * 10);
    }
    
    // Economic keywords
    if (text.includes('farm') || text.includes('trade') || text.includes('merchant') ||
        text.includes('money') || text.includes('gold') || text.includes('economic') ||
        text.includes('business') || text.includes('market') || text.includes('tool') ||
        text.includes('machine') || text.includes('production')) {
        benefits.income = 100 + Math.floor(Math.random() * 200);
    }
    
    // Population keywords
    if (text.includes('food') || text.includes('health') || text.includes('medicine') ||
        text.includes('hospital') || text.includes('housing') || text.includes('water') ||
        text.includes('sanitation') || text.includes('education')) {
        benefits.population = 100 + Math.floor(Math.random() * 300);
    }
    
    // Default small bonus
    if (benefits.military === 0 && benefits.income === 0 && benefits.population === 0) {
        benefits.income = 50;
    }
    
    return benefits;
}

function applyInventionBenefits(benefits) {
    if (benefits.military > 0) {
        gameState.player.military += benefits.military;
        addEvent(`⚔️ Military improved by ${benefits.military}!`);
    }
    
    if (benefits.income > 0) {
        gameState.player.income += benefits.income;
        addEvent(`💰 Daily income increased by $${benefits.income}!`);
    }
    
    if (benefits.population > 0) {
        gameState.player.population += benefits.population;
        addEvent(`👥 Population grew by ${benefits.population}!`);
    }
    
    updateAllUI();
}

// Make function available globally
window.submitInvention = submitInvention;


/* ===================================
   ACTIONS/CHAT.JS - AI-Powered Diplomacy Chat
   =================================== */

window.sendChat = async function() {
    const targetId = document.getElementById('chatTarget').value;
    const input = document.getElementById('chatInput').value.trim();
    const chatBox = document.getElementById('diplomacyChat');
    
    if (!targetId || !input) {
        showNotification('Select a nation and write a message!', 'warning');
        return;
    }
    
    const target = getAINation(targetId);
    if (!target) return;
    
    // Add user message
    chatBox.innerHTML += `
        <div class="chat-message">
            <strong>You:</strong> ${input}
        </div>
    `;
    
    // Show AI thinking
    chatBox.innerHTML += `
        <div class="chat-message" id="ai-chat-thinking">
            <strong>${target.name}:</strong> ...
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Call Claude API for realistic diplomatic response
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `You are ${target.name}, a ${target.personality} nation in a fantasy world.

Your personality: ${PERSONALITIES[target.personality].description}

The player's nation "${gameState.player.name}" sent you this message:
"${input}"

Your current relationship: ${isAllied(targetId) ? 'Allied' : isAtWar(targetId) ? 'At war' : 'Neutral'}

Respond in character as the leader of ${target.name}. Be diplomatic but stay true to your personality. Keep response under 80 words.`
                }]
            })
        });
        
        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Remove thinking message
        document.getElementById('ai-chat-thinking').remove();
        
        // Add AI response
        chatBox.innerHTML += `
            <div class="chat-message">
                <strong>${target.name}:</strong> ${aiResponse}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
        
    } catch (error) {
        console.error('Chat API error:', error);
        document.getElementById('ai-chat-thinking').remove();
        
        // Fallback to simple AI response
        const fallbackResponse = generateAIChatResponse(target, input, gameState.player);
        
        chatBox.innerHTML += `
            <div class="chat-message">
                <strong>${target.name}:</strong> ${fallbackResponse}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    document.getElementById('chatInput').value = '';
}

// Export
window.processInvention = processInvention;
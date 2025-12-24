/* ===================================
   TASKS.JS - Quest/Task System
   =================================== */

// Task templates
const TASK_TEMPLATES = [
    // Population tasks
    { id: 'pop_1', desc: 'Reach 15,000 population', check: () => gameState.player.population >= 15000, reward: 1500, type: 'population' },
    { id: 'pop_2', desc: 'Reach 25,000 population', check: () => gameState.player.population >= 25000, reward: 3000, type: 'population' },
    { id: 'pop_3', desc: 'Reach 50,000 population', check: () => gameState.player.population >= 50000, reward: 7500, type: 'population' },
    
    // Economic tasks
    { id: 'eco_1', desc: 'Accumulate $15,000', check: () => gameState.player.money >= 15000, reward: 2000, type: 'economic' },
    { id: 'eco_2', desc: 'Accumulate $30,000', check: () => gameState.player.money >= 30000, reward: 5000, type: 'economic' },
    { id: 'eco_3', desc: 'Reach $1,000/day income', check: () => gameState.player.income >= 1000, reward: 3000, type: 'economic' },
    
    // Military tasks
    { id: 'mil_1', desc: 'Build military strength to 50', check: () => gameState.player.military >= 50, reward: 2000, type: 'military' },
    { id: 'mil_2', desc: 'Build military strength to 100', check: () => gameState.player.military >= 100, reward: 4000, type: 'military' },
    { id: 'mil_3', desc: 'Upgrade Military to level 3', check: () => gameState.player.upgrades.military >= 3, reward: 3500, type: 'military' },
    
    // Diplomatic tasks
    { id: 'dip_1', desc: 'Form 1 alliance', check: () => gameState.player.allies.length >= 1, reward: 2500, type: 'diplomatic' },
    { id: 'dip_2', desc: 'Form 3 alliances', check: () => gameState.player.allies.length >= 3, reward: 6000, type: 'diplomatic' },
    { id: 'dip_3', desc: 'Make peace with 1 nation', check: () => gameState.player.peaceCount >= 1, reward: 3000, type: 'diplomatic' },
    
    // Development tasks
    { id: 'dev_1', desc: 'Build 3 structures', check: () => gameState.player.structures.length >= 3, reward: 2000, type: 'development' },
    { id: 'dev_2', desc: 'Build 10 structures', check: () => gameState.player.structures.length >= 10, reward: 5000, type: 'development' },
    { id: 'dev_3', desc: 'Upgrade any system to level 3', check: () => Object.values(gameState.player.upgrades).some(lvl => lvl >= 3), reward: 3000, type: 'development' },
    
    // Innovation tasks
    { id: 'inn_1', desc: 'Create your first invention', check: () => gameState.player.inventions.length >= 1, reward: 2500, type: 'innovation' },
    { id: 'inn_2', desc: 'Create 3 inventions', check: () => gameState.player.inventions.length >= 3, reward: 5000, type: 'innovation' },
    
    // Expansion tasks
    { id: 'exp_1', desc: 'Control 2 territories', check: () => gameState.player.territories >= 2, reward: 4000, type: 'expansion' },
    { id: 'exp_2', desc: 'Control 5 territories', check: () => gameState.player.territories >= 5, reward: 10000, type: 'expansion' },
    
    // Time-based tasks
    { id: 'time_1', desc: 'Survive 30 days', check: () => gameState.day >= 30, reward: 2000, type: 'time' },
    { id: 'time_2', desc: 'Survive 100 days', check: () => gameState.day >= 100, reward: 5000, type: 'time' },
    { id: 'time_3', desc: 'Survive 365 days', check: () => gameState.day >= 365, reward: 15000, type: 'time' }
];

// ===================================
// GENERATE INITIAL TASKS
// ===================================
function generateInitialTasks() {
    // Start with 5 random tasks
    const availableTasks = [...TASK_TEMPLATES];
    const initialTasks = [];
    
    for (let i = 0; i < 5 && availableTasks.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableTasks.length);
        const template = availableTasks.splice(randomIndex, 1)[0];
        
        initialTasks.push({
            ...template,
            completed: false,
            progress: 0
        });
    }
    
    return initialTasks;
}

// ===================================
// RENDER TASKS UI
// ===================================
function renderTasks() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    if (!gameState.tasks || gameState.tasks.length === 0) {
        container.innerHTML = '<p class="empty-text">No tasks available</p>';
        return;
    }
    
    const taskHTML = gameState.tasks.map(task => {
        const typeColors = {
            population: '#3498db',
            economic: '#f1c40f',
            military: '#e74c3c',
            diplomatic: '#9b59b6',
            development: '#2ecc71',
            innovation: '#e67e22',
            expansion: '#1abc9c',
            time: '#34495e'
        };
        
        const color = typeColors[task.type] || '#95a5a6';
        const isComplete = task.completed;
        
        return `
            <div class="task-item ${isComplete ? 'completed' : ''}">
                <div style="border-left: 4px solid ${color}; padding-left: 12px;">
                    <div class="task-description">
                        ${isComplete ? '✓ ' : ''}${task.desc}
                    </div>
                    <div style="margin-top: 8px;">
                        <span class="task-reward" style="color: ${color};">
                            💰 Reward: $${task.reward.toLocaleString()}
                        </span>
                        ${!isComplete ? `
                            <button class="task-complete-btn" onclick="checkTaskCompletion('${task.id}')">
                                Check
                            </button>
                        ` : `
                            <span style="color: #2ecc71; font-weight: bold; margin-left: 15px;">
                                ✓ Completed
                            </span>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = taskHTML;
}

// ===================================
// CHECK TASK COMPLETION
// ===================================
window.checkTaskCompletion = function(taskId) {
    const task = gameState.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    // Check if requirements are met
    if (task.check()) {
        // Complete task
        task.completed = true;
        gameState.player.money += task.reward;
        
        // Play sound
        if (window.taskCompleteSound) {
            taskCompleteSound.currentTime = 0;
            taskCompleteSound.play();
        }
        
        // Add event
        addEvent(`✓ Task completed: ${task.desc} (+$${task.reward.toLocaleString()})`);
        
        // Show notification
        showNotification(`Task completed! +$${task.reward.toLocaleString()}`, 'success', 4000);
        
        // Update UI
        updateAllUI();
        renderTasks();
        
        // Add new task
        addNewTask();
    } else {
        showNotification('Task requirements not met yet!', 'warning');
    }
}

// ===================================
// AUTO-CHECK TASKS
// ===================================
function autoCheckTasks() {
    if (!gameState.tasks) return;
    
    let anyCompleted = false;
    
    gameState.tasks.forEach(task => {
        if (!task.completed && task.check()) {
            task.completed = true;
            gameState.player.money += task.reward;
            addEvent(`✓ Auto-completed: ${task.desc} (+$${task.reward.toLocaleString()})`);
            anyCompleted = true;
            
            if (window.taskCompleteSound) {
                taskCompleteSound.currentTime = 0;
                taskCompleteSound.play();
            }
        }
    });
    
    if (anyCompleted) {
        renderTasks();
        updateAllUI();
        
        // Add new tasks
        const completedCount = gameState.tasks.filter(t => t.completed).length;
        if (completedCount >= 3) {
            addNewTask();
        }
    }
}

// ===================================
// ADD NEW TASK
// ===================================
function addNewTask() {
    const completedIds = new Set(gameState.tasks.map(t => t.id));
    const availableTasks = TASK_TEMPLATES.filter(t => !completedIds.has(t.id));
    
    if (availableTasks.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const newTask = {
        ...availableTasks[randomIndex],
        completed: false,
        progress: 0
    };
    
    gameState.tasks.push(newTask);
    renderTasks();
    
    showNotification(`New task available: ${newTask.desc}`, 'info', 3000);
}

// ===================================
// TASK PROGRESS TRACKING
// ===================================
function updateTaskProgress() {
    if (!gameState.tasks) return;
    
    gameState.tasks.forEach(task => {
        if (task.completed) return;
        
        // Calculate progress percentage based on task type
        switch (task.type) {
            case 'population':
                const popTarget = parseInt(task.desc.match(/[\d,]+/)[0].replace(',', ''));
                task.progress = Math.min(100, (gameState.player.population / popTarget) * 100);
                break;
            case 'economic':
                const moneyTarget = parseInt(task.desc.match(/[\d,]+/)[0].replace(',', ''));
                task.progress = Math.min(100, (gameState.player.money / moneyTarget) * 100);
                break;
            // Add more progress tracking as needed
        }
    });
}

// ===================================
// INITIALIZE TASKS
// ===================================
function initializeTasks() {
    if (!gameState.tasks || gameState.tasks.length === 0) {
        gameState.tasks = generateInitialTasks();
    }
    renderTasks();
}

// Add auto-check to game loop (call this every game tick)
setInterval(() => {
    if (gameState && gameState.tasks) {
        autoCheckTasks();
        updateTaskProgress();
    }
}, 5000); // Check every 5 seconds

// ===================================
// EXPORT FUNCTIONS
// ===================================
window.generateInitialTasks = generateInitialTasks;
window.renderTasks = renderTasks;
window.initializeTasks = initializeTasks;
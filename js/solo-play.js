// ========================
// FULL SOLO-PLAY GAME
// ========================

const canvas = document.getElementById('game-map');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 250;
canvas.height = window.innerHeight;

let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isDragging = false;
let startDrag = {x:0, y:0};

// ========================
// TERRITORIES
// ========================

class Territory {
    constructor(name, x, y, w, h, terrain) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.terrain = terrain;
        this.owner = 'Neutral';
        this.resources = Math.floor(Math.random()*50)+50;
        this.units = 0;
        this.fogged = true; // player can't see initially
    }
}

const terrains = ['plains','mountain','forest','desert'];
const terrainColors = {
    plains: '#7cfc00',
    mountain: '#888888',
    forest: '#228B22',
    desert: '#edc9af'
};

// Generate territories
const territories = [];
for(let i=0;i<20;i++){
    territories.push(new Territory(
        `Territory ${i+1}`,
        100 + i*120,
        100 + Math.floor(Math.random()*300),
        120 + Math.floor(Math.random()*50),
        80 + Math.floor(Math.random()*50),
        terrains[Math.floor(Math.random()*terrains.length)]
    ));
}

// ========================
// PLAYER & TURN MANAGEMENT
// ========================

const player = {
    name: 'Player',
    resources: 100,
    unitsPerTurn: 5
};

let turn = 1; // 1=player, 2=AI
let selectedTerritory = null;

// ========================
// DRAW MAP
// ========================

function drawMap() {
    ctx.setTransform(scale,0,0,scale,offsetX,offsetY);
    ctx.clearRect(-offsetX/scale, -offsetY/scale, canvas.width/scale, canvas.height/scale);

    territories.forEach(t => {
        ctx.fillStyle = t.fogged ? '#333' : terrainColors[t.terrain];
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(t.x, t.y, t.w, t.h);

        if(!t.fogged){
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(t.owner, t.x+5, t.y+15);
            ctx.fillText(`Units: ${t.units}`, t.x+5, t.y+30);
        }
    });
}

drawMap();

// ========================
// PAN & ZOOM
// ========================

canvas.addEventListener('mousedown', e => {
    isDragging = true;
    startDrag = {x: e.clientX - offsetX, y: e.clientY - offsetY};
});

canvas.addEventListener('mouseup', e => isDragging = false);
canvas.addEventListener('mouseleave', e => isDragging = false);

canvas.addEventListener('mousemove', e => {
    if(isDragging){
        offsetX = e.clientX - startDrag.x;
        offsetY = e.clientY - startDrag.y;
        drawMap();
    }
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const zoom = 1.1;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const delta = e.deltaY < 0 ? zoom : 1/zoom;
    scale *= delta;
    offsetX = mouseX - (mouseX - offsetX) * delta;
    offsetY = mouseY - (mouseY - offsetY) * delta;
    drawMap();
});

// ========================
// SELECT TERRITORY
// ========================

canvas.addEventListener('click', e => {
    const x = (e.clientX - offsetX)/scale;
    const y = (e.clientY - offsetY)/scale;
    const t = territories.find(t => x >= t.x && x <= t.x+t.w && y >= t.y && y <= t.y+t.h);
    if(t){
        selectedTerritory = t;
        t.fogged = false; // reveal
        updateInfoPanel(t);
        drawMap();
    }
});

function updateInfoPanel(t){
    document.getElementById('territory-name').innerText = t.name;
    document.getElementById('territory-owner').innerText = `Owner: ${t.owner}`;
    document.getElementById('territory-resources').innerText = `Resources: ${t.resources}`;
    document.getElementById('territory-units').innerText = `Units: ${t.units}`;
}

// ========================
// UNITS & MOVEMENT
// ========================

function recruitUnits(n){
    if(selectedTerritory && selectedTerritory.owner === 'Player'){
        const cost = n*5;
        if(player.resources >= cost){
            player.resources -= cost;
            selectedTerritory.units += n;
            drawMap();
            updatePlayerPanel();
        } else alert("Not enough resources!");
    } else alert("Select your territory first!");
}

function moveUnits(toTerritory, n){
    if(selectedTerritory && selectedTerritory.units >= n){
        selectedTerritory.units -= n;
        if(toTerritory.owner !== 'Player'){
            resolveCombat(toTerritory, n);
        } else {
            toTerritory.units += n;
        }
        drawMap();
    }
}

// ========================
// COMBAT
// ========================

function resolveCombat(target, attackingUnits){
    const defenseUnits = target.units;
    const attackPower = attackingUnits * (Math.random()*0.5+0.75);
    const defensePower = defenseUnits * (Math.random()*0.5+0.75);

    if(attackPower > defensePower){
        target.owner = 'Player';
        target.units = Math.max(0, attackingUnits - defenseUnits);
    } else {
        target.units = Math.max(0, defenseUnits - attackingUnits);
    }
}

// ========================
// AI (full-vision using Claude placeholder)
// ========================

function aiTurn(){
    territories.forEach(t => {
        if(t.owner !== 'Player'){
            // Full AI strategy (placeholder)
            const targets = territories.filter(tt => tt.owner === 'Neutral' || tt.owner === 'Player');
            if(t.units > 0 && targets.length > 0){
                const target = targets[Math.floor(Math.random()*targets.length)];
                const sendUnits = Math.floor(t.units/2);
                moveUnitsAI(t, target, sendUnits);
            }
        }
    });
}

function moveUnitsAI(from, to, n){
    from.units -= n;
    if(to.owner !== 'AI') resolveCombatAI(to, n, from.owner);
    else to.units += n;
}

function resolveCombatAI(target, attackingUnits, attackerName){
    const defenseUnits = target.units;
    const attackPower = attackingUnits * (Math.random()*0.5+0.75);
    const defensePower = defenseUnits * (Math.random()*0.5+0.75);

    if(attackPower > defensePower){
        target.owner = attackerName;
        target.units = Math.max(0, attackingUnits - defenseUnits);
    } else {
        target.units = Math.max(0, defenseUnits - attackingUnits);
    }
}

// ========================
// RANDOM EVENTS
// ========================

function randomEvent(){
    const t = territories[Math.floor(Math.random()*territories.length)];
    const eventType = Math.random();
    if(eventType < 0.3){
        t.resources += 10;
        console.log(`${t.name} gained 10 resources!`);
    } else if(eventType < 0.6 && t.units > 0){
        t.units -= 1;
        console.log(`${t.name} lost 1 unit due to disaster!`);
    }
}

// ========================
// PLAYER PANEL
// ========================

function updatePlayerPanel(){
    document.getElementById('player-resources').innerText = `Resources: ${player.resources}`;
    document.getElementById('player-turn').innerText = `Turn: ${turn === 1 ? 'Player' : 'AI'}`;
}

// ========================
// TURN SYSTEM
// ========================

function endTurn(){
    if(turn === 1){
        turn = 2;
        aiTurn();
        randomEvent();
        turn = 1;
        player.resources += player.unitsPerTurn;
        drawMap();
        updatePlayerPanel();
    }
}

// ========================
// GAME LOOP
// ========================

function gameLoop(){
    drawMap();
    requestAnimationFrame(gameLoop);
}

updatePlayerPanel();
gameLoop();

/* ===================================
   MENU.JS - Main Menu Logic
   Handles: Ocean animation, audio, navigation
   =================================== */

// ===================================
// GAME START FLOW
// ===================================
function startGame() {
    // SOUND: Play click sound here
    clickSound.currentTime = 0;
    clickSound.play();

    // Hide press start screen
    document.getElementById('pressStart').style.opacity = '0';
    document.getElementById('pressStart').style.transition = 'opacity 1s';
    
    setTimeout(() => {
        document.getElementById('pressStart').style.display = 'none';
        
        // Show loading screen
        document.getElementById('loadingScreen').classList.add('active');
        
        // Start music and ambient sounds
        bgMusic.volume = 0.3;  // Adjust volume here
        ambientOcean.volume = 0.2;
        bgMusic.play();
        ambientOcean.play();
        
        // Simulate loading (2 seconds) - adjust this duration
        setTimeout(() => {
            // Hide loading screen
            document.getElementById('loadingScreen').style.opacity = '0';
            document.getElementById('loadingScreen').style.transition = 'opacity 1s';
            
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.remove('active');
                
                // Show main menu
                document.getElementById('mainMenu').style.display = 'block';
                document.getElementById('mainMenu').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('mainMenu').style.transition = 'opacity 1s';
                    document.getElementById('mainMenu').style.opacity = '1';
                }, 50);
            }, 1000);
        }, 100); // Loading duration - change this number
    }, 1000);
}

// ===================================
// AUDIO SYSTEM
// ===================================
const bgMusic = document.getElementById('bgMusic');
const hoverSound = document.getElementById('hoverSound');
const clickSound = document.getElementById('clickSound');
const ambientOcean = document.getElementById('ambientOcean');

// Add sound effects to buttons
document.querySelectorAll('.btn, .press-start-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        // SOUND: Play hover sound
        hoverSound.currentTime = 0;
        hoverSound.play();
    });
    
    btn.addEventListener('click', () => {
        // SOUND: Play click sound
        clickSound.currentTime = 0;
        clickSound.play();
    });
});

// ===================================
// OCEAN & SKY ANIMATION
// ===================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sunset colors
const skyGradient = {
    top: { r: 20, g: 24, b: 82 },      // Deep blue
    mid: { r: 255, g: 94, b: 77 },     // Sunset red
    bottom: { r: 255, g: 166, b: 77 }  // Sunset orange
};

// Sun
let sun = {
    x: canvas.width * 0.75,
    y: canvas.height * 0.3,
    radius: 80
};

// Ocean waves
let waves = [];
for (let i = 0; i < 5; i++) {
    waves.push({
        y: canvas.height * 0.6 + i * 30,
        amplitude: 20 - i * 3,
        frequency: 0.01 + i * 0.002,
        speed: 0.02 + i * 0.005,
        offset: Math.random() * 100,
        opacity: 0.3 - i * 0.05
    });
}

// Birds
let birds = [];
for (let i = 0; i < 8; i++) {
    birds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        speed: Math.random() * 0.5 + 0.3,
        wingPhase: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.5 + 0.7
    });
}

// Clouds
let clouds = [];
for (let i = 0; i < 6; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        width: Math.random() * 150 + 100,
        speed: Math.random() * 0.1 + 0.05,
        opacity: Math.random() * 0.3 + 0.1
    });
}

function drawSky() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${skyGradient.top.r}, ${skyGradient.top.g}, ${skyGradient.top.b})`);
    gradient.addColorStop(0.5, `rgb(${skyGradient.mid.r}, ${skyGradient.mid.g}, ${skyGradient.mid.b})`);
    gradient.addColorStop(1, `rgb(${skyGradient.bottom.r}, ${skyGradient.bottom.g}, ${skyGradient.bottom.b})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    const sunGradient = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.radius);
    sunGradient.addColorStop(0, 'rgba(255, 220, 150, 1)');
    sunGradient.addColorStop(0.5, 'rgba(255, 150, 80, 0.8)');
    sunGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
    ctx.fill();

    // Sun reflection on water
    ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sun.x, canvas.height * 0.7, 60, 150, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(80, 70, 100, ${cloud.opacity})`;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width, 40, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + 50, cloud.y - 20, cloud.width * 0.7, 30, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x - 40, cloud.y - 10, cloud.width * 0.6, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Move clouds
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 200) {
            cloud.x = -200;
            cloud.y = Math.random() * canvas.height * 0.4;
        }
    });
}

function drawOcean(time) {
    waves.forEach((wave, index) => {
        ctx.strokeStyle = `rgba(100, 120, 180, ${wave.opacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 5) {
            const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Fill ocean
        if (index === waves.length - 1) {
            ctx.fillStyle = 'rgba(30, 50, 100, 0.6)';
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function drawBird(bird) {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.scale(bird.scale, bird.scale);
    
    // Bird body
    ctx.fillStyle = 'rgba(40, 40, 50, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingAngle = Math.sin(bird.wingPhase) * 0.5;
    ctx.strokeStyle = 'rgba(40, 40, 50, 0.7)';
    ctx.lineWidth = 2;
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, -10 + wingAngle * 10, -20, 0);
    ctx.stroke();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -10 + wingAngle * 10, 20, 0);
    ctx.stroke();
    
    ctx.restore();
}

function drawBirds() {
    birds.forEach(bird => {
        drawBird(bird);
        
        // Move bird
        bird.x += bird.speed;
        bird.wingPhase += 0.1;
        
        if (bird.x > canvas.width + 50) {
            bird.x = -50;
            bird.y = Math.random() * canvas.height * 0.4;
        }
    });
}

// Animation loop
let time = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawSky();
    drawClouds();
    drawOcean(time);
    drawBirds();
    
    time += 1;
    requestAnimationFrame(animate);
}

animate();

// Floating particles
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 20000);
}

setInterval(createParticle, 1000);

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    sun.x = canvas.width * 0.75;
});

// ===================================
// NAVIGATION
// ===================================
function goToSoloPlay() {
    fadeOut(() => window.location.href = 'solo-play.html');
}

function goToServerPick() {
    fadeOut(() => window.location.href = 'server-pick.html');
}

function showCredits() {
    fadeOut(() => window.location.href = 'credits.html');
}

function fadeOut(callback) {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '0';
    setTimeout(callback, 1000);
}
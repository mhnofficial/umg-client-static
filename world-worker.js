// world-worker.js

// --- PERLIN NOISE IMPLEMENTATION (MOVED FROM MAIN THREAD) ---
const Perlin = {
    p: [], seed: 0,
    init: function(seed) {
        this.seed = seed;
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p.push(Math.floor(this.rng(i) * 256));
        }
        this.p = this.p.concat(this.p);
    },
    rng: function(n) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return (this.seed + n) / 233280;
    },
    fade: t => t * t * t * (t * (t * 6 - 15) + 10),
    grad: (hash, x, y) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h == 12 || h == 14 ? x : 0;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    },
    noise: function(x, y) {
        let X = Math.floor(x) & 255, Y = Math.floor(y) & 255;                  
        x -= Math.floor(x); y -= Math.floor(y);                             
        let u = this.fade(x), v = this.fade(y);                               

        let A = this.p[X] + Y, AA = this.p[A], AB = this.p[A + 1],  
            B = this.p[X + 1] + Y, BA = this.p[B], BB = this.p[B + 1];

        let n = this.lerp(v, this.lerp(u, this.grad(AA, x, y), this.grad(BA, x - 1, y)),     
                        this.lerp(u, this.grad(AB, x, y - 1), this.grad(BB, x - 1, y - 1)));
        
        return n;
    },
    lerp: (t, a, b) => a + t * (b - a)
};

// --- MAP GENERATION FUNCTION ---
function generateMapData(seed, mapWidth, mapHeight) {
    Perlin.init(seed);
    let data = [];

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let freq = 0.005; 
            let octaves = 6;
            let persistence = 0.5;
            let elevation = 0;

            for (let i = 0; i < octaves; i++) {
                let n = Perlin.noise(x * freq, y * freq);
                if (i >= 3) n = Math.abs(n * 2) - 0.5; 
                elevation += n * persistence;
                freq *= 2.0;
                persistence *= 0.5;
            }

            let dx = x / mapWidth - 0.5;
            let dy = y / mapHeight - 0.5;
            let falloff = Math.pow(dx * dx + dy * dy, 1.0); 

            elevation -= falloff * 0.5; 
            
            data.push({ x, y, elevation, owner: null });
        }
    }
    return data;
}

// --- WORKER MESSAGE LISTENER ---
self.onmessage = function(e) {
    const { command, seed, width, height } = e.data;
    
    if (command === 'generate') {
        try {
            const mapData = generateMapData(seed, width, height);
            // Send the resulting map data back to the main thread
            self.postMessage({ mapData });
        } catch (error) {
            self.postMessage({ error: error.toString() });
        }
    }
};
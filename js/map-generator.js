/* ======================================================
   MAP GENERATOR — SOLO PLAY (FULL VERSION)
   ====================================================== */

const MapGen = (() => {
    const config = {
        territoryCount: 180,
        minSize: 300,
        maxSize: 1200,
        mapWidth: 4000,
        mapHeight: 2600
    };

    let canvas, ctx;
    let territories = [];
    let selectedTerritory = null;

    let camera = {
        x: 0,
        y: 0,
        zoom: 1
    };

    let dragging = false;
    let dragStart = { x: 0, y: 0 };

    /* ==========================
       INIT
       ========================== */
    function init() {
        const container = document.getElementById("gameMap");
        container.innerHTML = "";

        canvas = document.createElement("canvas");
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.cursor = "grab";
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");

        generateTerritories();
        centerMap();
        bindEvents();
        render();
    }

    /* ==========================
       TERRITORY GENERATION
       ========================== */
    function generateTerritories() {
        const points = d3.range(config.territoryCount).map(() => [
            Math.random() * config.mapWidth,
            Math.random() * config.mapHeight
        ]);

        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, config.mapWidth, config.mapHeight]);

        territories = points.map((p, i) => {
            const poly = voronoi.cellPolygon(i);
            if (!poly) return null;

            return {
                id: i,
                polygon: poly,
                owner: "neutral",
                terrain: randomTerrain(),
                troops: Math.floor(Math.random() * 50),
                discovered: false
            };
        }).filter(Boolean);
    }

    function randomTerrain() {
        const terrains = ["plains", "forest", "mountain", "desert", "coast"];
        return terrains[Math.floor(Math.random() * terrains.length)];
    }

    /* ==========================
       CAMERA
       ========================== */
    function centerMap() {
        camera.x = (config.mapWidth / 2) - (canvas.width / 2);
        camera.y = (config.mapHeight / 2) - (canvas.height / 2);
        camera.zoom = 0.6;
    }

    /* ==========================
       INPUT
       ========================== */
    function bindEvents() {
        canvas.addEventListener("mousedown", e => {
            dragging = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            canvas.style.cursor = "grabbing";
        });

        window.addEventListener("mouseup", () => {
            dragging = false;
            canvas.style.cursor = "grab";
        });

        window.addEventListener("mousemove", e => {
            if (!dragging) return;
            camera.x -= (e.clientX - dragStart.x) / camera.zoom;
            camera.y -= (e.clientY - dragStart.y) / camera.zoom;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            render();
        });

        canvas.addEventListener("wheel", e => {
            e.preventDefault();
            const zoomAmount = e.deltaY * -0.001;
            camera.zoom = Math.min(2, Math.max(0.3, camera.zoom + zoomAmount));
            document.getElementById("zoomDisplay").textContent =
                Math.round(camera.zoom * 100) + "%";
            render();
        });

        canvas.addEventListener("click", handleClick);
        window.addEventListener("resize", resize);
    }

    /* ==========================
       CLICK SELECTION
       ========================== */
    function handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / camera.zoom + camera.x;
        const my = (e.clientY - rect.top) / camera.zoom + camera.y;

        for (const t of territories) {
            if (pointInPolygon([mx, my], t.polygon)) {
                selectedTerritory = t;
                t.discovered = true;
                updateTooltip(t, e.clientX, e.clientY);
                render();
                return;
            }
        }
    }

    /* ==========================
       RENDER
       ========================== */
    function render() {
        ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.x * camera.zoom, -camera.y * camera.zoom);
        ctx.clearRect(camera.x, camera.y, canvas.width, canvas.height);

        territories.forEach(t => {
            ctx.beginPath();
            t.polygon.forEach(([x, y], i) => {
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();

            ctx.fillStyle = getTerritoryColor(t);
            ctx.fill();

            ctx.strokeStyle = "#111";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (t === selectedTerritory) {
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });
    }

    function getTerritoryColor(t) {
        if (!t.discovered) return "#111";
        if (t.owner === "player") return "#27ae60";
        if (t.owner === "enemy") return "#c0392b";
        return "#555";
    }

    /* ==========================
       UTILS
       ========================== */
    function pointInPolygon(point, vs) {
        let x = point[0], y = point[1];
        let inside = false;

        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];
            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        render();
    }

    function updateTooltip(t, x, y) {
        const tooltip = document.getElementById("territoryTooltip");
        tooltip.classList.add("visible");
        tooltip.style.left = x + 15 + "px";
        tooltip.style.top = y + 15 + "px";
        document.getElementById("tooltipTitle").textContent = "Territory " + t.id;
        document.getElementById("tooltipTerrain").textContent = "Terrain: " + t.terrain;
        document.getElementById("tooltipSize").textContent = "Troops: " + t.troops;
    }

    return { init };
})();

/* ==========================
   AUTO INIT WHEN GAME PHASE LOADS
   ========================== */
window.addEventListener("load", () => {
    setTimeout(() => {
        MapGen.init();
    }, 300);
});

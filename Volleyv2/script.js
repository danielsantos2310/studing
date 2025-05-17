class VolleyballTacticsBoard {
    constructor() {
        this.canvas = document.getElementById("court-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.drawingCanvas = document.createElement("canvas");
        this.drawingCtx = this.drawingCanvas.getContext("2d");

        // Constants
        this.PLAYER_RADIUS = 20;
        this.BALL_RADIUS = 15;
        this.PLAYER_COLLISION_RADIUS = this.PLAYER_RADIUS * 2;
        this.DEFAULT_PEN_COLOR = "#000000";
        this.DEFAULT_BRUSH_SIZE = 5;
        this.COURT_VIEW_MODE = "half"; // "full" or "half"

        this.players = [];
        this.draggingPlayer = null;
        this.draggingBall = false;
        this.brushSize = this.DEFAULT_BRUSH_SIZE;
        this.penColor = this.DEFAULT_PEN_COLOR;
        this.currentTool = null; // null, "draw", "erase"
        this.isDrawing = false;
        this.isErasing = false;

        this.ball = { x: 250, y: 150, radius: this.BALL_RADIUS }; 

        this.initializeRotationData();
        this.initCanvas();
        this.setupEventListeners();
        window.addEventListener("resize", () => this.handleResize());
        this.handleResize(); 
    }

    initializeRotationData() {
        this.courtPositions = {
            "1": { x: 0.83, y: 0.75 }, "2": { x: 0.83, y: 0.25 },
            "3": { x: 0.50, y: 0.25 }, "4": { x: 0.17, y: 0.25 },
            "5": { x: 0.17, y: 0.75 }, "6": { x: 0.50, y: 0.75 }
        };
        const rotation1ServeReceive = [
            { role: "OH1", gridPos: "1" }, { role: "MB2", gridPos: "2" },
            { role: "OPP", gridPos: "3" }, { role: "OH2", gridPos: "4" },
            { role: "L/MB1", gridPos: "5" }, { role: "S", gridPos: "6" }
        ];
        this.rotationFormations = { "serve-receive": {}, "transition-defense": {} };
        for (let i = 1; i <= 6; i++) {
            let currentRotation = [];
            if (i === 1) {
                currentRotation = rotation1ServeReceive;
            } else {
                const prevRotation = this.rotationFormations["serve-receive"][(i - 1).toString()];
                currentRotation = [
                    { role: prevRotation.find(p => p.gridPos === "2").role, gridPos: "1" },
                    { role: prevRotation.find(p => p.gridPos === "3").role, gridPos: "2" },
                    { role: prevRotation.find(p => p.gridPos === "4").role, gridPos: "3" },
                    { role: prevRotation.find(p => p.gridPos === "5").role, gridPos: "4" },
                    { role: prevRotation.find(p => p.gridPos === "6").role, gridPos: "5" },
                    { role: prevRotation.find(p => p.gridPos === "1").role, gridPos: "6" }
                ];
            }
            this.rotationFormations["serve-receive"][i.toString()] = currentRotation;
            this.rotationFormations["transition-defense"][i.toString()] = currentRotation;
        }
    }

    initCanvas() {
        const courtContainer = document.querySelector(".court-container");
        const style = getComputedStyle(courtContainer);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        let containerWidth = courtContainer.clientWidth - paddingX;
        let containerHeight = courtContainer.clientHeight - paddingY;
        const halfCourtAspectRatio = 4 / 3;
        let newWidth, newHeight;
        if (containerWidth / containerHeight > halfCourtAspectRatio) {
            newHeight = containerHeight;
            newWidth = newHeight * halfCourtAspectRatio;
        } else {
            newWidth = containerWidth;
            newHeight = newWidth / halfCourtAspectRatio;
        }
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.drawingCanvas.width = this.canvas.width;
        this.drawingCanvas.height = this.canvas.height;
        this.updateCanvas();
    }

    handleResize() {
        const oldCanvasWidth = this.canvas.width || (500 * (4/3));
        const oldCanvasHeight = this.canvas.height || 500;
        this.players.forEach(player => {
            player.xPercent = player.x / oldCanvasWidth;
            player.yPercent = player.y / oldCanvasHeight;
        });
        this.ball.xPercent = this.ball.x / oldCanvasWidth;
        this.ball.yPercent = this.ball.y / oldCanvasHeight;
        this.initCanvas();
        this.players.forEach(player => {
            player.x = player.xPercent * this.canvas.width;
            player.y = player.yPercent * this.canvas.height;
        });
        this.ball.x = this.ball.xPercent * this.canvas.width;
        this.ball.y = this.ball.yPercent * this.canvas.height;
        this.updateCanvas();
    }

    drawCourt() {
        const courtColor = getComputedStyle(this.canvas).getPropertyValue("--court-color").trim() || "#4CAF50";
        this.ctx.fillStyle = courtColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#FFFFFF";
        const lineWidth = Math.max(2, this.canvas.width * 0.004);
        this.ctx.lineWidth = lineWidth;
        const attackLineY = this.canvas.height / 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, attackLineY);
        this.ctx.lineTo(this.canvas.width, attackLineY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(0, lineWidth / 2);
        this.ctx.lineTo(this.canvas.width, lineWidth / 2);
        this.ctx.lineWidth = Math.max(3, this.canvas.width * 0.008);
        this.ctx.stroke();
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(0,0, this.canvas.width, this.canvas.height);
    }

    addPlayer(x, y, team = "home", role = null) {
        const baseScalingWidth = 400;
        const scaledPlayerRadius = this.PLAYER_RADIUS * (this.canvas.width / baseScalingWidth);
        const player = {
            id: Date.now() + Math.random(), x, y,
            xPercent: x / this.canvas.width, yPercent: y / this.canvas.height,
            team, role: role || `P${this.players.length + 1}`, radius: scaledPlayerRadius
        };
        this.players.push(player);
        return player;
    }

    drawPlayers() {
        const baseScalingWidth = 400;
        const basePlayerRadius = this.PLAYER_RADIUS * (this.canvas.width / baseScalingWidth);
        const baseFontSize = 12 * (this.canvas.width / baseScalingWidth);
        this.players.forEach(player => {
            player.radius = basePlayerRadius;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = player.team === "home" ? "blue" : (player.team === "opponent" ? "red" : "grey");
            this.ctx.fill();
            this.ctx.lineWidth = Math.max(1, basePlayerRadius * 0.1);
            this.ctx.strokeStyle = "#FFFFFF";
            this.ctx.stroke();
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = `bold ${baseFontSize}px Arial`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(player.role, player.x, player.y);
        });
    }

    drawBall() {
        const baseScalingWidth = 400;
        const baseBallRadius = this.BALL_RADIUS * (this.canvas.width / baseScalingWidth);
        this.ball.radius = baseBallRadius;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = "orange";
        this.ctx.fill();
        this.ctx.lineWidth = Math.max(1, baseBallRadius * 0.1);
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.stroke();
    }

    applyRotationFormation(rotationId, formationType) {
        this.players = [];
        const formationData = this.rotationFormations[formationType]?.[rotationId];
        if (!formationData) { console.error(`Formation data not found for ${formationType, rotationId}`); return; }
        formationData.forEach(playerInfo => {
            const pos = this.courtPositions[playerInfo.gridPos];
            if (pos) {
                const x = pos.x * this.canvas.width;
                const y = pos.y * this.canvas.height;
                this.addPlayer(x, y, "home", playerInfo.role);
            } else { console.error(`Position key ${playerInfo.gridPos} not found.`); }
        });
        this.updateCanvas();
    }

    getEventCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    handleStart(event) {
        event.preventDefault(); // Prevent default touch actions like scrolling
        const { x, y } = this.getEventCoordinates(event);

        const dxBall = this.ball.x - x;
        const dyBall = this.ball.y - y;
        if (Math.sqrt(dxBall * dxBall + dyBall * dyBall) <= this.ball.radius) {
            this.draggingBall = true; this.currentTool = null; this.updateToolButtons(); return;
        }
        this.draggingPlayer = this.players.find(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < p.radius);
        if (this.draggingPlayer) {
            this.currentTool = null; this.updateToolButtons(); return;
        }
        const baseScalingWidth = 400;
        if (this.currentTool === "draw") {
            this.isDrawing = true; this.drawingCtx.globalCompositeOperation = "source-over";
            this.drawingCtx.strokeStyle = this.penColor;
            this.drawingCtx.lineWidth = this.brushSize * (this.canvas.width / baseScalingWidth);
            this.drawingCtx.lineCap = "round"; this.drawingCtx.lineJoin = "round";
            this.drawingCtx.beginPath(); this.drawingCtx.moveTo(x, y);
        } else if (this.currentTool === "erase") {
            this.isErasing = true; this.drawingCtx.globalCompositeOperation = "destination-out";
            this.drawingCtx.lineWidth = this.brushSize * (this.canvas.width / baseScalingWidth);
            this.drawingCtx.lineCap = "round"; this.drawingCtx.lineJoin = "round";
            this.drawingCtx.beginPath(); this.drawingCtx.moveTo(x, y);
        }
    }

    handleMove(event) {
        event.preventDefault();
        if (!this.draggingPlayer && !this.draggingBall && !this.isDrawing && !this.isErasing) return;
        const { x, y } = this.getEventCoordinates(event);

        if (this.draggingBall) {
            this.ball.x = x;
            this.ball.y = y;
            this.ball.xPercent = this.ball.x / this.canvas.width;
            this.ball.yPercent = this.ball.y / this.canvas.height;
            this.updateCanvas();
            return;
        }

        if (this.draggingPlayer) {
            const dragged = this.draggingPlayer;

            // Example: Setter (Zone 6) movement constraints
            if (dragged.role === "S") {
                const mb = this.players.find(p => p.role === "MB2"); // Middle Blocker in Zone 1
                const h2 = this.players.find(p => p.role === "OH2"); // Outside Hitter 2 in Zone 5

                if (mb && x < mb.x) {
                    return; // Prevent Setter from moving left of MB
                }
                if (h2 && y < h2.y) {
                    return; // Prevent Setter from moving in front of H2
                }
            }

            // Update player position only if no rules are violated
            this.draggingPlayer.x = x;
            this.draggingPlayer.y = y;
            this.draggingPlayer.xPercent = this.draggingPlayer.x / this.canvas.width;
            this.draggingPlayer.yPercent = this.draggingPlayer.y / this.canvas.height;
            this.updateCanvas();
        }

        if (this.isDrawing) {
            this.drawingCtx.lineTo(x, y);
            this.drawingCtx.stroke();
            this.updateCanvas();
        } else if (this.isErasing) {
            this.drawingCtx.lineTo(x, y);
            this.drawingCtx.stroke();
            this.updateCanvas();
        }
    }

    handleEnd(event) {
        event.preventDefault();
        if (this.isDrawing || this.isErasing) { this.drawingCtx.closePath(); }
        this.draggingPlayer = null; this.draggingBall = false; 
        this.isDrawing = false; this.isErasing = false;
        this.drawingCtx.globalCompositeOperation = "source-over";
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener("mousedown", (e) => this.handleStart(e));
        this.canvas.addEventListener("mousemove", (e) => this.handleMove(e));
        this.canvas.addEventListener("mouseup", (e) => this.handleEnd(e));
        this.canvas.addEventListener("mouseleave", (e) => this.handleEnd(e)); // Treat mouseleave as an end event

        // Touch events
        this.canvas.addEventListener("touchstart", (e) => this.handleStart(e));
        this.canvas.addEventListener("touchmove", (e) => this.handleMove(e));
        this.canvas.addEventListener("touchend", (e) => this.handleEnd(e));
        this.canvas.addEventListener("touchcancel", (e) => this.handleEnd(e)); // Treat touchcancel as an end event

        document.getElementById("draw-mode").addEventListener("click", () => {
            this.currentTool = this.currentTool === "draw" ? null : "draw";
            if (this.currentTool === "draw") { this.drawingCtx.globalCompositeOperation = "source-over";}
            this.updateToolButtons();
        });
        document.getElementById("erase-mode").addEventListener("click", () => {
            this.currentTool = this.currentTool === "erase" ? null : "erase"; this.updateToolButtons();
        });
        document.getElementById("clear-all").addEventListener("click", () => {
            this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.updateCanvas();
        });
        document.getElementById("brush-size").addEventListener("input", (e) => {
            this.brushSize = parseInt(e.target.value);
            const preview = document.getElementById("brush-preview");
            const baseScalingWidth = 400;
            const scaledBrushSize = this.brushSize * (this.canvas.width / baseScalingWidth);
            preview.style.width = `${scaledBrushSize}px`; preview.style.height = `${scaledBrushSize}px`;
        });
        document.getElementById("pen-color").addEventListener("input", (e) => {
            this.penColor = e.target.value;
            document.getElementById("brush-preview").style.backgroundColor = this.penColor;
        });
        document.getElementById("add-player").addEventListener("click", () => {
            const x = this.canvas.width / 2;
            const y = this.canvas.height / 2;
            this.addPlayer(x, y, "home"); 
            this.updateCanvas();
        });
        document.getElementById("toggle-dark-mode").addEventListener("click", () => {
            document.body.classList.toggle("dark-mode"); this.updateCanvas();
        });
        document.getElementById("apply-rotation").addEventListener("click", () => {
            const rotationId = document.getElementById("rotation-select").value;
            const formationType = document.getElementById("formation-type-select").value;
            this.applyRotationFormation(rotationId, formationType);
        });
    }

    updateToolButtons() {
        const drawBtn = document.getElementById("draw-mode");
        const eraseBtn = document.getElementById("erase-mode");
        [drawBtn, eraseBtn].forEach(btn => {
            const buttonToolName = btn.id.split("-")[0];
            btn.style.backgroundColor = buttonToolName === this.currentTool ? "var(--button-hover)" : "var(--button-bg)";
        });
    }

    updateCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCourt();
        this.ctx.drawImage(this.drawingCanvas, 0, 0);
        this.drawPlayers();
        this.drawBall();
    }

    getRow(pos) {
        return ["1", "6", "5"].includes(pos) ? "back" : "front";
    }

    getColumn(pos) {
        if (["4", "5"].includes(pos)) return "left";
        if (["3", "6"].includes(pos)) return "middle";
        if (["2", "1"].includes(pos)) return "right";
        return "unknown";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new VolleyballTacticsBoard();
});


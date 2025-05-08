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
        this.courtPositions = { // For half-court view, net at top (y=0)
            "R1L": { x: 0.25, y: 0.20 }, "R1R": { x: 0.75, y: 0.20 }, // Front row (near net)
            "R2L": { x: 0.25, y: 0.50 }, "R2R": { x: 0.75, y: 0.50 }, // Middle row
            "R3L": { x: 0.25, y: 0.80 }, "R3R": { x: 0.75, y: 0.80 }  // Back row
        };

        // Data from the diagram: https://www.flovolleyball.tv/articles/6006915-an-explanation-of-the-5-1-volleyball-rotation
        // Player roles are as per the diagram.
        // gridPos maps to the 3x2 layout: R1L, R1R, R2L, R2R, R3L, R3R
        this.rotationFormations = {
            "serve-receive": {
                "1": [
                    { role: "OH2", gridPos: "R1L" }, { role: "RS", gridPos: "R1R" },
                    { role: "MB1/L", gridPos: "R2L" }, { role: "MB2", gridPos: "R2R" },
                    { role: "S", gridPos: "R3L" }, { role: "OH1", gridPos: "R3R" }
                ],
                "2": [
                    { role: "OH1", gridPos: "R1L" }, { role: "OH2", gridPos: "R1R" },
                    { role: "S", gridPos: "R2L" }, { role: "MB1/L", gridPos: "R2R" },
                    { role: "RS", gridPos: "R3L" }, { role: "MB2", gridPos: "R3R" }
                ],
                "3": [
                    { role: "MB2", gridPos: "R1L" }, { role: "OH1", gridPos: "R1R" },
                    { role: "RS", gridPos: "R2L" }, { role: "S", gridPos: "R2R" },
                    { role: "MB1/L", gridPos: "R3L" }, { role: "OH2", gridPos: "R3R" }
                ],
                "4": [
                    { role: "S", gridPos: "R1L" }, { role: "MB2", gridPos: "R1R" },
                    { role: "OH2", gridPos: "R2L" }, { role: "RS", gridPos: "R2R" },
                    { role: "OH1", gridPos: "R3L" }, { role: "MB1/L", gridPos: "R3R" }
                ],
                "5": [
                    { role: "RS", gridPos: "R1L" }, { role: "S", gridPos: "R1R" },
                    { role: "MB1/L", gridPos: "R2L" }, { role: "OH2", gridPos: "R2R" },
                    { role: "MB2", gridPos: "R3L" }, { role: "OH1", gridPos: "R3R" }
                ],
                "6": [
                    { role: "OH1", gridPos: "R1L" }, { role: "RS", gridPos: "R1R" },
                    { role: "MB2", gridPos: "R2L" }, { role: "MB1/L", gridPos: "R2R" },
                    { role: "OH2", gridPos: "R3L" }, { role: "S", gridPos: "R3R" }
                ]
            },
            "transition-defense": {
                "1": [
                    { role: "RS", gridPos: "R1L" }, { role: "S", gridPos: "R1R" },
                    { role: "MB2", gridPos: "R2L" }, { role: "OH2", gridPos: "R2R" },
                    { role: "OH1", gridPos: "R3L" }, { role: "L/MB1", gridPos: "R3R" }
                ],
                "2": [
                    { role: "S", gridPos: "R1L" }, { role: "RS", gridPos: "R1R" },
                    { role: "OH1", gridPos: "R2L" }, { role: "MB2", gridPos: "R2R" },
                    { role: "L/MB1", gridPos: "R3L" }, { role: "OH2", gridPos: "R3R" }
                ],
                "3": [
                    { role: "RS", gridPos: "R1L" }, { role: "S", gridPos: "R1R" },
                    { role: "MB1", gridPos: "R2L" }, { role: "OH1", gridPos: "R2R" }, // Diagram shows MB1, not L/MB1
                    { role: "OH2", gridPos: "R3L" }, { role: "L/MB2", gridPos: "R3R" }
                ],
                "4": [
                    { role: "S", gridPos: "R1L" }, { role: "RS", gridPos: "R1R" },
                    { role: "OH2", gridPos: "R2L" }, { role: "MB1", gridPos: "R2R" },
                    { role: "L/MB2", gridPos: "R3L" }, { role: "OH1", gridPos: "R3R" }
                ],
                "5": [
                    { role: "RS", gridPos: "R1L" }, { role: "S", gridPos: "R1R" },
                    { role: "MB1", gridPos: "R2L" }, { role: "OH2", gridPos: "R2R" },
                    { role: "OH1", gridPos: "R3L" }, { role: "L/MB2", gridPos: "R3R" }
                ],
                "6": [
                    { role: "S", gridPos: "R1L" }, { role: "RS", gridPos: "R1R" },
                    { role: "OH1", gridPos: "R2L" }, { role: "MB1", gridPos: "R2R" },
                    { role: "L/MB2", gridPos: "R3L" }, { role: "OH2", gridPos: "R3R" }
                ]
            }
        };
    }

    initCanvas() {
        const courtContainer = document.querySelector(".court-container");
        const style = getComputedStyle(courtContainer);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        let containerWidth = courtContainer.clientWidth - paddingX;
        let containerHeight = courtContainer.clientHeight - paddingY;
        const halfCourtAspectRatio = 4 / 3;
        const fullCourtAspectRatio = 9 / 18;
        let newWidth, newHeight;
        if (this.COURT_VIEW_MODE === "half") {
            if (containerWidth / containerHeight > halfCourtAspectRatio) {
                newHeight = containerHeight;
                newWidth = newHeight * halfCourtAspectRatio;
            } else {
                newWidth = containerWidth;
                newHeight = newWidth / halfCourtAspectRatio;
            }
        } else {
            if (containerWidth / containerHeight > fullCourtAspectRatio) {
                newHeight = containerHeight;
                newWidth = newHeight * fullCourtAspectRatio;
            } else {
                newWidth = containerWidth;
                newHeight = newWidth / fullCourtAspectRatio;
            }
        }
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.drawingCanvas.width = this.canvas.width;
        this.drawingCanvas.height = this.canvas.height;
        this.updateCanvas();
    }

    handleResize() {
        const oldCanvasWidth = this.canvas.width || (this.COURT_VIEW_MODE === "half" ? 500 * (4/3) : 500);
        const oldCanvasHeight = this.canvas.height || (this.COURT_VIEW_MODE === "half" ? 500 : 600);
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
        if (this.COURT_VIEW_MODE === "half") {
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
        } else {
            const attackLineFromNet = this.canvas.height / 6;
            const netPosition = this.canvas.height / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, netPosition - attackLineFromNet);
            this.ctx.lineTo(this.canvas.width, netPosition - attackLineFromNet);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, netPosition + attackLineFromNet);
            this.ctx.lineTo(this.canvas.width, netPosition + attackLineFromNet);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, netPosition);
            this.ctx.lineTo(this.canvas.width, netPosition);
            this.ctx.lineWidth = Math.max(3, this.canvas.width * 0.006);
            this.ctx.stroke();
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(0,0, this.canvas.width, this.canvas.height);
        }
    }

    addPlayer(x, y, team = "home", role = null) {
        const baseScalingWidth = this.COURT_VIEW_MODE === "half" ? 400 : 500;
        const scaledPlayerRadius = this.PLAYER_RADIUS * (this.canvas.width / baseScalingWidth);
        const scaledCollisionRadius = scaledPlayerRadius * 1.5; // Reduced slightly to allow closer placement from formations

        // Simplified overlap check for programmatic placement, can be refined
        // const isOverlapping = this.players.some(p => {
        //     const dx = p.x - x;
        //     const dy = p.y - y;
        //     return Math.sqrt(dx * dx + dy * dy) < scaledCollisionRadius;
        // });
        // if (isOverlapping && !role) { // Only alert for manual placement for now
        //     alert("Cannot place players too close to each other!");
        //     return null;
        // }

        const player = {
            id: Date.now() + Math.random(), // Ensure unique ID
            x,
            y,
            xPercent: x / this.canvas.width,
            yPercent: y / this.canvas.height,
            team,
            role: role || `P${this.players.length + 1}`,
            radius: scaledPlayerRadius
        };
        this.players.push(player);
        return player;
    }

    drawPlayers() {
        const baseScalingWidth = this.COURT_VIEW_MODE === "half" ? 400 : 500;
        const basePlayerRadius = this.PLAYER_RADIUS * (this.canvas.width / baseScalingWidth);
        const baseFontSize = 12 * (this.canvas.width / baseScalingWidth); // Adjusted font size slightly

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
        const baseScalingWidth = this.COURT_VIEW_MODE === "half" ? 400 : 500;
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
        this.players = []; // Clear existing players
        const formationData = this.rotationFormations[formationType]?.[rotationId];
        if (!formationData) {
            console.error(`Formation data not found for ${formationType}, rotation ${rotationId}`);
            return;
        }

        formationData.forEach(playerInfo => {
            const pos = this.courtPositions[playerInfo.gridPos];
            if (pos) {
                const x = pos.x * this.canvas.width;
                const y = pos.y * this.canvas.height;
                this.addPlayer(x, y, "home", playerInfo.role);
            } else {
                console.error(`Position key ${playerInfo.gridPos} not found in courtPositions.`);
            }
        });
        this.updateCanvas();
    }

    setupEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const dxBall = this.ball.x - x;
            const dyBall = this.ball.y - y;
            if (Math.sqrt(dxBall * dxBall + dyBall * dyBall) <= this.ball.radius) {
                this.draggingBall = true; this.currentTool = null; this.updateToolButtons(); return;
            }
            this.draggingPlayer = this.players.find(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < p.radius);
            if (this.draggingPlayer) {
                this.currentTool = null; this.updateToolButtons(); return;
            }
            const baseScalingWidth = this.COURT_VIEW_MODE === "half" ? 400 : 500;
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
        });
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width; const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX; const y = (e.clientY - rect.top) * scaleY;
            if (this.draggingBall) {
                this.ball.x = x; this.ball.y = y;
                this.ball.xPercent = this.ball.x / this.canvas.width; this.ball.yPercent = this.ball.y / this.canvas.height;
                this.updateCanvas();
            }
            if (this.draggingPlayer) {
                this.draggingPlayer.x = x; this.draggingPlayer.y = y;
                this.draggingPlayer.xPercent = this.draggingPlayer.x / this.canvas.width;
                this.draggingPlayer.yPercent = this.draggingPlayer.y / this.canvas.height;
                this.updateCanvas();
            }
            if (this.isDrawing) {
                this.drawingCtx.lineTo(x, y); this.drawingCtx.stroke(); this.updateCanvas();
            } else if (this.isErasing) {
                this.drawingCtx.lineTo(x, y); this.drawingCtx.stroke(); this.updateCanvas();
            }
        });
        this.canvas.addEventListener("mouseup", () => {
            if (this.isDrawing || this.isErasing) { this.drawingCtx.closePath(); }
            this.draggingPlayer = null; this.draggingBall = false; this.isDrawing = false; this.isErasing = false;
            this.drawingCtx.globalCompositeOperation = "source-over"; 
        });
        this.canvas.addEventListener("mouseleave", () => {
            if (this.isDrawing || this.isErasing) { this.drawingCtx.closePath(); }
            this.draggingPlayer = null; this.draggingBall = false; this.isDrawing = false; this.isErasing = false;
            this.drawingCtx.globalCompositeOperation = "source-over";
        });
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
            const baseScalingWidth = this.COURT_VIEW_MODE === "half" ? 400 : 500;
            const scaledBrushSize = this.brushSize * (this.canvas.width / baseScalingWidth);
            preview.style.width = `${scaledBrushSize}px`; preview.style.height = `${scaledBrushSize}px`;
        });
        document.getElementById("pen-color").addEventListener("input", (e) => {
            this.penColor = e.target.value;
            document.getElementById("brush-preview").style.backgroundColor = this.penColor;
        });
        document.getElementById("add-player").addEventListener("click", () => {
            const x = this.canvas.width / (this.COURT_VIEW_MODE === "half" ? 2 : 4);
            const y = this.canvas.height / 2;
            this.addPlayer(x, y, "home"); // Adds player with default role Px
            this.updateCanvas();
        });
        document.getElementById("toggle-dark-mode").addEventListener("click", () => {
            document.body.classList.toggle("dark-mode"); this.updateCanvas();
        });
        // Rotation Toolbar Listener
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
}

document.addEventListener("DOMContentLoaded", () => {
    new VolleyballTacticsBoard();
});


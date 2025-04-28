// Main application
class VolleyballTacticsBoard {
    constructor() {
        this.canvas = document.getElementById('court-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.players = [];
        this.draggingPlayer = null;
        this.draggingBall = false;
        this.brushSize = 5; // Default brush size
        this.penColor = '#000000';
        this.currentTool = null; // No tool selected initially
        this.drawing = false;
        this.erasing = false;

        this.ball = { x: 500, y: 300, radius: 15 }; // Ball's initial position

        this.initCanvas();
        this.drawCourt();
        this.updateCanvas(); // Ensure everything is drawn initially
        this.setupEventListeners();
    }

    initCanvas() {
        this.canvas.width = 1000;
        this.canvas.height = 600;
        this.drawingCanvas.width = 1000;
        this.drawingCanvas.height = 600;
    }

    drawCourt() {
        // Draw volleyball court with zones, net, boundaries
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw net
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.canvas.width/2 - 2, 0, 4, this.canvas.height);
        
        // Draw attack lines, etc.
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2 - 150, 0);
        this.ctx.lineTo(this.canvas.width / 2 - 150, this.canvas.height);
        this.ctx.moveTo(this.canvas.width / 2 + 150, 0);
        this.ctx.lineTo(this.canvas.width / 2 + 150, this.canvas.height);
        this.ctx.stroke();
    }

    addPlayer(x, y, team = 'home') {
        const isOverlapping = this.players.some(player => {
            const dx = player.x - x;
            const dy = player.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 40; // Minimum distance of 40px
        });

        if (isOverlapping) {
            alert('Cannot place players too close to each other!');
            return;
        }

        const player = {
            id: Date.now(),
            x,
            y,
            team,
            number: this.players.length + 1
        };
        this.players.push(player);
        this.updateCanvas(); // Ensure the canvas is updated after adding a player
    }

    drawPlayers() {
        this.players.forEach(player => {
            // Player circle
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = player.team === 'home' ? 'blue' : 'red';
            this.ctx.fill();

            // Player border
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();

            // Player number
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(player.number, player.x, player.y);
        });
    }

    drawBall() {
        // Draw the ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'orange';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if clicked on the ball
            const dx = this.ball.x - x;
            const dy = this.ball.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= this.ball.radius) {
                this.draggingBall = true;
                return;
            }

            // Check if clicked on a player
            this.draggingPlayer = this.players.find(p =>
                Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 20
            );

            if (this.currentTool === 'draw') {
                this.drawing = true;
                this.drawingCtx.strokeStyle = this.penColor;
                this.drawingCtx.lineWidth = this.brushSize;
                this.drawingCtx.beginPath();
                this.drawingCtx.moveTo(x, y);
            } else if (this.currentTool === 'erase') {
                this.erasing = true;
                this.drawingCtx.strokeStyle = '#4CAF50'; // Background color
                this.drawingCtx.lineWidth = this.brushSize;
                this.drawingCtx.beginPath();
                this.drawingCtx.moveTo(x, y);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.draggingBall) {
                this.ball.x = x;
                this.ball.y = y;
                this.updateCanvas();
            }

            if (this.draggingPlayer) {
                this.draggingPlayer.x = x;
                this.draggingPlayer.y = y;
                this.updateCanvas();
            }

            if (this.drawing) {
                this.drawingCtx.lineTo(x, y);
                this.drawingCtx.stroke();
                this.updateCanvas();
            }

            if (this.erasing) {
                this.drawingCtx.lineTo(x, y);
                this.drawingCtx.stroke();
                this.updateCanvas();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.draggingPlayer = null;
            this.draggingBall = false;
            this.drawing = false;
            this.erasing = false;
        });

        document.getElementById('draw-mode').addEventListener('click', () => {
            this.currentTool = this.currentTool === 'draw' ? null : 'draw'; // Toggle draw mode
        });

        document.getElementById('erase-mode').addEventListener('click', () => {
            this.currentTool = this.currentTool === 'erase' ? null : 'erase'; // Toggle erase mode
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.updateCanvas();
        });

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = e.target.value;

            // Update brush preview size
            const preview = document.getElementById('brush-preview');
            preview.style.width = `${this.brushSize}px`;
            preview.style.height = `${this.brushSize}px`;
        });

        document.getElementById('pen-color').addEventListener('input', (e) => {
            this.penColor = e.target.value;

            // Update brush preview color
            const preview = document.getElementById('brush-preview');
            preview.style.backgroundColor = this.penColor;
        });

        document.getElementById('add-player').addEventListener('click', () => {
            // Add a player at a default position (e.g., center of the court)
            const x = this.canvas.width / 2;
            const y = this.canvas.height / 2;
            this.addPlayer(x, y, 'home');
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCanvas() {
        // Clear the main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw the court
        this.drawCourt();

        // Draw the drawing layer
        this.ctx.drawImage(this.drawingCanvas, 0, 0);

        // Redraw the players
        this.drawPlayers();

        // Redraw the ball
        this.drawBall();
    }
}

// Initialize app
new VolleyballTacticsBoard();
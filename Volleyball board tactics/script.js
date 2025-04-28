class VolleyballTacticsBoard {
    constructor() {
        this.canvas = document.getElementById('court-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.players = [];
        this.draggingPlayer = null;
        this.draggingBall = false;
        this.brushSize = 5;
        this.penColor = '#000000';
        this.currentTool = null;
        this.drawing = false;
        this.erasing = false;
        this.zoneHighlighting = false;

        this.ball = { x: 250, y: 300, radius: 15 };

        this.initCanvas();
        this.drawCourt();
        this.updateCanvas();
        this.setupEventListeners();
    }

    initCanvas() {
        this.canvas.width = 500;
        this.canvas.height = 600;
        this.drawingCanvas.width = 500;
        this.drawingCanvas.height = 600;
    }

    drawCourt() {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.canvas.width - 2, 0, 4, this.canvas.height);

        const attackLinePosition = this.canvas.width - (this.canvas.width / 3);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(attackLinePosition, 0);
        this.ctx.lineTo(attackLinePosition, this.canvas.height);
        this.ctx.stroke();
    }

    addPlayer(x, y, team = 'home') {
        const isOverlapping = this.players.some(player => {
            const dx = player.x - x;
            const dy = player.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 40;
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
        this.updateCanvas();
    }

    drawPlayers() {
        this.players.forEach(player => {
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = player.team === 'home' ? 'blue' : 'red';
            this.ctx.fill();

            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(player.number, player.x, player.y);
        });
    }

    drawBall() {
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

            const dx = this.ball.x - x;
            const dy = this.ball.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= this.ball.radius) {
                this.draggingBall = true;
                return;
            }

            this.draggingPlayer = this.players.find(p =>
                Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 20
            );

            if (this.currentTool === 'draw') {
                this.drawing = true;
                this.drawingCtx.strokeStyle = this.penColor;
                this.drawingCtx.lineWidth = this.brushSize;
                this.drawingCtx.lineCap = 'round';
                this.drawingCtx.lineJoin = 'round';
                this.drawingCtx.beginPath();
                this.drawingCtx.moveTo(x, y);
            } else if (this.currentTool === 'erase') {
                this.erasing = true;
                this.drawingCtx.strokeStyle = '#4CAF50';
                this.drawingCtx.lineWidth = this.brushSize;
                this.drawingCtx.lineCap = 'round';
                this.drawingCtx.lineJoin = 'round';
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
            this.currentTool = this.currentTool === 'draw' ? null : 'draw';
            this.updateToolButtons();
        });

        document.getElementById('erase-mode').addEventListener('click', () => {
            this.currentTool = this.currentTool === 'erase' ? null : 'erase';
            this.updateToolButtons();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.updateCanvas();
        });

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            const preview = document.getElementById('brush-preview');
            
            // Update preview size
            preview.style.width = `${this.brushSize}px`;
            preview.style.height = `${this.brushSize}px`;
            
            // Update preview position
            const slider = e.target;
            const percentage = (this.brushSize - slider.min) / (slider.max - slider.min);
            const thumbPosition = percentage * slider.offsetWidth;
            
            preview.style.left = `${thumbPosition}px`;
            preview.style.transform = 'translateX(-50%)';
        });

        document.getElementById('pen-color').addEventListener('input', (e) => {
            this.penColor = e.target.value;
            document.getElementById('brush-preview').style.backgroundColor = this.penColor;
        });

        document.getElementById('add-player').addEventListener('click', () => {
            const x = this.canvas.width / 2;
            const y = this.canvas.height / 2;
            this.addPlayer(x, y, 'home');
        });

        document.getElementById('toggle-dark-mode').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    updateToolButtons() {
        const drawBtn = document.getElementById('draw-mode');
        const eraseBtn = document.getElementById('erase-mode');
        
        drawBtn.style.backgroundColor = this.currentTool === 'draw' ? '#0056b3' : '';
        eraseBtn.style.backgroundColor = this.currentTool === 'erase' ? '#0056b3' : '';
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCourt();
        this.ctx.drawImage(this.drawingCanvas, 0, 0);
        this.drawPlayers();
        this.drawBall();
    }
}

new VolleyballTacticsBoard();
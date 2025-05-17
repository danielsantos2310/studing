document.addEventListener('DOMContentLoaded', () => {
    class VolleyballTacticsBoard {
      constructor() {
        this.currentFormation = '5-1';
        this.isServeReceive = true;
        this.rotation = 0;
        this.players = [];
        this.draggedPlayer = null;
        
        // DOM elements
        this.courtContainer = document.getElementById('court-container');
        this.benchArea = document.getElementById('bench-area');
        
        this.initPlayers();
        this.setupEventListeners();
        this.updatePlayerPositions();
      }
      
      initPlayers() {
        // Create player objects
        this.players = [
          { id: '1', role: 'setter', position: 1, element: document.querySelector('[data-id="1"]') },
          { id: '2', role: 'outside', position: 4, element: document.querySelector('[data-id="2"]') },
          { id: '3', role: 'outside', position: 2, element: document.querySelector('[data-id="3"]') },
          { id: '4', role: 'middle', position: 3, element: document.querySelector('[data-id="4"]') },
          { id: '5', role: 'middle', position: 6, element: document.querySelector('[data-id="5"]') },
          { id: '6', role: 'libero', position: 5, element: document.querySelector('[data-id="6"]') }
        ];
        
        // Set initial positions
        this.positionBenchPlayers();
      }
      
      positionBenchPlayers() {
        const benchItems = Array.from(this.benchArea.children);
        const benchRect = this.benchArea.getBoundingClientRect();
        
        benchItems.forEach((player, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          
          player.style.position = 'absolute';
          player.style.left = `${(col * 60) + 30}px`;
          player.style.top = `${(row * 60) + 30}px`;
        });
      }
      
      setupEventListeners() {
        // Formation change
        document.getElementById('formation-select').addEventListener('change', (e) => {
          this.currentFormation = e.target.value;
          this.updatePlayerPositions();
        });
        
        // Mode toggle
        document.getElementById('serve-mode').addEventListener('click', () => {
          this.isServeReceive = true;
          document.getElementById('serve-mode').classList.add('active');
          document.getElementById('attack-mode').classList.remove('active');
          this.updatePlayerPositions();
        });
        
        document.getElementById('attack-mode').addEventListener('click', () => {
          this.isServeReceive = false;
          document.getElementById('attack-mode').classList.add('active');
          document.getElementById('serve-mode').classList.remove('active');
          this.updatePlayerPositions();
        });
        
        // Rotation controls
        document.getElementById('rotate-left').addEventListener('click', () => this.rotate('left'));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotate('right'));
        
        // Action buttons
        document.getElementById('reset-btn').addEventListener('click', () => {
          this.rotation = 0;
          this.updatePlayerPositions();
        });
        
        // Drag and drop setup
        this.setupDragAndDrop();
      }
      
      setupDragAndDrop() {
        // Add event listeners to all players
        this.players.forEach(player => {
          player.element.addEventListener('dragstart', this.handleDragStart.bind(this));
          player.element.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Court container drop zone
        this.courtContainer.addEventListener('dragover', (e) => {
          e.preventDefault();
          this.highlightClosestPosition(e.clientX, e.clientY);
        });
        
        this.courtContainer.addEventListener('dragleave', () => {
          this.removePositionHighlights();
        });
        
        this.courtContainer.addEventListener('drop', this.handleDrop.bind(this));
      }
      
      handleDragStart(e) {
        this.draggedPlayer = e.target;
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        
        setTimeout(() => {
          e.target.classList.add('dragging');
        }, 0);
      }
      
      handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.removePositionHighlights();
      }
      
      highlightClosestPosition(x, y) {
        this.removePositionHighlights();
        
        const courtRect = this.courtContainer.getBoundingClientRect();
        const svg = this.courtContainer.querySelector('svg');
        const svgRect = svg.getBoundingClientRect();
        
        // Convert mouse coordinates to SVG coordinates
        const xRatio = 300 / svgRect.width;
        const yRatio = 200 / svgRect.height;
        
        const svgX = (x - svgRect.left) * xRatio;
        const svgY = (y - svgRect.top) * yRatio;
        
        // Find closest position marker
        const markers = Array.from(this.courtContainer.querySelectorAll('.position-marker'));
        let closestMarker = null;
        let minDistance = Infinity;
        
        markers.forEach(marker => {
          const markerX = parseFloat(marker.getAttribute('cx'));
          const markerY = parseFloat(marker.getAttribute('cy'));
          const distance = Math.sqrt((svgX - markerX) ** 2 + (svgY - markerY) ** 2);
          
          if (distance < minDistance && distance < 30) {
            minDistance = distance;
            closestMarker = marker;
          }
        });
        
        if (closestMarker) {
          closestMarker.classList.add('highlight');
        }
      }
      
      removePositionHighlights() {
        const markers = this.courtContainer.querySelectorAll('.position-marker');
        markers.forEach(marker => marker.classList.remove('highlight'));
      }
      
      handleDrop(e) {
        e.preventDefault();
        this.removePositionHighlights();
        
        if (!this.draggedPlayer) return;
        
        const playerId = e.dataTransfer.getData('text/plain');
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        // Get SVG coordinates
        const svg = this.courtContainer.querySelector('svg');
        const svgRect = svg.getBoundingClientRect();
        const xRatio = 300 / svgRect.width;
        const yRatio = 200 / svgRect.height;
        
        const svgX = (e.clientX - svgRect.left) * xRatio;
        const svgY = (e.clientY - svgRect.top) * yRatio;
        
        // Find closest position marker
        const markers = Array.from(this.courtContainer.querySelectorAll('.position-marker'));
        let closestMarker = null;
        let minDistance = Infinity;
        
        markers.forEach(marker => {
          const markerX = parseFloat(marker.getAttribute('cx'));
          const markerY = parseFloat(marker.getAttribute('cy'));
          const distance = Math.sqrt((svgX - markerX) ** 2 + (svgY - markerY) ** 2);
          
          if (distance < minDistance && distance < 30) {
            minDistance = distance;
            closestMarker = marker;
          }
        });
        
        if (closestMarker) {
          const newPosition = parseInt(closestMarker.dataset.pos);
          player.position = this.getOriginalPosition(newPosition);
          this.updatePlayerPositions();
        }
        
        this.draggedPlayer = null;
      }
      
      updatePlayerPositions() {
        this.players.forEach(player => {
          const rotatedPos = this.getRotatedPosition(player.position);
          const coords = this.getCourtCoordinates(rotatedPos);
          this.positionPlayerOnCourt(player.element, coords.x, coords.y);
        });
      }
      
      positionPlayerOnCourt(element, x, y) {
        const svg = this.courtContainer.querySelector('svg');
        const svgRect = svg.getBoundingClientRect();
        
        // Convert SVG coordinates to percentage
        const xPercent = (x / 300) * 100;
        const yPercent = (y / 200) * 100;
        
        // Position relative to court container
        element.style.position = 'absolute';
        element.style.left = `${xPercent}%`;
        element.style.top = `${yPercent}%`;
        element.style.transform = 'translate(-50%, -50%)';
      }
      
      getRotatedPosition(originalPos) {
        let rotatedPos = originalPos - this.rotation;
        if (rotatedPos <= 0) rotatedPos += 6;
        return rotatedPos;
      }
      
      getOriginalPosition(rotatedPos) {
        let originalPos = rotatedPos + this.rotation;
        if (originalPos > 6) originalPos -= 6;
        return originalPos;
      }
      
      getCourtCoordinates(position) {
        const positions = {
          1: { x: 225, y: 150 },
          2: { x: 225, y: 50 },
          3: { x: 150, y: 50 },
          4: { x: 75, y: 50 },
          5: { x: 75, y: 150 },
          6: { x: 150, y: 150 }
        };
        
        return positions[position] || { x: 0, y: 0 };
      }
      
      rotate(direction) {
        this.rotation = (this.rotation + (direction === 'left' ? -1 : 1) + 6) % 6;
        this.updatePlayerPositions();
      }
    }
  
    // Initialize the app
    new VolleyballTacticsBoard();
  });
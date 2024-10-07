class ChessBoard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = 50;
        this.knightPosition = { x: 0, y: 0 };
        this.objects = [];
        this.images = {};
        this.loadImages();
        this.drawBoard();
        this.createKnight();
    }

    loadImages() {
        console.log("Loading images...");
        fetch('/generate_objects', { method: 'POST' })
            .then(response => response.json())
            .then(objects => {
                console.log("Received objects:", objects);
                this.objects = objects;
                let loadedImages = 0;
                objects.forEach(obj => {
                    if (!this.images[obj.image]) {
                        this.images[obj.image] = new Image();
                        this.images[obj.image].src = `/words/${obj.image}`;
                        console.log(`Loading image: ${obj.image}`);
                        this.images[obj.image].onload = () => {
                            console.log(`Image loaded: ${obj.image}`);
                            loadedImages++;
                            if (loadedImages === objects.length) {
                                this.drawObjects();
                            }
                        };
                        this.images[obj.image].onerror = () => {
                            console.error(`Failed to load image: ${obj.image}`);
                            loadedImages++;
                            if (loadedImages === objects.length) {
                                this.drawObjects();
                            }
                        };
                    } else {
                        loadedImages++;
                        if (loadedImages === objects.length) {
                            this.drawObjects();
                        }
                    }
                });
            });
    }

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#999';
                this.ctx.fillRect(col * this.squareSize, row * this.squareSize, this.squareSize, this.squareSize);
            }
        }
    }

    createKnight() {
        console.log("Creating knight...");
        const knight = document.createElement('div');
        knight.className = 'chess-piece';
        knight.style.width = `${this.squareSize}px`;
        knight.style.height = `${this.squareSize}px`;
        knight.style.borderRadius = '50%';
        knight.style.backgroundColor = '#f00';
        knight.style.position = 'absolute';
        knight.style.zIndex = '20';
        this.canvas.parentNode.appendChild(knight);
        this.knightElement = knight;
        this.updateKnightPosition();
        console.log("Knight created:", this.knightElement);
    }

    updateKnightPosition() {
        console.log("Updating knight position...");
        if (this.knightElement) {
            const canvasRect = this.canvas.getBoundingClientRect();
            this.knightElement.style.left = `${canvasRect.left + this.knightPosition.x * this.squareSize}px`;
            this.knightElement.style.top = `${canvasRect.top + this.knightPosition.y * this.squareSize}px`;
            console.log("Knight position updated:", this.knightPosition);
        } else {
            console.error("Knight element not found!");
        }
    }

    drawObjects() {
        console.log("Drawing objects...");
        this.objects.forEach(obj => {
            const img = this.images[obj.image];
            if (img && img.complete && img.naturalHeight !== 0) {
                console.log(`Drawing image: ${obj.image} at (${obj.x}, ${obj.y})`);
                const objectElement = document.createElement('img');
                objectElement.src = `/words/${obj.image}`;
                objectElement.className = 'chess-object';
                objectElement.style.width = `${this.squareSize}px`;
                objectElement.style.height = `${this.squareSize}px`;
                objectElement.style.position = 'absolute';
                objectElement.style.zIndex = '10';
                const canvasRect = this.canvas.getBoundingClientRect();
                objectElement.style.left = `${canvasRect.left + obj.x * this.squareSize}px`;
                objectElement.style.top = `${canvasRect.top + obj.y * this.squareSize}px`;
                this.canvas.parentNode.appendChild(objectElement);
            } else {
                console.log(`Image not ready or failed to load: ${obj.image}`);
            }
        });
    }

    async moveKnight(direction) {
        console.log("Moving knight:", direction);
        switch (direction) {
            case 'up':
                if (this.knightPosition.y > 0) this.knightPosition.y--;
                break;
            case 'down':
                if (this.knightPosition.y < 7) this.knightPosition.y++;
                break;
            case 'left':
                if (this.knightPosition.x > 0) this.knightPosition.x--;
                break;
            case 'right':
                if (this.knightPosition.x < 7) this.knightPosition.x++;
                break;
        }
        this.updateKnightPosition();

        const response = await fetch('/collect_object', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.knightPosition),
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('current-word').textContent = `Pronounce: ${data.word}`;
            this.objects = this.objects.filter(obj => obj.x !== this.knightPosition.x || obj.y !== this.knightPosition.y);
            this.removeCollectedObject();
        }
    }

    removeCollectedObject() {
        const objects = this.canvas.parentNode.querySelectorAll('.chess-object');
        objects.forEach(obj => {
            const canvasRect = this.canvas.getBoundingClientRect();
            const left = (parseInt(obj.style.left) - canvasRect.left) / this.squareSize;
            const top = (parseInt(obj.style.top) - canvasRect.top) / this.squareSize;
            if (left === this.knightPosition.x && top === this.knightPosition.y) {
                obj.remove();
            }
        });
    }

    async generateObjects() {
        console.log("Generating objects...");
        const response = await fetch('/generate_objects', { method: 'POST' });
        this.objects = await response.json();
        console.log("Generated objects:", this.objects);
        this.loadImages();
    }
}

const chessBoard = new ChessBoard('chessboard');
chessBoard.generateObjects();

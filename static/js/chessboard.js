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
        this.drawKnight();
    }

    loadImages() {
        console.log("Loading images...");  // Debugging line
        fetch('/generate_objects', { method: 'POST' })
            .then(response => response.json())
            .then(objects => {
                console.log("Received objects:", objects);  // Debugging line
                objects.forEach(obj => {
                    if (!this.images[obj.image]) {
                        this.images[obj.image] = new Image();
                        this.images[obj.image].src = `/static/images/${obj.image}`;
                        console.log(`Loading image: ${obj.image}`);  // Debugging line
                        this.images[obj.image].onload = () => {
                            console.log(`Image loaded: ${obj.image}`);  // Debugging line
                            this.drawObjects();
                        };
                        this.images[obj.image].onerror = () => {
                            console.error(`Failed to load image: ${obj.image}`);  // Debugging line
                        };
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

    drawKnight() {
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        this.ctx.arc(
            this.knightPosition.x * this.squareSize + this.squareSize / 2,
            this.knightPosition.y * this.squareSize + this.squareSize / 2,
            this.squareSize / 3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    drawObjects() {
        console.log("Drawing objects...");  // Debugging line
        this.objects.forEach(obj => {
            const img = this.images[obj.image];
            if (img && img.complete) {
                console.log(`Drawing image: ${obj.image} at (${obj.x}, ${obj.y})`);  // Debugging line
                this.ctx.drawImage(
                    img,
                    obj.x * this.squareSize,
                    obj.y * this.squareSize,
                    this.squareSize,
                    this.squareSize
                );
            } else {
                console.log(`Image not ready: ${obj.image}`);  // Debugging line
            }
        });
    }

    async moveKnight(direction) {
        this.drawBoard();
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
        this.drawKnight();
        this.drawObjects();

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
        }
    }

    async generateObjects() {
        console.log("Generating objects...");  // Debugging line
        const response = await fetch('/generate_objects', { method: 'POST' });
        this.objects = await response.json();
        console.log("Generated objects:", this.objects);  // Debugging line
        this.drawBoard();
        this.drawKnight();
        this.drawObjects();
    }
}

const chessBoard = new ChessBoard('chessboard');
chessBoard.generateObjects();

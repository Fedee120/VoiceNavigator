// static/js/chessboard.js

class ChessBoard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = 50;
        this.knightPosition = { x: 0, y: 0 };
        this.objects = [];
        this.images = {};
        this.drawBoard();
        this.createKnight();
        this.loadImages();
    }

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#999';
                this.ctx.fillRect(col * this.squareSize, row * this.squareSize, this.squareSize, this.squareSize);
            }
        }
    }

    resetKnightPosition() {
        this.knightPosition = { x: 0, y: 0 };
        this.updateKnightPosition();
    }

    createKnight() {
        console.log("Creating knight...");
        const knight = document.createElement('img');
        knight.src = '/static/images/character.gif'; // Ruta a la imagen del personaje
        knight.className = 'chess-piece';
        knight.style.width = `${this.squareSize+30}px`;
        knight.style.height = `${this.squareSize+30}px`;
        knight.style.position = 'absolute';
        knight.style.zIndex = '30';
        this.canvas.parentNode.appendChild(knight);
        this.knightElement = knight;
        this.updateKnightPosition();
    }

    updateKnightPosition() {
        if (this.knightElement) {
            const offset = 2; // Ajuste para centrar el personaje
            this.knightElement.style.left = `${this.knightPosition.x * this.squareSize + offset}px`;
            this.knightElement.style.top = `${this.knightPosition.y * this.squareSize + offset}px`;
        }
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
    }

    removeCollectedObject() {
        console.log("Removing collected object...");
        const objects = this.canvas.parentNode.querySelectorAll('.chess-object');
        objects.forEach(obj => {
            const left = parseInt(obj.style.left) / this.squareSize;
            const top = parseInt(obj.style.top) / this.squareSize;
            if (left === this.knightPosition.x && top === this.knightPosition.y) {
                obj.remove();
                console.log(`Object at (${left}, ${top}) removed.`);
            }
        });
    }

    clearObjects() {
        console.log("Clearing old objects...");
        const objects = this.canvas.parentNode.querySelectorAll('.chess-object');
        objects.forEach(obj => {
            obj.remove();
        });
    }

    async generateObjects() {
        console.log("Generating objects...");

        // Antes de generar nuevos objetos, eliminamos los anteriores
        this.clearObjects();

        const response = await fetch('/generate_objects', { method: 'POST' });
        this.objects = await response.json();
        console.log("Generated objects:", this.objects);

        this.drawObjects();
    }

    drawObjects() {
        console.log("Drawing objects...");
        this.objects.forEach(obj => {
            const objectElement = document.createElement('img');
            objectElement.src = `/words/${obj.image}`;
            objectElement.className = 'chess-object';
            objectElement.style.width = `${this.squareSize}px`;
            objectElement.style.height = `${this.squareSize}px`;
            objectElement.style.position = 'absolute';
            objectElement.style.zIndex = '20';
            objectElement.style.left = `${obj.x * this.squareSize}px`;
            objectElement.style.top = `${obj.y * this.squareSize}px`;
            this.canvas.parentNode.appendChild(objectElement);
        });
    }

    loadImages() {
        // En este caso, llamamos directamente a generateObjects
        this.generateObjects();
    }
}

// Instanciar ChessBoard y inicializar el control de voz
document.addEventListener('DOMContentLoaded', () => {
    const chessBoard = new ChessBoard('chessboard');
    initializeVoiceControl(chessBoard);
});

class ChessBoard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = 50;
        this.knightPosition = { x: 0, y: 0 };
        this.objects = [];
        this.drawBoard();
        this.drawKnight();
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
        this.objects.forEach(obj => {
            this.ctx.fillStyle = this.getDifficultyColor(obj.difficulty);
            this.ctx.beginPath();
            this.ctx.arc(
                obj.x * this.squareSize + this.squareSize / 2,
                obj.y * this.squareSize + this.squareSize / 2,
                this.squareSize / 4,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        });
    }

    getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'easy': return '#00ff00';
            case 'medium': return '#ffff00';
            case 'hard': return '#ff8c00';
            default: return '#0000ff';
        }
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
        const response = await fetch('/generate_objects', { method: 'POST' });
        this.objects = await response.json();
        this.drawBoard();
        this.drawKnight();
        this.drawObjects();
    }
}

const chessBoard = new ChessBoard('chessboard');
chessBoard.generateObjects();

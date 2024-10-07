class VoiceControl {
    constructor(chessBoard) {
        this.chessBoard = chessBoard;
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.setupEventListeners();
        this.moveSound = null;
        this.currentWord = "";
    }

    setupEventListeners() {
        const startButton = document.getElementById('startListening');
        const statusElement = document.getElementById('status');

        startButton.addEventListener('click', () => {
            if (!this.moveSound) {
                this.moveSound = new Howl({
                    src: ['/static/sounds/move.mp3']
                });
            }
            this.recognition.start();
            statusElement.textContent = 'Listening...';
        });

        this.recognition.addEventListener('speechend', () => {
            this.recognition.stop();
            statusElement.textContent = 'Stopped listening';
        });

        this.recognition.addEventListener('result', (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            statusElement.textContent = `Command recognized: ${command}`;
            this.processCommand(command);
        });

        this.recognition.addEventListener('error', (event) => {
            statusElement.textContent = `Error: ${event.error}`;
        });
    }

    async processCommand(command) {
        const validMoves = ['up', 'down', 'left', 'right'];
        if (validMoves.includes(command)) {
            await this.chessBoard.moveKnight(command);
            if (this.moveSound) {
                this.moveSound.play();
            }
        } else if (this.currentWord) {
            await this.checkPronunciation(command);
        } else {
            document.getElementById('status').textContent = 'Invalid command. Try "up", "down", "left", "right", or pronounce the current word.';
        }
    }

    async checkPronunciation(pronouncedWord) {
        const response = await fetch('/check_pronunciation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: pronouncedWord }),
        });
        const data = await response.json();
        
        const statusElement = document.getElementById('status');
        const scoreElement = document.getElementById('score');
        const currentWordElement = document.getElementById('current-word');
        
        if (data.correct) {
            statusElement.textContent = 'Correct pronunciation!';
            scoreElement.textContent = `Score: ${data.score}`;
            this.currentWord = "";
            currentWordElement.textContent = "";
            this.chessBoard.generateObjects();
        } else {
            statusElement.textContent = 'Incorrect pronunciation. Try again!';
        }
    }

    setCurrentWord(word) {
        this.currentWord = word;
        const currentWordElement = document.getElementById('current-word');
        currentWordElement.textContent = `Pronounce: ${word}`;
        console.log(`Current word set: ${word}`);
    }
}

const voiceControl = new VoiceControl(chessBoard);

// Update the chessboard's moveKnight method to set the current word
const originalMoveKnight = chessBoard.moveKnight;
chessBoard.moveKnight = async function(direction) {
    await originalMoveKnight.call(this, direction);
    const currentWordElement = document.getElementById('current-word');
    if (currentWordElement.textContent) {
        const word = currentWordElement.textContent.split(': ')[1];
        voiceControl.setCurrentWord(word);
    }
};

// static/js/voice_control.js

function initializeVoiceControl(chessBoard) {
    class VoiceControl {
        constructor(chessBoard) {
            this.chessBoard = chessBoard;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('Your browser does not support Speech Recognition. Please use Chrome or Edge.');
                return;
            }
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.continuous = true; // Siempre escuchando
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.setupEventListeners();
            this.moveSound = null;
            this.currentWord = "";
            this.score = 0;
        }
    
        setupEventListeners() {
            const statusElement = document.getElementById('status');
    
            // Iniciar reconocimiento de voz automáticamente
            this.recognition.start();
            statusElement.textContent = 'Listening...';
            document.getElementById('listening-indicator').classList.remove('hidden');
    
            this.recognition.addEventListener('result', async (event) => {
                // Obtener el índice del último resultado
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript.trim();
                const confidence = event.results[lastResultIndex][0].confidence;
            
                console.log(`Recognized command: "${transcript}" (confidence: ${confidence})`);
                console.log('All recognized alternatives:', event.results[lastResultIndex]);
            
                if (confidence < 0.6) {
                    statusElement.textContent = 'Sorry, I did not catch that. Please try again.';
                    return;
                }
            
                await this.processCommand(transcript);
            });
    
            this.recognition.addEventListener('error', (event) => {
                let message = '';
                switch(event.error) {
                    case 'no-speech':
                        message = 'No speech was detected. Please try again.';
                        break;
                    case 'audio-capture':
                        message = 'No microphone was found. Ensure that a microphone is installed.';
                        break;
                    case 'not-allowed':
                        message = 'Permission to use microphone is blocked. Please allow access to your microphone.';
                        break;
                    default:
                        message = `Error occurred in speech recognition: ${event.error}`;
                        break;
                }
                statusElement.textContent = message;
                document.getElementById('listening-indicator').classList.add('hidden');
            });
    
            this.recognition.addEventListener('end', () => {
                console.log('Recognition ended');
                // Reiniciar el reconocimiento para que siempre esté escuchando
                this.recognition.start();
            });
        }
    
        async processCommand(command) {
            const validMoves = ['up', 'down', 'left', 'right'];
            const commandWords = command.toLowerCase().split(' ');
    
            // Busca una dirección válida en las palabras del comando
            const moveDirection = validMoves.find(move => commandWords.includes(move));
            if (moveDirection) {
                await this.chessBoard.moveKnight(moveDirection);
                if (this.moveSound) {
                    this.moveSound.play();
                }
            } else if (this.currentWord) {
                // Verifica si el usuario está intentando pronunciar la palabra actual
                await this.checkPronunciation(command);
            } else {
                document.getElementById('status').textContent = 'Invalid command. Please say "up", "down", "left", "right", or pronounce the current word.';
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
                statusElement.textContent = 'Great job! You said it right!';
                this.score = data.score;
                scoreElement.textContent = `Score: ${this.score}`;
                this.currentWord = "";
                currentWordElement.textContent = "";
    
                // Reproducir sonido de éxito
                const successSound = new Howl({
                    src: ['/static/sounds/success.mp3']
                });
                successSound.play();
    
                // Mostrar confeti
                this.showConfetti();
    
                // Eliminar el objeto recolectado
                this.chessBoard.removeCollectedObject();
    
            } else {
                statusElement.textContent = 'Oops! Try again!';
                // Reproducir sonido de error
                const errorSound = new Howl({
                    src: ['/static/sounds/error.mp3']
                });
                errorSound.play();
            }
        }
    
        setCurrentWord(word) {
            this.currentWord = word;
            const currentWordElement = document.getElementById('current-word');
            currentWordElement.textContent = word ? `Repeat: ${word}` : '';
            console.log(`Current word set: ${word}`);
        }
    
        showConfetti() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    const voiceControl = new VoiceControl(chessBoard);
    
    // Actualizar el método moveKnight para sincronizar la palabra actual
    const originalMoveKnight = chessBoard.moveKnight.bind(chessBoard);
    chessBoard.moveKnight = async function(direction) {
        await originalMoveKnight(direction);
    
        // Verificar si hay un objeto en la nueva posición
        const response = await fetch('/check_for_object', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.knightPosition),
        });
        const data = await response.json();
        if (data.success) {
            const currentWordElement = document.getElementById('current-word');
            currentWordElement.textContent = `Repeat: ${data.word}`;
            console.log(`Current word updated: ${data.word}`);
    
            // Actualizar la palabra actual en el control de voz
            voiceControl.setCurrentWord(data.word);
        } else {
            voiceControl.setCurrentWord('');
            const currentWordElement = document.getElementById('current-word');
            currentWordElement.textContent = '';
        }
    };
}

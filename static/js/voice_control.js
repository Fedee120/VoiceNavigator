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
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.setupEventListeners();
            this.moveSound = null;
            this.currentWord = "";
            this.score = 0;

            // Get modal elements
            this.modal = document.getElementById('endgame-modal');
            this.finalScoreElement = document.getElementById('final-score');
            this.continueButton = document.getElementById('continue-button');
            this.finishButton = document.getElementById('finish-button');

            // Add events to modal buttons
            this.continueButton.addEventListener('click', () => {
                this.continueGame();
            });

            this.finishButton.addEventListener('click', () => {
                this.finishGame();
            });

            // Get the "Skip" button
            this.skipButton = document.getElementById('skip-button');

            // Add event to the "Skip" button
            this.skipButton.addEventListener('click', () => {
                this.skipCurrentWord();
            });
        }
    
        setupEventListeners() {
            // Remove previous event listeners if necessary
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
            const statusElement = document.getElementById('status');
    
            // Start voice recognition automatically
            this.recognition.start();
            statusElement.textContent = 'Listening...';
            document.getElementById('listening-indicator').classList.remove('hidden');
    
            this.recognition.addEventListener('result', async (event) => {
                // Get the index of the last result
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
                // Restart recognition to keep listening
                this.recognition.start();
            });
        }
    
        async processCommand(command) {
            const validMoves = ['up', 'down', 'left', 'right'];
            const commandWords = command.toLowerCase().split(' ');
    
            // Look for a valid direction in the command words
            const moveDirection = validMoves.find(move => commandWords.includes(move));
            if (moveDirection) {
                await this.chessBoard.moveKnight(moveDirection);
                if (this.moveSound) {
                    this.moveSound.play();
                }
            } else if (this.currentWord) {
                // Check if the user is trying to pronounce the current word
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
                statusElement.textContent = 'Well done! You said it correctly!';
                this.score = data.score;
                scoreElement.textContent = `Score: ${this.score}`;
                this.currentWord = "";
                currentWordElement.textContent = "";
        
                // Play success sound
                const successSound = new Howl({
                    src: ['/static/sounds/success.mp3']
                });
                successSound.play();
        
                // Show confetti
                this.showConfetti();
        
                // Remove the collected object visually
                this.chessBoard.removeCollectedObject();
        
                // Remove the object from the list of objects
                this.chessBoard.objects = this.chessBoard.objects.filter(obj => {
                    return !(obj.x === this.chessBoard.knightPosition.x && obj.y === this.chessBoard.knightPosition.y);
                });
        
                // Check if there are no more objects
                if (this.chessBoard.objects.length === 0) {
                    console.log('All objects collected, showing end game options.');
                    this.showEndGameOptions();
                }
        
            } else {
                statusElement.textContent = 'Oops! Try again!';
                // Play error sound
                const errorSound = new Howl({
                    src: ['/static/sounds/error.mp3']
                });
                errorSound.play();
            }
        }        

        showEndGameOptions() {
            console.log('showEndGameOptions() called');
            // Show the modal with options
            this.finalScoreElement.textContent = this.score;
            this.modal.classList.remove('hidden');
        }

        continueGame() {
            // Hide the modal
            this.modal.classList.add('hidden');
            // Generate new objects
            this.chessBoard.generateObjects();
            // Update status message
            document.getElementById('status').textContent = 'Say a command!';
        }

        finishGame() {
            // Hide the modal
            this.modal.classList.add('hidden');
            // Show final message
            alert(`Game over! Your final score is: ${this.score}`);
            // Stop voice recognition
            this.recognition.stop();
            // Disable future actions
            document.getElementById('status').textContent = 'Game over. Thank you for playing!';
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

        skipCurrentWord() {
            if (this.currentWord) {
                // Remove the object from the board's object list
                this.chessBoard.objects = this.chessBoard.objects.filter(obj => {
                    return !(obj.x === this.chessBoard.knightPosition.x && obj.y === this.chessBoard.knightPosition.y);
                });
    
                // Remove the object visually
                this.chessBoard.removeCollectedObject();
    
                // Reset the current word
                this.currentWord = "";
                const currentWordElement = document.getElementById('current-word');
                currentWordElement.textContent = "";
    
                // Update the status
                const statusElement = document.getElementById('status');
                statusElement.textContent = 'Word skipped. Continue playing!';
    
                // Check if there are no more objects
                if (this.chessBoard.objects.length === 0) {
                    this.showEndGameOptions();
                }
            } else {
                const statusElement = document.getElementById('status');
                statusElement.textContent = 'There is no word to skip.';
            }
        }
    }
    
    const voiceControl = new VoiceControl(chessBoard);
    
    // Update the moveKnight method to sync the current word
    const originalMoveKnight = chessBoard.moveKnight.bind(chessBoard);
    chessBoard.moveKnight = async function(direction) {
        await originalMoveKnight(direction);
    
        // Check if there is an object at the new position
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
    
            // Update the current word in voice control
            voiceControl.setCurrentWord(data.word);
        } else {
            voiceControl.setCurrentWord('');
            const currentWordElement = document.getElementById('current-word');
            currentWordElement.textContent = '';
        }
    };
}

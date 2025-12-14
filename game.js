/**
 * This script controls all the main game logic for the Math Game.
 * It is loaded by game.html and starts the game after ensuring a user is logged in
 * and has selected a game mode.
 */
function initGamePage() {
    // --- DOM ELEMENT REFERENCES ---
    const playerNameElement = document.getElementById('player-name');
    const logoutButton = document.getElementById('logout-button');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const highScoreElement = document.getElementById('high-score');
    const timerElement = document.getElementById('timer');
    const problemTextElement = document.getElementById('problem');
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const answerChoicesElement = document.getElementById('answer-choices');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessageElement = document.getElementById('error-message');

    // --- GAME STATE VARIABLES ---
    let score = 0, level = 1, timeLeft = 60;
    let currentAnswer, timerInterval, currentUser, currentMode;
    let data = {};
    let isAwaitingNext = false;

    // --- HELPER & UI FUNCTIONS ---
    function displayMessage(message, isError = false) {
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            errorMessageElement.style.color = isError ? '#ffcccc' : '#ffffff';
        }
    }

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    // --- AUDIO FEEDBACK HELPERS ---
    let audioCtx = null;
    function playTone(frequency, durationMs, type = 'sine') {
        try {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) {
                return;
            }
            if (!audioCtx) {
                audioCtx = new AudioContextCtor();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = frequency;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            const now = audioCtx.currentTime;
            const durationSeconds = durationMs / 1000;
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
            osc.start(now);
            osc.stop(now + durationSeconds);
        } catch (e) {
            console.error('Audio playback failed:', e);
        }
    }

    function playCorrectSound() {
        playTone(880, 180, 'triangle');
    }

    function playWrongSound() {
        playTone(220, 220, 'square');
    }
    function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
    function drawAngle(angleType) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#333'; ctx.lineWidth = 5; const centerX = canvas.width / 2, centerY = canvas.height - 20, lineLength = 80; let angle; if (angleType === 'Right') angle = Math.PI / 2; else if (angleType === 'Acute') angle = (Math.random() * 60 + 20) * Math.PI / 180; else angle = (Math.random() * 60 + 100) * Math.PI / 180; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength, centerY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength * Math.cos(angle), centerY - lineLength * Math.sin(angle)); ctx.stroke(); }
    
    // --- PROBLEM GENERATION HELPERS ---
    function generateNumberProblem(op) { let num1, num2; if (op === '+') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*10*level); currentAnswer = num1 + num2; } else if (op === '-') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*num1); currentAnswer = num1 - num2; } else if (op === '*') { num1 = Math.floor(Math.random()*10); num2 = Math.floor(Math.random()*10); currentAnswer = num1 * num2; } else if (op === '/') { num2 = Math.floor(Math.random()*9)+1; num1 = num2*(Math.floor(Math.random()*10)); currentAnswer = num1 / num2; } const problemText = `${num1} ${op.replace('*','×').replace('/','÷')} ${num2}`; const choices = [ { text: currentAnswer, value: currentAnswer }, { text: currentAnswer + (Math.floor(Math.random()*3)+1), value: currentAnswer + (Math.floor(Math.random()*3)+1) }, { text: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)), value: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)) } ]; return { problemText, choices }; }
    function generateDecimalProblem() { const num1 = parseFloat((Math.random() * 10).toFixed(1)); const num2 = parseFloat((Math.random() * 10).toFixed(1)); currentAnswer = parseFloat((num1 + num2).toFixed(1)); const problemText = `${num1} + ${num2}`; const choices = [ { text: currentAnswer, value: currentAnswer }, { text: parseFloat((currentAnswer + 1).toFixed(1)), value: parseFloat((currentAnswer + 1).toFixed(1)) }, { text: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)), value: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)) } ]; return { problemText, choices }; }
    function generateFractionProblem() { const den1 = Math.floor(Math.random() * 5) + 2; const den2 = Math.floor(Math.random() * 5) + 2; const num1 = Math.floor(Math.random() * den1) + 1; const num2 = Math.floor(Math.random() * den2) + 1; const problemText = `${num1}/${den1} + ${num2}/${den2}`; const ansNum = num1 * den2 + num2 * den1; const ansDen = den1 * den2; const common = gcd(ansNum, ansDen); currentAnswer = `${ansNum/common}/${ansDen/common}`; const choices = [ { text: currentAnswer, value: currentAnswer }, { text: `${ansNum/common + 1}/${ansDen/common}`, value: `${ansNum/common + 1}/${ansDen/common}` }, { text: `${ansNum/common}/${ansDen/common + 1}`, value: `${ansNum/common}/${ansDen/common + 1}` } ]; return { problemText, choices }; }
    function generateAngleProblem() { const angleTypes = ['Acute', 'Obtuse', 'Right']; currentAnswer = angleTypes[Math.floor(Math.random() * angleTypes.length)]; drawAngle(currentAnswer); const choices = angleTypes.map(type => ({ text: type, value: type })); return { problemText: '', choices }; }

    // --- MAIN PROBLEM DISPATCHER ---
    function generateProblem() { displayMessage(''); let problemTypes = []; if (currentMode === 'mix') { problemTypes = ['number', 'fraction', 'decimal', 'angle']; } else if (currentMode.startsWith('number_')) { problemTypes = [currentMode]; } else { problemTypes = [currentMode]; } const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)]; let problemData; problemTextElement.style.display = 'block'; canvasContainer.style.display = 'none'; if (problemType.startsWith('number_')) { const op = problemType.split('_')[1]; problemData = generateNumberProblem(op); } else if (problemType === 'number') { const ops = ['+', '-', '*', '/']; const randOp = ops[Math.floor(Math.random() * ops.length)]; problemData = generateNumberProblem(randOp); } else if (problemType === 'decimal') { problemData = generateDecimalProblem(); } else if (problemType === 'fraction') { problemData = generateFractionProblem(); } else if (problemType === 'angle') { problemTextElement.style.display = 'none'; canvasContainer.style.display = 'block'; problemData = generateAngleProblem(); } if (!problemData) { throw new Error('Failed to generate problem data for type: ' + problemType); } problemTextElement.textContent = problemData.problemText; displayChoices(shuffle(problemData.choices)); }
    
    // --- CORE GAME LOGIC & UI ---
    function clearChoiceState() {
        const buttons = answerChoicesElement.querySelectorAll('.choice-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('choice-correct', 'choice-wrong');
        });
    }

    function checkAnswer(selectedAnswer, button) {
        if (isAwaitingNext) return;
        isAwaitingNext = true;

        const isCorrect = selectedAnswer == currentAnswer;
        const buttons = answerChoicesElement.querySelectorAll('.choice-btn');
        buttons.forEach(btn => { btn.disabled = true; });

        if (isCorrect) {
            score++;
            updateScore();
            if (score > 0 && score % 10 === 0) {
                level++;
                levelElement.textContent = `Level: ${level}`;
            }
            if (button) {
                button.classList.add('choice-correct');
            }
            playCorrectSound();
        } else {
            if (score > 0) {
                score--;
                updateScore();
            }
            if (button) {
                button.classList.add('choice-wrong');
            }
            playWrongSound();
        }

        setTimeout(() => {
            clearChoiceState();
            isAwaitingNext = false;
            generateProblem();
        }, 500);
    }

    function displayChoices(choices) {
        answerChoicesElement.innerHTML = '';
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = `<span class="choice-key">${index + 1}</span>${choice.text}`;
            button.dataset.choiceIndex = index;
            button.onclick = () => checkAnswer(choice.value, button);
            answerChoicesElement.appendChild(button);
        });
    }

    function handleKeyboardChoice(event) {
        const match = /^[1-4]$/.exec(event.key);
        if (!match) return;
        const idx = Number(match[0]) - 1;
        const choiceButton = answerChoicesElement.querySelector(`button[data-choice-index="${idx}"]`);
        if (choiceButton) {
            choiceButton.click();
        }
    }
    function updateScore() { scoreElement.textContent = `Score: ${score}`; }
    function startTimer() { timerInterval = setInterval(() => { timeLeft--; timerElement.textContent = `Time: ${timeLeft}`; if (timeLeft <= 0) { clearInterval(timerInterval); let message = `Game Over! Your score is ${score}`; const user = data.users[currentUser]; if (score > user.highScore) { user.highScore = score; message = `Game Over! New High Score: ${score}`; try { localStorage.setItem('math_game_data', JSON.stringify(data)); } catch(e) { console.error("Failed to save high score", e); } } problemTextElement.style.display = 'none'; canvasContainer.style.display = 'none'; answerChoicesElement.innerHTML = ''; displayMessage(message); setTimeout(() => { window.location.href = 'index.html'; }, 3000); } }, 1000); }
    function resetGame() { score = 0; level = 1; timeLeft = 60; updateScore(); levelElement.textContent = `Level: ${level}`; if (timerInterval) clearInterval(timerInterval); }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            try {
                data.currentUser = null;
                localStorage.setItem('math_game_data', JSON.stringify(data));
                localStorage.removeItem('math_game_currentMode');
                window.location.href = 'index.html?t=' + new Date().getTime();
            } catch (e) {
                displayMessage('Error during logout.', true);
                console.error('Logout failed:', e);
            }
        });
    }

    // --- ASYNCHRONOUS INITIALIZATION ---
    function initializeData() { return new Promise((resolve, reject) => { try { data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null }; currentUser = data.currentUser; currentMode = localStorage.getItem('math_game_currentMode'); if (!currentUser || !data.users[currentUser]) { return reject(new Error("No valid user session. Redirecting to login.")); } if (!currentMode) { window.location.href = 'mode.html'; return reject(new Error("No game mode selected.")); } const user = data.users[currentUser]; playerNameElement.textContent = currentUser; highScoreElement.textContent = `High Score: ${user.highScore}`; resetGame(); generateProblem(); setTimeout(() => resolve(), 500); } catch (e) { reject(e); } }); }

    async function main() { try { if (loadingOverlay) loadingOverlay.style.display = 'flex'; await initializeData(); if (loadingOverlay) loadingOverlay.style.display = 'none'; startTimer(); } catch (e) { if (loadingOverlay) loadingOverlay.style.display = 'none'; displayMessage(`A critical error occurred: ${e.message}`, true); console.error(e); } }

        main();
        document.addEventListener('keydown', handleKeyboardChoice);
    }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamePage);
} else {
    initGamePage();
}

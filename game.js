// Game elements
const playerNameElement = document.getElementById('player-name');
const logoutButton = document.getElementById('logout-button');
const problemElement = document.getElementById('problem');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');

// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let currentAnswer;
let timerInterval;
let currentUser = null;

function initialize() {
    currentUser = localStorage.getItem('math_game_currentUser');
    if (!currentUser) {
        // If no user is logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }
    playerNameElement.textContent = currentUser;
    resetGame();
    generateProblem();
    startTimer();
}

function resetGame() {
    score = 0;
    level = 1;
    timeLeft = 60;
    updateScore();
    levelElement.textContent = `Level: ${level}`;
    timerElement.textContent = `Time: ${timeLeft}`;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('math_game_currentUser');
    window.location.href = 'index.html';
});

// Game elements
const playerNameElement = document.getElementById('player-name');
const logoutButton = document.getElementById('logout-button');
const problemElement = document.getElementById('problem');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');

// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let currentAnswer;
let currentProblemType;
let timerInterval;
let currentUser = null;

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function initialize() {
    currentUser = localStorage.getItem('math_game_currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    playerNameElement.textContent = currentUser;
    resetGame();
    generateProblem();
    startTimer();
}

function resetGame() {
    score = 0;
    level = 1;
    timeLeft = 60;
    updateScore();
    levelElement.textContent = `Level: ${level}`;
    timerElement.textContent = `Time: ${timeLeft}`;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('math_game_currentUser');
    window.location.href = 'index.html';
});

function generateProblem() {
    const operations = ['+', '-', '*', '/', 'fraction', 'decimal'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    currentProblemType = operation;
    answerInput.placeholder = "Your answer"; // Reset placeholder

    let num1, num2, den1, den2;
    let problemText;
    
    switch (operation) {
        case '+':
        case '-':
        case '*':
        case '/':
            const simpleOps = {'+': '+', '-': '−', '*': '×', '/': '÷'};
            currentProblemType = 'number';
            if (operation === '+') {
                num1 = Math.floor(Math.random() * 10 * level);
                num2 = Math.floor(Math.random() * 10 * level);
                currentAnswer = num1 + num2;
            } else if (operation === '-') {
                num1 = Math.floor(Math.random() * 10 * level);
                num2 = Math.floor(Math.random() * num1);
                currentAnswer = num1 - num2;
            } else if (operation === '*') {
                num1 = Math.floor(Math.random() * 10 * level);
                num2 = Math.floor(Math.random() * 10);
                currentAnswer = num1 * num2;
            } else { // division
                num2 = Math.floor(Math.random() * 9) + 1;
                num1 = num2 * (Math.floor(Math.random() * 10 * level));
                currentAnswer = num1 / num2;
            }
            problemText = `${num1} ${simpleOps[operation]} ${num2}`;
            break;
        
        case 'fraction':
            den1 = Math.floor(Math.random() * 5) + 2;
            den2 = Math.floor(Math.random() * 5) + 2;
            num1 = Math.floor(Math.random() * den1) + 1;
            num2 = Math.floor(Math.random() * den2) + 1;
            let ansNum = num1 * den2 + num2 * den1;
            let ansDen = den1 * den2;
            const commonDivisor = gcd(ansNum, ansDen);
            currentAnswer = { num: ansNum / commonDivisor, den: ansDen / commonDivisor };
            problemText = `${num1}/${den1} + ${num2}/${den2}`;
            answerInput.placeholder = "Answer as n/d";
            break;
            
        case 'decimal':
            const decimalOps = ['+', '-', '*', '/'];
            const decimalOp = decimalOps[Math.floor(Math.random() * decimalOps.length)];
            currentProblemType = 'number'; // The answer is a number
            
            num1 = parseFloat((Math.random() * 10 * level).toFixed(2));
            num2 = parseFloat((Math.random() * 10).toFixed(2));

            if (decimalOp === '-') {
                if (num1 < num2) [num1, num2] = [num2, num1]; // ensure positive result
            } else if (decimalOp === '/') {
                num2 = parseFloat((Math.random() * 9 + 1).toFixed(2)); // Avoid division by zero
                num1 = parseFloat((num2 * Math.random() * 5).toFixed(2))
            }

            let result;
            if (decimalOp === '+') result = num1 + num2;
            if (decimalOp === '-') result = num1 - num2;
            if (decimalOp === '*') result = num1 * num2;
            if (decimalOp === '/') result = num1 / num2;
            
            currentAnswer = parseFloat(result.toFixed(3)); // Round answer to avoid float issues
            problemText = `${num1} ${decimalOp} ${num2}`;
            break;
    }

    problemElement.textContent = problemText;
}

function checkAnswer() {
    let isCorrect = false;
    const userAnswer = parseFloat(answerInput.value);

    if (currentProblemType === 'number') {
        // Compare numbers with a small tolerance for floating point errors
        if (Math.abs(userAnswer - currentAnswer) < 0.001) {
            isCorrect = true;
        }
    } else if (currentProblemType === 'fraction') {
        const userAnswerStr = answerInput.value;
        if (userAnswerStr.includes('/')) {
            let [num, den] = userAnswerStr.split('/').map(n => parseInt(n.trim()));
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                const commonDivisor = gcd(num, den);
                num /= commonDivisor;
                den /= commonDivisor;
                if (num === currentAnswer.num && den === currentAnswer.den) {
                    isCorrect = true;
                }
            }
        }
    }

    if (isCorrect) {
        score++;
        updateScore();
        if (score > 0 && score % 10 === 0) {
            level++;
            levelElement.textContent = `Level: ${level}`;
        }
        generateProblem();
    }
    answerInput.value = '';
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Game Over! Your score is ${score}`);
            window.location.href = 'index.html';
        }
    }, 1000);
}

submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

initialize();


function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Game Over! Your score is ${score}`);
            window.location.href = 'index.html';
        }
    }, 1000);
}

submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

initialize();

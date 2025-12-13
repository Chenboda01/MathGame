// containers
const welcomeContainer = document.getElementById('welcome-container');
const gameContainer = document.getElementById('game-container');

// Auth elements
const signupUsernameInput = document.getElementById('signup-username');
const signupButton = document.getElementById('signup-button');
const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const playerNameElement = document.getElementById('player-name');

// Game elements
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
let users = [];

function initialize() {
    const storedUsers = localStorage.getItem('math_game_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    const loggedInUser = localStorage.getItem('math_game_currentUser');
    if (loggedInUser) {
        currentUser = loggedInUser;
        showGame();
    } else {
        showWelcome();
    }
}

function showGame() {
    welcomeContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    playerNameElement.textContent = currentUser;
    resetGame();
    generateProblem();
    startTimer();
}

function showWelcome() {
    gameContainer.classList.add('hidden');
    welcomeContainer.classList.remove('hidden');
    if (timerInterval) {
        clearInterval(timerInterval);
    }
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

signupButton.addEventListener('click', () => {
    const username = signupUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter a username.');
        return;
    }
    if (users.includes(username)) {
        alert('Username already exists. Please choose another one or sign in.');
        return;
    }
    users.push(username);
    localStorage.setItem('math_game_users', JSON.stringify(users));
    currentUser = username;
    localStorage.setItem('math_game_currentUser', currentUser);
    signupUsernameInput.value = '';
    showGame();
});

loginButton.addEventListener('click', () => {
    const username = loginUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter your username.');
        return;
    }
    if (users.includes(username)) {
        currentUser = username;
        localStorage.setItem('math_game_currentUser', currentUser);
        loginUsernameInput.value = '';
        showGame();
    } else {
        alert('Username not found. Please create a new user.');
    }
});

logoutButton.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('math_game_currentUser');
    showWelcome();
});


function generateProblem() {
    const num1 = Math.floor(Math.random() * 10 * level);
    const num2 = Math.floor(Math.random() * 10 * level);
    problemElement.textContent = `${num1} + ${num2}`;
    currentAnswer = num1 + num2;
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (userAnswer === currentAnswer) {
        score++;
        updateScore();
        if (score > 0 && score % 10 === 0) {
            level++;
            levelElement.textContent = `Level: ${level}`;
        }
        generateProblem();
        answerInput.value = '';
    }
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
            showWelcome();
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
// Auth elements
const signupUsernameInput = document.getElementById('signup-username');
const signupButton = document.getElementById('signup-button');
const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');

function initialize() {
    // If user is already logged in, redirect to game
    if (localStorage.getItem('math_game_currentUser')) {
        window.location.href = 'game.html';
    }
}

signupButton.addEventListener('click', () => {
    const username = signupUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter a username.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('math_game_users')) || [];
    if (users.includes(username)) {
        alert('Username already exists. Please choose another one or sign in.');
        return;
    }

    users.push(username);
    localStorage.setItem('math_game_users', JSON.stringify(users));
    localStorage.setItem('math_game_currentUser', username);
    
    window.location.href = 'game.html';
});

loginButton.addEventListener('click', () => {
    const username = loginUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter your username.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('math_game_users')) || [];
    if (users.includes(username)) {
        localStorage.setItem('math_game_currentUser', username);
        window.location.href = 'game.html';
    } else {
        alert('Username not found. Please create a new user.');
    }
});

initialize();

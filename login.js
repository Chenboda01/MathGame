// Auth elements
const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');

function initialize() {
    try {
        // If user is already logged in, redirect to game
        if (localStorage.getItem('math_game_currentUser')) {
            window.location.href = 'mode.html?t=' + new Date().getTime();
        }
    } catch (e) {
        alert('Error checking your session. Please ensure browser storage is enabled.');
        console.error('Session check failed:', e);
    }
}

loginButton.addEventListener('click', () => {
    try {
        const username = loginUsernameInput.value.trim();
        if (username === '') {
            alert('Please enter your username.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('math_game_users')) || [];
        if (users.includes(username)) {
            localStorage.setItem('math_game_currentUser', username);
            window.location.href = 'mode.html?t=' + new Date().getTime();
        } else {
            alert('Username not found. Please create a new user.');
        }
    } catch (e) {
        alert('Error during login. Please ensure browser storage is enabled.');
        console.error('Login failed:', e);
    }
});

initialize();

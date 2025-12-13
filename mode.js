document.addEventListener('DOMContentLoaded', () => {
    try {
        const modeButtons = document.querySelectorAll('.mode-btn');

        // First, check if a user is even logged in. If not, back to index.
        if (!localStorage.getItem('math_game_currentUser')) {
            window.location.href = 'index.html?t=' + new Date().getTime();
            return;
        }

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                try {
                    const selectedMode = button.getAttribute('data-mode');
                    localStorage.setItem('math_game_currentMode', selectedMode);
                    window.location.href = 'game.html?t=' + new Date().getTime();
                } catch (e) {
                    alert('Error saving selection: ' + e.message);
                    console.error('Failed to save mode:', e);
                }
            });
        });
    } catch (e) {
        alert('Error on mode page: ' + e.message);
        console.error('Mode page loading failed:', e);
    }
});

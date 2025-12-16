# Math & Reading Game - Project Documentation

## Overview

The Math & Reading Game is an educational web application designed to help 4th and 5th grade students improve their math and reading skills through fun and interactive challenges. The application features both math problems (addition, subtraction, multiplication, division, fractions, decimals, and angles) and reading exercises (vocabulary, comprehension, grammar, and spelling).

## Architecture

### Backend (Python/Flask)
- **Main Application**: `app.py` - A Flask application serving the HTML pages and handling API requests
- **Database**: SQLite (`mathgame.db`) with two tables:
  - `users`: Stores user credentials (username and hashed passwords)
  - `logs`: Tracks user activity and scores
- **Database Schema**: Defined in `schema.sql`

### Frontend (HTML/CSS/JavaScript)
- Multiple HTML pages: `index.html`, `login.html`, `signup.html`, `game.html`, `mode.html`, `reading_mode.html`
- Shared CSS styles: `style.css`
- JavaScript files for each page's functionality: `login.js`, `game.js`, `mode.js`, `reading_mode.js`, `createUser.js`

### Key Features

1. **Authentication System**: User registration and login functionality with password hashing
2. **Game Modes**: 
   - Math modes: Addition, subtraction, multiplication, division, fractions, decimals, angles, and mixed practice
   - Reading modes: Vocabulary, comprehension, grammar, and spelling
3. **Progress Tracking**: Score and level tracking with high score persistence
4. **Timed Challenges**: 60-second timed sessions for improved engagement
5. **Visual Elements**: Canvas-based angle visualization and responsive design
6. **Audio Feedback**: Sound effects for correct and incorrect answers
7. **User Session Management**: Local storage-based session persistence
8. **User Inactivity System**: Automatic archiving of inactive users after 1 week

## Building and Running

### Prerequisites
- Python 3.x
- Flask framework
- SQLite database

### Setup Instructions
1. Install dependencies:
   ```bash
   pip install flask werkzeug
   ```

2. Initialize the database:
   The application automatically initializes the database (`mathgame.db`) if it doesn't exist using the `schema.sql` file.

3. Run the application:
   ```bash
   python app.py
   ```
   
4. Access the application:
   Open your browser and navigate to `http://localhost:5000`

### Alternative Frontend Access
For basic frontend functionality without backend authentication, you can open individual HTML files directly in your browser:
- `index.html` - Main login/welcome page
- `createUsername.html` - User registration
- `mode.html` - Game mode selection
- `game.html` - Main game interface

## Development Conventions

### Frontend Architecture
- Each page has its dedicated JavaScript file for page-specific logic
- Uses local storage for user session management and game state
- Implements responsive design for both desktop and mobile devices
- Audio feedback using Web Audio API
- Canvas element for visual math challenges (angles)

### Game Logic
- The main game logic is contained in `game.js`
- Problems are dynamically generated based on selected game mode
- Score increases by 1 for correct answers, decreases by 1 for wrong answers
- Level increases every 10 points scored
- Timer set to 60 seconds per session

### Data Storage
- User credentials stored securely with password hashing
- Session data stored in browser's localStorage
- Scores are tracked with high score persistence per user

### Naming Conventions
- File names use lowercase with underscores
- JavaScript variables and functions use camelCase
- CSS classes use hyphens
- Database tables and columns use snake_case

## Special Notes

1. The application uses localStorage for session management when running standalone (without Flask backend)
2. When running with the Flask backend, authentication goes through server-side API endpoints
3. The application automatically archives inactive users after 7 days of inactivity
4. Keyboard shortcuts (1-4) can be used to select answers during gameplay

## File Structure
- `app.py`: Flask application server
- `schema.sql`: Database schema definition
- `index.html`, `game.html`, `mode.html`, `reading_mode.html`: Main pages
- `login.js`, `game.js`, `mode.js`, `reading_mode.js`: Page-specific scripts
- `style.css`: Shared styling
- `*.py`, `*.js`, `*.html` files: Additional components and resources
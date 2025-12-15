from flask import Flask, request, jsonify, render_template, g
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
DATABASE = 'mathgame.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Return rows as dictionary-like objects
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# Initialize the database if it doesn't exist
if not os.path.exists(DATABASE):
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/game')
def game_page():
    return render_template('game.html')

@app.route('/createUser')
def createUser_page():
    return render_template('createUser.html')

@app.route('/mode')
def mode_page():
    return render_template('mode.html')

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'})

    hashed_password = generate_password_hash(password)
    db = get_db()
    try:
        db.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                   (username, hashed_password))
        db.commit()
        return jsonify({'message': 'User created successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    db = get_db()
    user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()

    if user and check_password_hash(user['password'], password):
        # In a real app, you'd create a session or token here
        return jsonify({'message': 'Login successful', 'user_id': user['id'], 'username': user['username']})
    else:
        return jsonify({'error': 'Invalid credentials'})

@app.route('/api/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    user_id = data.get('user_id')
    score = data.get('score')
    # Potentially other game data

    if not user_id or score is None:
        return jsonify({'error': 'User ID and score are required'})

    db = get_db()
    try:
        # This is a placeholder. You might want a separate 'scores' table.
        # For now, let's just log it as a message for simplicity
        log_message = f"User {user_id} achieved score: {score}"
        db.execute('INSERT INTO logs (user_id, log_message) VALUES (?, ?)',
                   (user_id, log_message))
        db.commit()
        return jsonify({'message': 'Score logged successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

# Serve static files from a 'static' directory
# You may need to adjust your HTML files to link to '/static/...' for CSS/JS
@app.route('/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

if __name__ == '__main__':
    # It's recommended to use a production-ready WSGI server like Gunicorn
    # For development, Flask's built-in server is fine.
    # To run: python app.py
    app.run(debug=True)

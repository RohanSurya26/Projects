import os
from flask import Flask, redirect, url_for, session, g
from database import init_db, get_db_connection
from prolog_engine import get_prolog_engine

# Import blueprints
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.students import students_bp
from routes.faculty import faculty_bp
from routes.subjects import subjects_bp
from routes.attendance import attendance_bp
from routes.grades import grades_bp
from routes.fees import fees_bp
from routes.timetable import timetable_bp
from routes.events import events_bp
from routes.insights import insights_bp

app = Flask(__name__)
# In a real app, use a secure random key
app.secret_key = 'super_secret_aiml_secure_key'

# Initialize database if it doesn't exist
if not os.path.exists('campus.db'):
    with app.app_context():
        init_db()

@app.before_request
def load_user():
    """Load user context before every request."""
    g.user_id = session.get('user_id')
    g.role = session.get('role')
    
    # Store global DB connection
    g.db = get_db_connection()

@app.teardown_request
def close_db(error):
    """Close DB connection after every request."""
    if hasattr(g, 'db'):
        g.db.close()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(students_bp)
app.register_blueprint(faculty_bp)
app.register_blueprint(subjects_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(grades_bp)
app.register_blueprint(fees_bp)
app.register_blueprint(timetable_bp)
app.register_blueprint(events_bp)
app.register_blueprint(insights_bp)

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))
    return redirect(url_for('auth.login'))

if __name__ == '__main__':
    # Initialize Prolog engine on startup
    get_prolog_engine()
    app.run(debug=True)

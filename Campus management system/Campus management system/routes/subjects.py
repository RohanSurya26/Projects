from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash

subjects_bp = Blueprint('subjects', __name__, url_prefix='/subjects')

@subjects_bp.before_request
def require_admin():
    if session.get('role') not in ['admin', 'faculty']:
        flash('Access Denied', 'error')
        return redirect(url_for('dashboard.index'))

@subjects_bp.route('/')
def index():
    cur = g.db.cursor()
    cur.execute("SELECT * FROM subjects ORDER BY semester ASC, code ASC")
    subjects = cur.fetchall()
    return render_template('admin/subjects.html', subjects=subjects)

@subjects_bp.route('/add', methods=['POST'])
def add():
    code = request.form['code']
    name = request.form['name']
    semester = request.form['semester']
    credits = request.form['credits']

    cur = g.db.cursor()
    try:
        cur.execute("""
            INSERT INTO subjects (code, name, semester, credits)
            VALUES (?, ?, ?, ?)
        """, (code, name, semester, credits))
        g.db.commit()
        flash('Subject added successfully!', 'success')
    except Exception as e:
        flash(f'Error adding subject: {str(e)}', 'error')

    return redirect(url_for('subjects.index'))

@subjects_bp.route('/delete/<int:id>')
def delete(id):
    cur = g.db.cursor()
    cur.execute("DELETE FROM subjects WHERE id = ?", (id,))
    g.db.commit()
    flash('Subject deleted.', 'success')
    return redirect(url_for('subjects.index'))

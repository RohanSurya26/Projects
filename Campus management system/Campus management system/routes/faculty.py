from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash

faculty_bp = Blueprint('faculty', __name__, url_prefix='/faculty')

@faculty_bp.before_request
def require_admin():
    if session.get('role') != 'admin':
        flash('Admin access required', 'error')
        return redirect(url_for('dashboard.index'))

@faculty_bp.route('/')
def index():
    cur = g.db.cursor()
    cur.execute("SELECT * FROM faculty ORDER BY name ASC")
    faculties = cur.fetchall()
    return render_template('admin/faculty.html', faculties=faculties)

@faculty_bp.route('/add', methods=['POST'])
def add():
    emp_id = request.form['emp_id']
    name = request.form['name']
    designation = request.form['designation']
    email = request.form['email']
    phone = request.form['phone']

    cur = g.db.cursor()
    try:
        cur.execute("""
            INSERT INTO faculty (emp_id, name, designation, email, phone)
            VALUES (?, ?, ?, ?, ?)
        """, (emp_id, name, designation, email, phone))
        g.db.commit()
        flash('Faculty member added successfully!', 'success')
    except Exception as e:
        flash(f'Error adding faculty: {str(e)}', 'error')

    return redirect(url_for('faculty.index'))

@faculty_bp.route('/delete/<int:id>')
def delete(id):
    cur = g.db.cursor()
    cur.execute("DELETE FROM faculty WHERE id = ?", (id,))
    g.db.commit()
    flash('Faculty records deleted.', 'success')
    return redirect(url_for('faculty.index'))

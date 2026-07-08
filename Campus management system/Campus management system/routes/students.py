from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash

students_bp = Blueprint('students', __name__, url_prefix='/students')

@students_bp.before_request
def require_admin():
    if session.get('role') not in ['admin', 'faculty']:
        flash('Access Denied', 'error')
        return redirect(url_for('dashboard.index'))

@students_bp.route('/')
def index():
    cur = g.db.cursor()
    cur.execute("SELECT * FROM students ORDER BY semester ASC, roll_no ASC")
    students = cur.fetchall()
    return render_template('admin/students.html', students=students)

@students_bp.route('/add', methods=['POST'])
def add():
    roll_no = request.form['roll_no']
    name = request.form['name']
    semester = request.form['semester']
    section = request.form['section']
    email = request.form['email']
    phone = request.form['phone']
    admission_year = request.form['admission_year']

    cur = g.db.cursor()
    try:
        cur.execute("""
            INSERT INTO students (roll_no, name, semester, section, email, phone, admission_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (roll_no, name, semester, section, email, phone, admission_year))
        g.db.commit()
        flash('Student added successfully!', 'success')
    except Exception as e:
        flash(f'Error adding student: {str(e)}', 'error')

    return redirect(url_for('students.index'))

@students_bp.route('/delete/<int:id>')
def delete(id):
    cur = g.db.cursor()
    cur.execute("DELETE FROM students WHERE id = ?", (id,))
    g.db.commit()
    flash('Student records deleted.', 'success')
    return redirect(url_for('students.index'))

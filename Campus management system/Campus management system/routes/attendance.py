from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__, url_prefix='/attendance')

@attendance_bp.route('/')
def index():
    if session.get('role') in ['admin', 'faculty']:
        cur = g.db.cursor()
        
        # Get subjects for filter
        cur.execute("SELECT * FROM subjects ORDER BY semester ASC")
        subjects = cur.fetchall()
        
        # Get selected subject and date from args, default to today
        subject_id = request.args.get('subject_id', type=int)
        date = request.args.get('date', default=datetime.today().strftime('%Y-%m-%d'))
        
        students = []
        existing_attendance = {}
        
        if subject_id:
            # Find which semester this subject belongs to
            cur.execute("SELECT semester FROM subjects WHERE id = ?", (subject_id,))
            sem = cur.fetchone()['semester']
            
            # Get students in that semester
            cur.execute("SELECT * FROM students WHERE semester = ?", (sem,))
            students = cur.fetchall()
            
            # Check if attendance already marked for this subject & date
            cur.execute("SELECT student_id, status FROM attendance WHERE subject_id = ? AND date = ?", (subject_id, date))
            records = cur.fetchall()
            existing_attendance = {r['student_id']: r['status'] for r in records}

        return render_template('admin/attendance.html', 
                               subjects=subjects, 
                               subject_id=subject_id, 
                               date=date, 
                               students=students,
                               existing_attendance=existing_attendance)
    else:
        # Student View
        student_id = session.get('user_id')
        cur = g.db.cursor()
        
        cur.execute("""
            SELECT s.name, s.code,
                   COUNT(a.id) as total_classes,
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present_classes
            FROM subjects s
            LEFT JOIN attendance a ON s.id = a.subject_id AND a.student_id = ?
            GROUP BY s.id
        """, (student_id,))
        records = cur.fetchall()
        
        attendance_data = []
        for r in records:
            pct = 0
            if r['total_classes'] > 0:
                pct = round((r['present_classes'] / r['total_classes']) * 100, 2)
            
            # Call Prolog to check eligibility
            from prolog_engine import get_prolog_engine
            engine = get_prolog_engine()
            eligible = engine.check_eligibility(pct)
            
            attendance_data.append({
                'subject': r['name'],
                'code': r['code'],
                'total': r['total_classes'],
                'present': r['present_classes'],
                'percentage': pct,
                'eligible': eligible
            })
            
        return render_template('student/attendance.html', records=attendance_data)

@attendance_bp.route('/mark', methods=['POST'])
def mark():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    subject_id = request.form['subject_id']
    date = request.form['date']
    
    cur = g.db.cursor()
    # Delete existing records for this subject/date to prevent duplicates if editing
    cur.execute("DELETE FROM attendance WHERE subject_id = ? AND date = ?", (subject_id, date))
    
    # Process each student's status
    for key, val in request.form.items():
        if key.startswith('status_'):
            student_id = key.split('_')[1]
            cur.execute("""
                INSERT INTO attendance (student_id, subject_id, date, status)
                VALUES (?, ?, ?, ?)
            """, (student_id, subject_id, date, val))
            
    g.db.commit()
    flash('Attendance saved successfully!', 'success')
    return redirect(url_for('attendance.index', subject_id=subject_id, date=date))

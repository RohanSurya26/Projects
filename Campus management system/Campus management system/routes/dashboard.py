from flask import Blueprint, render_template, g, session, redirect, url_for

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/')
def index():
    if 'role' not in session:
        return redirect(url_for('auth.login'))

    cur = g.db.cursor()
    
    if session['role'] in ['admin', 'faculty']:
        # Admin Stats
        cur.execute("SELECT COUNT(*) as count FROM students")
        total_students = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM faculty")
        total_faculty = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM subjects")
        total_subjects = cur.fetchone()['count']
        
        # Data for Chart.js
        cur.execute("SELECT semester, COUNT(*) as count FROM students GROUP BY semester ORDER BY semester ASC")
        sem_data = cur.fetchall()
        sem_labels = [f"Sem {row['semester']}" for row in sem_data]
        sem_counts = [row['count'] for row in sem_data]
        
        return render_template('admin/dashboard.html', 
                               total_students=total_students,
                               total_faculty=total_faculty,
                               total_subjects=total_subjects,
                               sem_labels=sem_labels,
                               sem_counts=sem_counts)
    else:
        # Student Dashboard
        student_id = session.get('user_id')
        cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        student = cur.fetchone()
        
        # Calculate overall attendance
        cur.execute("""
            SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present_classes
            FROM attendance WHERE student_id = ?
        """, (student_id,))
        att_data = cur.fetchone()
        
        att_pct = 0
        if att_data['total_classes'] > 0:
            att_pct = round((att_data['present_classes'] / att_data['total_classes']) * 100, 2)
        # Fetch per-subject attendance for chart
        cur.execute("""
            SELECT s.code,
                   COUNT(a.id) as total_classes,
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present_classes
            FROM subjects s
            LEFT JOIN attendance a ON s.id = a.subject_id AND a.student_id = ?
            WHERE s.semester = ?
            GROUP BY s.id
        """, (student_id, student['semester']))
        att_subject_records = cur.fetchall()
        
        subj_labels = []
        subj_att = []
        for r in att_subject_records:
            subj_labels.append(r['code'])
            if r['total_classes'] > 0:
                subj_att.append(round((r['present_classes'] / r['total_classes']) * 100, 2))
            else:
                subj_att.append(0)
                
        # Fetch monthly attendance for bar chart
        cur.execute("""
            SELECT strftime('%Y-%m', date) as month,
                   COUNT(id) as total_classes,
                   SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present_classes
            FROM attendance 
            WHERE student_id = ?
            GROUP BY month
            ORDER BY month ASC
        """, (student_id,))
        monthly_records = cur.fetchall()
        
        from datetime import datetime
        month_labels = []
        month_att = []
        for r in monthly_records:
            if r['month']:  # check if not none
                try:
                    dt = datetime.strptime(r['month'], '%Y-%m')
                    formatted_month = dt.strftime('%b %Y') # e.g. Oct 2025
                except:
                    formatted_month = r['month']
                    
                month_labels.append(formatted_month)
                if r['total_classes'] > 0:
                    month_att.append(round((r['present_classes'] / r['total_classes']) * 100, 2))
                else:
                    month_att.append(0)
                
        return render_template('student/dashboard.html', 
                               student=student, 
                               att_pct=att_pct,
                               subj_labels=subj_labels,
                               subj_att=subj_att,
                               month_labels=month_labels,
                               month_att=month_att)

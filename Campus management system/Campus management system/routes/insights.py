import os
from flask import Blueprint, render_template, session, redirect, url_for, g
from prolog_engine import get_prolog_engine

insights_bp = Blueprint('insights', __name__, url_prefix='/student/insights')

@insights_bp.route('/')
def index():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('auth.login'))
        
    student_id = session['user_id']
    cursor = g.db.cursor()
    
    # Get student info
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    
    if not student:
         return redirect(url_for('dashboard.index'))
         
    # Calculate Attendance Percentage
    cursor.execute("""
        SELECT COUNT(*) as total, SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present
        FROM attendance WHERE student_id = ?
    """, (student_id,))
    att_data = cursor.fetchone()
    att_pct = 0
    if att_data['total'] > 0:
        att_pct = round((att_data['present'] / att_data['total']) * 100, 2)
        
    # Calculate Average Marks (Out of 100)
    cursor.execute("""
        SELECT COUNT(*) as total_subjects, SUM(internal_marks + external_marks) as sum_marks
        FROM grades WHERE student_id = ?
    """, (student_id,))
    grades_data = cursor.fetchone()
    avg_marks = 0
    if grades_data['total_subjects'] > 0:
        avg_marks = round(grades_data['sum_marks'] / grades_data['total_subjects'], 2)
        
    # Interact with Prolog Engine
    engine = get_prolog_engine()
    career_path = engine.get_career_pathway(avg_marks)
    risk_status = engine.get_academic_risk(att_pct, avg_marks)
    
    # Retrieve top subject
    cursor.execute("""
        SELECT s.name, (g.internal_marks + g.external_marks) as total
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = ?
        ORDER BY total DESC LIMIT 1
    """, (student_id,))
    top_subject = cursor.fetchone()
    top_subject_name = top_subject['name'] if top_subject else "N/A"
         
    # Determine AI Reasoning Statistics & Pathway Stages
    stage_data = []
    ai_reason = {}
    
    if avg_marks >= 85:
        stage_data = ['B.Tech AIML', 'Advanced DL Project', 'M.S. / Ph.D. Acceptance', 'Research Scientist']
        ai_reason = {'threshold': 85, 'gap': round(avg_marks - 85, 2), 'status': 'Exceeded threshold for elite research pathway.'}
    elif avg_marks >= 75:
        stage_data = ['B.Tech AIML', 'DSA & ML Modeling', 'Junior ML Internship', 'ML Engineer']
        ai_reason = {'threshold': 75, 'gap': round(avg_marks - 75, 2), 'status': 'Strong baseline for core engineering roles.'}
    elif avg_marks >= 65:
        stage_data = ['B.Tech AIML', 'Statistics Focus', 'Data Eng Projects', 'Data Scientist']
        ai_reason = {'threshold': 65, 'gap': round(avg_marks - 65, 2), 'status': 'Appropriate proficiency for analytics roles.'}
    elif avg_marks >= 50:
        stage_data = ['B.Tech AIML', 'Full-Stack / Core CS', 'Software Dev Intern', 'SDE Role']
        ai_reason = {'threshold': 50, 'gap': round(avg_marks - 50, 2), 'status': 'Met baseline for software development.'}
    else:
        stage_data = ['Current State', 'Enrolled in Tutoring', 'Clear Backlogs', 'Re-Evaluate Path']
        ai_reason = {'threshold': 50, 'gap': round(50 - avg_marks, 2), 'status': f"Fell short of baseline by {round(50 - avg_marks, 2)} points. Immediate recovery required."}
        
    return render_template('student/insights.html', 
                           student=student, 
                           career_path=career_path, 
                           risk_status=risk_status,
                           att_pct=att_pct,
                           avg_marks=avg_marks,
                           top_subject_name=top_subject_name,
                           stages=stage_data,
                           reason=ai_reason)


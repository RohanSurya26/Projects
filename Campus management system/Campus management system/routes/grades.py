from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash
from prolog_engine import get_prolog_engine

grades_bp = Blueprint('grades', __name__, url_prefix='/grades')

@grades_bp.route('/')
def index():
    engine = get_prolog_engine()
    if session.get('role') in ['admin', 'faculty']:
        cur = g.db.cursor()
        
        cur.execute("SELECT * FROM subjects ORDER BY semester ASC")
        subjects = cur.fetchall()
        
        subject_id = request.args.get('subject_id', type=int)
        students = []
        existing_grades = {}
        
        if subject_id:
            cur.execute("SELECT semester FROM subjects WHERE id = ?", (subject_id,))
            sem = cur.fetchone()['semester']
            
            cur.execute("SELECT * FROM students WHERE semester = ?", (sem,))
            students = cur.fetchall()
            
            cur.execute("SELECT student_id, internal_marks, external_marks FROM grades WHERE subject_id = ?", (subject_id,))
            records = cur.fetchall()
            for r in records:
                existing_grades[r['student_id']] = {
                    'internal_marks': r['internal_marks'],
                    'external_marks': r['external_marks']
                }

        # Calculate live grade for preview using Prolog
        for s in students:
            if s['id'] in existing_grades:
                int_m = existing_grades[s['id']]['internal_marks'] or 0
                ext_m = existing_grades[s['id']]['external_marks'] or 0
                total = int_m + ext_m
                existing_grades[s['id']]['total'] = total
                existing_grades[s['id']]['grade'] = engine.get_grade(total)

        return render_template('admin/grades.html', 
                               subjects=subjects, 
                               subject_id=subject_id, 
                               students=students,
                               existing_grades=existing_grades)
    else:
        # Student View
        student_id = session.get('user_id')
        cur = g.db.cursor()
        
        cur.execute("""
            SELECT s.name, s.code, s.credits,
                   g.internal_marks, g.external_marks
            FROM subjects s
            JOIN grades g ON s.id = g.subject_id
            WHERE g.student_id = ?
        """, (student_id,))
        records = cur.fetchall()
        
        grade_card = []
        total_credits = 0
        total_points = 0
        
        for r in records:
            int_m = r['internal_marks'] or 0
            ext_m = r['external_marks'] or 0
            total = int_m + ext_m
            
            # Prolog AI query
            letter_grade = engine.get_grade(total)
            grade_pt = engine.get_grade_point(letter_grade)
            
            total_credits += r['credits']
            total_points += (grade_pt * r['credits'])
            
            grade_card.append({
                'subject': r['name'],
                'code': r['code'],
                'credits': r['credits'],
                'internal': int_m,
                'external': ext_m,
                'total': total,
                'grade': letter_grade
            })
            
        cgpa = round(total_points / total_credits, 2) if total_credits > 0 else 0
        
        return render_template('student/grades.html', grade_card=grade_card, cgpa=cgpa)

@grades_bp.route('/save', methods=['POST'])
def save():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    subject_id = request.form['subject_id']
    cur = g.db.cursor()
    
    # Process dynamically submitted fields
    # Expected fields: int_mark_STUDENTID and ext_mark_STUDENTID
    students_processed = set()
    
    for key, val in request.form.items():
        if key.startswith('int_mark_') or key.startswith('ext_mark_'):
            student_id = key.split('_')[2]
            if student_id not in students_processed:
                students_processed.add(student_id)
                
                int_val = request.form.get(f'int_mark_{student_id}', type=int, default=0)
                ext_val = request.form.get(f'ext_mark_{student_id}', type=int, default=0)
                
                # Check if exists
                cur.execute("SELECT id FROM grades WHERE student_id = ? AND subject_id = ?", (student_id, subject_id))
                rec = cur.fetchone()
                
                if rec:
                    cur.execute("""
                        UPDATE grades SET internal_marks = ?, external_marks = ?
                        WHERE id = ?
                    """, (int_val, ext_val, rec['id']))
                else:
                    cur.execute("""
                        INSERT INTO grades (student_id, subject_id, internal_marks, external_marks)
                        VALUES (?, ?, ?, ?)
                    """, (student_id, subject_id, int_val, ext_val))
                    
    g.db.commit()
    flash('Grades saved successfully!', 'success')
    return redirect(url_for('grades.index', subject_id=subject_id))

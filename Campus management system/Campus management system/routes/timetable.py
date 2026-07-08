from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash

timetable_bp = Blueprint('timetable', __name__, url_prefix='/timetable')

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
SLOTS = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00']

@timetable_bp.route('/')
def index():
    cur = g.db.cursor()
    
    if session.get('role') in ['admin', 'faculty']:
        # Admin View - Select Semester
        # Admin View - Select Semester & Section
        semester = request.args.get('semester', type=int)
        section = request.args.get('section', default='A')
        
        cur.execute("SELECT id, name FROM faculty")
        faculties = cur.fetchall()
        
        subjects = []
        schedule = {}
        
        if semester:
            cur.execute("SELECT id, code, name FROM subjects WHERE semester = ?", (semester,))
            subjects = cur.fetchall()
            
            # Load timetable for grid
            cur.execute("""
                SELECT t.*, s.code as subject_code, f.name as faculty_name
                FROM timetable t
                LEFT JOIN subjects s ON t.subject_id = s.id
                LEFT JOIN faculty f ON t.faculty_id = f.id
                WHERE t.semester = ? AND t.section = ?
            """, (semester, section))
            records = cur.fetchall()
            
            for d in DAYS:
                schedule[d] = {}
                for s in SLOTS:
                    schedule[d][s] = None
            
            for r in records:
                if r['day_of_week'] in schedule and r['time_slot'] in schedule[r['day_of_week']]:
                    schedule[r['day_of_week']][r['time_slot']] = r

        return render_template('admin/timetable.html', 
                               semester=semester,
                               section=section,
                               subjects=subjects, 
                               faculties=faculties,
                               days=DAYS, slots=SLOTS, schedule=schedule)
    else:
        # Student View
        student_id = session.get('user_id')
        cur.execute("SELECT semester, section FROM students WHERE id = ?", (student_id,))
        s_row = cur.fetchone()
        
        semester = s_row['semester'] if s_row else 1
        section = s_row['section'] if s_row else 'A'
        
        schedule = {}
        for d in DAYS:
            schedule[d] = {}
            for s in SLOTS:
                schedule[d][s] = None
        
        cur.execute("""
            SELECT t.*, s.code as subject_code, s.name as subject_name, f.name as faculty_name
            FROM timetable t
            LEFT JOIN subjects s ON t.subject_id = s.id
            LEFT JOIN faculty f ON t.faculty_id = f.id
            WHERE t.semester = ? AND t.section = ?
        """, (semester, section))
        records = cur.fetchall()
        
        for r in records:
            if r['day_of_week'] in schedule and r['time_slot'] in schedule[r['day_of_week']]:
                schedule[r['day_of_week']][r['time_slot']] = r
                
        return render_template('student/timetable.html', semester=semester, section=section, days=DAYS, slots=SLOTS, schedule=schedule)

@timetable_bp.route('/save', methods=['POST'])
def save():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    semester = request.form['semester']
    section = request.form['section']
    day = request.form['day_of_week']
    slot = request.form['time_slot']
    subject_id = request.form['subject_id']
    faculty_id = request.form['faculty_id']
    room = request.form['room']
    
    cur = g.db.cursor()
    
    # Check if that semester slot is already full (Update instead of insert)
    cur.execute("""
        SELECT id FROM timetable WHERE semester = ? AND section = ? AND day_of_week = ? AND time_slot = ?
    """, (semester, section, day, slot))
    slot_exist = cur.fetchone()

    # Get all timetable entries, excluding the current slot if we are updating it
    if slot_exist:
        cur.execute("SELECT day_of_week, time_slot, section, faculty_id, subject_id, room FROM timetable WHERE id != ?", (slot_exist['id'],))
    else:
        cur.execute("SELECT day_of_week, time_slot, section, faculty_id, subject_id, room FROM timetable")
    all_entries = cur.fetchall()

    timetable_data = [(row['day_of_week'], row['time_slot'], row['section'], row['faculty_id'], row['subject_id'], row['room']) for row in all_entries]
    new_entry = (day, slot, section, faculty_id, subject_id, room)

    from prolog_engine import get_prolog_engine
    prolog = get_prolog_engine()
    conflict_type = prolog.check_timetable_conflict(timetable_data, new_entry)

    if conflict_type == "Faculty Conflict":
        flash(f"Prolog AI Alert: Conflict detected! Faculty is already booked for another section on {day} at {slot}.", "error")
        return redirect(url_for('timetable.index', semester=semester, section=section))
    elif conflict_type == "Room Conflict":
        flash(f"Prolog AI Alert: Conflict detected! Room {room} is already booked for another section on {day} at {slot}.", "error")
        return redirect(url_for('timetable.index', semester=semester, section=section))
    elif conflict_type == "Section Conflict":
        flash(f"Prolog AI Alert: Conflict detected! Section {section} already has a different subject scheduled.", "error")
        return redirect(url_for('timetable.index', semester=semester, section=section))

    if slot_exist:
        cur.execute("""
            UPDATE timetable SET subject_id=?, faculty_id=?, room=? WHERE id=?
        """, (subject_id, faculty_id, room, slot_exist['id']))
    else:
        cur.execute("""
            INSERT INTO timetable (semester, section, day_of_week, time_slot, subject_id, faculty_id, room)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (semester, section, day, slot, subject_id, faculty_id, room))
        
    g.db.commit()
    flash('Timetable slot saved.', 'success')
    return redirect(url_for('timetable.index', semester=semester, section=section))

@timetable_bp.route('/clear', methods=['POST'])
def clear():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    slot_id = request.form['slot_id']
    semester = request.form['semester']
    section = request.form.get('section', 'A')
    
    cur = g.db.cursor()
    cur.execute("DELETE FROM timetable WHERE id = ?", (slot_id,))
    g.db.commit()
    flash('Timetable slot cleared.', 'success')
    
    return redirect(url_for('timetable.index', semester=semester, section=section))

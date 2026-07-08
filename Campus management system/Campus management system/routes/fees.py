from flask import Blueprint, render_template, request, redirect, url_for, g, session, flash

fees_bp = Blueprint('fees', __name__, url_prefix='/fees')

@fees_bp.route('/')
def index():
    if session.get('role') in ['admin', 'faculty']:
        cur = g.db.cursor()
        
        # Load all students with their fee summaries
        # If no fee record for the student's current semester exists, display them as 'Not Generated'
        cur.execute("""
            SELECT s.id as student_id, s.roll_no, s.name, s.semester,
                   f.id as fee_id, f.total_amount, f.amount_paid, f.status, f.due_date
            FROM students s
            LEFT JOIN fees f ON s.id = f.student_id AND s.semester = f.semester
            ORDER BY s.semester ASC, s.roll_no ASC
        """)
        records = cur.fetchall()
        
        return render_template('admin/fees.html', records=records)
    else:
        # Student View
        student_id = session.get('user_id')
        cur = g.db.cursor()
        
        cur.execute("""
            SELECT * FROM fees 
            WHERE student_id = ?
            ORDER BY semester DESC
        """, (student_id,))
        records = cur.fetchall()
        
        total_due = sum((r['total_amount'] - r['amount_paid']) for r in records if r['status'] != 'Paid')
        
        return render_template('student/fees.html', records=records, total_due=total_due)


@fees_bp.route('/generate', methods=['POST'])
def generate():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    student_id = request.form['student_id']
    semester = request.form['semester']
    total_amount = request.form['total_amount']
    due_date = request.form['due_date']
    
    cur = g.db.cursor()
    try:
        cur.execute("""
            INSERT INTO fees (student_id, semester, total_amount, amount_paid, due_date, status)
            VALUES (?, ?, ?, 0, ?, 'Pending')
        """, (student_id, semester, total_amount, due_date))
        g.db.commit()
        flash('Fee structure generated for student.', 'success')
    except Exception as e:
        flash(f'Error generating fee: {str(e)}', 'error')
        
    return redirect(url_for('fees.index'))

@fees_bp.route('/pay', methods=['POST'])
def pay():
    if session.get('role') not in ['admin', 'faculty']:
        return redirect(url_for('dashboard.index'))
        
    fee_id = request.form['fee_id']
    payment_amount = float(request.form['payment_amount'])
    
    cur = g.db.cursor()
    cur.execute("SELECT total_amount, amount_paid FROM fees WHERE id = ?", (fee_id,))
    fee = cur.fetchone()
    
    if fee:
        new_paid = fee['amount_paid'] + payment_amount
        status = 'Paid' if new_paid >= fee['total_amount'] else 'Partial'
        
        cur.execute("""
            UPDATE fees SET amount_paid = ?, status = ? WHERE id = ?
        """, (new_paid, status, fee_id))
        g.db.commit()
        flash('Payment recorded successfully.', 'success')
        
    return redirect(url_for('fees.index'))

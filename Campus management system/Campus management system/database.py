import sqlite3
import os
import random
from datetime import datetime, timedelta
DB_FILE = "campus.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table (Admin/Faculty)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    # Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        semester INTEGER NOT NULL,
        section TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        admission_year INTEGER
    )
    """)

    # Faculty Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        designation TEXT,
        email TEXT,
        phone TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Subjects Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        semester INTEGER NOT NULL,
        credits INTEGER NOT NULL
    )
    """)

    # Faculty-Subject Assignment
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS faculty_subjects (
        faculty_id INTEGER,
        subject_id INTEGER,
        PRIMARY KEY(faculty_id, subject_id),
        FOREIGN KEY(faculty_id) REFERENCES faculty(id),
        FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
    """)

    # Attendance Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject_id INTEGER,
        date TEXT NOT NULL,
        status TEXT NOT NULL, -- P, A, L
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
    """)

    # Grades Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject_id INTEGER,
        internal_marks INTEGER, -- out of 40
        external_marks INTEGER, -- out of 60
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )
    """)

    # Fees Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        semester INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        amount_paid REAL NOT NULL DEFAULT 0,
        due_date TEXT,
        status TEXT NOT NULL DEFAULT 'Pending',
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # Timetable Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester INTEGER NOT NULL,
        section TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        subject_id INTEGER,
        faculty_id INTEGER,
        room TEXT,
        FOREIGN KEY(subject_id) REFERENCES subjects(id),
        FOREIGN KEY(faculty_id) REFERENCES faculty(id)
    )
    """)

    seed_data(cursor)
    conn.commit()
    conn.close()

def seed_data(cursor):
    # Seed Admin
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", 
                       ('admin', 'admin123', 'admin'))
        
    # Seed Faculty
    faculty_list = [
        ('turing', 'Prof. Alan Turing', 'Professor of AI'),
        ('hopper', 'Dr. Grace Hopper', 'Associate Professor'),
        ('lovelace', 'Dr. Ada Lovelace', 'Assistant Professor'),
        ('mccarthy', 'Prof. John McCarthy', 'Professor of ML'),
        ('ng', 'Dr. Andrew Ng', 'Associate Professor'),
        ('hinton', 'Prof. Geoffrey Hinton', 'Professor of Deep Learning'),
        ('lecun', 'Dr. Yann LeCun', 'Assistant Professor'),
        ('bengio', 'Dr. Yoshua Bengio', 'Professor of AI Ethics')
    ]
    for idx, (username, name, desig) in enumerate(faculty_list):
        emp_id = f'FAC{str(idx+1).zfill(3)}'
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", (username, f'{username}123', 'faculty'))
            user_id = cursor.lastrowid
            cursor.execute("INSERT INTO faculty (emp_id, name, designation, email, user_id) VALUES (?, ?, ?, ?, ?)",
                           (emp_id, name, desig, f"{username}@aiml.edu", user_id))

    # Seed Subjects
    subjects = [
        ('CS101', 'Introduction to Programming', 1, 4),
        ('MA102', 'Engineering Mathematics I', 1, 4),
        ('PH103', 'Engineering Physics', 1, 3),
        ('EE104', 'Basic Electrical Engg', 1, 3),
        ('CS201', 'Data Structures', 2, 4),
        ('MA202', 'Discrete Mathematics', 2, 4),
        ('AI203', 'Fundamentals of AI', 2, 3),
        ('CS301', 'Algorithms and Complexity', 3, 4),
        ('AI302', 'Machine Learning Basics', 3, 4),
        ('DB303', 'Database Management', 3, 3),
        ('DL401', 'Deep Learning', 4, 4),
        ('NLP402', 'Natural Language Processing', 4, 4),
        ('BDA403', 'Big Data Analytics', 4, 3),
        ('RM404', 'Research Methodology', 4, 2),
        ('CV405', 'Computer Vision', 4, 4),
        ('RL501', 'Reinforcement Learning', 5, 4),
        ('CC502', 'Cloud Computing', 5, 3),
        ('RO503', 'Robotics and Control', 5, 4)
    ]
    for code, name, sem, credits in subjects:
        try:
            cursor.execute("INSERT INTO subjects (code, name, semester, credits) VALUES (?, ?, ?, ?)", (code, name, sem, credits))
        except sqlite3.IntegrityError:
            pass

    # Seed Students
    first_names = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Kabir', 'Rohan', 'Ananya', 'Diya', 'Ishita', 'Kavya', 'Neha', 'Priya', 'Riya', 'Sanya', 'Shruti', 'Vikram', 'Rahul', 'Karan', 'Sneha']
    last_names = ['Sharma', 'Reddy', 'Patel', 'Singh', 'Kumar', 'Rao', 'Desai', 'Verma', 'Das', 'Iyer', 'Menon', 'Nair', 'Bhat', 'Jain', 'Shah', 'Mishra', 'Gupta', 'Yadav']
    
    def get_roll_suffix(idx):
        if idx <= 99:
            return f"{idx:02d}"
        else:
            rem = idx - 100
            ch = chr(ord('A') + (rem // 10))
            num = rem % 10
            return f"{ch}{num}"

    def get_section(idx):
        if idx <= 65: return 'A'
        elif idx <= 131: return 'B'
        elif idx <= 197: return 'C'
        else: return 'D'

    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] < 20:
        cursor.execute("SELECT id, semester FROM subjects")
        all_subjects = cursor.fetchall()
        subj_by_sem = {}
        for s_id, s_sem in all_subjects:
            subj_by_sem.setdefault(s_sem, []).append(s_id)

        base_year = 2024
        
        for i in range(1, 221):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            roll_no = f"24N81A66{get_roll_suffix(i)}"
            semester = random.randint(1, 5)
            section = get_section(i)
            email = f"{fname.lower()}.{lname.lower()}{i}@aiml.edu"
            phone = f"98765{str(i).zfill(5)}"
            admission_year = base_year - (semester // 2)

            cursor.execute("INSERT INTO students (roll_no, name, semester, section, email, phone, admission_year) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                           (roll_no, name, semester, section, email, phone, admission_year))
            stud_id = cursor.lastrowid
            
            # Fees
            total_fee = 100000 + (semester * 10000)
            paid = total_fee if random.random() > 0.3 else total_fee * random.choice([0, 0.5, 0.8])
            status = 'Paid' if paid == total_fee else 'Pending' if paid == 0 else 'Partial'
            cursor.execute("INSERT INTO fees (student_id, semester, total_amount, amount_paid, status) VALUES (?, ?, ?, ?, ?)",
                           (stud_id, semester, total_fee, paid, status))
            
            # Grades & Attendance (only for subjects in their current semester, for variety)
            sems_to_grade = list(range(1, semester + 1))
            for g_sem in sems_to_grade:
                sem_subjects = subj_by_sem.get(g_sem, [])
                for subj_id in sem_subjects:
                    internal = random.randint(20, 40)
                    external = random.randint(30, 60)
                    cursor.execute("INSERT INTO grades (student_id, subject_id, internal_marks, external_marks) VALUES (?, ?, ?, ?)",
                                   (stud_id, subj_id, internal, external))
                                   
                    # Generate some attendance for the current semester subjects
                    if g_sem == semester:
                        for d_offset in range(15):
                            date_str = (datetime.now() - timedelta(days=d_offset)).strftime('%Y-%m-%d')
                            # skip weekends (simplified)
                            if (datetime.now() - timedelta(days=d_offset)).weekday() < 5:
                                status_att = 'P' if random.random() > 0.2 else ('A' if random.random() > 0.5 else 'L')
                                cursor.execute("INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)",
                                               (stud_id, subj_id, date_str, status_att))

if __name__ == "__main__":
    init_db()
    print("Database initialized and planted seeds.")

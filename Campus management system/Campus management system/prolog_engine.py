import os
from pyswip import Prolog

class PrologEngine:
    def __init__(self):
        self.prolog = Prolog()
        # Ensure we load the KB relative to this file
        kb_path = os.path.join(os.path.dirname(__file__), 'prolog', 'academic.pl')
        # Convert path to posix style for strict Prolog compatibility if needed
        kb_path = kb_path.replace('\\', '/')
        self.prolog.consult(kb_path)
        
    def get_grade(self, total_marks):
        query = f"grade({total_marks}, Grade)"
        results = list(self.prolog.query(query))
        if results:
            return results[0]['Grade']
        return 'F'

    def get_grade_point(self, grade):
        query = f"grade_point('{grade}', Point)"
        results = list(self.prolog.query(query))
        if results:
            return results[0]['Point']
        return 0

    def check_eligibility(self, attendance_pct):
        query = f"eligible_for_exam({attendance_pct})"
        results = list(self.prolog.query(query))
        return len(results) > 0

    def check_timetable_conflict(self, timetable_data, new_entry):
        # Retract any existing temporary timetable entries to avoid pollution
        try:
            self.prolog.retractall("timetable_entry(_,_,_,_,_,_)")
        except:
            pass

        # Assert existing timetable entries
        for entry in timetable_data:
            # entry structure: (day, slot, section, faculty_id, subject_id, room)
            self.prolog.assertz(f"timetable_entry('{entry[0]}', '{entry[1]}', '{entry[2]}', '{entry[3]}', '{entry[4]}', '{entry[5]}')")
            
        # Assert the new entry we want to test
        self.prolog.assertz(f"timetable_entry('{new_entry[0]}', '{new_entry[1]}', '{new_entry[2]}', '{new_entry[3]}', '{new_entry[4]}', '{new_entry[5]}')")

        # Query for faculty conflict specifically for this new day and slot
        day, slot = new_entry[0], new_entry[1]
        
        # Check faculty conflict
        fac_query = f"has_faculty_conflict('{day}', '{slot}', Faculty, S1, S2)"
        fac_results = list(self.prolog.query(fac_query))
        
        # Check room conflict
        room_query = f"has_room_conflict('{day}', '{slot}', Room, S1, S2)"
        room_results = list(self.prolog.query(room_query))

        # Check section conflict
        sec_query = f"has_section_conflict('{day}', '{slot}', Section, Subj1, Subj2)"
        sec_results = list(self.prolog.query(sec_query))

        # Cleanup
        try:
            self.prolog.retractall("timetable_entry(_,_,_,_,_,_)")
        except:
            pass
            
        if fac_results:
            return "Faculty Conflict"
        if room_results:
            return "Room Conflict"
        if sec_results:
            return "Section Conflict"
            
        return None

    def get_career_pathway(self, avg_marks):
        query = f"career_pathway({avg_marks}, Pathway)"
        results = list(self.prolog.query(query))
        if results:
            return results[0]['Pathway']
        return "Not Available"

    def get_academic_risk(self, att_pct, avg_marks):
        query = f"academic_risk({att_pct}, {avg_marks}, Risk)"
        results = list(self.prolog.query(query))
        if results:
            return results[0]['Risk']
        return "Unknown Profile"

# Singleton instance
engine = None

def get_prolog_engine():
    global engine
    if engine is None:
        engine = PrologEngine()
    return engine

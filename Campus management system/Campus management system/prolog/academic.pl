% academic.pl - Prolog Knowledge Base for AIML Campus Management System

% Grade Classification
% Internal (40) + External (60) = Total (100)
grade(Total, 'O')  :- Total >= 90.
grade(Total, 'A+') :- Total >= 80, Total < 90.
grade(Total, 'A')  :- Total >= 70, Total < 80.
grade(Total, 'B+') :- Total >= 60, Total < 70.
grade(Total, 'B')  :- Total >= 50, Total < 60.
grade(Total, 'F')  :- Total < 50.

% Grade Points (for CGPA calculation)
grade_point('O', 10).
grade_point('A+', 9).
grade_point('A', 8).
grade_point('B+', 7).
grade_point('B', 6).
grade_point('F', 0).

% Attendance Eligibility
% Eligible if attendance percentage is >= 75
eligible_for_exam(AttPct) :- AttPct >= 75.

% Timetable Conflict Detection
% A conflict exists if a faculty is assigned to multiple sections at the same time
has_faculty_conflict(Day, Slot, Faculty, Section1, Section2) :-
    Section1 \= Section2,
    timetable_entry(Day, Slot, Section1, Faculty, _, _),
    timetable_entry(Day, Slot, Section2, Faculty, _, _).

% Room conflict: Same Room booked for different sections at the same time
has_room_conflict(Day, Slot, Room, Section1, Section2) :-
    Section1 \= Section2,
    timetable_entry(Day, Slot, Section1, _, _, Room),
    timetable_entry(Day, Slot, Section2, _, _, Room).

% Section conflict: A section cannot have two classes at the same time
has_section_conflict(Day, Slot, Section, Subject1, Subject2) :-
    Subject1 \= Subject2,
    timetable_entry(Day, Slot, Section, _, Subject1, _),
    timetable_entry(Day, Slot, Section, _, Subject2, _).

% AI Career Pathway Inference
% Maps a student's average marks to potential career trajectories in AIML
career_pathway(AvgMarks, 'AI Research Scientist') :- AvgMarks >= 85.
career_pathway(AvgMarks, 'Machine Learning Engineer') :- AvgMarks >= 75, AvgMarks < 85.
career_pathway(AvgMarks, 'Data Scientist') :- AvgMarks >= 65, AvgMarks < 75.
career_pathway(AvgMarks, 'Software Developer') :- AvgMarks >= 50, AvgMarks < 65.
career_pathway(AvgMarks, 'Academic Recovery') :- AvgMarks < 50.

% Academic Risk Forecaster
% Flags a student's risk profile based on their attendance and grades
academic_risk(AttPct, AvgMarks, 'Critical Risk: Immediate Action Needed') :- AttPct < 75, AvgMarks < 55.
academic_risk(AttPct, AvgMarks, 'Attendance Hazard: Review Eligibility') :- AttPct < 75, AvgMarks >= 55.
academic_risk(AttPct, AvgMarks, 'Performance Hazard: Tutoring Recommended') :- AttPct >= 75, AvgMarks < 55.
academic_risk(AttPct, AvgMarks, 'Safe & On Track') :- AttPct >= 75, AvgMarks >= 55.

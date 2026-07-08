from flask import Blueprint, render_template, session, redirect, url_for, g

events_bp = Blueprint('events', __name__, url_prefix='/student/events')

@events_bp.route('/')
def index():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('auth.login'))
        
    # Static list of events for a premium timeline view
    events_list = [
        {"date": "15 Aug 2026", "name": "Independence Day", "type": "National Holiday", "desc": "Flag hoisting ceremony and cultural programs."},
        {"date": "02 Oct 2026", "name": "Gandhi Jayanti", "type": "National Holiday", "desc": "Observance of Mahatma Gandhi's birthday."},
        {"date": "24 Oct 2026", "name": "Diwali", "type": "Festival Holiday", "desc": "Festival of lights."},
        {"date": "14 Nov 2026", "name": "Children's Day", "type": "Observance", "desc": "Special campus events and seminars."},
        {"date": "05 Dec 2026", "name": "Techfest 2026", "type": "Campus Event", "desc": "Annual technical symposium featuring AI & Robotics competitions."},
        {"date": "25 Dec 2026", "name": "Christmas", "type": "Public Holiday", "desc": "Christmas Day observance."},
        {"date": "26 Jan 2027", "name": "Republic Day", "type": "National Holiday", "desc": "Republic Day parade and celebrations."},
        {"date": "05 Mar 2027", "name": "Holi", "type": "Festival Holiday", "desc": "Festival of colors."},
        {"date": "14 Apr 2027", "name": "Ambedkar Jayanti", "type": "National Holiday", "desc": "Birthday of Dr. B.R. Ambedkar."},
        {"date": "20 Apr 2027", "name": "Annual Day", "type": "Campus Event", "desc": "Annual cultural fest and prize distribution ceremony."}
    ]
    
    return render_template('student/events.html', events=events_list)

import mysql.connector
from mysql.connector import Error
import sys

# Replace with your MySQL credentials
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password', # <-- CHANGE THIS
    'database': 'music_streaming_db'
}

def create_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"\n[!] Error connecting to MySQL: '{e}'")
        print("Please ensure MySQL is running, the database is created, and your credentials are correct.")
        sys.exit(1)

def show_artist_songs(artist_name):
    conn = create_connection()
    cursor = conn.cursor()
    query = """
    SELECT s.title, a.name AS artist, s.duration 
    FROM Songs s
    JOIN Artists a ON s.artist_id = a.artist_id
    WHERE a.name = %s
    """
    cursor.execute(query, (artist_name,))
    records = cursor.fetchall()
    
    print(f"\n--- Songs by {artist_name} ---")
    if not records:
        print("No songs found.")
    else:
        for row in records:
            print(f"🎵 Title: {row[0]:<25} | 🎤 Artist: {row[1]:<15} | ⏱️ Duration: {row[2]}s")
    
    conn.close()

def show_playlist_songs(playlist_id):
    conn = create_connection()
    cursor = conn.cursor()
    query = """
    SELECT p.name AS playlist, s.title, a.name AS artist
    FROM Playlist_Songs ps
    JOIN Songs s ON ps.song_id = s.song_id
    JOIN Artists a ON s.artist_id = a.artist_id
    JOIN Playlists p ON ps.playlist_id = p.playlist_id
    WHERE p.playlist_id = %s
    """
    cursor.execute(query, (playlist_id,))
    records = cursor.fetchall()
    
    print(f"\n--- Songs in Playlist ID: {playlist_id} ---")
    if not records:
        print("Playlist is empty or does not exist.")
    else:
        print(f"Playlist Name: {records[0][0]}")
        for row in records:
            print(f"🎵 {row[1]} by {row[2]}")
            
    conn.close()

def add_song_to_playlist(playlist_id, song_id):
    conn = create_connection()
    cursor = conn.cursor()
    try:
        query = "INSERT INTO Playlist_Songs (playlist_id, song_id) VALUES (%s, %s)"
        cursor.execute(query, (playlist_id, song_id))
        conn.commit()
        print("\n✅ Song successfully added to playlist!")
    except Error as e:
        print(f"\n[!] Failed to add song: {e}")
    finally:
        conn.close()

def remove_song_from_playlist(playlist_id, song_id):
    conn = create_connection()
    cursor = conn.cursor()
    try:
        query = "DELETE FROM Playlist_Songs WHERE playlist_id = %s AND song_id = %s"
        cursor.execute(query, (playlist_id, song_id))
        conn.commit()
        if cursor.rowcount > 0:
            print("\n✅ Song successfully removed from playlist!")
        else:
            print("\n⚠️ Song or playlist not found in combination.")
    except Error as e:
        print(f"\n[!] Failed to remove song: {e}")
    finally:
        conn.close()

def main_menu():
    while True:
        print("\n" + "="*40)
        print("  🎶 MUSIC STREAMING DB CLI 🎶  ")
        print("="*40)
        print("1. View all songs by an Artist")
        print("2. View all songs in a Playlist")
        print("3. Add a Song to a Playlist")
        print("4. Remove a Song from a Playlist")
        print("5. Exit")
        print("="*40)
        
        choice = input("Enter your choice (1-5): ")
        
        if choice == '1':
            artist = input("Enter Artist Name (e.g., Daft Punk): ")
            show_artist_songs(artist)
        elif choice == '2':
            pid = input("Enter Playlist ID (e.g., 1): ")
            show_playlist_songs(pid)
        elif choice == '3':
            pid = input("Enter Playlist ID: ")
            sid = input("Enter Song ID to Add: ")
            add_song_to_playlist(pid, sid)
        elif choice == '4':
            pid = input("Enter Playlist ID: ")
            sid = input("Enter Song ID to Remove: ")
            remove_song_from_playlist(pid, sid)
        elif choice == '5':
            print("\nExiting... Goodbye! 👋")
            break
        else:
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main_menu()

# 🎵 Online Music Streaming Database Project

## 1. Project Overview
This database project simulates the core functionalities of a music streaming platform (like Spotify or Apple Music). It allows storing users, artists, songs, and organizing songs into custom user-curated playlists. 

## 2. Basic Use Cases
- **User Management**: Users register with unique email addresses.
- **Library Management**: Artists and their catalog of songs are stored.
- **Playlist Curation**: Users can dynamically create playlists and add or remove songs from them.
- **Playback Tracking (Simulation)**: By fetching songs and displaying their durations.

---

## 3. Database Schema Overview

| Table Name | Description |
|---|---|
| **Users** | Stores listener information. |
| **Artists** | Stores musical artist profiles. |
| **Songs** | Stores individual tracks, linked to their respective artist and includes playback duration. |
| **Playlists** | Custom named folders created by users to group songs. |
| **Playlist_Songs** | A mapping (junction) table to establish a many-to-many relationship between Playlists and Songs. |

### Primary & Foreign Keys Explained

- `Users`: Primary Key is `user_id`.
- `Artists`: Primary Key is `artist_id`.
- `Songs`: Primary Key is `song_id`. Contains a Foreign Key `artist_id` linking to `Artists`.
- `Playlists`: Primary Key is `playlist_id`. Contains a Foreign Key `user_id` linking to `Users`.
- `Playlist_Songs`: Composite Primary Key consisting of `(playlist_id, song_id)`. Contains two Foreign Keys referencing the `Playlists` and `Songs` tables respectively.
  - *Cascading deletes are enforced, meaning if a user deletes a playlist, all associated song mappings inside `Playlist_Songs` are cleanly removed.*

---

## 4. Entity-Relationship (ER) Diagram Description

1. **User (1) --- (N) Playlist**: One User can create multiple Playlists, but a specific Playlist belongs to only one User.
2. **Artist (1) --- (N) Song**: One Artist can produce multiple Songs, but for simplicity, each Song belongs to one exact Artist.
3. **Playlist (N) --- (M) Song**: Many-to-Many Relationship. A Playlist can contain many Songs, and a specific Song can appear in many different Playlists. This is resolved using the **Playlist_Songs** mapping table.

---

## 5. Sample Query Outputs

*Assuming the dummy data from `schema.sql` has been loaded:*

### Query: Retrieve all songs by Daft Punk
**SQL Output:**
| title | artist | duration |
|---|---|---|
| Get Lucky | Daft Punk | 369 |
| Lose Yourself to Dance | Daft Punk | 353 |

### Query: Show all songs in playlist "Ronie Favorites" (ID: 1)
**SQL Output:**
| playlist_name | title | artist_name |
|---|---|---|
| Ronie Favorites | Hey Jude | The Beatles |
| Ronie Favorites | Get Lucky | Daft Punk |
| Ronie Favorites | Hello | Adele |

---

## 6. How to Run This Project

### Step 1: Initialize Database
1. Open up your MySQL CLI or visual client (like MySQL Workbench, phpMyAdmin or DBeaver).
2. Copy and run the entire script within the `schema.sql` file. This will create the database, build all tables, establish the relationships, and populate the tables with pre-made sample data.

### Step 2: Use the Python CLI (Optional Frontend)
1. Ensure you have the MySQL Connector installed for Python:
   ```bash
   pip install mysql-connector-python
   ```
2. Open `cli_app.py` in your code editor.
3. Navigate to lines 6-11 and update your **MySQL username** and **MySQL password** inside the `DB_CONFIG` dictionary.
4. Run the script:
   ```bash
   python cli_app.py
   ```
5. Follow the interactive menu to view artist songs, explore playlists, and modify content!

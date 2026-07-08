-- ---------------------------------------------------------
-- Online Music Streaming Database - MySQL Schema & Queries
-- ---------------------------------------------------------

-- Create and Select Database
CREATE DATABASE IF NOT EXISTS music_streaming_db;
USE music_streaming_db;

-- ---------------------------------------------------------
-- 1. Table Creations & Primary/Foreign Keys Definition
-- ---------------------------------------------------------

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Songs (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    artist_id INT,
    duration INT COMMENT 'Duration in seconds',
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
);

CREATE TABLE Playlists (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Playlist_Songs (
    playlist_id INT,
    song_id INT,
    PRIMARY KEY (playlist_id, song_id), -- Composite Primary Key
    FOREIGN KEY (playlist_id) REFERENCES Playlists(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES Songs(song_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 2. Insert Sample Data
-- ---------------------------------------------------------

INSERT INTO Users (name, email) VALUES
('Ronie', 'ronie@example.com'),
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com');

INSERT INTO Artists (name) VALUES
('The Beatles'),
('Daft Punk'),
('Adele');

INSERT INTO Songs (title, artist_id, duration) VALUES
('Hey Jude', 1, 431),
('Let It Be', 1, 243),
('Get Lucky', 2, 369),
('Lose Yourself to Dance', 2, 353),
('Hello', 3, 295),
('Someone Like You', 3, 284);

INSERT INTO Playlists (user_id, name) VALUES
(1, 'Ronie Favorites'),
(1, 'Workout Mix'),
(2, 'Alice Pop'),
(3, 'Chill Vibes');

INSERT INTO Playlist_Songs (playlist_id, song_id) VALUES
(1, 1),
(1, 3),
(1, 5),
(2, 3),
(2, 4),
(3, 5),
(3, 6),
(4, 2);

-- ---------------------------------------------------------
-- 3. Required SQL Queries
-- ---------------------------------------------------------

-- A) Retrieve all songs of a specific artist (e.g., 'Daft Punk')
SELECT s.title, a.name AS artist, s.duration 
FROM Songs s
JOIN Artists a ON s.artist_id = a.artist_id
WHERE a.name = 'Daft Punk';

-- B) Show all songs in a user's playlist (e.g., playlist_id = 1, 'Ronie Favorites')
SELECT p.name AS playlist_name, s.title, a.name AS artist_name
FROM Playlist_Songs ps
JOIN Songs s ON ps.song_id = s.song_id
JOIN Artists a ON s.artist_id = a.artist_id
JOIN Playlists p ON ps.playlist_id = p.playlist_id
WHERE p.playlist_id = 1;

-- C) Add a song to a playlist (e.g., Add 'Let It Be' (song_id 2) to 'Ronie Favorites' (playlist_id 1))
INSERT INTO Playlist_Songs (playlist_id, song_id) VALUES (1, 2);

-- D) Remove a song from a playlist (e.g., Remove 'Hey Jude' (song_id 1) from 'Ronie Favorites' (playlist_id 1))
DELETE FROM Playlist_Songs WHERE playlist_id = 1 AND song_id = 1;

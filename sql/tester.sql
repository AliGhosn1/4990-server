CREATE DATABASE IF NOT EXISTS GameDB;
USE GameDB;

-- Clean slate
DROP TABLE IF EXISTS Scores;
DROP TABLE IF EXISTS GameSaves;
DROP TABLE IF EXISTS Players;

-- Players table
CREATE TABLE Players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    playerName VARCHAR(50) UNIQUE NOT NULL
);

-- Scores table
CREATE TABLE Scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    score INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE
);

-- Game save data table
CREATE TABLE GameSaves (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    saveData JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE
);

-- Selects
SELECT * FROM Players
SELECT * FROM Scores
SELECT * FROM GameSaves
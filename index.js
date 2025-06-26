const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SquareRoot1997!',
  database: 'GameDB'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

//Submit score
app.post('/submit-score', (req, res) => {
  const { playerName, score } = req.body;
  if (!playerName || score == null) return res.status(400).json({ message: 'Missing playerName or score' });

  const insertPlayer = 'INSERT IGNORE INTO Players (playerName) VALUES (?)';
  db.query(insertPlayer, [playerName], (err) => {
    if (err) return res.status(500).json({ message: 'Insert player error' });

    const getPlayerId = 'SELECT player_id FROM Players WHERE playerName = ?';
    db.query(getPlayerId, [playerName], (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ message: 'Get player ID error' });

      const playerId = results[0].player_id;
      const insertScore = 'INSERT INTO Scores (player_id, score) VALUES (?, ?)';
      db.query(insertScore, [playerId, score], (err) => {
        if (err) return res.status(500).json({ message: 'Insert score error' });
        res.status(200).json({ message: 'Score submitted' });
      });
    });
  });
});

// Get leaderboard
app.get('/leaderboard', (req, res) => {
  const query = `
    SELECT p.playerName, s.score, s.createdAt
    FROM Scores s
    JOIN Players p ON s.player_id = p.player_id
    ORDER BY s.score DESC
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Leaderboard query error' });
    res.json(results);
  });
});

// Save game data
app.post('/save-data', (req, res) => {
  const { playerName, saveData } = req.body;
  if (!playerName || !saveData) return res.status(400).json({ message: 'Missing playerName or saveData' });

  const insertPlayer = 'INSERT IGNORE INTO Players (playerName) VALUES (?)';
  db.query(insertPlayer, [playerName], (err) => {
    if (err) return res.status(500).json({ message: 'Insert player error' });

    const getPlayerId = 'SELECT player_id FROM Players WHERE playerName = ?';
    db.query(getPlayerId, [playerName], (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ message: 'Get player ID error' });

      const playerId = results[0].player_id;
      const insertSave = 'INSERT INTO GameSaves (player_id, saveData) VALUES (?, ?)';
      db.query(insertSave, [playerId, JSON.stringify(saveData)], (err) => {
        if (err) return res.status(500).json({ message: 'Save insert error' });
        res.status(200).json({ message: 'Game data saved' });
      });
    });
  });
});

// Load game data
app.get('/load-data', (req, res) => {
  const playerName = req.query.playerName;
  if (!playerName) return res.status(400).json({ message: 'Missing playerName' });

  const getPlayerId = 'SELECT player_id FROM Players WHERE playerName = ?';
  db.query(getPlayerId, [playerName], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Player not found' });

    const playerId = results[0].player_id;
    const loadQuery = `
      SELECT saveData
      FROM GameSaves
      WHERE player_id = ?
      ORDER BY createdAt DESC
      LIMIT 1
    `;
    db.query(loadQuery, [playerId], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: 'No save data found' });
      res.json({ saveData: JSON.parse(results[0].saveData) });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Live leaderboard server running at http://localhost:${port}`);
});

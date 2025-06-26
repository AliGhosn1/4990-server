export const submitScore = (req, res, db) => {
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
};


export const getLeaderboard = (req, res, db) => {
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
};
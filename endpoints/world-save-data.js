export const saveWorldData = (req, res, db) => {
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
};


export const getWorldData = (req, res, db) => {
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
};
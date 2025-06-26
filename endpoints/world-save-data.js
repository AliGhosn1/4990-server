export const saveWorldData = (req, res, db) => {
  const { playerName, saveData } = req.body;

  console.log('Received save request for player: ' + playerName);

  if (!playerName || !saveData) 
    return res.status(400).json({ message: 'Missing playerName or saveData' });

  const insertPlayer = 'INSERT IGNORE INTO Players (playerName) VALUES (?)';
  const getPlayerId = 'SELECT player_id FROM Players WHERE playerName = ?';
  const insertSave = 'INSERT INTO GameSaves (player_id, saveData) VALUES (?, ?)';

  db.query(insertPlayer, [playerName], (err) => {
    if (err) 
        return res.status(500).json({ message: 'Insert player error' });

    db.query(getPlayerId, [playerName], (err, results) => {
      if (err || results.length === 0) 
        return res.status(500).json({ message: 'Get player ID error' });

      db.query(insertSave, [results[0].player_id, JSON.stringify(saveData)], (err) => {
        if (err) 
            return res.status(500).json({ message: 'Save insert error' });
        
        res.status(200).json({ message: 'Game data saved' });
        console.log('Game data saved for player: ' + playerName);
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
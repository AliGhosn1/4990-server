
export var saveWorldData = (req, res, db) => {
  const worldData = req.body;
    if (!worldData) {
        return res.status(400).json({ message: 'Missing playerName or worldData' });
    }

    const getPlayerId = 'SELECT player_id FROM Players WHERE playerName = ?';
    const insertSave = 'INSERT INTO GameSaves (player_id, saveData) VALUES (?, ?) ON DUPLICATE KEY UPDATE saveData = ?';
    const saveData = JSON.stringify(worldData);

    db.query(getPlayerId, [worldData.ownerName], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: 'Get player ID error' });

        const player_id = results[0].player_id;
        db.query(insertSave, [player_id, saveData, saveData], (err, results) => {
            if (err) {
                console.error("Error saving world data: " + err);
                return res.status(500).json({ message: 'Error saving world data' });
            }
            res.status(200).json({ message: 'World data saved successfully' });
        });
    });
}

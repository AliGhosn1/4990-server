export const profile = (req, res, db) => {
  const userId = req.user.playerId; // from JWT middleware

  const query = 'SELECT player_id, playerName, createdAt FROM Players WHERE player_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
};

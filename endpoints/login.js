import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const login = (req, res, db) => {
  const { playerName, password } = req.body;

  const query = 'SELECT * FROM Players WHERE playerName = ?';
  db.query(query, [playerName], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Player not found' });

    const user = results[0];

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });
    } catch (e) {
      return res.status(500).json({ message: 'Error checking password' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { playerId: user.player_id, playerName: user.playerName },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { playerId: user.player_id, playerName: user.playerName },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    //Save refresh token in DB so /refresh can validate it
    const saveQuery = 'UPDATE Players SET refreshToken = ? WHERE player_id = ?';
    db.query(saveQuery, [refreshToken, user.player_id], (err2, result) => {
      if (err2) {
        console.error('Error saving refresh token:', err2);
        return res.status(500).json({ message: 'Error saving refresh token' });
      }
    
      res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken
      });
    });
  });
};

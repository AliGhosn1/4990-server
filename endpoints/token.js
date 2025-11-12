import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


export const refresh = (req, res, db) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

  // Check if refreshToken exists in DB
  const query = 'SELECT * FROM Players WHERE refreshToken = ?';
  db.query(query, [refreshToken], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired refresh token' });

      // Issue new access token
      const newAccessToken = jwt.sign(
        { playerId: user.playerId, playerName: user.playerName },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: newAccessToken });
    });
  });
};

export const logout = (req, res, db) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  // Remove refresh token from DB
  const query = 'UPDATE Players SET refreshToken = NULL WHERE refreshToken = ?';
  db.query(query, [refreshToken], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });

    res.json({ message: 'Logged out successfully' });
  });
};

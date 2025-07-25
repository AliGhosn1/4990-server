import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = (req, res, db) => {
  const { playerName, password } = req.body;

  if (!playerName || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  const query = 'SELECT * FROM Players WHERE playerName = ?';
  db.query(query, [playerName], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      //Generate JWT token on successful login
      const token = jwt.sign(
        { playerId: user.player_id, playerName: user.playerName },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.status(200).json({ message: 'Login successful', token });
    });
  });
};

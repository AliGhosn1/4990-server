import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = (req, res, db) => {
  const { playerName, password } = req.body;

  if (!playerName || !password) {
    console.error('Login error: Missing playerName or password');
    return res.status(400).json({ message: 'Missing username or password' });
  }

  const playerQuery = 'SELECT * FROM Players WHERE playerName = ?';
  const saveQuery = 'SELECT * FROM GameSaves WHERE player_id = ?';

  db.query(playerQuery, [playerName], (err, results) => {
    if (err || results.length === 0) {
      console.error('Login error:', err);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    db.query(saveQuery, [user.player_id], (err, results) => {
      if (err) {
        console.error('Error fetching save data:', err);
        return;
      }

      const saveData = results.length ? results[0].saveData : null;


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

        res.status(200).json({ 
          message: 'Login successful', 
          token,
          worldInfo: saveData
        });
      });
    });
  });
};

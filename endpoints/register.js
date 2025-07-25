import bcrypt from "bcrypt";

export const register = (req, res, db) => {
  const { playerName, password } = req.body;

  if (!playerName || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  //Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Error hashing password" });

    //Insert player into DB
    const query = "INSERT INTO Players (playerName, password) VALUES (?, ?)";
    db.query(query, [playerName, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Username already taken" });
        }
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  });
};

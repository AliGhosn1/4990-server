import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") dotenv.config();


import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

import { submitScore, getLeaderboard } from './endpoints/scores.js';
import { saveWorldData } from './endpoints/world.js';
import { register } from './endpoints/register.js';
import { login } from './endpoints/login.js';
import { profile } from './endpoints/profile.js';
import { refresh, logout } from './endpoints/token.js'; 
import { authenticateToken } from './middleware/authMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Endpoints
app.post('/submit-score', (req, res) => submitScore(req, res, db));
app.post('/world-data', (req, res) => saveWorldData(req, res, db));

app.get('/leaderboard', (req, res) => getLeaderboard(req, res, db));

app.post('/register', (req, res) => register(req, res, db));
app.post('/login', (req, res) => login(req, res, db));
app.post('/world', (req, res) => saveWorldData(req, res, db));

// Protected route
app.get('/profile', authenticateToken, (req, res) => profile(req, res, db));

// Refresh & logout
app.post('/refresh', (req, res) => refresh(req, res, db));
app.post('/logout', (req, res) => logout(req, res, db));

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

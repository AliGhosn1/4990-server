import { submitScore, getLeaderboard } from './endpoints/scores.js';
import { saveWorldData } from './endpoints/world.js';
import { register } from './endpoints/register.js';
import { login } from './endpoints/login.js';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SquareRoot1997!',
  database: 'GameDB'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});


//Endpoints
app.post('/submit-score', (req, res) => submitScore(req, res, db));
app.post('/world-data', (req, res) =>  saveWorldData(req, res, db));

app.get('/leaderboard', (req, res) => getLeaderboard(req, res, db));

app.post('/register', (req, res) => register(req, res, db));

app.post('/login', (req, res) => login(req, res, db));
app.post('/world', (req, res) => saveWorldData(req, res, db));


//Start the server
app.listen(port, () => {
  console.log(`Live leaderboard server running at http://localhost:${port}`);
});

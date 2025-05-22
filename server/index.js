//workspace/server/index.js
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { sendOTP, sendPasswordResetEmail } from './utils/email.js';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });
const CLIENT_URL = process.env.CLIENT_URL;
if (!CLIENT_URL) {
  console.warn('⚠️  CLIENT_URL not set in .env');
}

// DB
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// JWT
const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, process.env.PRIVATE_KEY_PATH), 'utf8');
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, process.env.PUBLIC_KEY_PATH), 'utf8');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const app = express();
app.use(cookieParser());

// globally handle CORS preflight AND actual requests
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  })
);
app.options('*', cors()); 
app.use(express.json());

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Auth required' });
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Init tables
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS face_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      descriptor JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
})();

// Helpers
const isProd = process.env.NODE_ENV === 'production';

const setTokenCookie = (res, token, expiresAt) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    expires: new Date(expiresAt)
  });
};

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await pool.query(
      'INSERT INTO otps (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [req.user?.sub || null, otp, expiresAt]
    );

    // Send OTP email
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.id as user_id 
       FROM otps o 
       LEFT JOIN users u ON u.email = $1 
       WHERE o.code = $2 
       AND o.expires_at > NOW()
       ORDER BY o.created_at DESC 
       LIMIT 1`,
      [email, otp]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete used OTP
    await pool.query('DELETE FROM otps WHERE id = $1', [rows[0].id]);
    res.json({ valid: true, userId: rows[0].user_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save face data
app.post('/api/auth/save-face', authenticate, async (req, res) => {
  const { descriptor } = req.body;
  try {
    await pool.query(
      'INSERT INTO face_data (user_id, descriptor) VALUES ($1, $2)',
      [req.user.sub, descriptor]
    );
    res.json({ message: 'Face data saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify face
app.post('/api/auth/verify-face', async (req, res) => {
  const { userId, descriptor } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT descriptor FROM face_data WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    if (!rows.length) {
      return res.status(400).json({ message: 'No face data found' });
    }

    // Face comparison would happen here
    // For now, just return success
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, faceDescriptor } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING id',
      [name, email, hash]
    );
    
    if (faceDescriptor) {
      await pool.query(
        'INSERT INTO face_data (user_id, descriptor) VALUES ($1, $2)',
        [rows[0].id, faceDescriptor]
      );
    }

    const userId = rows[0].id;
    const jwtId = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * parseInt(JWT_EXPIRES_IN));
    
    const token = jwt.sign({ sub: userId, jti: jwtId }, PRIVATE_KEY, { 
      algorithm: 'RS256', 
      expiresIn: JWT_EXPIRES_IN 
    });
    
    setTokenCookie(res, token, expiresAt);
    
    const { rows: [user] } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({ message: 'Registered', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) throw new Error('Invalid credentials');
    
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) throw new Error('Invalid credentials');

    const userId = rows[0].id;
    const jwtId = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * parseInt(JWT_EXPIRES_IN));
    
    const token = jwt.sign({ sub: userId, jti: jwtId }, PRIVATE_KEY, { 
      algorithm: 'RS256', 
      expiresIn: JWT_EXPIRES_IN 
    });
    
    setTokenCookie(res, token, expiresAt);
    
    const { rows: [user] } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({ message: 'Logged in', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ sub: rows[0].id }, PRIVATE_KEY, { 
      algorithm: 'RS256', 
      expiresIn: '1h' 
    });

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    const hash = await bcrypt.hash(password, 10);
    
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, payload.sub]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logout
app.post('/api/auth/logout', authenticate, async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Protected example
app.get('/api/auth/me', authenticate, async (req, res) => {
  const { rows: [user] } = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [req.user.sub]
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

// Start
const PORT = process.env.PORT || 12000;
app.listen(PORT, () => {
   console.log(`Workspace server running on port ${PORT}`);
});
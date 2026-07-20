const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'agarwal_secret_signature_9696_gateway';
const SECRET_REGISTRATION_KEY = '9696';

// Multi-layer persistent fail-safe file pathing for Render deployments
const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}
const db = new Database(path.join(DB_DIR, 'auth_ledger.db'));

// Database schemas initialization
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mobile TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file routing maps - Fully explicit fail-safe resolution
const PUBLIC_DIR = path.resolve(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// Authentication Middleware Router Guard
const requireAuth = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).redirect('/');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('auth_token');
        return res.status(401).redirect('/');
    }
};

/* ==========================================
   PAGE NAVIGATION DIRECTIVES & ROUTING
   ========================================== */

// Base Landing Route
app.get('/', (req, res) => {
    const token = req.cookies.auth_token;
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect('/dashboard.html');
        } catch (e) {
            res.clearCookie('auth_token');
        }
    }
    res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

// Protected Dashboard Handler
app.get('/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

// Catch-all route to prevent standard 404 navigation loop
app.get('/login.html', (req, res) => {
    res.redirect('/');
});

// Verification Gateway Check API
app.get('/api/verify', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ authenticated: false });
    try {
        jwt.verify(token, JWT_SECRET);
        return res.json({ authenticated: true });
    } catch (e) {
        return res.json({ authenticated: false });
    }
});

/* ==========================================
   AUTHENTICATION API ROUTE CHANNELS
   ========================================== */

// Strict Account Registration Pipeline
app.post('/api/register', async (req, res) => {
    const { mobile, password, confirmPassword, secretKey } = req.body;

    if (!mobile || !password || !confirmPassword || !secretKey) {
        return res.status(400).json({ success: false, message: 'All inputs must be completely operational.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords configurations do not match.' });
    }
    if (secretKey !== SECRET_REGISTRATION_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid Security Gate Registration Key.' });
    }

    try {
        const checkUser = db.prepare('SELECT mobile FROM users WHERE mobile = ?').get(mobile);
        if (checkUser) {
            return res.status(409).json({ success: false, message: 'Mobile terminal identification already active.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insert = db.prepare('INSERT INTO users (mobile, password) VALUES (?, ?)');
        insert.run(mobile, hashedPassword);

        return res.status(201).json({ success: true, message: 'Account synchronized securely. Proceed to Login.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal transaction database error context.' });
    }
});

// Login Handshake Gateway
app.post('/api/login', async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return res.status(400).json({ success: false, message: 'Credentials missing parsing variables.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid secure mobile reference identification.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid parameter credential password structure.' });
        }

        const token = jwt.sign({ id: user.id, mobile: user.mobile }, JWT_SECRET, { expiresIn: '365d' });
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // Required for secure environment context on Render
            sameSite: 'strict',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 Year session lifecycle retention
        });

        return res.status(200).json({ success: true, message: 'Authentication handshake successful.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal processing runtime error.' });
    }
});

// Fail-safe GET /logout Triggered by Dashboard Terminate Button
app.get('/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.redirect('/');
});

// API Session Termination Endpoint (For AJAX fallback if needed)
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.status(200).json({ success: true, message: 'Session killed.' });
});

app.listen(PORT, () => console.log(`Secure server online executing on channel ${PORT}`));

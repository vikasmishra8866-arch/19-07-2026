const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.resolve(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, Modules)
app.use(express.static(PUBLIC_DIR));

// Direct Landing Router - Ab hum direct dashboard.html load karenge
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

// Fallback to prevent 404 errors on dynamic reloads
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => console.log(`🚀 Premium Dashboard Engine online executing on channel ${PORT}`));

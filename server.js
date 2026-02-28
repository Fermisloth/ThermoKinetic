require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// ── Route Modules ─────────────────────────────────────────────
const akmRoutes = require('./routes/akm');
const roiRoutes = require('./routes/roi');
const demoRoutes = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const submissionsFile = path.join(dataDir, 'submissions.json');
if (!fs.existsSync(submissionsFile)) {
    fs.writeFileSync(submissionsFile, '[]', 'utf8');
}

// ─── API Routes (modular) ─────────────────────────────────────
app.use('/api/akm', akmRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/demo', demoRoutes);

// ─── Legacy API Routes (kept for backward compatibility) ──────
// POST /api/contact — redirects to /api/demo/submit
app.post('/api/contact', (req, res) => {
    // Map legacy fields to new schema
    const { name, company, role, email, volume, message } = req.body;

    if (!name || !company || !email) {
        return res.status(400).json({ success: false, error: 'Name, company, and email are required.' });
    }

    const submission = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name,
        company,
        role: role || 'Not specified',
        email,
        volume: volume || 'Not specified',
        message: message || '',
        submittedAt: new Date().toISOString()
    };

    let submissions = [];
    try {
        const data = fs.readFileSync(submissionsFile, 'utf8');
        submissions = JSON.parse(data);
    } catch (e) {
        submissions = [];
    }

    submissions.push(submission);
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2), 'utf8');

    console.log(`[DEMO REQUEST] New submission from ${name} at ${company} (${email})`);

    res.json({
        success: true,
        message: 'Demo request received! We\'ll respond within 24 hours.',
        id: submission.id
    });
});

// GET /api/submissions — View all submissions (admin)
app.get('/api/submissions', (req, res) => {
    try {
        const data = fs.readFileSync(submissionsFile, 'utf8');
        const submissions = JSON.parse(data);
        res.json({ success: true, count: submissions.length, submissions });
    } catch (err) {
        res.json({ success: true, count: 0, submissions: [] });
    }
});

// ─── Page Routes ───────────────────────────────────────────
const pages = ['platform', 'how-it-works', 'roi-calculator', 'compliance', 'pricing', 'contact'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    });
});

// Catch-all → home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║                                                  ║');
    console.log('  ║   ❄️  ThermoKinetic Server Running                ║');
    console.log('  ║                                                  ║');
    console.log(`  ║   → Local:   http://localhost:${PORT}                ║`);
    console.log('  ║   → API:     /api/akm, /api/roi, /api/demo       ║');
    console.log('  ║   → Legacy:  /api/contact, /api/submissions      ║');
    console.log('  ║                                                  ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
});

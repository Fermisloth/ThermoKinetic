const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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

// ─── API Routes ────────────────────────────────────────────

// POST /api/contact — Store demo request
app.post('/api/contact', (req, res) => {
    try {
        const { name, company, role, email, volume, message } = req.body;

        // Basic validation
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

        // Read existing submissions
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
    } catch (err) {
        console.error('Error saving submission:', err);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

// POST /api/roi — Calculate ROI
app.post('/api/roi', (req, res) => {
    try {
        const { shipmentVolume, productValue, excursionRate, productType } = req.body;

        const volume = parseFloat(shipmentVolume) || 10000;
        const value = parseFloat(productValue) || 250;
        const rate = parseFloat(excursionRate) || 8;

        // Waste reduction factors by product type
        const reductionFactors = {
            mRNA: 0.22,
            Biologic: 0.18,
            Insulin: 0.15,
            Vaccine: 0.20
        };

        const reductionFactor = reductionFactors[productType] || 0.20;
        const annualWaste = volume * value * (rate / 100);
        const projectedSavings = annualWaste * reductionFactor;
        const wasteReduction = (reductionFactor * 100);

        res.json({
            success: true,
            results: {
                annualWaste: Math.round(annualWaste),
                projectedSavings: Math.round(projectedSavings),
                wasteReduction: wasteReduction,
                productType: productType || 'Vaccine'
            }
        });
    } catch (err) {
        console.error('Error calculating ROI:', err);
        res.status(500).json({ success: false, error: 'Calculation error.' });
    }
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
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║                                              ║');
    console.log('  ║   ❄️  ThermoKinetic Server Running            ║');
    console.log('  ║                                              ║');
    console.log(`  ║   → Local:   http://localhost:${PORT}            ║`);
    console.log('  ║   → API:     /api/contact, /api/roi          ║');
    console.log('  ║                                              ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log('');
});

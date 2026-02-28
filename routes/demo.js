const express = require("express");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_FILE = path.join(__dirname, "../data/submissions.json");

// ── Helpers ───────────────────────────────────────────────────────────────────

const readRequests = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

const writeRequests = (requests) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), "utf8");
};

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/demo/submit
 */
router.post(
    "/submit",
    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Name must be 2–100 characters"),

        body("company")
            .trim()
            .isLength({ min: 1, max: 150 })
            .withMessage("Company name is required"),

        body("role")
            .isIn([
                "Supply Chain Manager",
                "Compliance Officer",
                "Health Ministry",
                "Logistics Director",
                "Other",
            ])
            .withMessage("Please select a valid role"),

        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email address is required"),

        body("monthlyShipmentVolume")
            .isIn(["<100", "100–500", "500–2000", "2000–10000", "10000+"])
            .withMessage("Please select a valid shipment volume range"),

        body("message")
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Message must be under 1000 characters"),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { name, company, role, email, monthlyShipmentVolume, message } =
                req.body;

            const newRequest = {
                id: uuidv4(),
                submittedAt: new Date().toISOString(),
                status: "pending",
                contact: {
                    name,
                    company,
                    role,
                    email,
                    monthlyShipmentVolume,
                    message: message || null,
                },
            };

            const requests = readRequests();
            requests.push(newRequest);
            writeRequests(requests);

            console.log(
                `[DEMO] New request from ${name} at ${company} <${email}> [${role}]`
            );

            res.status(201).json({
                success: true,
                message: `Thanks ${name}! We'll reach out to ${email} within 1 business day.`,
                submissionId: newRequest.id,
                submittedAt: newRequest.submittedAt,
            });
        } catch (err) {
            console.error("[DEMO SUBMIT ERROR]", err);
            res
                .status(500)
                .json({ success: false, error: "Failed to save demo request." });
        }
    }
);

/**
 * GET /api/demo/requests
 * Returns all demo requests — protected by ADMIN_KEY header
 */
router.get("/requests", (req, res) => {
    const adminKey = req.headers["x-admin-key"];
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    const requests = readRequests();
    res.json({
        success: true,
        total: requests.length,
        requests,
    });
});

module.exports = router;

const express = require("express");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const {
    PRODUCT_PROFILES,
    calculateDegradation,
    calculateDynamicExpiry,
    getStatus,
    getRateConstant,
} = require("../utils/akmEngine");

const router = express.Router();

/**
 * POST /api/akm/calculate
 *
 * Accepts a shipment's temperature excursion history and product type.
 * Returns potency remaining, Dynamic Expiry date, and shipment status.
 */
router.post(
    "/calculate",
    [
        body("productType")
            .isIn(["mrna_vaccine", "biologic", "insulin"])
            .withMessage("productType must be mrna_vaccine, biologic, or insulin"),

        body("excursions")
            .isArray({ min: 1, max: 50 })
            .withMessage("excursions must be an array of 1–50 temperature segments"),

        body("excursions.*.tempC")
            .isFloat({ min: -80, max: 60 })
            .withMessage("Each tempC must be between -80°C and 60°C"),

        body("excursions.*.durationHours")
            .isFloat({ min: 0.1, max: 720 })
            .withMessage("Each durationHours must be between 0.1 and 720"),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { productType, excursions, shipmentId } = req.body;
            const profile = PRODUCT_PROFILES[productType];
            const id = shipmentId || `TK-${uuidv4().slice(0, 8).toUpperCase()}`;

            // ── Core AKM Calculation ──────────────────────────────────────────────
            const { totalKineticExposure, potencyRemaining } = calculateDegradation(
                excursions,
                profile
            );

            const { daysRemaining, expiryDate } = calculateDynamicExpiry(
                potencyRemaining,
                profile
            );

            const status = getStatus(potencyRemaining, profile.potencyThreshold);

            // ── Mean Kinetic Temperature (MKT) for reporting ──────────────────────
            const Ea = profile.Ea;
            const R_const = 8.314;
            const totalHours = excursions.reduce((s, e) => s + e.durationHours, 0);
            const mktNumerator = excursions.reduce((s, e) => {
                const T = e.tempC + 273.15;
                return s + Math.exp(-Ea / (R_const * T)) * e.durationHours;
            }, 0);
            const mktKelvin = (-Ea / R_const) / Math.log(mktNumerator / totalHours);
            const meanKineticTempC = parseFloat((mktKelvin - 273.15).toFixed(2));

            // ── Build Response ────────────────────────────────────────────────────
            res.json({
                success: true,
                shipmentId: id,
                product: {
                    type: productType,
                    label: profile.label,
                    potencyThreshold: profile.potencyThreshold,
                    nominalShelfLifeDays: profile.nominalShelfLife,
                },
                result: {
                    potencyRemaining: parseFloat(potencyRemaining.toFixed(2)),
                    dynamicExpiryDate: expiryDate,
                    daysRemaining,
                    meanKineticTempC,
                    totalExposureHours: parseFloat(totalHours.toFixed(2)),
                    kineticExposureIndex: parseFloat(totalKineticExposure.toExponential(4)),
                    status,
                },
                meta: {
                    model: "Arrhenius First-Order AKM",
                    calculatedAt: new Date().toISOString(),
                    excursionSegments: excursions.length,
                },
            });
        } catch (err) {
            console.error("[AKM ERROR]", err);
            res.status(500).json({ success: false, error: "AKM calculation failed." });
        }
    }
);

/**
 * GET /api/akm/products
 * Returns available product types and their profiles
 */
router.get("/products", (req, res) => {
    const products = Object.entries(PRODUCT_PROFILES).map(([key, p]) => ({
        key,
        label: p.label,
        referenceStorageTempC: p.referenceTemp - 273.15,
        potencyThreshold: p.potencyThreshold,
        nominalShelfLifeDays: p.nominalShelfLife,
    }));
    res.json({ success: true, products });
});

module.exports = router;

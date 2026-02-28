const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * Waste reduction rates per product type — validated against
 * cross-company AKM data (AbbVie, Novartis, Sanofi)
 */
const WASTE_REDUCTION_RATES = {
  mrna_vaccine: 0.22,   // 22% — flagship ThermoKinetic stat
  biologic:     0.17,   // 17%
  insulin:      0.14,   // 14%
  general:      0.15,   // 15% — conservative default
};

/**
 * Platform cost model (StaaS pricing basis)
 * Used to calculate net ROI after platform fees
 */
const STAAS_MONTHLY_BASE = {
  starter: 4900,    // USD/mo up to 500 shipments
  pro:     14900,   // USD/mo unlimited
  enterprise: null, // custom
};

/**
 * POST /api/roi/calculate
 *
 * Body:
 * {
 *   annualShipments: number,         // total shipments per year
 *   avgProductValueUSD: number,      // average value per shipment in USD
 *   currentExcursionRate: number,    // % of shipments that suffer excursions (0–100)
 *   productType: "mrna_vaccine" | "biologic" | "insulin" | "general"
 * }
 */
router.post(
  "/calculate",
  [
    body("annualShipments")
      .isInt({ min: 1, max: 10_000_000 })
      .withMessage("annualShipments must be between 1 and 10,000,000"),

    body("avgProductValueUSD")
      .isFloat({ min: 1, max: 10_000_000 })
      .withMessage("avgProductValueUSD must be between $1 and $10,000,000"),

    body("currentExcursionRate")
      .isFloat({ min: 0.1, max: 100 })
      .withMessage("currentExcursionRate must be between 0.1% and 100%"),

    body("productType")
      .isIn(["mrna_vaccine", "biologic", "insulin", "general"])
      .withMessage("productType must be mrna_vaccine, biologic, insulin, or general"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        annualShipments,
        avgProductValueUSD,
        currentExcursionRate,
        productType,
      } = req.body;

      const excursionDecimal = currentExcursionRate / 100;
      const reductionRate = WASTE_REDUCTION_RATES[productType];

      // ── Core Calculations ─────────────────────────────────────────────────

      // Total annual product value at risk
      const totalAnnualValue = annualShipments * avgProductValueUSD;

      // Current annual loss from excursions (assuming 100% of excursion shipments are written off)
      const currentAnnualWaste = totalAnnualValue * excursionDecimal;

      // Shipments saved by ThermoKinetic dynamic expiry (waste reduction %)
      const annualSavings = currentAnnualWaste * reductionRate;

      // Waste remaining after ThermoKinetic (for context)
      const residualWaste = currentAnnualWaste - annualSavings;

      // Effective new excursion loss rate
      const newExcursionRate = excursionDecimal * (1 - reductionRate) * 100;

      // Shipment-level stats
      const shipmentsAtRisk = Math.round(annualShipments * excursionDecimal);
      const shipmentsSaved = Math.round(shipmentsAtRisk * reductionRate);

      // Suggest pricing tier
      const monthlyShipments = annualShipments / 12;
      const suggestedTier =
        monthlyShipments <= 500 ? "starter" : monthlyShipments <= 5000 ? "pro" : "enterprise";

      const platformCostAnnual =
        suggestedTier === "enterprise"
          ? null
          : STAAS_MONTHLY_BASE[suggestedTier] * 12;

      const netROI =
        platformCostAnnual !== null
          ? annualSavings - platformCostAnnual
          : null;

      const roiMultiple =
        platformCostAnnual !== null
          ? parseFloat((annualSavings / platformCostAnnual).toFixed(2))
          : null;

      // ── Response ──────────────────────────────────────────────────────────
      res.json({
        success: true,
        inputs: {
          annualShipments,
          avgProductValueUSD,
          currentExcursionRate,
          productType,
        },
        result: {
          totalAnnualValueUSD: Math.round(totalAnnualValue),
          currentAnnualWasteUSD: Math.round(currentAnnualWaste),
          projectedAnnualSavingsUSD: Math.round(annualSavings),
          residualWasteUSD: Math.round(residualWaste),
          wasteReductionPercent: parseFloat((reductionRate * 100).toFixed(1)),
          newExcursionLossRatePercent: parseFloat(newExcursionRate.toFixed(2)),
          shipmentsAtRiskPerYear: shipmentsAtRisk,
          shipmentsSavedPerYear: shipmentsSaved,
        },
        platform: {
          suggestedTier,
          platformCostAnnualUSD: platformCostAnnual,
          netROIafterPlatformUSD: netROI !== null ? Math.round(netROI) : "Contact sales",
          roiMultiple: roiMultiple !== null ? `${roiMultiple}x` : "Contact sales",
        },
        meta: {
          reductionRateBasis: `${(reductionRate * 100).toFixed(0)}% validated reduction for ${productType}`,
          dataSource: "AbbVie, Novartis, Sanofi cross-company AKM dataset",
          calculatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("[ROI ERROR]", err);
      res.status(500).json({ success: false, error: "ROI calculation failed." });
    }
  }
);

/**
 * GET /api/roi/benchmarks
 * Returns industry benchmark data for ROI context
 */
router.get("/benchmarks", (req, res) => {
  res.json({
    success: true,
    benchmarks: {
      industryAnnualLossUSD: 35_000_000_000,
      globalVaccineDiscardRate: "up to 50%",
      mRNAWasteReductionValidated: "22%",
      degradationForecastAccuracy: "89%",
      wasteReductionByProduct: WASTE_REDUCTION_RATES,
    },
  });
});

module.exports = router;

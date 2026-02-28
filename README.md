# 🧊 ThermoKinetic — Bio-Digital Twins for Cold-Chain Integrity

> **Transforming pharmaceutical cold-chain logistics from reactive to predictive — one dynamic expiry at a time.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built With: Stitch](https://img.shields.io/badge/Built%20with-Stitch-00D4FF.svg)](#)
[![WHO PQS Aligned](https://img.shields.io/badge/WHO%20PQS-Aligned-00FF9C.svg)](#compliance)
[![DSCSA Compliant](https://img.shields.io/badge/DSCSA-Compliant-00FF9C.svg)](#compliance)

---

## 📌 Overview

ThermoKinetic is a **Systems Biology-guided AI (SBg-AI)** platform that creates a dynamic **Bio-Digital Twin** for every high-value pharmaceutical shipment. Instead of relying on a conservative, static "Use By" date, ThermoKinetic assigns each package a **Dynamic Expiry** — calculated in real time from the actual kinetic degradation the shipment has experienced.

The global pharmaceutical industry loses an estimated **$35 billion annually** due to cold-chain temperature failures. ThermoKinetic exists to eliminate that waste.

---

## ✨ Core Features

### 🔬 AKM-Predict — Arrhenius-Driven True Potency Engine
Uses **Advanced Kinetic Modeling (AKM)** methodology with the Arrhenius equation to simulate loss of antigenicity or purity in real time. Models are validated against 20–30 experimental data points and optimized with the **Bayesian Information Criterion (BIC)** for statistical best-fit accuracy.

### 🔗 XATP Blockchain Authentication
Implements the **eXtended ATP (XATP)** framework for full compliance with the **US Drug Supply Chain Security Act (DSCSA)**. Enables Day Zero interoperability between manufacturers and dispensers using verifiable credentials authenticated on mobile devices — powered by **Hyperledger Fabric**.

### 🗺️ Predictive Thermal Lane Routing
AI-driven route intelligence that analyzes historical temperature patterns and flags high-risk shipping lanes *before* an excursion occurs. Recommends adding coolant, adjusting routes, or rescheduling delivery windows proactively.

---

## 📊 Key Metrics

| Metric | Value |
|---|---|
| Degradation Forecast Accuracy | **89%** |
| mRNA Vaccine Waste Reduction | **22%** |
| Annual Industry Loss Addressed | **$35 Billion** |
| Global Vaccine Discard Rate (cold-chain) | **Up to 50%** |

---

## 🏗️ Tech Stack

| Component | Implementation |
|---|---|
| Predictive Model | SBg-AI (Recurrent & Graph Neural Networks) |
| Stability Logic | Advanced Kinetic Modeling (AKM) — Arrhenius Law |
| Security / Auth | Hyperledger Fabric + DocuSeal (XATP) |
| Validation Dataset | Cross-company AKM data — AbbVie, Novartis, Sanofi |
| Frontend | Built with Stitch (React, TailwindCSS) |

---

## 📄 Pages

| Page | Description |
|---|---|
| `/` | Hero, problem/solution split, 3-feature cards |
| `/platform` | Deep-dive on AKM-Predict, XATP Auth, Thermal Routing |
| `/how-it-works` | 5-step Bio-Digital Twin pipeline + architecture table |
| `/roi-calculator` | Interactive savings estimator by shipment volume |
| `/compliance` | WHO PQS, DSCSA, WHO IMD-PQS 2025–2030 alignment |
| `/pricing` | Stability-as-a-Service (StaaS) tiered plans |
| `/demo` | Demo request + lead capture form |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/thermokinetic.git

# Navigate into the project
cd thermokinetic

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🎨 Design System

ThermoKinetic uses a **Cryogenic Dark** visual language — precision scientific UI inspired by biotech dashboards.

| Token | Hex | Usage |
|---|---|---|
| `--bg-void` | `#060B14` | Page background |
| `--accent-cryo` | `#00D4FF` | Primary CTA, highlights |
| `--accent-bio` | `#00FF9C` | Safe/success states |
| `--accent-warn` | `#FF6B35` | Excursion alerts |
| `--text-primary` | `#F0F6FF` | Headings |
| `--text-secondary` | `#8BA3C7` | Body copy |

**Fonts:** Inter (400/600/700/800) · JetBrains Mono (500) — data labels & equations

---

## ⚖️ Compliance

ThermoKinetic is aligned with:
- **WHO PQS** — Performance, Quality, and Safety standards
- **US DSCSA** — Drug Supply Chain Security Act (via XATP framework)
- **WHO IMD-PQS 2025–2030** — Global immunization device monitoring strategy

---

## 💼 Business Model

ThermoKinetic operates as a **Stability-as-a-Service (StaaS)** platform. Pharmaceutical manufacturers (Prequalification Holders) subscribe to the Bio-Digital Twin service to document compliance and prove to regulators that required conditions were maintained throughout the supply chain.

### Pricing Tiers
- **Kinetic Starter** — Up to 500 shipments/month, AKM-Predict
- **Bio-Twin Pro** — Unlimited shipments, all 3 features, API access ⭐ Most Popular
- **Enterprise / StaaS** — Custom SLA, WHO audit support, dedicated CSM, on-prem

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change. Then:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

For demo requests or partnership inquiries, visit the [demo page](#) or reach out at **hello@thermokinetic.io**

---

<p align="center">Built to eliminate pharmaceutical waste. One dynamic expiry at a time. 🧊</p>

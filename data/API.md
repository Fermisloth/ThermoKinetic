# ThermoKinetic Backend API

Node.js + Express REST API for the ThermoKinetic Bio-Digital Twin platform.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and set ADMIN_KEY to any random string

# 3. Run in development
npm run dev

# 4. Run in production
npm start
```

Server runs on `http://localhost:4000` by default.

---

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. In **Variables**, add:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = your frontend URL (e.g. `https://thermokinetic.vercel.app`)
   - `ADMIN_KEY` = any long random string
5. Railway will auto-detect `npm start` from `package.json`
6. Your API will be live at `https://your-app.up.railway.app`

## Deploy to Render

1. New Web Service → Connect GitHub repo
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add the same env vars above

---

## Endpoints

### Health Check
```
GET /health
```

---

### AKM — Dynamic Expiry Calculation

#### Calculate potency and Dynamic Expiry
```
POST /api/akm/calculate
Content-Type: application/json

{
  "productType": "mrna_vaccine",
  "excursions": [
    { "tempC": 8, "durationHours": 4 },
    { "tempC": 15, "durationHours": 1.5 }
  ],
  "shipmentId": "SHIPMENT-001"
}
```

**Response:**
```json
{
  "success": true,
  "shipmentId": "SHIPMENT-001",
  "product": {
    "type": "mrna_vaccine",
    "label": "mRNA Vaccine",
    "potencyThreshold": 90
  },
  "result": {
    "potencyRemaining": 96.43,
    "dynamicExpiryDate": "2026-04-15",
    "daysRemaining": 46,
    "meanKineticTempC": 9.12,
    "totalExposureHours": 5.5,
    "status": {
      "code": "SAFE",
      "label": "Cleared for use",
      "color": "#00FF9C"
    }
  }
}
```

**Product types:** `mrna_vaccine` · `biologic` · `insulin`

#### List product profiles
```
GET /api/akm/products
```

---

### ROI Calculator

```
POST /api/roi/calculate
Content-Type: application/json

{
  "annualShipments": 12000,
  "avgProductValueUSD": 5000,
  "currentExcursionRate": 8,
  "productType": "mrna_vaccine"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "totalAnnualValueUSD": 60000000,
    "currentAnnualWasteUSD": 4800000,
    "projectedAnnualSavingsUSD": 1056000,
    "wasteReductionPercent": 22.0,
    "shipmentsSavedPerYear": 2112
  },
  "platform": {
    "suggestedTier": "pro",
    "platformCostAnnualUSD": 178800,
    "netROIafterPlatformUSD": 877200,
    "roiMultiple": "5.9x"
  }
}
```

#### Industry benchmarks
```
GET /api/roi/benchmarks
```

---

### Demo Request Form

#### Submit a demo request
```
POST /api/demo/submit
Content-Type: application/json

{
  "name": "Sarah Chen",
  "company": "Global Health Ministry",
  "role": "Supply Chain Manager",
  "email": "s.chen@example.org",
  "monthlyShipmentVolume": "2000–10000",
  "message": "Interested in piloting for our national immunization program."
}
```

**Roles:** `Supply Chain Manager` · `Compliance Officer` · `Health Ministry` · `Logistics Director` · `Other`  
**Volume options:** `<100` · `100–500` · `500–2000` · `2000–10000` · `10000+`

#### View all submissions (admin only)
```
GET /api/demo/requests
x-admin-key: your_admin_key_from_env
```

---

## Folder Structure

```
thermokinetic-backend/
├── server.js                  # Entry point, middleware, route mounting
├── routes/
│   ├── akm.js                 # Dynamic Expiry / AKM endpoints
│   ├── roi.js                 # ROI Calculator endpoints
│   └── demo.js                # Demo request form endpoints
├── utils/
│   └── akmEngine.js           # Arrhenius + AKM science engine
├── data/
│   └── demo-requests.json     # Persisted demo submissions
├── .env.example
├── .gitignore
├── package.json
└── API.md                     # This file
```

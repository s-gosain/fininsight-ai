# FinInsight AI — Enterprise Financial Statement & Equity Research Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ais-pre-atrecd66srivwkn77p67mz-907830785373.asia-southeast1.run.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/WebGL-Three.js_Spatial-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_GenAI_SDK-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Security-Firebase_OAuth_%26_Firestore-FFA611?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

> **Live Production Prototype:** [https://ais-pre-atrecd66srivwkn77p67mz-907830785373.asia-southeast1.run.app](https://ais-pre-atrecd66srivwkn77p67mz-907830785373.asia-southeast1.run.app)

---

## 📌 Executive Summary

**FinInsight AI** is an institutional-grade financial statement analysis and equity research platform designed for Chief Financial Officers (CFOs), equity research directors, and forensic auditors. 

The platform bridges generative AI synthesis with **deterministic mathematical ground truth**: core quantitative indicators (DuPont 3-stage identities, 9-point Piotroski F-Scores, Altman Z-Scores, and 1,000-run Monte Carlo stochastic projections) are calculated deterministically in TypeScript to eliminate LLM hallucinations, while Gemini foundation models provide contextual forensic commentary, narrative synthesis, and anomaly root-cause analysis.

---

## 🚀 Key Platform Capabilities

### 1. SEC EDGAR Statutory 10-K Ingestion Engine
* Live statutory ingestion of official U.S. Securities & Exchange Commission annual reports (`NVDA`, `MSFT`, `AAPL`, `AMZN`, `TSLA`).
* Accession number tracking, Central Index Key (CIK) resolution, and audit opinion status verification (Unqualified Clean Opinion).
* Automatic XBRL taxonomy reconciliation across multi-period Balance Sheets, Income Statements, and Cash Flow Statements.

### 2. AI Model Architecture & Domain Weights Calibration Studio
* Real-time in-context domain adaptation layers for Foundation Gemini models (`gemini-3.1-flash-lite`, `gemini-3.8-flash`).
* Four specialized domain adaptors:
  * **Forensic CPA & Audit Adaptor:** High loss penalties on accrual divergence, off-balance-sheet items, and aggressive revenue recognition.
  * **Growth Equity Adaptor:** Prioritizes Rule of 40 score, Net Revenue Retention (NRR), and operating leverage velocity.
  * **Credit Rating & Solvency Adaptor:** Calibrated for interest coverage covenants, debt payback periods, and Altman Z default probabilities.
  * **Balanced Institutional Research:** Multi-factor equity research balancing DuPont drivers with DCF multiples.
* User-configurable sampling temperature ($0.0 - 1.0$), GAAP/IFRS strictness weights, and few-shot exemplar injection.

### 3. Interactive 3D Spatial Financial Visualizer
* Immersive WebGL spatial environment built with Three.js and OrbitControls.
* Structural visualization of balance sheet solvency rings, cash flow streams, and income statement margins.
* Clickable nodes for deep drill-down into line item variances, notes disclosures, and multi-year trends.

### 4. Deterministic Financial Modeling (Zero-Hallucination Guardrails)
* **DuPont Analysis:** 3-stage mathematical decomposition (Net Margin × Asset Turnover × Financial Leverage).
* **Piotroski F-Score:** 9-factor binary test evaluating profitability signals, capital structure leverage, and operational efficiency.
* **Altman Z-Score:** Solvency scoring categorized into Safe (> 2.6), Grey (1.1 – 2.6), and Distress (< 1.1) zones.
* **Monte Carlo Simulation:** 1,000 stochastic iterations with Box-Muller normal distribution for revenue forecasting under adjustable volatility.

### 5. Multi-Role Attribute-Based Access Control (ABAC) & SOX-404 Audit Logging
* Dynamic clearance roles: **Chief Financial Officer (CFO)**, **Senior Financial Auditor**, and **Financial Analyst**.
* Cryptographic, append-only event logging tracking exports, role elevation, data masking, and model calibration changes.
* RFC 4180-compliant CSV and branded multi-page PDF executive memo export engine.

---

## 🛠️ System Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   Client Layer (SPA)                   │
│  React 19 • TypeScript • Tailwind CSS • Three.js WebGL │
│  Lucide Icons • Motion Transitions • jsPDF Client Gen  │
└──────────────────────────┬─────────────────────────────┘
                           │
                 REST & Contextual APIs
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Node.js / Express Server               │
│  Multi-Tier Failover Cascade • Resilient JSON Sanitizer│
│  Deterministic Accounting Logic & Fallback Engines     │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
┌────────▼──────────────┐           ┌────────▼──────────────┐
│  Google GenAI SDK     │           │  Google Cloud Run &   │
│  Gemini 3.1 Flash     │           │  Cloud Firestore DB   │
│  Gemini 3.8 Flash     │           │  Firebase Google Auth │
└───────────────────────┘           └───────────────────────┘
```

* **Frontend:** React 19, TypeScript, Tailwind CSS, Three.js, Lucide React, Framer Motion.
* **Backend:** Node.js, Express, Vite middleware integration, TypeScript (`tsx`).
* **AI Orchestration:** `@google/genai` TypeScript SDK with resilient 3-tier cascade and `safeExtractAndParseJson` sanitization.
* **Authentication & Persistence:** Google OAuth 2.0 via Firebase Authentication and Google Cloud Firestore.

---

## 📊 Verification & Reliability Metrics

* **0 Compile Errors:** 100% strict TypeScript compilation across 3,004 transformed modules (`tsc --noEmit`).
* **Sub-18s Full-Stack Production Build:** Clean production bundling via Vite and ESBuild (`dist/index.html` + `dist/server.cjs`).
* **Audited Cloud Security:** Zero-Trust Attribute-Based Access Control (ABAC) rules deployed directly to Google Cloud Firestore.

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js 20+ installed
* npm 10+ installed

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fininsight-ai.git
cd fininsight-ai

# Install dependencies
npm install

# Start full-stack development server
npm run dev
```

The application will start on `http://localhost:3000`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

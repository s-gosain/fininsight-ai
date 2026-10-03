export type ModelDomainAdaptor = 'FORENSIC_CPA' | 'GROWTH_EQUITY' | 'CREDIT_SOLVENCY' | 'BALANCED_INSTITUTIONAL';

export interface ModelCalibrationConfig {
  activeAdaptor: ModelDomainAdaptor;
  temperature: number; // 0.0 (deterministic accounting) to 1.0 (creative synthesis)
  topP: number;
  maxOutputTokens: number;
  gaapStrictnessWeight: number; // 0 to 100
  accrualDivergencePenaltyWeight: number; // 0 to 100
  fewShotExemplarsEnabled: boolean;
  citationGroundingEnforced: boolean;
  activeModelAlias: 'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-flash-latest';
  customSystemPrefix?: string;
}

export interface DomainAdaptorMetadata {
  id: ModelDomainAdaptor;
  name: string;
  badge: string;
  description: string;
  recommendedTemp: number;
  lossPrioritization: string[];
  systemInstructionModifier: string;
  sampleFewShotPrompt: string;
  sampleFewShotResponse: string;
}

export const DOMAIN_ADAPTORS: Record<ModelDomainAdaptor, DomainAdaptorMetadata> = {
  FORENSIC_CPA: {
    id: 'FORENSIC_CPA',
    name: 'Forensic Accounting & Audit Adaptor',
    badge: 'SOX-404 / CPA Calibrated',
    description: 'Calibrated with heavy loss penalties on ungrounded figures. Prioritizes accrual divergence, DSO anomalies, Beneish M-Score manipulation flags, and aggressive capitalization detection.',
    recommendedTemp: 0.15,
    lossPrioritization: [
      'Accrual vs Cash Flow Divergence Weight: 95%',
      'Off-Balance-Sheet Obligation Penalty: 90%',
      'Revenue Recognition Timing Scrutiny: 92%',
      'CPA Citation Verification: 100%',
    ],
    systemInstructionModifier: 'ACT AS A RIGOROUS SENIOR FORENSIC ACCOUNTANT AND SOX AUDITOR. Cross-verify every calculation with extreme skepticism. Penalize any unbacked optimistic assertions.',
    sampleFewShotPrompt: 'Input: Revenue grew 35% but Accounts Receivable grew 88% and OCF turned negative.',
    sampleFewShotResponse: 'Finding: High Risk of Channel Stuffing / Premature Revenue Recognition. Accruals ratio expanded to +0.24, triggering Beneish M-Score warning boundary. Immediate recommendation: Audit unbilled receivables ledger.',
  },
  GROWTH_EQUITY: {
    id: 'GROWTH_EQUITY',
    name: 'Growth Equity & Rule of 40 Adaptor',
    badge: 'Venture & Growth PE',
    description: 'Focuses on unit economics, Net Revenue Retention (NRR), LTV/CAC velocity, Rule of 40 score, and high-margin operational leverage.',
    recommendedTemp: 0.35,
    lossPrioritization: [
      'Rule of 40 (Growth + FCF Margin) Weight: 96%',
      'R&D Reinvestment Efficiency: 88%',
      'Gross Margin Expansion Trajectory: 90%',
      'Market Share Velocity: 85%',
    ],
    systemInstructionModifier: 'ACT AS A GROWTH EQUITY PRINCIPAL. Evaluate operating leverage, unit economic durability, Rule of 40 momentum, and long-term moat expansion.',
    sampleFewShotPrompt: 'Input: Revenue growth YoY 28%, Gross Margin 72%, Free Cash Flow margin 16%.',
    sampleFewShotResponse: 'Evaluation: Rule of 40 Score = 44% (Exceeds 40% top-decile benchmark). High capital efficiency with strong gross profit cushion supporting sustained R&D reinvestment.',
  },
  CREDIT_SOLVENCY: {
    id: 'CREDIT_SOLVENCY',
    name: 'Credit Rating & Solvency Risk Adaptor',
    badge: 'Moody\'s / S&P Calibrated',
    description: 'Calibrated for institutional debt analysts, corporate bond rating agencies, and covenant compliance committees.',
    recommendedTemp: 0.1,
    lossPrioritization: [
      'Altman Z-Score Default Risk Weight: 98%',
      'EBITDA to Interest Coverage: 95%',
      'Net Debt / FCF Payback Velocity: 92%',
      'Liquidity Runaway Cushion: 94%',
    ],
    systemInstructionModifier: 'ACT AS A SENIOR CREDIT RATING ANALYST. Scrutinize interest coverage covenants, debt maturity schedules, liquidity cushions, and default probabilities under stressed cash scenarios.',
    sampleFewShotPrompt: 'Input: Total debt to equity 1.45x, Interest coverage ratio 2.1x, cash conversion cycle 64 days.',
    sampleFewShotResponse: 'Risk Assessment: Moody\'s Baa3 / S&P BBB- watch status. Interest coverage ratio of 2.1x leaves little buffer for operational volatility. Require covenant waiver monitoring.',
  },
  BALANCED_INSTITUTIONAL: {
    id: 'BALANCED_INSTITUTIONAL',
    name: 'Balanced Wall Street Equity Research',
    badge: 'Holistic Consensus',
    description: 'Standard institutional equity research framework balancing growth upside against valuation multiples and structural balance sheet resilience.',
    recommendedTemp: 0.25,
    lossPrioritization: [
      'DuPont ROE Decomposition: 90%',
      'Piotroski F-Score Fundamental Health: 90%',
      'Free Cash Flow Conversion: 90%',
      'DCF Valuation Grounding: 88%',
    ],
    systemInstructionModifier: 'ACT AS A WALL STREET MANAGING DIRECTOR OF EQUITY RESEARCH. Provide balanced, multi-dimensional equity analysis reconciling fundamentals, valuation, and capital allocation.',
    sampleFewShotPrompt: 'Input: Standard 10-K multi-period income and balance sheet statements.',
    sampleFewShotResponse: 'Institutional Summary: Comprehensive 360-degree assessment across DuPont drivers, FCF conversion yield, and historical peer quartile benchmarking.',
  },
};

export const DEFAULT_CALIBRATION_CONFIG: ModelCalibrationConfig = {
  activeAdaptor: 'FORENSIC_CPA',
  temperature: 0.2,
  topP: 0.85,
  maxOutputTokens: 2048,
  gaapStrictnessWeight: 95,
  accrualDivergencePenaltyWeight: 90,
  fewShotExemplarsEnabled: true,
  citationGroundingEnforced: true,
  activeModelAlias: 'gemini-3.1-flash-lite',
  customSystemPrefix: 'You are an elite CPA and Wall Street Financial Analyst. Ground all reasoning directly in verified mathematical statements.',
};

const STORAGE_KEY = 'fininsight_model_calibration_v1';

export function loadModelCalibration(): ModelCalibrationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CALIBRATION_CONFIG, ...JSON.parse(raw) };
    }
  } catch (_) {
    // Return default on parse failure
  }
  return DEFAULT_CALIBRATION_CONFIG;
}

export function saveModelCalibration(config: ModelCalibrationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Asynchronously notify backend
    fetch('/api/model-calibration/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).catch(() => {});
  } catch (_) {
    // Ignore storage errors
  }
}

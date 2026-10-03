export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate * Currency
}

export type FiscalYearType = 'CALENDAR' | 'APR_MAR' | 'OCT_SEP' | 'JUL_JUN' | 'RETAIL_445';

export interface FiscalYearConfig {
  type: FiscalYearType;
  label: string;
  startMonth: string;
  endMonth: string;
  quarters: string[];
}

export type UserRole = 'ADMIN_CFO' | 'SENIOR_ANALYST' | 'AUDITOR' | 'STAKEHOLDER';

export type NavigationTabId =
  | 'dashboard'
  | 'visualization'
  | 'competitors'
  | 'anomalies'
  | 'benchmarks'
  | 'forecasting'
  | 'redflags'
  | 'statements'
  | 'sentiment'
  | 'budget';

export interface UserRolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  allowedTabs: NavigationTabId[];
  canExportPDF: boolean;
  canEditData: boolean;
  canAddComments: boolean;
  canResolveComments: boolean;
  canViewAuditLogs: boolean;
  canSyncERP: boolean;
  canToggleEncryption: boolean;
  canUploadDataset: boolean;
  canRunDeepAI: boolean;
  canApproveBudget: boolean;
  canDisputeBudget: boolean;
  canModifyForecasting: boolean;
  canManageCloudModels: boolean;
}

export interface StatementLineItem {
  id: string;
  key: string;
  name: string;
  category: string;
  values: {
    [period: string]: number; // e.g. "FY2022": 1000000, "FY2023": 1250000, "FY2024": 1500000
  };
  notes?: string;
  benchmarkVariance?: number;
  isRedFlag?: boolean;
}

export interface FinancialDataset {
  id: string;
  companyName: string;
  ticker?: string;
  industry: string;
  reportingCurrency: CurrencyCode;
  fiscalYearEnding: string;
  periods: string[]; // e.g. ["FY2022", "FY2023", "FY2024"]
  activePeriod: string;
  incomeStatement: StatementLineItem[];
  balanceSheet: StatementLineItem[];
  cashFlowStatement: StatementLineItem[];
  mdaExcerpts: string[];
  budgetVariance: BudgetDepartmentItem[];
}

export interface BudgetDepartmentItem {
  id: string;
  department: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
  category: 'Opex' | 'Capex' | 'Revenue' | 'Payroll';
  severity: 'Critical' | 'Warning' | 'Normal';
  explanation: string;
  flaggedByAI: boolean;
}

export interface FinancialRatios {
  revenueGrowthYoY: number;
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  ebitdaMargin: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  interestCoverage: number;
  returnOnEquity: number;
  returnOnAssets: number;
  freeCashFlow: number;
  fcfConversion: number;
  piotroskiFScore: number; // 0 to 9
  altmanZScore: number;
  altmanZone: 'Safe' | 'Grey' | 'Distress';
}

export interface RedFlagItem {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  metric: string;
  category: 'Liquidity' | 'Solvency' | 'Profitability' | 'Operations' | 'Budget';
  currentValue: string;
  threshold: string;
  observation: string;
  recommendation: string;
  impactScore: number; // 1-100
}

export interface SentimentAnalysisResult {
  overallScore: number; // 0-100
  sentiment: 'Bullish' | 'Moderately Optimistic' | 'Neutral' | 'Cautious' | 'Bearish';
  managementTone: string;
  optimismScore: number;
  cautionScore: number;
  riskAwarenessScore: number;
  tonalityBreakdown: {
    growthOutlook: string;
    costDiscipline: string;
    regulatoryCompliance: string;
  };
  executiveKeywords: string[];
  toneKeywordsDistribution: {
    bullish: string[];
    hedged: string[];
    riskDisclosures: string[];
  };
}

export interface FinancialHealthGrade {
  overallGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D';
  summarySentence: string;
  solvencyRating: 'Strong' | 'Resilient' | 'Moderate' | 'Vulnerable';
  liquidityRating: 'Strong' | 'Adequate' | 'Tight' | 'Strained';
  profitabilityRating: 'Robust' | 'Stable' | 'Pressured' | 'Negative';
  efficiencyRating: 'High' | 'Moderate' | 'Sub-optimal';
  keySkillsToImprove: string[];
}

export interface TeamComment {
  id: string;
  statementId?: string;
  lineItemKey: string;
  author: string;
  role: string;
  avatar: string;
  text: string;
  timestamp: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  replies?: Array<{
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
  }>;
}

export interface ErpSyncStatus {
  lastSync: string;
  status: 'Connected' | 'Ready to Sync' | 'Syncing' | 'Offline';
  system: string;
  recordsSynced: number;
  latencyMs: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  category: 'Security' | 'Analysis' | 'Export' | 'Collaboration' | 'ERP Sync';
  ipAddress: string;
}

export interface ErpIntegration {
  id: string;
  name: 'SAP S/4HANA' | 'NetSuite' | 'Microsoft Dynamics 365' | 'QuickBooks Online' | 'Workday Financials';
  iconName: string;
  status: 'Connected' | 'Ready to Sync' | 'Syncing' | 'Offline';
  lastSyncTime: string;
  recordsCount: number;
  latencyMs: number;
  endpointUrl: string;
  authMethod: 'OAuth 2.0 / Mutual TLS' | 'API Key Token' | 'Certificate Based';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  suggestedFollowUps?: string[];
}

export interface DeepAIAnalysisResponse {
  executiveSummary: string;
  keyStrengths: string[];
  keyRisks: string[];
  redFlags: Array<{
    severity: 'High' | 'Medium' | 'Low';
    metric: string;
    observation: string;
    recommendation: string;
  }>;
  sentimentAnalysis: {
    overallScore: number;
    sentiment: 'Bullish' | 'Moderately Optimistic' | 'Neutral' | 'Cautious' | 'Bearish';
    managementTone: string;
    optimismScore: number;
    cautionScore: number;
    riskAwarenessScore: number;
    tonalityBreakdown: {
      growthOutlook: string;
      costDiscipline: string;
      regulatoryCompliance: string;
    };
    executiveKeywords: string[];
  };
  financialHealthSummary: {
    overallGrade: string;
    piotroskiFScore: string;
    altmanZScore: string;
    solvencyRating: string;
    liquidityRating: string;
    profitabilityRating: string;
    efficiencyRating: string;
  };
  budgetAlerts: Array<{
    department: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePct: number;
    severity: 'Critical' | 'Warning' | 'Normal';
    explanation: string;
  }>;
}

// -------------------------------------------------------------
// 1. Data Visualization Module Types
// -------------------------------------------------------------
export type VisualizationChartType = 'line' | 'bar' | 'stacked_bar' | 'pie' | 'donut' | 'area' | 'composed';

export interface DataPointSelection {
  key: string;
  name: string;
  category: 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Ratios';
  color: string;
  unit: '$' | '%' | 'x' | 'ratio';
}

// -------------------------------------------------------------
// 2. Competitor Analysis Types
// -------------------------------------------------------------
export interface CompetitorCompany {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  marketCap?: number;
  period: string;
  revenue: number;
  revenueGrowthYoY: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  ebitdaMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  interestCoverage: number;
  freeCashFlow: number;
  fcfMargin: number;
  piotroskiFScore: number;
  altmanZScore: number;
  dso: number; // Days Sales Outstanding
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  keyStrengths: string[];
  vulnerabilities: string[];
  moatRating: 'Wide' | 'Narrow' | 'None';
  historicalRevenues: { [period: string]: number };
}

export interface ComparativeAnalysisReport {
  generatedAt: string;
  primaryCompany: string;
  competitors: string[];
  kpiComparison: Record<string, { [companyName: string]: number }>;
  synthesis: {
    growthLeader: string;
    marginLeader: string;
    capitalEfficiencyLeader: string;
    highestRisk: string;
    executiveSummary: string;
    strategicTakeaways: string[];
  };
}

// -------------------------------------------------------------
// 3. Advanced Anomaly & Fraud Detection Types
// -------------------------------------------------------------
export type AnomalyMethod = 'Z_SCORE' | 'IQR' | 'BENFORD_LAW' | 'BENEISH_M_SCORE' | 'MODIFIED_JONES_ACCRUALS' | 'ALTMAN_DISTRESS';

export interface StatisticalAnomalyItem {
  id: string;
  lineItemKey: string;
  lineItemName: string;
  period: string;
  category: string;
  method: AnomalyMethod;
  severity: 'Critical' | 'Warning' | 'Info';
  actualValue: number;
  expectedValue: number;
  deviationMetric: string; // e.g. "Z = +2.84σ" or "IQR Distance = 2.4x"
  confidenceLevel: number; // e.g. 99.2%
  explanation: string;
  potentialDrivers: string[];
  auditInquiryQuestion: string;
  historicalValues: number[];
}

export interface BenfordDigitStat {
  digit: number;
  expectedPct: number;
  actualPct: number;
  count: number;
  variancePct: number;
  isAnomalous: boolean;
}

export interface BenfordAnalysisResult {
  chiSquareStat: number;
  pValue: number;
  sampleSize: number;
  digits: BenfordDigitStat[];
  overallAssessment: 'Natural Distribution (Low Suspicion)' | 'Moderate Conformity Anomaly' | 'Severe First-Digit Deviation (High Manipulation Risk)';
  summary: string;
}

export interface BeneishMScoreDetail {
  dsri: number; // Days Sales in Receivables Index
  gmi: number;  // Gross Margin Index
  aqi: number;  // Asset Quality Index
  sgi: number;  // Sales Growth Index
  depi: number; // Depreciation Index
  sgai: number; // SGA Expense Index
  lvgi: number; // Leverage Index
  tata: number; // Total Accruals to Total Assets
  mScore: number;
  manipulationProbability: 'Low Probability (< 5%)' | 'Moderate Probability (15-30%)' | 'High Probability of Manipulation (> 75%)';
  interpretation: string;
  flaggedVariables: string[];
}

export interface AdvancedAnomalySuiteResult {
  totalAnalyzedDataPoints: number;
  detectedAnomaliesCount: number;
  criticalCount: number;
  warningCount: number;
  anomalies: StatisticalAnomalyItem[];
  benfordAnalysis: BenfordAnalysisResult;
  beneishMScore: BeneishMScoreDetail;
  accrualsAnomalyScore: number; // 0-100
  overallDataIntegrityGrade: 'High Integrity (AA)' | 'Adequate (A)' | 'Caution Warranted (B)' | 'High Anomaly Density (C/D)';
}

// -------------------------------------------------------------
// 4. Industry Benchmarking Types
// -------------------------------------------------------------
export interface BenchmarkMetricDetail {
  key: string;
  name: string;
  category: 'Profitability' | 'Growth' | 'Liquidity' | 'Solvency' | 'Efficiency';
  companyValue: number;
  bottomQuartile: number; // 25th percentile
  industryMedian: number;  // 50th percentile
  topQuartile: number;    // 75th percentile
  industryLeader: number; // 90th percentile
  unit: '%' | 'x' | 'days' | '$';
  higherIsBetter: boolean;
  status: 'Outperforming' | 'In-Line' | 'Underperforming' | 'Critical Lag';
  variancePct: number;
  percentileRank: number; // 0 to 100
  strategicImplication: string;
}

export type PeerGroupWeightingMethod = 'market_cap' | 'equal' | 'custom';

export interface BenchmarkPeer {
  id: string;
  name: string;
  ticker: string;
  marketCap: number; // in USD
  marketCapFormatted: string;
  description: string;
  metrics: {
    grossProfitMargin: number;
    revenueGrowthYoY: number;
    operatingMargin: number;
    fcfConversion: number;
    currentRatio: number;
    debtToEquity: number;
    dso: number;
  };
}

export interface BenchmarkCategoryWeights {
  profitability: number;
  growth: number;
  liquidity: number;
  efficiency: number;
}

export interface BenchmarkSettings {
  selectedPeerIds: string[];
  weightingMethod: PeerGroupWeightingMethod;
  customWeights: Record<string, number>;
  categoryWeights: BenchmarkCategoryWeights;
}

export interface IndustryPeerGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  sampleCompaniesCount: number;
  medianMarketCap: string;
  macroRiskFactors: string[];
  metrics: BenchmarkMetricDetail[];
  peers?: BenchmarkPeer[];
}

// -------------------------------------------------------------
// 5. Predictive Financial Modeling & Forecasting Types
// -------------------------------------------------------------
export type ForecastScenarioType = 'BULL' | 'BASE' | 'BEAR' | 'CUSTOM';

export interface ForecastPeriodPoint {
  period: string; // e.g. "FY2025 (F)", "FY2026 (F)"
  isHistorical: boolean;
  revenue: number;
  revenueLower80: number;
  revenueUpper80: number;
  revenueLower95: number;
  revenueUpper95: number;
  grossProfit: number;
  ebitda: number;
  operatingIncome: number;
  netIncome: number;
  netIncomeLower80: number;
  netIncomeUpper80: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  fcfLower80: number;
  fcfUpper80: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  netMarginPct: number;
}

export interface ScenarioParameters {
  revenueCagrPct: number; // e.g. +18.5%
  cogsInflationPct: number; // e.g. +4.0%
  opexGrowthPct: number; // e.g. +12.0%
  taxRatePct: number; // e.g. 21.0%
  capexIntensityPct: number; // % of revenue
  seasonalityStrength: number; // 0 to 1
  macroInterestRatePct: number; // e.g. 4.5%
}

export interface MonteCarloSimulationResult {
  iterations: number;
  meanProjectedRevenue: number;
  medianProjectedRevenue: number;
  percentile10: number;
  percentile90: number;
  probabilityOfProfitability: number; // e.g. 94.2%
  distributionBins: Array<{ binRange: string; frequency: number; cumulativePct: number }>;
  valueAtRisk95Pct: number; // $ at 5% tail
}

export interface PredictiveForecastModelResult {
  historicalPeriods: string[];
  forecastPeriods: string[];
  points: ForecastPeriodPoint[];
  activeScenario: ForecastScenarioType;
  scenarioParameters: ScenarioParameters;
  cagrSummary: {
    historical3YrCagr: number;
    projected3YrCagr: number;
    marginDeltaBps: number;
  };
  seasonalityDecomposition: {
    trendComponent: string;
    cyclicalAmplitude: string;
    peakQuarter: string;
  };
  monteCarlo: MonteCarloSimulationResult;
  aiForecastSynthesis: string;
}

// -------------------------------------------------------------
// 6. Contextual Root Cause & What-If Scenario Builder Types
// -------------------------------------------------------------
export interface ContextualRootCauseAnalysis {
  rootCauseTitle: string;
  primaryDriver: string;
  statisticalInterpretation: string;
  contributingFactors: string[];
  financialStatementCrossReference: string;
  auditVerificationSteps: string[];
  riskImpact: 'High Material Risk' | 'Operational Variance' | 'Accounting Classification Risk' | string;
  confidenceScore: number;
  source?: 'gemini' | 'contextual_engine' | 'contextual_fallback';
}

export interface WhatIfScenarioOverrides {
  revenueGrowth: {
    active: boolean;
    value: number; // % annual growth
  };
  operatingMargin: {
    active: boolean;
    value: number; // % operating margin
  };
  capexIntensity: {
    active: boolean;
    value: number; // % of revenue
  };
  dsoWorkingCapital: {
    active: boolean;
    days: number; // collection days
  };
  discountRate: {
    active: boolean;
    value: number; // WACC / hurdle rate %
  };
}

// -------------------------------------------------------------
// 7. Document Auto-Summary Types
// -------------------------------------------------------------
export interface FinancialHighlightItem {
  metric: string;
  trend: string;
  takeaway: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export type DocumentCategoryTag = 'Quarterly' | 'Annual' | 'Investor Deck' | 'Regulatory Filing';

export interface DocumentSummaryData {
  id: string;
  datasetId: string;
  documentTitle: string;
  filingType: string;
  documentCategory?: DocumentCategoryTag;
  tags?: DocumentCategoryTag[];
  reportingEntity: string;
  reportingPeriods: string[];
  currency: string;
  executiveSummary: string;
  financialHighlights: FinancialHighlightItem[];
  incomeStatementAnalysis: string;
  balanceSheetStrength: string;
  cashFlowQuality: string;
  accountingNotesAndDisclosures: string[];
  keyRiskFactors: string[];
  auditorRecommendations: string[];
  confidenceScore: number;
  source: 'gemini' | 'contextual_synthesis';
  modelUsed?: string;
  generatedAt: string;
  fileName?: string;
  fileSize?: string;
  totalMetricsExtracted?: number;
}

export interface ThreeDViewpoint {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  viewMode: 'capital-tower' | 'risk-terrain' | 'dupont-tree' | 'cashflow-waterfall';
  period: string;
  explodedNodes: string[];
  lastExplodedNode: string | null;
  selectedSubAccountCode?: string | null;
  camera: {
    theta: number;
    phi: number;
    radius: number;
    isIsometric: boolean;
  };
  colorTheme: 'titanium' | 'obsidian-emerald' | 'slate-sapphire' | 'champagne-gold';
  drillDownPath: {
    level: number;
    label: string;
    type: 'root' | 'category' | 'node' | 'subaccount';
    targetId?: string;
  }[];
}

export interface BackendLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  category: 'API' | 'GEMINI' | 'SYSTEM' | 'ERP' | 'AUTH';
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  message: string;
  details?: Record<string, any> | string;
}

export interface ServerStats {
  uptimeSeconds: number;
  nodeVersion: string;
  memoryUsageMb: number;
  hasGeminiKey: boolean;
  activeModel: string;
  totalRequests: number;
  errorCount: number;
}

export type WorkspaceType = 'SOLO_ANALYST' | 'ENTERPRISE';

export interface DirectoryRoleMappingRule {
  id: string;
  ruleType: 'ad_group' | 'email_pattern' | 'job_title';
  patternOrGroup: string;
  targetRole: UserRole;
  description: string;
  enabled: boolean;
}

export interface EnterpriseSsoConfig {
  idpProvider: 'microsoft_entra' | 'okta';
  tenantIdOrDomain: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  rules: DirectoryRoleMappingRule[];
  defaultRole: UserRole;
  lastUpdated: string;
}

export interface EnterpriseTenant {
  id: string;
  name: string;
  domain: string;
  tenantSlug: string;
  idpProvider: 'microsoft_entra' | 'google_workspace' | 'okta_saml';
  azureTenantId?: string;
  logoUrl?: string;
  enforceSox404: boolean;
  status: 'active' | 'pending_dns';
  createdAt: string;
  roleMappings: {
    directoryGroupOrDepartment: string;
    role: UserRole;
    description: string;
  }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar?: string;
  signedInAt: string;
  workspaceType?: WorkspaceType;
  department?: string;
  employeeId?: string;
  clearanceSource?: string;
  isRoleVerified?: boolean;
  tenantId?: string;
  tenantDomain?: string;
  idpProvider?: 'microsoft_entra' | 'google_workspace' | 'okta_saml' | 'firebase_google' | 'direct_credentials';
}




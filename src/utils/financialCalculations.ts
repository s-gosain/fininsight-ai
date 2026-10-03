import { FinancialDataset, FinancialRatios, RedFlagItem, SentimentAnalysisResult, FinancialHealthGrade } from '../types';

export function calculateFinancialRatios(dataset: FinancialDataset, targetPeriod?: string): FinancialRatios {
  const period = targetPeriod || dataset.activePeriod;
  const periods = dataset.periods;
  const prevPeriod = periods[periods.indexOf(period) - 1] || period;

  // Helper to safely extract values from statements
  const getValue = (items: typeof dataset.incomeStatement, key: string, p: string = period): number => {
    const item = items.find((i) => i.key.toLowerCase() === key.toLowerCase());
    return item?.values[p] ?? 0;
  };

  // Income statement figures
  const revenue = getValue(dataset.incomeStatement, 'revenue', period);
  const prevRevenue = getValue(dataset.incomeStatement, 'revenue', prevPeriod);
  const grossProfit = getValue(dataset.incomeStatement, 'grossProfit', period);
  const operatingIncome = getValue(dataset.incomeStatement, 'operatingIncome', period);
  const netIncome = getValue(dataset.incomeStatement, 'netIncome', period);
  const prevNetIncome = getValue(dataset.incomeStatement, 'netIncome', prevPeriod);
  const interestExpense = getValue(dataset.incomeStatement, 'interestExpense', period);

  // Balance sheet figures
  const currentAssets = getValue(dataset.balanceSheet, 'totalCurrentAssets', period) ||
    (getValue(dataset.balanceSheet, 'cashAndEquivalents', period) + getValue(dataset.balanceSheet, 'accountsReceivable', period));
  const currentLiabilities = getValue(dataset.balanceSheet, 'totalCurrentLiabilities', period) ||
    getValue(dataset.balanceSheet, 'accountsPayable', period);
  const cash = getValue(dataset.balanceSheet, 'cashAndEquivalents', period);
  const receivables = getValue(dataset.balanceSheet, 'accountsReceivable', period);
  const totalAssets = getValue(dataset.balanceSheet, 'totalAssets', period);
  const prevTotalAssets = getValue(dataset.balanceSheet, 'totalAssets', prevPeriod) || totalAssets;
  const totalLiabilities = getValue(dataset.balanceSheet, 'totalLiabilities', period) ||
    (getValue(dataset.balanceSheet, 'longTermDebt', period) + currentLiabilities);
  const totalEquity = getValue(dataset.balanceSheet, 'stockholdersEquity', period) || (totalAssets - totalLiabilities);
  const prevTotalEquity = getValue(dataset.balanceSheet, 'stockholdersEquity', prevPeriod) || totalEquity;
  const longTermDebt = getValue(dataset.balanceSheet, 'longTermDebt', period);

  // Cash flow figures
  const operatingCashFlow = getValue(dataset.cashFlowStatement, 'operatingCashFlow', period);
  const prevOperatingCashFlow = getValue(dataset.cashFlowStatement, 'operatingCashFlow', prevPeriod);
  const capex = Math.abs(getValue(dataset.cashFlowStatement, 'capitalExpenditures', period));
  const freeCashFlow = getValue(dataset.cashFlowStatement, 'freeCashFlow', period) || (operatingCashFlow - capex);

  // Ratios
  const revenueGrowthYoY = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
  const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
  const netProfitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
  const ebitdaMargin = revenue > 0 ? ((operatingIncome + (capex * 0.4)) / revenue) * 100 : 0;

  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2.0;
  const quickRatio = currentLiabilities > 0 ? (cash + receivables) / currentLiabilities : 1.5;
  const debtToEquity = totalEquity > 0 ? (longTermDebt + (currentLiabilities * 0.5)) / totalEquity : 0.5;
  const interestCoverage = interestExpense > 0 ? operatingIncome / interestExpense : 15.0;

  const returnOnEquity = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
  const returnOnAssets = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
  const fcfConversion = netIncome > 0 ? (freeCashFlow / netIncome) * 100 : 0;

  // Piotroski F-Score (0 to 9)
  let fScore = 0;
  // Profitability Signals
  if (netIncome > 0) fScore += 1;
  if (operatingCashFlow > 0) fScore += 1;
  if (returnOnAssets > (prevTotalAssets > 0 ? (prevNetIncome / prevTotalAssets) * 100 : 0)) fScore += 1;
  if (operatingCashFlow > netIncome) fScore += 1; // Quality of earnings (accruals)
  // Leverage & Liquidity
  if (longTermDebt <= getValue(dataset.balanceSheet, 'longTermDebt', prevPeriod)) fScore += 1;
  if (currentRatio >= (getValue(dataset.balanceSheet, 'totalCurrentAssets', prevPeriod) / (getValue(dataset.balanceSheet, 'totalCurrentLiabilities', prevPeriod) || 1))) fScore += 1;
  // Operating Efficiency
  const prevGrossMargin = prevRevenue > 0 ? (getValue(dataset.incomeStatement, 'grossProfit', prevPeriod) / prevRevenue) * 100 : 0;
  if (grossProfitMargin >= prevGrossMargin - 1.0) fScore += 1;
  const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 1;
  const prevAssetTurnover = prevTotalAssets > 0 ? prevRevenue / prevTotalAssets : 1;
  if (assetTurnover >= prevAssetTurnover * 0.95) fScore += 1;
  if (revenueGrowthYoY > 0) fScore += 1;

  // Altman Z-Score for non-manufacturers / general:
  // Z = 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
  // X1 = Working Capital / Total Assets
  // X2 = Retained Earnings (approx net income cum.) / Total Assets
  // X3 = EBIT / Total Assets
  // X4 = Book Value of Equity / Total Liabilities
  const workingCapital = currentAssets - currentLiabilities;
  const x1 = totalAssets > 0 ? workingCapital / totalAssets : 0.2;
  const x2 = totalAssets > 0 ? (netIncome * 2.5) / totalAssets : 0.15;
  const x3 = totalAssets > 0 ? operatingIncome / totalAssets : 0.1;
  const x4 = totalLiabilities > 0 ? totalEquity / totalLiabilities : 1.0;

  const altmanZScore = Number((6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4).toFixed(2));
  let altmanZone: 'Safe' | 'Grey' | 'Distress' = 'Safe';
  if (altmanZScore < 1.1) altmanZone = 'Distress';
  else if (altmanZScore < 2.6) altmanZone = 'Grey';
  else altmanZone = 'Safe';

  return {
    revenueGrowthYoY: Number(revenueGrowthYoY.toFixed(2)),
    grossProfitMargin: Number(grossProfitMargin.toFixed(2)),
    operatingMargin: Number(operatingMargin.toFixed(2)),
    netProfitMargin: Number(netProfitMargin.toFixed(2)),
    ebitdaMargin: Number(ebitdaMargin.toFixed(2)),
    currentRatio: Number(currentRatio.toFixed(2)),
    quickRatio: Number(quickRatio.toFixed(2)),
    debtToEquity: Number(debtToEquity.toFixed(2)),
    interestCoverage: Number(interestCoverage.toFixed(2)),
    returnOnEquity: Number(returnOnEquity.toFixed(2)),
    returnOnAssets: Number(returnOnAssets.toFixed(2)),
    freeCashFlow: Math.round(freeCashFlow),
    fcfConversion: Number(fcfConversion.toFixed(1)),
    piotroskiFScore: Math.min(9, Math.max(0, fScore)),
    altmanZScore,
    altmanZone,
  };
}

export function detectRedFlags(dataset: FinancialDataset, ratios: FinancialRatios): RedFlagItem[] {
  const flags: RedFlagItem[] = [];

  // Check 1: Margin Compression
  if (ratios.operatingMargin < 12.0) {
    flags.push({
      id: 'rf-margin-compression',
      severity: ratios.operatingMargin < 8.0 ? 'High' : 'Medium',
      metric: 'Operating Margin Compression',
      category: 'Profitability',
      currentValue: `${ratios.operatingMargin}%`,
      threshold: '> 15.0%',
      observation: `Operating margin has compressed to ${ratios.operatingMargin}%, driven by increasing overhead or R&D expense growth outstripping revenue.`,
      recommendation: 'Initiate departmental zero-based expense review and tighten vendor renegotiation cycles.',
      impactScore: 82,
    });
  }

  // Check 2: Leverage & Debt Service
  if (ratios.debtToEquity > 0.8) {
    flags.push({
      id: 'rf-rising-debt',
      severity: ratios.debtToEquity > 1.2 ? 'High' : 'Medium',
      metric: 'Elevated Leverage (Debt-to-Equity)',
      category: 'Solvency',
      currentValue: `${ratios.debtToEquity}x`,
      threshold: '< 0.75x',
      observation: `Debt-to-equity ratio sits at ${ratios.debtToEquity}x, elevating interest sensitivity in fluctuating rate regimes.`,
      recommendation: 'Evaluate free cash flow sweep mechanisms to accelerate principal debt paydown before debt rollover.',
      impactScore: 78,
    });
  }

  // Check 3: Free Cash Flow Burn
  if (ratios.freeCashFlow < 0) {
    flags.push({
      id: 'rf-negative-fcf',
      severity: 'High',
      metric: 'Negative Free Cash Flow',
      category: 'Liquidity',
      currentValue: `-$${Math.abs(ratios.freeCashFlow).toLocaleString()}`,
      threshold: '> $0 (Self-funding)',
      observation: 'Operating cash generation was insufficient to cover heavy capital expenditures, causing negative net cash conversion.',
      recommendation: 'Phase non-critical CapEx projects across subsequent quarters to safeguard working capital cushion.',
      impactScore: 88,
    });
  }

  // Check 4: Receivables & DSO Aging
  const arItem = dataset.balanceSheet.find((i) => i.key.toLowerCase().includes('receivable'));
  if (arItem) {
    const periods = dataset.periods;
    const currentAR = arItem.values[dataset.activePeriod] || 0;
    const prevAR = arItem.values[periods[periods.length - 2]] || 0;
    const arGrowth = prevAR > 0 ? ((currentAR - prevAR) / prevAR) * 100 : 0;

    if (arGrowth > ratios.revenueGrowthYoY + 5) {
      flags.push({
        id: 'rf-dso-aging',
        severity: 'Medium',
        metric: 'Accounts Receivable Outpacing Sales',
        category: 'Operations',
        currentValue: `+${arGrowth.toFixed(1)}% YoY (Sales +${ratios.revenueGrowthYoY}%)`,
        threshold: 'AR Growth <= Revenue Growth',
        observation: `Receivables expanded faster than gross billings (+${arGrowth.toFixed(1)}% vs +${ratios.revenueGrowthYoY}%), indicating collection friction.`,
        recommendation: 'Implement automated dunning workflows and review enterprise credit limits for top 20 accounts.',
        impactScore: 65,
      });
    }
  }

  // Check 5: Budget Discrepancies
  const criticalBudget = dataset.budgetVariance.filter((b) => b.severity === 'Critical');
  if (criticalBudget.length > 0) {
    flags.push({
      id: 'rf-budget-overage',
      severity: 'High',
      metric: `Budget Discrepancies in ${criticalBudget.map((b) => b.department).join(', ')}`,
      category: 'Budget',
      currentValue: `+${criticalBudget[0].variancePct.toFixed(1)}% over budget`,
      threshold: '< 5% variance',
      observation: `Critical variances detected in departmental budgets (${criticalBudget[0].department} exceeded forecast by $${(criticalBudget[0].variance / 1000).toFixed(0)}k).`,
      recommendation: 'Freeze discretionary purchase orders in flagged cost centers pending CFO authorization.',
      impactScore: 75,
    });
  }

  return flags;
}

export function calculateSentimentAnalysis(dataset: FinancialDataset): SentimentAnalysisResult {
  const mdaText = dataset.mdaExcerpts.join(' ');
  const textLower = mdaText.toLowerCase();

  const bullishKeywords = ['record', 'growth', 'expansion', 'accelerat', 'confident', 'outperform', 'strong', 'momentum', 'innovat', 'milestone'];
  const cautiousKeywords = ['volatility', 'inflation', 'pressure', 'constrained', 'unhedged', 'dilution', 'detour', 'risk', 'headwind', 'uncertainty'];
  const complianceKeywords = ['compliance', 'governance', 'regulatory', 'audit', 'standard', 'sox', 'gaap', 'ifrs'];

  let bullishCount = 0;
  let cautiousCount = 0;
  let complianceCount = 0;

  bullishKeywords.forEach((w) => {
    const matches = textLower.match(new RegExp(w, 'g'));
    if (matches) bullishCount += matches.length;
  });

  cautiousKeywords.forEach((w) => {
    const matches = textLower.match(new RegExp(w, 'g'));
    if (matches) cautiousCount += matches.length;
  });

  complianceKeywords.forEach((w) => {
    const matches = textLower.match(new RegExp(w, 'g'));
    if (matches) complianceCount += matches.length;
  });

  const totalWords = mdaText.split(/\s+/).length || 1;
  const optimismScore = Math.min(95, Math.max(30, Math.round(50 + (bullishCount - cautiousCount) * 8)));
  const cautionScore = Math.min(90, Math.max(20, Math.round(30 + cautiousCount * 10)));
  const riskAwarenessScore = Math.min(95, Math.max(40, Math.round(60 + complianceCount * 8)));

  let sentiment: SentimentAnalysisResult['sentiment'] = 'Moderately Optimistic';
  if (optimismScore > 75) sentiment = 'Bullish';
  else if (optimismScore > 60) sentiment = 'Moderately Optimistic';
  else if (optimismScore > 45) sentiment = 'Neutral';
  else if (optimismScore > 35) sentiment = 'Cautious';
  else sentiment = 'Bearish';

  return {
    overallScore: optimismScore,
    sentiment,
    managementTone: optimismScore > 65
      ? 'Confident expansionary posture with proactive risk mitigation disclosures'
      : 'Guarded guidance emphasizing cash preservation and operational cost discipline',
    optimismScore,
    cautionScore,
    riskAwarenessScore,
    tonalityBreakdown: {
      growthOutlook: `Optimistic (${Math.round(optimismScore * 0.95)}%)`,
      costDiscipline: `Focused (${Math.round(cautionScore * 1.1)}%)`,
      regulatoryCompliance: `High (${riskAwarenessScore}%)`,
    },
    executiveKeywords: ['Market Share Expansion', 'Operating Leverage', 'CapEx Utilization', 'Working Capital Velocity', 'Free Cash Flow Trajectory'],
    toneKeywordsDistribution: {
      bullish: ['Record revenue', 'Product pipeline', 'Enterprise customer retention', 'Capacity ramp'],
      hedged: ['Supply chain timing', 'Variable interest rate impact', 'Foreign exchange headwinds'],
      riskDisclosures: ['Regulatory compliance', 'Tier-1 vendor concentration', 'Data security protocols'],
    },
  };
}

export function evaluateFinancialHealth(
  arg1: FinancialDataset | FinancialRatios,
  arg2?: FinancialRatios | number
): FinancialHealthGrade {
  let ratios: FinancialRatios;
  let flagsCount: number = 0;

  if (typeof arg2 === 'number') {
    // Called as evaluateFinancialHealth(ratios: FinancialRatios, flagsCount: number)
    ratios = arg1 as FinancialRatios;
    flagsCount = arg2;
  } else if (arg2 && typeof arg2 === 'object' && 'grossMargin' in arg2) {
    // Called as evaluateFinancialHealth(dataset: FinancialDataset, ratios: FinancialRatios)
    ratios = arg2 as FinancialRatios;
    flagsCount = 0;
  } else {
    ratios = arg1 as FinancialRatios;
  }

  let grade: FinancialHealthGrade['overallGrade'] = 'A-';
  let solvency: FinancialHealthGrade['solvencyRating'] = 'Resilient';
  let liquidity: FinancialHealthGrade['liquidityRating'] = 'Adequate';
  let profitability: FinancialHealthGrade['profitabilityRating'] = 'Robust';
  let efficiency: FinancialHealthGrade['efficiencyRating'] = 'Moderate';

  if (ratios && ratios.piotroskiFScore >= 8 && ratios.altmanZScore > 3.0 && flagsCount <= 1) {
    grade = 'A+';
    solvency = 'Strong';
    liquidity = 'Strong';
    profitability = 'Robust';
    efficiency = 'High';
  } else if (ratios && ratios.piotroskiFScore >= 6 && ratios.altmanZScore >= 2.6) {
    grade = flagsCount >= 3 ? 'B+' : 'A-';
    solvency = 'Resilient';
    liquidity = 'Adequate';
    profitability = 'Stable';
  } else if (ratios && (ratios.altmanZScore < 1.8 || flagsCount >= 4)) {
    grade = 'C+';
    solvency = 'Vulnerable';
    liquidity = 'Tight';
    profitability = 'Pressured';
    efficiency = 'Sub-optimal';
  }

  const keySkillsToImprove: string[] = [];
  if (ratios) {
    if (ratios.operatingMargin < 12) keySkillsToImprove.push('Operating Cost Discipline & SGA Rationalization');
    if (ratios.debtToEquity > 0.8) keySkillsToImprove.push('Capital Structure Optimization & Debt De-leveraging');
    if (ratios.freeCashFlow < 0) keySkillsToImprove.push('CapEx Prioritization & Working Capital Monetization');
    if (ratios.quickRatio < 1.2) keySkillsToImprove.push('Short-term Cash Cushion & Accounts Receivable Acceleration');
  }

  if (keySkillsToImprove.length === 0) {
    keySkillsToImprove.push('Sustained R&D Reinvestment for Margin Expansion', 'Strategic Share Repurchase or M&A Readiness');
  }

  const piotroskiF = ratios?.piotroskiFScore ?? 7;
  const altmanZ = ratios?.altmanZScore ?? 2.8;
  const altmanZone = ratios?.altmanZone ?? 'Safe';

  return {
    overallGrade: grade,
    summarySentence: `Overall financial health is rated ${grade} with a Piotroski F-Score of ${piotroskiF}/9 and an Altman Z-Score of ${altmanZ} (${altmanZone} Zone).`,
    solvencyRating: solvency,
    liquidityRating: liquidity,
    profitabilityRating: profitability,
    efficiencyRating: efficiency,
    keySkillsToImprove,
  };
}

export const analyzeMDASentiment = calculateSentimentAnalysis;

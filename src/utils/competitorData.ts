import { FinancialDataset, CompetitorCompany, ComparativeAnalysisReport } from '../types';

export const CURATED_COMPETITORS: Record<string, CompetitorCompany[]> = {
  'Enterprise Software & Cloud AI Infrastructure': [
    {
      id: 'comp-cloudsphere',
      name: 'CloudSphere Global Inc.',
      ticker: 'CSG',
      industry: 'Enterprise Software & Cloud AI Infrastructure',
      marketCap: 2400000000,
      period: 'FY2024',
      revenue: 84200000,
      revenueGrowthYoY: 19.8,
      grossMargin: 74.2,
      operatingMargin: 16.5,
      netMargin: 11.2,
      ebitdaMargin: 20.8,
      returnOnEquity: 18.4,
      returnOnAssets: 12.1,
      currentRatio: 2.45,
      quickRatio: 2.10,
      debtToEquity: 0.42,
      interestCoverage: 22.4,
      freeCashFlow: 14200000,
      fcfMargin: 16.8,
      piotroskiFScore: 8,
      altmanZScore: 4.85,
      dso: 46,
      riskLevel: 'Low',
      keyStrengths: ['Higher gross margins (74.2%) via proprietary TPU hosting', 'Conservative debt profile (0.42x D/E)', 'Low churn (96.5% net retention)'],
      vulnerabilities: ['Top-line growth slower than Apex Cloud (+19.8% vs +25.4%)', 'Higher exposure to public sector contracts'],
      moatRating: 'Wide',
      historicalRevenues: { FY2022: 59000000, FY2023: 70200000, FY2024: 84200000 },
    },
    {
      id: 'comp-dataflow',
      name: 'DataFlow Systems Corp.',
      ticker: 'DFLOW',
      industry: 'Enterprise Software & Cloud AI Infrastructure',
      marketCap: 1150000000,
      period: 'FY2024',
      revenue: 52000000,
      revenueGrowthYoY: 34.2,
      grossMargin: 61.0,
      operatingMargin: -4.2,
      netMargin: -6.8,
      ebitdaMargin: 1.5,
      returnOnEquity: -8.5,
      returnOnAssets: -4.2,
      currentRatio: 1.65,
      quickRatio: 1.35,
      debtToEquity: 1.15,
      interestCoverage: -1.2,
      freeCashFlow: -3800000,
      fcfMargin: -7.3,
      piotroskiFScore: 4,
      altmanZScore: 2.15,
      dso: 72,
      riskLevel: 'High',
      keyStrengths: ['Hyper-growth top line (+34.2% YoY)', 'Rapid developer adoption in open-source AI'],
      vulnerabilities: ['Unprofitable with negative free cash flow', 'High leverage (1.15x D/E)', 'DSO stretched to 72 days'],
      moatRating: 'Narrow',
      historicalRevenues: { FY2022: 28500000, FY2023: 38700000, FY2024: 52000000 },
    },
    {
      id: 'comp-novascale',
      name: 'NovaScale AI AG',
      ticker: 'NOVA',
      industry: 'Enterprise Software & Cloud AI Infrastructure',
      marketCap: 1950000000,
      period: 'FY2024',
      revenue: 72400000,
      revenueGrowthYoY: 22.0,
      grossMargin: 69.5,
      operatingMargin: 12.4,
      netMargin: 8.5,
      ebitdaMargin: 17.0,
      returnOnEquity: 14.2,
      returnOnAssets: 9.8,
      currentRatio: 1.95,
      quickRatio: 1.65,
      debtToEquity: 0.68,
      interestCoverage: 11.5,
      freeCashFlow: 8900000,
      fcfMargin: 12.3,
      piotroskiFScore: 7,
      altmanZScore: 3.75,
      dso: 54,
      riskLevel: 'Moderate',
      keyStrengths: ['Balanced growth and profitability', 'Established presence in European Fortune 500'],
      vulnerabilities: ['Moderate GPU infrastructure cost exposure', 'Currency exchange volatility (EUR/USD)'],
      moatRating: 'Narrow',
      historicalRevenues: { FY2022: 48500000, FY2023: 59300000, FY2024: 72400000 },
    },
  ],
  'Industrial Freight & Supply Chain Logistics': [
    {
      id: 'comp-pacific-freight',
      name: 'Pacific Maritime Express Ltd.',
      ticker: 'PMX',
      industry: 'Industrial Freight & Supply Chain Logistics',
      marketCap: 3800000000,
      period: 'FY2024',
      revenue: 145000000,
      revenueGrowthYoY: 7.2,
      grossMargin: 29.5,
      operatingMargin: 13.8,
      netMargin: 7.4,
      ebitdaMargin: 18.2,
      returnOnEquity: 12.8,
      returnOnAssets: 6.8,
      currentRatio: 1.45,
      quickRatio: 1.15,
      debtToEquity: 0.85,
      interestCoverage: 4.8,
      freeCashFlow: 12400000,
      fcfMargin: 8.5,
      piotroskiFScore: 7,
      altmanZScore: 2.85,
      dso: 48,
      riskLevel: 'Moderate',
      keyStrengths: ['Strong transpacific container route market share', 'Modern dual-fuel vessel fleet'],
      vulnerabilities: ['Geopolitical tariff exposure on Asia-US lanes', 'Bunker fuel price sensitivity'],
      moatRating: 'Narrow',
      historicalRevenues: { FY2022: 152000000, FY2023: 135200000, FY2024: 145000000 },
    },
    {
      id: 'comp-nordic-shipping',
      name: 'Nordic Intermodal Transport AB',
      ticker: 'NIT',
      industry: 'Industrial Freight & Supply Chain Logistics',
      marketCap: 2100000000,
      period: 'FY2024',
      revenue: 98000000,
      revenueGrowthYoY: 2.1,
      grossMargin: 24.5,
      operatingMargin: 8.5,
      netMargin: 4.1,
      ebitdaMargin: 14.0,
      returnOnEquity: 8.2,
      returnOnAssets: 4.2,
      currentRatio: 1.05,
      quickRatio: 0.82,
      debtToEquity: 1.45,
      interestCoverage: 2.4,
      freeCashFlow: 3200000,
      fcfMargin: 3.3,
      piotroskiFScore: 5,
      altmanZScore: 1.95,
      dso: 62,
      riskLevel: 'Elevated',
      keyStrengths: ['Specialized cold-chain pharmaceutical logistics hubs in Scandinavia'],
      vulnerabilities: ['High leverage (1.45x D/E)', 'Tight liquidity with 1.05x current ratio'],
      moatRating: 'None',
      historicalRevenues: { FY2022: 105000000, FY2023: 96000000, FY2024: 98000000 },
    },
  ],
  'Biotechnology & Commercial Therapeutics': [
    {
      id: 'comp-genetech',
      name: 'GeneTech Innovations Inc.',
      ticker: 'GNTX',
      industry: 'Biotechnology & Commercial Therapeutics',
      marketCap: 4500000000,
      period: 'FY2024',
      revenue: 62000000,
      revenueGrowthYoY: 38.5,
      grossMargin: 86.5,
      operatingMargin: 18.2,
      netMargin: 14.5,
      ebitdaMargin: 24.0,
      returnOnEquity: 21.5,
      returnOnAssets: 16.2,
      currentRatio: 4.85,
      quickRatio: 4.20,
      debtToEquity: 0.12,
      interestCoverage: 45.0,
      freeCashFlow: 16500000,
      fcfMargin: 26.6,
      piotroskiFScore: 9,
      altmanZScore: 6.80,
      dso: 42,
      riskLevel: 'Low',
      keyStrengths: ['FDA approved blockbuster oncology therapy', 'Superior margins and pristine cash balance ($110M)'],
      vulnerabilities: ['Concentration risk: 78% revenue from single indication'],
      moatRating: 'Wide',
      historicalRevenues: { FY2022: 24000000, FY2023: 44800000, FY2024: 62000000 },
    },
  ],
};

/**
 * Get competitor companies for active dataset
 */
export function getCompetitorsForDataset(dataset: FinancialDataset): CompetitorCompany[] {
  const match = Object.keys(CURATED_COMPETITORS).find((key) =>
    dataset.industry.toLowerCase().includes(key.toLowerCase().split(' ')[0])
  );
  return match ? CURATED_COMPETITORS[match] : CURATED_COMPETITORS['Enterprise Software & Cloud AI Infrastructure'];
}

/**
 * Build active company competitor object from dataset & calculated ratios
 */
export function buildActiveCompanyProfile(dataset: FinancialDataset, ratios: any): CompetitorCompany {
  const period = dataset.activePeriod;
  const getValue = (key: string): number => {
    const isItem = dataset.incomeStatement.find((i) => i.key.toLowerCase() === key.toLowerCase());
    if (isItem) return isItem.values[period] ?? 0;
    const cfItem = dataset.cashFlowStatement.find((i) => i.key.toLowerCase() === key.toLowerCase());
    return cfItem?.values[period] ?? 0;
  };

  const revenue = getValue('revenue') || 68500000;
  const historicalRevenues: Record<string, number> = {};
  dataset.periods.forEach((p) => {
    const isItem = dataset.incomeStatement.find((i) => i.key.toLowerCase() === 'revenue');
    historicalRevenues[p] = isItem?.values[p] ?? 0;
  });

  return {
    id: dataset.id,
    name: dataset.companyName,
    ticker: dataset.ticker || 'TARGET',
    industry: dataset.industry,
    marketCap: Math.round(revenue * 3.8),
    period: dataset.activePeriod,
    revenue,
    revenueGrowthYoY: ratios.revenueGrowthYoY,
    grossMargin: ratios.grossProfitMargin,
    operatingMargin: ratios.operatingMargin,
    netMargin: ratios.netProfitMargin,
    ebitdaMargin: ratios.ebitdaMargin,
    returnOnEquity: ratios.returnOnEquity,
    returnOnAssets: ratios.returnOnAssets,
    currentRatio: ratios.currentRatio,
    quickRatio: ratios.quickRatio,
    debtToEquity: ratios.debtToEquity,
    interestCoverage: ratios.interestCoverage,
    freeCashFlow: ratios.freeCashFlow,
    fcfMargin: Number(((ratios.freeCashFlow / revenue) * 100).toFixed(1)),
    piotroskiFScore: ratios.piotroskiFScore,
    altmanZScore: ratios.altmanZScore,
    dso: 64,
    riskLevel: ratios.debtToEquity > 1.0 ? 'Elevated' : ratios.altmanZScore < 2.0 ? 'Moderate' : 'Low',
    keyStrengths: [
      `Strong YoY revenue growth of +${ratios.revenueGrowthYoY}%`,
      `Robust Piotroski F-Score (${ratios.piotroskiFScore}/9) reflecting solid fundamental health`,
      `Resilient liquidity buffer (Current Ratio: ${ratios.currentRatio}x)`,
    ],
    vulnerabilities: [
      ratios.operatingMargin < 12 ? 'Compressed operating margins due to heavy R&D buildout' : 'Increasing working capital requirements',
      ratios.debtToEquity > 0.8 ? 'Elevated debt leverage relative to pure-play peers' : 'Lengthening DSO collection periods',
    ],
    moatRating: ratios.grossProfitMargin > 65 ? 'Wide' : 'Narrow',
    historicalRevenues,
  };
}

/**
 * Generate full comparative analysis report
 */
export function generateComparativeReport(
  target: CompetitorCompany,
  competitors: CompetitorCompany[]
): ComparativeAnalysisReport {
  const allCompanies = [target, ...competitors];

  const kpiComparison: Record<string, { [companyName: string]: number }> = {
    'Revenue Growth YoY (%)': {},
    'Gross Margin (%)': {},
    'Operating Margin (%)': {},
    'Net Margin (%)': {},
    'Return on Equity (%)': {},
    'Current Ratio (x)': {},
    'Debt-to-Equity (x)': {},
    'FCF Margin (%)': {},
    'Piotroski F-Score': {},
    'Altman Z-Score': {},
  };

  allCompanies.forEach((c) => {
    kpiComparison['Revenue Growth YoY (%)'][c.name] = c.revenueGrowthYoY;
    kpiComparison['Gross Margin (%)'][c.name] = c.grossMargin;
    kpiComparison['Operating Margin (%)'][c.name] = c.operatingMargin;
    kpiComparison['Net Margin (%)'][c.name] = c.netMargin;
    kpiComparison['Return on Equity (%)'][c.name] = c.returnOnEquity;
    kpiComparison['Current Ratio (x)'][c.name] = c.currentRatio;
    kpiComparison['Debt-to-Equity (x)'][c.name] = c.debtToEquity;
    kpiComparison['FCF Margin (%)'][c.name] = c.fcfMargin;
    kpiComparison['Piotroski F-Score'][c.name] = c.piotroskiFScore;
    kpiComparison['Altman Z-Score'][c.name] = c.altmanZScore;
  });

  const growthLeader = [...allCompanies].sort((a, b) => b.revenueGrowthYoY - a.revenueGrowthYoY)[0].name;
  const marginLeader = [...allCompanies].sort((a, b) => b.grossMargin - a.grossMargin)[0].name;
  const efficiencyLeader = [...allCompanies].sort((a, b) => b.returnOnEquity - a.returnOnEquity)[0].name;
  const highestRisk = [...allCompanies].sort((a, b) => a.altmanZScore - b.altmanZScore)[0].name;

  return {
    generatedAt: new Date().toISOString(),
    primaryCompany: target.name,
    competitors: competitors.map((c) => c.name),
    kpiComparison,
    synthesis: {
      growthLeader,
      marginLeader,
      capitalEfficiencyLeader: efficiencyLeader,
      highestRisk,
      executiveSummary: `${target.name} demonstrates a superior growth profile (+${target.revenueGrowthYoY}% YoY) compared to ${competitors[0]?.name || 'peers'}, but trails ${marginLeader} in gross profit margins. Its capital structure remains resilient with an Altman Z-Score of ${target.altmanZScore}.`,
      strategicTakeaways: [
        `Revenue Growth: ${target.name} captures significant market share vs legacy providers.`,
        `Cost Structure: Unit infrastructure margins offer an optimization opportunity of +300-500 bps to match ${marginLeader}.`,
        `Working Capital: Reducing DSO from ${target.dso} days to peer median (~48 days) would unlock liquid cash reserves.`,
      ],
    },
  };
}

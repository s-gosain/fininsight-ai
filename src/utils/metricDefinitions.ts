import { FinancialRatios, CurrencyCode, FinancialDataset } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';

export interface MetricDefinition {
  id: string;
  title: string;
  category: 'Growth' | 'Profitability' | 'Liquidity' | 'Solvency' | 'Quality' | 'Composite';
  formulaDisplay: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  multiplierLabel?: string;
  description: string;
  getActualsBreakdown?: (ratios: FinancialRatios, dataset: FinancialDataset, currency: CurrencyCode) => {
    actualFormula?: string;
    computedValue: string;
    evaluation: string;
    isPositive?: boolean;
  };
  getSectorInsight: (industry: string, ratios: FinancialRatios, dataset: FinancialDataset) => {
    sectorLabel: string;
    whyCritical: string;
    benchmarkTarget: string;
    sectorRisk: string;
  };
  cfoAuditTip: string;
}

/**
 * Resolves industry classification into a normalized archetype:
 * - 'tech': Software, SaaS, Cloud, AI, Internet
 * - 'logistics': Freight, Transportation, Supply Chain, Maritime
 * - 'pharma': Biotech, Pharmaceuticals, Life Sciences, Healthcare
 * - 'general': Retail, Manufacturing, Industrial, Corporate
 */
function getIndustryArchetype(industry: string): 'tech' | 'logistics' | 'pharma' | 'general' {
  const s = (industry || '').toLowerCase();
  if (s.includes('software') || s.includes('cloud') || s.includes('tech') || s.includes('ai') || s.includes('saas') || s.includes('internet')) {
    return 'tech';
  }
  if (s.includes('freight') || s.includes('transport') || s.includes('logistics') || s.includes('warehous') || s.includes('fleet')) {
    return 'logistics';
  }
  if (s.includes('pharma') || s.includes('biotech') || s.includes('clinical') || s.includes('oncology') || s.includes('health') || s.includes('therapeutic')) {
    return 'pharma';
  }
  return 'general';
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  revenue: {
    id: 'revenue',
    title: 'Total Revenue',
    category: 'Growth',
    formulaDisplay: 'Revenue = Σ (Gross Inflows from Sales, Contracts & Subscriptions) - Discounts / Allowances',
    numeratorLabel: 'Gross Receipts & Recognized Customer Billings',
    denominatorLabel: 'Standard Accounting Period (FY / Quarter)',
    description: 'The aggregate monetary inflow generated from core operating activities before deducting any operating costs or taxes.',
    getActualsBreakdown: (_ratios, dataset, currency) => {
      const activePeriod = dataset?.activePeriod || 'FY2024';
      const revItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'revenue');
      const rev = revItem?.values[activePeriod] ?? 0;
      return {
        actualFormula: `Recognized for ${activePeriod}`,
        computedValue: formatCurrency(rev, currency, true),
        evaluation: rev > 0 ? 'Positive Top-Line Scale' : 'Zero / Unrecognized Revenue',
        isPositive: rev > 0,
      };
    },
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Revenue scale determines valuation multiples (EV/ARR) and proves platform product-market fit against customer acquisition costs.',
            benchmarkTarget: 'Healthy SaaS: >$50M ARR with >15-25% Annual Expansion',
            sectorRisk: 'Slowing top-line signals churn or pricing pressure in seat-based subscription tiers.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Multi-Modal Transportation',
            whyCritical: 'Reflects route tonnage volume, contract freight rates, and spot market capacity absorption across key shipping corridors.',
            benchmarkTarget: 'Top-decile carriers: Consistent contract rate renewals > inflation index',
            sectorRisk: 'Freight rate deflation and spot market volume contraction compress top-line rapidly.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biopharmaceuticals & Therapeutics',
            whyCritical: 'Validates commercial drug adoption post-FDA approval vs reliance on non-dilutive grant awards and milestone tranches.',
            benchmarkTarget: 'Commercial stage: Accelerating prescription volume in primary therapeutic indication',
            sectorRisk: 'Patent expiration patent-cliffs or reimbursement formulary exclusion can slash revenue.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Serves as the foundation for all operating leverage, debt servicing capacity, and market share retention.',
            benchmarkTarget: 'Target: Outpacing nominal sector GDP growth rate by >2-4%',
            sectorRisk: 'Top-line stagnation leads to immediate operating margin compression.',
          };
      }
    },
    cfoAuditTip: 'Audit ASC 606 / IFRS 15 multi-element arrangements to ensure deferred revenue is not recognized prematurely.',
  },

  net_income: {
    id: 'net_income',
    title: 'Net Income (GAAP Bottom-Line)',
    category: 'Profitability',
    formulaDisplay: 'Net Income = Operating Income - Net Interest - Income Taxes ± Non-Operating Items',
    numeratorLabel: 'Earnings Available to Common Equity Holders',
    denominatorLabel: 'Final Residual Income After All Operating & Capital Costs',
    description: 'The ultimate bottom-line profit generated by the enterprise after all cost of goods sold, SG&A, depreciation, debt service, and corporate income taxes.',
    getActualsBreakdown: (ratios, dataset, currency) => {
      const activePeriod = dataset?.activePeriod || 'FY2024';
      const niItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'netincome');
      const val = niItem?.values[activePeriod] ?? 0;
      const isPos = val >= 0;
      return {
        actualFormula: `Net Earnings for ${activePeriod}`,
        computedValue: formatCurrency(val, currency, true),
        evaluation: isPos ? `Profitable (${ratios.netProfitMargin}% Net Margin)` : 'Operating at a GAAP Net Loss',
        isPositive: isPos,
      };
    },
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Validates operating leverage and the transition from venture cash burn to sustainable self-funded growth under the Rule of 40.',
            benchmarkTarget: 'Rule of 40 benchmark: (Growth % + FCF / Net Margin %) ≥ 40%',
            sectorRisk: 'Heavy stock-based compensation (SBC) often conceals true cash profitability.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Thin margins mean fuel price spikes or driver wage adjustments immediately eliminate bottom-line profits if fuel surcharges lag.',
            benchmarkTarget: 'Target Net Margin: 4% – 8% across diversified transportation modes',
            sectorRisk: 'High fixed depreciation of fleets creates operating deleverage during volume slowdowns.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Life Sciences',
            whyCritical: 'Differentiates clinical R&D stage companies from commercialized leaders with profitable distribution channels.',
            benchmarkTarget: 'Commercial biopharma: 18% – 30% net margin once blockbuster drug launches',
            sectorRisk: 'R&D write-offs and failed Phase III clinical endpoints trigger massive net losses.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Primary determinant of dividend payout stability, debt covenant compliance, and retained earnings growth.',
            benchmarkTarget: 'Healthy threshold: Positive return on sales exceeding cost of capital',
            sectorRisk: 'Non-operating foreign exchange swings and tax law changes can distort year-over-year comparability.',
          };
      }
    },
    cfoAuditTip: 'Reconcile GAAP Net Income to Operating Cash Flow to ensure net earnings are converted to hard cash rather than paper accruals.',
  },

  op_margin: {
    id: 'op_margin',
    title: 'Operating Margin (EBIT Margin)',
    category: 'Profitability',
    formulaDisplay: 'Operating Margin (%) = [Operating Income (EBIT) / Total Revenue] × 100',
    numeratorLabel: 'Operating Income (Revenue - COGS - Operating Expenses)',
    denominatorLabel: 'Total Revenue',
    multiplierLabel: '× 100%',
    description: 'Measures how much profit a company makes on each dollar of sales after paying for variable costs of production and fixed overhead, but before interest and taxes.',
    getActualsBreakdown: (ratios, dataset) => {
      const activePeriod = dataset?.activePeriod || 'FY2024';
      const opItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'operatingincome');
      const revItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'revenue');
      const op = opItem?.values[activePeriod] ?? 0;
      const rev = revItem?.values[activePeriod] ?? 1;
      const calculated = rev > 0 ? (op / rev) * 100 : ratios.operatingMargin;
      return {
        actualFormula: `EBIT (${formatPercent(calculated)}) / Revenue`,
        computedValue: formatPercent(ratios.operatingMargin),
        evaluation: ratios.operatingMargin >= 15 ? 'Top-Tier Efficiency' : ratios.operatingMargin >= 8 ? 'Solid Operating Spread' : 'Compressed Margin',
        isPositive: ratios.operatingMargin >= 10,
      };
    },
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Software has negligible marginal reproduction cost; operating margins should expand aggressively toward 25-35% as sales scale.',
            benchmarkTarget: 'Mature SaaS: 22% – 32% EBIT; Hyper-growth: 10% – 18%',
            sectorRisk: 'Excessive customer acquisition costs (CAC) or runaway hosting compute bills can crush margin expansion.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Transportation & Logistics',
            whyCritical: 'Measures carrier operating ratio (100 - Operating Margin). Carriers strive for an operating ratio below 90% to endure cyclical downturns.',
            benchmarkTarget: 'Operating Ratio < 88% (Operating Margin > 12%) for class-leading carriers',
            sectorRisk: 'Idle equipment, terminal bottlenecks, and driver turnover drive up unit operating cost.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biopharmaceuticals',
            whyCritical: 'Demonstrates commercial sales efficiency against ongoing pipeline discovery and clinical trial overhead.',
            benchmarkTarget: 'Established Pharma: 25% – 35% EBIT; Clinical-stage: Typically negative during trial phases',
            sectorRisk: 'Marketing SG&A during launch year can outpace commercial prescription ramp.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Purest indicator of operational excellence unclouded by corporate tax engineering or debt leverage.',
            benchmarkTarget: 'Healthy Industrial / Commercial target: 10% – 16%',
            sectorRisk: 'Inability to pass supplier price increases onto enterprise customers erodes EBIT spread.',
          };
      }
    },
    cfoAuditTip: 'Watch for capitalization of software development or maintenance costs into Balance Sheet intangibles, which inflates reported EBIT.',
  },

  rev_growth: {
    id: 'rev_growth',
    title: 'Revenue Growth (YoY)',
    category: 'Growth',
    formulaDisplay: 'YoY Growth (%) = [(Current Period Revenue - Prior Period Revenue) / |Prior Period Revenue|] × 100',
    numeratorLabel: 'Net Period-over-Period Dollar Delta',
    denominatorLabel: 'Prior Period Base Revenue',
    multiplierLabel: '× 100%',
    description: 'The percentage rate at which the company is expanding its top-line sales over an annualized 12-month fiscal period.',
    getActualsBreakdown: (ratios) => {
      const isPos = ratios.revenueGrowthYoY >= 0;
      return {
        actualFormula: `Δ YoY: ${isPos ? '+' : ''}${ratios.revenueGrowthYoY}%`,
        computedValue: formatPercent(ratios.revenueGrowthYoY, true),
        evaluation: ratios.revenueGrowthYoY >= 15 ? 'Hyper-Growth Trajectory' : ratios.revenueGrowthYoY >= 5 ? 'Steady Expansion' : 'Stagnant or Contracting',
        isPositive: isPos,
      };
    },
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Enterprise Software & Cloud AI',
            whyCritical: 'Investors price tech companies on future discounted terminal cash flows; high growth compounds long-term enterprise market share.',
            benchmarkTarget: 'Target: >18% YoY for enterprise software; >30% for high-growth AI infrastructure',
            sectorRisk: 'Growth deceleration triggers rapid multiple contraction even if profits remain stable.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Supply Chain Logistics',
            whyCritical: 'Reflects market capacity expansion and ability to win multi-year enterprise third-party logistics (3PL) contracts.',
            benchmarkTarget: 'Target: GDP + 3% to 6% through cycle-adjusted market share gains',
            sectorRisk: 'Macro industrial destocking cycles can turn YoY growth negative rapidly.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Confirms clinical trial adoption curve and doctor prescription acceleration following regulatory approval.',
            benchmarkTarget: 'Growth Phase: >25% YoY following initial label expansion',
            sectorRisk: 'Reimbursement pushback or competitive biosimilars can stall growth prematurely.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Signals whether brand equity and customer acquisition velocity are outpacing industry competitors.',
            benchmarkTarget: 'Target: >6% – 10% YoY organic expansion',
            sectorRisk: 'Reliance on M&A acquisitions can mask underlying organic revenue contraction.',
          };
      }
    },
    cfoAuditTip: 'Separate organic revenue growth from currency fluctuations and M&A acquisitions to assess true underlying commercial demand.',
  },

  gross_margin: {
    id: 'gross_margin',
    title: 'Gross Profit Margin',
    category: 'Profitability',
    formulaDisplay: 'Gross Margin (%) = [(Total Revenue - Cost of Goods Sold) / Total Revenue] × 100',
    numeratorLabel: 'Gross Profit (Revenue minus Direct Delivery/Manufacturing Costs)',
    denominatorLabel: 'Total Revenue',
    multiplierLabel: '× 100%',
    description: 'The proportion of money left over from revenues after accounting for the direct costs of producing the goods or services sold.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Gross Profit Spread / Total Revenue`,
      computedValue: formatPercent(ratios.grossProfitMargin),
      evaluation: ratios.grossProfitMargin >= 60 ? 'Formidable Pricing Power' : ratios.grossProfitMargin >= 35 ? 'Healthy Unit Economics' : 'Commoditized / Low Spread',
      isPositive: ratios.grossProfitMargin >= 40,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'The benchmark of software unit economics. High gross margins (70-85%) provide the surplus required to fund heavy R&D and quota-carrying sales reps.',
            benchmarkTarget: 'Gold standard: 72% – 82% Gross Margin for SaaS',
            sectorRisk: 'High third-party cloud hosting costs (AWS/GCP/Azure) and customer success expenses can erode margin.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Direct fuel, fleet maintenance, toll charges, and driver wages consume 65-80% of revenue, leaving tight gross margins.',
            benchmarkTarget: 'Healthy Freight Target: 22% – 32% Gross Margin',
            sectorRisk: 'Sudden diesel fuel spikes without dynamic contractual fuel pass-through clauses destroy gross profit.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biopharmaceuticals & Therapeutics',
            whyCritical: 'Manufacturing marginal chemical or biologic batches is inexpensive relative to upfront trial R&D, yielding gross margins often >80%.',
            benchmarkTarget: 'Target: 78% – 88% Gross Margin for commercial drugs',
            sectorRisk: 'Cold-chain delivery requirements and specialized cell therapy cleanroom costs can increase COGS.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Demonstrates economic moat and customer willingness to pay premium prices over commodity alternatives.',
            benchmarkTarget: 'Industrial Average: 35% – 50%',
            sectorRisk: 'Supply chain raw material cost inflation can severely squeeze the gross profit buffer.',
          };
      }
    },
    cfoAuditTip: 'Ensure customer success, cloud computing instances, and implementation labor are correctly categorized into COGS rather than buried in OpEx.',
  },

  free_cash_flow: {
    id: 'free_cash_flow',
    title: 'Free Cash Flow (FCF)',
    category: 'Liquidity',
    formulaDisplay: 'Free Cash Flow = Cash Flow from Operating Activities (OCF) - Capital Expenditures (CapEx)',
    numeratorLabel: 'Operating Cash Flow minus Essential Physical/Intangible Investments',
    denominatorLabel: 'Real Unencumbered Cash Generation',
    description: 'The actual discretionary cash generated by enterprise operations after investing the capital required to maintain and expand its asset base.',
    getActualsBreakdown: (ratios, _dataset, currency) => {
      const isPos = ratios.freeCashFlow >= 0;
      return {
        actualFormula: `Operating Cash Flow - Capital Expenditures`,
        computedValue: formatCurrency(ratios.freeCashFlow, currency, true),
        evaluation: isPos ? 'Positive Cash Generation' : 'Negative Cash Burn / Heavy Capital Stage',
        isPositive: isPos,
      };
    },
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Software has minimal physical CapEx; high FCF enables opportunistic M&A, share repurchases, and builds a defensive cash treasury.',
            benchmarkTarget: 'Target FCF Margin: >20% – 28% of total revenue',
            sectorRisk: 'Heavy server cluster and specialized AI hardware capital leases can deplete FCF reserves.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Multi-Modal Transportation',
            whyCritical: 'Fleet refresh cycles (tractors, trailers, vessels, automated sorting hubs) demand disciplined CapEx to avoid negative FCF.',
            benchmarkTarget: 'Target: Operating Cash Flow must exceed 1.5x Annual Maintenance CapEx',
            sectorRisk: 'Debt-financed fleet purchases during freight downturns strain liquidity covenants.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Life Sciences',
            whyCritical: 'Determines the cash runway before needing to dilute existing equity holders with secondary share offerings.',
            benchmarkTarget: 'Clinical stage: >18-24 months of cash runway; Commercial: Self-funding pipeline',
            sectorRisk: 'Expensive multi-center Phase III clinical trials accelerate cash burn rapidly.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'The ultimate truth test of financial strength, independent of non-cash accounting estimates and depreciation schedules.',
            benchmarkTarget: 'Target: >75% conversion of GAAP Net Income into Free Cash Flow',
            sectorRisk: 'Working capital inventory build-ups tie up cash on the balance sheet.',
          };
      }
    },
    cfoAuditTip: 'Scrutinize whether vendor financing or leased assets are classified as financing cash flows to cosmetically protect Operating Cash Flow.',
  },

  debt_to_equity: {
    id: 'debt_to_equity',
    title: 'Debt-to-Equity Ratio (D/E)',
    category: 'Solvency',
    formulaDisplay: 'Debt-to-Equity = Total Debt (Short-Term Debt + Long-Term Debt) / Total Stockholders’ Equity',
    numeratorLabel: 'Aggregate Interest-Bearing Debt Liabilities',
    denominatorLabel: 'Book Value of Stockholders’ Equity',
    multiplierLabel: 'Expressed as a Multiple (x)',
    description: 'Measures financial leverage and the degree to which company assets are financed through debt relative to shareholder equity capital.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Total Debt Obligations / Book Equity`,
      computedValue: `${ratios.debtToEquity}x`,
      evaluation: ratios.debtToEquity <= 0.6 ? 'Conservative Balance Sheet' : ratios.debtToEquity <= 1.2 ? 'Balanced Capital Structure' : 'High Financial Leverage',
      isPositive: ratios.debtToEquity <= 1.0,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Asset-light technology businesses rarely carry heavy structural debt; leverage above 1.5x restricts strategic pivots.',
            benchmarkTarget: 'Optimal SaaS Range: 0.1x – 0.6x (or Net Cash Position)',
            sectorRisk: 'High interest payments reduce cash available for critical software engineering talent.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Multi-Modal Fleet Transportation',
            whyCritical: 'Trucks, locomotives, and automated sorting centers serve as collateral; leverage of 1.0x-2.0x is standard, but dangerous if interest rates surge.',
            benchmarkTarget: 'Target: 0.8x – 1.4x for investment-grade logistics operators',
            sectorRisk: 'During recessions, fixed debt servicing persists while freight shipping volumes collapse.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Therapeutics',
            whyCritical: 'Binary clinical trial risk means pre-approval companies should avoid debt, which can force insolvency if a primary endpoint is missed.',
            benchmarkTarget: 'Conservative Range: <0.4x or pure equity capitalization',
            sectorRisk: 'Debt covenants can block royalty monetization or force fire-sale asset licensing.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Direct indicator of financial distress risk and borrowing capacity under tighter bank credit conditions.',
            benchmarkTarget: 'Healthy Corporate Benchmark: < 1.0x – 1.25x',
            sectorRisk: 'Rising benchmark interest rates increase debt rollover refinancing costs.',
          };
      }
    },
    cfoAuditTip: 'Check whether negative stockholders equity from aggressive historical share buybacks is artificially skewing D/E to negative or infinity.',
  },

  current_ratio: {
    id: 'current_ratio',
    title: 'Current Ratio (Working Capital Coverage)',
    category: 'Liquidity',
    formulaDisplay: 'Current Ratio = Total Current Assets / Total Current Liabilities',
    numeratorLabel: 'Assets Convertible to Cash within 12 Months',
    denominatorLabel: 'Obligations Due within 12 Months',
    multiplierLabel: 'Expressed as a Multiple (x)',
    description: 'Evaluates a company’s ability to cover its short-term debt and payable obligations using its short-term assets (cash, receivables, inventory).',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Current Assets / Current Liabilities`,
      computedValue: `${ratios.currentRatio}x`,
      evaluation: ratios.currentRatio >= 1.5 ? 'Ample Liquidity Buffer' : ratios.currentRatio >= 1.0 ? 'Adequate Working Capital' : 'Deficit / Short-Term Cash Pressure',
      isPositive: ratios.currentRatio >= 1.2,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Subscribers pay upfront for annual contracts, creating large Deferred Revenue liabilities that mathematically lower the Current Ratio without true cash risk.',
            benchmarkTarget: 'Adjusted Target (excl. Deferred Revenue): >1.4x – 2.0x',
            sectorRisk: 'Short-term debt maturities maturing without sufficient cash in banking accounts.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Supply Chain Operations',
            whyCritical: 'Carriers must pay fuel bills and driver payroll weekly while enterprise shippers take 45-60 days to settle invoices (DSO gap).',
            benchmarkTarget: 'Target Range: 1.25x – 1.75x to bridge working capital lag',
            sectorRisk: 'Cash crunches occur if freight factoring lines dry up or fuel bills spike.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Healthcare',
            whyCritical: 'Ensures clinical trial site operators and contract research organizations (CROs) can be paid without emergency capital raises.',
            benchmarkTarget: 'Target: >2.0x to 3.5x to preserve clinical continuity',
            sectorRisk: 'Delayed milestone payments from pharma partners can strain payable balances.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'The foundational benchmark of immediate solvency and operational continuity across business cycles.',
            benchmarkTarget: 'Standard Healthy Range: 1.3x – 2.0x',
            sectorRisk: 'A ratio below 1.0x indicates negative net working capital requiring credit line drawdowns.',
          };
      }
    },
    cfoAuditTip: 'Exclude illiquid pre-paid expenses and non-convertible inventories to test true liquidation coverage.',
  },

  net_margin: {
    id: 'net_margin',
    title: 'Net Profit Margin (%)',
    category: 'Profitability',
    formulaDisplay: 'Net Profit Margin (%) = (Net Income / Total Revenue) × 100',
    numeratorLabel: 'Net Income After All Taxes and Financing Costs',
    denominatorLabel: 'Total Revenue',
    multiplierLabel: '× 100%',
    description: 'The percentage of revenue left as pure bottom-line profit after all operating costs, interest on loans, and tax liabilities have been paid.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Net Earnings / Revenue`,
      computedValue: formatPercent(ratios.netProfitMargin),
      evaluation: ratios.netProfitMargin >= 15 ? 'Excellent Bottom-Line Conversion' : ratios.netProfitMargin >= 6 ? 'Healthy Margin' : 'Thin / Vulnerable',
      isPositive: ratios.netProfitMargin >= 8,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Reflects operating efficiency flowing all the way to equity holders; high net margins fund self-sustaining international expansion.',
            benchmarkTarget: 'Target: 15% – 25% for established tech providers',
            sectorRisk: 'Over-hiring in non-technical departments inflates overhead and compresses net spread.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Industry averages hover between 3% and 7%; every basis point of net margin represents millions in unencumbered shareholder value.',
            benchmarkTarget: 'Target: 5% – 8% for high-efficiency carriers',
            sectorRisk: 'Small unexpected increases in insurance liability or equipment repair costs wipe out net profits.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Measures patent commercial monetization power once research development costs have stabilized.',
            benchmarkTarget: 'Commercial Tier: 20% – 35% for patent-protected drugs',
            sectorRisk: 'Generic substitution upon patent expiration leads to instantaneous margin collapse.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Primary metric for price-to-earnings (P/E) valuation comparisons against industry benchmarks.',
            benchmarkTarget: 'Healthy Target: 8% – 14%',
            sectorRisk: 'Effective tax rate spikes or non-operating litigation settlements can create volatile earnings.',
          };
      }
    },
    cfoAuditTip: 'Inspect one-off non-operating tax credits or asset sales that temporarily boost GAAP net margin.',
  },

  ebitda_margin: {
    id: 'ebitda_margin',
    title: 'EBITDA Margin',
    category: 'Profitability',
    formulaDisplay: 'EBITDA Margin (%) = [(Operating Income + D&A) / Total Revenue] × 100',
    numeratorLabel: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
    denominatorLabel: 'Total Revenue',
    multiplierLabel: '× 100%',
    description: 'A key measure of pure core operating cash generation, stripping out non-cash depreciation, debt structure, and income tax variances.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `(EBIT + D&A) / Revenue`,
      computedValue: formatPercent(ratios.ebitdaMargin),
      evaluation: ratios.ebitdaMargin >= 25 ? 'Robust Operating Cash Generation' : ratios.ebitdaMargin >= 15 ? 'Solid Cash Spread' : 'Moderate / Capital Intensive',
      isPositive: ratios.ebitdaMargin >= 15,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Enterprise Software & Cloud Platforms',
            whyCritical: 'Primary valuation anchor for private equity buyouts and M&A transactions (EV/EBITDA multiples).',
            benchmarkTarget: 'Target: 25% – 38% for profitable mature SaaS',
            sectorRisk: 'EBITDA ignores ongoing computer hardware server refresh costs that are real economic cash outlays.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Normalizes carriers that own fleets (heavy depreciation) versus those that lease equipment (operating expenses).',
            benchmarkTarget: 'Industry Standard: 18% – 26% EBITDA Margin',
            sectorRisk: 'Failing to deduct real maintenance CapEx paints an overly optimistic cash picture.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biopharmaceuticals',
            whyCritical: 'Isolates cash flow from commercial therapeutics by neutralizing large non-cash patent amortization from previous acquisitions.',
            benchmarkTarget: 'Commercial Tier: 30% – 45% EBITDA Margin',
            sectorRisk: 'High commercial marketing expenditures (direct-to-consumer ads) can weigh on EBITDA.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Used by syndicated bank lenders to calculate maximum debt leverage covenants (e.g. Debt/EBITDA < 3.5x).',
            benchmarkTarget: 'Corporate Average: 14% – 22%',
            sectorRisk: 'Aggressive management adjustments (pro-forma EBITDA add-backs) can mislead lenders.',
          };
      }
    },
    cfoAuditTip: 'Ensure non-standard management add-backs (restructuring, severance, stock comp) are properly reconciled back to standard GAAP EBIT.',
  },

  quick_ratio: {
    id: 'quick_ratio',
    title: 'Quick Ratio (Acid-Test)',
    category: 'Liquidity',
    formulaDisplay: 'Quick Ratio = (Cash & Equivalents + Marketable Securities + Current Receivables) / Current Liabilities',
    numeratorLabel: 'Near-Cash Liquid Assets (Excludes Illiquid Inventories)',
    denominatorLabel: 'Current Liabilities Due within 12 Months',
    multiplierLabel: 'Expressed as a Multiple (x)',
    description: 'A more rigorous liquidity measure that tests whether a firm can settle short-term obligations immediately without needing to liquidate inventory.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `(Cash + Receivables) / Current Liabilities`,
      computedValue: `${ratios.quickRatio}x`,
      evaluation: ratios.quickRatio >= 1.0 ? 'Fully Covered by Liquid Cash & A/R' : 'Partially Dependent on Inventory Liquidation',
      isPositive: ratios.quickRatio >= 1.0,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Software companies carry no physical inventory, meaning Quick Ratio is almost identical to Current Ratio and reflects real treasury strength.',
            benchmarkTarget: 'Healthy Target: 1.2x – 2.0x',
            sectorRisk: 'Treasury concentration in uninsured short-term commercial paper or illiquid notes.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Strips out spare parts, tires, and fuel reserves that cannot be converted to immediate cash during a liquidity crunch.',
            benchmarkTarget: 'Healthy Range: 0.9x – 1.3x',
            sectorRisk: 'Slow-paying commercial freight shippers increase receivables aging, impairing true liquidity.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Experimental biologic compounds have zero secondary liquidation value if a company defaults; acid-test cash protection is paramount.',
            benchmarkTarget: 'Conservative Range: >1.5x – 2.5x',
            sectorRisk: 'Cash burn rate exceeding quarterly customer collections.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Measures survival capacity under immediate debt acceleration or credit line cancellations.',
            benchmarkTarget: 'Gold Standard: ≥ 1.0x (1 dollar of liquid cash/receivables per dollar of short-term debt)',
            sectorRisk: 'Customer invoice disputes delaying receivables collections.',
          };
      }
    },
    cfoAuditTip: 'Review the allowance for doubtful accounts to ensure accounts receivable are not impaired by insolvent customers.',
  },

  interest_coverage: {
    id: 'interest_coverage',
    title: 'Interest Coverage Ratio',
    category: 'Solvency',
    formulaDisplay: 'Interest Coverage = Operating Income (EBIT) / Annual Gross Interest Expense',
    numeratorLabel: 'Earnings Available to Service Debt (EBIT)',
    denominatorLabel: 'Mandatory Contractual Interest Expense',
    multiplierLabel: 'Times Covered (x)',
    description: 'Determines how easily a company can pay interest due on outstanding debt with its operational earnings before taxes and finance charges.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `EBIT / Gross Interest Obligations`,
      computedValue: `${ratios.interestCoverage}x`,
      evaluation: ratios.interestCoverage >= 4.0 ? 'Ample Debt Service Capacity' : ratios.interestCoverage >= 2.0 ? 'Adequate Buffer' : 'Vulnerable to Debt Distress',
      isPositive: ratios.interestCoverage >= 3.0,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Strong cash-generating tech firms often boast coverage >15x-30x, protecting them during macroeconomic rate tightening cycles.',
            benchmarkTarget: 'Healthy SaaS Target: >8.0x – 15.0x',
            sectorRisk: 'Leveraged buyout (LBO) debt can consume operating cash flow if revenue slows.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Fleet Transportation',
            whyCritical: 'Capital expenditure on rolling stock means heavy equipment debt; coverage below 2.5x triggers bank covenant defaults.',
            benchmarkTarget: 'Target Range: 3.5x – 6.0x across cycle peaks and troughs',
            sectorRisk: 'Floating-rate debt exposes carriers to sudden interest rate escalations.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Therapeutics',
            whyCritical: 'Pre-revenue clinical biotech firms must avoid debt because zero revenue means negative interest coverage.',
            benchmarkTarget: 'Commercial Biopharma: >5.0x coverage on any royalty-backed bonds',
            sectorRisk: 'Debt service draining cash needed for clinical trial patient recruitment.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'The benchmark metric used by credit rating agencies (Moody’s, S&P, Fitch) for corporate bond ratings.',
            benchmarkTarget: 'Investment Grade Target: > 4.5x – 6.0x',
            sectorRisk: 'Coverage below 1.5x indicates company is dipping into cash reserves to pay lenders.',
          };
      }
    },
    cfoAuditTip: 'Check credit facility agreements for minimum coverage covenant thresholds that could trigger loan acceleration.',
  },

  roe: {
    id: 'roe',
    title: 'Return on Equity (ROE)',
    category: 'Quality',
    formulaDisplay: 'ROE (%) = (Net Income / Total Stockholders’ Equity) × 100 = Profit Margin × Asset Turnover × Financial Leverage',
    numeratorLabel: 'Net Income Available to Common Shareholders',
    denominatorLabel: 'Book Value of Equity Capital Invested',
    multiplierLabel: '× 100%',
    description: 'Measures management’s efficiency at compounding shareholder capital, decomposed through DuPont Analysis into profitability, asset efficiency, and leverage.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Net Income / Stockholders’ Equity`,
      computedValue: formatPercent(ratios.returnOnEquity),
      evaluation: ratios.returnOnEquity >= 20 ? 'Top-Decile Capital Compounding' : ratios.returnOnEquity >= 10 ? 'Healthy Return' : 'Sub-Optimal Capital Efficiency',
      isPositive: ratios.returnOnEquity >= 12,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'High ROE (>25-45%) reflects asset-light software scalability—each incremental customer requires almost zero new physical equity capital.',
            benchmarkTarget: 'Elite SaaS: 22% – 38% Return on Equity',
            sectorRisk: 'Excess balance sheet cash drag can dilute reported ROE without operational deterioration.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Supply Chain Operations',
            whyCritical: 'Physical fleets tie up substantial balance sheet equity; achieving >12-16% ROE requires world-class route optimization and asset turnover.',
            benchmarkTarget: 'Industry Target: 11% – 16% ROE',
            sectorRisk: 'Carriers that boost ROE purely through excessive debt leverage face heightened bankruptcy risk.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Demonstrates the windfall returns generated by commercialized patent monopolies against equity investments.',
            benchmarkTarget: 'Commercial Leaders: 20% – 35% ROE',
            sectorRisk: 'Equity dilution from continuous stock issuance lowers per-share compounding.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'The master barometer of long-term intrinsic value creation for public equity investors.',
            benchmarkTarget: 'Cost of Equity Benchmark: >10% – 14% (must exceed WACC)',
            sectorRisk: 'Using massive debt to buy back shares can cosmetically inflate ROE while weakening solvency.',
          };
      }
    },
    cfoAuditTip: 'Execute a 3-way DuPont decomposition to verify whether high ROE is driven by genuine operating margin expansion rather than dangerous leverage.',
  },

  roa: {
    id: 'roa',
    title: 'Return on Assets (ROA)',
    category: 'Quality',
    formulaDisplay: 'ROA (%) = (Net Income / Total Assets) × 100 = Profit Margin × Asset Turnover',
    numeratorLabel: 'Net Income for the Period',
    denominatorLabel: 'Total Asset Base Employed',
    multiplierLabel: '× 100%',
    description: 'Measures how efficiently management generates earnings from the total economic assets under its control, combining margin and asset turnover.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Net Income / Total Assets`,
      computedValue: formatPercent(ratios.returnOnAssets),
      evaluation: ratios.returnOnAssets >= 10 ? 'Elite Asset Productivity' : ratios.returnOnAssets >= 5 ? 'Healthy Asset Conversion' : 'Capital-Intensive Drag',
      isPositive: ratios.returnOnAssets >= 6,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Software firms maintain minimal physical plant assets; high ROA (>12-20%) confirms capital efficiency.',
            benchmarkTarget: 'Tech Benchmark: 10% – 18% ROA',
            sectorRisk: 'Large M&A goodwill entries on the balance sheet can artificially depress reported ROA.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Supply Chain Operations',
            whyCritical: 'Fleet and warehouse assets are huge capital investments; achieving >6-9% ROA separates top operators from struggling carriers.',
            benchmarkTarget: 'Logistics Benchmark: 5% – 9% ROA',
            sectorRisk: 'Underutilized rolling stock directly impairs return on total assets.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Evaluates commercial cash generation against capitalized laboratory and manufacturing infrastructure.',
            benchmarkTarget: 'Pharma Benchmark: 8% – 15% ROA',
            sectorRisk: 'Idle facility write-downs occur if commercialized drug volume fails to meet capacity.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Purest measure of operational asset productivity independent of financial capital structure.',
            benchmarkTarget: 'General Industry Benchmark: 5% – 10% ROA',
            sectorRisk: 'Carrying obsolete inventory or unproductive fixed assets reduces overall asset yield.',
          };
      }
    },
    cfoAuditTip: 'Compare ROA with ROE: if ROE is massively higher than ROA, high debt leverage is being used to amplify returns.',
  },

  piotroski: {
    id: 'piotroski',
    title: 'Piotroski F-Score',
    category: 'Quality',
    formulaDisplay: 'F-Score = Σ (9 Binary Tests across Profitability, Leverage/Liquidity, and Operating Efficiency)',
    numeratorLabel: 'Sum of 9 Fundamental Binary Quality Criteria',
    denominatorLabel: 'Scale of 0 to 9 Points',
    description: 'A 9-point fundamental scoring system that assesses financial strength, operational efficiency, and balance sheet quality.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Sum of 9 Fundamental Quality Tests`,
      computedValue: `${ratios.piotroskiFScore} / 9`,
      evaluation: ratios.piotroskiFScore >= 7 ? 'Pristine Health (Top Tier)' : ratios.piotroskiFScore >= 5 ? 'Stable / Average Fundamentals' : 'Fragile / High Fundamental Watch',
      isPositive: ratios.piotroskiFScore >= 6,
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Cloud & Enterprise Software',
            whyCritical: 'Detects whether growth is backed by genuine operating cash flow versus aggressive revenue accruals and equity dilution.',
            benchmarkTarget: 'Target Score: 7 – 9 points',
            sectorRisk: 'Dilutive stock-based compensation (SBC) and negative CFO reduce Piotroski scoring.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation Logistics',
            whyCritical: 'Signals turning points in freight cycles by tracking YoY margin momentum, fleet asset turnover, and debt retirement.',
            benchmarkTarget: 'Stable Carriers: ≥ 6 points',
            sectorRisk: 'Simultaneous declines in gross margin and current ratio trigger immediate rating downgrades.',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Differentiates commercial biotech operators with positive operating cash flow from cash-burning clinical trial pipelines.',
            benchmarkTarget: 'Commercial Target: ≥ 6 points; Clinical: Evaluated primarily on liquidity metrics',
            sectorRisk: 'Continual equity offerings reduce Piotroski dilution criteria points.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Forensically separates fundamentally improving companies from value traps with decaying balance sheets.',
            benchmarkTarget: 'Investment Grade: 7 – 9 points; Watchlist: < 4 points',
            sectorRisk: 'Score degradation below 5 historically correlates with underperformance and increased debt distress.',
          };
      }
    },
    cfoAuditTip: 'Pay close attention to Piotroski Criterion 4 (Accruals: Cash Flow from Operations > Net Income), a primary red-flag for earnings manipulation.',
  },

  altman_z: {
    id: 'altman_z',
    title: 'Altman Z-Score',
    category: 'Solvency',
    formulaDisplay: 'Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MVE/TL) + 1.0(Sales/TA)',
    numeratorLabel: 'Linear Combination of 5 Weighted Financial Ratios',
    denominatorLabel: 'Empirical Bankruptcy Predictor Model',
    description: 'The Z-Score uses five financial ratios to predict the probability of corporate bankruptcy and assess solvency risk within a 2-year horizon.',
    getActualsBreakdown: (ratios) => ({
      actualFormula: `Z = ${ratios.altmanZScore} (${ratios.altmanZone} Zone)`,
      computedValue: `${ratios.altmanZScore} (${ratios.altmanZone})`,
      evaluation: ratios.altmanZone === 'Safe' ? 'Safe Zone (Low Probability of Distress)' : ratios.altmanZone === 'Grey' ? 'Grey Zone (Monitor Working Capital)' : 'Distress Zone (High Probability of Default)',
      isPositive: ratios.altmanZone === 'Safe',
    }),
    getSectorInsight: (industry) => {
      const archetype = getIndustryArchetype(industry);
      switch (archetype) {
        case 'tech':
          return {
            sectorLabel: 'Enterprise Software & Cloud Platforms',
            whyCritical: 'High enterprise market valuations (MVE/TL) usually push tech companies comfortably into the Safe Zone, but EBIT/TA tests true asset productivity.',
            benchmarkTarget: 'Safe Zone Benchmark: Z > 2.99',
            sectorRisk: 'Falling market capitalization and recurring operating losses can drag tech firms into the Grey Zone.',
          };
        case 'logistics':
          return {
            sectorLabel: 'Freight & Transportation',
            whyCritical: 'Heavy asset intensity (Sales/TA) and high equipment liabilities make logistics operators particularly sensitive to Altman distress boundaries.',
            benchmarkTarget: 'Target: Maintain Z > 2.60 to avoid bank syndicate rating penalties',
            sectorRisk: 'Freight recessions combined with high fleet debt can push carriers into the Distress Zone (<1.81).',
          };
        case 'pharma':
          return {
            sectorLabel: 'Biotechnology & Precision Medicine',
            whyCritical: 'Pre-revenue biotech firms often register low Z-scores due to lack of sales and retained earnings; requires modified service/emerging model interpretation.',
            benchmarkTarget: 'Commercial biopharma: Z > 3.0; Clinical: Evaluated with Cash Runway',
            sectorRisk: 'Exhausted cash runway with clinical trial delays triggers distress.',
          };
        default:
          return {
            sectorLabel: industry || 'Corporate Enterprise',
            whyCritical: 'Proven by over 50 years of empirical empirical credit market research to predict 80-90% of corporate bankruptcies within two years.',
            benchmarkTarget: 'Safe: >2.99 | Grey: 1.81 – 2.99 | Distress: <1.81',
            sectorRisk: 'Grey zone companies face higher bond yields and supplier credit terms tightening.',
          };
      }
    },
    cfoAuditTip: 'For private or emerging enterprises, apply the double-prime (Z”) credit model which substitutes Book Value of Equity for Market Value.',
  },

  health_grade: {
    id: 'health_grade',
    title: 'Financial Health Composite Rating',
    category: 'Composite',
    formulaDisplay: 'Rating = Weighted Matrix [Solvency (30%) + Profitability (30%) + Liquidity (20%) + Operating Efficiency (20%)]',
    numeratorLabel: 'Multi-Pillar Institutional Balance Sheet Audit',
    denominatorLabel: 'Standard S&P / Moody’s Institutional Grade Scale (A+ through D)',
    description: 'An institutional composite health rating synthesizing balance sheet solvency, cash flow liquidity, operating profitability, and working capital efficiency.',
    getActualsBreakdown: (_ratios, dataset) => {
      const activePeriod = dataset?.activePeriod || 'FY2024';
      return {
        actualFormula: `Synthesized for ${activePeriod}`,
        computedValue: `Institutional Audit Standard`,
        evaluation: 'Holistic Multi-Dimensional Evaluation',
        isPositive: true,
      };
    },
    getSectorInsight: (industry) => ({
      sectorLabel: industry || 'Enterprise Sector',
      whyCritical: 'Provides C-suite executives, boards of directors, and institutional creditors with an unvarnished audit of financial resilience.',
      benchmarkTarget: 'Investment Grade Target: Grade A- or higher',
      sectorRisk: 'A multi-notch downgrade signals deteriorating capital access and higher borrowing spreads.',
    }),
    cfoAuditTip: 'Evaluate which individual pillar is dragging down the composite score to prioritize operational turnaround initiatives.',
  },
};

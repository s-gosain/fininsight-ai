import {
  FinancialDataset,
  FinancialRatios,
  IndustryPeerGroup,
  BenchmarkMetricDetail,
  BenchmarkPeer,
  BenchmarkSettings,
  PeerGroupWeightingMethod,
} from '../types';

export const INDUSTRY_PEER_GROUPS: IndustryPeerGroup[] = [
  {
    id: 'peer-saas-cloud',
    name: 'Enterprise SaaS & Cloud AI Infrastructure',
    code: 'B2B_SAAS_CLOUD',
    description: 'High-growth cloud platform providers, developer AI APIs, and enterprise multi-tenant software.',
    sampleCompaniesCount: 48,
    medianMarketCap: '$1.85B',
    macroRiskFactors: ['Customer CAC Inflation', 'Hyperscaler Compute Unit Costs', 'Retention Churn'],
    metrics: [
      {
        key: 'grossProfitMargin',
        name: 'Gross Profit Margin',
        category: 'Profitability',
        companyValue: 67.0,
        bottomQuartile: 62.0,
        industryMedian: 71.5,
        topQuartile: 78.0,
        industryLeader: 84.5,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: -4.5,
        percentileRank: 42,
        strategicImplication: 'Gross margin is slightly below the SaaS median of 71.5% due to high third-party GPU compute leasing costs.',
      },
      {
        key: 'revenueGrowthYoY',
        name: 'Revenue YoY Growth',
        category: 'Growth',
        companyValue: 25.4,
        bottomQuartile: 12.0,
        industryMedian: 18.2,
        topQuartile: 28.5,
        industryLeader: 42.0,
        unit: '%',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 7.2,
        percentileRank: 72,
        strategicImplication: 'Top-line expansion outpaces the sector median by 720 bps, confirming strong market share capture in enterprise accounts.',
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin (EBIT)',
        category: 'Profitability',
        companyValue: 10.0,
        bottomQuartile: 4.5,
        industryMedian: 14.8,
        topQuartile: 22.0,
        industryLeader: 31.0,
        unit: '%',
        higherIsBetter: true,
        status: 'Underperforming',
        variancePct: -4.8,
        percentileRank: 36,
        strategicImplication: 'Heavy R&D expenditures (27% of revenue) depress current EBIT margin relative to mature peers.',
      },
      {
        key: 'fcfConversion',
        name: 'FCF Conversion (% of Net Income)',
        category: 'Efficiency',
        companyValue: 92.4,
        bottomQuartile: 65.0,
        industryMedian: 88.0,
        topQuartile: 110.0,
        industryLeader: 135.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: 4.4,
        percentileRank: 58,
        strategicImplication: 'Cash collection velocity converts GAAP net profit into liquid operational reserves with minimal capital leakage.',
      },
      {
        key: 'currentRatio',
        name: 'Current Ratio (Liquidity)',
        category: 'Liquidity',
        companyValue: 2.1,
        bottomQuartile: 1.4,
        industryMedian: 1.85,
        topQuartile: 2.6,
        industryLeader: 3.8,
        unit: 'x',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 0.25,
        percentileRank: 65,
        strategicImplication: 'Robust balance sheet buffer supports 18+ months of runway without secondary equity dilution.',
      },
      {
        key: 'debtToEquity',
        name: 'Debt-to-Equity Leverage',
        category: 'Solvency',
        companyValue: 0.86,
        bottomQuartile: 1.15,
        industryMedian: 0.65,
        topQuartile: 0.35,
        industryLeader: 0.10,
        unit: 'x',
        higherIsBetter: false,
        status: 'Underperforming',
        variancePct: 0.21,
        percentileRank: 38,
        strategicImplication: 'Convertible debt load exceeds the SaaS industry median of 0.65x, requiring attentive interest coverage management.',
      },
      {
        key: 'dso',
        name: 'Days Sales Outstanding (DSO)',
        category: 'Efficiency',
        companyValue: 64,
        bottomQuartile: 75,
        industryMedian: 52,
        topQuartile: 42,
        industryLeader: 32,
        unit: 'days',
        higherIsBetter: false,
        status: 'Underperforming',
        variancePct: 12,
        percentileRank: 32,
        strategicImplication: 'Receivables collection takes 12 days longer than peer median, trapping approximately $2.8M in working capital.',
      },
    ],
    peers: [
      {
        id: 'peer-saas-cloudsphere',
        name: 'CloudSphere Global Inc.',
        ticker: 'CSG',
        marketCap: 2400000000,
        marketCapFormatted: '$2.40B',
        description: 'Multi-tenant cloud management & enterprise observability platform.',
        metrics: {
          grossProfitMargin: 74.2,
          revenueGrowthYoY: 19.8,
          operatingMargin: 16.5,
          fcfConversion: 95.0,
          currentRatio: 2.45,
          debtToEquity: 0.42,
          dso: 46,
        },
      },
      {
        id: 'peer-saas-dataflow',
        name: 'DataFlow Systems Corp.',
        ticker: 'DFLOW',
        marketCap: 1150000000,
        marketCapFormatted: '$1.15B',
        description: 'Real-time event streaming and data orchestration engine.',
        metrics: {
          grossProfitMargin: 61.0,
          revenueGrowthYoY: 34.2,
          operatingMargin: -4.2,
          fcfConversion: 45.0,
          currentRatio: 1.65,
          debtToEquity: 1.15,
          dso: 72,
        },
      },
      {
        id: 'peer-saas-novascale',
        name: 'NovaScale AI AG',
        ticker: 'NOVA',
        marketCap: 1950000000,
        marketCapFormatted: '$1.95B',
        description: 'European enterprise AI inference API and model fine-tuning suite.',
        metrics: {
          grossProfitMargin: 69.5,
          revenueGrowthYoY: 22.0,
          operatingMargin: 12.4,
          fcfConversion: 88.0,
          currentRatio: 1.95,
          debtToEquity: 0.68,
          dso: 54,
        },
      },
      {
        id: 'peer-saas-aether',
        name: 'AetherMetrics Cloud',
        ticker: 'AMTR',
        marketCap: 3100000000,
        marketCapFormatted: '$3.10B',
        description: 'High-margin B2B customer intelligence and telemetry analytics.',
        metrics: {
          grossProfitMargin: 78.5,
          revenueGrowthYoY: 28.4,
          operatingMargin: 21.0,
          fcfConversion: 112.0,
          currentRatio: 2.80,
          debtToEquity: 0.28,
          dso: 38,
        },
      },
      {
        id: 'peer-saas-omnivector',
        name: 'OmniVector Cloud Inc.',
        ticker: 'OVEC',
        marketCap: 1400000000,
        marketCapFormatted: '$1.40B',
        description: 'Vector database infrastructure and semantic search backend.',
        metrics: {
          grossProfitMargin: 65.5,
          revenueGrowthYoY: 15.5,
          operatingMargin: 7.8,
          fcfConversion: 74.0,
          currentRatio: 1.70,
          debtToEquity: 0.88,
          dso: 62,
        },
      },
      {
        id: 'peer-saas-hypertensor',
        name: 'HyperTensor Systems',
        ticker: 'HTSR',
        marketCap: 2750000000,
        marketCapFormatted: '$2.75B',
        description: 'Distributed GPU training acceleration for deep learning workloads.',
        metrics: {
          grossProfitMargin: 72.8,
          revenueGrowthYoY: 25.0,
          operatingMargin: 17.5,
          fcfConversion: 104.0,
          currentRatio: 2.25,
          debtToEquity: 0.52,
          dso: 48,
        },
      },
    ],
  },
  {
    id: 'peer-industrial-logistics',
    name: 'Industrial Freight & Global Supply Chain',
    code: 'INDUSTRIAL_LOGISTICS',
    description: 'Maritime freight forwarders, fleet operators, and multimodal supply chain network managers.',
    sampleCompaniesCount: 36,
    medianMarketCap: '$4.20B',
    macroRiskFactors: ['Bunker Fuel Price Volatility', 'Geopolitical Canal Surcharges', 'Fleet Debt Refinancing'],
    metrics: [
      {
        key: 'grossProfitMargin',
        name: 'Gross Logistics Margin',
        category: 'Profitability',
        companyValue: 26.0,
        bottomQuartile: 19.5,
        industryMedian: 27.5,
        topQuartile: 34.0,
        industryLeader: 40.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: -1.5,
        percentileRank: 46,
        strategicImplication: 'Fleet fuel hedging insulated margins against extreme short-term bunker price surges.',
      },
      {
        key: 'revenueGrowthYoY',
        name: 'Revenue YoY Growth',
        category: 'Growth',
        companyValue: 4.4,
        bottomQuartile: -3.0,
        industryMedian: 3.8,
        topQuartile: 8.5,
        industryLeader: 14.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: 0.6,
        percentileRank: 54,
        strategicImplication: 'Freight volumes normalized post-pandemic in tandem with broader global trade benchmarks.',
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin (EBIT)',
        category: 'Profitability',
        companyValue: 10.7,
        bottomQuartile: 6.0,
        industryMedian: 11.5,
        topQuartile: 16.2,
        industryLeader: 21.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: -0.8,
        percentileRank: 48,
        strategicImplication: 'Cost control in terminal handling offset minor rate softening across major ocean corridors.',
      },
      {
        key: 'debtToEquity',
        name: 'Debt-to-Equity Leverage',
        category: 'Solvency',
        companyValue: 1.22,
        bottomQuartile: 1.65,
        industryMedian: 0.95,
        topQuartile: 0.60,
        industryLeader: 0.35,
        unit: 'x',
        higherIsBetter: false,
        status: 'Underperforming',
        variancePct: 0.27,
        percentileRank: 34,
        strategicImplication: 'Asset-heavy fleet financing increases sensitivity to benchmark lending rate movements.',
      },
      {
        key: 'currentRatio',
        name: 'Current Ratio (Liquidity)',
        category: 'Liquidity',
        companyValue: 1.11,
        bottomQuartile: 1.05,
        industryMedian: 1.35,
        topQuartile: 1.70,
        industryLeader: 2.20,
        unit: 'x',
        higherIsBetter: true,
        status: 'Underperforming',
        variancePct: -0.24,
        percentileRank: 28,
        strategicImplication: 'Working capital cushion is tight, warranting an expansion of standby revolving credit facilities.',
      },
      {
        key: 'dso',
        name: 'Days Sales Outstanding (DSO)',
        category: 'Efficiency',
        companyValue: 56,
        bottomQuartile: 68,
        industryMedian: 50,
        topQuartile: 38,
        industryLeader: 28,
        unit: 'days',
        higherIsBetter: false,
        status: 'In-Line',
        variancePct: 6,
        percentileRank: 44,
        strategicImplication: 'Standard commercial freight billing cycles aligned with international maritime customs norms.',
      },
    ],
    peers: [
      {
        id: 'peer-log-pacific',
        name: 'Pacific Maritime Express Ltd.',
        ticker: 'PMX',
        marketCap: 3800000000,
        marketCapFormatted: '$3.80B',
        description: 'Transpacific container route operator with modern dual-fuel vessel fleet.',
        metrics: {
          grossProfitMargin: 29.5,
          revenueGrowthYoY: 7.2,
          operatingMargin: 13.8,
          fcfConversion: 82.0,
          currentRatio: 1.45,
          debtToEquity: 0.85,
          dso: 48,
        },
      },
      {
        id: 'peer-log-nordic',
        name: 'Nordic Intermodal Transport AB',
        ticker: 'NIT',
        marketCap: 2100000000,
        marketCapFormatted: '$2.10B',
        description: 'Specialized cold-chain pharma logistics and European rail-freight corridors.',
        metrics: {
          grossProfitMargin: 24.5,
          revenueGrowthYoY: 2.1,
          operatingMargin: 8.5,
          fcfConversion: 62.0,
          currentRatio: 1.05,
          debtToEquity: 1.45,
          dso: 62,
        },
      },
      {
        id: 'peer-log-apexcont',
        name: 'Apex Continental Freight',
        ticker: 'ACF',
        marketCap: 4500000000,
        marketCapFormatted: '$4.50B',
        description: 'Pan-American intermodal trucking and automated distribution hubs.',
        metrics: {
          grossProfitMargin: 32.0,
          revenueGrowthYoY: 9.5,
          operatingMargin: 15.2,
          fcfConversion: 94.0,
          currentRatio: 1.65,
          debtToEquity: 0.72,
          dso: 42,
        },
      },
      {
        id: 'peer-log-cargolink',
        name: 'Global CargoLink Hubs',
        ticker: 'GCLH',
        marketCap: 1800000000,
        marketCapFormatted: '$1.80B',
        description: 'Airport bonded logistics gateways and cross-border freight forwarding.',
        metrics: {
          grossProfitMargin: 22.0,
          revenueGrowthYoY: -1.5,
          operatingMargin: 6.2,
          fcfConversion: 55.0,
          currentRatio: 0.95,
          debtToEquity: 1.65,
          dso: 68,
        },
      },
      {
        id: 'peer-log-aerotrans',
        name: 'AeroTrans Worldwide Corp.',
        ticker: 'ATW',
        marketCap: 5200000000,
        marketCapFormatted: '$5.20B',
        description: 'Dedicated air cargo fleet and high-value express payload transport.',
        metrics: {
          grossProfitMargin: 34.5,
          revenueGrowthYoY: 11.2,
          operatingMargin: 17.0,
          fcfConversion: 105.0,
          currentRatio: 1.85,
          debtToEquity: 0.60,
          dso: 38,
        },
      },
    ],
  },
  {
    id: 'peer-biotech-pharma',
    name: 'Biotechnology & Commercial Therapeutics',
    code: 'BIOTECH_PHARMA',
    description: 'Commercializing biopharmaceutical innovators with approved therapeutics and clinical pipeline programs.',
    sampleCompaniesCount: 29,
    medianMarketCap: '$2.45B',
    macroRiskFactors: ['Regulatory Approval Timelines', 'Patent Expiration Cliffs', 'Payer Reimbursement Pricing'],
    metrics: [
      {
        key: 'grossProfitMargin',
        name: 'Gross Profit Margin',
        category: 'Profitability',
        companyValue: 82.5,
        bottomQuartile: 74.0,
        industryMedian: 84.0,
        topQuartile: 89.5,
        industryLeader: 94.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: -1.5,
        percentileRank: 46,
        strategicImplication: 'Specialty biologic manufacturing yields superior unit gross margins in line with oncology benchmarks.',
      },
      {
        key: 'revenueGrowthYoY',
        name: 'Revenue YoY Growth',
        category: 'Growth',
        companyValue: 48.6,
        bottomQuartile: 15.0,
        industryMedian: 28.0,
        topQuartile: 52.0,
        industryLeader: 75.0,
        unit: '%',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 20.6,
        percentileRank: 74,
        strategicImplication: 'Commercial launch curve is ramping ahead of typical European biopharma adoption curves.',
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin (EBIT)',
        category: 'Profitability',
        companyValue: 12.8,
        bottomQuartile: -15.0,
        industryMedian: 8.5,
        topQuartile: 24.0,
        industryLeader: 38.0,
        unit: '%',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 4.3,
        percentileRank: 62,
        strategicImplication: 'Achieved operating breakeven significantly faster than typical development-stage biotechs.',
      },
      {
        key: 'currentRatio',
        name: 'Current Ratio (Liquidity)',
        category: 'Liquidity',
        companyValue: 4.2,
        bottomQuartile: 2.1,
        industryMedian: 3.5,
        topQuartile: 5.2,
        industryLeader: 7.8,
        unit: 'x',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 0.7,
        percentileRank: 68,
        strategicImplication: 'Cash treasury provides over 36 months of unassisted R&D operational autonomy.',
      },
      {
        key: 'debtToEquity',
        name: 'Debt-to-Equity Leverage',
        category: 'Solvency',
        companyValue: 0.18,
        bottomQuartile: 0.65,
        industryMedian: 0.30,
        topQuartile: 0.12,
        industryLeader: 0.02,
        unit: 'x',
        higherIsBetter: false,
        status: 'Outperforming',
        variancePct: -0.12,
        percentileRank: 78,
        strategicImplication: 'Virtually debt-free capital structure provides exceptional strategic flexibility for M&A.',
      },
      {
        key: 'dso',
        name: 'Days Sales Outstanding (DSO)',
        category: 'Efficiency',
        companyValue: 48,
        bottomQuartile: 72,
        industryMedian: 55,
        topQuartile: 40,
        industryLeader: 30,
        unit: 'days',
        higherIsBetter: false,
        status: 'Outperforming',
        variancePct: -7,
        percentileRank: 64,
        strategicImplication: 'Hospital procurement payment turnaround is prompt across core distributor networks.',
      },
    ],
    peers: [
      {
        id: 'peer-bio-genetech',
        name: 'GeneTech Innovations Inc.',
        ticker: 'GNTX',
        marketCap: 4500000000,
        marketCapFormatted: '$4.50B',
        description: 'FDA approved blockbuster oncology therapy with pristine balance sheet ($110M cash).',
        metrics: {
          grossProfitMargin: 86.5,
          revenueGrowthYoY: 38.5,
          operatingMargin: 18.2,
          fcfConversion: 96.0,
          currentRatio: 4.85,
          debtToEquity: 0.12,
          dso: 42,
        },
      },
      {
        id: 'peer-bio-nexal',
        name: 'Nexal Therapeutics NV',
        ticker: 'NXTL',
        marketCap: 3100000000,
        marketCapFormatted: '$3.10B',
        description: 'Commercializing rare disease biologics and targeted enzyme replacement therapies.',
        metrics: {
          grossProfitMargin: 82.0,
          revenueGrowthYoY: 24.0,
          operatingMargin: 12.5,
          fcfConversion: 80.0,
          currentRatio: 3.90,
          debtToEquity: 0.22,
          dso: 48,
        },
      },
      {
        id: 'peer-bio-vector',
        name: 'BioVector Diagnostics',
        ticker: 'BVD',
        marketCap: 2200000000,
        marketCapFormatted: '$2.20B',
        description: 'Genomic biomarker testing assays and companion diagnostic kits.',
        metrics: {
          grossProfitMargin: 76.5,
          revenueGrowthYoY: 14.5,
          operatingMargin: 4.5,
          fcfConversion: 65.0,
          currentRatio: 2.85,
          debtToEquity: 0.45,
          dso: 56,
        },
      },
      {
        id: 'peer-bio-immunocell',
        name: 'ImmunoCell Therapeutics',
        ticker: 'ICTX',
        marketCap: 1600000000,
        marketCapFormatted: '$1.60B',
        description: 'Autologous cell therapy pipeline with high R&D reinvestment velocity.',
        metrics: {
          grossProfitMargin: 71.0,
          revenueGrowthYoY: 8.0,
          operatingMargin: -8.5,
          fcfConversion: 35.0,
          currentRatio: 2.10,
          debtToEquity: 0.75,
          dso: 65,
        },
      },
      {
        id: 'peer-bio-curative',
        name: 'Curative BioSciences Corp.',
        ticker: 'CBIO',
        marketCap: 5800000000,
        marketCapFormatted: '$5.80B',
        description: 'Late-stage immunology franchise with international distribution partnerships.',
        metrics: {
          grossProfitMargin: 89.0,
          revenueGrowthYoY: 42.0,
          operatingMargin: 24.0,
          fcfConversion: 115.0,
          currentRatio: 5.50,
          debtToEquity: 0.08,
          dso: 35,
        },
      },
    ],
  },
  {
    id: 'peer-fintech-digital',
    name: 'Fintech & Digital Financial Services',
    code: 'FINTECH_SERVICES',
    description: 'Payment processors, neo-banking infrastructure, algorithmic wealth platforms, and credit underwriting.',
    sampleCompaniesCount: 42,
    medianMarketCap: '$3.10B',
    macroRiskFactors: ['Net Interest Margin Compression', 'Regulatory AML Compliance Costs', 'Credit Default Provisions'],
    metrics: [
      {
        key: 'grossProfitMargin',
        name: 'Net Take Rate Margin',
        category: 'Profitability',
        companyValue: 58.0,
        bottomQuartile: 45.0,
        industryMedian: 56.0,
        topQuartile: 66.0,
        industryLeader: 75.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: 2.0,
        percentileRank: 56,
        strategicImplication: 'Payment interchange and value-added software fees generate solid blended margins.',
      },
      {
        key: 'revenueGrowthYoY',
        name: 'Revenue YoY Growth',
        category: 'Growth',
        companyValue: 32.0,
        bottomQuartile: 14.0,
        industryMedian: 22.5,
        topQuartile: 36.0,
        industryLeader: 52.0,
        unit: '%',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 9.5,
        percentileRank: 70,
        strategicImplication: 'Payment volume expansion across high-ticket B2B invoices drives rapid volume monetization.',
      },
      {
        key: 'operatingMargin',
        name: 'Operating Margin (EBIT)',
        category: 'Profitability',
        companyValue: 16.5,
        bottomQuartile: 8.0,
        industryMedian: 18.0,
        topQuartile: 26.0,
        industryLeader: 34.0,
        unit: '%',
        higherIsBetter: true,
        status: 'In-Line',
        variancePct: -1.5,
        percentileRank: 48,
        strategicImplication: 'Higher regulatory compliance and fraud prevention staffing costs weigh on operational leverage.',
      },
      {
        key: 'currentRatio',
        name: 'Current Ratio (Liquidity)',
        category: 'Liquidity',
        companyValue: 1.95,
        bottomQuartile: 1.25,
        industryMedian: 1.70,
        topQuartile: 2.30,
        industryLeader: 3.20,
        unit: 'x',
        higherIsBetter: true,
        status: 'Outperforming',
        variancePct: 0.25,
        percentileRank: 62,
        strategicImplication: 'Sufficient liquid capital reserves comfortably exceed regulatory capital adequacy ratios.',
      },
      {
        key: 'debtToEquity',
        name: 'Debt-to-Equity Leverage',
        category: 'Solvency',
        companyValue: 0.52,
        bottomQuartile: 0.95,
        industryMedian: 0.58,
        topQuartile: 0.32,
        industryLeader: 0.12,
        unit: 'x',
        higherIsBetter: false,
        status: 'In-Line',
        variancePct: -0.06,
        percentileRank: 58,
        strategicImplication: 'Conservative credit facility utilization maintains low default risk.',
      },
      {
        key: 'dso',
        name: 'Days Sales Outstanding (DSO)',
        category: 'Efficiency',
        companyValue: 24,
        bottomQuartile: 45,
        industryMedian: 30,
        topQuartile: 18,
        industryLeader: 10,
        unit: 'days',
        higherIsBetter: false,
        status: 'Outperforming',
        variancePct: -6,
        percentileRank: 66,
        strategicImplication: 'Real-time card and ACH network settlements ensure rapid working capital cycles.',
      },
    ],
    peers: [
      {
        id: 'peer-fin-stellar',
        name: 'StellarPay Systems Inc.',
        ticker: 'SPAY',
        marketCap: 6400000000,
        marketCapFormatted: '$6.40B',
        description: 'Cross-border digital settlement gateway and multi-currency merchant processor.',
        metrics: {
          grossProfitMargin: 62.0,
          revenueGrowthYoY: 26.5,
          operatingMargin: 21.0,
          fcfConversion: 108.0,
          currentRatio: 1.95,
          debtToEquity: 0.35,
          dso: 18,
        },
      },
      {
        id: 'peer-fin-omniledger',
        name: 'OmniLedger FinTech',
        ticker: 'OLEDG',
        marketCap: 3200000000,
        marketCapFormatted: '$3.20B',
        description: 'Cloud native core banking rails and automated reconciliation ledger.',
        metrics: {
          grossProfitMargin: 54.0,
          revenueGrowthYoY: 18.2,
          operatingMargin: 14.5,
          fcfConversion: 92.0,
          currentRatio: 1.65,
          debtToEquity: 0.58,
          dso: 26,
        },
      },
      {
        id: 'peer-fin-advancash',
        name: 'AdvanCash Global Corp.',
        ticker: 'ADVC',
        marketCap: 4800000000,
        marketCapFormatted: '$4.80B',
        description: 'B2B working capital financing and embedded commercial card issuance.',
        metrics: {
          grossProfitMargin: 58.5,
          revenueGrowthYoY: 22.0,
          operatingMargin: 17.5,
          fcfConversion: 102.0,
          currentRatio: 1.80,
          debtToEquity: 0.45,
          dso: 22,
        },
      },
      {
        id: 'peer-fin-transact',
        name: 'TransactFlow Corp.',
        ticker: 'TFLO',
        marketCap: 2100000000,
        marketCapFormatted: '$2.10B',
        description: 'Mobile POS terminals and micropayment switching infrastructure.',
        metrics: {
          grossProfitMargin: 48.0,
          revenueGrowthYoY: 12.0,
          operatingMargin: 8.5,
          fcfConversion: 76.0,
          currentRatio: 1.40,
          debtToEquity: 0.85,
          dso: 34,
        },
      },
      {
        id: 'peer-fin-finvantage',
        name: 'FinVantage Networks Inc.',
        ticker: 'FVTG',
        marketCap: 7500000000,
        marketCapFormatted: '$7.50B',
        description: 'Institutional treasury payments and algorithmic foreign exchange liquidity.',
        metrics: {
          grossProfitMargin: 65.5,
          revenueGrowthYoY: 31.0,
          operatingMargin: 25.5,
          fcfConversion: 120.0,
          currentRatio: 2.20,
          debtToEquity: 0.25,
          dso: 14,
        },
      },
    ],
  },
];

export const BENCHMARK_SETTINGS_STORAGE_PREFIX = 'fininsight_benchmark_settings_';

export function getDefaultBenchmarkSettings(peerGroup: IndustryPeerGroup): BenchmarkSettings {
  const peers = peerGroup.peers || [];
  const defaultSelected = peers.map((p) => p.id);
  const defaultCustomWeights: Record<string, number> = {};
  peers.forEach((p) => {
    defaultCustomWeights[p.id] = Math.round(100 / (peers.length || 1));
  });

  return {
    selectedPeerIds: defaultSelected,
    weightingMethod: 'market_cap',
    customWeights: defaultCustomWeights,
    categoryWeights: {
      profitability: 35,
      growth: 25,
      liquidity: 20,
      efficiency: 20,
    },
  };
}

export function getStoredBenchmarkSettings(groupId: string, peerGroup: IndustryPeerGroup): BenchmarkSettings {
  const defaults = getDefaultBenchmarkSettings(peerGroup);
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(`${BENCHMARK_SETTINGS_STORAGE_PREFIX}${groupId}`);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.selectedPeerIds)) return defaults;

    const peers = peerGroup.peers || [];
    const validPeers = parsed.selectedPeerIds.filter((id: string) => peers.some((p) => p.id === id));
    return {
      selectedPeerIds: validPeers.length > 0 ? validPeers : defaults.selectedPeerIds,
      weightingMethod: ['market_cap', 'equal', 'custom'].includes(parsed.weightingMethod) ? parsed.weightingMethod : defaults.weightingMethod,
      customWeights: parsed.customWeights && typeof parsed.customWeights === 'object' ? { ...defaults.customWeights, ...parsed.customWeights } : defaults.customWeights,
      categoryWeights: parsed.categoryWeights && typeof parsed.categoryWeights === 'object' ? { ...defaults.categoryWeights, ...parsed.categoryWeights } : defaults.categoryWeights,
    };
  } catch {
    return defaults;
  }
}

export function saveBenchmarkSettings(groupId: string, settings: BenchmarkSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${BENCHMARK_SETTINGS_STORAGE_PREFIX}${groupId}`, JSON.stringify(settings));
  } catch {
    // Quota or storage handled
  }
}

export function resetBenchmarkSettings(groupId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${BENCHMARK_SETTINGS_STORAGE_PREFIX}${groupId}`);
  } catch {
    // Storage handled
  }
}

/**
 * Weighted quantile calculation with continuous linear interpolation
 */
function computeWeightedQuantile(items: { value: number; weight: number }[], p: number): number {
  if (items.length === 0) return 0;
  if (items.length === 1) return items[0].value;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return sorted[Math.floor(sorted.length * p)].value;

  const target = p * totalWeight;
  let cum = 0;
  for (let i = 0; i < sorted.length; i++) {
    cum += sorted[i].weight;
    if (cum >= target) {
      if (i > 0 && cum - sorted[i].weight < target) {
        const prevCum = cum - sorted[i].weight;
        const fraction = (target - prevCum) / (sorted[i].weight || 1);
        return Number((sorted[i - 1].value + fraction * (sorted[i].value - sorted[i - 1].value)).toFixed(1));
      }
      return Number(sorted[i].value.toFixed(1));
    }
  }
  return Number(sorted[sorted.length - 1].value.toFixed(1));
}

export interface EnhancedIndustryPeerGroup extends IndustryPeerGroup {
  activePeers: BenchmarkPeer[];
  effectiveWeights: Record<string, number>;
  compositePercentile: number;
  currentSettings: BenchmarkSettings;
}

/**
 * Match or generate benchmark comparison for dataset with dynamic peer selection and weighting
 */
export function getIndustryBenchmarkForDataset(
  dataset: FinancialDataset,
  ratios: FinancialRatios,
  selectedPeerGroupId?: string,
  settings?: BenchmarkSettings
): EnhancedIndustryPeerGroup {
  let peerGroup = INDUSTRY_PEER_GROUPS.find((g) => g.id === selectedPeerGroupId);
  
  if (!peerGroup) {
    if (dataset.industry.toLowerCase().includes('logistics') || dataset.industry.toLowerCase().includes('freight')) {
      peerGroup = INDUSTRY_PEER_GROUPS[1];
    } else if (dataset.industry.toLowerCase().includes('bio') || dataset.industry.toLowerCase().includes('pharma')) {
      peerGroup = INDUSTRY_PEER_GROUPS[2];
    } else if (dataset.industry.toLowerCase().includes('fintech') || dataset.industry.toLowerCase().includes('finance')) {
      peerGroup = INDUSTRY_PEER_GROUPS[3];
    } else {
      peerGroup = INDUSTRY_PEER_GROUPS[0];
    }
  }

  const allPeers = peerGroup.peers || [];
  const activeSettings = settings || getStoredBenchmarkSettings(peerGroup.id, peerGroup);
  
  // Filter active peers
  let activePeers = allPeers.filter((p) => activeSettings.selectedPeerIds.includes(p.id));
  if (activePeers.length === 0) {
    activePeers = allPeers;
  }

  // Calculate peer weights based on chosen algorithm
  const effectiveWeights: Record<string, number> = {};
  if (activeSettings.weightingMethod === 'market_cap') {
    const totalCap = activePeers.reduce((sum, p) => sum + p.marketCap, 0) || 1;
    activePeers.forEach((p) => {
      effectiveWeights[p.id] = p.marketCap / totalCap;
    });
  } else if (activeSettings.weightingMethod === 'equal') {
    const w = 1 / (activePeers.length || 1);
    activePeers.forEach((p) => {
      effectiveWeights[p.id] = w;
    });
  } else {
    // Custom user sliders
    const totalCustom = activePeers.reduce((sum, p) => sum + (activeSettings.customWeights[p.id] ?? 10), 0) || 1;
    activePeers.forEach((p) => {
      effectiveWeights[p.id] = (activeSettings.customWeights[p.id] ?? 10) / totalCustom;
    });
  }

  // Calculate dynamic median market cap of active peer cohort
  const sortedCaps = [...activePeers].sort((a, b) => a.marketCap - b.marketCap);
  const midIndex = Math.floor(sortedCaps.length / 2);
  const activeMedianCap = sortedCaps[midIndex] ? sortedCaps[midIndex].marketCapFormatted : peerGroup.medianMarketCap;

  // Dynamically attach the analyzed company's actual ratio values & recompute against peer group
  const updatedMetrics = peerGroup.metrics.map((m) => {
    let companyVal = m.companyValue;
    if (m.key === 'grossProfitMargin') companyVal = ratios.grossProfitMargin;
    else if (m.key === 'revenueGrowthYoY') companyVal = ratios.revenueGrowthYoY;
    else if (m.key === 'operatingMargin') companyVal = ratios.operatingMargin;
    else if (m.key === 'fcfConversion') companyVal = ratios.fcfConversion;
    else if (m.key === 'currentRatio') companyVal = ratios.currentRatio;
    else if (m.key === 'debtToEquity') companyVal = ratios.debtToEquity;

    let bottomQuartile = m.bottomQuartile;
    let industryMedian = m.industryMedian;
    let topQuartile = m.topQuartile;
    let industryLeader = m.industryLeader;

    if (activePeers.length > 0) {
      const metricKey = m.key as keyof BenchmarkPeer['metrics'];
      const peerDataPoints = activePeers.map((p) => ({
        value: p.metrics[metricKey] !== undefined ? p.metrics[metricKey] : m.industryMedian,
        weight: effectiveWeights[p.id] ?? (1 / activePeers.length),
      }));

      // Calculate weighted distribution percentiles
      if (m.higherIsBetter) {
        bottomQuartile = computeWeightedQuantile(peerDataPoints, 0.25);
        industryMedian = computeWeightedQuantile(peerDataPoints, 0.50);
        topQuartile = computeWeightedQuantile(peerDataPoints, 0.75);
        industryLeader = computeWeightedQuantile(peerDataPoints, 0.90);
      } else {
        // Lower is better (e.g. debtToEquity, dso)
        bottomQuartile = computeWeightedQuantile(peerDataPoints, 0.75);
        industryMedian = computeWeightedQuantile(peerDataPoints, 0.50);
        topQuartile = computeWeightedQuantile(peerDataPoints, 0.25);
        industryLeader = computeWeightedQuantile(peerDataPoints, 0.10);
      }
    }

    const diff = companyVal - industryMedian;
    let status: BenchmarkMetricDetail['status'] = 'In-Line';
    if (m.higherIsBetter) {
      if (companyVal >= topQuartile) status = 'Outperforming';
      else if (companyVal < bottomQuartile) status = 'Critical Lag';
      else if (diff < -3.0) status = 'Underperforming';
    } else {
      if (companyVal <= topQuartile) status = 'Outperforming';
      else if (companyVal > bottomQuartile) status = 'Critical Lag';
      else if (diff > 0.15) status = 'Underperforming';
    }

    // Percentile rank estimation
    let rank = 50;
    if (m.higherIsBetter) {
      if (companyVal >= industryLeader) rank = 95;
      else if (companyVal >= topQuartile) rank = 75 + ((companyVal - topQuartile) / (industryLeader - topQuartile || 1)) * 20;
      else if (companyVal >= industryMedian) rank = 50 + ((companyVal - industryMedian) / (topQuartile - industryMedian || 1)) * 25;
      else if (companyVal >= bottomQuartile) rank = 25 + ((companyVal - bottomQuartile) / (industryMedian - bottomQuartile || 1)) * 25;
      else rank = Math.max(5, (companyVal / (bottomQuartile || 1)) * 25);
    } else {
      if (companyVal <= industryLeader) rank = 95;
      else if (companyVal <= topQuartile) rank = 75 + ((topQuartile - companyVal) / (topQuartile - industryLeader || 1)) * 20;
      else if (companyVal <= industryMedian) rank = 50 + ((industryMedian - companyVal) / (industryMedian - topQuartile || 1)) * 25;
      else rank = Math.max(10, 50 - ((companyVal - industryMedian) / (bottomQuartile - industryMedian || 1)) * 35);
    }

    return {
      ...m,
      bottomQuartile,
      industryMedian,
      topQuartile,
      industryLeader,
      companyValue: Number(companyVal.toFixed(1)),
      variancePct: Number(diff.toFixed(1)),
      percentileRank: Math.min(99, Math.max(1, Math.round(rank))),
      status,
    };
  });

  // Category weighted composite percentile
  const catWeights = activeSettings.categoryWeights || { profitability: 35, growth: 25, liquidity: 20, efficiency: 20 };
  let totalScoreWeight = 0;
  let weightedScoreSum = 0;

  updatedMetrics.forEach((m) => {
    let catW = 20;
    if (m.category === 'Profitability') catW = catWeights.profitability;
    else if (m.category === 'Growth') catW = catWeights.growth;
    else if (m.category === 'Liquidity' || m.category === 'Solvency') catW = catWeights.liquidity;
    else if (m.category === 'Efficiency') catW = catWeights.efficiency;

    totalScoreWeight += catW;
    weightedScoreSum += m.percentileRank * catW;
  });

  const compositePercentile = Math.round(weightedScoreSum / (totalScoreWeight || 1));

  return {
    ...peerGroup,
    sampleCompaniesCount: activePeers.length,
    medianMarketCap: activeMedianCap,
    metrics: updatedMetrics,
    peers: allPeers,
    activePeers,
    effectiveWeights,
    compositePercentile,
    currentSettings: activeSettings,
  };
}

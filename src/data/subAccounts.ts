export interface ConstituentSubAccount {
  id: string;
  code: string; // e.g. "GL-1010", "US-GAAP 210"
  name: string;
  shareOfParent: number; // Decimal (e.g. 0.42 for 42%)
  description: string;
  status: 'Safe' | 'Warning' | 'Critical' | 'Neutral';
  colorHex?: string;
  colorNumeric?: number;
  varianceYoY?: number;
}

export interface ConsolidatedNodeConfig {
  key: string;
  displayName: string;
  statement: 'Balance Sheet' | 'Income Statement' | 'Cash Flow' | 'DuPont Decomposition';
  category: string;
  subAccounts: ConstituentSubAccount[];
}

export const CONSOLIDATED_SUB_ACCOUNTS_MAP: Record<string, ConsolidatedNodeConfig> = {
  // ASSET NODES
  'Cash & Equivalents': {
    key: 'Cash & Equivalents',
    displayName: 'Cash and Cash Equivalents',
    statement: 'Balance Sheet',
    category: 'Current Assets',
    subAccounts: [
      {
        id: 'cash-oper',
        code: 'GL-1010',
        name: 'Operating Checking & Sweeps',
        shareOfParent: 0.42,
        description: 'Demand deposits and daily operational sweep accounts held across top-tier correspondent institutions.',
        status: 'Safe',
        colorNumeric: 0x34d399,
        varianceYoY: 14.2,
      },
      {
        id: 'cash-tbills',
        code: 'GL-1020',
        name: 'U.S. Treasury Bills (<90 Days)',
        shareOfParent: 0.35,
        description: 'Ultra-liquid sovereign debt bills yielding annualized benchmark risk-free interest.',
        status: 'Safe',
        colorNumeric: 0x10b981,
        varianceYoY: 22.8,
      },
      {
        id: 'cash-mmf',
        code: 'GL-1030',
        name: 'Institutional Money Market Funds',
        shareOfParent: 0.18,
        description: 'Prime AAA-rated institutional liquidity funds with daily NAV stability.',
        status: 'Safe',
        colorNumeric: 0x059669,
        varianceYoY: 8.5,
      },
      {
        id: 'cash-restricted',
        code: 'GL-1040',
        name: 'Restricted Collateral Escrow',
        shareOfParent: 0.05,
        description: 'Pledged surety bonds and escrow retention deposits supporting multi-year vendor covenants.',
        status: 'Neutral',
        colorNumeric: 0x6ee7b7,
        varianceYoY: -2.1,
      },
    ],
  },

  'Accounts Receivable': {
    key: 'Accounts Receivable',
    displayName: 'Accounts Receivable (Net)',
    statement: 'Balance Sheet',
    category: 'Current Assets',
    subAccounts: [
      {
        id: 'ar-enterprise',
        code: 'GL-1110',
        name: 'Enterprise Commercial Contracts',
        shareOfParent: 0.56,
        description: 'Billed trade receivables from Fortune 500 recurring software clients.',
        status: 'Safe',
        colorNumeric: 0x60a5fa,
        varianceYoY: 18.4,
      },
      {
        id: 'ar-govt',
        code: 'GL-1120',
        name: 'Federal & Public Sector Billing',
        shareOfParent: 0.26,
        description: 'Firm fixed-price receivables subject to quarterly government payment schedules.',
        status: 'Safe',
        colorNumeric: 0x3b82f6,
        varianceYoY: 25.0,
      },
      {
        id: 'ar-wip',
        code: 'GL-1130',
        name: 'Unbilled Milestone WIP & Retainage',
        shareOfParent: 0.23,
        description: 'Contract assets recognized under ASC 606 revenue progression awaiting client milestone sign-off.',
        status: 'Warning',
        colorNumeric: 0xf59e0b,
        varianceYoY: 42.1,
      },
      {
        id: 'ar-allowance',
        code: 'GL-1190',
        name: 'Less: CECL Credit Loss Allowance',
        shareOfParent: -0.05,
        description: 'Contra-asset reserve for expected credit losses modeled under historical default distributions.',
        status: 'Critical',
        colorNumeric: 0xf43f5e,
        varianceYoY: 15.0,
      },
    ],
  },

  'Inventories & Supplies': {
    key: 'Inventories & Supplies',
    displayName: 'Inventories & Operating Supplies',
    statement: 'Balance Sheet',
    category: 'Current Assets',
    subAccounts: [
      {
        id: 'inv-finished',
        code: 'GL-1210',
        name: 'Finished Hardware in Regional 3PL Hubs',
        shareOfParent: 0.45,
        description: 'Pre-packaged AI edge servers and appliances staged for immediate freight delivery.',
        status: 'Safe',
        colorNumeric: 0x38bdf8,
        varianceYoY: 12.0,
      },
      {
        id: 'inv-wip',
        code: 'GL-1220',
        name: 'Work-in-Progress (WIP) Assemblies',
        shareOfParent: 0.28,
        description: 'Server rack assemblies currently progressing through final automated burn-in tests.',
        status: 'Safe',
        colorNumeric: 0x0284c7,
        varianceYoY: -4.5,
      },
      {
        id: 'inv-raw',
        code: 'GL-1230',
        name: 'Raw Components & Silicon Wafers',
        shareOfParent: 0.22,
        description: 'Bulk procured silicon wafers, power distribution units, and memory chips.',
        status: 'Neutral',
        colorNumeric: 0x0369a1,
        varianceYoY: 30.5,
      },
      {
        id: 'inv-spares',
        code: 'GL-1240',
        name: 'Maintenance Spares & Consumables',
        shareOfParent: 0.05,
        description: 'Replacement cabling, fans, and server sleds for facility operational uptime.',
        status: 'Safe',
        colorNumeric: 0x7dd3fc,
        varianceYoY: 0.0,
      },
    ],
  },

  'Property, Plant & Equipment': {
    key: 'Property, Plant & Equipment',
    displayName: 'Property, Plant & Equipment (Net)',
    statement: 'Balance Sheet',
    category: 'Non-Current Assets',
    subAccounts: [
      {
        id: 'ppe-servers',
        code: 'GL-1510',
        name: 'Hyperscale GPU Cluster Servers',
        shareOfParent: 0.46,
        description: 'High-density computational clusters and enterprise storage blades deployed in tier-4 facilities.',
        status: 'Safe',
        colorNumeric: 0x818cf8,
        varianceYoY: 38.2,
      },
      {
        id: 'ppe-facilities',
        code: 'GL-1520',
        name: 'Owned Data Centers & Facilities',
        shareOfParent: 0.30,
        description: 'Freehold land, physical structures, cooling towers, and substation power feeds.',
        status: 'Safe',
        colorNumeric: 0x6366f1,
        varianceYoY: 10.1,
      },
      {
        id: 'ppe-hardware',
        code: 'GL-1530',
        name: 'Specialized Lab & QA Machinery',
        shareOfParent: 0.18,
        description: 'Electromagnetic testing benches, robotic thermal chambers, and automated validation rigs.',
        status: 'Neutral',
        colorNumeric: 0x4f46e5,
        varianceYoY: 6.4,
      },
      {
        id: 'ppe-improvements',
        code: 'GL-1540',
        name: 'Capitalized Leasehold Buildouts',
        shareOfParent: 0.06,
        description: 'Amortizable architectural buildouts across leased corporate administrative campuses.',
        status: 'Safe',
        colorNumeric: 0xa5b4fc,
        varianceYoY: 2.5,
      },
    ],
  },

  'Intangibles & Goodwill': {
    key: 'Intangibles & Goodwill',
    displayName: 'Intangibles & Goodwill',
    statement: 'Balance Sheet',
    category: 'Non-Current Assets',
    subAccounts: [
      {
        id: 'int-goodwill',
        code: 'GL-1710',
        name: 'Strategic Acquisition Goodwill',
        shareOfParent: 0.48,
        description: 'Residual purchase price premiums over identifiable net assets from prior M&A transactions.',
        status: 'Safe',
        colorNumeric: 0xa855f7,
        varianceYoY: 0.0,
      },
      {
        id: 'int-patents',
        code: 'GL-1720',
        name: 'Patents & Core IP Portfolio',
        shareOfParent: 0.28,
        description: 'Defensive patent portfolio covering neural distributed memory architectures and data pipelining.',
        status: 'Safe',
        colorNumeric: 0x9333ea,
        varianceYoY: 15.6,
      },
      {
        id: 'int-software',
        code: 'GL-1730',
        name: 'Capitalized Software (ASC 350-40)',
        shareOfParent: 0.16,
        description: 'Internal-use platform development and machine learning core engines amortized over 5-year useful lives.',
        status: 'Safe',
        colorNumeric: 0x7e22ce,
        varianceYoY: 24.0,
      },
      {
        id: 'int-customer',
        code: 'GL-1740',
        name: 'Acquired Enterprise Customer Books',
        shareOfParent: 0.08,
        description: 'Intangible contract relationships with enterprise multi-year subscription commitments.',
        status: 'Neutral',
        colorNumeric: 0xc084fc,
        varianceYoY: -12.0,
      },
    ],
  },

  // LIABILITY & EQUITY NODES
  'Current Liabilities': {
    key: 'Current Liabilities',
    displayName: 'Total Current Liabilities',
    statement: 'Balance Sheet',
    category: 'Current Liabilities',
    subAccounts: [
      {
        id: 'cl-ap',
        code: 'GL-2010',
        name: 'Trade Accounts Payable',
        shareOfParent: 0.42,
        description: 'Unpaid commercial invoices owed to cloud suppliers, hardware vendors, and legal counsel.',
        status: 'Warning',
        colorNumeric: 0xf43f5e,
        varianceYoY: 16.5,
      },
      {
        id: 'cl-payroll',
        code: 'GL-2020',
        name: 'Accrued Payroll & Benefits',
        shareOfParent: 0.25,
        description: 'Earned employee compensation, health insurance escrows, and annual bonus pools.',
        status: 'Safe',
        colorNumeric: 0xe11d48,
        varianceYoY: 11.2,
      },
      {
        id: 'cl-deferred',
        code: 'GL-2030',
        name: 'Deferred Enterprise Subscription Revenue',
        shareOfParent: 0.21,
        description: 'Upfront customer cash billings for multi-year software access recognized ratably over service term.',
        status: 'Safe',
        colorNumeric: 0xbe123c,
        varianceYoY: 28.0,
      },
      {
        id: 'cl-revolver',
        code: 'GL-2040',
        name: 'Short-Term Credit Facility Drawdowns',
        shareOfParent: 0.12,
        description: 'Working capital drawings on syndicated bank credit lines due within 180 operational days.',
        status: 'Warning',
        colorNumeric: 0xfb7185,
        varianceYoY: -8.0,
      },
    ],
  },

  'Long-Term Senior Debt': {
    key: 'Long-Term Senior Debt',
    displayName: 'Long-Term Debt & Obligations',
    statement: 'Balance Sheet',
    category: 'Non-Current Liabilities',
    subAccounts: [
      {
        id: 'ltd-notes',
        code: 'GL-2510',
        name: 'Senior 4.25% Notes Due 2029',
        shareOfParent: 0.52,
        description: 'Fixed-coupon institutional debt covenants with semi-annual coupon obligations and investment-grade rating.',
        status: 'Safe',
        colorNumeric: 0xe11d48,
        varianceYoY: 0.0,
      },
      {
        id: 'ltd-termloan',
        code: 'GL-2520',
        name: 'Syndicated Term Loan B (SOFR + 225bps)',
        shareOfParent: 0.32,
        description: 'Floating rate institutional term loan subject to quarterly amortization and leverage covenants.',
        status: 'Warning',
        colorNumeric: 0xbe123c,
        varianceYoY: -10.5,
      },
      {
        id: 'ltd-leases',
        code: 'GL-2530',
        name: 'Capital Equipment Lease Liabilities',
        shareOfParent: 0.16,
        description: 'Present value of non-cancellable server rack and data center real estate lease contracts (ASC 842).',
        status: 'Neutral',
        colorNumeric: 0x9f1239,
        varianceYoY: 4.8,
      },
    ],
  },

  'Stockholders Equity': {
    key: 'Stockholders Equity',
    displayName: 'Total Stockholders Equity',
    statement: 'Balance Sheet',
    category: 'Equity',
    subAccounts: [
      {
        id: 'eq-retained',
        code: 'GL-3010',
        name: 'Retained Earnings & Accumulated Surplus',
        shareOfParent: 0.62,
        description: 'Cumulative historic net earnings retained in business operations rather than distributed as dividends.',
        status: 'Safe',
        colorNumeric: 0x10b981,
        varianceYoY: 21.4,
      },
      {
        id: 'eq-apic',
        code: 'GL-3020',
        name: 'Additional Paid-in Capital (APIC)',
        shareOfParent: 0.24,
        description: 'Excess consideration received from equity financing rounds and stock-based compensation over par value.',
        status: 'Safe',
        colorNumeric: 0x059669,
        varianceYoY: 6.2,
      },
      {
        id: 'eq-common',
        code: 'GL-3030',
        name: 'Common Stock ($0.001 Par Value)',
        shareOfParent: 0.08,
        description: 'Authorized and issued voting shares outstanding.',
        status: 'Safe',
        colorNumeric: 0x34d399,
        varianceYoY: 1.8,
      },
      {
        id: 'eq-aoci',
        code: 'GL-3040',
        name: 'Accumulated Other Comp. Income (AOCI)',
        shareOfParent: 0.06,
        description: 'Unrealized foreign currency translation gains and hedging reserve adjustments.',
        status: 'Neutral',
        colorNumeric: 0x6ee7b7,
        varianceYoY: -14.0,
      },
    ],
  },

  // DUPONT DECOMPOSITION NODES
  'Return on Equity (ROE)': {
    key: 'Return on Equity (ROE)',
    displayName: 'DuPont Triple Pillar Decomposition',
    statement: 'DuPont Decomposition',
    category: 'Performance Synthesis',
    subAccounts: [
      {
        id: 'dup-margin',
        code: 'DUP-01',
        name: 'Operating Efficiency (Net Margin)',
        shareOfParent: 0.38,
        description: 'Conversion rate of top-line revenue into bottom-line profits.',
        status: 'Safe',
        colorNumeric: 0x10b981,
      },
      {
        id: 'dup-turnover',
        code: 'DUP-02',
        name: 'Asset Utilization (Turnover Ratio)',
        shareOfParent: 0.32,
        description: 'Revenues generated per unit of capital assets deployed.',
        status: 'Safe',
        colorNumeric: 0x3b82f6,
      },
      {
        id: 'dup-leverage',
        code: 'DUP-03',
        name: 'Financial Gearing (Equity Multiplier)',
        shareOfParent: 0.30,
        description: 'Ratio of total assets financed through debt vs equity capital.',
        status: 'Warning',
        colorNumeric: 0xf59e0b,
      },
    ],
  },

  'Net Income': {
    key: 'Net Income',
    displayName: 'Net Accounting Earnings',
    statement: 'Income Statement',
    category: 'Profitability',
    subAccounts: [
      {
        id: 'ni-gross',
        code: 'GL-4010',
        name: 'Gross Margin Inflow',
        shareOfParent: 0.85,
        description: 'Gross operating surplus generated from direct client software subscriptions.',
        status: 'Safe',
        colorNumeric: 0x10b981,
      },
      {
        id: 'ni-rd',
        code: 'GL-5100',
        name: 'R&D Innovation Investment Outlay',
        shareOfParent: -0.35,
        description: 'Expensed software engineers, AI models training, and intellectual property development.',
        status: 'Warning',
        colorNumeric: 0xf43f5e,
      },
      {
        id: 'ni-sm',
        code: 'GL-5200',
        name: 'Sales & Marketing Client Acquisition',
        shareOfParent: -0.28,
        description: 'Direct enterprise sales commissions, regional summits, and digital lead generation.',
        status: 'Neutral',
        colorNumeric: 0xf59e0b,
      },
      {
        id: 'ni-tax',
        code: 'GL-7100',
        name: 'Provision for Taxes & Financing Costs',
        shareOfParent: -0.12,
        description: 'Effective corporate tax obligations and interest expense on long-term debt.',
        status: 'Safe',
        colorNumeric: 0x64748b,
      },
    ],
  },

  'Total Revenue': {
    key: 'Total Revenue',
    displayName: 'Gross Enterprise Revenue',
    statement: 'Income Statement',
    category: 'Top-Line',
    subAccounts: [
      {
        id: 'rev-ai',
        code: 'REV-01',
        name: 'Enterprise AI & Cloud Subscriptions',
        shareOfParent: 0.62,
        description: 'Multi-tenant compute and predictive intelligence subscription billings.',
        status: 'Safe',
        colorNumeric: 0x6366f1,
      },
      {
        id: 'rev-lic',
        code: 'REV-02',
        name: 'Private Dedicated Cloud Instances',
        shareOfParent: 0.24,
        description: 'Dedicated isolated VPC deployments for regulated financial & health customers.',
        status: 'Safe',
        colorNumeric: 0x8b5cf6,
      },
      {
        id: 'rev-serv',
        code: 'REV-03',
        name: 'Professional Architecture & Services',
        shareOfParent: 0.14,
        description: 'Hands-on architectural migrations and enterprise security integrations.',
        status: 'Neutral',
        colorNumeric: 0xa855f7,
      },
    ],
  },

  // CASH FLOW NODES
  'Operating Cash Flow': {
    key: 'Operating Cash Flow',
    displayName: 'Cash Generated from Operations (OCF)',
    statement: 'Cash Flow',
    category: 'Cash Engine',
    subAccounts: [
      {
        id: 'ocf-netinc',
        code: 'CF-101',
        name: 'Net Income Cash Base',
        shareOfParent: 0.58,
        description: 'Baseline accounting profit before non-cash adjustments.',
        status: 'Safe',
        colorNumeric: 0x10b981,
      },
      {
        id: 'ocf-deprec',
        code: 'CF-102',
        name: 'Depreciation & Amortization Add-Back',
        shareOfParent: 0.28,
        description: 'Non-cash write-downs on hardware infrastructure and capitalized software.',
        status: 'Safe',
        colorNumeric: 0x34d399,
      },
      {
        id: 'ocf-wc',
        code: 'CF-103',
        name: 'Working Capital Cash Changes',
        shareOfParent: 0.14,
        description: 'Net cash impact of receivables collections and payables timing.',
        status: 'Neutral',
        colorNumeric: 0x6ee7b7,
      },
    ],
  },

  'Free Cash Flow (FCF)': {
    key: 'Free Cash Flow (FCF)',
    displayName: 'Free Cash Flow Generation',
    statement: 'Cash Flow',
    category: 'Discretionary Cash',
    subAccounts: [
      {
        id: 'fcf-unlev',
        code: 'FCF-01',
        name: 'Operating Free Cash Flow',
        shareOfParent: 0.76,
        description: 'Cash produced by operations after covering required capital maintenance outlays.',
        status: 'Safe',
        colorNumeric: 0x0ea5e9,
      },
      {
        id: 'fcf-growth',
        code: 'FCF-02',
        name: 'Discretionary Expansion Liquidity',
        shareOfParent: 0.24,
        description: 'Surplus cash available for strategic acquisitions, dividends, or debt early retirement.',
        status: 'Safe',
        colorNumeric: 0x38bdf8,
      },
    ],
  },
};

/**
 * Helper to check if a node has constituent sub-accounts available
 */
export function isNodeExplodable(titleOrKey: string): boolean {
  return Boolean(CONSOLIDATED_SUB_ACCOUNTS_MAP[titleOrKey]);
}

/**
 * Retrieve the sub-account breakdown for a given consolidated node
 */
export function getSubAccountBreakdown(titleOrKey: string): ConsolidatedNodeConfig | null {
  return CONSOLIDATED_SUB_ACCOUNTS_MAP[titleOrKey] || null;
}

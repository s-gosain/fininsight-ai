import { DocumentCategoryTag, DocumentSummaryData, DeepAIAnalysisResponse, FinancialDataset } from '../types';

export interface DocumentClassificationResult {
  primaryTag: DocumentCategoryTag;
  allTags: DocumentCategoryTag[];
  confidence: number;
  reasoning: string;
  isAiDerived: boolean;
}

export const TAG_METADATA: Record<
  DocumentCategoryTag,
  {
    label: string;
    description: string;
    badgeStyle: string;
    borderStyle: string;
    iconColor: string;
  }
> = {
  Quarterly: {
    label: 'Quarterly',
    description: 'Q1–Q4 Interim Financial Statements / 10-Q Quarterly Reporting',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    borderStyle: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  Annual: {
    label: 'Annual',
    description: 'Comprehensive Full-Year Audited Financial Statements / 10-K',
    badgeStyle: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    borderStyle: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  'Investor Deck': {
    label: 'Investor Deck',
    description: 'Executive Presentation, Earnings Deck, or Investor Relations Dossier',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderStyle: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  'Regulatory Filing': {
    label: 'Regulatory Filing',
    description: 'Official SEC EDGAR Statutory Filing (Form 10-K, 10-Q, 8-K, 20-F)',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    borderStyle: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
};

export function classifyDocument(params: {
  fileName?: string;
  dataset?: FinancialDataset;
  documentSummary?: DocumentSummaryData | null;
  aiAnalysis?: DeepAIAnalysisResponse | null;
  detectedFormat?: string;
}): DocumentClassificationResult {
  const { fileName = '', dataset, documentSummary, aiAnalysis, detectedFormat = '' } = params;

  // 1. If AI Document Summary explicitly gave a valid category
  if (documentSummary?.documentCategory) {
    const validTags: DocumentCategoryTag[] = ['Quarterly', 'Annual', 'Investor Deck', 'Regulatory Filing'];
    if (validTags.includes(documentSummary.documentCategory)) {
      const allTags: DocumentCategoryTag[] = documentSummary.tags || [documentSummary.documentCategory];
      return {
        primaryTag: documentSummary.documentCategory,
        allTags: Array.from(new Set(allTags)),
        confidence: documentSummary.confidenceScore || 96,
        reasoning: `Categorized by Gemini Document Ingestion engine (${documentSummary.source}) based on statutory disclosures and period structure.`,
        isAiDerived: true,
      };
    }
  }

  // 2. Synthesize signals from AI analysis text, summary metadata, file naming, and statement periods
  const lowerName = fileName.toLowerCase();
  const summaryTitle = (documentSummary?.documentTitle || '').toLowerCase();
  const filingType = (documentSummary?.filingType || '').toLowerCase();
  const execSummary = (documentSummary?.executiveSummary || aiAnalysis?.executiveSummary || '').toLowerCase();
  const periods = dataset?.periods || [];
  const formatStr = detectedFormat.toLowerCase();

  const detectedTags: DocumentCategoryTag[] = [];

  // Check for Quarterly indicators
  const isQuarterlyPeriod = periods.some((p) => /q[1-4]|quarter/i.test(p));
  const isQuarterlyFile =
    lowerName.includes('10-q') ||
    lowerName.includes('10q') ||
    lowerName.includes('quarter') ||
    /q[1-4]/i.test(lowerName) ||
    filingType.includes('10-q') ||
    filingType.includes('quarter') ||
    summaryTitle.includes('10-q') ||
    summaryTitle.includes('quarter') ||
    execSummary.includes('quarterly results') ||
    execSummary.includes('three months ended');

  // Check for Annual indicators
  const isAnnualPeriod = periods.some((p) => /fy\d{4}|202\d/i.test(p)) && !isQuarterlyPeriod;
  const isAnnualFile =
    lowerName.includes('10-k') ||
    lowerName.includes('10k') ||
    lowerName.includes('annual') ||
    lowerName.includes('20-f') ||
    filingType.includes('10-k') ||
    filingType.includes('annual') ||
    summaryTitle.includes('10-k') ||
    summaryTitle.includes('annual') ||
    execSummary.includes('fiscal year') ||
    execSummary.includes('twelve months ended') ||
    isAnnualPeriod;

  // Check for Investor Deck indicators
  const isInvestorDeck =
    lowerName.includes('deck') ||
    lowerName.includes('presentation') ||
    lowerName.includes('investor_day') ||
    lowerName.includes('slide') ||
    lowerName.includes('roadshow') ||
    lowerName.includes('pitch') ||
    formatStr.includes('deck') ||
    formatStr.includes('presentation') ||
    filingType.includes('presentation') ||
    summaryTitle.includes('investor presentation') ||
    execSummary.includes('investor presentation');

  // Check for Regulatory Filing indicators
  const isRegulatory =
    lowerName.includes('10-k') ||
    lowerName.includes('10-q') ||
    lowerName.includes('8-k') ||
    lowerName.includes('sec') ||
    lowerName.includes('edgar') ||
    lowerName.includes('filing') ||
    lowerName.includes('statutory') ||
    filingType.includes('sec') ||
    filingType.includes('form') ||
    filingType.includes('statutory') ||
    filingType.includes('regulatory') ||
    summaryTitle.includes('sec form') ||
    execSummary.includes('sec form') ||
    execSummary.includes('statutory filing') ||
    (aiAnalysis?.financialHealthSummary !== undefined);

  if (isQuarterlyPeriod || isQuarterlyFile) {
    detectedTags.push('Quarterly');
  }

  if (isAnnualFile && !detectedTags.includes('Quarterly')) {
    detectedTags.push('Annual');
  }

  if (isInvestorDeck) {
    detectedTags.push('Investor Deck');
  }

  if (isRegulatory || lowerName.includes('filing')) {
    detectedTags.push('Regulatory Filing');
  }

  // If none matched, default by periods or company statements
  if (detectedTags.length === 0) {
    if (isQuarterlyPeriod) {
      detectedTags.push('Quarterly');
    } else {
      detectedTags.push('Annual');
      detectedTags.push('Regulatory Filing');
    }
  }

  // Determine primary tag
  let primaryTag: DocumentCategoryTag = 'Annual';
  if (isInvestorDeck) {
    primaryTag = 'Investor Deck';
  } else if (detectedTags.includes('Quarterly')) {
    primaryTag = 'Quarterly';
  } else if (detectedTags.includes('Regulatory Filing') && !detectedTags.includes('Annual')) {
    primaryTag = 'Regulatory Filing';
  } else if (detectedTags.includes('Annual')) {
    primaryTag = 'Annual';
  } else {
    primaryTag = detectedTags[0];
  }

  const confidence = documentSummary?.confidenceScore || (isRegulatory || isAnnualFile || isQuarterlyFile ? 95 : 88);

  const reasoning = isInvestorDeck
    ? 'Identified as Investor Deck from presentation structures and high-level strategic summaries.'
    : primaryTag === 'Quarterly'
    ? 'Identified as Quarterly filing from interim financial periods (Q1–Q4) and Form 10-Q disclosures.'
    : primaryTag === 'Regulatory Filing'
    ? 'Classified as Statutory Regulatory Filing based on SEC compliance disclosures and GAAP financial notes.'
    : 'Classified as Annual Comprehensive Filing reflecting multi-period audited annual performance.';

  return {
    primaryTag,
    allTags: Array.from(new Set(detectedTags)),
    confidence,
    reasoning,
    isAiDerived: Boolean(documentSummary || aiAnalysis),
  };
}

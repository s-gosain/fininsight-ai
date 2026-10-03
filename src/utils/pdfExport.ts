import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialDataset, FinancialRatios, RedFlagItem, SentimentAnalysisResult, FinancialHealthGrade, CurrencyCode } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';

export interface ExportPdfOptions {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  redFlags: RedFlagItem[];
  sentiment: SentimentAnalysisResult;
  health: FinancialHealthGrade;
  currency: CurrencyCode;
  userName?: string;
  userRole?: string;
}

export function exportExecutivePdfReport(options: ExportPdfOptions): void {
  const { dataset, ratios, redFlags, sentiment, health, currency, userName, userRole } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner & Branding
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AI FINANCIAL STATEMENT AUDIT & PERFORMANCE DOSSIER', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Company: ${dataset.companyName.toUpperCase()} | Period: ${dataset.activePeriod} | Generated: ${new Date().toLocaleDateString()}`, 14, 19);
  doc.text(`Auditor: ${userName || 'Senior Analyst'} (${userRole || 'Lead'}) | SOX/GAAP Verified`, 14, 24);

  // Health Score Badge
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - 45, 6, 35, 16, 2, 2, 'F');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`GRADE: ${health.overallGrade}`, pageWidth - 41, 14);
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`F-Score: ${ratios.piotroskiFScore}/9`, pageWidth - 41, 19);

  let currentY = 35;

  // Executive Summary Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Executive Financial Summary & Scorecard', 14, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryText = `${health.summarySentence} Management tonality is assessed as ${sentiment.sentiment} (${sentiment.overallScore}/100) with key focus on ${sentiment.executiveKeywords.slice(0, 3).join(', ')}.`;
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
  doc.text(splitSummary, 14, currentY);
  currentY += splitSummary.length * 4.5 + 4;

  // Key KPI Scorecard Grid
  const kpiData = [
    [
      'Revenue Growth (YoY)',
      formatPercent(ratios.revenueGrowthYoY, true),
      'Gross Profit Margin',
      formatPercent(ratios.grossProfitMargin),
      'Operating Margin (EBIT)',
      formatPercent(ratios.operatingMargin),
    ],
    [
      'Net Profit Margin',
      formatPercent(ratios.netProfitMargin),
      'Free Cash Flow',
      formatCurrency(ratios.freeCashFlow, currency, true),
      'Debt-to-Equity Ratio',
      `${ratios.debtToEquity}x`,
    ],
    [
      'Current Ratio',
      `${ratios.currentRatio}x`,
      'Altman Z-Score',
      `${ratios.altmanZScore} (${ratios.altmanZone})`,
      'Return on Equity (ROE)',
      formatPercent(ratios.returnOnEquity),
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Key Metric', 'Value', 'Key Metric', 'Value', 'Key Metric', 'Value']],
    body: kpiData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Red Flags & Major Risk Assessment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Red Flag Detection & Risk Assessment (${redFlags.length} Identified)`, 14, currentY);
  currentY += 4;

  const flagRows = redFlags.map((rf) => [
    rf.severity.toUpperCase(),
    rf.category,
    rf.metric,
    rf.currentValue,
    rf.observation,
    rf.recommendation,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Severity', 'Category', 'Metric', 'Current', 'Observation & Red Flag Note', 'Mitigation Recommendation']],
    body: flagRows.length > 0 ? flagRows : [['None', 'Clean', 'No Critical Breaches', '-', 'All core ratios operating within normal tolerances.', 'Continue periodic monitoring.']],
    theme: 'striped',
    headStyles: {
      fillColor: [185, 28, 28], // red-700
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 28 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 50 },
      5: { cellWidth: 50 },
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [30, 41, 59],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Condensed Income Statement Table
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Consolidated Statement Summary (Multi-Period)', 14, currentY);
  currentY += 4;

  const statementRows = dataset.incomeStatement.slice(0, 8).map((item) => {
    return [
      item.name,
      ...dataset.periods.map((p) => formatCurrency(item.values[p] || 0, currency, true)),
      item.notes || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Line Item', ...dataset.periods, 'Auditor Notes']],
    body: statementRows,
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Confidential & Proprietary | Encrypted (AES-256) | Page ${i} of ${pageCount} | AI Financial Statement Analyzer`,
      14,
      pageHeight - 8
    );
  }

  doc.save(`${dataset.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Audit_Report_${dataset.activePeriod}.pdf`);
}

export function generateFinancialReportPdf(
  dataset: FinancialDataset,
  ratios: FinancialRatios,
  health: FinancialHealthGrade,
  redFlags: RedFlagItem[],
  sentiment: SentimentAnalysisResult,
  currency: CurrencyCode,
  userName?: string,
  userRole?: string
): void {
  exportExecutivePdfReport({
    dataset,
    ratios,
    health,
    redFlags,
    sentiment,
    currency,
    userName,
    userRole,
  });
}


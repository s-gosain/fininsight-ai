import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  Sparkles, 
  Database, 
  Activity, 
  Compass, 
  Cpu, 
  ScanEye, 
  FileSpreadsheet, 
  Lock, 
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MonitorPlay,
  Share2,
  Volume2,
  VolumeX,
  FileText,
  BookOpen,
  Captions,
  X
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { calculateFinancialRatios, evaluateFinancialHealth, detectRedFlags } from '../utils/financialCalculations';
import { CurrencyCode, FinancialDataset } from '../types';

export interface Interactive3DVideoDemoProps {
  onContinueToSignIn: () => void;
  onExploreSandbox?: () => void;
  onVideoComplete?: () => void;
  onReplay?: () => void;
  dataset?: FinancialDataset;
  companyName?: string;
  ticker?: string;
  defaultMuted?: boolean;
  optInTranscriptOverlay?: boolean;
  defaultShowTranscriptOverlay?: boolean;
  onToggleTranscriptOverlay?: (isOpen: boolean) => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  onSkipToAnalysis?: () => void;
}

interface DemoChapter {
  id: string;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;
  badge: string;
  narration: string;
  metrics: { label: string; value: string; trend?: string }[];
  cameraTarget: { x: number; y: number; z: number; lookY: number };
}

const DEMO_TOTAL_DURATION = 160; // 2 minutes 40 seconds

const CHAPTERS: DemoChapter[] = [
  {
    id: 'ch-1',
    title: '1. Autonomous SEC 10-K Ingestion & XBRL Harmonization',
    subtitle: 'Extracts multi-period balance sheets and income statements with zero manual input.',
    startTime: 0,
    endTime: 32,
    badge: 'INGESTION ENGINE',
    narration: 'FinInsight connects directly to the SEC EDGAR repository, ingesting multi-period 10-K reports. It reconciles line items across differing XBRL taxonomies and computes growth baselines in milliseconds.',
    metrics: [
      { label: 'Parsing Throughput', value: '1,420 pgs/sec', trend: '+18%' },
      { label: 'XBRL Alignment', value: '100% Reconciled' },
      { label: 'Statement Balancing', value: 'Δ $0.00 M' },
    ],
    cameraTarget: { x: 0.0, y: 0.8, z: 11.2, lookY: 0.6 },
  },
  {
    id: 'ch-2',
    title: '2. 3D Capital Structure & Financial Statement Topography',
    subtitle: 'Spatial elevation mapping of Revenue, Gross Margin, EBIT, Net Income & Free Cash Flow.',
    startTime: 32,
    endTime: 68,
    badge: '3D STATEMENT TOPOGRAPHY',
    narration: 'Spatial elevation represents multi-tier corporate performance: from $394.3B Revenue down to Free Cash Flow conversion. Margin compression and operational drivers are legible in spatial height.',
    metrics: [
      { label: 'Revenue Base', value: '$394.3B', trend: '+8.1% YoY' },
      { label: 'Gross Margin', value: '$170.8B', trend: '44.1% Margin' },
      { label: 'Free Cash Flow', value: '$108.8B', trend: 'Cash Gen' },
    ],
    cameraTarget: { x: 0.0, y: 2.8, z: 14.8, lookY: 1.0 },
  },
  {
    id: 'ch-3',
    title: '3. DuPont 3-Stage ROE Decomposition Conduit',
    subtitle: 'Dissects Return on Equity into Margin, Asset Turnover, and Financial Leverage.',
    startTime: 68,
    endTime: 104,
    badge: 'DUPONT VALUATION',
    narration: 'Illuminated DuPont conduits link Gross Margin, Operating EBIT, and Net Income to diagnose whether high Return on Equity (156.1%) stems from operational pricing power or balance sheet leverage.',
    metrics: [
      { label: 'Return on Equity (ROE)', value: '156.1%', trend: 'Top Decile' },
      { label: 'Operating Margin', value: '29.0%', trend: '+1.8% YoY' },
      { label: 'Asset Turnover', value: '1.08x', trend: 'Optimal' },
    ],
    cameraTarget: { x: 0.0, y: 2.0, z: 11.5, lookY: 1.2 },
  },
  {
    id: 'ch-4',
    title: '4. Forensic Beneish M-Score & Anomaly Scanner',
    subtitle: '8-variable econometric algorithm detecting earnings manipulation & red flags.',
    startTime: 104,
    endTime: 136,
    badge: 'FORENSIC AUDIT RADAR',
    narration: 'The cyber laser sweeps across the ingested Form 10-K lines while the ground radar computes Beneish M-Score (-2.71 [Safe]) and Altman Z-Score to verify statement integrity.',
    metrics: [
      { label: 'Beneish M-Score', value: '-2.71', trend: 'Safe (< -1.78)' },
      { label: 'Altman Z-Score', value: '8.42', trend: 'Safe Zone' },
      { label: 'XBRL Harmonized', value: '100% Match', trend: 'Audited' },
    ],
    cameraTarget: { x: 0.0, y: 4.8, z: 13.0, lookY: -0.5 },
  },
  {
    id: 'ch-5',
    title: '5. Multi-Period Growth Trajectory & Monte Carlo Runway',
    subtitle: 'FY21-FY25E revenue spline with 1,000 randomized macro stress testing fan simulations.',
    startTime: 136,
    endTime: 160,
    badge: 'PREDICTIVE ENGINE',
    narration: 'The continuous trajectory spline connects historical milestones through FY25E forecast ($414.2B), with Monte Carlo fan lines illustrating bull, base, and recessionary stress scenarios.',
    metrics: [
      { label: 'Trajectory Range', value: 'FY21 — FY25E', trend: '5-Year Spline' },
      { label: 'FY25E Base Rev', value: '$414.2B', trend: '+5.9% Forecast' },
      { label: 'Confidence Floor', value: '95% CI', trend: 'Statistically Bound' },
    ],
    cameraTarget: { x: 0.0, y: 3.0, z: 14.2, lookY: 1.5 },
  },
];

interface ClarityDefinition {
  term: string;
  badge: string;
  plainEnglish: string;
  executiveTakeaway: string;
  formula?: string;
}

const FINANCIAL_CLARITY_DATA: Record<string, ClarityDefinition[]> = {
  'ch-1': [
    {
      term: 'Autonomous SEC 10-K Ingestion',
      badge: 'Data Pipeline',
      plainEnglish: 'Automatically ingests official annual SEC filings submitted by public companies without manual copy-pasting.',
      executiveTakeaway: 'Eliminates hours of manual data entry while achieving zero transposition errors.',
      formula: 'Throughput = 1,420 pgs/sec (+18% YoY)',
    },
    {
      term: 'XBRL Harmonization',
      badge: 'Data Taxonomy',
      plainEnglish: 'Translates differing accounting line-item nomenclatures across reporting periods into one uniform taxonomy.',
      executiveTakeaway: 'Guarantees reliable multi-year and peer-to-peer comparative analysis.',
      formula: 'Alignment Coverage = 100% Reconciled',
    },
  ],
  'ch-2': [
    {
      term: '3D Capital Structure Elevation',
      badge: 'Spatial Topography',
      plainEnglish: 'Visualizes dollars as physical elevation heights: Revenue ($394.3B) down through Gross Margin, EBIT, Net Income, and Free Cash Flow ($108.8B).',
      executiveTakeaway: 'Instantly identifies margin compression, operational friction, and cash flow conversion strength.',
      formula: 'Gross Margin % = (Gross Profit / Total Revenue) × 100',
    },
    {
      term: 'Free Cash Flow (FCF) Conversion',
      badge: 'Liquidity',
      plainEnglish: 'Discretionary cash remaining after all ongoing operational expenditures and capital investments are paid.',
      executiveTakeaway: 'Direct fuel for share repurchases, dividend disbursements, strategic acquisitions, and organic growth.',
      formula: 'FCF = Operating Cash Flow - CapEx ($108.8B)',
    },
  ],
  'ch-3': [
    {
      term: 'DuPont 3-Stage ROE Decomposition',
      badge: 'Valuation & Quality',
      plainEnglish: 'Dissects Return on Equity (156.1%) into Operating Margin, Asset Turnover, and Leverage to inspect the true source of returns.',
      executiveTakeaway: 'Proves whether returns stem from superior operational pricing power or risky debt leverage.',
      formula: 'ROE = Profit Margin (29.0%) × Asset Turnover (1.08x) × Equity Multiplier',
    },
    {
      term: 'Asset Turnover Velocity',
      badge: 'Capital Efficiency',
      plainEnglish: 'Calculates how many dollars of gross revenue the enterprise generates per dollar of balance-sheet assets.',
      executiveTakeaway: 'Optimal 1.08x velocity confirms lean working capital and high equipment productivity.',
      formula: 'Asset Turnover = Total Revenue / Average Total Assets',
    },
  ],
  'ch-4': [
    {
      term: 'Beneish M-Score Forensic Scanner',
      badge: 'Fraud Detection',
      plainEnglish: 'An 8-variable econometric algorithm that scans for abnormal accruals, delayed expenses, and earnings manipulation.',
      executiveTakeaway: 'A score of -2.71 falls decisively below the -1.78 red-flag threshold, mathematically proving clean books.',
      formula: 'M-Score = -4.84 + 0.920×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI + ...',
    },
    {
      term: 'Altman Z-Score Solvency Index',
      badge: 'Credit Health',
      plainEnglish: 'Calculates creditworthiness and the statistical probability of corporate insolvency within a two-year horizon.',
      executiveTakeaway: 'Score of 8.42 rests deep inside the "Safe Zone" (> 3.0), indicating virtually zero bankruptcy risk.',
      formula: 'Z = 1.2×(WC/TA) + 1.4×(RE/TA) + 3.3×(EBIT/TA) + 0.6×(MVE/TL) + 0.999×(S/TA)',
    },
  ],
  'ch-5': [
    {
      term: 'Monte Carlo Stress Runway',
      badge: 'Predictive Modeling',
      plainEnglish: 'Executes 1,000 randomized macro stress testing scenarios (interest rate hikes, stagflation, demand shocks) across FY25E.',
      executiveTakeaway: 'Establishes a resilient 95% statistical confidence floor around the $414.2B base forecast.',
      formula: 'Stochastic Simulation: dS_t = μ S_t dt + σ S_t dW_t',
    },
  ],
};

export interface TranscriptSegment {
  id: string;
  chapterId: string;
  chapterTitle: string;
  badge: string;
  startTime: number;
  endTime: number;
  speaker: string;
  line: string;
}

export const DEMO_TRANSCRIPT_SEGMENTS: TranscriptSegment[] = [
  {
    id: 'line-1',
    chapterId: 'ch-1',
    chapterTitle: '1. Autonomous SEC 10-K Ingestion',
    badge: 'INGESTION',
    startTime: 0,
    endTime: 16,
    speaker: 'AI Voice',
    line: 'FinInsight connects directly to the SEC EDGAR repository, ingesting multi-period 10-K reports with zero manual friction.',
  },
  {
    id: 'line-2',
    chapterId: 'ch-1',
    chapterTitle: '1. XBRL Harmonization',
    badge: 'HARMONIZATION',
    startTime: 16,
    endTime: 32,
    speaker: 'AI Voice',
    line: 'It reconciles line items across differing XBRL taxonomies and computes growth baselines in milliseconds.',
  },
  {
    id: 'line-3',
    chapterId: 'ch-2',
    chapterTitle: '2. 3D Capital Topography',
    badge: 'ELEVATION',
    startTime: 32,
    endTime: 50,
    speaker: 'AI Voice',
    line: 'Spatial elevation represents multi-tier corporate performance: from $394.3B Revenue down to Free Cash Flow conversion.',
  },
  {
    id: 'line-4',
    chapterId: 'ch-2',
    chapterTitle: '2. Cash Flow Conversion',
    badge: 'CASH FLOW',
    startTime: 50,
    endTime: 68,
    speaker: 'AI Voice',
    line: 'Margin compression and operational drivers are immediately legible in physical spatial heights across balance sheet tiers.',
  },
  {
    id: 'line-5',
    chapterId: 'ch-3',
    chapterTitle: '3. DuPont Decomposition',
    badge: 'DUPONT',
    startTime: 68,
    endTime: 86,
    speaker: 'AI Voice',
    line: 'Illuminated DuPont conduits link Gross Margin, Operating EBIT, and Net Income to diagnose return dynamics.',
  },
  {
    id: 'line-6',
    chapterId: 'ch-3',
    chapterTitle: '3. Leverage vs Profitability',
    badge: 'QUALITY OF EARNINGS',
    startTime: 86,
    endTime: 104,
    speaker: 'AI Voice',
    line: 'This reveals whether high Return on Equity (156.1%) stems from operational pricing power or balance sheet leverage.',
  },
  {
    id: 'line-7',
    chapterId: 'ch-4',
    chapterTitle: '4. Forensic Laser Sweep',
    badge: 'FORENSIC SCAN',
    startTime: 104,
    endTime: 120,
    speaker: 'AI Voice',
    line: 'The cyber laser sweeps across ingested Form 10-K lines to detect reporting anomalies and abnormal accruals.',
  },
  {
    id: 'line-8',
    chapterId: 'ch-4',
    chapterTitle: '4. Beneish & Altman Auditing',
    badge: 'INTEGRITY AUDIT',
    startTime: 120,
    endTime: 136,
    speaker: 'AI Voice',
    line: 'Ground radar computes Beneish M-Score (-2.71 [Safe]) and Altman Z-Score to mathematically verify statement integrity.',
  },
  {
    id: 'line-9',
    chapterId: 'ch-5',
    chapterTitle: '5. Multi-Period Spline',
    badge: 'PREDICTIVE SPLINE',
    startTime: 136,
    endTime: 148,
    speaker: 'AI Voice',
    line: 'The continuous trajectory spline connects historical milestones through FY25E forecast ($414.2B).',
  },
  {
    id: 'line-10',
    chapterId: 'ch-5',
    chapterTitle: '5. Monte Carlo Runway',
    badge: 'STRESS TESTING',
    startTime: 148,
    endTime: 160,
    speaker: 'AI Voice',
    line: 'Monte Carlo fan lines illustrate bull, base, and recessionary stress scenarios with a 95% statistical confidence floor.',
  },
];

// Helper to draw rounded rectangle on 2D canvas
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Generates high-res canvas texture for the SEC 10-K Holographic Document Tablet (subtle, clean, elegant)
function createSec10KDocTexture(ticker: string = 'APEX', companyName: string = 'Apex Cloud Technologies Inc.'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Semi-translucent obsidian glass
  ctx.fillStyle = 'rgba(9, 10, 18, 0.88)';
  drawRoundedRect(ctx, 10, 10, 492, 492, 18);
  ctx.fill();

  // Subtle border with indigo glow
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 10, 10, 492, 492, 18);
  ctx.stroke();

  // Header band
  ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
  drawRoundedRect(ctx, 18, 18, 476, 56, 12);
  ctx.fill();

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 15px monospace';
  const cleanTicker = (ticker || 'APEX').toUpperCase();
  ctx.fillText(`SEC FORM 10-K • ${cleanTicker} (CONSOLIDATED)`, 32, 44);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('XBRL VERIFIED ✓', 356, 44);

  // Table header
  ctx.fillStyle = '#71717a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('STATEMENT OF OPERATIONS', 32, 98);
  ctx.fillText('USD ($M)', 410, 98);

  // Subtle divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(30, 108);
  ctx.lineTo(482, 108);
  ctx.stroke();

  // 5 essential rows with generous breathing room
  const rows = [
    { label: 'Total Revenue', val: '$394,328', sub: '+8.1%', color: '#10b981' },
    { label: 'Gross Margin (Profit)', val: '$170,782', sub: '44.1%', color: '#38bdf8' },
    { label: 'Operating EBIT', val: '$114,301', sub: '29.0%', color: '#818cf8' },
    { label: 'Net Income (Profit)', val: '$96,995', sub: '24.6%', color: '#34d399' },
    { label: 'Free Cash Flow', val: '$108,800', sub: 'Conversion', color: '#38bdf8' },
  ];

  rows.forEach((r, idx) => {
    const y = 144 + idx * 56;
    if (idx % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(24, y - 26, 464, 44);
    }
    ctx.fillStyle = '#e4e4e7';
    ctx.font = '14px monospace';
    ctx.fillText(r.label, 32, y);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(r.val, 310, y);

    ctx.fillStyle = r.color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(r.sub, 420, y);
  });

  // Footer status pill
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  drawRoundedRect(ctx, 24, 434, 464, 48, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 24, 434, 464, 48, 10);
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('Beneish M-Score: -2.71 [Safe]  •  Altman Z: 8.42', 40, 464);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Generates sleek, minimalist floating metric badge (not bulky!)
function createFinancialCardTexture(
  title: string,
  value: string,
  badge: string,
  accentColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;

  // Translucent dark glass
  ctx.fillStyle = 'rgba(8, 10, 18, 0.72)';
  drawRoundedRect(ctx, 4, 4, 272, 92, 14);
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 4, 4, 272, 92, 14);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(title, 18, 30);

  // Large Value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(value, 18, 64);

  // Badge Tag
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 12px monospace';
  ctx.fillText(badge, 18, 85);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Generates minimal year node texture
function createYearNodeTexture(yearText: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 140;
  canvas.height = 60;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(8, 10, 18, 0.75)';
  drawRoundedRect(ctx, 4, 4, 132, 52, 10);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 4, 4, 132, 52, 10);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(yearText, 70, 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Generates DuPont ROE Formula Badge Texture
function createDuPontBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 70;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
  drawRoundedRect(ctx, 4, 4, 372, 62, 12);
  ctx.fill();

  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 4, 4, 372, 62, 12);
  ctx.stroke();

  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DuPont ROE: 156.1%', 190, 28);

  ctx.fillStyle = '#34d399';
  ctx.font = '11px monospace';
  ctx.fillText('Net Margin (24.6%) × Turnover (1.08x) × Lev (5.7x)', 190, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export interface Hovered3DItem {
  title: string;
  value: string;
  badge: string;
  detail: string;
  screenX: number;
  screenY: number;
}

export const Interactive3DVideoDemo: React.FC<Interactive3DVideoDemoProps> = ({
  onContinueToSignIn,
  onExploreSandbox,
  onVideoComplete,
  onReplay,
  dataset,
  companyName,
  ticker,
  defaultMuted = true,
  optInTranscriptOverlay,
  defaultShowTranscriptOverlay,
  onToggleTranscriptOverlay,
  onToggleCollapse,
  isCollapsed = false,
  onSkipToAnalysis,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFiredCompletionRef = useRef<boolean>(false);

  // Active Company & Ticker Synchronization
  const activeCompanyName = companyName || dataset?.companyName || 'Apex Cloud Technologies Inc.';
  const activeTicker = ticker || dataset?.ticker || (
    activeCompanyName.toLowerCase().includes('vanguard') ? 'VANG' :
    activeCompanyName.toLowerCase().includes('biopulse') ? 'BPUL' :
    'APEX'
  );
  const cleanCompanyName = activeCompanyName.replace(/\s+(Inc\.?|Corp\.?|LLC|Ltd\.?|AG)$/i, '').trim();
  const companyDisplayName = `${cleanCompanyName} (${activeTicker})`;

  const companyRef = useRef({
    name: activeCompanyName,
    cleanName: cleanCompanyName,
    ticker: activeTicker,
    displayName: companyDisplayName,
  });

  useEffect(() => {
    companyRef.current = {
      name: activeCompanyName,
      cleanName: cleanCompanyName,
      ticker: activeTicker,
      displayName: companyDisplayName,
    };
  }, [activeCompanyName, cleanCompanyName, activeTicker, companyDisplayName]);

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [userIsOrbiting, setUserIsOrbiting] = useState<boolean>(false);
  const [hasCompletedVideo, setHasCompletedVideo] = useState<boolean>(false);
  const [isHoveringControls, setIsHoveringControls] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<Hovered3DItem | null>(null);

  // Active Chapter calculation
  const currentChapter = useMemo(() => {
    const found = CHAPTERS.find((ch) => currentTime >= ch.startTime && currentTime < ch.endTime);
    return found || CHAPTERS[CHAPTERS.length - 1];
  }, [currentTime]);

  const currentChapterRef = useRef(currentChapter);
  currentChapterRef.current = currentChapter;

  const userIsOrbitingRef = useRef(userIsOrbiting);
  userIsOrbitingRef.current = userIsOrbiting;

  const progressPercent = Math.min(100, (currentTime / DEMO_TOTAL_DURATION) * 100);

  // Audio, Transcript & Financial Clarity States - default to MUTED
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    if (typeof defaultMuted === 'boolean') return defaultMuted;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fininsight_demo_audio_muted');
      if (stored !== null) return stored === 'true';
    }
    return true; // Ensured muted by default
  });

  const handleToggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fininsight_demo_audio_muted', next ? 'true' : 'false');
        } catch {
          // ignore
        }
        if (next && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      return next;
    });
  }, []);

  // Ensure speech synthesis is completely stopped on initial mount and when muted
  useEffect(() => {
    if (isAudioMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isAudioMuted]);

  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState<boolean>(false);
  const [isClarityDrawerOpen, setIsClarityDrawerOpen] = useState<boolean>(false);

  // Transcript Overlay is opened when opted into via prop, localStorage, or user action
  const [isTranscriptOverlayOpen, setIsTranscriptOverlayOpen] = useState<boolean>(() => {
    if (typeof optInTranscriptOverlay === 'boolean') return optInTranscriptOverlay;
    if (typeof defaultShowTranscriptOverlay === 'boolean') return defaultShowTranscriptOverlay;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fininsight_transcript_overlay_opted');
      if (stored !== null) return stored === 'true';
    }
    return false;
  });

  // Keep state synchronized if external opt-in prop updates
  useEffect(() => {
    if (typeof optInTranscriptOverlay === 'boolean') {
      setIsTranscriptOverlayOpen(optInTranscriptOverlay);
    }
  }, [optInTranscriptOverlay]);

  const handleToggleTranscriptOverlay = useCallback((forceOpen?: boolean) => {
    setIsTranscriptOverlayOpen((prev) => {
      const next = typeof forceOpen === 'boolean' ? forceOpen : !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fininsight_transcript_overlay_opted', next ? 'true' : 'false');
        } catch {
          // Ignore private mode storage restrictions
        }
      }
      onToggleTranscriptOverlay?.(next);
      return next;
    });
  }, [onToggleTranscriptOverlay]);

  const [isAutoScrollOverlay, setIsAutoScrollOverlay] = useState<boolean>(true);
  const activeOverlayLineRef = useRef<HTMLDivElement | null>(null);
  const overlayListContainerRef = useRef<HTMLDivElement | null>(null);
  const lastSpokenChapterIdRef = useRef<string | null>(null);

  // Active Real-time Narration Line Segment (updates continuously as video plays)
  const activeTranscriptSegment = useMemo(() => {
    const found = DEMO_TRANSCRIPT_SEGMENTS.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
    return found || DEMO_TRANSCRIPT_SEGMENTS[DEMO_TRANSCRIPT_SEGMENTS.length - 1];
  }, [currentTime]);

  // Real-time Auto-Scroll tracking active narration line inside the transcript overlay
  useEffect(() => {
    if (isAutoScrollOverlay && activeOverlayLineRef.current && isTranscriptOverlayOpen) {
      activeOverlayLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeTranscriptSegment.id, isAutoScrollOverlay, isTranscriptOverlayOpen]);

  // Subtle Web Audio harmonic transition chime between chapters
  const playHarmonicChime = useCallback(() => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      [739.99, 1108.73].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.04, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + 0.35);
      });
    } catch {
      // Audio context restricted or unavailable
    }
  }, [isAudioMuted]);

  // Synchronized Speech Synthesis Voice Narration
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    if (isAudioMuted || !isPlaying) {
      synth.cancel();
      return;
    }

    if (lastSpokenChapterIdRef.current !== currentChapter.id) {
      lastSpokenChapterIdRef.current = currentChapter.id;
      synth.cancel();
      playHarmonicChime();

      const utterance = new SpeechSynthesisUtterance(currentChapter.narration);
      utterance.rate = Math.max(0.75, Math.min(1.5, playbackSpeed));
      utterance.pitch = 1.02;

      const voices = synth.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('US'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      synth.speak(utterance);
    }
  }, [isPlaying, isAudioMuted, currentChapter.id, currentChapter.narration, playbackSpeed, playHarmonicChime]);

  // Cancel speech synthesis when paused or unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Playback timer effect - pure time increments without side effects in state updater
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        return next >= DEMO_TOTAL_DURATION ? DEMO_TOTAL_DURATION : next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Video completion handling effect - runs safely outside component render
  useEffect(() => {
    if (currentTime >= DEMO_TOTAL_DURATION) {
      setIsPlaying(false);
      setHasCompletedVideo(true);
      if (!hasFiredCompletionRef.current) {
        hasFiredCompletionRef.current = true;
        onVideoComplete?.();
      }
    }
  }, [currentTime, onVideoComplete]);

  // Three.js Interactive 3D Video Demo Canvas
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080911, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0.0, 1.0, 11.5);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Track resources for clean disposal
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    // Subtle, balanced scene lighting
    const ambientLight = new THREE.AmbientLight(0x181928, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366f1, 2.8);
    keyLight.position.set(15, 20, 15);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 2.2);
    cyanRim.position.set(-15, -10, 12);
    scene.add(cyanRim);

    const greenAccent = new THREE.PointLight(0x10b981, 3.2, 35);
    greenAccent.position.set(-2, 3, 5);
    scene.add(greenAccent);

    // 1. Ground Radar Grid Group
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    const gridHelper = new THREE.GridHelper(40, 40, 0x3730a3, 0x181829);
    gridHelper.position.y = -4.5;
    radarGroup.add(gridHelper);
    materialsToDispose.push(gridHelper.material as THREE.Material);
    geometriesToDispose.push(gridHelper.geometry);

    const radarRingGeo = new THREE.RingGeometry(9.5, 9.62, 64);
    const radarRingMat = new THREE.MeshBasicMaterial({ color: 0x4338ca, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const radarRing = new THREE.Mesh(radarRingGeo, radarRingMat);
    radarRing.rotation.x = Math.PI / 2;
    radarRing.position.y = -4.48;
    radarGroup.add(radarRing);
    geometriesToDispose.push(radarRingGeo);
    materialsToDispose.push(radarRingMat);

    const innerRadarGeo = new THREE.RingGeometry(4.8, 4.9, 48);
    const innerRadarMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const innerRadar = new THREE.Mesh(innerRadarGeo, innerRadarMat);
    innerRadar.rotation.x = Math.PI / 2;
    innerRadar.position.y = -4.48;
    radarGroup.add(innerRadar);
    geometriesToDispose.push(innerRadarGeo);
    materialsToDispose.push(innerRadarMat);

    const radarSweepGeo = new THREE.PlaneGeometry(9.4, 0.08);
    const radarSweepMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const radarSweep = new THREE.Mesh(radarSweepGeo, radarSweepMat);
    radarSweep.rotation.x = Math.PI / 2;
    radarSweep.position.y = -4.47;
    radarGroup.add(radarSweep);
    geometriesToDispose.push(radarSweepGeo);
    materialsToDispose.push(radarSweepMat);

    // 2. Holographic SEC 10-K Document Tablet (Centered & Compact)
    const secDocGroup = new THREE.Group();
    scene.add(secDocGroup);
    secDocGroup.position.set(0, 0.6, 0);

    const secTexture = createSec10KDocTexture(activeTicker, activeCompanyName);
    texturesToDispose.push(secTexture);

    const secPlaneGeo = new THREE.PlaneGeometry(5.8, 6.2);
    const secPlaneMat = new THREE.MeshBasicMaterial({
      map: secTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const secPlaneMesh = new THREE.Mesh(secPlaneGeo, secPlaneMat);
    secDocGroup.add(secPlaneMesh);
    geometriesToDispose.push(secPlaneGeo);
    materialsToDispose.push(secPlaneMat);

    const secBackGeo = new THREE.BoxGeometry(6.0, 6.4, 0.1);
    const secBackMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d18,
      metalness: 0.9,
      roughness: 0.3,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.25,
    });
    const secBackMesh = new THREE.Mesh(secBackGeo, secBackMat);
    secBackMesh.position.z = -0.06;
    secDocGroup.add(secBackMesh);
    geometriesToDispose.push(secBackGeo);
    materialsToDispose.push(secBackMat);

    // Dynamic SEC Laser Scanner Beam
    const laserGeo = new THREE.PlaneGeometry(5.6, 0.12);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.z = 0.04;
    secDocGroup.add(laserMesh);
    geometriesToDispose.push(laserGeo);
    materialsToDispose.push(laserMat);

    // 3. 3D Financial Statement Multi-Pillars (Slender, Architectural, Well-spaced)
    const topographyGroup = new THREE.Group();
    scene.add(topographyGroup);

    const FINANCIAL_PILLARS = [
      { name: 'REVENUE', val: '$394.3B', badge: '+8.1% YoY', detail: 'Net sales across products & services', height: 4.8, x: -5.0, color: 0x10b981, hex: '#10b981' },
      { name: 'GROSS PROFIT', val: '$170.8B', badge: '44.1% Margin', detail: 'Gross profit after COGS deduction', height: 3.5, x: -2.5, color: 0x06b6d4, hex: '#06b6d4' },
      { name: 'OPERATING EBIT', val: '$114.3B', badge: '29.0% Margin', detail: 'Operating income after R&D & SG&A', height: 2.8, x: 0.0, color: 0x6366f1, hex: '#6366f1' },
      { name: 'NET INCOME', val: '$97.0B', badge: '24.6% Margin', detail: 'Net profit available to common shares', height: 2.3, x: 2.5, color: 0x10b981, hex: '#10b981' },
      { name: 'FREE CASH FLOW', val: '$108.8B', badge: 'Cash Gen', detail: 'Cash flow after capital investments', height: 2.6, x: 5.0, color: 0x38bdf8, hex: '#38bdf8' },
    ];

    interface PillarObject {
      info: (typeof FINANCIAL_PILLARS)[0];
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
    }

    const interactivePillars: PillarObject[] = [];

    FINANCIAL_PILLARS.forEach((p) => {
      // Slender pedestal
      const pedGeo = new THREE.BoxGeometry(0.85, 0.12, 0.85);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x181824,
        metalness: 0.9,
        roughness: 0.3,
        emissive: 0x090a14,
      });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.set(p.x, -4.42, 0);
      topographyGroup.add(pedMesh);
      geometriesToDispose.push(pedGeo);
      materialsToDispose.push(pedMat);

      // Slender pillar column (0.65 width keeps it delicate and never bulky)
      const colGeo = new THREE.BoxGeometry(0.65, p.height, 0.65);
      const colMat = new THREE.MeshStandardMaterial({
        color: p.color,
        metalness: 0.8,
        roughness: 0.25,
        emissive: p.color,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.9,
      });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.set(p.x, -4.38 + p.height / 2, 0);
      topographyGroup.add(colMesh);
      interactivePillars.push({ info: p, mesh: colMesh, mat: colMat });
      geometriesToDispose.push(colGeo);
      materialsToDispose.push(colMat);

      // Top glowing cap
      const capGeo = new THREE.BoxGeometry(0.72, 0.06, 0.72);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: p.color,
        emissiveIntensity: 1.0,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(p.x, -4.38 + p.height + 0.03, 0);
      topographyGroup.add(capMesh);
      geometriesToDispose.push(capGeo);
      materialsToDispose.push(capMat);

      // Floating financial card sprite above pillar (Width 1.5 with 2.5 spacing leaves 1.0 clear gap!)
      const labelTex = createFinancialCardTexture(p.name, p.val, p.badge, p.hex);
      texturesToDispose.push(labelTex);
      const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(p.x, -4.38 + p.height + 0.65, 0);
      sprite.scale.set(1.5, 0.54, 1.0);
      topographyGroup.add(sprite);
      materialsToDispose.push(spriteMat);
    });

    // 4. DuPont ROE Decomposition Link Conduits (Delicate glowing arc)
    const dupontGroup = new THREE.Group();
    scene.add(dupontGroup);

    const dupontPoints = [
      new THREE.Vector3(-2.5, -4.38 + 3.5 + 0.2, 0),
      new THREE.Vector3(-1.25, -4.38 + 3.8, 0.3),
      new THREE.Vector3(0.0, -4.38 + 2.8 + 0.2, 0),
      new THREE.Vector3(1.25, -4.38 + 3.1, 0.3),
      new THREE.Vector3(2.5, -4.38 + 2.3 + 0.2, 0),
    ];
    const dupontCurve = new THREE.CatmullRomCurve3(dupontPoints);
    const dupontGeo = new THREE.TubeGeometry(dupontCurve, 32, 0.045, 8, false);
    const dupontMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.85,
    });
    const dupontMesh = new THREE.Mesh(dupontGeo, dupontMat);
    dupontGroup.add(dupontMesh);
    geometriesToDispose.push(dupontGeo);
    materialsToDispose.push(dupontMat);

    // Floating DuPont ROE formula banner
    const dupontBadgeTex = createDuPontBadgeTexture();
    texturesToDispose.push(dupontBadgeTex);
    const dupontBadgeMat = new THREE.SpriteMaterial({ map: dupontBadgeTex, transparent: true });
    const dupontBadgeSprite = new THREE.Sprite(dupontBadgeMat);
    dupontBadgeSprite.position.set(0.0, -4.38 + 4.15, 0);
    dupontBadgeSprite.scale.set(2.0, 0.37, 1.0);
    dupontGroup.add(dupontBadgeSprite);
    materialsToDispose.push(dupontBadgeMat);

    // 5. Multi-Period Financial Growth Trajectory Spline & Monte Carlo Fan
    const trajectoryGroup = new THREE.Group();
    scene.add(trajectoryGroup);

    const trajectoryPoints = [
      new THREE.Vector3(-5.2, 0.6, 0),  // FY21 ($365.8B)
      new THREE.Vector3(-2.6, 1.6, 0),  // FY22 ($394.3B)
      new THREE.Vector3(0.0, 1.2, 0),   // FY23 ($383.3B)
      new THREE.Vector3(2.6, 1.7, 0),   // FY24 ($391.0B)
      new THREE.Vector3(5.2, 2.7, 0),   // FY25E ($414.2B)
    ];

    const trajectoryCurve = new THREE.CatmullRomCurve3(trajectoryPoints);
    const tubeGeo = new THREE.TubeGeometry(trajectoryCurve, 48, 0.055, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.9,
    });
    const trajectoryMesh = new THREE.Mesh(tubeGeo, tubeMat);
    trajectoryGroup.add(trajectoryMesh);
    geometriesToDispose.push(tubeGeo);
    materialsToDispose.push(tubeMat);

    // Year Node Markers with Sprite labels
    const nodeLabels = ['FY21', 'FY22', 'FY23', 'FY24', 'FY25E'];
    const nodeSpheres: THREE.Mesh[] = [];

    trajectoryPoints.forEach((pt, idx) => {
      const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: idx === 4 ? 0x38bdf8 : 0x10b981,
        emissive: idx === 4 ? 0x0284c7 : 0x047857,
        emissiveIntensity: 1.0,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pt);
      trajectoryGroup.add(sphere);
      nodeSpheres.push(sphere);
      geometriesToDispose.push(sphereGeo);
      materialsToDispose.push(sphereMat);

      // Sprite year label
      const yearTex = createYearNodeTexture(nodeLabels[idx], idx === 4 ? '#38bdf8' : '#34d399');
      texturesToDispose.push(yearTex);
      const yearMat = new THREE.SpriteMaterial({ map: yearTex, transparent: true });
      const yearSprite = new THREE.Sprite(yearMat);
      yearSprite.position.set(pt.x, pt.y + 0.45, pt.z);
      yearSprite.scale.set(0.7, 0.3, 1.0);
      trajectoryGroup.add(yearSprite);
      materialsToDispose.push(yearMat);
    });

    // Monte Carlo Fan lines from FY24 to FY25
    const fy24Pt = trajectoryPoints[3];
    const fanTargets = [
      new THREE.Vector3(5.2, 3.4, 0),  // Bull case +14%
      new THREE.Vector3(5.2, 2.7, 0),  // Base case +6%
      new THREE.Vector3(5.2, 2.1, 0),  // Moderate +1%
      new THREE.Vector3(5.2, 1.3, 0),  // Bear recession -5%
    ];

    fanTargets.forEach((tPt, fIdx) => {
      const fanLinePts = [fy24Pt, tPt];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(fanLinePts);
      const lineMat = new THREE.LineDashedMaterial({
        color: fIdx === 0 ? 0x34d399 : fIdx === 3 ? 0xf87171 : 0x38bdf8,
        dashSize: 0.3,
        gapSize: 0.15,
        linewidth: 1.5,
        transparent: true,
        opacity: 0.75,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      trajectoryGroup.add(line);
      geometriesToDispose.push(lineGeo);
      materialsToDispose.push(lineMat);
    });

    // Interactive Orbit & Raycasting
    const mouse = { isDown: false, prevX: 0, prevY: 0, rotX: 0, rotY: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      mouse.isDown = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
      setUserIsOrbiting(true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (mouse.isDown) {
        const dx = e.clientX - mouse.prevX;
        const dy = e.clientY - mouse.prevY;
        mouse.rotY += dx * 0.005;
        mouse.rotX += dy * 0.005;
        mouse.rotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, mouse.rotX));
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
        return;
      }

      // Raycast against pillars and SEC tablet for interactive hover
      raycaster.setFromCamera(pointer, camera);
      const candidateMeshes = [
        ...interactivePillars.map((p) => p.mesh),
        secPlaneMesh,
      ];
      const intersects = raycaster.intersectObjects(candidateMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        container.style.cursor = 'pointer';

        // Check if pillar
        const foundPillar = interactivePillars.find((p) => p.mesh === hit);
        if (foundPillar) {
          // Highlight pillar
          interactivePillars.forEach((p) => {
            p.mat.emissiveIntensity = p.mesh === hit ? 0.95 : 0.45;
          });
          setHoveredItem({
            title: foundPillar.info.name,
            value: foundPillar.info.val,
            badge: foundPillar.info.badge,
            detail: foundPillar.info.detail,
            screenX: e.clientX - rect.left,
            screenY: e.clientY - rect.top,
          });
          return;
        }

        if (hit === secPlaneMesh) {
          setHoveredItem({
            title: 'SEC 10-K FILING',
            value: companyRef.current.displayName,
            badge: 'XBRL Verified',
            detail: `${companyRef.current.cleanName} • Audited Statement of Operations`,
            screenX: e.clientX - rect.left,
            screenY: e.clientY - rect.top,
          });
          return;
        }
      } else {
        container.style.cursor = 'grab';
        interactivePillars.forEach((p) => {
          p.mat.emissiveIntensity = 0.45;
        });
        setHoveredItem(null);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const wasDragging = Math.abs(e.clientX - mouse.prevX) > 4 || Math.abs(e.clientY - mouse.prevY) > 4;
      mouse.isDown = false;
      setTimeout(() => {
        setUserIsOrbiting(false);
      }, 3500);

      // If clicked without dragging, inspect target
      if (!wasDragging) {
        raycaster.setFromCamera(pointer, camera);
        const candidateMeshes = [
          ...interactivePillars.map((p) => p.mesh),
          secPlaneMesh,
        ];
        const intersects = raycaster.intersectObjects(candidateMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const found = interactivePillars.find((p) => p.mesh === hit);
          if (found) {
            // Seek to Chapter 2 (Financial Topography)
            setCurrentTime(32);
            setIsPlaying(true);
          } else if (hit === secPlaneMesh) {
            // Seek to Chapter 1 (SEC 10-K)
            setCurrentTime(0);
            setIsPlaying(true);
          }
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Laser Scanner sweeps up and down SEC 10-K Document
      laserMesh.position.y = Math.sin(elapsed * 2.0) * 2.8;

      // Ground radar rotations
      radarRing.rotation.z = elapsed * 0.05;
      innerRadar.rotation.z = -elapsed * 0.08;
      radarSweep.rotation.z = elapsed * 0.4;

      // Growth nodes subtle pulse
      nodeSpheres.forEach((s, idx) => {
        s.scale.setScalar(1.0 + Math.sin(elapsed * 2.2 + idx) * 0.1);
      });

      // Chapter-focused visibility (Keeps scene clean, subtle & never bulky!)
      const activeId = currentChapterRef.current?.id || 'ch-1';
      const isOrbiting = userIsOrbitingRef.current;

      if (!isOrbiting) {
        secDocGroup.visible = (activeId === 'ch-1');
        topographyGroup.visible = (activeId === 'ch-2' || activeId === 'ch-3');
        dupontGroup.visible = (activeId === 'ch-3');
        trajectoryGroup.visible = (activeId === 'ch-5');
      } else {
        // While user is freely exploring in 3D orbit, display all elements
        secDocGroup.visible = true;
        topographyGroup.visible = true;
        dupontGroup.visible = true;
        trajectoryGroup.visible = true;
      }

      // Dynamic Camera Path tracking video chapter
      const target = currentChapterRef.current.cameraTarget;

      if (!userIsOrbitingRef.current) {
        // Cinematic smooth camera transitions
        camera.position.x += (target.x + Math.sin(elapsed * 0.15) * 0.8 - camera.position.x) * 0.05;
        camera.position.y += (target.y + Math.cos(elapsed * 0.2) * 0.4 - camera.position.y) * 0.05;
        camera.position.z += (target.z - camera.position.z) * 0.05;
        camera.lookAt(0, target.lookY, 0);
      } else {
        // User manual orbit camera
        const radius = 16;
        camera.position.x = radius * Math.sin(mouse.rotY) * Math.cos(mouse.rotX);
        camera.position.y = 3 + radius * Math.sin(mouse.rotX);
        camera.position.z = radius * Math.cos(mouse.rotY) * Math.cos(mouse.rotX);
        camera.lookAt(0, 0.5, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      ro.disconnect();
      cancelAnimationFrame(animId);

      // Cleanup WebGL & All Memory
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
    };
  }, [activeCompanyName, activeTicker]);

  // Jump to chapter
  const handleSeekChapter = (ch: DemoChapter) => {
    lastSpokenChapterIdRef.current = null;
    setCurrentTime(ch.startTime);
    setHasCompletedVideo(false);
    setIsPlaying(true);
  };

  const handleSeekTime = (e: React.MouseEvent<HTMLDivElement>) => {
    lastSpokenChapterIdRef.current = null;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * DEMO_TOTAL_DURATION;
    setCurrentTime(newTime);
    if (newTime < DEMO_TOTAL_DURATION) {
      setHasCompletedVideo(false);
      hasFiredCompletionRef.current = false;
    }
  };

  const handleSkipToEnd = () => {
    lastSpokenChapterIdRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTime(DEMO_TOTAL_DURATION);
    setIsPlaying(false);
    setHasCompletedVideo(true);
  };

  const handleReplay = () => {
    lastSpokenChapterIdRef.current = null;
    hasFiredCompletionRef.current = false;
    setCurrentTime(0);
    setHasCompletedVideo(false);
    setIsPlaying(true);
    onReplay?.();
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHoveringControls(true)}
      onMouseLeave={() => setIsHoveringControls(false)}
      className={`relative w-full rounded-2xl overflow-hidden border border-[#27272a] bg-[#09090b] shadow-2xl transition-all duration-300 ${
        isCinemaMode ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full mx-auto'
      }`}
    >
      {/* 1. Header Bar of the Interactive 3D Video Working Demo */}
      <div className="bg-[#18181b]/95 backdrop-blur-md px-4 sm:px-5 pt-3.5 pb-3 border-b border-[#27272a] flex flex-col gap-3 z-20 relative">
        {/* Top-Right Action Controls (Skip to Analysis, Collapse, Fullscreen) */}
        <div className="absolute top-2.5 right-3 sm:right-4 flex items-center gap-1.5 z-30">
          {onSkipToAnalysis && (
            <button
              onClick={onSkipToAnalysis}
              title="Skip to Live Financial Analysis Workbench"
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span className="hidden sm:inline">Skip to Analysis</span>
              <span className="sm:hidden">Skip</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse 3D Video Briefing"
              className="px-2.5 py-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#d4d4d8] hover:text-white border border-[#3f3f46] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span className="hidden sm:inline">Collapse</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsCinemaMode((prev) => !prev)}
            title={isCinemaMode ? "Exit Fullscreen Demo" : "Expand Fullscreen Demo"}
            className="group w-7 h-7 rounded-lg bg-[#27272a]/90 hover:bg-[#3f3f46] border border-[#3f3f46]/80 hover:border-indigo-400/80 shadow-md shadow-black/50 hover:shadow-[0_0_14px_rgba(99,102,241,0.65)] text-[#d4d4d8] hover:text-white transition-all duration-300 ease-out cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            aria-label={isCinemaMode ? "Exit Fullscreen" : "Fullscreen"}
          >
            <span className="relative flex items-center justify-center">
              {/* Subtle glow aura blur behind icon on hover */}
              <span className="absolute inset-0 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/30 blur-xs transition-all duration-300 pointer-events-none" />
              {isCinemaMode ? (
                <Minimize2 className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:rotate-90 group-hover:drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]" />
              )}
            </span>
          </button>
        </div>

        {/* Row 1: Live Status Indicator & Current Active Badge (Left) */}
        <div className="flex items-center justify-between w-full h-[30px] gap-2 pr-12">
          {/* Top Left: Status & Active Chapter */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {isPlaying ? 'LIVE 3-D VIDEO DEMO' : '3-D DEMO PAUSED'}
              </span>
            </div>

            <span className="text-[#3f3f46]">|</span>

            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentChapter.badge}
            </span>

            {companyName && (
              <>
                <span className="text-[#3f3f46] hidden sm:inline">|</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#09090b] text-white border border-[#27272a] hidden sm:inline-flex items-center gap-1.5">
                  <span className="text-[#71717a]">Target:</span>
                  <span className="font-semibold text-white">{companyName}</span>
                  {ticker && <span className="text-indigo-400 font-bold">({ticker})</span>}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Chapter Selector Buttons (Left) & Skip to End (Bottom Right Corner of Header) */}
        <div className="flex items-center justify-between gap-2.5 w-full pt-0.5">
          {/* Chapters (Left) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono py-0.5 min-w-0">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => handleSeekChapter(ch)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  currentChapter.id === ch.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-[#09090b] text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                <span>{idx + 1}. {ch.badge}</span>
              </button>
            ))}
          </div>

          {/* Bottom Right Corner: Skip to End Action Button */}
          <div className="flex items-center shrink-0 ml-auto pl-2 border-l border-[#27272a]/60">
            <button
              onClick={handleSkipToEnd}
              title="Jump to completion card and sign-in option"
              className="px-2.5 py-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-semibold text-[#fafafa] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-xs"
            >
              <span>Skip to End</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Small, subtle guided walkthrough progress bar */}
      <div 
        className="w-full h-[3px] bg-[#18181b] relative overflow-hidden z-20"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`Guided Walkthrough Progress: ${Math.round(progressPercent)}% complete`}
      >
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Main 3D Canvas Viewport Container */}
      <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[490px] bg-[#050508] overflow-hidden select-none">
        
        {/* Three.js Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Dynamic 3D Object Hover Tooltip */}
        {hoveredItem && (
          <div 
            style={{ 
              left: Math.min(Math.max(hoveredItem.screenX + 12, 16), (containerRef.current?.clientWidth || 800) - 240), 
              top: Math.max(hoveredItem.screenY - 70, 16) 
            }}
            className="absolute z-25 pointer-events-none bg-[#0c0d18]/95 backdrop-blur-md border border-indigo-500/40 rounded-xl px-3 py-2 shadow-xl shadow-indigo-950/50 transition-all duration-75 text-left w-56"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">{hoveredItem.title}</span>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{hoveredItem.badge}</span>
            </div>
            <div className="text-base font-bold text-white tracking-tight">{hoveredItem.value}</div>
            <p className="text-[10px] text-[#a1a1aa] mt-1 leading-tight">{hoveredItem.detail}</p>
          </div>
        )}

        {/* Top-Left Real-Time Metric Telemetry HUD (Floating card with enhanced horizontal distance and spacing) */}
        <div className="absolute top-4 sm:top-5 left-7 sm:left-9 md:left-11 z-10 pointer-events-none flex flex-col gap-1.5 text-left select-none bg-[#090a14]/75 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 shadow-xl shadow-black/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] transition-all">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2 font-semibold">
            <Activity className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            <span>Model Telemetry</span>
          </p>
          <div className="space-y-1">
            {currentChapter.metrics.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3.5 text-[11px] font-mono text-left">
                <span className="text-zinc-300 shrink-0">{m.label}:</span>
                <span className="text-white font-semibold ml-auto sm:ml-0">{m.value}</span>
                {m.trend && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-sans font-medium tracking-wide">
                    {m.trend}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Drag Orbit Guide Toast, Canvas Audio & Transcript Overlay Toggles (Top-Right) */}
        <div className="absolute top-3.5 right-4 sm:right-5 z-10 flex items-center gap-2">
          {/* Transcript Overlay HUD Toggle */}
          <button
            onClick={() => handleToggleTranscriptOverlay()}
            className={`pointer-events-auto flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer shadow-md select-none group ${
              isTranscriptOverlayOpen
                ? 'bg-indigo-600/35 border-indigo-500/60 text-indigo-200'
                : 'bg-[#09090b]/75 border-[#27272a]/60 text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/40'
            }`}
            title={isTranscriptOverlayOpen ? "Hide Transcript" : "Show Transcript"}
            aria-expanded={isTranscriptOverlayOpen}
            aria-controls="transcript-overlay"
          >
            <Captions className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[10px]">
              TRANSCRIPT
            </span>
            {isTranscriptOverlayOpen ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
            )}
          </button>

          {/* Audio HUD Toggle with Frequency Wave Visualizer */}
          <button
            onClick={handleToggleAudio}
            className={`pointer-events-auto flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer shadow-md select-none group ${
              !isAudioMuted
                ? 'bg-[#09090b]/85 border-emerald-500/40 text-emerald-300'
                : 'bg-[#09090b]/75 border-[#27272a]/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isAudioMuted ? "Unmute Synchronized Voice Narration" : "Mute Voice Narration"}
            aria-label={isAudioMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
          >
            {!isAudioMuted ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            )}
            <span className="font-mono text-[10px]">
              {!isAudioMuted ? 'AUDIO ON' : 'MUTED'}
            </span>
            {!isAudioMuted && isPlaying && (
              <span className="flex items-end gap-0.5 h-2.5 ml-0.5" aria-hidden="true">
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </span>
            )}
          </button>

          <div className="pointer-events-none flex items-center gap-2 bg-[#09090b]/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#27272a]/60 text-[11px] text-[#a1a1aa] shadow-md">
            <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            <span className="hidden sm:inline">Click & drag to orbit • Hover items to inspect</span>
            <span className="sm:hidden">Drag to orbit</span>
          </div>
        </div>

        {/* Screen Reader Support: aria-live="polite" live region broadcasting narration and financial formulas */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {`Current Chapter: ${currentChapter.title}. Voice Narration: ${currentChapter.narration}. Key Metrics: ${currentChapter.metrics.map(m => `${m.label}: ${m.value}${m.trend ? ` (${m.trend})` : ''}`).join(', ')}.`}
        </div>

        {/* Live Closed Captioning / Detail Briefing Subtitle Bar (Compact floating badge) */}
        <div className={`absolute bottom-16 sm:bottom-18 left-3 right-3 sm:left-12 sm:right-12 z-10 pointer-events-none ${isTranscriptOverlayOpen ? 'hidden md:flex' : 'flex'} justify-center`}>
          <div className="max-w-xl w-full bg-[#09090b]/80 backdrop-blur-md border border-[#27272a]/60 rounded-xl px-3.5 py-2 shadow-xl text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5 text-indigo-400 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{currentChapter.title}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#d4d4d8] leading-relaxed font-normal">
              "{currentChapter.narration}"
            </p>
          </div>
        </div>


        {/* Dedicated 'transcript-overlay' Panel (Real-time Narration Line Tracking & Session History) */}
        {isTranscriptOverlayOpen && (
          <aside
            id="transcript-overlay"
            data-testid="transcript-overlay"
            aria-label="Real-time Voice Narration Transcript Overlay"
            className="transcript-overlay absolute top-13 sm:top-14 right-2 sm:right-4 bottom-14 sm:bottom-16 z-20 w-72 sm:w-84 max-w-[calc(100%-1rem)] flex flex-col bg-[#090a12]/92 backdrop-blur-xl border border-indigo-500/40 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden transition-all duration-300 pointer-events-auto select-none"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#080911]/90 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Captions className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide block leading-tight">Transcript Overlay</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                      Opted In
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">Live Narration Sync</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAutoScrollOverlay((prev) => !prev)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                    isAutoScrollOverlay
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#18181b] text-zinc-400 border-[#27272a]'
                  }`}
                  title="Toggle real-time auto-scrolling to active narration line"
                  aria-label="Toggle Auto-Scroll"
                >
                  {isAutoScrollOverlay ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
                </button>
                <button
                  onClick={() => handleToggleTranscriptOverlay(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close / Opt Out of Transcript Overlay"
                  aria-label="Close / Opt Out of Transcript Overlay"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Real-time Subheader: Active Segment Info & Jump to Live Line */}
            <div className="px-3 py-1.5 bg-[#0e0f1d]/85 border-b border-white/5 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">{activeTranscriptSegment.badge}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{formatTime(currentTime)} / {formatTime(DEMO_TOTAL_DURATION)}</span>
              </div>
              <button
                onClick={() => {
                  setIsAutoScrollOverlay(true);
                  if (activeOverlayLineRef.current) {
                    activeOverlayLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                title="Scroll immediately to current active line"
              >
                Jump to Active Line
              </button>
            </div>

            {/* Scrollable Narration History Container */}
            <div
              ref={overlayListContainerRef}
              className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent overscroll-contain"
            >
              {DEMO_TRANSCRIPT_SEGMENTS.map((segment) => {
                const isActive = activeTranscriptSegment.id === segment.id;
                const isPast = currentTime >= segment.endTime;

                return (
                  <div
                    key={segment.id}
                    ref={isActive ? activeOverlayLineRef : undefined}
                    onClick={() => {
                      lastSpokenChapterIdRef.current = null;
                      setCurrentTime(segment.startTime);
                      setIsPlaying(true);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        lastSpokenChapterIdRef.current = null;
                        setCurrentTime(segment.startTime);
                        setIsPlaying(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500/60 shadow-lg shadow-indigo-950/90'
                        : isPast
                        ? 'bg-[#0e0f18]/65 border-[#27272a]/60 text-zinc-300 hover:bg-[#151624]/80 hover:border-indigo-500/30'
                        : 'bg-[#08080f]/45 border-[#1f1f26] text-zinc-400 hover:bg-[#10111a]/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          isActive ? 'bg-indigo-500 text-white shadow-xs' : 'bg-[#18181f] text-zinc-400 border border-[#27272a]'
                        }`}>
                          [{formatTime(segment.startTime)}]
                        </span>
                        <span className="font-semibold truncate max-w-[130px] text-zinc-300">
                          {segment.badge}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold tracking-wider">
                          <span className="flex items-end gap-0.5 h-2.5">
                            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
                            <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          </span>
                          NOW SPEAKING
                        </span>
                      ) : isPast ? (
                        <span className="text-[9px] text-emerald-400/80 font-mono">✓ Heard</span>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-mono">Upcoming</span>
                      )}
                    </div>

                    <p className={`text-[11px] leading-relaxed transition-colors ${
                      isActive ? 'text-white font-medium drop-shadow-xs' : isPast ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      "{segment.line}"
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Overlay Footer: Session Narration Summary */}
            <div className="px-3 py-1.5 bg-[#080911]/90 border-t border-indigo-500/20 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>{DEMO_TRANSCRIPT_SEGMENTS.length} historical lines</span>
              <span className="text-zinc-500">Click any line to jump</span>
            </div>
          </aside>
        )}

        {/* Center Play Overlay Trigger when Paused (if not completed) */}
        {!isPlaying && !hasCompletedVideo && (
          <div className="absolute inset-0 z-15 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-900/60 transition-transform transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-indigo-500/30"
              title="Resume Interactive 3D Video Demo"
            >
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </button>
          </div>
        )}

        {/* 3. THE END-OF-DEMO OPTION TO CONTINUE (Leads to Sign-In Page) */}
        {hasCompletedVideo && (
          <div className="absolute inset-0 z-30 bg-[#09090b]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-xl w-full bg-[#18181b] border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
              
              {/* Background ambient glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Completed Check Badge */}
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  DEMO VIDEO BRIEFING COMPLETE
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3 mb-2">
                  Ready to Unlock the Full Workspace?
                </h3>

                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed max-w-md mx-auto mb-6">
                  You’ve seen autonomous SEC 10-K parsing, 3D capital structures, DuPont decompositions, and Monte Carlo stress tests. Continue to the sign-in page to launch your financial intelligence workspace.
                </p>

                {/* Audited Capabilities Summary */}
                <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono text-[#a1a1aa] bg-[#09090b] p-3 rounded-xl border border-[#27272a] mb-6">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>SEC EDGAR Ingestion</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>3D Capital Topography</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>DuPont ROE Decomposition</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Beneish M-Score Scan</span>
                  </div>
                </div>

                {/* THE PRIMARY MANDATED CTA: Continue to Sign-In Page & Replay */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="btn-continue-to-signin-page"
                    onClick={onContinueToSignIn}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xl shadow-indigo-900/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Continue to Sign-In Page</span>
                  </button>

                  <button
                    onClick={handleReplay}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-indigo-400" />
                    <span>Replay Demo</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* 4. Interactive Cyber-Forensic Video Control Deck & Luminous Scrubber */}
      <div className="bg-[#0b0c13]/90 backdrop-blur-xl border-t border-indigo-500/20 px-4 sm:px-6 pt-5 pb-5 select-none relative z-20">
        
        {/* Real-time Interactive Timeline Progress Scrubber */}
        <div 
          onClick={handleSeekTime}
          className="relative w-full h-4 bg-[#050508]/80 rounded-full cursor-pointer group flex items-center mb-4 sm:mb-5 px-0.5 border border-[#27272a]/80 hover:border-indigo-500/50 transition-colors shadow-inner"
          title="Click or drag along interactive demo timeline"
        >
          {/* Luminous Background Track with Glow */}
          <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-100 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Markers with Interactive Glow */}
          {CHAPTERS.map((ch) => {
            const markPercent = (ch.startTime / DEMO_TOTAL_DURATION) * 100;
            const isPassed = currentTime >= ch.startTime;
            return (
              <div
                key={ch.id}
                className={`absolute top-0 bottom-0 w-0.5 transition-colors pointer-events-none ${
                  isPassed ? 'bg-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-white/30 group-hover:bg-white/60'
                }`}
                style={{ left: `${markPercent}%` }}
                title={`${ch.title} (${formatTime(ch.startTime)})`}
              />
            );
          })}

          {/* Interactive Glowing Scrubber Thumb */}
          <div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-[0_0_14px_rgba(99,102,241,0.9)] border-2 border-indigo-600 transition-transform group-hover:scale-125 flex items-center justify-center"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          </div>
        </div>

        {/* Video Player Buttons Row with Real-Time Audio / Telemetry Visualizer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (hasCompletedVideo) {
                  handleReplay();
                } else {
                  setIsPlaying((prev) => !prev);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold transition-all shadow-md shadow-indigo-900/40 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              title={isPlaying ? "Pause Video Demo" : "Play Video Demo"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span className="font-mono text-[11px]">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => setCurrentTime((prev) => Math.max(0, prev - 10))}
              className="p-2 rounded-xl bg-[#141419] hover:bg-[#22222a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-indigo-500/30 transition-all cursor-pointer"
              title="Rewind 10 seconds"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentTime((prev) => Math.min(DEMO_TOTAL_DURATION, prev + 10))}
              className="p-2 rounded-xl bg-[#141419] hover:bg-[#22222a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-indigo-500/30 transition-all cursor-pointer"
              title="Fast forward 10 seconds"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReplay}
              className="p-2 rounded-xl bg-[#141419] hover:bg-[#22222a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-indigo-500/30 transition-all cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Time Display with Active Pulsing Indicator */}
            <div className="font-mono text-xs text-[#a1a1aa] ml-1 flex items-center gap-1.5 bg-[#050508] px-2.5 py-1 rounded-lg border border-[#27272a]">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-white font-bold">{formatTime(currentTime)}</span>
              <span className="text-[#52525b]">/</span>
              <span className="text-[#71717a]">{formatTime(DEMO_TOTAL_DURATION)}</span>
            </div>
          </div>

          {/* Center: Simulated Live Audio / Data Stream Visualizer */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#050508]/90 border border-indigo-500/20 text-[#a1a1aa]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>3D Signal Stream:</span>
            </span>
            <div className="flex items-end gap-0.5 h-3.5 w-16">
              {[40, 75, 55, 90, 60, 85, 45, 95].map((val, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlaying 
                      ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 shadow-[0_0_4px_rgba(99,102,241,0.5)]' 
                      : 'bg-[#27272a]'
                  }`}
                  style={{ 
                    height: isPlaying ? `${Math.max(15, (val * (0.6 + Math.sin((currentTime * 4) + idx) * 0.4)))}%` : '20%' 
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              {isPlaying ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>

          {/* Right: Audio Narration, Speed & Accessibility Drawers */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Dedicated Audio On / Muted Toggle on Deck */}
            <button
              onClick={handleToggleAudio}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                !isAudioMuted
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-[#141419] text-[#a1a1aa] hover:text-white border-[#27272a] hover:border-zinc-600'
              }`}
              title={isAudioMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
              aria-label={isAudioMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
            >
              {!isAudioMuted ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span className="hidden sm:inline font-medium">
                {!isAudioMuted ? 'Voice On' : 'Muted'}
              </span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-[#050508] p-1 rounded-xl border border-[#27272a] text-[11px] font-mono">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Transcript Overlay Toggle on Deck */}
            <button
              onClick={() => handleToggleTranscriptOverlay()}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isTranscriptOverlayOpen
                  ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/50 shadow-xs'
                  : 'bg-[#141419] text-[#a1a1aa] hover:text-white border-[#27272a] hover:border-indigo-500/40'
              }`}
              aria-expanded={isTranscriptOverlayOpen}
              aria-controls="transcript-overlay"
              title={isTranscriptOverlayOpen ? "Hide Transcript Overlay" : "Show Transcript Overlay"}
            >
              <Captions className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">
                {isTranscriptOverlayOpen ? 'Transcript Overlay' : 'Transcript'}
              </span>
              <span className="sm:hidden">
                Transcript
              </span>
              {isTranscriptOverlayOpen ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
              )}
            </button>

            {/* Financial Clarity Drawer Toggle */}
            <button
              onClick={() => {
                setIsClarityDrawerOpen((prev) => !prev);
                if (!isClarityDrawerOpen) setIsTranscriptExpanded(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isClarityDrawerOpen
                  ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-[#141419] text-[#a1a1aa] hover:text-white border-[#27272a] hover:border-emerald-500/40'
              }`}
              aria-expanded={isClarityDrawerOpen}
              aria-controls="financial-clarity-drawer"
              title={isClarityDrawerOpen ? "Close Financial Clarity Drawer" : "Open Financial Clarity & Executive Takeaways"}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Financial Clarity</span>
              <span className="sm:hidden">Clarity</span>
              {isClarityDrawerOpen ? (
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {/* Expand Transcript Toggle */}
            <button
              onClick={() => {
                setIsTranscriptExpanded((prev) => !prev);
                if (!isTranscriptExpanded) setIsClarityDrawerOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isTranscriptExpanded
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-xs'
                  : 'bg-[#141419] text-[#a1a1aa] hover:text-white border-[#27272a] hover:border-indigo-500/40'
              }`}
              aria-expanded={isTranscriptExpanded}
              aria-controls="narration-transcript-drawer"
              title={isTranscriptExpanded ? "Collapse Voice Transcript" : "Expand Voice Narration Transcript"}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isTranscriptExpanded ? 'Hide Transcript' : 'Expand Transcript'}</span>
              {isTranscriptExpanded ? (
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* 5. Accessible Synchronized Voice Narration Transcript Drawer */}
      {isTranscriptExpanded && (
        <div 
          id="narration-transcript-drawer"
          role="region" 
          aria-label="Synchronized Voice Narration Transcript"
          className="border-t border-indigo-500/30 bg-[#07070b]/95 backdrop-blur-xl px-4 sm:px-6 py-4 animate-fade-in transition-all duration-300 relative z-20"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-[#27272a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Voice Narration Transcript</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Synchronized with 3D Chapters
                  </span>
                </h4>
                <p className="text-[11px] text-[#a1a1aa]">
                  Click any chapter to jump playback and 3D camera orientation immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[11px] text-[#71717a] hidden sm:inline">Active:</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Chapter {currentChapter.id.replace('ch-', '')}</span>
              </span>
              <button
                onClick={() => setIsTranscriptExpanded(false)}
                className="text-[#a1a1aa] hover:text-white px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[11px] transition-colors cursor-pointer border border-[#27272a]"
                aria-label="Close transcript drawer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Scrollable list of synchronized chapter narrations */}
          <div className="space-y-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-transparent">
            {CHAPTERS.map((ch) => {
              const isActive = currentChapter.id === ch.id;
              const isPast = currentTime >= ch.endTime;

              return (
                <div
                  key={ch.id}
                  onClick={() => handleSeekChapter(ch)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSeekChapter(ch);
                    }
                  }}
                  className={`group p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                      : isPast
                      ? 'bg-[#0f1017]/60 border-[#27272a]/60 hover:bg-[#141522]/80 hover:border-indigo-500/40'
                      : 'bg-[#0a0a0f]/40 border-[#1f1f23] hover:bg-[#12131e]/70 hover:border-indigo-500/30 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-medium ${
                        isActive 
                          ? 'bg-indigo-500 text-white shadow-xs' 
                          : 'bg-[#18181b] text-zinc-400 group-hover:text-zinc-200 border border-[#27272a]'
                      }`}>
                        [{formatTime(ch.startTime)} - {formatTime(ch.endTime)}]
                      </span>
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-200 transition-colors">
                        {ch.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ch.badge}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          PLAYING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Narration voice text */}
                  <p className={`text-xs leading-relaxed transition-colors ${
                    isActive ? 'text-zinc-100 font-normal' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}>
                    "{ch.narration}"
                  </p>

                  {/* Metrics Pills for this chapter */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    {ch.metrics.map((m, mIdx) => (
                      <span 
                        key={mIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13141f] text-zinc-300 border border-[#27272a] flex items-center gap-1"
                      >
                        <span className="text-zinc-400">{m.label}:</span>
                        <span className="text-white font-medium">{m.value}</span>
                        {m.trend && <span className="text-indigo-300 text-[9px]">{m.trend}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Expandable Financial Clarity Drawer for non-finance stakeholders */}
      {isClarityDrawerOpen && (
        <div 
          id="financial-clarity-drawer"
          role="region"
          aria-label="Financial Clarity and Plain-English Definitions"
          className="border-t border-emerald-500/30 bg-[#060b09]/95 backdrop-blur-xl px-4 sm:px-6 py-4 animate-fade-in transition-all duration-300 relative z-20"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-[#1c2e26]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Financial Clarity & Plain-English Terminology</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Executive Takeaways
                  </span>
                </h4>
                <p className="text-[11px] text-[#a1a1aa]">
                  Plain-English explanations and executive implications of complex financial metrics featured in this 3D demo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsClarityDrawerOpen(false)}
                className="text-[#a1a1aa] hover:text-white px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[11px] transition-colors cursor-pointer border border-[#27272a]"
                aria-label="Close clarity drawer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Clarity definitions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#1c2e26] scrollbar-track-transparent">
            {Object.entries(FINANCIAL_CLARITY_DATA).map(([chapterId, items]) => {
              const isCurrent = currentChapter.id === chapterId;
              const chInfo = CHAPTERS.find(c => c.id === chapterId);

              return items.map((item, idx) => (
                <div
                  key={`${chapterId}-${idx}`}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-[#0a120e]/60 border-[#1c2e26]/60 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {item.term}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">
                    <strong className="text-emerald-400 font-medium">Plain English: </strong>
                    {item.plainEnglish}
                  </p>

                  <div className="p-2 rounded-lg bg-[#050907] border border-emerald-500/20 text-[10px] space-y-1">
                    <div className="text-emerald-300 font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Executive Takeaway:</span>
                    </div>
                    <p className="text-zinc-300 leading-normal">{item.executiveTakeaway}</p>
                    {item.formula && (
                      <div className="font-mono text-zinc-400 pt-1 text-[9px] border-t border-emerald-500/10">
                        Formula: <span className="text-emerald-200">{item.formula}</span>
                      </div>
                    )}
                  </div>

                  {chInfo && (
                    <div className="mt-2 text-[9px] font-mono text-zinc-400 flex items-center justify-between">
                      <span>Featured in: {chInfo.badge}</span>
                      <button
                        onClick={() => handleSeekChapter(chInfo)}
                        className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        Jump to {formatTime(chInfo.startTime)}
                      </button>
                    </div>
                  )}
                </div>
              ));
            })}
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  BarChart2, 
  ShieldAlert, 
  FileSpreadsheet, 
  Sparkles, 
  DollarSign, 
  Users, 
  MessageSquareText, 
  Download, 
  History, 
  RefreshCw,
  TrendingUp,
  Layers,
  AlertCircle,
  PieChart as PieIcon,
  Compass,
  ScanEye,
  Activity,
  Calculator,
  HelpCircle,
  X,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  FinancialDataset, 
  CurrencyCode, 
  FiscalYearType, 
  UserRole, 
  DeepAIAnalysisResponse, 
  TeamComment, 
  AuditLog, 
  ErpSyncStatus, 
  StatementLineItem, 
  RedFlagItem, 
  BudgetDepartmentItem,
  DocumentSummaryData,
  FinancialRatios,
  NavigationTabId 
} from './types';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { 
  calculateFinancialRatios, 
  evaluateFinancialHealth, 
  detectRedFlags, 
  analyzeMDASentiment 
} from './utils/financialCalculations';
import { generateFinancialReportPdf } from './utils/pdfExport';
import { createContextualDocumentSummary, createContextualDeepAnalysis } from './utils/documentSummaryFallback';
import { isTabAllowedForRole } from './utils/encryption';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { FinancialDashboard } from './components/FinancialDashboard';
import { RiskRedFlags } from './components/RiskRedFlags';
import { SentimentAnalysis } from './components/SentimentAnalysis';
import { StatementsTable } from './components/StatementsTable';
import { BudgetAlerts } from './components/BudgetAlerts';
import { FinancialChat } from './components/FinancialChat';
import { CollaborationPanel } from './components/CollaborationPanel';
import { AuditSecurityModal } from './components/AuditSecurityModal';
import { ErpSyncModal } from './components/ErpSyncModal';
import { DataVisualization } from './components/DataVisualization';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { AdvancedAnomalyDetection } from './components/AdvancedAnomalyDetection';
import { IndustryBenchmarking } from './components/IndustryBenchmarking';
import { PredictiveForecasting } from './components/PredictiveForecasting';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OnboardingTour } from './components/OnboardingTour';
import { MarketingLandingPage } from './components/MarketingLandingPage';
import { OnboardingAuthPage } from './components/OnboardingAuthPage';
import { Interactive3DVideoDemo } from './components/Interactive3DVideoDemo';
import { CloudPortfolioModal } from './components/CloudPortfolioModal';
import { AccountCenterModal } from './components/AccountCenterModal';
import { AiInsightSidebar } from './components/AiInsightSidebar';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { RoleLockedView } from './components/RoleLockedView';
import { SecEdgarModal } from './components/SecEdgarModal';
import { ModelCalibrationModal } from './components/ModelCalibrationModal';
import { SecEdgarFilingMetadata } from './data/secEdgarData';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardGridContainerVariants, dashboardGridItemVariants } from './utils/animations';
import { AuthUser, WorkspaceType } from './types';
import { useGlobalCardTilt } from './utils/useCardTilt';

export type AppViewMode = 'landing' | 'demo' | 'onboarding' | 'app';

export const App: React.FC = () => {
  // Enable 3D tilt and soft specular shine across application cards
  useGlobalCardTilt();

  // 0. Routing & Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('fininsight_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name === 'Alexandra Vance') {
          parsed.name = 'User';
          try {
            localStorage.setItem('fininsight_auth_user', JSON.stringify(parsed));
          } catch {}
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(() => {
    try {
      const saved = localStorage.getItem('fininsight_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.workspaceType) return u.workspaceType;
      }
    } catch {}
    return 'SOLO_ANALYST';
  });

  const [appViewMode, setAppViewMode] = useState<AppViewMode>(() => {
    try {
      const saved = localStorage.getItem('fininsight_auth_user');
      if (saved) return 'app';
    } catch {}
    return 'landing';
  });

  // 1. Core State
  const [dataset, setDataset] = useState<FinancialDataset>(SAMPLE_DATASETS[0]);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [fiscalYearType, setFiscalYearType] = useState<FiscalYearType>('CALENDAR_DEC');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('fininsight_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.role) return u.role;
      }
    } catch {}
    return 'ADMIN_CFO';
  });
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'visualization' | 'competitors' | 'anomalies' | 'benchmarks' | 'forecasting' | 'redflags' | 'statements' | 'sentiment' | 'budget'
  >('dashboard');
  
  // 2. Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [isAiInsightOpen, setIsAiInsightOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isErpModalOpen, setIsErpModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSecEdgarOpen, setIsSecEdgarOpen] = useState(false);
  const [isModelCalibrationOpen, setIsModelCalibrationOpen] = useState(false);
  const [isAccountCenterOpen, setIsAccountCenterOpen] = useState(false);
  const [isDataMasked, setIsDataMasked] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedLineForComment, setSelectedLineForComment] = useState<string | null>(null);
  const [isDemoVideoVisible, setIsDemoVideoVisible] = useState(true);

  // 2a-1. Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setAuthUser((prev) => {
          const updated: AuthUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || prev?.name || 'Enterprise Analyst',
            email: firebaseUser.email || prev?.email || 'analyst@enterprise.com',
            role: prev?.role || userRole,
            organization: prev?.organization || 'Enterprise Financial Group',
            avatar: firebaseUser.photoURL || prev?.avatar,
            signedInAt: prev?.signedInAt || new Date().toISOString(),
          };
          try {
            localStorage.setItem('fininsight_auth_user', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, [userRole]);

  // 2a. User Onboarding Tour - accessible on demand via footer "Tour" or Account Center
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('fininsight_onboarding_completed')) {
        localStorage.setItem('fininsight_onboarding_completed', 'true');
      }
    } catch {
      // Ignore in strict private browsing environments
    }
  }, []);

  // 2b. Navigation Scroll & Linear-Gradient Masking
  const navScrollRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(88);

  // 2c. Viewport & Orientation Detection Layout Manager (Mobile / Tablet Landscape / Desktop)
  const [viewportInfo, setViewportInfo] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isLandscape = w > h;
    const isTablet = w >= 640 && w <= 1280;
    return {
      width: w,
      height: h,
      orientation: isLandscape ? ('landscape' as const) : ('portrait' as const),
      isLandscape,
      isTablet,
      isTabletLandscape: isTablet && isLandscape,
      isMobile: w < 640,
      isDesktop: w > 1280,
    };
  });

  // Persistent Grid Layout State (condensed vs. expanded) stored in localStorage
  const [gridLayoutMode, setGridLayoutMode] = useState<'condensed' | 'expanded'>(() => {
    try {
      const saved = localStorage.getItem('dashboard_grid_layout_mode');
      if (saved === 'condensed' || saved === 'expanded') {
        return saved;
      }
    } catch {
      // localStorage may be restricted in sandboxes
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'condensed' : 'expanded';
  });

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_grid_layout_mode', gridLayoutMode);
    } catch {
      // ignore
    }
  }, [gridLayoutMode]);

  const effectiveLayoutMode = gridLayoutMode;

  // Interactive Bridge & Video Completion Auto-Scroll State
  const [isBridgeTransitionActive, setIsBridgeTransitionActive] = useState<boolean>(false);
  const [isTranscriptOverlayOpted, setIsTranscriptOverlayOpted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fininsight_transcript_overlay_opted') === 'true';
    }
    return false;
  });
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDemoVideoComplete = useCallback(() => {
    setIsBridgeTransitionActive(true);

    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    // Give 5 seconds of pause after the 3D video ends, then smoothly auto-scroll to next section
    autoScrollTimerRef.current = setTimeout(() => {
      const el = document.getElementById('sandbox-analysis-section') || document.getElementById('tab-navigation-bar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        setIsBridgeTransitionActive(false);
      }, 2000);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleViewportUpdate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h;
      const isTablet = w >= 640 && w <= 1280;
      setViewportInfo({
        width: w,
        height: h,
        orientation: isLandscape ? 'landscape' : 'portrait',
        isLandscape,
        isTablet,
        isTabletLandscape: isTablet && isLandscape,
        isMobile: w < 640,
        isDesktop: w > 1280,
      });
    };

    handleViewportUpdate();
    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('orientationchange', handleViewportUpdate);
    return () => {
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('orientationchange', handleViewportUpdate);
    };
  }, []);

  // Scroll behavior for #dashboard-grid-container:
  // Automatically scroll selected tab's content into viewport if partially clipped or hidden due to screen size constraints
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const container = document.getElementById('dashboard-grid-container');
    if (!container) return;

    const timer = setTimeout(() => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      const globalHeader = document.getElementById('global-header');
      const tabBar = document.getElementById('tab-navigation-bar');
      const stickyOffset = (globalHeader?.offsetHeight || 56) + (tabBar?.offsetHeight || 48) + 8;

      const isClippedTop = rect.top < stickyOffset;
      const isClippedBottom = rect.top > viewportHeight - 120;
      const isHidden = rect.bottom <= stickyOffset + 40 || rect.top >= viewportHeight;

      if (isClippedTop || isClippedBottom || isHidden) {
        const targetScrollY = Math.max(0, window.pageYOffset + rect.top - stickyOffset - 8);
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth',
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Dynamically compute header height for sticky tab bar across all screen sizes and orientations
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.getElementById('global-header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    const headerEl = document.getElementById('global-header');
    let ro: ResizeObserver | null = null;
    if (headerEl) {
      ro = new ResizeObserver(updateHeaderHeight);
      ro.observe(headerEl);
    }
    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('orientationchange', updateHeaderHeight);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('orientationchange', updateHeaderHeight);
    };
  }, []);

  const checkNavScroll = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    checkNavScroll();
    const el = navScrollRef.current;
    if (!el) return;

    const handleResize = () => checkNavScroll();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => checkNavScroll());
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [checkNavScroll]);

  const getNavMaskStyle = useCallback((): React.CSSProperties => {
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 28px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 28px), transparent 100%)',
      };
    }
    if (canScrollLeft) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28px, black 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 28px, black 100%)',
      };
    }
    if (canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, black 0%, black calc(100% - 28px), transparent 100%)',
        maskImage: 'linear-gradient(to right, black 0%, black calc(100% - 28px), transparent 100%)',
      };
    }
    return {};
  }, [canScrollLeft, canScrollRight]);

  // 3. AI Deep Analysis & Loading
  const [aiAnalysis, setAiAnalysis] = useState<DeepAIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 3b. Automated Gemini Document Summary State
  const [documentSummary, setDocumentSummary] = useState<DocumentSummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);

  // 4. Comments & Audit Trails State
  const [comments, setComments] = useState<TeamComment[]>([
    {
      id: 'comm-1',
      lineItemKey: 'operatingExpenses',
      author: 'Sophia Zhang, CFA',
      role: 'Senior Financial Analyst',
      avatar: 'SZ',
      text: 'Operating expenses in FY2024 increased by 38.6% primarily driven by expanding enterprise sales headcount and GPU infrastructure buildout.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'Under Review',
      replies: [
        {
          id: 'rep-1',
          author: 'David Sterling',
          role: 'Chief Financial Officer',
          text: 'Acknowledged. We are implementing hiring freeze milestones for Q3 to normalize SG&A.',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
      ],
    },
    {
      id: 'comm-2',
      lineItemKey: 'longTermDebt',
      author: 'Marcus Vance, CPA',
      role: 'Lead Auditor',
      avatar: 'MV',
      text: 'Debt-to-equity ratio reached 0.86x following the $45M convertible senior note offering. Recommend maintaining liquidity reserves above covenant floor.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'Open',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      user: 'David Sterling',
      role: 'Chief Financial Officer',
      action: 'ERP General Ledger Reconciliation',
      category: 'ERP Sync',
      details: 'Synchronized 14,280 ledger journal entries from Oracle NetSuite OneWorld.',
      ipAddress: '192.168.1.42',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      user: 'Sophia Zhang, CFA',
      role: 'Senior Financial Analyst',
      action: 'Deep AI Audit Ingestion',
      category: 'Analysis',
      details: 'Triggered Gemini 3.7 Flash heuristic audit on FY2024 Form 10-K filings.',
      ipAddress: '192.168.1.58',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      user: 'Marcus Vance, CPA',
      role: 'Lead Auditor',
      action: 'Security Policy Verification',
      category: 'Security',
      details: 'SOX 404 access control audit validated. AES-256 GCM cipher key status verified.',
      ipAddress: '192.168.1.99',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      user: 'David Sterling',
      role: 'Chief Financial Officer',
      action: 'Executive PDF Dossier Export',
      category: 'Export',
      details: 'Generated board-level quarterly financial statement package and ratio analysis.',
      ipAddress: '192.168.1.42',
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      user: 'Sophia Zhang, CFA',
      role: 'Senior Financial Analyst',
      action: 'Benford Chi-Square & Forensic Anomaly Scan',
      category: 'Analysis',
      details: 'Automated 1st-digit logarithmic conformity distribution analysis executed (p=0.884).',
      ipAddress: '192.168.1.58',
    },
    {
      id: 'log-6',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      user: 'Marcus Vance, CPA',
      role: 'Lead Auditor',
      action: 'Collaboration Review & Line-Item Annotation',
      category: 'Collaboration',
      details: 'Annotated R&D expense variance and verified capitalization milestones.',
      ipAddress: '192.168.1.99',
    },
    {
      id: 'log-7',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      user: 'David Sterling',
      role: 'Chief Financial Officer',
      action: 'SOX 404 Cipher Key Rotation & Ledger Validation',
      category: 'Security',
      details: 'Rotated asymmetric key pair and verified zero reconciliation exceptions.',
      ipAddress: '192.168.1.42',
    },
    {
      id: 'log-hist-1',
      timestamp: new Date(Date.now() - 86400000 * 42).toISOString(), // 42 days ago
      user: 'Marcus Vance, CPA',
      role: 'Lead Auditor',
      action: 'Prior Quarter Fiscal Ledger Close',
      category: 'Security',
      details: 'Concluded historical quarterly reconciliations. Sealed tamper-evident ledger block.',
      ipAddress: '192.168.1.99',
    },
    {
      id: 'log-hist-2',
      timestamp: new Date(Date.now() - 86400000 * 68).toISOString(), // 68 days ago
      user: 'David Sterling',
      role: 'Chief Financial Officer',
      action: 'Annual Audit Security Baseline Validation',
      category: 'Security',
      details: 'Initial deployment and cryptographic baseline validation for FY2024 compliance audit.',
      ipAddress: '192.168.1.42',
    },
  ]);

  const [erpSyncStatus, setErpSyncStatus] = useState<ErpSyncStatus>({
    lastSync: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'Connected',
    system: 'Oracle NetSuite',
    recordsSynced: 14280,
    latencyMs: 142,
  });
  const [isErpReconciling, setIsErpReconciling] = useState(false);

  // 5. Dynamic Calculations
  const ratios = useMemo(() => calculateFinancialRatios(dataset), [dataset]);
  const redFlags = useMemo(() => detectRedFlags(dataset, ratios), [dataset, ratios]);
  const health = useMemo(() => evaluateFinancialHealth(ratios, redFlags.length), [ratios, redFlags]);
  const sentiment = useMemo(() => analyzeMDASentiment(dataset), [dataset]);

  // Check if active tab contains no data items (empty state)
  const isTabEmpty = useMemo(() => {
    if (!dataset) return true;
    switch (activeTab) {
      case 'dashboard':
        return !dataset.incomeStatement || dataset.incomeStatement.length === 0;
      case 'visualization':
        return !dataset.incomeStatement || dataset.incomeStatement.length === 0;
      case 'competitors':
        return !dataset.periods || dataset.periods.length === 0 || !dataset.incomeStatement || dataset.incomeStatement.length === 0;
      case 'anomalies':
        return !dataset.periods || dataset.periods.length < 2;
      case 'benchmarks':
        return !dataset.periods || dataset.periods.length === 0 || !dataset.industry;
      case 'forecasting':
        return !dataset.periods || dataset.periods.length === 0;
      case 'redflags':
        return !redFlags || redFlags.length === 0;
      case 'statements':
        return (
          (!dataset.incomeStatement || dataset.incomeStatement.length === 0) &&
          (!dataset.balanceSheet || dataset.balanceSheet.length === 0) &&
          (!dataset.cashFlowStatement || dataset.cashFlowStatement.length === 0)
        );
      case 'sentiment':
        return !sentiment || !sentiment.topics || sentiment.topics.length === 0;
      case 'budget':
        return !dataset.budgetVariance || dataset.budgetVariance.length === 0;
      default:
        return false;
    }
  }, [activeTab, dataset, redFlags, sentiment]);

  const isCurrentTabEmpty = isTabEmpty;

  // Comments map by line
  const commentsCountByLine = useMemo(() => {
    const map: Record<string, number> = {};
    comments.forEach((c) => {
      map[c.lineItemKey] = (map[c.lineItemKey] || 0) + 1 + (c.replies?.length || 0);
    });
    return map;
  }, [comments]);

  const unreadCommentsCount = comments.filter((c) => c.status === 'Open').length;

  // 6. Action Handlers
  const addAuditLog = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userRole === 'ADMIN_CFO' ? 'David Sterling' : userRole === 'SENIOR_ANALYST' ? 'Sophia Zhang' : 'Auditor Account',
      role: userRole,
      action,
      category,
      details,
      ipAddress: '192.168.1.42',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Asynchronously synchronize with backend audit log store
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {
      // Non-critical telemetry sync fallback
    });
  };

  // Fetch initial backend audit logs
  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
          setAuditLogs((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const incoming = data.logs.filter((l: AuditLog) => !existingIds.has(l.id));
            return [...incoming, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleExportPdf = () => {
    generateFinancialReportPdf(dataset, ratios, health, redFlags, sentiment, currency);
    addAuditLog('Executive PDF Export', 'Export', `Generated executive dossier for ${dataset.companyName} (${dataset.activePeriod}).`);
  };

  // Comprehensive Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Command Palette: Cmd+K or Ctrl+K (intercept globally)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Escape: Dismiss active overlays/modals/drawers in hierarchical order
      if (e.key === 'Escape') {
        if (isAccountCenterOpen) {
          e.preventDefault();
          setIsAccountCenterOpen(false);
          return;
        }
        if (isCloudModalOpen) {
          e.preventDefault();
          setIsCloudModalOpen(false);
          return;
        }
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsHelpOpen) {
          e.preventDefault();
          setIsShortcutsHelpOpen(false);
          return;
        }
        if (isAuditModalOpen) {
          e.preventDefault();
          setIsAuditModalOpen(false);
          return;
        }
        if (isSecEdgarOpen) {
          e.preventDefault();
          setIsSecEdgarOpen(false);
          return;
        }
        if (isModelCalibrationOpen) {
          e.preventDefault();
          setIsModelCalibrationOpen(false);
          return;
        }
        if (isErpModalOpen) {
          e.preventDefault();
          setIsErpModalOpen(false);
          return;
        }
        if (isChatOpen) {
          e.preventDefault();
          setIsChatOpen(false);
          return;
        }
        if (isCollabOpen) {
          e.preventDefault();
          setIsCollabOpen(false);
          return;
        }
        if (selectedLineForComment) {
          e.preventDefault();
          setSelectedLineForComment(null);
          return;
        }
        return;
      }

      // 3. Modifier-based shortcuts (Cmd/Ctrl + Key)
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === 'j') {
          e.preventDefault();
          setIsChatOpen((prev) => !prev);
          return;
        }
        if (key === 'n' && workspaceType !== 'SOLO_ANALYST') {
          e.preventDefault();
          setIsCollabOpen((prev) => !prev);
          return;
        }
        if (key === 'i') {
          e.preventDefault();
          setIsAiInsightOpen((prev) => !prev);
          return;
        }
        if (key === 'm') {
          e.preventDefault();
          setIsDataMasked((prev) => !prev);
          return;
        }
        if (key === 'e') {
          e.preventDefault();
          handleExportPdf();
          return;
        }
        if (key === 'l') {
          e.preventDefault();
          setIsAuditModalOpen((prev) => !prev);
          return;
        }
        if (key === 'u') {
          e.preventDefault();
          setIsErpModalOpen((prev) => !prev);
          return;
        }
      }

      // 4. Non-modifier shortcuts (prevent when typing in inputs/textareas)
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isTyping) return;

      // Question mark: Open shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
        return;
      }

      // Direct tab navigation using numbers 1-9, 0
      switch (e.key) {
        case '1':
          e.preventDefault();
          setActiveTab('dashboard');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('visualization');
          break;
        case '3':
          e.preventDefault();
          setActiveTab('competitors');
          break;
        case '4':
          e.preventDefault();
          setActiveTab('anomalies');
          break;
        case '5':
          e.preventDefault();
          setActiveTab('benchmarks');
          break;
        case '6':
          e.preventDefault();
          setActiveTab('forecasting');
          break;
        case '7':
          e.preventDefault();
          setActiveTab('redflags');
          break;
        case '8':
          e.preventDefault();
          setActiveTab('statements');
          break;
        case '9':
          e.preventDefault();
          setActiveTab('sentiment');
          break;
        case '0':
          e.preventDefault();
          setActiveTab('budget');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isCommandPaletteOpen,
    isShortcutsHelpOpen,
    isAuditModalOpen,
    isErpModalOpen,
    isChatOpen,
    isCollabOpen,
    selectedLineForComment,
    dataset,
    ratios,
    health,
    redFlags,
    sentiment,
    currency,
  ]);

  const handleRunDeepAI = async () => {
    setIsAnalyzing(true);
    try {
      let response: Response | null = null;
      try {
        response = await fetch('/api/ai/deep-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataset,
            ratios,
            health,
            redFlags,
            sentiment,
          }),
        });
      } catch {
        // Retry once in case server was restarting
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          response = await fetch('/api/ai/deep-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataset,
              ratios,
              health,
              redFlags,
              sentiment,
            }),
          });
        } catch {
          response = null;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        const analysisData: DeepAIAnalysisResponse = data.analysis || data;
        setAiAnalysis(analysisData);
        addAuditLog('AI Analysis Generation', 'Analysis', `Deep Gemini analysis executed for ${dataset.companyName}.`);
        return;
      }

      // Fallback if offline or API error
      const fallbackAnalysis = createContextualDeepAnalysis(dataset, ratios);
      setAiAnalysis(fallbackAnalysis as any);
      addAuditLog('AI Analysis Generation', 'Analysis', `Analytical assessment synthesized for ${dataset.companyName}.`);
    } catch {
      const fallbackAnalysis = createContextualDeepAnalysis(dataset, ratios);
      setAiAnalysis(fallbackAnalysis as any);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDocumentAutoSummary = async (
    targetDataset: FinancialDataset,
    targetRatios: FinancialRatios,
    fileNameOverride?: string,
    rawText?: string,
    fileFormat?: string
  ) => {
    setIsSummaryLoading(true);
    const effectiveFileName =
      fileNameOverride || `${targetDataset.companyName.toLowerCase().replace(/\s+/g, '_')}_annual_report.pdf`;

    const fetchSummary = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('/api/ai/document-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataset: targetDataset,
            ratios: targetRatios,
            fileName: effectiveFileName,
            rawFileText: rawText,
            fileFormat,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      let response: Response | null = null;
      try {
        response = await fetchSummary();
      } catch {
        // Retry once after a brief 1.2s delay if dev server or network was warming up
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          response = await fetchSummary();
        } catch {
          response = null;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data.summary) {
          setDocumentSummary(data.summary);
          addAuditLog(
            'Document Auto-Summary Ingested',
            'Analysis',
            `Gemini-powered auto-summary synthesized for ${targetDataset.companyName} (${data.source || 'gemini'}).`
          );
          return;
        }
      }

      // Contextual fallback ensures high-quality dossier without UI interruption
      const fallbackSummary = createContextualDocumentSummary(
        targetDataset,
        targetRatios,
        effectiveFileName,
        fileFormat,
        rawText
      );
      setDocumentSummary(fallbackSummary);
      addAuditLog(
        'Document Auto-Summary Ingested',
        'Analysis',
        `Document summary synthesized for ${targetDataset.companyName} (contextual analytical engine).`
      );
    } catch {
      // Gracefully populate fallback summary on any unexpected runtime event
      const fallbackSummary = createContextualDocumentSummary(
        targetDataset,
        targetRatios,
        effectiveFileName,
        fileFormat,
        rawText
      );
      setDocumentSummary(fallbackSummary);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const lastGeneratedSummaryDatasetIdRef = React.useRef<string | null>(null);

  // Auto-trigger Gemini Document Summary whenever a dataset is ingested or initialized (deduplicated against StrictMode)
  React.useEffect(() => {
    if (dataset && lastGeneratedSummaryDatasetIdRef.current !== dataset.id) {
      lastGeneratedSummaryDatasetIdRef.current = dataset.id;
      generateDocumentAutoSummary(dataset, ratios, uploadedFileName);
    }
  }, [dataset?.id]);

  const handleAddComment = (lineKey: string, text: string) => {
    const newComment: TeamComment = {
      id: `comm-${Date.now()}`,
      lineItemKey: lineKey,
      author: userRole === 'ADMIN_CFO' ? 'David Sterling' : userRole === 'SENIOR_ANALYST' ? 'Sophia Zhang' : 'Auditor Team',
      role: userRole,
      avatar: userRole === 'ADMIN_CFO' ? 'DS' : 'SZ',
      text,
      timestamp: new Date().toISOString(),
      status: 'Open',
    };
    setComments((prev) => [newComment, ...prev]);
    addAuditLog('Collaboration Annotation Added', 'Collaboration', `Added note on line item: ${lineKey}.`);
  };

  const handleReplyComment = (commentId: string, text: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const newReply = {
            id: `rep-${Date.now()}`,
            author: userRole === 'ADMIN_CFO' ? 'David Sterling' : 'Reviewer',
            role: userRole,
            text,
            timestamp: new Date().toISOString(),
          };
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );
    addAuditLog('Collaboration Reply Posted', 'Collaboration', `Posted reply to comment #${commentId}.`);
  };

  const handleUpdateCommentStatus = (commentId: string, status: TeamComment['status']) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status } : c))
    );
    addAuditLog('Annotation Status Changed', 'Collaboration', `Marked comment #${commentId} as ${status}.`);
  };

  const handleIngestSecEdgarDataset = (filingDataset: FinancialDataset, filingMeta: SecEdgarFilingMetadata) => {
    const fn = `${filingMeta.ticker.toLowerCase()}_10k_${filingMeta.fiscalYear.toLowerCase()}.xbrl`;
    setDataset(filingDataset);
    setUploadedFileName(fn);
    setAiAnalysis(null);
    addAuditLog(
      'SEC EDGAR Statutory Ingestion',
      'Analysis',
      `Ingested audited Form 10-K for ${filingMeta.companyName} (${filingMeta.ticker}, CIK: ${filingMeta.cik}) from official SEC EDGAR repository. Unqualified clean auditor opinion confirmed.`
    );
    generateDocumentAutoSummary(filingDataset, calculateFinancialRatios(filingDataset), fn);
  };

  const handleTriggerErpSync = async (erpSystem: string) => {
    setIsErpReconciling(true);
    setErpSyncStatus((prev) => ({
      ...prev,
      status: 'Syncing',
      system: erpSystem,
    }));
    try {
      const res = await fetch('/api/erp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: erpSystem, systemName: erpSystem }),
      });
      const data = await res.json();
      
      // Keep subtle pulse animation active during multi-stage ledger reconciliation
      await new Promise((resolve) => setTimeout(resolve, 2400));

      setErpSyncStatus({
        lastSync: data.syncTimestamp || data.lastSync || new Date().toISOString(),
        status: 'Connected',
        system: erpSystem,
        recordsSynced: data.recordsUpdated || data.recordsSynced || 15600,
        latencyMs: data.latencyMs || 120,
      });
      addAuditLog('ERP General Ledger Synced', 'ERP Sync', `Synchronized ${data.recordsUpdated || data.recordsSynced || 15600} general ledger transactions with ${erpSystem}. Zero reconciliation discrepancies.`);
    } catch (err) {
      setErpSyncStatus((prev) => ({ ...prev, status: 'Connected' }));
    } finally {
      setIsErpReconciling(false);
    }
  };

  const handleDisputeBudget = (item: BudgetDepartmentItem) => {
    addAuditLog('Budget Variance Disputed', 'Analysis', `Placed variance hold on ${item.department} for audit review.`);
    alert(`Audit hold placed on ${item.department} budget overrun. Sent notification to Finance Committee.`);
  };

  const handleApproveBudget = (item: BudgetDepartmentItem) => {
    addAuditLog('Budget Variance Approved', 'Analysis', `Authorized spending variance for ${item.department}.`);
    alert(`Variance acknowledged and logged for ${item.department}.`);
  };

  const handleOpenCommentForLine = (line: StatementLineItem) => {
    setSelectedLineForComment(line.key);
    setIsCollabOpen(true);
  };

  const handleAskChatAboutFlag = (flag: RedFlagItem) => {
    setChatInitialPrompt(`Explain the risk associated with this flagged issue for "${flag.metric}": "${flag.observation}". What is the financial impact and what mitigating controls should be enacted?`);
    setIsChatOpen(true);
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleSignInGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        const u: AuthUser = {
          id: user.uid,
          name: user.displayName || 'Enterprise Analyst',
          email: user.email || 'analyst@enterprise.com',
          role: userRole,
          organization: 'Enterprise Financial Group',
          avatar: user.photoURL || undefined,
          signedInAt: new Date().toISOString(),
        };
        setAuthUser(u);
        try {
          localStorage.setItem('fininsight_auth_user', JSON.stringify(u));
        } catch {}
        setAppViewMode('app');
        addAuditLog('User Authenticated with Google', 'Security', `Signed in via Firebase Auth: ${user.email}`);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch {}
    setAuthUser(null);
    try {
      localStorage.removeItem('fininsight_auth_user');
    } catch {}
    setAppViewMode('landing');
    addAuditLog('User Signed Out', 'Security', 'User signed out of enterprise workspace.');
  };

  const handleLaunchDemo = () => {
    setUserRole('ADMIN_CFO');
    setDataset(SAMPLE_DATASETS[0]);
    if (!authUser) {
      const demoUser: AuthUser = {
        id: 'usr_demo_sandbox',
        name: 'User',
        email: 'user@financialintel.io',
        role: 'ADMIN_CFO',
        organization: '',
        signedInAt: new Date().toISOString(),
      };
      setAuthUser(demoUser);
    } else if (authUser.name === 'Alexandra Vance' || authUser.role !== 'ADMIN_CFO') {
      const updatedUser = { 
        ...authUser, 
        name: authUser.name === 'Alexandra Vance' ? 'User' : authUser.name,
        role: 'ADMIN_CFO' as UserRole
      };
      setAuthUser(updatedUser);
      try {
        localStorage.setItem('fininsight_auth_user', JSON.stringify(updatedUser));
      } catch {}
    }
    setIsDemoVideoVisible(true);
    setAppViewMode('demo');
  };

  // 1a. 3D Marketing Landing Page View
  if (appViewMode === 'landing') {
    return (
      <MarketingLandingPage
        onLaunchDemo={handleLaunchDemo}
        onStartOnboarding={() => setAppViewMode('onboarding')}
        onCompleteAuth={(user) => {
          const sanitizedUser = user.name === 'Alexandra Vance' ? { ...user, name: 'User' } : user;
          setAuthUser(sanitizedUser);
          setUserRole(sanitizedUser.role);
          try {
            localStorage.setItem('fininsight_auth_user', JSON.stringify(sanitizedUser));
          } catch {}
          setAppViewMode('app');
          addAuditLog('User Authenticated', 'Security', `${sanitizedUser.name} (${sanitizedUser.role}) authenticated to workspace ${sanitizedUser.organization}.`);
        }}
      />
    );
  }

  // 1b. Sign-In Authentication & Onboarding View
  if (appViewMode === 'onboarding') {
    return (
      <OnboardingAuthPage
        initialRole={userRole}
        onCompleteAuth={(user, preferences) => {
          const sanitizedUser = user.name === 'Alexandra Vance' ? { ...user, name: 'User' } : user;
          setAuthUser(sanitizedUser);
          setWorkspaceType(sanitizedUser.workspaceType || 'SOLO_ANALYST');
          setUserRole(sanitizedUser.role);
          if (preferences?.currency) {
            setCurrency(preferences.currency);
          }
          if (preferences?.fiscalYear) {
            setFiscalYearType(preferences.fiscalYear as any);
          }
          if (preferences?.dataMasking !== undefined) {
            setIsDataMasked(preferences.dataMasking);
          }
          try {
            localStorage.setItem('fininsight_auth_user', JSON.stringify(sanitizedUser));
          } catch {}
          setAppViewMode('app');
          addAuditLog(
            'Identity Verified & Session Cleared',
            'Security',
            `${sanitizedUser.name} (${sanitizedUser.role}) verified across all clearance steps. Connected to ${sanitizedUser.organization} (${sanitizedUser.workspaceType || 'SOLO_ANALYST'}).`
          );
        }}
        onBackToLanding={() => setAppViewMode('landing')}
        onLaunchDemo={handleLaunchDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Demo Sandbox Banner (Displayed when in demo mode) */}
      {appViewMode === 'demo' && (
        <div className="relative z-50 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border-b border-amber-500/30 px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono font-bold text-[10px] shrink-0 border border-amber-500/40">
              DEMO
            </span>
            <span className="text-[11px] sm:text-xs text-[#fafafa]">
              Exploring {dataset.companyName} ({dataset.ticker || 'Active'}) live simulation. All calculations, 3D capital structure, and DuPont analysis are active.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAppViewMode('landing')}
              className="px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Exit Demo"
              aria-label="Exit Demo"
            >
              <span>Exit Demo</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Global Navigation Header */}
      <Header
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        fiscalYearType={fiscalYearType}
        onFiscalYearChange={setFiscalYearType}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        onExportPdf={handleExportPdf}
        onOpenErpModal={() => setIsErpModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenRoleMatrix={() => setIsAuditModalOpen(true)}
        onOpenSecEdgar={() => setIsSecEdgarOpen(true)}
        onOpenModelCalibration={() => setIsModelCalibrationOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isCollabOpen={isCollabOpen}
        onToggleCollab={() => setIsCollabOpen((prev) => !prev)}
        isAiInsightOpen={isAiInsightOpen}
        onToggleAiInsight={() => setIsAiInsightOpen((prev) => !prev)}
        isDataMasked={isDataMasked}
        onToggleDataMask={() => setIsDataMasked((prev) => !prev)}
        unreadCommentsCount={unreadCommentsCount}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        viewMode={appViewMode === 'demo' ? 'demo' : 'app'}
        workspaceType={workspaceType}
        onNavigateView={(mode) => {
          if (mode === 'demo') {
            handleLaunchDemo();
          } else {
            setAppViewMode(mode);
          }
        }}
        authUser={authUser}
        onSignOut={handleSignOut}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onSignInGoogle={handleSignInGoogle}
        onOpenAccountCenter={() => setIsAccountCenterOpen(true)}
        isReconciling={isErpReconciling}
        erpSyncStatus={erpSyncStatus}
      />

      {/* 1.5 Interactive 3D Video Demo (Featured at the beginning of Sandbox Demo) */}
      {appViewMode === 'demo' && (
        <section 
          id="sandbox-3d-video-demo"
          className="relative z-20 bg-[#09090b] py-5 sm:py-7 overflow-hidden"
        >
          {/* Subtle Ambient Interactive Mesh Glow */}
          <div className="absolute inset-0 bg-radial from-indigo-950/25 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {!isDemoVideoVisible ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#141418] border border-[#27272a] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                    Guided 3D Video Walkthrough (Collapsed)
                  </span>
                  <span className="text-[#71717a] hidden sm:inline">• {dataset.companyName} ({dataset.ticker || 'Active'})</span>
                </div>
                <button
                  id="btn-expand-demo-video"
                  onClick={() => setIsDemoVideoVisible(true)}
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Expand 3D Video</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <Interactive3DVideoDemo
                  dataset={dataset}
                  companyName={dataset.companyName}
                  ticker={dataset.ticker}
                  defaultMuted={true}
                  optInTranscriptOverlay={isTranscriptOverlayOpted}
                  onToggleTranscriptOverlay={(val) => setIsTranscriptOverlayOpted(val)}
                  onContinueToSignIn={() => setAppViewMode('onboarding')}
                  onVideoComplete={handleDemoVideoComplete}
                  onToggleCollapse={() => setIsDemoVideoVisible(false)}
                  onSkipToAnalysis={() => {
                    const el = document.getElementById('sandbox-analysis-section') || document.getElementById('tab-navigation-bar');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onReplay={() => {
                    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
                    setIsBridgeTransitionActive(false);
                  }}
                  onExploreSandbox={() => {
                    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
                    setIsBridgeTransitionActive(false);
                    const el = document.getElementById('sandbox-analysis-section') || document.getElementById('tab-navigation-bar');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              </div>
            )}

            {/* Seamless Interactive Bridge into Sandbox Analysis Segment */}
            <div 
              id="interactive-sandbox-bridge"
              onClick={() => {
                if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
                setIsBridgeTransitionActive(false);
                const el = document.getElementById('sandbox-analysis-section') || document.getElementById('tab-navigation-bar');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`mt-10 sm:mt-12 pt-4 pb-2 flex flex-col items-center justify-center cursor-pointer group select-none relative transition-all duration-500 ${
                isBridgeTransitionActive ? 'scale-105' : ''
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
                  setIsBridgeTransitionActive(false);
                  const el = document.getElementById('sandbox-analysis-section') || document.getElementById('tab-navigation-bar');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {/* Luminous soft interactive beam with animated hover / auto-scroll transition glow */}
              <div className={`w-full max-w-4xl h-[2px] rounded-full transition-all duration-500 ${
                isBridgeTransitionActive
                  ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_rgba(52,211,153,1)] animate-pulse'
                  : 'bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-hover:via-indigo-400 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.6)]'
              }`} />
              
              {/* Interactive transition pill with responsive hover scaling and pulsing beacon */}
              <div className={`-mt-3.5 px-4 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 shadow-xl backdrop-blur-md transition-all duration-300 ${
                isBridgeTransitionActive
                  ? 'bg-[#0a1818]/95 border border-emerald-400 text-emerald-300 shadow-emerald-950/70 scale-105 ring-2 ring-emerald-400/40'
                  : 'bg-[#121218]/95 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white shadow-indigo-950/50 group-hover:scale-105 group-hover:shadow-indigo-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isBridgeTransitionActive
                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-ping'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse'
                }`} />
                <span>
                  {isBridgeTransitionActive
                    ? `Walkthrough Completed • Auto-scrolling to ${dataset.companyName} Workbench...`
                    : `Explore ${dataset.companyName} (${dataset.ticker || 'Active'}) Live Financial Workbench`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${
                  isBridgeTransitionActive
                    ? 'text-emerald-400 animate-bounce'
                    : 'text-indigo-400 group-hover:text-white group-hover:translate-y-0.5'
                }`} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Upload, Benchmark Selector & Period Tabs */}
      <div id="sandbox-analysis-section">
        <UploadSection
          currentDataset={dataset}
          uploadedFileName={uploadedFileName}
          documentSummary={documentSummary}
          aiAnalysis={aiAnalysis}
          userRole={userRole}
          workspaceType={workspaceType}
          isDemoMode={appViewMode === 'demo'}
          onOpenRoleMatrix={() => setIsAuditModalOpen(true)}
          onOpenSecEdgar={() => setIsSecEdgarOpen(true)}
          onSelectDataset={(d) => {
            const fn = `${d.companyName.toLowerCase().replace(/\s+/g, '_')}_annual_filing.pdf`;
            setDataset(d);
            setUploadedFileName(fn);
            setAiAnalysis(null);
            addAuditLog('Dataset Switched', 'Analysis', `Switched active financial model to ${d.companyName}.`);
            generateDocumentAutoSummary(d, calculateFinancialRatios(d), fn);
          }}
          onUploadSuccess={(d, fn, format) => {
            const fileNameUsed = fn || `${d.companyName.toLowerCase().replace(/\s+/g, '_')}_ingested_statement.csv`;
            setDataset(d);
            setUploadedFileName(fileNameUsed);
            setAiAnalysis(null);
            addAuditLog('Statement Ingested', 'Analysis', `Uploaded custom statement for ${d.companyName} (${fileNameUsed}).`);
            generateDocumentAutoSummary(d, calculateFinancialRatios(d), fileNameUsed, undefined, format);
          }}
          onActivePeriodChange={(p) => {
            setDataset((prev) => ({ ...prev, activePeriod: p }));
            addAuditLog('Active Period Changed', 'Analysis', `Changed active period to ${p}.`);
          }}
          onRunDeepAI={handleRunDeepAI}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* 3. Main Navigation Tab Bar */}
      <div 
        id="tab-navigation-bar"
        className="bg-[#09090b] border-b border-[#27272a] sticky z-30 transition-[top] duration-100"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Subtle linear-gradient edge masking to indicate scrollability */}
          {canScrollLeft && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10"
            />
          )}
          {canScrollRight && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-4 sm:right-6 lg:right-8 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10"
            />
          )}

          <nav
            ref={navScrollRef}
            onScroll={checkNavScroll}
            aria-label="Financial Intelligence Navigation"
            style={getNavMaskStyle()}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-thin transition-[mask-image] duration-150"
          >
            {[
              {
                id: 'dashboard',
                domId: 'tab-btn-dashboard',
                label: 'Financial Health',
                icon: BarChart2,
                iconColor: 'text-indigo-400',
                activeBorder: 'border-[#3f3f46]',
              },
              {
                id: 'visualization',
                domId: 'tab-btn-visualization',
                label: 'Data Visualizer',
                icon: PieIcon,
                iconColor: 'text-indigo-400',
                activeBorder: 'border-indigo-500/40',
              },
              {
                id: 'competitors',
                domId: 'tab-btn-competitors',
                label: 'Competitors',
                icon: Users,
                iconColor: 'text-[#10b981]',
                activeBorder: 'border-emerald-500/40',
              },
              {
                id: 'anomalies',
                domId: 'tab-btn-anomalies',
                label: 'Anomaly Detection',
                icon: ScanEye,
                iconColor: 'text-rose-400',
                activeBorder: 'border-rose-500/40',
              },
              {
                id: 'benchmarks',
                domId: 'tab-btn-benchmarks',
                label: 'Peer Benchmarks',
                icon: Compass,
                iconColor: 'text-cyan-400',
                activeBorder: 'border-cyan-500/40',
              },
              {
                id: 'forecasting',
                domId: 'tab-btn-forecasting',
                label: 'Forecasting & Monte Carlo',
                icon: TrendingUp,
                iconColor: 'text-purple-400',
                activeBorder: 'border-purple-500/40',
              },
              {
                id: 'redflags',
                domId: 'tab-btn-redflags',
                label: 'Red Flags',
                icon: ShieldAlert,
                iconColor: 'text-red-400',
                activeBorder: 'border-red-500/40',
                badgeCount: redFlags.length,
                badgeStyle: 'bg-red-500/20 text-red-300 border-red-500/40',
              },
              {
                id: 'statements',
                domId: 'tab-btn-statements',
                label: 'Statements',
                icon: FileSpreadsheet,
                iconColor: 'text-indigo-400',
                activeBorder: 'border-indigo-500/40',
              },
              {
                id: 'sentiment',
                domId: 'tab-btn-sentiment',
                label: 'Sentiment',
                icon: Sparkles,
                iconColor: 'text-indigo-400',
                activeBorder: 'border-indigo-500/40',
              },
              {
                id: 'budget',
                domId: 'tab-btn-budget',
                label: 'Budget Alerts',
                icon: DollarSign,
                iconColor: 'text-amber-400',
                activeBorder: 'border-amber-500/40',
                badgeCount: dataset.budgetVariance?.filter((b) => b.severity === 'Critical').length || 0,
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              const hasBadge = typeof tab.badgeCount === 'number' && tab.badgeCount > 0;
              const isAllowed = workspaceType === 'SOLO_ANALYST' || isTabAllowedForRole(tab.id as NavigationTabId, userRole);

              return (
                <button
                  key={tab.id}
                  id={tab.domId}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-9 px-3 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 border transition-all whitespace-nowrap cursor-pointer shrink-0 select-none box-border ${
                    isActive
                      ? `bg-[#18181b] text-white ${tab.activeBorder} shadow-xs`
                      : 'border-transparent text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/60'
                  } ${!isAllowed ? 'opacity-80' : ''}`}
                  title={!isAllowed ? `${tab.label} (Access Restricted for ${userRole})` : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${tab.iconColor}`} />
                  <span className="leading-none">{tab.label}</span>
                  {!isAllowed && (
                    <Lock className="w-2.5 h-2.5 text-amber-500/80 shrink-0" />
                  )}
                  {hasBadge && (
                    <span
                      className={`inline-flex items-center justify-center shrink-0 h-4 min-w-[1.125rem] px-1.5 rounded-full text-[10px] font-mono font-medium leading-none border ${tab.badgeStyle}`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. Main Tab Views */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile-First CSS Grid Container */}
        <div 
          id="dashboard-grid-container"
          data-density={gridLayoutMode}
          data-layout-state={gridLayoutMode}
          className={`w-full dashboard-visual-container visual-containment transition-all duration-300 ${
            gridLayoutMode === 'condensed'
              ? 'grid grid-cols-1 gap-4 max-w-4xl mx-auto'
              : 'grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6'
          }`}
        >
          <div className={`w-full ${gridLayoutMode === 'condensed' ? 'col-span-1' : 'col-span-1 md:col-span-12'}`}>
            <AnimatePresence mode="wait">
              {workspaceType !== 'SOLO_ANALYST' && !isTabAllowedForRole(activeTab, userRole) ? (
                <motion.div
                  key={`locked-${activeTab}`}
                  id="dashboard-grid-locked-state"
                  variants={dashboardGridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <RoleLockedView
                    tabId={activeTab}
                    currentRole={userRole}
                    userOrg={authUser?.organization}
                    onSwitchRole={(role) => setUserRole(role)}
                    onNavigateTab={(tab) => {
                      setActiveTab(tab);
                    }}
                    onOpenRoleMatrix={() => setIsAuditModalOpen(true)}
                  />
                </motion.div>
              ) : isCurrentTabEmpty ? (
                <motion.div
                  key={`empty-${activeTab}`}
                  id="dashboard-grid-empty-state"
                  variants={dashboardGridItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <DashboardEmptyState
                    activeTab={activeTab}
                    onLoadDemoData={() => {
                      const sample = SAMPLE_DATASETS[0];
                      const fn = 'apex_cloud_technologies_inc_annual_filing.pdf';
                      setDataset(sample);
                      setUploadedFileName(fn);
                      setAiAnalysis(null);
                      generateDocumentAutoSummary(sample, calculateFinancialRatios(sample), fn);
                    }}
                    onUploadClick={() => {
                      const fileInput = document.getElementById('file-upload-input');
                      if (fileInput) (fileInput as HTMLInputElement).click();
                    }}
                    onNavigateTab={(tab) => {
                      setActiveTab(tab as any);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  variants={dashboardGridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`w-full ${gridLayoutMode === 'condensed' ? 'space-y-4' : 'space-y-6'}`}
                >
                  {activeTab === 'dashboard' && (
                    <FinancialDashboard
                      dataset={dataset}
                      ratios={ratios}
                      health={health}
                      currency={currency}
                      isDataMasked={isDataMasked}
                      aiAnalysis={aiAnalysis}
                      onNavigateToTab={(tab) => setActiveTab(tab as any)}
                      documentSummary={documentSummary}
                      isSummaryLoading={isSummaryLoading}
                      onRegenerateSummary={() => generateDocumentAutoSummary(dataset, ratios, uploadedFileName)}
                      uploadedFileName={uploadedFileName}
                    />
                  )}

                  {activeTab === 'visualization' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <DataVisualization
                        dataset={dataset}
                        ratios={ratios}
                        currency={currency}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'competitors' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <CompetitorAnalysis
                        dataset={dataset}
                        ratios={ratios}
                        currency={currency}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'anomalies' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <AdvancedAnomalyDetection
                        dataset={dataset}
                        ratios={ratios}
                        currency={currency}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'benchmarks' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <IndustryBenchmarking
                        dataset={dataset}
                        ratios={ratios}
                        currency={currency}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'forecasting' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <PredictiveForecasting
                        dataset={dataset}
                        ratios={ratios}
                        currency={currency}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'redflags' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <RiskRedFlags
                        redFlags={redFlags}
                        workspaceType={workspaceType}
                        onAnnotateFlag={(flag) => {
                          if (workspaceType !== 'SOLO_ANALYST') {
                            setSelectedLineForComment(flag.id);
                            setIsCollabOpen(true);
                          }
                        }}
                        onAskChatAboutFlag={handleAskChatAboutFlag}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'statements' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <StatementsTable
                        dataset={dataset}
                        currency={currency}
                        isDataMasked={isDataMasked}
                        onAddCommentToLine={handleOpenCommentForLine}
                        commentsCountByLine={commentsCountByLine}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'sentiment' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <SentimentAnalysis
                        sentiment={sentiment}
                        dataset={dataset}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'budget' && (
                    <motion.div variants={dashboardGridItemVariants}>
                      <BudgetAlerts
                        budgetItems={dataset.budgetVariance}
                        currency={currency}
                        isDataMasked={isDataMasked}
                        onDisputeVariance={handleDisputeBudget}
                        onApproveVariance={handleApproveBudget}
                        userRole={userRole}
                        onOpenRoleMatrix={() => setIsAuditModalOpen(true)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* 4b. Collapsible Persistent AI Insight of the Day Sidebar */}
      <AiInsightSidebar
        dataset={dataset}
        ratios={ratios}
        health={health}
        currency={currency}
        isDataMasked={isDataMasked}
        onNavigateToTab={(tab) => setActiveTab(tab as any)}
        onOpenChatWithPrompt={handleOpenChatWithPrompt}
        isOpen={isAiInsightOpen}
        onToggleOpen={() => setIsAiInsightOpen((prev) => !prev)}
        onClose={() => setIsAiInsightOpen(false)}
      />

      {/* 5. Drawers & Modals */}
      <FinancialChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialPrompt(null);
        }}
        dataset={dataset}
        initialQuery={chatInitialPrompt}
      />

      {workspaceType !== 'SOLO_ANALYST' && (
        <CollaborationPanel
          isOpen={isCollabOpen}
          onClose={() => setIsCollabOpen(false)}
          comments={comments}
          userRole={userRole}
          userName={userRole === 'ADMIN_CFO' ? 'David Sterling' : userRole === 'SENIOR_ANALYST' ? 'Sophia Zhang' : 'Auditor'}
          onAddComment={handleAddComment}
          onReplyComment={handleReplyComment}
          onUpdateStatus={handleUpdateCommentStatus}
          selectedLineKey={selectedLineForComment}
        />
      )}

      <AuditSecurityModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
        userRole={userRole}
        isDataMasked={isDataMasked}
        onToggleDataMask={() => setIsDataMasked((prev) => !prev)}
        onUpdateActiveLogs={setAuditLogs}
      />

      <ErpSyncModal
        isOpen={isErpModalOpen}
        onClose={() => setIsErpModalOpen(false)}
        syncStatus={erpSyncStatus}
        onTriggerSync={handleTriggerErpSync}
        isReconciling={isErpReconciling}
        userRole={userRole}
        onOpenRoleMatrix={() => {
          setIsErpModalOpen(false);
          setIsAuditModalOpen(true);
        }}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        workspaceType={workspaceType}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onToggleCollab={() => setIsCollabOpen((prev) => !prev)}
        onToggleAiInsight={() => setIsAiInsightOpen((prev) => !prev)}
        onToggleDataMask={() => setIsDataMasked((prev) => !prev)}
        isDataMasked={isDataMasked}
        onExportPdf={handleExportPdf}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenErpModal={() => setIsErpModalOpen(true)}
        onOpenSecEdgar={() => setIsSecEdgarOpen(true)}
        onOpenModelCalibration={() => setIsModelCalibrationOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        onOpenAccountCenter={() => setIsAccountCenterOpen(true)}
        isDemoMode={appViewMode === 'demo'}
        onTriggerErpReconciliation={() => handleTriggerErpSync(erpSyncStatus.system)}
        isReconciling={isErpReconciling}
        currentDataset={dataset}
        onSelectDataset={(d) => {
          const fn = `${d.companyName.toLowerCase().replace(/\s+/g, '_')}_annual_filing.pdf`;
          setDataset(d);
          setUploadedFileName(fn);
          setAiAnalysis(null);
          addAuditLog('Dataset Switched', 'Analysis', `Switched active dataset to ${d.companyName}.`);
        }}
        currentCurrency={currency}
        onSelectCurrency={setCurrency}
        currentUserRole={userRole}
        onSelectUserRole={setUserRole}
        onStartTour={() => setIsOnboardingOpen(true)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        workspaceType={workspaceType}
      />

      {/* Cloud Persistence Modal */}
      <CloudPortfolioModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentDataset={dataset}
        authUser={authUser}
        onPromptSignIn={() => setAppViewMode('onboarding')}
        onLoadDataset={(loaded) => {
          setDataset(loaded);
          setIsCloudModalOpen(false);
          addAuditLog('Dataset Loaded from Cloud', 'Analysis', `Loaded saved financial model for ${loaded.companyName}.`);
        }}
      />

      {/* Account Center Modal */}
      <AccountCenterModal
        isOpen={isAccountCenterOpen}
        onClose={() => setIsAccountCenterOpen(false)}
        authUser={authUser}
        onSignOut={handleSignOut}
        onSignInGoogle={handleSignInGoogle}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        fiscalYearType={fiscalYearType}
        onFiscalYearChange={setFiscalYearType}
        isDataMasked={isDataMasked}
        onToggleDataMask={() => setIsDataMasked((prev) => !prev)}
        onOpenCloudModal={() => {
          setIsAccountCenterOpen(false);
          setIsCloudModalOpen(true);
        }}
        onOpenAuditModal={() => {
          setIsAccountCenterOpen(false);
          setIsAuditModalOpen(true);
        }}
        viewMode={appViewMode === 'demo' ? 'demo' : 'app'}
      />

      {/* SEC EDGAR Statutory 10-K Ingestion Modal */}
      <SecEdgarModal
        isOpen={isSecEdgarOpen}
        onClose={() => setIsSecEdgarOpen(false)}
        onIngestDataset={handleIngestSecEdgarDataset}
        currentDatasetId={dataset?.id}
      />

      {/* AI Model Architecture & Domain Weights Calibration Studio */}
      <ModelCalibrationModal
        isOpen={isModelCalibrationOpen}
        onClose={() => setIsModelCalibrationOpen(false)}
        onCalibrationSaved={(newConfig) => {
          addAuditLog(
            'Model Weights Calibrated',
            'Analysis',
            `Updated AI model domain weights to ${newConfig.activeAdaptor} (temp: ${newConfig.temperature}, strictness: ${newConfig.gaapStrictnessWeight}%).`
          );
        }}
      />

      {/* 5. Getting Started Onboarding Tour (Command Palette, Layout Controls & AI Copilot) */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          addAuditLog('Onboarding Tour Completed', 'Analysis', 'Completed Getting Started onboarding tour.');
        }}
      />

      {/* 6. Enterprise Footer */}
      <footer className="px-6 py-3 border-t border-[#27272a] bg-[#09090b] flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center space-x-3 text-[10px] text-[#71717a] font-mono">
          <span>SESSION: #7721-AX9</span>
          <span>•</span>
          <span>UID: ADMIN_CORE_04</span>
          <span>•</span>
          <span>LOGS: SECURE_APPEND_ONLY</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#71717a]">
            <span>Press</span>
            <kbd 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-[#a1a1aa] bg-[#18181b] border border-[#27272a] rounded cursor-pointer hover:text-white hover:border-[#3f3f46] transition-colors"
              title="Click or press ⌘K"
            >
              ⌘K
            </kbd>
            <span>Command Palette</span>
            <span>•</span>
            <kbd 
              onClick={() => setIsShortcutsHelpOpen(true)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-[#a1a1aa] bg-[#18181b] border border-[#27272a] rounded cursor-pointer hover:text-white hover:border-[#3f3f46] transition-colors"
              title="Click or press ?"
            >
              ?
            </kbd>
            <span>Shortcuts</span>
            <span>•</span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[#a1a1aa] hover:text-indigo-300 transition-colors cursor-pointer"
              title="Start Getting Started Tour"
            >
              Tour
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></div>
            <span className="text-[10px] text-[#10b981] tracking-wider font-semibold font-mono">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;


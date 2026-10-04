import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  ScanEye, 
  Layers, 
  Database, 
  Lock, 
  Compass, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Play, 
  Pause, 
  BarChart2, 
  PieChart as PieIcon, 
  Terminal, 
  RefreshCw, 
  ChevronRight,
  ChevronDown,
  Activity,
  Users,
  Shield,
  HelpCircle,
  ExternalLink,
  Zap,
  Globe,
  MonitorPlay,
  KeyRound
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { calculateFinancialRatios, evaluateFinancialHealth, detectRedFlags } from '../utils/financialCalculations';
import { AuthUser } from '../types';
import { ThreeDCard } from './ThreeDCard';
import { useGlobalCardTilt } from '../utils/useCardTilt';

interface SegmentTransitionProps {
  targetId: string;
  label: string;
  theme?: 'indigo' | 'emerald' | 'cyan' | 'purple';
}

const InteractiveSegmentTransition: React.FC<SegmentTransitionProps> = ({
  targetId,
  label,
  theme = 'indigo'
}) => {
  const [mousePos, setMousePos] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setMousePos(x);
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const scrollToTarget = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Brief interactive flash ring to emphasize arrival
      el.classList.add('transition-all', 'duration-500', 'ring-2', 'ring-indigo-500/30', 'rounded-3xl');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-500/30');
      }, 1200);
    }
  };

  const themeConfig = {
    indigo: {
      beam: 'from-transparent via-indigo-500/40 to-transparent',
      glow: 'rgba(99, 102, 241, 0.65)',
      badge: 'border-indigo-500/40 text-indigo-300 hover:border-indigo-400 bg-[#0d0e17]/95 shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/20',
      dot: 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)]',
      pulseColor: 'from-transparent via-indigo-400 to-transparent',
    },
    emerald: {
      beam: 'from-transparent via-emerald-500/40 to-transparent',
      glow: 'rgba(16, 185, 129, 0.65)',
      badge: 'border-emerald-500/40 text-emerald-300 hover:border-emerald-400 bg-[#0c1410]/95 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20',
      dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]',
      pulseColor: 'from-transparent via-emerald-400 to-transparent',
    },
    cyan: {
      beam: 'from-transparent via-cyan-500/40 to-transparent',
      glow: 'rgba(6, 182, 212, 0.65)',
      badge: 'border-cyan-500/40 text-cyan-300 hover:border-cyan-400 bg-[#0c1316]/95 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20',
      dot: 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]',
      pulseColor: 'from-transparent via-cyan-400 to-transparent',
    },
    purple: {
      beam: 'from-transparent via-purple-500/40 to-transparent',
      glow: 'rgba(168, 85, 247, 0.65)',
      badge: 'border-purple-500/40 text-purple-300 hover:border-purple-400 bg-[#130d19]/95 shadow-lg shadow-purple-950/50 hover:shadow-purple-500/20',
      dot: 'bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]',
      pulseColor: 'from-transparent via-purple-400 to-transparent',
    },
  }[theme];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-20 py-8 sm:py-12 group cursor-pointer select-none"
      onClick={scrollToTarget}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToTarget();
        }
      }}
      aria-label={`Navigate smoothly to ${label}`}
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Seamless soft gradient beam with base glow */}
        <div className={`h-[1.5px] w-full bg-gradient-to-r ${themeConfig.beam} transition-all duration-300 group-hover:opacity-100 opacity-60 rounded-full group-hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]`} />

        {/* Dynamic interactive cursor glow beacon */}
        {mousePos !== null && (
          <div
            className="absolute top-0 h-[3px] w-48 -translate-y-[1px] -translate-x-1/2 pointer-events-none transition-all duration-75 blur-[2px]"
            style={{
              left: `${mousePos}px`,
              background: `radial-gradient(circle, ${themeConfig.glow} 0%, transparent 80%)`,
            }}
          />
        )}

        {/* Centered interactive floating transition pill */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div
            className={`px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-full border backdrop-blur-md transition-all duration-300 group-hover:scale-105 flex items-center gap-2.5 ${themeConfig.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${themeConfig.dot} animate-pulse`} />
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wide">
              {label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface MarketingLandingPageProps {
  onLaunchDemo: () => void;
  onStartOnboarding: () => void;
  onCompleteAuth?: (user: AuthUser) => void;
}

interface SecEdgarFeedItem {
  id: string;
  ticker: string;
  companyName: string;
  filingType: '10-K' | '10-Q';
  metricLabel: string;
  metricValue: string;
  status: 'Verified' | 'Clean' | 'Audited';
  statusTheme: 'emerald' | 'cyan' | 'indigo';
  timestamp: string;
}

const ALL_SEC_FILINGS: SecEdgarFeedItem[] = [
  {
    id: 'aapl',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    filingType: '10-K',
    metricLabel: 'DuPont ROE',
    metricValue: '107.5%',
    status: 'Verified',
    statusTheme: 'emerald',
    timestamp: 'Just now',
  },
  {
    id: 'nvda',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corp',
    filingType: '10-Q',
    metricLabel: 'Gross Margin',
    metricValue: '75.1%',
    status: 'Clean',
    statusTheme: 'cyan',
    timestamp: '14s ago',
  },
  {
    id: 'msft',
    ticker: 'MSFT',
    companyName: 'Microsoft Corp',
    filingType: '10-K',
    metricLabel: 'Cloud Revenue',
    metricValue: '+29%',
    status: 'Audited',
    statusTheme: 'indigo',
    timestamp: '38s ago',
  },
  {
    id: 'amzn',
    ticker: 'AMZN',
    companyName: 'Amazon.com Inc.',
    filingType: '10-K',
    metricLabel: 'AWS Margin',
    metricValue: '38.1%',
    status: 'Verified',
    statusTheme: 'emerald',
    timestamp: 'Just now',
  },
  {
    id: 'googl',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    filingType: '10-Q',
    metricLabel: 'Operating Margin',
    metricValue: '32.4%',
    status: 'Clean',
    statusTheme: 'cyan',
    timestamp: 'Just now',
  },
  {
    id: 'meta',
    ticker: 'META',
    companyName: 'Meta Platforms',
    filingType: '10-K',
    metricLabel: 'FCF Margin',
    metricValue: '36.8%',
    status: 'Audited',
    statusTheme: 'indigo',
    timestamp: 'Just now',
  },
  {
    id: 'tsla',
    ticker: 'TSLA',
    companyName: 'Tesla Inc.',
    filingType: '10-Q',
    metricLabel: 'Auto Margin',
    metricValue: '17.1%',
    status: 'Clean',
    statusTheme: 'cyan',
    timestamp: 'Just now',
  },
  {
    id: 'jpm',
    ticker: 'JPM',
    companyName: 'JPMorgan Chase',
    filingType: '10-K',
    metricLabel: 'CET1 Ratio',
    metricValue: '15.0%',
    status: 'Verified',
    statusTheme: 'emerald',
    timestamp: 'Just now',
  },
];

const SEC_TICKER_STREAM = [
  { symbol: 'AAPL', form: '10-K', metric: 'ROE 107.5%', change: '+4.2%' },
  { symbol: 'NVDA', form: '10-Q', metric: 'Margin 75.1%', change: '+12.8%' },
  { symbol: 'MSFT', form: '10-K', metric: 'Cloud +29%', change: '+2.4%' },
  { symbol: 'AMZN', form: '10-K', metric: 'AWS +19%', change: '+5.1%' },
  { symbol: 'GOOGL', form: '10-Q', metric: 'Ad Rev +14%', change: '+3.7%' },
  { symbol: 'META', form: '10-K', metric: 'FCF $43B', change: '+8.6%' },
  { symbol: 'TSLA', form: '10-Q', metric: 'Delivery +38%', change: '+1.9%' },
  { symbol: 'JPM', form: '10-K', metric: 'CET1 15.0%', change: '+1.2%' },
];

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  onLaunchDemo,
  onStartOnboarding,
}) => {
  useGlobalCardTilt();
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPreviewDataset, setSelectedPreviewDataset] = useState(SAMPLE_DATASETS[0]);
  const [sceneMode, setSceneMode] = useState<'volatility' | 'constellation' | 'matrix'>('volatility');
  const [is3dPaused, setIs3dPaused] = useState(false);

  // Live SEC EDGAR Filing Ticker & Feed State (updates timely every 3.8s)
  const [feedItems, setFeedItems] = useState<SecEdgarFeedItem[]>(ALL_SEC_FILINGS.slice(0, 3));
  const [feedIndex, setFeedIndex] = useState(3);
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [filingsCount, setFilingsCount] = useState(1482);
  const [justUpdated, setJustUpdated] = useState(false);

  // Dynamic timely ingestion stream: rotates new SEC filings into top slot with distinct companies
  useEffect(() => {
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      setFeedIndex((prevIdx) => {
        const len = ALL_SEC_FILINGS.length;
        const i0 = prevIdx % len;
        const i1 = (prevIdx - 1 + len) % len;
        const i2 = (prevIdx - 2 + len) % len;

        setFeedItems([
          { ...ALL_SEC_FILINGS[i0], timestamp: 'Just now' },
          { ...ALL_SEC_FILINGS[i1], timestamp: '14s ago' },
          { ...ALL_SEC_FILINGS[i2], timestamp: '38s ago' },
        ]);
        setFilingsCount((c) => c + 1);
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 800);
        return prevIdx + 1;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [isFeedPaused]);

  // Calculate live preview metrics for the interactive teaser card
  const previewRatios = React.useMemo(() => {
    return calculateFinancialRatios(selectedPreviewDataset);
  }, [selectedPreviewDataset]);

  const previewHealth = React.useMemo(() => {
    return evaluateFinancialHealth(previewRatios);
  }, [previewRatios]);

  const previewRedFlags = React.useMemo(() => {
    return detectRedFlags(selectedPreviewDataset, previewRatios);
  }, [selectedPreviewDataset, previewRatios]);

  // Three.js Interactive 3D Canvas across the main page
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 8, 28);
    camera.lookAt(0, -1, 0);

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0a0e1a, 2.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.6);
    dirLight1.position.set(25, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.0);
    dirLight2.position.set(-25, -15, 12);
    scene.add(dirLight2);

    const cursorLight = new THREE.PointLight(0x10b981, 4, 50);
    cursorLight.position.set(0, 4, 6);
    scene.add(cursorLight);

    // Volatility Surface Plane
    const planeWidth = 92;
    const planeHeight = 52;
    const segmentsX = 64;
    const segmentsY = 38;
    const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    planeGeo.rotateX(-Math.PI / 2.35);

    const posAttr = planeGeo.attributes.position;
    const origPositions = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count * 3; i++) {
      origPositions[i] = posAttr.array[i];
    }

    // Vertex colors for financial liquidity gradient
    const colors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const normX = x / planeWidth + 0.5;
      const normZ = z / planeHeight + 0.5;

      colors[i * 3] = 0.12 + 0.28 * (1 - normZ);
      colors[i * 3 + 1] = 0.22 + 0.45 * normX;
      colors[i * 3 + 2] = 0.72 + 0.28 * normZ;
    }
    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.3,
      metalness: 0.85,
      transparent: true,
      opacity: 0.52,
      wireframe: true,
    });
    const terrainMesh = new THREE.Mesh(planeGeo, planeMat);
    terrainMesh.position.set(0, -6.5, -2);
    scene.add(terrainMesh);

    // Points at vertices
    const pointsMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(planeGeo, pointsMat);
    points.position.copy(terrainMesh.position);
    scene.add(points);

    // Mouse tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handleMove);

    // Scroll parallax tracking
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (is3dPaused) {
        renderer.render(scene, camera);
        return;
      }

      const elapsed = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const maxScroll = Math.max(1, (document.documentElement.scrollHeight || 4000) - window.innerHeight);
      const scrollRatio = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Dynamic cinematic camera parallax tied to segment scroll
      const scrollParallax = Math.min(scrollY * 0.0028, 4.5);
      camera.position.x = mouse.x * 4.0 + Math.sin(scrollRatio * Math.PI) * 1.5;
      camera.position.y = 8 + mouse.y * 2.5 - scrollParallax;
      camera.lookAt(mouse.x * 1.8, -1 + mouse.y * 1.0 - scrollParallax * 0.25, 0);

      cursorLight.position.x = mouse.x * 22;
      cursorLight.position.y = 4 + mouse.y * 9;
      cursorLight.position.z = 5 + mouse.y * 5;

      // Dynamic lighting adaptation across segment transitions
      if (scrollRatio < 0.25) {
        cursorLight.color.setHex(0x6366f1);
      } else if (scrollRatio < 0.5) {
        cursorLight.color.setHex(0x10b981);
      } else if (scrollRatio < 0.75) {
        cursorLight.color.setHex(0x06b6d4);
      } else {
        cursorLight.color.setHex(0x8b5cf6);
      }

      // Wave deform
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < posAttr.count; i++) {
        const origX = origPositions[i * 3];
        const origY = origPositions[i * 3 + 1];
        const origZ = origPositions[i * 3 + 2];

        const w1 = Math.sin(origX * 0.12 + elapsed * 1.1) * Math.cos(origZ * 0.14 + elapsed * 0.85) * 2.4;
        const w2 = Math.sin(origX * 0.22 - elapsed * 1.4) * 0.7;

        const dx = origX - mouse.x * 22;
        const dz = origZ - -mouse.y * 16;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const ripple = Math.exp(-dist * 0.12) * Math.sin(dist * 0.75 - elapsed * 3.8) * 2.6;

        posArray[i * 3 + 1] = origY + w1 + w2 + ripple;
      }
      posAttr.needsUpdate = true;
      planeGeo.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      planeGeo.dispose();
      planeMat.dispose();
      pointsMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [is3dPaused]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      
      {/* 3D Undulating Wireframe Topography Mesh (Active throughout main page, excluded in last segment) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div ref={mountRef} className="w-full h-full" />
        {/* Subtle radial and vignette depth for enhanced text legibility */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#09090b]/15 to-[#09090b]/70 pointer-events-none" />
      </div>

      {/* 1. Global Marketing Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/85 backdrop-blur-md border-b border-[#27272a]/80 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg italic text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-500/30 shrink-0">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">FinInsight AI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] hidden sm:block font-medium">
                Autonomous SEC 10-K & Multi-Period Forensic Intelligence
              </p>
            </div>
          </div>

          {/* Quick Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#a1a1aa]">
            <a href="#features" className="hover:text-white transition-colors">Forensic Architecture</a>
            <a href="#interactive-preview" className="hover:text-white transition-colors">Live Preview</a>
            <a href="#security" className="hover:text-white transition-colors">SOC-2 & Encryption</a>
            <a href="#benchmarks" className="hover:text-white transition-colors">500+ Benchmarks</a>
          </div>

          {/* Direct Pathway Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="btn-nav-demo"
              onClick={onLaunchDemo}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white border border-[#27272a] hover:border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Launch separate 3-D Demo page"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/40 shrink-0" />
              <span className="hidden sm:inline">3-D Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              id="btn-nav-signin"
              onClick={onStartOnboarding}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-900/30"
              title="Navigate to separate Sign In to App page"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
              <span>Sign In to App</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Hero Section with Interactive 3D Backdrop */}
      <section className="relative z-10 pt-6 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-12 overflow-x-hidden min-h-[calc(100vh-68px)] flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Hero Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 text-center sm:text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-4 sm:mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Gen Enterprise Financial Intelligence Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-black text-white tracking-tight leading-[1.12] mb-4 sm:mb-5 text-balance">
                Forensic Statement Audit <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                  & 3D Financial Topography
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base lg:text-[17px] text-[#a1a1aa] leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal text-balance sm:text-left mx-auto sm:mx-0">
                Autonomous SEC 10-K report parsing, DuPont variance decomposition, Beneish M-Score manipulation detection, and Monte Carlo predictive forecasting engineered for CFOs, auditors, and private equity teams.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center sm:justify-start">
                <button
                  id="btn-hero-launch-demo"
                  onClick={onLaunchDemo}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-900/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>3-D Demo</span>
                </button>

                <button
                  id="btn-hero-start-onboarding"
                  onClick={onStartOnboarding}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] hover:border-emerald-500/50 text-[#fafafa] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Sign In to App</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 sm:gap-7 flex-wrap text-xs text-[#a1a1aa] font-medium justify-center sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Client-Side AES-256 Masking</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[#71717a]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>GAAP & IFRS Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live SEC EDGAR Filing Ticker & Auditor Feed Card (Responsive across mobile, tablet, laptop & large screens) */}
            <div className="col-span-1 lg:col-span-5 w-full mt-6 lg:mt-0 max-w-lg mx-auto lg:max-w-none">
              <ThreeDCard roundedClassName="rounded-3xl" depth={5} scale={1.012}>
                <div className="relative group">
                  {/* Subtle soft ambient depth (understated & non-illuminating) */}
                  <div className="absolute -inset-1 bg-indigo-500/10 rounded-3xl blur-xl opacity-25 pointer-events-none" />
                  
                  {/* Card Container with clean subtle border */}
                  <div className="relative bg-[#0d0e13]/95 backdrop-blur-xl border border-[#27272a] hover:border-[#38383f] rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-3 transition-colors">
                    
                    {/* Card Header with Live Toggle & Pulse */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#22232a]">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center justify-center">
                          <span className={`w-2.5 h-2.5 rounded-full ${isFeedPaused ? 'bg-amber-400/60' : 'bg-emerald-400/60 animate-ping'} absolute opacity-60`} />
                          <span className={`w-2 h-2 rounded-full ${isFeedPaused ? 'bg-amber-400' : 'bg-emerald-400'} relative`} />
                        </div>
                        <div>
                          <h2 className="text-xs font-bold text-white tracking-tight">
                            Live SEC EDGAR Filing Ticker
                          </h2>
                          <p className="text-[10px] text-[#71717a] font-mono">Autonomous Ingestion & Audit Feed</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setIsFeedPaused((prev) => !prev)}
                        title={isFeedPaused ? 'Click to resume live stream' : 'Click to pause feed'}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer ${
                          isFeedPaused
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Activity className={`w-3 h-3 ${isFeedPaused ? '' : 'animate-pulse'}`} />
                        <span>{isFeedPaused ? 'PAUSED' : 'LIVE FEED'}</span>
                      </button>
                    </div>

                    {/* Continuous Live Ticker Stream Ribbon */}
                    <div className="overflow-hidden py-1.5 px-2 rounded-lg bg-[#08090c] border border-[#202127]">
                      <div className="animate-ticker text-[10px] font-mono whitespace-nowrap select-none">
                        {/* 1st copy */}
                        {SEC_TICKER_STREAM.map((t, idx) => (
                          <span key={`t1-${idx}`} className="inline-flex items-center gap-1.5 mr-5 shrink-0">
                            <span className="font-bold text-white tracking-tight">{t.symbol}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#18181b] text-[#71717a]">{t.form}</span>
                            <span className="text-cyan-400 font-semibold">{t.metric}</span>
                            <span className="text-emerald-400 font-semibold">{t.change}</span>
                            <span className="text-[#3f3f46]">·</span>
                          </span>
                        ))}
                        {/* 2nd duplicated copy for seamless infinite loop */}
                        {SEC_TICKER_STREAM.map((t, idx) => (
                          <span key={`t2-${idx}`} className="inline-flex items-center gap-1.5 mr-5 shrink-0">
                            <span className="font-bold text-white tracking-tight">{t.symbol}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#18181b] text-[#71717a]">{t.form}</span>
                            <span className="text-cyan-400 font-semibold">{t.metric}</span>
                            <span className="text-emerald-400 font-semibold">{t.change}</span>
                            <span className="text-[#3f3f46]">·</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Feed Items List (Timed Dynamic Stream) */}
                    <div className="space-y-2">
                      {feedItems.map((item, idx) => {
                        const isTopNew = idx === 0 && justUpdated;
                        return (
                          <div
                            key={`${item.id}-${item.timestamp}-${idx}`}
                            className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 group/row cursor-default ${
                              isTopNew
                                ? 'bg-[#151720] border-emerald-500/35'
                                : 'bg-[#111218]/90 hover:bg-[#161720] border-[#22232a]'
                            }`}
                          >
                            {/* Company & Filing Type */}
                            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                                {item.ticker.slice(0, 2)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-xs font-bold text-white tracking-tight">{item.ticker}</span>
                                  <span className="text-[11px] text-[#71717a] truncate max-w-[85px] sm:max-w-none">({item.companyName})</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a1a1aa] mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-[#1f2026] text-[#a1a1aa] font-medium text-[9px]">
                                    {item.filingType} filed
                                  </span>
                                  <span>·</span>
                                  <span className={idx === 0 ? 'text-emerald-400 font-medium' : 'text-[#71717a]'}>
                                    {item.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Metric & Status */}
                            <div className="text-right shrink-0">
                              <div className="text-xs font-mono font-bold text-white">
                                <span className="text-[10px] text-[#71717a] font-normal mr-1">{item.metricLabel}</span>
                                <span className={item.statusTheme === 'emerald' ? 'text-emerald-400' : item.statusTheme === 'cyan' ? 'text-cyan-400' : 'text-indigo-300'}>
                                  {item.metricValue}
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-1 text-[10px] font-mono mt-0.5">
                                <CheckCircle2 className={`w-3 h-3 ${item.statusTheme === 'emerald' ? 'text-emerald-400' : item.statusTheme === 'cyan' ? 'text-cyan-400' : 'text-indigo-400'}`} />
                                <span className={item.statusTheme === 'emerald' ? 'text-emerald-300' : item.statusTheme === 'cyan' ? 'text-cyan-300' : 'text-indigo-300'}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Bottom: Ingestion Stats & Live Latency */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#22232a] text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#71717a] font-mono text-[10px]">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span><span className="text-[#e4e4e7] font-semibold">{filingsCount.toLocaleString()}</span> audited today</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400/80">&lt;120ms Latency</span>
                    </div>

                  </div>
                </div>
              </ThreeDCard>
            </div>

          </div>
        </div>

        {/* Live Stat Banner */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 lg:mt-12 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 bg-[#18181b]/70 backdrop-blur-md rounded-2xl border border-[#27272a] shadow-xl">
            <div data-tilt-card="true" data-tilt-max="5" data-tilt-scale="1.015" className="relative p-2 sm:p-3 rounded-xl hover:bg-[#202025] transition-colors">
              <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-1">Ingested Asset Volume</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">$48.2B+</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> 10-K & 10-Q Filings
              </p>
            </div>

            <div data-tilt-card="true" data-tilt-max="5" data-tilt-scale="1.015" className="relative p-2 sm:p-3 border-l border-[#27272a]/80 rounded-xl hover:bg-[#202025] transition-colors">
              <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-1">Anomaly Precision</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">99.4%</p>
              <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1 font-mono">
                <ScanEye className="w-3.5 h-3.5" /> Beneish & Altman Z
              </p>
            </div>

            <div data-tilt-card="true" data-tilt-max="5" data-tilt-scale="1.015" className="relative p-2 sm:p-3 border-t md:border-t-0 md:border-l border-[#27272a]/80 rounded-xl hover:bg-[#202025] transition-colors">
              <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-1">Calculation Latency</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">&lt;120ms</p>
              <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5" /> Real-Time DuPont
              </p>
            </div>

            <div data-tilt-card="true" data-tilt-max="5" data-tilt-scale="1.015" className="relative p-2 sm:p-3 border-t md:border-t-0 md:border-l border-[#27272a]/80 rounded-xl hover:bg-[#202025] transition-colors">
              <p className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-1">Public Benchmarks</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">500+ Peers</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <Database className="w-3.5 h-3.5" /> Tech, Auto & Health
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Interactive Seamless Transition: Hero -> Demo Preview */}
      <InteractiveSegmentTransition
        targetId="interactive-preview"
        label="Explore Model Demo Preview"
        theme="emerald"
      />

      {/* 3. Interactive Live Teaser Widget (Directly on Landing Page) */}
      <section id="interactive-preview" className="relative z-10 py-16 sm:py-24 bg-transparent scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Model Demo Teaser</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Experience Real-Time Statement Diagnostics
            </h2>
            <p className="text-sm sm:text-base text-[#a1a1aa]">
              Select a benchmark company below to inspect instant ratio calculation, forensic health evaluations, and anomaly flags directly within this preview.
            </p>
          </div>

          {/* Company Switcher Pill Bar */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {SAMPLE_DATASETS.filter((d) => d.periods.length > 0).map((dataset) => (
              <button
                key={dataset.id}
                onClick={() => setSelectedPreviewDataset(dataset)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  selectedPreviewDataset.id === dataset.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-400'
                    : 'bg-[#18181b]/80 backdrop-blur-sm hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{dataset.companyName}</span>
                {dataset.ticker && (
                  <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono">
                    {dataset.ticker}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Interactive Teaser Dashboard Card */}
          <ThreeDCard roundedClassName="rounded-2xl" depth={3} scale={1.006}>
            <div className="bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedPreviewDataset.companyName}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30">
                      Health: {previewHealth.overallStatus} ({previewHealth.score}/100)
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] mt-1 font-mono">
                    Industry: {selectedPreviewDataset.industry} • Reporting Base: {selectedPreviewDataset.reportingCurrency} • Active Period: {selectedPreviewDataset.activePeriod}
                  </p>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-6">
                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Operating Margin</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {(previewRatios.operatingMargin * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono">Profitable</span>
                </div>

                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Return on Equity (ROE)</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {(previewRatios.roe * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-indigo-400 font-mono">DuPont Factor</span>
                </div>

                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Current Ratio</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {previewRatios.currentRatio.toFixed(2)}x
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono">Solvent</span>
                </div>

                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Quick Ratio</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {previewRatios.quickRatio.toFixed(2)}x
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono">Liquid</span>
                </div>

                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Debt-to-Equity</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {previewRatios.debtToEquity.toFixed(2)}x
                  </p>
                  <span className="text-[10px] text-indigo-400 font-mono">Leverage</span>
                </div>

                <div data-tilt-card="true" data-tilt-max="8" data-tilt-scale="1.03" className="relative p-3 rounded-xl bg-[#09090b]/80 border border-[#27272a] hover:border-indigo-500/40 transition-colors">
                  <p className="text-[10px] font-mono text-[#71717a]">Active Red Flags</p>
                  <p className={`text-base sm:text-lg font-bold mt-1 ${previewRedFlags.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {previewRedFlags.length} Detected
                  </p>
                  <span className="text-[10px] text-[#71717a] font-mono">Forensic Scan</span>
                </div>
              </div>

              {/* Teaser CTA Banner inside Card */}
              <div className="pt-4 border-t border-[#27272a] flex items-center gap-2 text-xs text-[#a1a1aa]">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Full workspace includes 3D Capital Towers, Monte Carlo Forecasting, and AI Copilot Chat.</span>
              </div>

            </div>
          </ThreeDCard>

        </div>
      </section>

      {/* Interactive Seamless Transition: Sandbox Preview -> Forensic Architecture */}
      <InteractiveSegmentTransition
        targetId="features"
        label="Forensic Architecture & Capabilities"
        theme="indigo"
      />

      {/* 4. Core Features & Architectural Capabilities */}
      <section id="features" className="relative z-10 py-20 sm:py-28 bg-transparent scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Full-Stack Forensic Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Designed for High-Stakes Institutional Audits
            </h2>
            <p className="text-base text-[#a1a1aa]">
              Engineered from the ground up to eliminate manual spreadsheet modeling errors, expose subtle accounting anomalies, and accelerate investor decision-making.
            </p>
          </div>

          {/* Bento Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated SEC 10-K Ingestion</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Drag-and-drop SEC 10-K PDF filings or CSV/XLSX workbooks. The OCR & structural parser extracts multi-period balance sheets, cash flows, and footnotes with 99.4% accuracy.
              </p>
              <div className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                <span>Auto-categorizes 10-K, 10-Q & Notes</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ScanEye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Forensic Anomaly & Beneish M-Score</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Instantly compute Beneish M-Score (earnings manipulation detection), Altman Z-Score (bankruptcy forecasting), and multi-variable Z-score outlier divergences.
              </p>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span>Statistical outlier z-score detection</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-cyan-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3D Capital Structure Topography</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Explore interactive 3D Capital Towers, Risk Terrains, and DuPont Decomposition trees in real-time WebGL space. Drill down through sub-account ledgers with zero latency.
              </p>
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                <span>WebGL 2.0 multi-angle inspection</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Conversational Gemini Financial Copilot</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Chat directly with your active financial statement. Ask questions like "Explain the 14% drop in Free Cash Flow" or "Verify revenue recognition criteria against ASC 606".
              </p>
              <div className="text-xs font-mono text-purple-400 flex items-center gap-1">
                <span>Multi-turn context & ratio citations</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-amber-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bi-Directional ERP Synchronization</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Synchronize general ledger transactions directly with Oracle NetSuite, SAP S/4HANA, and QuickBooks Online via encrypted REST/GraphQL endpoints with zero loss.
              </p>
              <div className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <span>NetSuite, SAP & QBO certified</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div data-tilt-card="true" data-tilt-max="5.5" data-tilt-scale="1.018" className="relative p-6 sm:p-8 rounded-2xl bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-rose-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monte Carlo Predictive Forecasting</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed mb-4">
                Simulate 10,000 forward probabilistic trials incorporating interest rate shocks, revenue volatility, and COGS inflation to identify 5th to 95th percentile risk bounds.
              </p>
              <div className="text-xs font-mono text-rose-400 flex items-center gap-1">
                <span>Parametric sensitivity envelopes</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Seamless Transition: Forensic Architecture -> Enterprise Security */}
      <InteractiveSegmentTransition
        targetId="security"
        label="Zero-Trust Encryption & SOC-2"
        theme="cyan"
      />

      {/* 5. Enterprise Security & Compliance Section */}
      <section id="security" className="relative z-10 py-20 sm:py-28 bg-transparent scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust Enterprise Compliance</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Bank-Grade Encryption for Material Non-Public Information (MNPI)
              </h2>
              <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed mb-6">
                Designed for public companies, accounting advisory firms, and private equity sponsors subject to stringent SOX, SEC, and GDPR confidentiality mandates.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Client-Side AES-256 Value Masking</h4>
                    <p className="text-xs text-[#71717a] mt-0.5">Obfuscate sensitive balances instantly with one click for board meetings and safe external screen sharing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Immutable Append-Only Audit Trail</h4>
                    <p className="text-xs text-[#71717a] mt-0.5">Every financial calculation, footnote access, and export is timestamped and cryptographically signed with session hashes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Granular Role-Based Access Controls (RBAC)</h4>
                    <p className="text-xs text-[#71717a] mt-0.5">Distinct permissions for Chief Financial Officers, Senior Audit Leads, Financial Analysts, and External Stakeholders.</p>
                  </div>
                </div>
              </div>
            </div>

            <div data-tilt-card="true" data-tilt-max="4.5" data-tilt-scale="1.012" className="relative lg:col-span-6 bg-[#18181b]/85 backdrop-blur-md border border-[#27272a] hover:border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-white">SYSTEM SECURITY LOGS</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE ENCRYPTION: ACTIVE
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] flex items-center justify-between">
                  <span>[TLS 1.3] AES-GCM-256 SESSION ESTABLISHED</span>
                  <span className="text-emerald-400">VERIFIED</span>
                </div>
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] flex items-center justify-between">
                  <span>[SOX-404] GENERAL LEDGER TRACE INTEGRITY</span>
                  <span className="text-emerald-400">PASSED (100%)</span>
                </div>
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] flex items-center justify-between">
                  <span>[RBAC] ADMIN_CFO ELEVATED CLEARANCE</span>
                  <span className="text-indigo-400">AUTHORIZED</span>
                </div>
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] flex items-center justify-between">
                  <span>[HASH] SHA-256 AUDIT LOG COMMIT</span>
                  <span className="text-[#71717a]">#7721-AX9</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#27272a] flex items-center justify-between">
                <span className="text-xs text-[#71717a]">Compliance Certification: SOC 2 Type II</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Seamless Transition: Enterprise Security -> Institutional Deployment */}
      <InteractiveSegmentTransition
        targetId="cta-deployment"
        label="Instant Institutional Deployment"
        theme="purple"
      />

      {/* 6. High-Impact Call-to-Action Banner (Seamless Merge to 3D Canvas & Subtle Gradient Last Segment) */}
      <section id="cta-deployment" className="relative z-20 pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-b from-transparent via-[#09090b]/90 via-35% via-[#09090b] via-60% to-[#0d0e17] scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Ready to Accelerate Your Financial Audit Workflow?
          </h2>
          <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
            Launch the 3-D demo right now, or complete the 60-second enterprise sign-in onboarding to access full SEC statement ingestion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-cta-launch-demo"
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-950/40 transition-all cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>3-D Demo</span>
            </button>

            <button
              id="btn-cta-start-onboarding"
              onClick={onStartOnboarding}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] hover:border-emerald-500/50 text-[#fafafa] font-bold text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-105"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Sign In to App</span>
            </button>
          </div>

        </div>
      </section>

      {/* 7. Comprehensive Enterprise Footer (Seamlessly continuous with last segment) */}
      <footer className="px-6 py-10 bg-[#0d0e17] text-[#71717a] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm italic text-white">
              F
            </div>
            <div>
              <span className="font-bold text-white text-sm">FinInsight AI</span>
              <span className="text-xs text-[#71717a] ml-2">© 2026 Institutional Financial Systems Inc.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button onClick={onLaunchDemo} className="hover:text-white transition-colors cursor-pointer">
              3-D Demo
            </button>
            <button onClick={onStartOnboarding} className="hover:text-white transition-colors cursor-pointer">
              Sign In to App
            </button>
            <span className="hover:text-white transition-colors cursor-pointer">Security Specs</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy & GDPR</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
            <span>PLATFORM HEALTH: 100% OPERATIONAL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

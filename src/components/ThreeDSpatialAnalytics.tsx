import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, Suspense, lazy } from 'react';
import * as THREE from 'three';
import { 
  Boxes, 
  Layers, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Compass, 
  Info, 
  HelpCircle,
  BarChart2,
  Layers3,
  Sun,
  Grid3X3,
  RotateCcw,
  Split,
  ChevronRight,
  ExternalLink,
  Minimize2,
  Bookmark,
  BookmarkPlus,
  FolderTree,
  FileText
} from 'lucide-react';
import { useSpring } from '@react-spring/web';
import { ThreeDBreadcrumbs, BreadcrumbStep } from './ThreeDBreadcrumbs';
import { ThreeDViewpointsModal } from './ThreeDViewpointsModal';
import { 
  FinancialDataset, 
  FinancialRatios, 
  FinancialHealthGrade, 
  CurrencyCode,
  ThreeDViewpoint
} from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';
import { 
  CONSOLIDATED_SUB_ACCOUNTS_MAP, 
  isNodeExplodable, 
  getSubAccountBreakdown, 
  ConstituentSubAccount 
} from '../data/subAccounts';
import type { ViewMode, ColorTheme } from './ThreeDSpatialScene';

const ThreeDSpatialScene = lazy(() => import('./ThreeDSpatialScene'));

interface ThreeDSpatialAnalyticsProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  health: FinancialHealthGrade;
  currency: CurrencyCode;
}

export const ThreeDSpatialAnalytics: React.FC<ThreeDSpatialAnalyticsProps> = ({
  dataset,
  ratios,
  health,
  currency,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // UI Interactive States
  const [viewMode, setViewMode] = useState<ViewMode>('capital-tower');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('titanium');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [rotateSpeed, setRotateSpeed] = useState(0.6);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 to 1
  const [isIsometric, setIsIsometric] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(dataset.activePeriod || dataset.periods[dataset.periods.length - 1] || 'FY2024');

  // WebGL Parent Container Measurement via useLayoutEffect before mounting canvas
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height || containerRef.current.clientHeight);
      if (width > 0 && height > 0) {
        setContainerDimensions((prev) => {
          if (!prev || Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1) {
            return { width, height };
          }
          return prev;
        });
      }
    };

    // Synchronous immediate measurement before browser paint ensures 0-size canvas never mounts
    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, []);

  // Explode Interaction States
  const [explodedNodes, setExplodedNodes] = useState<Set<string>>(new Set());
  const [lastExplodedNode, setLastExplodedNode] = useState<string | null>('Cash & Equivalents');
  const [selectedSubAccount, setSelectedSubAccount] = useState<ConstituentSubAccount | null>(null);

  const collapsingNodesRef = useRef<Set<string>>(new Set());
  const [, setCollapsingTrigger] = useState(0);

  // react-spring Physics Engine for Node Explosion, Slide, and Collapse Transitions
  const springValRef = useRef(1);
  const [, springApi] = useSpring(() => ({
    springVal: 1,
    config: { tension: 195, friction: 21, mass: 1 },
    onChange: ({ value }) => {
      springValRef.current = value.springVal;
    },
  }));

  const triggerSpringPhysics = (exploding: boolean, onDone?: () => void) => {
    springValRef.current = exploding ? 0 : 1;
    springApi.start({
      from: { springVal: exploding ? 0 : 1 },
      to: { springVal: exploding ? 1 : 0 },
      reset: true,
      config: exploding
        ? { tension: 185, friction: 20, mass: 1.1 } // Fluid, organic blossom on expand
        : { tension: 220, friction: 23, mass: 0.95 }, // Snappy, clean retraction on collapse
      onChange: ({ value }) => {
        springValRef.current = value.springVal;
      },
      onRest: () => {
        if (onDone) onDone();
      },
    });
  };

  // Camera flight animation controller for smooth viewpoint and drill-down restoration
  const cameraAnimationRef = useRef<{
    fromTheta: number;
    toTheta: number;
    fromPhi: number;
    toPhi: number;
    fromRadius: number;
    toRadius: number;
    startTime: number;
    duration: number;
  } | null>(null);

  // Viewpoints Persistence State
  const [isViewpointsModalOpen, setIsViewpointsModalOpen] = useState(false);
  const [savedViewpoints, setSavedViewpoints] = useState<ThreeDViewpoint[]>(() => {
    try {
      const local = localStorage.getItem('financial_3d_viewpoints');
      if (local) return JSON.parse(local);
    } catch {
      // Gracefully fallback to empty viewpoints
    }
    return [];
  });

  const toggleExplodeNode = (nodeKey: string) => {
    if (collapsingNodesRef.current.has(nodeKey)) return;

    if (explodedNodes.has(nodeKey)) {
      // Initiate smooth collapse transition
      collapsingNodesRef.current.add(nodeKey);
      setCollapsingTrigger((v) => v + 1);

      triggerSpringPhysics(false, () => {
        collapsingNodesRef.current.delete(nodeKey);
        setCollapsingTrigger((v) => v + 1);

        setExplodedNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeKey);
          return next;
        });

        if (lastExplodedNode === nodeKey) {
          setExplodedNodes((prev) => {
            const remaining = Array.from(prev).filter((k) => k !== nodeKey);
            setLastExplodedNode(remaining.length > 0 ? remaining[remaining.length - 1] : null);
            return prev;
          });
        }

        if (selectedSubAccount && getSubAccountBreakdown(nodeKey)?.subAccounts.some((s) => s.code === selectedSubAccount.code)) {
          setSelectedSubAccount(null);
        }
        springValRef.current = 1;
      });
    } else {
      // Initiate smooth expansion transition
      setExplodedNodes((prev) => {
        const next = new Set(prev);
        next.add(nodeKey);
        return next;
      });
      setLastExplodedNode(nodeKey);
      triggerSpringPhysics(true);
    }
  };

  const explodeAllNodes = () => {
    const allKeys = Object.keys(CONSOLIDATED_SUB_ACCOUNTS_MAP);
    collapsingNodesRef.current.clear();
    setExplodedNodes(new Set(allKeys));
    setLastExplodedNode('Cash & Equivalents');
    triggerSpringPhysics(true);
  };

  const collapseAllNodes = () => {
    if (explodedNodes.size === 0) return;

    explodedNodes.forEach((k) => collapsingNodesRef.current.add(k));
    setCollapsingTrigger((v) => v + 1);

    triggerSpringPhysics(false, () => {
      collapsingNodesRef.current.clear();
      setExplodedNodes(new Set());
      setSelectedSubAccount(null);
      springValRef.current = 1;
      setCollapsingTrigger((v) => v + 1);
    });
  };

  // Camera & LookAt references shared with ThreeDSpatialScene and viewpoints/breadcrumbs
  const cameraAngleRef = useRef({ theta: 0.8, phi: 0.6, radius: 24 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  // Extract financial data for active period
  const getItemValue = (list: typeof dataset.balanceSheet, key: string, period: string) => {
    return list.find((i) => i.key.toLowerCase() === key.toLowerCase())?.values[period] ?? 0;
  };

  const currentFinancials = useMemo(() => {
    const p = selectedPeriod;
    const cash = getItemValue(dataset.balanceSheet, 'cashAndEquivalents', p);
    const receivables = getItemValue(dataset.balanceSheet, 'accountsReceivable', p);
    const inventory = getItemValue(dataset.balanceSheet, 'inventory', p);
    const otherCA = getItemValue(dataset.balanceSheet, 'otherCurrentAssets', p) || (cash * 0.2);
    const ppe = getItemValue(dataset.balanceSheet, 'propertyPlantEquipment', p) || (cash * 1.5);
    const intangibles = getItemValue(dataset.balanceSheet, 'intangibleAssets', p) || (cash * 0.8);
    const totalAssets = getItemValue(dataset.balanceSheet, 'totalAssets', p) || (cash + receivables + inventory + ppe + intangibles);

    const accountsPayable = getItemValue(dataset.balanceSheet, 'accountsPayable', p) || (cash * 0.4);
    const shortTermDebt = getItemValue(dataset.balanceSheet, 'shortTermDebt', p) || (cash * 0.3);
    const currentLiab = getItemValue(dataset.balanceSheet, 'totalCurrentLiabilities', p) || (accountsPayable + shortTermDebt);
    const longTermDebt = getItemValue(dataset.balanceSheet, 'longTermDebt', p);
    const totalLiab = getItemValue(dataset.balanceSheet, 'totalLiabilities', p) || (currentLiab + longTermDebt);
    const equity = getItemValue(dataset.balanceSheet, 'stockholdersEquity', p) || (totalAssets - totalLiab);

    const revenue = getItemValue(dataset.incomeStatement, 'revenue', p);
    const grossProfit = getItemValue(dataset.incomeStatement, 'grossProfit', p);
    const opIncome = getItemValue(dataset.incomeStatement, 'operatingIncome', p);
    const netIncome = getItemValue(dataset.incomeStatement, 'netIncome', p);
    const ocf = getItemValue(dataset.cashFlowStatement, 'operatingCashFlow', p);
    const capex = getItemValue(dataset.cashFlowStatement, 'capitalExpenditures', p) || Math.abs(ocf * 0.35);
    const fcf = getItemValue(dataset.cashFlowStatement, 'freeCashFlow', p) || (ocf - Math.abs(capex));
    const financingCF = getItemValue(dataset.cashFlowStatement, 'financingCashFlow', p) || (-netIncome * 0.25);

    return {
      period: p,
      cash,
      receivables,
      inventory,
      otherCA,
      ppe,
      intangibles,
      totalAssets: Math.max(totalAssets, 1),
      accountsPayable,
      shortTermDebt,
      currentLiab,
      longTermDebt,
      totalLiab,
      equity: Math.max(equity, 1),
      revenue,
      grossProfit,
      opIncome,
      netIncome,
      ocf,
      capex,
      fcf,
      financingCF,
    };
  }, [dataset, selectedPeriod]);

  // Reset Camera View with smooth flight animation
  const handleResetCamera = () => {
    cameraAnimationRef.current = {
      fromTheta: cameraAngleRef.current.theta,
      toTheta: 0.8,
      fromPhi: cameraAngleRef.current.phi,
      toPhi: 0.6,
      fromRadius: cameraAngleRef.current.radius,
      toRadius: 24,
      startTime: performance.now(),
      duration: 650,
    };
    targetLookAtRef.current.set(0, 0, 0);
  };

  // Dynamic Drill-Down Breadcrumb Path
  const drillDownSteps = useMemo<BreadcrumbStep[]>(() => {
    const steps: BreadcrumbStep[] = [];

    const rootLabel = (() => {
      switch (viewMode) {
        case 'risk-terrain': return 'Health Topography';
        case 'dupont-tree': return 'DuPont Spatial Tree';
        case 'cashflow-waterfall': return 'Cash Flow Waterfall';
        case 'capital-tower':
        default: return 'Consolidated Monolith';
      }
    })();

    const isAtRoot = explodedNodes.size === 0 && !selectedSubAccount;

    // Level 1: Root Matrix Aggregation
    steps.push({
      id: 'step-root',
      level: 'root',
      label: rootLabel,
      badge: dataset.companyName,
      badgeColor: 'indigo',
      isCurrent: isAtRoot,
      onClick: () => {
        collapseAllNodes();
        handleResetCamera();
      },
    });

    const activeKey = lastExplodedNode || (explodedNodes.size > 0 ? Array.from(explodedNodes)[0] : null);
    const breakdown = activeKey ? getSubAccountBreakdown(activeKey) : null;

    if (activeKey && breakdown && explodedNodes.has(activeKey)) {
      // Level 2: Account Category
      const categoryName = breakdown.category || (activeKey.includes('Debt') || activeKey.includes('Liab') ? 'Claims & Capital' : 'Current Assets');
      const isAtCategory = explodedNodes.size > 0 && !lastExplodedNode;

      steps.push({
        id: 'step-category',
        level: 'category',
        label: categoryName,
        badge: breakdown.statement,
        badgeColor: 'zinc',
        isCurrent: isAtCategory,
        onClick: () => {
          setSelectedSubAccount(null);
        },
      });

      // Level 3: Consolidated Node
      const isAtNode = !selectedSubAccount;
      steps.push({
        id: `step-node-${activeKey}`,
        level: 'node',
        label: breakdown.displayName || activeKey,
        badge: `${breakdown.subAccounts.length} Sub-Ledgers`,
        badgeColor: 'emerald',
        isCurrent: isAtNode,
        onClick: () => {
          setSelectedSubAccount(null);
          setLastExplodedNode(activeKey);
          if (!explodedNodes.has(activeKey)) {
            toggleExplodeNode(activeKey);
          }
        },
      });

      // Level 4: Sub-account (if selected)
      if (selectedSubAccount) {
        steps.push({
          id: `step-sub-${selectedSubAccount.code}`,
          level: 'subaccount',
          label: selectedSubAccount.name,
          badge: `${selectedSubAccount.code} (${(selectedSubAccount.shareOfParent * 100).toFixed(1)}%)`,
          badgeColor: selectedSubAccount.status === 'Safe' ? 'emerald' : selectedSubAccount.status === 'Warning' ? 'amber' : 'rose',
          isCurrent: true,
          onClick: () => {
            // Already viewing this sub-account
          },
        });
      }
    }

    return steps;
  }, [viewMode, explodedNodes, lastExplodedNode, selectedSubAccount, dataset.companyName]);

  // Viewpoint snapshot payload for current camera & drill-down state
  const currentViewpointData = useMemo(() => {
    return {
      viewMode,
      period: selectedPeriod,
      explodedNodes: Array.from(explodedNodes),
      lastExplodedNode,
      selectedSubAccountCode: selectedSubAccount?.code || null,
      camera: {
        theta: cameraAngleRef.current.theta,
        phi: cameraAngleRef.current.phi,
        radius: cameraAngleRef.current.radius,
        isIsometric,
      },
      colorTheme,
      drillDownPath: drillDownSteps.map((s, idx) => ({
        level: idx,
        label: s.label,
        type: s.level,
        targetId: s.id,
      })),
    };
  }, [viewMode, selectedPeriod, explodedNodes, lastExplodedNode, selectedSubAccount, isIsometric, colorTheme, drillDownSteps]);

  const handleSaveViewpoint = (name: string, description?: string) => {
    const newVp: ThreeDViewpoint = {
      id: `vp-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ...currentViewpointData,
    };

    setSavedViewpoints((prev) => {
      const updated = [newVp, ...prev];
      try {
        localStorage.setItem('financial_3d_viewpoints', JSON.stringify(updated));
      } catch {
        // Storage quota handled
      }
      return updated;
    });
  };

  const handleApplyViewpoint = (vp: ThreeDViewpoint) => {
    // Cinematic camera flight to saved viewpoint coordinates
    cameraAnimationRef.current = {
      fromTheta: cameraAngleRef.current.theta,
      toTheta: vp.camera.theta,
      fromPhi: cameraAngleRef.current.phi,
      toPhi: vp.camera.phi,
      fromRadius: cameraAngleRef.current.radius,
      toRadius: vp.camera.radius,
      startTime: performance.now(),
      duration: 850,
    };

    setIsIsometric(vp.camera.isIsometric);
    setViewMode(vp.viewMode);
    setSelectedPeriod(vp.period);
    setColorTheme(vp.colorTheme);

    // Apply exploded nodes and trigger spring explosion physics
    setExplodedNodes(new Set(vp.explodedNodes));
    setLastExplodedNode(vp.lastExplodedNode);
    triggerSpringPhysics(vp.explodedNodes.length > 0);

    if (vp.selectedSubAccountCode && vp.lastExplodedNode) {
      const breakdown = getSubAccountBreakdown(vp.lastExplodedNode);
      const sub = breakdown?.subAccounts.find((s) => s.code === vp.selectedSubAccountCode);
      setSelectedSubAccount(sub || null);
    } else {
      setSelectedSubAccount(null);
    }
  };

  const handleDeleteViewpoint = (id: string) => {
    setSavedViewpoints((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      try {
        localStorage.setItem('financial_3d_viewpoints', JSON.stringify(updated));
      } catch {
        // Storage quota handled
      }
      return updated;
    });
  };

  const handleImportViewpoint = (vp: ThreeDViewpoint) => {
    setSavedViewpoints((prev) => {
      const filtered = prev.filter((v) => v.id !== vp.id);
      const updated = [vp, ...filtered];
      try {
        localStorage.setItem('financial_3d_viewpoints', JSON.stringify(updated));
      } catch {
        // Storage quota handled
      }
      return updated;
    });
    handleApplyViewpoint(vp);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar with Controls */}
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                3D Spatial Financial Matrix & Interactive Terrain
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  WebGL 3D Engine
                </span>
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Explore multi-dimensional balance sheet equilibrium, topological risk surface, DuPont decomposition tree, and cash flows in real-time 3D space.
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a] self-start lg:self-auto">
          {dataset.periods.map((p) => (
            <button
              key={p}
              id={`3d-period-btn-${p}`}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedPeriod === p
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Drill-Down Breadcrumbs Bar with Interactive Navigation & Viewpoint Management */}
      <ThreeDBreadcrumbs
        steps={drillDownSteps}
        onResetToRoot={() => {
          collapseAllNodes();
          handleResetCamera();
        }}
        explodedCount={explodedNodes.size}
        activePeriod={selectedPeriod}
        viewModeName={
          viewMode === 'capital-tower' ? 'Capital Monolith' :
          viewMode === 'risk-terrain' ? 'Health Topography' :
          viewMode === 'dupont-tree' ? 'DuPont Spatial Tree' : 'Cash Flow Waterfall'
        }
        onSaveCurrentViewpoint={() => setIsViewpointsModalOpen(true)}
        onOpenViewpoints={() => setIsViewpointsModalOpen(true)}
        savedViewpointsCount={savedViewpoints.length}
      />

      {/* 2. Main 3D Spatial Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: 3D WebGL Viewport (3 Cols) */}
        <div className="lg:col-span-3 bg-[#121215] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
          
          {/* Top Control Overlay */}
          <div className="p-3.5 bg-[#18181b]/90 backdrop-blur-md border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2 z-10">
            
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                id="3d-mode-tower"
                onClick={() => setViewMode('capital-tower')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'capital-tower'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                <Layers3 className="w-3.5 h-3.5" />
                <span>Capital Monolith</span>
              </button>

              <button
                id="3d-mode-terrain"
                onClick={() => setViewMode('risk-terrain')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'risk-terrain'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Health Topography</span>
              </button>

              <button
                id="3d-mode-dupont"
                onClick={() => setViewMode('dupont-tree')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'dupont-tree'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>DuPont Spatial Tree</span>
              </button>

              <button
                id="3d-mode-cashflow"
                onClick={() => setViewMode('cashflow-waterfall')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cashflow-waterfall'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Cash Flow Waterfall</span>
              </button>
            </div>

            {/* Quick View Controls */}
            <div className="flex items-center gap-2">
              <button
                id="3d-toggle-rotate"
                onClick={() => setIsAutoRotate((prev) => !prev)}
                title="Toggle Auto-Rotation"
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  isAutoRotate
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-[#27272a]/60 text-[#a1a1aa] border-[#3f3f46]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
              </button>

              <button
                id="3d-toggle-projection"
                onClick={() => setIsIsometric((prev) => !prev)}
                title="Toggle Perspective vs Isometric"
                className={`px-2 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  isIsometric
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#27272a]/60 text-[#a1a1aa] border-[#3f3f46]'
                }`}
              >
                {isIsometric ? 'ORTHO' : 'PERSP'}
              </button>

              <button
                id="3d-reset-cam"
                onClick={handleResetCamera}
                title="Reset Camera View"
                className="p-1.5 rounded-lg bg-[#27272a]/60 text-[#a1a1aa] border border-[#3f3f46] hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Viewpoints & Snapshots Button */}
              <button
                id="3d-open-viewpoints-btn"
                onClick={() => setIsViewpointsModalOpen(true)}
                title="Viewpoints: Save or restore 3D camera angles and drill-down state"
                className="px-2.5 py-1.5 rounded-lg bg-[#27272a]/80 hover:bg-[#3f3f46] text-[#e4e4e7] border border-[#3f3f46] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Viewpoints</span>
                {savedViewpoints.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    {savedViewpoints.length}
                  </span>
                )}
              </button>

              {/* Explode All / Collapse All Master Button */}
              <button
                id="3d-toggle-explode-all"
                onClick={() => {
                  if (explodedNodes.size > 0) {
                    collapseAllNodes();
                  } else {
                    explodeAllNodes();
                  }
                }}
                title={explodedNodes.size > 0 ? "Collapse all exploded sub-accounts" : "Explode all consolidated nodes into constituent sub-accounts"}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  explodedNodes.size > 0
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400/50 shadow-rose-500/20'
                    : 'bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-400/40 hover:border-indigo-400 shadow-indigo-500/20'
                }`}
              >
                {explodedNodes.size > 0 ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Collapse All ({explodedNodes.size})</span>
                  </>
                ) : (
                  <>
                    <Split className="w-3.5 h-3.5" />
                    <span>Explode All Nodes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive WebGL 3D Canvas */}
          <div
            ref={containerRef}
            className="w-full h-[520px] relative bg-gradient-to-b from-[#0a0a0c] to-[#121215] select-none"
          >
            {!containerDimensions ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#0a0a0c] to-[#121215] text-center p-8 select-none">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Boxes className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <div className="text-xs font-mono font-medium text-white flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Calibrating 3D Spatial Matrix</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#71717a]">
                    Measuring Container Geometry via ResizeObserver...
                  </p>
                </div>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#0a0a0c] to-[#121215] text-center p-8 select-none">
                    <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <p className="text-xs font-mono text-[#71717a]">Loading 3D WebGL Shader Pipeline...</p>
                  </div>
                }
              >
                <ThreeDSpatialScene
                  containerDimensions={containerDimensions}
                  dataset={dataset}
                  ratios={ratios}
                  health={health}
                  currency={currency}
                  viewMode={viewMode}
                  colorTheme={colorTheme}
                  selectedPeriod={selectedPeriod}
                  isAutoRotate={isAutoRotate}
                  rotateSpeed={rotateSpeed}
                  isIsometric={isIsometric}
                  showWireframe={showWireframe}
                  showGrid={showGrid}
                  explodedFactor={explodedFactor}
                  explodedNodes={explodedNodes}
                  lastExplodedNode={lastExplodedNode}
                  collapsingNodesRef={collapsingNodesRef}
                  springValRef={springValRef}
                  selectedSubAccount={selectedSubAccount}
                  cameraAngleRef={cameraAngleRef}
                  cameraAnimationRef={cameraAnimationRef}
                  targetLookAtRef={targetLookAtRef}
                  onToggleExplode={toggleExplodeNode}
                  onCollapseAll={collapseAllNodes}
                  onSelectSubAccount={setSelectedSubAccount}
                />
              </Suspense>
            )}
          </div>

          {/* Bottom Interactive Sliders Bar */}
          <div className="p-3.5 bg-[#18181b]/90 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Exploded View Slider (For Capital Tower) */}
            {viewMode === 'capital-tower' && (
              <div className="flex items-center gap-2">
                <span className="text-[#a1a1aa] flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3D Layer Explosion:</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  className="w-28 accent-indigo-500 cursor-pointer"
                />
                <span className="font-mono text-[#e4e4e7] w-8 text-right">
                  {Math.round(explodedFactor * 100)}%
                </span>
              </div>
            )}

            {/* Rotation Speed Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[#a1a1aa] flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Orbit Speed:</span>
              </span>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={rotateSpeed}
                onChange={(e) => setRotateSpeed(parseFloat(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Subtle Lighting & Material Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[#a1a1aa]">Palette:</span>
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
                className="bg-[#27272a] text-[#fafafa] rounded-lg px-2.5 py-1 text-xs border border-[#3f3f46] outline-none cursor-pointer"
              >
                <option value="titanium">Titanium Graphite</option>
                <option value="obsidian-emerald">Obsidian Emerald</option>
                <option value="slate-sapphire">Slate Sapphire</option>
                <option value="champagne-gold">Champagne Gold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Spatial Telemetry & Analytical Breakdown (1 Col) */}
        <div className="space-y-4">

          {/* Constituent Sub-Accounts (Exploded Ledger Inspector) */}
          {(() => {
            const activeInspectionKey = lastExplodedNode || (explodedNodes.size > 0 ? Array.from(explodedNodes)[0] : 'Cash & Equivalents');
            const breakdown = getSubAccountBreakdown(activeInspectionKey);
            
            const getParentAmount = (name: string): number => {
              switch (name) {
                case 'Cash & Equivalents': return currentFinancials.cash;
                case 'Accounts Receivable': return currentFinancials.receivables;
                case 'Inventories & Supplies': return currentFinancials.inventory;
                case 'Property, Plant & Equipment': return currentFinancials.ppe;
                case 'Intangibles & Goodwill': return currentFinancials.intangibles;
                case 'Current Liabilities': return currentFinancials.currentLiab;
                case 'Long-Term Senior Debt': return currentFinancials.longTermDebt;
                case 'Stockholders Equity': return currentFinancials.equity;
                case 'Gross Revenue': return currentFinancials.revenue;
                case 'Total Revenue': return currentFinancials.revenue;
                case 'Operating Cash Flow': return currentFinancials.ocf;
                case 'Free Cash Flow (FCF)': return currentFinancials.fcf;
                case 'Net Income (Earnings)': return currentFinancials.netIncome;
                case 'Total Assets Base': return currentFinancials.totalAssets;
                case 'Shareholders Equity Base': return currentFinancials.equity;
                default: return currentFinancials.cash;
              }
            };

            const parentVal = getParentAmount(activeInspectionKey);
            const isNodeExploded = explodedNodes.has(activeInspectionKey);

            return (
              <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 shadow-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-[#a1a1aa] flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Constituent Sub-Accounts</span>
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isNodeExploded
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isNodeExploded ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-500'}`} />
                    <span>{isNodeExploded ? 'Exploded in 3D' : 'Consolidated'}</span>
                  </span>
                </div>

                {/* Node Quick Switcher Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-thin">
                  {[
                    'Cash & Equivalents',
                    'Accounts Receivable',
                    'Current Liabilities',
                    'Long-Term Senior Debt',
                    'Stockholders Equity',
                    'Operating Cash Flow',
                    'Free Cash Flow (FCF)'
                  ].map((nodeName) => {
                    const isExpl = explodedNodes.has(nodeName);
                    const isSelected = activeInspectionKey === nodeName;
                    return (
                      <button
                        key={nodeName}
                        onClick={() => setLastExplodedNode(nodeName)}
                        className={`px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : isExpl
                            ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/60'
                            : 'bg-[#1c1c20] text-[#a1a1aa] border border-[#2e2e34] hover:text-white'
                        }`}
                      >
                        {isExpl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        <span>{nodeName.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Node Header & 3D Explode Button */}
                <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#a1a1aa] flex items-center gap-1">
                        <span>Consolidated Root Account</span>
                        <ChevronRight className="w-2.5 h-2.5 text-[#71717a]" />
                        <span className="text-indigo-300 font-semibold">{breakdown?.category || 'Balance Sheet'}</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {breakdown?.displayName || activeInspectionKey}
                      </div>
                      <div className="text-base font-mono font-semibold text-white mt-0.5">
                        {formatCurrency(parentVal, currency)}
                      </div>
                    </div>

                    <button
                      id={`explode-toggle-btn-${activeInspectionKey.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => toggleExplodeNode(activeInspectionKey)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isNodeExploded
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {isNodeExploded ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" />
                          <span>Collapse 3D</span>
                        </>
                      ) : (
                        <>
                          <Split className="w-3.5 h-3.5" />
                          <span>Explode 3D</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                    {breakdown 
                      ? `${breakdown.subAccounts.length} itemized general ledger accounts rolled into consolidated ${breakdown.displayName} (${breakdown.statement}).` 
                      : 'Sub-ledger items rolled into this balance sheet node.'}
                  </p>
                </div>

                {/* Sub-Accounts Itemized Breakdown */}
                {breakdown && breakdown.subAccounts.length > 0 && (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {breakdown.subAccounts.map((sub) => {
                      const subVal = parentVal * Math.abs(sub.shareOfParent);
                      const isSelected = selectedSubAccount?.code === sub.code;
                      return (
                        <div
                          key={sub.code}
                          onClick={() => setSelectedSubAccount(sub)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm'
                              : 'bg-[#18181b]/70 border-[#27272a] hover:border-[#3f3f46] text-[#e4e4e7]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#27272a] text-indigo-300 font-semibold">
                                {sub.code}
                              </span>
                              <span className="font-medium text-white truncate">{sub.name}</span>
                            </div>
                            <span className="font-mono font-medium text-white shrink-0">
                              {formatCurrency(subVal, currency)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#a1a1aa]">
                            <div className="flex items-center gap-1.5">
                              <span>Share: <strong className="text-white font-mono">{(sub.shareOfParent * 100).toFixed(1)}%</strong></span>
                              <span className="text-[#52525b]">•</span>
                              <span className={`font-mono font-medium ${sub.varianceYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {sub.varianceYoY >= 0 ? '+' : ''}{sub.varianceYoY.toFixed(1)}% YoY
                              </span>
                            </div>
                            <span
                              className={`px-1 rounded text-[9px] font-mono ${
                                sub.status === 'Safe'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : sub.status === 'Warning'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : sub.status === 'Critical'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-zinc-700/40 text-zinc-300'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>

                          {/* Sub-account percentage progress bar */}
                          <div className="w-full h-1 bg-[#27272a] rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.abs(sub.shareOfParent) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Active 3D Model Telemetry Card */}
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 shadow-md">
            <h3 className="text-xs uppercase font-mono tracking-wider text-[#a1a1aa] mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D Spatial Telemetry</span>
            </h3>

            {viewMode === 'capital-tower' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <div className="text-[11px] text-[#a1a1aa]">Total Assets Monolith</div>
                  <div className="text-base font-semibold text-white font-mono mt-0.5">
                    {formatCurrency(currentFinancials.totalAssets, currency)}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Balanced with Total Claims</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <div className="text-[10px] text-[#a1a1aa]">Total Debt</div>
                    <div className="font-mono text-rose-300 font-medium">
                      {formatCurrency(currentFinancials.longTermDebt + currentFinancials.shortTermDebt, currency)}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <div className="text-[10px] text-[#a1a1aa]">Total Equity</div>
                    <div className="font-mono text-indigo-300 font-medium">
                      {formatCurrency(currentFinancials.equity, currency)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#a1a1aa] bg-[#18181b]/60 p-2.5 rounded-xl border border-[#27272a]/60">
                  <span className="text-white font-medium">Equilibrium Status: </span>
                  Assets column precisely matches Liabilities + Equity claims with zero reconciliation deviation.
                </div>
              </div>
            )}

            {viewMode === 'risk-terrain' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <div className="text-[11px] text-[#a1a1aa]">Composite Health Elevation</div>
                  <div className="text-base font-semibold text-emerald-400 font-mono mt-0.5">
                    {health.overallScore} / 100 ({health.grade})
                  </div>
                  <div className="text-[10px] text-[#a1a1aa] mt-1">
                    Quadrant: Safe Solvency Ridge
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#a1a1aa]">Altman Z-Score:</span>
                    <span className="font-mono text-emerald-400 font-medium">{ratios.altmanZScore}x (Safe)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#a1a1aa]">Piotroski F-Score:</span>
                    <span className="font-mono text-indigo-300 font-medium">{ratios.piotroskiFScore}/9</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#a1a1aa]">Debt-to-Equity:</span>
                    <span className="font-mono text-amber-300 font-medium">{ratios.debtToEquity}x</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'dupont-tree' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <div className="text-[10px] text-[#a1a1aa]">Shareholder Return on Equity</div>
                  <div className="text-base font-semibold text-emerald-400 font-mono mt-0.5">
                    {ratios.returnOnEquity.toFixed(1)}% ROE
                  </div>
                </div>

                <div className="text-[11px] space-y-1.5 border-t border-[#27272a] pt-2">
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Net Profit Margin:</span>
                    <span className="font-mono text-white">{ratios.netProfitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Asset Turnover:</span>
                    <span className="font-mono text-white">
                      {(currentFinancials.revenue / currentFinancials.totalAssets).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Equity Multiplier:</span>
                    <span className="font-mono text-white">
                      {(currentFinancials.totalAssets / currentFinancials.equity).toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'cashflow-waterfall' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <div className="text-[10px] text-[#a1a1aa]">Free Cash Flow Yield</div>
                  <div className="text-base font-semibold text-cyan-400 font-mono mt-0.5">
                    {formatCurrency(currentFinancials.fcf, currency)}
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Operating Cash Flow:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(currentFinancials.ocf, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">CapEx Allocation:</span>
                    <span className="font-mono text-rose-400">{formatCurrency(currentFinancials.capex, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a1a1aa]">Ending Cash Buffer:</span>
                    <span className="font-mono text-indigo-300">{formatCurrency(currentFinancials.cash, currency)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D Navigation Guide & Interactive Quick Actions */}
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 shadow-md text-xs space-y-2.5">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D Interaction Gestures</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#a1a1aa]">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong className="text-white">Left Click + Drag:</strong> Smooth 360° spherical orbit around financial structures.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong className="text-white">Scroll Wheel:</strong> Zoom smoothly into individual statement blocks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong className="text-white">Hover Target:</strong> Raycasting identifies exact monetary balance & telemetry.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* 3D Viewpoints & Snapshots Modal */}
      <ThreeDViewpointsModal
        isOpen={isViewpointsModalOpen}
        onClose={() => setIsViewpointsModalOpen(false)}
        currentState={currentViewpointData}
        savedViewpoints={savedViewpoints}
        onSaveViewpoint={handleSaveViewpoint}
        onApplyViewpoint={handleApplyViewpoint}
        onDeleteViewpoint={handleDeleteViewpoint}
        onImportViewpoint={handleImportViewpoint}
        currency={currency}
      />

    </div>
  );
};

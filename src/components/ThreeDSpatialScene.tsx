import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Split, 
  Minimize2, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  FinancialDataset, 
  FinancialRatios, 
  FinancialHealthGrade, 
  CurrencyCode 
} from '../types';
import { formatCurrency } from '../data/currenciesAndFiscal';
import { 
  CONSOLIDATED_SUB_ACCOUNTS_MAP, 
  isNodeExplodable, 
  getSubAccountBreakdown, 
  ConstituentSubAccount 
} from '../data/subAccounts';

export type ViewMode = 'capital-tower' | 'risk-terrain' | 'dupont-tree' | 'cashflow-waterfall';
export type ColorTheme = 'titanium' | 'obsidian-emerald' | 'slate-sapphire' | 'champagne-gold';

export interface HoveredItemData {
  title: string;
  category: string;
  value: number;
  secondaryValue?: string;
  percentage?: number;
  changeYoY?: number;
  description: string;
  status?: 'Safe' | 'Warning' | 'Critical' | 'Neutral';
  nodeKey?: string;
  isParentNode?: boolean;
  isExploded?: boolean;
  subAccountCount?: number;
  isSubAccount?: boolean;
  subAccountObj?: ConstituentSubAccount;
  parentKey?: string;
  glCode?: string;
  shareOfParent?: number;
  hint?: string;
  action?: 'collapse' | 'explode';
  targetNodeKey?: string;
}

interface AnimatedChildNode {
  mesh: THREE.Mesh;
  wire?: THREE.LineSegments;
  tether?: THREE.Line;
  tetherStart: THREE.Vector3;
  ring?: THREE.Mesh;
  parentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  controlPos: THREE.Vector3;
  ghostMesh?: THREE.Mesh;
  targetOpacity: number;
  nodeKey: string;
  subIndex: number;
  totalSiblings: number;
}

export interface ThreeDSpatialSceneProps {
  containerDimensions: { width: number; height: number };
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  health: FinancialHealthGrade;
  currency: CurrencyCode;
  viewMode: ViewMode;
  colorTheme: ColorTheme;
  selectedPeriod: string;
  isAutoRotate: boolean;
  rotateSpeed: number;
  isIsometric: boolean;
  showWireframe: boolean;
  showGrid: boolean;
  explodedFactor?: number;
  explodedNodes: Set<string>;
  lastExplodedNode: string | null;
  collapsingNodesRef: React.MutableRefObject<Set<string>>;
  springValRef: React.MutableRefObject<number>;
  selectedSubAccount: ConstituentSubAccount | null;
  cameraAngleRef: React.MutableRefObject<{ theta: number; phi: number; radius: number }>;
  cameraAnimationRef: React.MutableRefObject<{
    fromTheta: number;
    toTheta: number;
    fromPhi: number;
    toPhi: number;
    fromRadius: number;
    toRadius: number;
    startTime: number;
    duration: number;
  } | null>;
  targetLookAtRef: React.MutableRefObject<THREE.Vector3>;
  onToggleExplode: (nodeKey: string) => void;
  onCollapseAll: () => void;
  onSelectSubAccount: (sub: ConstituentSubAccount | null) => void;
}

export const ThreeDSpatialScene: React.FC<ThreeDSpatialSceneProps> = ({
  containerDimensions,
  dataset,
  ratios,
  health,
  currency,
  viewMode,
  colorTheme,
  selectedPeriod,
  isAutoRotate,
  rotateSpeed,
  isIsometric,
  showWireframe,
  showGrid,
  explodedFactor = 0,
  explodedNodes,
  lastExplodedNode,
  collapsingNodesRef,
  springValRef,
  selectedSubAccount,
  cameraAngleRef,
  cameraAnimationRef,
  targetLookAtRef,
  onToggleExplode,
  onCollapseAll,
  onSelectSubAccount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const persCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const interactiveMeshesRef = useRef<{ mesh: THREE.Mesh | THREE.Group; data: HoveredItemData; basePos?: THREE.Vector3 }[]>([]);
  const animatedChildNodesRef = useRef<AnimatedChildNode[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Mouse & Touch Orbit Controls State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseDownStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Hover & Tooltip State
  const [hoveredData, setHoveredData] = useState<HoveredItemData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

  // Financial Data Calculation
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

  // Color Palette Definitions
  const themeColors = useMemo(() => {
    switch (colorTheme) {
      case 'obsidian-emerald':
        return {
          bg: 0x0a0c0b,
          assetPrimary: 0x10b981,
          assetSecondary: 0x059669,
          assetAccent: 0x34d399,
          liabPrimary: 0xf43f5e,
          liabSecondary: 0xe11d48,
          equityPrimary: 0x0ea5e9,
          equitySecondary: 0x0284c7,
          neutralMetal: 0x27272a,
          gridColor: 0x1e293b,
          textGlow: '#10b981',
          accentLight: 0x6ee7b7,
        };
      case 'slate-sapphire':
        return {
          bg: 0x090b10,
          assetPrimary: 0x3b82f6,
          assetSecondary: 0x2563eb,
          assetAccent: 0x60a5fa,
          liabPrimary: 0xf43f5e,
          liabSecondary: 0xd97706,
          equityPrimary: 0x6366f1,
          equitySecondary: 0x4f46e5,
          neutralMetal: 0x1e293b,
          gridColor: 0x1e293b,
          textGlow: '#60a5fa',
          accentLight: 0x93c5fd,
        };
      case 'champagne-gold':
        return {
          bg: 0x0c0b0a,
          assetPrimary: 0xd97706,
          assetSecondary: 0xb45309,
          assetAccent: 0xfbbf24,
          liabPrimary: 0xe11d48,
          liabSecondary: 0x9f1239,
          equityPrimary: 0x10b981,
          equitySecondary: 0x047857,
          neutralMetal: 0x292524,
          gridColor: 0x292524,
          textGlow: '#f59e0b',
          accentLight: 0xfde68a,
        };
      case 'titanium':
      default:
        return {
          bg: 0x09090b,
          assetPrimary: 0x6366f1,
          assetSecondary: 0x4f46e5,
          assetAccent: 0x818cf8,
          liabPrimary: 0xf43f5e,
          liabSecondary: 0xe11d48,
          equityPrimary: 0x10b981,
          equitySecondary: 0x059669,
          neutralMetal: 0x27272a,
          gridColor: 0x27272a,
          textGlow: '#818cf8',
          accentLight: 0xa5b4fc,
        };
    }
  }, [colorTheme]);

  // Update Camera View Matrices
  const updateCameraPosition = () => {
    if (!persCameraRef.current || !orthoCameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    
    // Spherical to Cartesian
    const clampedPhi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, phi));
    const x = radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = radius * Math.cos(clampedPhi);
    const z = radius * Math.sin(clampedPhi) * Math.cos(theta);

    persCameraRef.current.position.set(x, y, z);
    persCameraRef.current.lookAt(targetLookAtRef.current);

    orthoCameraRef.current.position.set(x, y, z);
    orthoCameraRef.current.lookAt(targetLookAtRef.current);
  };

  // 1. Initialize Three.js Scene, Renderers, Lights
  useEffect(() => {
    if (!canvasRef.current || !containerDimensions) return;

    const width = containerDimensions.width;
    const height = containerDimensions.height;
    if (width <= 0 || height <= 0) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(themeColors.bg);
    scene.fog = new THREE.FogExp2(themeColors.bg, 0.022);
    sceneRef.current = scene;

    // Cameras
    const persCamera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    persCameraRef.current = persCamera;

    const aspect = width / height;
    const frustumSize = 20;
    const orthoCamera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    orthoCameraRef.current = orthoCamera;

    cameraRef.current = isIsometric ? orthoCamera : persCamera;
    updateCameraPosition();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(15, 25, 15);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(themeColors.accentLight, 0.5);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.8, 40);
    rimLight.position.set(0, -5, 10);
    scene.add(rimLight);

    // Objects Root Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Ambient floating particles
    const particleCount = 140;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
      particlePositions[i + 1] = Math.random() * 20 - 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: themeColors.assetAccent,
      size: 0.14,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera flight animation for smooth viewpoints & drill-down navigation
      if (cameraAnimationRef.current) {
        const elapsed = performance.now() - cameraAnimationRef.current.startTime;
        const t = Math.min(1, elapsed / cameraAnimationRef.current.duration);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        cameraAngleRef.current.theta = THREE.MathUtils.lerp(cameraAnimationRef.current.fromTheta, cameraAnimationRef.current.toTheta, ease);
        cameraAngleRef.current.phi = THREE.MathUtils.lerp(cameraAnimationRef.current.fromPhi, cameraAnimationRef.current.toPhi, ease);
        cameraAngleRef.current.radius = THREE.MathUtils.lerp(cameraAnimationRef.current.fromRadius, cameraAnimationRef.current.toRadius, ease);
        updateCameraPosition();
        if (t >= 1) {
          cameraAnimationRef.current = null;
        }
      } else if (isAutoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += delta * rotateSpeed * 0.35;
        updateCameraPosition();
      }

      // Continuous 60fps Spring Physics Lerp for Exploded Sub-Account Nodes
      if (animatedChildNodesRef.current.length > 0) {
        const curSpringVal = springValRef.current;
        animatedChildNodesRef.current.forEach((child) => {
          const isCollapsing = collapsingNodesRef.current.has(child.nodeKey);
          const p = isCollapsing ? (1 - curSpringVal) : curSpringVal;

          // Smooth Quadratic Bézier interpolation with directional divergence
          const t = Math.max(0, Math.min(1, p));
          const omt = 1 - t;
          const posX = omt * omt * child.parentPos.x + 2 * omt * t * child.controlPos.x + t * t * child.targetPos.x;
          const posY = omt * omt * child.parentPos.y + 2 * omt * t * child.controlPos.y + t * t * child.targetPos.y;
          const posZ = omt * omt * child.parentPos.z + 2 * omt * t * child.controlPos.z + t * t * child.targetPos.z;

          child.mesh.position.set(posX, posY, posZ);

          // Subtle organic breathing float once settled at target
          if (t >= 0.98) {
            const floatSpeed = 1.4 + child.subIndex * 0.2;
            child.mesh.position.y += Math.sin(elapsedTime * floatSpeed + child.subIndex) * 0.035;
          }

          // Scale & Opacity dynamics
          const scale = Math.max(0.001, t);
          child.mesh.scale.set(scale, scale, scale);
          if (child.mesh.material && !Array.isArray(child.mesh.material)) {
            (child.mesh.material as THREE.Material).opacity = t * child.targetOpacity;
          }

          if (child.wire && child.wire.material && !Array.isArray(child.wire.material)) {
            (child.wire.material as THREE.Material).opacity = t * 0.55;
          }

          // Dynamic Laser Tether line update
          if (child.tether) {
            const posAttr = child.tether.geometry.getAttribute('position') as THREE.BufferAttribute;
            if (posAttr) {
              posAttr.setXYZ(0, child.tetherStart.x, child.tetherStart.y, child.tetherStart.z);
              posAttr.setXYZ(1, child.mesh.position.x, child.mesh.position.y, child.mesh.position.z);
              posAttr.needsUpdate = true;
            }
            if (child.tether.material && !Array.isArray(child.tether.material)) {
              (child.tether.material as THREE.Material).opacity = t * 0.45;
            }
          }

          // Ring pulse indicator
          if (child.ring) {
            child.ring.position.set(child.mesh.position.x, child.mesh.position.y + 0.35, child.mesh.position.z);
            if (child.ring.material && !Array.isArray(child.ring.material)) {
              (child.ring.material as THREE.Material).opacity = t * (0.4 + Math.sin(elapsedTime * 3) * 0.25);
            }
          }
        });
      }

      // Gentle floating particle field animation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.025;
      }

      // Render
      const activeCam = isIsometric ? orthoCameraRef.current : persCameraRef.current;
      if (activeCam && rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, activeCam);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [colorTheme, isIsometric, containerDimensions?.width, containerDimensions?.height]);

  // Synchronous Viewport Scaling on Resize
  useEffect(() => {
    if (!rendererRef.current || !persCameraRef.current || !orthoCameraRef.current || !containerDimensions) return;
    const { width, height } = containerDimensions;
    if (width <= 0 || height <= 0) return;

    const newAspect = width / height;
    persCameraRef.current.aspect = newAspect;
    persCameraRef.current.updateProjectionMatrix();

    const frustumSize = 20;
    orthoCameraRef.current.left = (frustumSize * newAspect) / -2;
    orthoCameraRef.current.right = (frustumSize * newAspect) / 2;
    orthoCameraRef.current.top = frustumSize / 2;
    orthoCameraRef.current.bottom = frustumSize / -2;
    orthoCameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
  }, [containerDimensions?.width, containerDimensions?.height]);

  // 2. Build 3D Models based on `viewMode`, `currentFinancials`, `ratios`
  useEffect(() => {
    if (!objectsGroupRef.current || !sceneRef.current) return;

    // Clear old group children
    while (objectsGroupRef.current.children.length > 0) {
      const obj = objectsGroupRef.current.children[0];
      objectsGroupRef.current.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }
    interactiveMeshesRef.current = [];
    animatedChildNodesRef.current = [];

    const group = objectsGroupRef.current;
    const {
      totalAssets,
      cash,
      receivables,
      inventory,
      ppe,
      intangibles,
      currentLiab,
      longTermDebt,
      equity,
      revenue,
      grossProfit,
      opIncome,
      netIncome,
      ocf,
      capex,
      fcf,
      financingCF,
    } = currentFinancials;

    // 3D Grid & Base Stage
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(26, 26, themeColors.neutralMetal, themeColors.gridColor);
      gridHelper.position.y = -0.01;
      group.add(gridHelper);

      // Radial base platform
      const basePlatformGeo = new THREE.CylinderGeometry(14, 14.5, 0.4, 48);
      const basePlatformMat = new THREE.MeshStandardMaterial({
        color: themeColors.bg,
        metalness: 0.8,
        roughness: 0.3,
      });
      const basePlatform = new THREE.Mesh(basePlatformGeo, basePlatformMat);
      basePlatform.position.y = -0.22;
      basePlatform.receiveShadow = true;
      group.add(basePlatform);
    }

    // Material Helper
    const createPBRMaterial = (color: number, opacity = 1.0, wire = showWireframe) => {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.4,
        transparent: opacity < 1.0,
        opacity,
        wireframe: wire,
      });
    };

    // -------------------------------------------------------------
    // MODE 1: CAPITAL STRUCTURE & BALANCE SHEET MONOLITH (TWIN TOWERS)
    // -------------------------------------------------------------
    if (viewMode === 'capital-tower') {
      const maxHeight = 10;
      const towerWidth = 3.6;
      const towerDepth = 3.6;

      // Helper to add interactive 3D block with support for exploding into constituent sub-accounts
      const addLayerBlock = (
        name: string,
        category: string,
        amount: number,
        color: number,
        xPos: number,
        yBottom: number,
        heightRatio: number,
        description: string,
        status?: 'Safe' | 'Warning' | 'Critical' | 'Neutral'
      ) => {
        const blockHeight = Math.max(0.4, heightRatio * maxHeight);
        const yCenter = yBottom + blockHeight / 2;
        const isExploded = explodedNodes.has(name);
        const subConfig = getSubAccountBreakdown(name);

        if (isExploded && subConfig && subConfig.subAccounts.length > 0) {
          // 1. Translucent Ghost Parent Anchor Box
          const ghostGeo = new THREE.BoxGeometry(towerWidth, blockHeight, towerDepth);
          const ghostMat = createPBRMaterial(color, 0.12);
          const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
          ghostMesh.position.set(xPos, yCenter, 0);
          group.add(ghostMesh);

          // Subtle wireframe for ghost anchor
          const ghostEdges = new THREE.EdgesGeometry(ghostGeo);
          const ghostLineMat = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.35 
          });
          const ghostWire = new THREE.LineSegments(ghostEdges, ghostLineMat);
          ghostMesh.add(ghostWire);

          // Collapse action beacon on top of ghost anchor
          const beaconGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16);
          const beaconMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xef4444,
            emissiveIntensity: 0.5,
            roughness: 0.3,
          });
          const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
          beaconMesh.position.set(xPos, yBottom + blockHeight + 0.15, 0);
          group.add(beaconMesh);

          interactiveMeshesRef.current.push({
            mesh: beaconMesh,
            data: {
              title: `Collapse ${name}`,
              category: 'Consolidated Ledger Control',
              value: amount,
              description: `Click to collapse all ${subConfig.subAccounts.length} constituent accounts back into consolidated ${name}`,
              status: 'Neutral',
              action: 'collapse',
              targetNodeKey: name,
              hint: 'Click to collapse back to consolidated block',
            },
          });

          // 2. Render Constituent Sub-Account Slices
          const subAccounts = subConfig.subAccounts;
          const lateralDirection = xPos < 0 ? -1 : 1;
          const explodeDistance = 4.2;
          const subWidth = 2.4;
          const subDepth = 1.35;
          const zPitch = 2.35;

          let cumulativeY = yBottom + 0.15;
          const layoutData = subAccounts.map((sub) => {
            const subShare = Math.abs(sub.shareOfParent);
            const subHeight = Math.max(0.48, Math.min(blockHeight * 0.85, subShare * blockHeight * 1.3));
            const subY = cumulativeY + subHeight / 2;
            cumulativeY += subHeight + 0.45;
            return { subHeight, subY };
          });

          subAccounts.forEach((sub, subIdx) => {
            const { subHeight, subY } = layoutData[subIdx];
            const zOffset = (subIdx - (subAccounts.length - 1) / 2) * zPitch;
            const outwardOffset = explodeDistance + Math.abs(zOffset) * 0.15;
            const subX = xPos + lateralDirection * outwardOffset;

            const targetPos = new THREE.Vector3(subX, subY, zOffset);
            const parentPos = new THREE.Vector3(xPos, yCenter, 0);

            const lateralArc = lateralDirection * (explodeDistance * 0.55 + 1.25);
            const controlPos = new THREE.Vector3(
              parentPos.x + lateralArc,
              parentPos.y + (subY - parentPos.y) * 1.35 + (subIdx - (subAccounts.length - 1) / 2) * 0.4,
              zOffset * 1.35
            );

            const subGeo = new THREE.BoxGeometry(subWidth, subHeight, subDepth);
            const subColor = sub.colorNumeric || color;
            const subMat = createPBRMaterial(subColor, 0.95);
            subMat.transparent = true;
            
            const subMesh = new THREE.Mesh(subGeo, subMat);

            const isNodeCollapsing = collapsingNodesRef.current.has(name);
            const initialP = isNodeCollapsing ? 1 : (springValRef.current === 1 ? 1 : 0);
            const t0 = initialP;
            const omt0 = 1 - t0;
            subMesh.position.set(
              omt0 * omt0 * parentPos.x + 2 * omt0 * t0 * controlPos.x + t0 * t0 * targetPos.x,
              omt0 * omt0 * parentPos.y + 2 * omt0 * t0 * controlPos.y + t0 * t0 * targetPos.y,
              omt0 * omt0 * parentPos.z + 2 * omt0 * t0 * controlPos.z + t0 * t0 * targetPos.z
            );
            const curScale = Math.max(0.001, initialP);
            subMesh.scale.set(curScale, curScale, curScale);
            subMat.opacity = initialP * 0.95;

            subMesh.castShadow = true;
            subMesh.receiveShadow = true;
            group.add(subMesh);

            // Sub-account edge highlights
            const subEdges = new THREE.EdgesGeometry(subGeo);
            const subLineMat = new THREE.LineBasicMaterial({ 
              color: 0xffffff, 
              transparent: true, 
              opacity: initialP * 0.5 
            });
            const subWire = new THREE.LineSegments(subEdges, subLineMat);
            subMesh.add(subWire);

            // Tether line
            const tetherPoints = [parentPos, subMesh.position.clone()];
            const tetherGeo = new THREE.BufferGeometry().setFromPoints(tetherPoints);
            const tetherMat = new THREE.LineBasicMaterial({
              color: subColor,
              transparent: true,
              opacity: initialP * 0.45,
            });
            const tetherLine = new THREE.Line(tetherGeo, tetherMat);
            group.add(tetherLine);

            // Floating ring
            const ringGeo = new THREE.RingGeometry(0.18, 0.28, 16);
            ringGeo.rotateX(-Math.PI / 2);
            const ringMat = new THREE.MeshBasicMaterial({
              color: subColor,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: initialP * 0.8,
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.position.set(subMesh.position.x, subMesh.position.y + subHeight / 2 + 0.1, subMesh.position.z);
            group.add(ringMesh);

            animatedChildNodesRef.current.push({
              mesh: subMesh,
              wire: subWire,
              tether: tetherLine,
              tetherStart: parentPos,
              ring: ringMesh,
              parentPos,
              targetPos,
              controlPos,
              ghostMesh,
              targetOpacity: 0.95,
              nodeKey: name,
              subIndex: subIdx,
              totalSiblings: subAccounts.length,
            });

            const subVal = amount * sub.shareOfParent;

            interactiveMeshesRef.current.push({
              mesh: subMesh,
              data: {
                title: sub.name,
                category: `${name} › ${sub.code}`,
                value: subVal,
                secondaryValue: `${formatCurrency(subVal, currency)} (${(sub.shareOfParent * 100).toFixed(1)}%)`,
                percentage: sub.shareOfParent * 100,
                description: sub.description,
                status: sub.status,
                isSubAccount: true,
                subAccountObj: sub,
                parentKey: name,
                glCode: sub.code,
                shareOfParent: sub.shareOfParent,
                hint: 'Click to select sub-account • Click red beacon to collapse',
              },
            });
          });
        } else {
          // Standard Unexploded 3D Block
          const geo = new THREE.BoxGeometry(towerWidth, blockHeight, towerDepth);
          const mat = createPBRMaterial(color, 0.92);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(xPos, yCenter, 0);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);

          // Wireframe outline
          const edges = new THREE.EdgesGeometry(geo);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
          const wire = new THREE.LineSegments(edges, lineMat);
          mesh.add(wire);

          // Explodable badge indicator
          if (subConfig && subConfig.subAccounts.length > 0) {
            const badgeGeo = new THREE.OctahedronGeometry(0.25, 0);
            const badgeMat = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.6,
            });
            const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
            badgeMesh.position.set(xPos + (xPos < 0 ? -towerWidth / 2 - 0.3 : towerWidth / 2 + 0.3), yCenter, 0);
            group.add(badgeMesh);
          }

          interactiveMeshesRef.current.push({
            mesh,
            data: {
              title: name,
              category,
              value: amount,
              percentage: Number(((amount / totalAssets) * 100).toFixed(1)),
              description,
              status: status || 'Neutral',
              nodeKey: name,
              isParentNode: true,
              isExploded: false,
              subAccountCount: subConfig ? subConfig.subAccounts.length : 0,
              hint: subConfig ? `💡 Click node to explode into ${subConfig.subAccounts.length} constituent sub-accounts` : undefined,
            },
          });
        }

        return blockHeight;
      };

      // TOWER A: ASSETS (Left Tower)
      const assetX = -2.8;
      let currentYAsset = 0;

      currentYAsset += addLayerBlock(
        'Cash & Equivalents',
        'Current Assets',
        cash,
        themeColors.assetAccent,
        assetX,
        currentYAsset,
        cash / totalAssets,
        'Liquid treasury reserves and bank deposits.',
        'Safe'
      );

      currentYAsset += addLayerBlock(
        'Accounts Receivable',
        'Current Assets',
        receivables,
        themeColors.assetPrimary,
        assetX,
        currentYAsset,
        receivables / totalAssets,
        'Uncollected customer invoice receivables.',
        'Neutral'
      );

      currentYAsset += addLayerBlock(
        'Inventory',
        'Current Assets',
        inventory,
        themeColors.assetSecondary,
        assetX,
        currentYAsset,
        inventory / totalAssets,
        'Raw materials, work-in-progress, and finished goods.',
        'Neutral'
      );

      currentYAsset += addLayerBlock(
        'PP&E (Fixed Assets)',
        'Non-Current Assets',
        ppe,
        0x10b981,
        assetX,
        currentYAsset,
        ppe / totalAssets,
        'Physical servers, data centers, facilities, and hardware.',
        'Safe'
      );

      addLayerBlock(
        'Intangibles & Goodwill',
        'Non-Current Assets',
        intangibles,
        0x047857,
        assetX,
        currentYAsset,
        intangibles / totalAssets,
        'Patents, proprietary algorithms, and brand equity.',
        'Neutral'
      );

      // TOWER B: LIABILITIES & EQUITY (Right Tower)
      const liabX = 2.8;
      let currentYLiab = 0;

      currentYLiab += addLayerBlock(
        'Current Liabilities',
        'Short-Term Obligations',
        currentLiab,
        themeColors.liabPrimary,
        liabX,
        currentYLiab,
        currentLiab / totalAssets,
        'Accounts payable, accrued payroll, and short-term debt.',
        'Warning'
      );

      currentYLiab += addLayerBlock(
        'Long-Term Debt',
        'Long-Term Obligations',
        longTermDebt,
        themeColors.liabSecondary,
        liabX,
        currentYLiab,
        longTermDebt / totalAssets,
        'Senior credit facilities, bond issuances, and notes.',
        ratios.debtToEquity > 1.2 ? 'Critical' : 'Neutral'
      );

      addLayerBlock(
        'Stockholders Equity',
        'Capital & Retained Earnings',
        equity,
        themeColors.equityPrimary,
        liabX,
        currentYLiab,
        equity / totalAssets,
        'Net worth backing common equity and cumulative retained earnings.',
        'Safe'
      );
    }

    // -------------------------------------------------------------
    // MODE 2: 3D RISK & DISTRESS TERRAIN
    // -------------------------------------------------------------
    else if (viewMode === 'risk-terrain') {
      const terrainGeo = new THREE.PlaneGeometry(18, 18, 32, 32);
      terrainGeo.rotateX(-Math.PI / 2);

      const pos = terrainGeo.attributes.position;
      const count = pos.count;
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        const distFromCenter = Math.sqrt(x * x + z * z);
        let height = 
          Math.sin(x * 0.45) * Math.cos(z * 0.45) * 2.2 + 
          Math.sin(distFromCenter * 0.5) * 0.8 + 
          2.0;

        height = Math.max(0.2, Math.min(6.5, height));
        pos.setY(i, height);

        const normalizedH = height / 6.5;
        if (normalizedH > 0.65) {
          colors[i * 3] = 0.06;
          colors[i * 3 + 1] = 0.72;
          colors[i * 3 + 2] = 0.50;
        } else if (normalizedH > 0.45) {
          colors[i * 3] = 0.23;
          colors[i * 3 + 1] = 0.51;
          colors[i * 3 + 2] = 0.96;
        } else if (normalizedH > 0.28) {
          colors[i * 3] = 0.85;
          colors[i * 3 + 1] = 0.60;
          colors[i * 3 + 2] = 0.15;
        } else {
          colors[i * 3] = 0.88;
          colors[i * 3 + 1] = 0.18;
          colors[i * 3 + 2] = 0.32;
        }
      }

      terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.3,
        wireframe: showWireframe,
      });

      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.receiveShadow = true;
      group.add(terrainMesh);

      // Target Company Floating Beacon Pin
      const beaconGroup = new THREE.Group();
      const pinX = 2.4;
      const pinZ = -2.0;
      const pinY = 4.8;

      const pinPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, pinY, 16);
      const pinPoleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x10b981, emissiveIntensity: 0.5 });
      const pinPole = new THREE.Mesh(pinPoleGeo, pinPoleMat);
      pinPole.position.set(pinX, pinY / 2, pinZ);
      beaconGroup.add(pinPole);

      const beaconSphereGeo = new THREE.SphereGeometry(0.45, 24, 24);
      const beaconSphereMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 0.8,
        metalness: 0.5,
      });
      const beaconSphere = new THREE.Mesh(beaconSphereGeo, beaconSphereMat);
      beaconSphere.position.set(pinX, pinY, pinZ);
      beaconGroup.add(beaconSphere);

      const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(pinX, pinY + 0.1, pinZ);
      beaconGroup.add(ringMesh);

      group.add(beaconGroup);

      interactiveMeshesRef.current.push({
        mesh: beaconSphere,
        data: {
          title: dataset.companyName,
          category: `Health Altitude (${health.overallScore}/100)`,
          value: ratios.altmanZScore,
          secondaryValue: `Altman Z: ${ratios.altmanZScore}x | Piotroski: ${ratios.piotroskiFScore}/9`,
          description: `Current financial coordinate positioned in the ${health.grade} Grade resilience quadrant with stable solvency buffer.`,
          status: health.overallScore >= 75 ? 'Safe' : 'Warning',
        },
      });

      // Peer Benchmark Marker Pins
      const peerPins = [
        { name: 'Industry Benchmark', x: -1.5, z: 1.2, y: 3.2, score: '68/100', color: 0x3b82f6 },
        { name: 'Sector Leader', x: 4.2, z: -3.5, y: 5.6, score: '91/100', color: 0x8b5cf6 },
        { name: 'Distress Threshold', x: -4.5, z: 4.2, y: 1.2, score: '38/100', color: 0xf43f5e },
      ];

      peerPins.forEach((peer) => {
        const peerSphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const peerMat = new THREE.MeshStandardMaterial({ color: peer.color, emissive: peer.color, emissiveIntensity: 0.4 });
        const peerMesh = new THREE.Mesh(peerSphereGeo, peerMat);
        peerMesh.position.set(peer.x, peer.y, peer.z);
        group.add(peerMesh);

        interactiveMeshesRef.current.push({
          mesh: peerMesh,
          data: {
            title: peer.name,
            category: 'Peer Spatial Coordinate',
            value: 0,
            secondaryValue: `Composite Vitality: ${peer.score}`,
            description: `Relative position in 3D multi-factor risk landscape relative to ${dataset.companyName}.`,
            status: 'Neutral',
          },
        });
      });
    }

    // -------------------------------------------------------------
    // MODE 3: 3D DUPONT DECOMPOSITION SPATIAL TREE
    // -------------------------------------------------------------
    else if (viewMode === 'dupont-tree') {
      const roe = ratios.returnOnEquity || 22.4;
      const netMarginVal = ratios.netProfitMargin || 14.8;
      const assetTurnoverVal = totalAssets > 0 ? Number((revenue / totalAssets).toFixed(2)) : 0.85;
      const equityMultiplierVal = equity > 0 ? Number((totalAssets / equity).toFixed(2)) : 1.78;

      const nodes: {
        id: string;
        title: string;
        cat: string;
        val: number;
        formattedVal: string;
        pos: [number, number, number];
        color: number;
        desc: string;
      }[] = [
        {
          id: 'roe',
          title: 'Return on Equity (ROE)',
          cat: 'DuPont Core Metric',
          val: roe,
          formattedVal: `${roe.toFixed(1)}%`,
          pos: [0, 7.5, 0],
          color: themeColors.assetAccent,
          desc: 'Comprehensive shareholder return generated per dollar of invested equity.',
        },
        {
          id: 'margin',
          title: 'Net Profit Margin',
          cat: 'Operating Efficiency Factor',
          val: netMarginVal,
          formattedVal: `${netMarginVal.toFixed(1)}%`,
          pos: [-5.2, 4.2, 0],
          color: themeColors.assetPrimary,
          desc: 'Conversion rate of top-line revenue into bottom-line net profit.',
        },
        {
          id: 'turnover',
          title: 'Total Asset Turnover',
          cat: 'Asset Efficiency Factor',
          val: assetTurnoverVal,
          formattedVal: `${assetTurnoverVal}x`,
          pos: [0, 4.2, 2.8],
          color: 0x3b82f6,
          desc: 'Capital efficiency measuring revenue generated per dollar of total assets deployed.',
        },
        {
          id: 'multiplier',
          title: 'Financial Leverage (Equity Multiplier)',
          cat: 'Capital Structure Factor',
          val: equityMultiplierVal,
          formattedVal: `${equityMultiplierVal}x`,
          pos: [5.2, 4.2, 0],
          color: themeColors.liabPrimary,
          desc: 'Degree of financial leverage utilized in the corporate capital structure.',
        },
        {
          id: 'netInc',
          title: 'Net Income',
          cat: 'Earnings Component',
          val: netIncome,
          formattedVal: formatCurrency(netIncome, currency),
          pos: [-7.2, 1.2, -1.5],
          color: 0x34d399,
          desc: 'Accounting net earnings after operating costs, interest, and taxes.',
        },
        {
          id: 'rev',
          title: 'Total Revenue',
          cat: 'Top-Line Component',
          val: revenue,
          formattedVal: formatCurrency(revenue, currency),
          pos: [-3.2, 1.2, 1.5],
          color: 0x60a5fa,
          desc: 'Gross billings and sales recognized across primary enterprise channels.',
        },
        {
          id: 'assets',
          title: 'Total Assets Base',
          cat: 'Asset Base Component',
          val: totalAssets,
          formattedVal: formatCurrency(totalAssets, currency),
          pos: [0, 1.2, 4.5],
          color: 0x818cf8,
          desc: 'Sum of all physical, financial, and intangible enterprise resources.',
        },
        {
          id: 'eq',
          title: 'Shareholders Equity Base',
          cat: 'Equity Base Component',
          val: equity,
          formattedVal: formatCurrency(equity, currency),
          pos: [6.5, 1.2, -1.5],
          color: 0xec4899,
          desc: 'Net book value backing common and preferred share capital.',
        },
      ];

      nodes.forEach((node) => {
        const isRoot = node.id === 'roe';
        const radius = isRoot ? 0.9 : 0.65;
        const isExploded = explodedNodes.has(node.title) || explodedNodes.has(node.id);
        const subConfig = getSubAccountBreakdown(node.title);

        const nodeGeo = new THREE.DodecahedronGeometry(radius, 1);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: node.color,
          roughness: 0.2,
          metalness: 0.6,
          emissive: node.color,
          emissiveIntensity: isRoot ? 0.4 : (isExploded ? 0.6 : 0.2),
        });

        const mesh = new THREE.Mesh(nodeGeo, nodeMat);
        mesh.position.set(...node.pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        const haloGeo = new THREE.TorusGeometry(radius * 1.3, isExploded ? 0.06 : 0.03, 12, 32);
        const haloMat = new THREE.MeshBasicMaterial({ 
          color: isExploded ? 0x38bdf8 : node.color, 
          transparent: true, 
          opacity: isExploded ? 0.8 : 0.4 
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        mesh.add(halo);

        // Orbital Satellites on Explode
        if (isExploded && subConfig && subConfig.subAccounts.length > 0) {
          const orbitRadius = 3.2;
          const parentPos = new THREE.Vector3(...node.pos);

          subConfig.subAccounts.forEach((sub, sIdx) => {
            const angle = (sIdx / subConfig.subAccounts.length) * Math.PI * 2;
            const satX = node.pos[0] + Math.cos(angle) * orbitRadius;
            const satY = node.pos[1] + Math.sin(angle) * 1.6;
            const satZ = node.pos[2] + Math.sin(angle) * 1.4;
            const targetPos = new THREE.Vector3(satX, satY, satZ);

            const spiralAngle = angle + 0.4;
            const controlPos = new THREE.Vector3(
              node.pos[0] + Math.cos(spiralAngle) * (orbitRadius * 0.65),
              node.pos[1] + Math.sin(spiralAngle) * 1.8,
              node.pos[2] + Math.sin(spiralAngle) * 1.6
            );

            const satGeo = new THREE.SphereGeometry(0.38, 20, 20);
            const satColor = sub.colorNumeric || node.color;
            const satMat = new THREE.MeshStandardMaterial({
              color: satColor,
              emissive: satColor,
              emissiveIntensity: 0.5,
              metalness: 0.7,
              roughness: 0.2,
              transparent: true,
              opacity: 0.95,
            });
            const satMesh = new THREE.Mesh(satGeo, satMat);

            const isNodeCollapsing = collapsingNodesRef.current.has(node.title);
            const initialP = isNodeCollapsing ? 1 : (springValRef.current === 1 ? 1 : 0);
            const t0 = initialP;
            const omt0 = 1 - t0;
            satMesh.position.set(
              omt0 * omt0 * parentPos.x + 2 * omt0 * t0 * controlPos.x + t0 * t0 * targetPos.x,
              omt0 * omt0 * parentPos.y + 2 * omt0 * t0 * controlPos.y + t0 * t0 * targetPos.y,
              omt0 * omt0 * parentPos.z + 2 * omt0 * t0 * controlPos.z + t0 * t0 * targetPos.z
            );
            const curScale = Math.max(0.001, initialP);
            satMesh.scale.set(curScale, curScale, curScale);
            satMat.opacity = initialP * 0.95;
            satMesh.castShadow = true;
            group.add(satMesh);

            const tetherGeo = new THREE.BufferGeometry().setFromPoints([
              parentPos,
              satMesh.position.clone()
            ]);
            const tetherMat = new THREE.LineBasicMaterial({
              color: satColor,
              transparent: true,
              opacity: initialP * 0.6,
            });
            const tether = new THREE.Line(tetherGeo, tetherMat);
            group.add(tether);

            animatedChildNodesRef.current.push({
              mesh: satMesh,
              tether,
              tetherStart: parentPos,
              parentPos,
              targetPos,
              controlPos,
              targetOpacity: 0.95,
              nodeKey: node.title,
              subIndex: sIdx,
              totalSiblings: subConfig.subAccounts.length,
            });

            interactiveMeshesRef.current.push({
              mesh: satMesh,
              data: {
                title: sub.name,
                category: `${node.title} › ${sub.code}`,
                value: node.val * Math.abs(sub.shareOfParent),
                secondaryValue: `${(Math.abs(sub.shareOfParent) * 100).toFixed(1)}% constituent share`,
                description: sub.description,
                status: sub.status,
                isSubAccount: true,
                subAccountObj: sub,
                parentKey: node.title,
                glCode: sub.code,
                shareOfParent: Math.abs(sub.shareOfParent),
                hint: 'Click to select sub-account • Click parent to collapse',
              },
            });
          });
        }

        interactiveMeshesRef.current.push({
          mesh,
          data: {
            title: node.title,
            category: node.cat,
            value: node.val,
            secondaryValue: node.formattedVal,
            description: node.desc,
            status: 'Safe',
            nodeKey: node.title,
            isParentNode: true,
            isExploded,
            subAccountCount: subConfig ? subConfig.subAccounts.length : 0,
            hint: isExploded 
              ? '💡 Click node to collapse orbital sub-accounts' 
              : (subConfig ? `💡 Click node to explode into ${subConfig.subAccounts.length} constituent factors` : undefined),
          },
        });
      });

      // Connecting Lines
      const connections: [string, string][] = [
        ['roe', 'margin'],
        ['roe', 'turnover'],
        ['roe', 'multiplier'],
        ['margin', 'netInc'],
        ['margin', 'rev'],
        ['turnover', 'rev'],
        ['turnover', 'assets'],
        ['multiplier', 'assets'],
        ['multiplier', 'eq'],
      ];

      connections.forEach(([fromId, toId]) => {
        const fromNode = nodes.find((n) => n.id === fromId);
        const toNode = nodes.find((n) => n.id === toId);
        if (fromNode && toNode) {
          const points = [new THREE.Vector3(...fromNode.pos), new THREE.Vector3(...toNode.pos)];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: themeColors.accentLight,
            transparent: true,
            opacity: 0.45,
            linewidth: 2,
          });
          const line = new THREE.Line(lineGeo, lineMat);
          group.add(line);
        }
      });
    }

    // -------------------------------------------------------------
    // MODE 4: 3D CASH FLOW WATERFALL & LIQUIDITY MATRIX
    // -------------------------------------------------------------
    else if (viewMode === 'cashflow-waterfall') {
      const steps = [
        { name: 'Gross Revenue', val: revenue, type: 'start', color: 0x6366f1, desc: 'Initial top-line sales inflow' },
        { name: 'Operating Cash Flow', val: ocf, type: 'inflow', color: 0x10b981, desc: 'Core cash generated by running business operations' },
        { name: 'Capital Expenditures (CapEx)', val: -Math.abs(capex), type: 'outflow', color: 0xf43f5e, desc: 'Reinvestment into technology, servers & facilities' },
        { name: 'Free Cash Flow (FCF)', val: fcf, type: 'result', color: 0x0ea5e9, desc: 'Discretionary liquidity available after all CapEx commitments' },
        { name: 'Debt Servicing & Financing', val: financingCF, type: 'outflow', color: 0xd97706, desc: 'Net debt repayments, dividends & share repurchases' },
        { name: 'Net Cash & Liquid Reserves', val: cash, type: 'end', color: 0x8b5cf6, desc: 'Ending liquid treasury cushion held on balance sheet' },
      ];

      const stepWidth = 1.8;
      const stepDepth = 2.4;
      const maxVal = Math.max(...steps.map((s) => Math.abs(s.val)), 1);

      steps.forEach((step, idx) => {
        const xPos = (idx - (steps.length - 1) / 2) * (stepWidth + 0.8);
        const height = Math.max(0.6, (Math.abs(step.val) / maxVal) * 7.5);
        const yPos = height / 2;
        const isExploded = explodedNodes.has(step.name);
        const subConfig = getSubAccountBreakdown(step.name);

        if (isExploded && subConfig && subConfig.subAccounts.length > 0) {
          const ghostGeo = new THREE.BoxGeometry(stepWidth, height, stepDepth);
          const ghostMat = createPBRMaterial(step.color, 0.15);
          const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
          ghostMesh.position.set(xPos, yPos, 0);
          group.add(ghostMesh);

          const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
          const beaconMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xef4444,
            emissiveIntensity: 0.6,
          });
          const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
          beaconMesh.position.set(xPos, height + 0.15, 0);
          group.add(beaconMesh);

          interactiveMeshesRef.current.push({
            mesh: beaconMesh,
            data: {
              title: `Collapse ${step.name}`,
              category: 'Cash Flow Step Control',
              value: step.val,
              description: `Click to collapse ${subConfig.subAccounts.length} sub-accounts back into ${step.name}`,
              status: 'Neutral',
              action: 'collapse',
              targetNodeKey: step.name,
              hint: 'Click to collapse back to consolidated pillar',
            },
          });

          const parentPos = new THREE.Vector3(xPos, yPos, 0);
          subConfig.subAccounts.forEach((sub, sIdx) => {
            const subShare = Math.abs(sub.shareOfParent);
            const subH = Math.max(0.45, subShare * height * 1.3);
            const zPitch = 2.3;
            const zOffset = (sIdx - (subConfig.subAccounts.length - 1) / 2) * zPitch;
            const targetPos = new THREE.Vector3(xPos, subH / 2, zOffset);
            const controlPos = new THREE.Vector3(
              xPos + (sIdx % 2 === 0 ? 1.4 : -1.4),
              parentPos.y + (subH / 2 - parentPos.y) * 1.35,
              zOffset * 1.35
            );

            const subGeo = new THREE.BoxGeometry(stepWidth * 0.85, subH, stepDepth * 0.65);
            const subColor = sub.colorNumeric || step.color;
            const subMat = createPBRMaterial(subColor, 0.95);
            subMat.transparent = true;
            const subMesh = new THREE.Mesh(subGeo, subMat);

            const isNodeCollapsing = collapsingNodesRef.current.has(step.name);
            const initialP = isNodeCollapsing ? 1 : (springValRef.current === 1 ? 1 : 0);
            const t0 = initialP;
            const omt0 = 1 - t0;
            subMesh.position.set(
              omt0 * omt0 * parentPos.x + 2 * omt0 * t0 * controlPos.x + t0 * t0 * targetPos.x,
              omt0 * omt0 * parentPos.y + 2 * omt0 * t0 * controlPos.y + t0 * t0 * targetPos.y,
              omt0 * omt0 * parentPos.z + 2 * omt0 * t0 * controlPos.z + t0 * t0 * targetPos.z
            );
            const curScale = Math.max(0.001, initialP);
            subMesh.scale.set(curScale, curScale, curScale);
            subMat.opacity = initialP * 0.95;
            subMesh.castShadow = true;
            subMesh.receiveShadow = true;
            group.add(subMesh);

            const tetherGeo = new THREE.BufferGeometry().setFromPoints([
              parentPos,
              subMesh.position.clone()
            ]);
            const tetherMat = new THREE.LineBasicMaterial({
              color: subColor,
              transparent: true,
              opacity: initialP * 0.5,
            });
            const tether = new THREE.Line(tetherGeo, tetherMat);
            group.add(tether);

            animatedChildNodesRef.current.push({
              mesh: subMesh,
              tether,
              tetherStart: parentPos,
              parentPos,
              targetPos,
              controlPos,
              targetOpacity: 0.95,
              nodeKey: step.name,
              subIndex: sIdx,
              totalSiblings: subConfig.subAccounts.length,
            });

            const subVal = step.val * subShare;
            interactiveMeshesRef.current.push({
              mesh: subMesh,
              data: {
                title: sub.name,
                category: `${step.name} › ${sub.code}`,
                value: subVal,
                secondaryValue: `${formatCurrency(subVal, currency)} (${(subShare * 100).toFixed(1)}%)`,
                description: sub.description,
                status: sub.status,
                isSubAccount: true,
                subAccountObj: sub,
                parentKey: step.name,
                glCode: sub.code,
                shareOfParent: subShare,
                hint: 'Click to select sub-account • Click red beacon to collapse',
              },
            });
          });
        } else {
          const geo = new THREE.BoxGeometry(stepWidth, height, stepDepth);
          const mat = createPBRMaterial(step.color, 0.92);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(xPos, yPos, 0);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);

          const edges = new THREE.EdgesGeometry(geo);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
          const wire = new THREE.LineSegments(edges, lineMat);
          mesh.add(wire);

          const capGeo = new THREE.PlaneGeometry(stepWidth * 0.9, stepDepth * 0.9);
          capGeo.rotateX(-Math.PI / 2);
          const capMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
          const capMesh = new THREE.Mesh(capGeo, capMat);
          capMesh.position.set(xPos, height + 0.02, 0);
          group.add(capMesh);

          if (subConfig && subConfig.subAccounts.length > 0) {
            const badgeGeo = new THREE.OctahedronGeometry(0.2, 0);
            const badgeMat = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.6,
            });
            const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
            badgeMesh.position.set(xPos, height + 0.3, 0);
            group.add(badgeMesh);
          }

          interactiveMeshesRef.current.push({
            mesh,
            data: {
              title: step.name,
              category: `Cash Flow Step #${idx + 1}`,
              value: step.val,
              secondaryValue: formatCurrency(step.val, currency),
              description: step.desc,
              status: step.val >= 0 ? 'Safe' : 'Warning',
              nodeKey: step.name,
              isParentNode: true,
              isExploded: false,
              subAccountCount: subConfig ? subConfig.subAccounts.length : 0,
              hint: subConfig ? `💡 Click node to explode into ${subConfig.subAccounts.length} constituent cash items` : undefined,
            },
          });
        }
      });
    }
  }, [viewMode, currentFinancials, ratios, health, colorTheme, showGrid, showWireframe, currency, explodedNodes]);

  // 3. Interactive Mouse & Touch Dragging Handlers for 3D Orbit & Raycasting Click-to-Explode
  const handleCanvasClick = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const normX = (mouseX / rect.width) * 2 - 1;
    const normY = -(mouseY / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const activeCam = isIsometric ? orthoCameraRef.current : persCameraRef.current;
    if (!activeCam || !sceneRef.current) return;

    raycaster.setFromCamera(new THREE.Vector2(normX, normY), activeCam);
    const meshes = interactiveMeshesRef.current.map((item) => item.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const matched = interactiveMeshesRef.current.find((item) => {
        return item.mesh === hitObj || item.mesh.children.includes(hitObj as any);
      });

      if (matched && matched.data) {
        if (matched.data.action === 'collapse' && matched.data.targetNodeKey) {
          onToggleExplode(matched.data.targetNodeKey);
          return;
        }

        const targetNodeKey = matched.data.nodeKey || matched.data.title;
        if (isNodeExplodable(targetNodeKey)) {
          onToggleExplode(targetNodeKey);
          return;
        }

        if (matched.data.isSubAccount && matched.data.subAccountObj) {
          onSelectSubAccount(matched.data.subAccountObj);
          return;
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    mouseDownStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle 3D Orbit Dragging
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));
      
      updateCameraPosition();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Handle 3D Raycasting Hover Detection
    const normX = (mouseX / rect.width) * 2 - 1;
    const normY = -(mouseY / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const activeCam = isIsometric ? orthoCameraRef.current : persCameraRef.current;
    if (!activeCam || !sceneRef.current) return;

    raycaster.setFromCamera(new THREE.Vector2(normX, normY), activeCam);
    const meshes = interactiveMeshesRef.current.map((item) => item.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const matched = interactiveMeshesRef.current.find((item) => {
        return item.mesh === hitObj || item.mesh.children.includes(hitObj as any);
      });

      if (matched) {
        setHoveredData(matched.data);
        setTooltipPos({ x: mouseX + 16, y: mouseY - 20, visible: true });
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    setTooltipPos((prev) => ({ ...prev, visible: false }));
    document.body.style.cursor = 'default';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    const deltaX = Math.abs(e.clientX - mouseDownStartRef.current.x);
    const deltaY = Math.abs(e.clientY - mouseDownStartRef.current.y);
    const duration = Date.now() - mouseDownStartRef.current.time;

    if (deltaX < 6 && deltaY < 6 && duration < 400) {
      handleCanvasClick(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.015;
    cameraAngleRef.current.radius = Math.max(8, Math.min(50, cameraAngleRef.current.radius + zoomFactor));
    updateCameraPosition();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));
      
      updateCameraPosition();
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const duration = Date.now() - touchStartRef.current.time;

      if (deltaX < 10 && deltaY < 10 && duration < 500) {
        handleCanvasClick(touch.clientX, touch.clientY);
      }
    }
  };

  return (
    <div className="w-full h-full relative select-none cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block touch-none"
      />

      {/* Floating Top-Left Explode Status HUD */}
      {explodedNodes.size > 0 ? (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#121215]/90 backdrop-blur-md border border-indigo-500/40 px-3 py-1.5 rounded-xl shadow-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <div className="text-xs font-mono text-white flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exploded Nodes: <strong className="text-indigo-300">{explodedNodes.size}</strong></span>
          </div>
          <button
            onClick={onCollapseAll}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <Minimize2 className="w-2.5 h-2.5" />
            <span>Collapse All</span>
          </button>
        </div>
      ) : (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#121215]/85 backdrop-blur-md border border-[#27272a] px-3 py-1.5 rounded-xl text-[11px] text-[#a1a1aa] shadow-lg">
          <Split className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any 3D node to <strong className="text-white">explode</strong> into sub-accounts</span>
        </div>
      )}

      {/* Floating On-Canvas HUD Coordinates & Controls */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-[#a1a1aa] bg-[#121215]/80 backdrop-blur-md p-2.5 rounded-xl border border-[#27272a]/80">
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>3D Spatial Raycaster Active</span>
        </div>
        <div>Entity: <span className="text-indigo-300">{dataset.companyName} ({selectedPeriod})</span></div>
        <div>Camera: <span className="text-[#e4e4e7]">{isIsometric ? 'Isometric 45°' : 'Perspective 35mm'}</span></div>
        <div className="text-[10px] text-[#71717a] mt-0.5">Click & drag to rotate • Scroll to zoom • Click node to explode</div>
      </div>

      {/* Dynamic 3D Raycasting Tooltip */}
      {tooltipPos.visible && hoveredData && (
        <div
          className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 w-72 bg-[#18181b]/95 backdrop-blur-xl border border-[#3f3f46] p-3 rounded-xl shadow-2xl transition-all duration-75 text-left"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              {hoveredData.glCode && (
                <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {hoveredData.glCode}
                </span>
              )}
              <span className="text-xs font-semibold text-white truncate">{hoveredData.title}</span>
            </div>
            {hoveredData.status && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  hoveredData.status === 'Safe'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : hoveredData.status === 'Warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : hoveredData.status === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {hoveredData.status}
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider">
              {hoveredData.category}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white font-mono">
                {hoveredData.isSubAccount 
                  ? formatCurrency(hoveredData.value, currency)
                  : (hoveredData.value > 1000 ? formatCurrency(hoveredData.value, currency) : hoveredData.value)}
              </span>
              {hoveredData.percentage !== undefined && (
                <span className="text-xs text-indigo-400 font-mono">
                  {hoveredData.percentage}% of Assets
                </span>
              )}
            </div>
            {hoveredData.secondaryValue && (
              <div className="text-[11px] text-[#a1a1aa] font-mono">
                {hoveredData.secondaryValue}
              </div>
            )}
            <p className="text-[11px] text-[#a1a1aa] pt-1 border-t border-[#27272a] leading-relaxed">
              {hoveredData.description}
            </p>
            {hoveredData.hint && (
              <div className="text-[10px] text-indigo-300 font-mono pt-1 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 shrink-0" />
                <span>{hoveredData.hint}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDSpatialScene;

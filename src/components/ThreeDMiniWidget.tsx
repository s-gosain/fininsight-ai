import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers3, Maximize2 } from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode } from '../types';

interface ThreeDMiniWidgetProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  onExpandTo3DTab?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ThreeDMiniWidget: React.FC<ThreeDMiniWidgetProps> = ({
  dataset,
  ratios,
  currency,
  onExpandTo3DTab,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isCollapsed || !containerRef.current) return;

    const containerEl = containerRef.current;
    let isDisposed = false;
    let animId: number;
    let resizeRaf: number | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let canvas: HTMLCanvasElement | null = null;

    try {
      canvas = document.createElement('canvas');
      canvas.className = 'absolute inset-0 w-full h-full pointer-events-none z-0';
      canvas.style.backgroundColor = 'transparent';

      // Test WebGL support safely
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglFailed(true);
        return;
      }

      containerEl.appendChild(canvas);

      const width = Math.max(containerEl.clientWidth || 300, 100);
      const height = Math.max(containerEl.clientHeight || 176, 100);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(4, 3, 5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Studio lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0x6366f1, 1.2);
      dirLight.position.set(5, 10, 7);
      scene.add(dirLight);

      const group = new THREE.Group();
      scene.add(group);

      // Left Column: Asset Block
      const assetGeo = new THREE.BoxGeometry(1.2, 2.4, 1.2);
      const assetMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.25,
        metalness: 0.5,
      });
      const assetMesh = new THREE.Mesh(assetGeo, assetMat);
      assetMesh.position.set(-0.85, 0, 0);
      group.add(assetMesh);

      // Right Column: Claims (Debt + Equity)
      const debtGeo = new THREE.BoxGeometry(1.2, 1.0, 1.2);
      const debtMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.25,
        metalness: 0.5,
      });
      const debtMesh = new THREE.Mesh(debtGeo, debtMat);
      debtMesh.position.set(0.85, 0.7, 0);
      group.add(debtMesh);

      const equityGeo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
      const equityMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.25,
        metalness: 0.5,
      });
      const equityMesh = new THREE.Mesh(equityGeo, equityMat);
      equityMesh.position.set(0.85, -0.5, 0);
      group.add(equityMesh);

      // Orbit ring
      const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = containerEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          if (Number.isFinite(rawX) && Number.isFinite(rawY)) {
            mouseX = Math.max(-1, Math.min(1, rawX));
            mouseY = Math.max(-1, Math.min(1, rawY));
            setMouseTilt({ x: mouseX, y: mouseY });
          }
        }
      };
      containerEl.addEventListener('mousemove', handleMouseMove);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(animId);
        setWebglFailed(true);
        if (canvas && canvas.parentElement) {
          canvas.parentElement.removeChild(canvas);
        }
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);

      // Animation Loop
      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);
        if (Number.isFinite(mouseY) && Number.isFinite(mouseX)) {
          group.rotation.y += 0.012;
          group.rotation.x = mouseY * 0.3;
          group.rotation.z = mouseX * 0.2;
        }
        if (renderer) {
          try {
            renderer.render(scene, camera);
          } catch {
            // Ignore render errors
          }
        }
      };
      animate();

      const resizeObserver = new ResizeObserver((entries) => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          if (isDisposed || !renderer || !camera) return;
          for (const entry of entries) {
            const { width: w, height: h } = entry.contentRect;
            if (w > 10 && h > 10) {
              camera.aspect = w / h;
              camera.updateProjectionMatrix();
              renderer.setSize(w, h, false);
            }
          }
        });
      });
      resizeObserver.observe(containerEl);

      return () => {
        isDisposed = true;
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        containerEl.removeEventListener('mousemove', handleMouseMove);
        if (canvas) {
          canvas.removeEventListener('webglcontextlost', handleContextLost);
        }
        cancelAnimationFrame(animId);
        resizeObserver.disconnect();
        assetGeo.dispose();
        assetMat.dispose();
        debtGeo.dispose();
        debtMat.dispose();
        equityGeo.dispose();
        equityMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        if (renderer) {
          try {
            renderer.dispose();
          } catch {
            // Ignore
          }
        }
        if (canvas && canvas.parentElement) {
          canvas.parentElement.removeChild(canvas);
        }
      };
    } catch {
      setWebglFailed(true);
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }
  }, [isCollapsed]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (Number.isFinite(rawX) && Number.isFinite(rawY)) {
      setMouseTilt({ x: Math.max(-1, Math.min(1, rawX)), y: Math.max(-1, Math.min(1, rawY)) });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className={`relative w-full rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden p-3 flex flex-col justify-between group transition-all duration-200 select-none ${
        isCollapsed ? 'h-auto' : 'h-44 cursor-pointer'
      }`}
      onClick={!isCollapsed ? onExpandTo3DTab : undefined}
    >
      {/* Fallback Vector 3D Isometric Capital Monolith if WebGL fails or context is lost */}
      {!isCollapsed && webglFailed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div
            className="transition-transform duration-150 ease-out"
            style={{
              transform: `perspective(500px) rotateX(${mouseTilt.y * 12}deg) rotateY(${mouseTilt.x * 15}deg)`,
            }}
          >
            <svg width="240" height="130" viewBox="0 0 240 130" fill="none" className="overflow-visible">
              <defs>
                <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#c084fc" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                </linearGradient>
                <radialGradient id="monolith-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient radial glow */}
              <ellipse cx="120" cy="65" rx="80" ry="40" fill="url(#monolith-glow)" />

              {/* Orbital Ring behind pillars */}
              <ellipse
                cx="120"
                cy="65"
                rx="85"
                ry="22"
                stroke="url(#orbit-grad)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                transform="rotate(-15 120 65)"
              />

              {/* LEFT PILLAR: Assets (Indigo 3D Isometric) */}
              <g transform="translate(75, 32)">
                {/* Top face */}
                <polygon points="0,15 28,0 56,15 28,30" fill="#6366f1" />
                {/* Left face */}
                <polygon points="0,15 28,30 28,85 0,70" fill="#4338ca" />
                {/* Right face */}
                <polygon points="28,30 56,15 56,70 28,85" fill="#3730a3" />
              </g>

              {/* RIGHT TOP PILLAR: Debt (Rose 3D Isometric) */}
              <g transform="translate(125, 20)">
                {/* Top face */}
                <polygon points="0,15 28,0 56,15 28,30" fill="#f43f5e" />
                {/* Left face */}
                <polygon points="0,15 28,30 28,52 0,37" fill="#e11d48" />
                {/* Right face */}
                <polygon points="28,30 56,15 56,37 28,52" fill="#be123c" />
              </g>

              {/* RIGHT BOTTOM PILLAR: Equity (Emerald 3D Isometric) */}
              <g transform="translate(125, 54)">
                {/* Top face */}
                <polygon points="0,15 28,0 56,15 28,30" fill="#10b981" />
                {/* Left face */}
                <polygon points="0,15 28,30 28,63 0,48" fill="#059669" />
                {/* Right face */}
                <polygon points="28,30 56,15 56,48 28,63" fill="#047857" />
              </g>

              {/* Front half of orbital ring */}
              <path
                d="M 38 78 A 85 22 0 0 0 202 52"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                strokeOpacity="0.45"
                fill="none"
                transform="rotate(-15 120 65)"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-300">
            <Layers3 className="w-3.5 h-3.5" />
          </span>
          <span className="text-zinc-100 font-medium">3D Capital Monolith</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpandTo3DTab && !isCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExpandTo3DTab();
              }}
              title="Open Full 3D Spatial Matrix"
              className="text-[10px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#27272a]/90 text-zinc-300 hover:text-white hover:bg-indigo-600 transition-all cursor-pointer border border-[#3f3f46]"
            >
              <span>Expand 3D</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer Legend */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#a1a1aa] bg-[#09090b]/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#27272a]/90">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-indigo-300 font-medium">
              <span className="w-2 h-2 rounded-xs bg-indigo-500" />
              <span>Assets</span>
            </span>
            <span className="flex items-center gap-1 text-rose-300 font-medium">
              <span className="w-2 h-2 rounded-xs bg-rose-500" />
              <span>Debt</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-xs bg-emerald-500" />
              <span>Equity</span>
            </span>
          </div>
          <span className="text-emerald-400 font-medium">Balanced 1:1</span>
        </div>
    </div>
  );
};

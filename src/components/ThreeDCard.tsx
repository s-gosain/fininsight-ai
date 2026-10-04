import React, { useRef, useEffect } from 'react';

export interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (default: 6)
  glare?: boolean;
  scale?: number; // scale on hover (default: 1.015)
  roundedClassName?: string; // rounded border radius for shine overlay (default: 'rounded-2xl')
  onClick?: () => void;
  id?: string;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className = '',
  depth = 6,
  glare = true,
  scale = 1.015,
  roundedClassName = 'rounded-2xl',
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const shine = shineRef.current;

    // Gracefully respect reduced motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate subtle tilt angle
      const rotateX = ((y - centerY) / centerY) * -depth;
      const rotateY = ((x - centerX) / centerX) * depth;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(3px)`;
      card.style.transition = 'transform 0.08s ease-out';

      if (shine) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle 320px at ${percentX.toFixed(1)}% ${percentY.toFixed(1)}%, rgba(255, 255, 255, 0.09), rgba(99, 102, 241, 0.04) 35%, transparent 75%)`;
        shine.style.opacity = '1';
      }
    });
  };

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.15s ease-out';
    if (shineRef.current) {
      shineRef.current.style.opacity = '1';
      shineRef.current.style.transition = 'opacity 0.25s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!cardRef.current) return;
    const card = cardRef.current;
    const shine = shineRef.current;

    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';

    if (shine) {
      shine.style.transition = 'opacity 0.4s ease-out';
      shine.style.opacity = '0';
    }
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
      }}
    >
      {children}

      {/* Dynamic Soft Specular Shine Overlay */}
      {glare && (
        <div
          ref={shineRef}
          className={`absolute inset-0 ${roundedClassName} pointer-events-none transition-opacity duration-300 z-20 overflow-hidden`}
          style={{
            opacity: 0,
            background: 'radial-gradient(circle 320px at 50% 50%, rgba(255, 255, 255, 0.09), rgba(99, 102, 241, 0.04) 35%, transparent 75%)',
          }}
        />
      )}
    </div>
  );
};

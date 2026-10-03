import React, { useState, useRef } from 'react';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (default: 8)
  glare?: boolean;
  scale?: number; // scale on hover (default: 1.015)
  onClick?: () => void;
  id?: string;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className = '',
  depth = 7,
  glare = true,
  scale = 1.015,
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    setRotation({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
      }}
    >
      {children}

      {/* Subtle Specular Glare Effect */}
      {glare && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-20 overflow-hidden"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.12), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

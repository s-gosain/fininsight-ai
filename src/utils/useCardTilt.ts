import { useEffect } from 'react';

/**
 * Global card tilt with soft shine hook.
 * Automatically enables subtle 3D tilt and dynamic specular shine
 * over any card marked with `data-tilt-card` or `.tilt-card-3d`.
 */
export function useGlobalCardTilt() {
  useEffect(() => {
    // Respect user motion preferences
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let activeCard: HTMLElement | null = null;
    let shineEl: HTMLDivElement | null = null;
    let rafId: number | null = null;

    const handlePointerOver = (e: PointerEvent) => {
      // Find closest tilt target
      const target = (e.target as HTMLElement)?.closest('[data-tilt-card], .tilt-card-3d') as HTMLElement | null;
      if (!target || target === activeCard) return;

      // Reset previous card if any
      if (activeCard && activeCard !== target) {
        resetCard(activeCard, shineEl);
      }

      activeCard = target;
      activeCard.style.willChange = 'transform';
      activeCard.style.transformStyle = 'preserve-3d';

      // Ensure shine overlay exists
      shineEl = activeCard.querySelector('.tilt-card-shine') as HTMLDivElement | null;
      if (!shineEl) {
        shineEl = document.createElement('div');
        shineEl.className = 'tilt-card-shine';
        shineEl.style.position = 'absolute';
        shineEl.style.inset = '0';
        shineEl.style.borderRadius = window.getComputedStyle(activeCard).borderRadius || '16px';
        shineEl.style.pointerEvents = 'none';
        shineEl.style.zIndex = '15';
        shineEl.style.overflow = 'hidden';
        shineEl.style.opacity = '0';
        shineEl.style.transition = 'opacity 0.25s ease-out';
        activeCard.appendChild(shineEl);
      }
      shineEl.style.opacity = '1';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeCard) return;

      const card = activeCard;
      const shine = shineEl;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        // If cursor moved outside card bounds, reset
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          resetCard(card, shine);
          activeCard = null;
          shineEl = null;
          return;
        }

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '5.5');
        const scale = parseFloat(card.getAttribute('data-tilt-scale') || '1.012');

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(2px)`;
        card.style.transition = 'transform 0.08s ease-out';

        if (shine) {
          const percentX = (x / rect.width) * 100;
          const percentY = (y / rect.height) * 100;
          shine.style.background = `radial-gradient(circle 320px at ${percentX.toFixed(1)}% ${percentY.toFixed(1)}%, rgba(255, 255, 255, 0.08), rgba(99, 102, 241, 0.035) 40%, transparent 75%)`;
        }
      });
    };

    const resetCard = (card: HTMLElement, shine: HTMLDivElement | null) => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';
      if (shine) {
        shine.style.transition = 'opacity 0.35s ease-out';
        shine.style.opacity = '0';
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!activeCard) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (related && activeCard.contains(related)) {
        return; // Still inside activeCard
      }
      resetCard(activeCard, shineEl);
      activeCard = null;
      shineEl = null;
    };

    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerOut);
    };
  }, []);
}

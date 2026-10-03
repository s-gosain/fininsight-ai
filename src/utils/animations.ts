import { Variants } from 'motion/react';

export const dashboardGridContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const dashboardGridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.992,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 26,
      mass: 0.8,
      opacity: {
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  hover: {
    scale: 1.012,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.14,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const dashboardCardHoverTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.5,
};

export const dashboardCardHoverProps = {
  whileHover: {
    scale: 1.014,
    y: -2,
    transition: dashboardCardHoverTransition,
  },
};

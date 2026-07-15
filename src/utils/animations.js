"use client";

import { useReducedMotion } from 'framer-motion';

const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN_OUT = [0.4, 0, 0.2, 1];

export const TRANSITION_PRESETS = {
  smooth: { duration: 0.3, ease: EASE_OUT },
  gentle: { duration: 0.4, ease: EASE_OUT },
  quick: { duration: 0.2, ease: EASE_OUT },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  springSoft: { type: 'spring', stiffness: 300, damping: 25 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const staggerContainer = (stagger = 0.05, delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

export const cardHover = {
  rest: { y: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  hover: { y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)', transition: { duration: 0.3, ease: EASE_OUT } },
};

export const buttonTap = {
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const useAnimationConfig = () => {
  const shouldReduceMotion = useReducedMotion();
  return {
    shouldReduceMotion,
    easeOut: EASE_OUT,
    easeInOut: EASE_IN_OUT,
    getVariants: (normalVariants) => {
      if (shouldReduceMotion) {
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.2 } },
        };
      }
      return normalVariants;
    },
  };
};

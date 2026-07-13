import type { Variants } from 'framer-motion';

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const scaleVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
};

export const cardHoverVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
};

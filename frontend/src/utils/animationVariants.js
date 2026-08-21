import { easeOut } from 'framer-motion';

// Standard ease curve for smooth luxury interactions (Apple, Tesla style)
export const EASE_LUXURY = [0.16, 1, 0.3, 1];
export const EASE_OUT_FAST = [0.25, 1, 0.5, 1];

// 1. Page Load Variants (500–700ms, opacity 0->1, translateY 20px->0, no zoom)
export const pageLoadVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// 2. Section Reveal Variants (Fade 0->1, translateY 40px->0, 20% viewport visibility)
export const sectionRevealVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_LUXURY,
    },
  },
};

// Stagger Container for section children (80-120ms stagger)
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09, // ~90ms stagger
      delayChildren: 0.05,
    },
  },
};

// Child item variant within a staggered container
export const staggerItemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_LUXURY,
    },
  },
};

// 3. Card Hover Variants (8px lift, 1.02 scale, 250ms transition)
export const cardHoverVariants = {
  initial: {
    y: 0,
    scale: 1,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 196, 175, 0.12)',
    transition: {
      duration: 0.25,
      ease: EASE_OUT_FAST,
    },
  },
  tap: {
    scale: 0.99,
    y: -4,
    transition: {
      duration: 0.15,
    },
  },
};

// 4. Button Micro-interaction Variants (Lift -2px, Scale 1.02, Press 0.97)
export const buttonMotionVariants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: EASE_OUT_FAST,
    },
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
};

// 7. Dropdown Variants (Fade + Slide down 180–220ms)
export const dropdownVariants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    pointerEvents: 'none',
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: 'auto',
    transition: {
      duration: 0.22,
      ease: EASE_LUXURY,
    },
  },
};

// 8. Filter Sidebar Drawer Variants (Slide from left + fade)
export const drawerVariants = {
  closed: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0, 0.67, 0],
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: EASE_LUXURY,
    },
  },
};

export const overlayVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.25 },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// 11. Hero Section Sequenced Stagger
export const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const heroChildVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_LUXURY,
    },
  },
};

// 13. Icon Spring Hover
export const iconSpringVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.15,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
  tap: { scale: 0.9 },
};

// 14. Form Error Shake & Success Checkmark
export const formErrorShakeVariants = {
  shake: {
    x: [-8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

export const successCheckmarkVariants = {
  hidden: { scale: 0, opacity: 0, rotate: -45 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

// 15. Modal Variants (Fade + Scale 0.95 -> 1)
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// 16. Toast Variants (Slide in top-right)
export const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

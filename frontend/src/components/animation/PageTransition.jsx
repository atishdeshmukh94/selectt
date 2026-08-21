import React from 'react';
import { motion } from 'framer-motion';
import { pageLoadVariants } from '../../utils/animationVariants';

/**
 * PageTransition
 * Guideline 1 & 18:
 * - 500-700ms page transition (600ms default)
 * - Opacity 0->1, translateY 20px->0
 * - Avoid white flashes
 */
const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageLoadVariants}
      className={`w-full min-h-screen gpu-accelerated ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

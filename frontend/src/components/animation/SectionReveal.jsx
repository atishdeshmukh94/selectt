import React from 'react';
import { motion } from 'framer-motion';
import { sectionRevealVariants, staggerContainerVariants } from '../../utils/animationVariants';

/**
 * SectionReveal
 * Guideline 2:
 * - Viewport reveal triggered at 20% visibility
 * - Opacity 0 -> 1
 * - Translate Y 40px -> 0
 * - Animates once
 * - Optional stagger for children
 */
const SectionReveal = ({
  children,
  className = '',
  stagger = false,
  delay = 0,
  amount = 0.2,
  as = 'section',
}) => {
  const Component = motion[as] || motion.section;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={stagger ? staggerContainerVariants : sectionRevealVariants}
      transition={{ delay }}
      className={`gpu-accelerated ${className}`}
    >
      {children}
    </Component>
  );
};

export default SectionReveal;

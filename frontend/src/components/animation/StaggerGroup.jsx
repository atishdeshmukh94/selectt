import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../utils/animationVariants';

export const StaggerItem = ({ children, className = '' }) => (
  <motion.div variants={staggerItemVariants} className={`gpu-accelerated ${className}`}>
    {children}
  </motion.div>
);

export const StaggerGroup = ({ children, className = '', amount = 0.2, viewportOnce = true }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: viewportOnce, amount }}
    variants={staggerContainerVariants}
    className={`gpu-accelerated ${className}`}
  >
    {children}
  </motion.div>
);

export default StaggerGroup;

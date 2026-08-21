import React from 'react';
import { motion } from 'framer-motion';

const Reveal = ({ children, direction = 'up', delay = 0.2, duration = 0.5, cascade = false }) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        duration, 
        delay, 
        ease: 'easeOut' 
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default Reveal;

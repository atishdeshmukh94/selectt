import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, emoji, title, description, index, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="relative flex items-start gap-4 p-5 rounded-3xl cursor-pointer select-none"
      style={{
        background: isActive || hovered
          ? 'rgba(0,196,175,0.09)'
          : 'rgba(255,255,255,0.03)',
        border: isActive
          ? '1px solid rgba(0,196,175,0.45)'
          : hovered
            ? '1px solid rgba(0,196,175,0.25)'
            : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        boxShadow: isActive || hovered
          ? '0 8px 32px rgba(0,196,175,0.12)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}
      aria-label={title}
    >


      {/* Glass Icon */}
      <motion.div
        animate={{ rotate: hovered ? 8 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
        style={{
          background: 'rgba(0,196,175,0.12)',
          border: `1.5px solid rgba(0,196,175,${isActive ? 0.5 : 0.25})`,
          backdropFilter: 'blur(8px)',
          boxShadow: isActive
            ? '0 0 20px rgba(0,196,175,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'inset 0 1px 0 rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
        }}
      >
        {emoji}
      </motion.div>

      {/* Text */}
      <div className="pt-0.5">
        <h4
          className="font-extrabold text-base leading-tight mb-1 transition-colors duration-300"
          style={{ color: isActive || hovered ? '#00C9AF' : '#ffffff' }}
        >
          {title}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;

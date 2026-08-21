import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { buttonMotionVariants } from '../../utils/animationVariants';

/**
 * AnimatedButton
 * Guideline 4:
 * - Smooth background color transition
 * - Slight lift (-2px) & 1.02 scale on hover
 * - Tap feedback (0.97 scale)
 * - Subtle click ripple animation
 */
const AnimatedButton = ({
  children,
  onClick,
  className = '',
  variant = 'solid', // solid, outline, ghost, glow
  disabled = false,
  type = 'button',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handlePointerDown = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'solid':
        return 'bg-[#00C9AF] text-[#0A1C3A] hover:bg-[#00E9CA] font-bold shadow-md shadow-[#00C9AF]/15';
      case 'dark':
        return 'bg-[#0C1B33] text-white hover:bg-[#162947] font-bold border border-white/10';
      case 'outline':
        return 'bg-transparent text-[#00C9AF] border border-[#00C9AF]/60 hover:bg-[#00C9AF]/10 font-bold';
      case 'glow':
        return 'bg-[#00C9AF] text-[#0A1C3A] font-bold animate-glow hover:bg-[#00E9CA]';
      case 'ghost':
        return 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 font-semibold';
      default:
        return 'bg-[#00C9AF] text-[#0A1C3A] font-bold';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      variants={buttonMotionVariants}
      initial="initial"
      whileHover={disabled ? 'initial' : 'hover'}
      whileTap={disabled ? 'initial' : 'tap'}
      className={`relative overflow-hidden cursor-pointer rounded-xl px-5 py-2.5 transition-colors duration-200 flex items-center justify-center gap-2 select-none gpu-accelerated ${getVariantClasses()} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Ripple Effect Layer */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((item) => item.id !== r.id));
          }}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </motion.button>
  );
};

export default AnimatedButton;

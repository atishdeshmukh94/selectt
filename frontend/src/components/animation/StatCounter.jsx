import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * StatCounter
 * Guideline 12:
 * - Animates number value upward over 1.5s
 * - Triggers once when 20% visible in viewport
 */
const StatCounter = ({
  value, // Numeric target value, e.g., 25000 or 98.5
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      let startTimestamp = null;
      const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

        // Ease-out cubic formula for smooth slowdown towards end
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * numericTarget;

        setDisplayValue(currentVal);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(numericTarget);
        }
      };

      requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  const formattedNumber = displayValue.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={`font-heading font-bold tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default StatCounter;

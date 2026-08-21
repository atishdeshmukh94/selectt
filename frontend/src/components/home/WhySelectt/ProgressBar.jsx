import React, { useEffect, useRef, useState } from 'react';

const ProgressBar = ({ value, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(value), delay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full relative overflow-hidden"
        style={{
          width: `${width}%`,
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(90deg, #00C9AF, #00F2C8)',
          boxShadow: '0 0 12px rgba(0,196,175,0.6)',
        }}
      >
        {/* Shimmer sweep */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

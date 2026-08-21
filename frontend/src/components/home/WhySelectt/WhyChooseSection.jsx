import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FeatureCard from './FeatureCard';
import InspectionCard from './InspectionCard';

const FEATURES = [
  {
    emoji: '🔍',
    title: '200-point inspection',
    description: 'Engine, body, electronics, tyres — every detail documented and shared openly before you buy.',
  },
  {
    emoji: '🤖',
    title: 'AI-powered fair pricing',
    description: '50,000+ data points. Fixed honest price — no dealer games, no negotiation theatre.',
  },
  {
    emoji: '🛡️',
    title: '7-day no-questions return',
    description: 'Drive it. Live with it. If anything feels off, return within 7 days for a full refund.',
  },
  {
    emoji: '⚡',
    title: 'Zero commission to sellers',
    description: 'We charge buyers a flat platform fee. Sellers always get 100% of their agreed price.',
  },
];

const INSPECTION_REPORTS = [
  { name: 'HYUNDAI CRETA SX(O) 2022', overall: 93.4, engine: 96, body: 88, interior: 94, tyres: 91, ac: 98 },
  { name: 'TATA NEXON EV MAX 2023', overall: 95.8, engine: 98, body: 92, interior: 96, tyres: 94, ac: 99 },
  { name: 'HONDA CITY ZX CVT 2021', overall: 91.2, engine: 93, body: 86, interior: 92, tyres: 88, ac: 95 },
  { name: 'KIA SELTOS GTX PLUS 2022', overall: 94.6, engine: 95, body: 90, interior: 95, tyres: 93, ac: 97 },
];

/* Floating background particles */
const Particle = ({ style }) => (
  <motion.div
    animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut', delay: style.delay }}
    className="absolute rounded-full"
    style={{
      width: style.size,
      height: style.size,
      left: style.left,
      top: style.top,
      background: 'rgba(0,196,175,0.6)',
      boxShadow: '0 0 6px rgba(0,196,175,0.8)',
      ...style,
    }}
  />
);

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  size: `${Math.random() * 3 + 1.5}px`,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
}));

const WhyChooseSection = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeReport, setActiveReport] = useState(3); // KIA Seltos by default

  // Auto-cycle features
  useEffect(() => {
    const id = setInterval(() => {
      setActiveFeature((p) => (p + 1) % FEATURES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Sync report index with feature index
  useEffect(() => {
    setActiveReport(activeFeature % INSPECTION_REPORTS.length);
  }, [activeFeature]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0A1628 0%, #0C1B33 45%, #0D1F3C 100%)',
        padding: '100px 0',
      }}
    >
      {/* ─── Background decoration ─── */}
      {/* Large pulsing glow circle */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{
          width: '700px',
          height: '700px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,196,175,1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,196,175,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,196,175,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ─── Main content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="h-px w-8" style={{ background: '#00C9AF' }} />
              <span
                className="text-xs font-extrabold uppercase tracking-[0.22em]"
                style={{ color: '#00C9AF' }}
              >
                WHY SELECTT
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}
            >
              <span className="text-white">The honest marketplace</span>
              <br />
              <span style={{ color: '#00C9AF' }}>India deserves.</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-slate-400 leading-relaxed mb-10 max-w-[520px]"
              style={{ fontSize: '0.95rem' }}
            >
              No commissions. No markup. No middlemen. Just great cars at honest prices —{' '}
              <span style={{ color: '#00C9AF' }} className="font-semibold">
                verified by technology, backed by us.
              </span>
            </motion.p>

            {/* Feature cards — 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <FeatureCard
                  key={i}
                  {...f}
                  index={i}
                  isActive={activeFeature === i}
                  onClick={() => setActiveFeature(i)}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '1200px' }}
          >
            <InspectionCard
              report={INSPECTION_REPORTS[activeReport]}
              onViewReport={() => navigate('/buy-cars')}
            />


          </motion.div>

        </div>
      </div>

      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseSection;

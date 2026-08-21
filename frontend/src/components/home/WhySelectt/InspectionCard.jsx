import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import ScoreCounter from './ScoreCounter';

const INSPECTION_ROWS = [
  { label: 'Engine & transmission', scoreKey: 'engine', icon: '⚙️' },
  { label: 'Body & exterior', scoreKey: 'body', icon: '🚗' },
  { label: 'Interior & electronics', scoreKey: 'interior', icon: '💡' },
  { label: 'Tyres & suspension', scoreKey: 'tyres', icon: '🔧' },
  { label: 'AC & HVAC system', scoreKey: 'ac', icon: '❄️' },
];

const InspectionCard = ({ report, onViewReport }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-[2rem] overflow-hidden"
    >
      <div
        style={{
          background: 'rgba(22,41,71,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,196,175,0.22)',
          boxShadow: '0 0 60px rgba(0,196,175,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        className="p-4 sm:p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 mb-5 border-b gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            {/* Icon */}
            <div className="flex items-center justify-center shrink-0 text-2xl sm:text-3xl mt-0.5">
              🚘
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight truncate">Live Inspection Report</p>
              <div className="mt-1">
                <span
                  className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full max-w-full truncate"
                  style={{
                    background: 'rgba(0,196,175,0.15)',
                    color: '#00C9AF',
                    border: '1px solid rgba(0,196,175,0.3)',
                  }}
                >
                  {report.name}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-right shrink-0 ml-2 sm:ml-4">
            <div
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-none tabular-nums"
              style={{ color: '#00C9AF', textShadow: '0 0 30px rgba(0,196,175,0.4)' }}
            >
              <ScoreCounter target={report.overall} />
            </div>
            <div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mt-0.5 sm:mt-1">/ 100</div>
          </div>
        </div>

        {/* Progress rows */}
        <div className="space-y-5">
          {INSPECTION_ROWS.map(({ label, scoreKey, icon }, i) => (
            <div key={scoreKey}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-sm text-slate-300 font-semibold">{label}</span>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: '#00C9AF' }}>
                  {report[scoreKey]}/100
                </span>
              </div>
              <ProgressBar value={report[scoreKey]} delay={i * 120} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-7 pt-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} style={{ color: '#00C9AF' }} className="shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">INSPECTION BY</p>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                Selectt Certified Engineers
                <CheckCircle size={13} style={{ color: '#00C9AF' }} className="shrink-0" />
              </p>
            </div>
          </div>

          <motion.button
            onClick={onViewReport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl relative overflow-hidden w-full sm:w-auto shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00C9AF, #00F2C8)',
              color: '#0C1B33',
              boxShadow: '0 0 20px rgba(0,196,175,0.35)',
            }}
          >
            Full report
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default InspectionCard;

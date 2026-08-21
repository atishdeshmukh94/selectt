import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Custom pixel-art SVG digit '4' matching the TailAdmin reference design
function PixelFour({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 130" fill="currentColor">
      {/* Top-left step on left vertical block */}
      <rect x="0" y="20" width="10" height="20" />
      {/* Left vertical block */}
      <rect x="10" y="20" width="20" height="60" />
      {/* Horizontal crossbar */}
      <rect x="10" y="80" width="60" height="20" />
      {/* Top step of right stem */}
      <rect x="40" y="0" width="10" height="20" />
      {/* Right vertical stem */}
      <rect x="50" y="0" width="20" height="130" />
      {/* Bottom step of right stem */}
      <rect x="40" y="110" width="10" height="20" />
    </svg>
  );
}

// Custom pixel-art SVG sad-face monitor '0' matching the TailAdmin reference design
function PixelSadMonitor({ className }) {
  return (
    <svg className={className} viewBox="0 0 130 130" fill="none">
      {/* Monitor Outer Screen Outline */}
      <rect 
        x="10" 
        y="10" 
        width="110" 
        height="110" 
        rx="24" 
        stroke="currentColor" 
        strokeWidth="16" 
      />
      {/* Pixelated Eyes */}
      <rect x="36" y="38" width="16" height="16" rx="2" fill="currentColor" />
      <rect x="78" y="38" width="16" height="16" rx="2" fill="currentColor" />
      
      {/* Pixelated Sad Mouth */}
      <rect x="44" y="70" width="42" height="12" fill="currentColor" />
      <rect x="36" y="82" width="12" height="16" fill="currentColor" />
      <rect x="82" y="82" width="12" height="16" fill="currentColor" />
    </svg>
  );
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-[#1C2434] font-sans relative overflow-hidden select-none px-6 py-10">
      
      {/* Top-Right Decorative Grid Pattern */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-40 pointer-events-none select-none">
        <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-top-right" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-top-right)" />
        </svg>
      </div>

      {/* Bottom-Left Decorative Grid Pattern */}
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-40 pointer-events-none select-none">
        <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-bottom-left" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-bottom-left)" />
        </svg>
      </div>

      {/* Main Center Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-xl z-10"
      >
        {/* 'ERROR' Sub-heading */}
        <h2 className="text-[32px] md:text-[40px] font-black text-[#1C2434] tracking-[0.2em] mb-6">
          ERROR
        </h2>

        {/* Pixelated 404 Graphic with Floating Sad Monitor */}
        <div className="flex items-center justify-center gap-3 md:gap-5 text-[#3C50E0] mb-8">
          <PixelFour className="w-16 h-26 md:w-24 md:h-40" />
          
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center justify-center"
          >
            <PixelSadMonitor className="w-20 h-20 md:w-30 md:h-30" />
          </motion.div>
          
          <PixelFour className="w-16 h-26 md:w-24 md:h-40" />
        </div>

        {/* Description Label */}
        <p className="text-lg md:text-xl font-normal text-[#1C2434] mb-8 max-w-md leading-relaxed px-4">
          We can’t seem to find the page you are looking for!
        </p>

        {/* Action Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-white text-[#1C2434] border border-[#E2E8F0] font-medium text-sm rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 duration-200 cursor-pointer"
          >
            Back to Home Page
          </Link>
        </motion.div>
      </motion.div>

    </div>
  );
}

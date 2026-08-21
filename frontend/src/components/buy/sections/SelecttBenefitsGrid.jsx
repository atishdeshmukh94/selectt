import React from 'react';
import { ShieldCheck, RotateCcw, Wrench, BadgeCheck } from 'lucide-react';

const SelecttBenefitsGrid = () => {
  const benefits = [
    {
      icon: (color) => <ShieldCheck className="w-7 h-7" style={{ color }} />,
      title: "Selectt Assured",
      subtitle: "200-point inspection",
      themeColor: "#00C9AF",
      bg: "linear-gradient(135deg, #09131F 0%, #06282E 100%)",
      border: "rgba(0, 196, 175, 0.3)"
    },
    {
      icon: (color) => <RotateCcw className="w-7 h-7" style={{ color }} />,
      title: "7-Day Money Back",
      subtitle: "No questions asked",
      themeColor: "#3B82F6",
      bg: "linear-gradient(135deg, #09131F 0%, #0D2040 100%)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    {
      icon: (color) => <Wrench className="w-7 h-7" style={{ color }} />,
      title: "1-Year Warranty",
      subtitle: "Comprehensive coverage",
      themeColor: "#10B981",
      bg: "linear-gradient(135deg, #09131F 0%, #072F22 100%)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    {
      icon: (color) => <BadgeCheck className="w-7 h-7" style={{ color }} />,
      title: "Fixed Price",
      subtitle: "No haggling, best deal",
      themeColor: "#A855F7",
      bg: "linear-gradient(135deg, #09131F 0%, #20133F 100%)",
      border: "rgba(168, 85, 247, 0.3)"
    }
  ];

  return (
    <div className="col-span-full my-6 text-left">
      <h3 className="text-sm font-black text-[#0C1B33] mb-3 uppercase tracking-widest">Selectt benefits</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl p-5 flex flex-col items-center text-center overflow-hidden
                       transition-all duration-300 hover:scale-[1.03] group cursor-default shadow-[0_8px_30px_rgba(0,0,0,0.15)] border"
            style={{
              background: benefit.bg,
              borderColor: benefit.border,
            }}
          >
            {/* Glossy top sheen */}
            <div
              className="absolute top-0 left-0 right-0 h-[40%] rounded-t-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
              }}
            />

            {/* Liquid blob glow */}
            <div
              className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, ${benefit.themeColor} 0%, transparent 70%)`,
                filter: 'blur(12px)',
              }}
            />
            <div
              className="absolute -top-4 -left-4 w-16 h-16 rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, ${benefit.themeColor} 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
            />

            {/* Icon */}
            <div
              className="relative z-10 mb-3 p-3 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {benefit.icon(benefit.themeColor)}
            </div>

            <h4 className="relative z-10 font-black text-xs uppercase tracking-wider mb-0.5 text-white">
              {benefit.title}
            </h4>
            <p className="relative z-10 text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${benefit.themeColor}cc` }}>
              {benefit.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelecttBenefitsGrid;

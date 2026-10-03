import React, { useEffect } from 'react';
import { X, Check, Minus } from 'lucide-react';

const ShieldS = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <polygon
      points="12 2 21.5 7.5 21.5 16.5 12 22 2.5 16.5 2.5 7.5 12 2"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="currentColor"
      fillOpacity="0.15"
      strokeLinejoin="round"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="11"
      fontWeight="900"
      fill="currentColor"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      S
    </text>
  </svg>
);

const CategoryComparisonModal = ({ isOpen, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-lg bg-[#0C1B33] text-white hover:bg-[#00C9AF] hover:text-[#0C1B33] active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-md z-30"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Modal Header */}
        <div className="pt-5 px-5 sm:pt-6 sm:px-7 pb-4 bg-white shrink-0 pr-14">
          <span className="text-[11px] font-black tracking-wider text-[#00A38D] uppercase font-sans block">
            YOUR CHOICE, YOUR TYPE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0C1B33] font-heading mt-1 mb-1.5 tracking-tight">
            Choose from 3 Categories
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 font-sans leading-relaxed">
            From budget-friendly cars to high-end luxury cars, we've got something for every type of buyer.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Sticky Column Headers */}
          <div className="sticky top-0 z-20 grid grid-cols-3 bg-white shadow-xs">
            {/* budget */}
            <div className="relative bg-gradient-to-br from-[#00C9AF] to-[#00A896] text-[#0A1C3A] p-3 sm:p-4 text-left border-r border-black/5">
              <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-none">
                <ShieldS className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0A1C3A] shrink-0" />
                <span>budget</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#0A1C3A]/85 font-semibold mt-1 leading-tight">
                Cars of great value
              </p>
              {/* Pointer Triangle */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#00A896]"
              />
            </div>

            {/* Assured */}
            <div className="relative bg-gradient-to-br from-[#0C1B33] to-[#162947] text-white p-3 sm:p-4 text-left border-r border-white/10">
              <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-none">
                <ShieldS className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#00C9AF] shrink-0" />
                <span>Assured</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-1 leading-tight">
                Quality cars you love to buy
              </p>
              {/* Pointer Triangle */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#162947]"
              />
            </div>

            {/* MAX */}
            <div className="relative bg-gradient-to-br from-[#F59E0B] via-[#EAB308] to-[#D97706] text-[#3A2003] p-3 sm:p-4 text-left">
              <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-none">
                <ShieldS className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#3A2003] shrink-0" />
                <span>MAX</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#3A2003]/85 font-semibold mt-1 leading-tight">
                Finest luxury cars, handpicked
              </p>
              {/* Pointer Triangle */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#D97706]"
              />
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {/* ROW 1: Warranty */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Warranty
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <div className="pr-2 sm:pr-3">
                  2 months comprehensive and 6 months powertrain*
                </div>
                <div className="px-2 sm:px-3">
                  <div>3 months comprehensive and 1 year powertrain*</div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="inline-flex items-center gap-1 text-[#00A38D] font-bold text-xs mb-0.5">
                      <ShieldS className="w-3.5 h-3.5 text-[#00A38D]" />
                      <span>Assured+</span>
                    </div>
                    <div className="text-[11.5px] sm:text-xs text-slate-600">
                      6 months comprehensive and 3 year powertrain
                    </div>
                  </div>
                </div>
                <div className="pl-2 sm:pl-3">
                  2 months comprehensive with option to extend
                </div>
              </div>
            </div>

            {/* ROW 2: Inspection */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Inspection
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 text-xs sm:text-[13px] text-slate-700">
                <div className="pr-2 sm:pr-3 font-medium">200-points inspected</div>
                <div className="px-2 sm:px-3 font-medium">200-points inspected</div>
                <div className="pl-2 sm:pl-3 font-medium">250-points inspected</div>
              </div>
            </div>

            {/* ROW 3: Insurance */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Insurance
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <div className="pr-2 sm:pr-3">
                  Third party with option to buy comprehensive
                </div>
                <div className="px-2 sm:px-3">
                  Third party with option to buy comprehensive
                </div>
                <div className="pl-2 sm:pl-3 font-medium">
                  Comprehensive
                </div>
              </div>
            </div>

            {/* ROW 4: BuyBack */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                BuyBack
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 items-center">
                <div className="flex justify-center pr-2 sm:pr-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                    <Minus size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center px-2 sm:px-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center pl-2 sm:pl-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                    <Minus size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 5: 5-day money back guarantee */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                5-day money back guarantee
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 items-center">
                <div className="flex justify-center pr-2 sm:pr-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center px-2 sm:px-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center pl-2 sm:pl-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 6: Fixed Price Assurance */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Fixed Price Assurance
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 items-center">
                <div className="flex justify-center pr-2 sm:pr-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center px-2 sm:px-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center pl-2 sm:pl-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 7: Roadside Assistance */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Roadside Assistance
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 items-center">
                <div className="flex justify-center pr-2 sm:pr-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center px-2 sm:px-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center pl-2 sm:pl-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 8: Extended Warranty (chargeable) */}
            <div>
              <div className="bg-[#F8FAFC] border-t border-b border-slate-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-[#0C1B33]">
                Extended Warranty (chargeable)
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 p-3 sm:p-4 items-center">
                <div className="flex justify-center pr-2 sm:pr-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center px-2 sm:px-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex justify-center pl-2 sm:pl-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C9AF] text-white flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
            <p className="text-xs text-slate-500 font-sans italic leading-relaxed">
              *All warranties start from the date of purchase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryComparisonModal;

import React from 'react';
import { X, Shield } from 'lucide-react';

const PriceSummaryModal = ({ isOpen, onClose, carPrice }) => {
  if (!isOpen) return null;

  const totalPrice = carPrice || 0;
  const rcTransfer = 4000;
  const tcs = totalPrice > 1000000 ? Math.round(totalPrice * 0.01) : 0;
  const basePrice = totalPrice - rcTransfer - tcs;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-[#f8f9fa] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-[17px] font-demi text-[#0C1B33]">Price Summary</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {/* Banner */}
          <div className="border border-[#000] bg-[#fcfaff] rounded-xl p-3 flex items-center gap-3 mb-6 shadow-sm">
            <div className="bg-[#000] text-white w-5 h-5 rounded-full flex items-center justify-center font-book text-[10px]">₹</div>
            <p className="text-[13px] text-[#000] font-book tracking-tight">
              <span className="font-demi">Fixed price assured!</span> To save you time on negotiations
            </p>
          </div>

          {/* Breakdown Box */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 mb-8">
            <div className="space-y-4 md:space-y-5">
              <div className="flex justify-between items-start text-sm">
                <span className="font-medium text-[#0c1b33]">Car price</span>
                <span className="font-book text-[#0c1b33]">₹{basePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-start text-sm">
                <span className="font-medium text-[#0c1b33]">RC transfer facilitation</span>
                <span className="font-book text-slate-600">+ ₹{rcTransfer.toLocaleString()}</span>
              </div>

              {tcs > 0 && (
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-medium text-[#0c1b33]">TCS (Tax Collected at Source)</span>
                    <p className="text-[11px] font-book text-slate-400 mt-0.5 max-w-[200px] leading-tight">This amount will come back to you as a tax credit</p>
                  </div>
                  <span className="font-book text-slate-600">+ ₹{tcs.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-start text-sm">
                <div className="flex items-center gap-1.5 font-medium text-[#0c1b33]">
                  Servicing, FASTag, fuel & more <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 cursor-help">i</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-xs font-book">₹12,700</span>
                  <span className="text-[#000] font-book">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-start text-sm">
                <span className="font-medium text-[#0c1b33]">Warranty (Protect)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-xs font-book">₹10,638</span>
                  <span className="text-[#000] font-book">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-start text-sm pb-5 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-1.5 font-medium text-[#0c1b33]">
                  Fixes & upgrades <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 cursor-help">i</span>
                </div>
                <span className="text-[#000] font-book">Included</span>
              </div>

              <div className="flex justify-between items-start pt-1">
                <span className="font-demi text-[#0C1B33] text-base">Total price</span>
                <span className="font-demi text-[#0C1B33] text-base">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] flex-1 bg-slate-200"></div>
              <h3 className="font-demi text-[#0C1B33] text-sm">Best-in-class values</h3>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            {/* Banner block for Benefits */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex items-center justify-between">
              <p className="text-xs font-medium text-[#0C1B33] leading-relaxed max-w-[190px]">
                Thorough inspection, expert refurbishment & cleaning has been conducted by our professionals.
              </p>
              <div className="relative w-20 h-20 shrink-0">
                <div className="absolute inset-0 bg-[#e6dbf5] opacity-20 rounded-2xl"></div>
                <div className="absolute inset-0 border-2 border-dashed border-[#e6dbf5] rounded-2xl scale-90"></div>
                <Shield className="absolute inset-0 m-auto w-10 h-10 text-[#512da8] opacity-20" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummaryModal;

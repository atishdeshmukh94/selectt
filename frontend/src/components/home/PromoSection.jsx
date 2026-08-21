import React from 'react';
import { Landmark, ShieldCheck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoSection = () => {
  return (
    <section className="pb-12 md:pb-24 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Instant Car Loan Card - Teal Brand Color */}
        <div className="bg-[#e6faf7] dark:bg-[#00C9AF]/10 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#00C9AF]/20 dark:border-[#00C9AF]/20 relative overflow-hidden group">
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl font-bold mb-3 text-[#0c1b33] dark:text-white">
              Instant Car Loan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-sm">
              Interest rates starting at just <span className="text-[#00C9AF] font-bold">11.49%</span>. Fast processing, zero paperwork.
            </p>
            <Link to="/profile?tab=loan">
              <button className="bg-[#00C9AF] hover:bg-[#0C1B33] text-[#0A1C3A] px-8 py-3 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-[#00C9AF]/10">
                Check Eligibility
              </button>
            </Link>
          </div>
          <div className="relative z-10">
            <div className="w-32 h-32 bg-white dark:bg-[#162947] rounded-2xl flex items-center justify-center shadow-xl border border-slate-50 dark:border-[#1a3052]">
              <Landmark size={48} className="text-[#00C9AF]" />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform text-[#00C9AF]">
            <Landmark size={300} />
          </div>
        </div>

        {/* Assured Buyback Card - Navy Brand Color */}
        <div className="bg-[#0c1b33] dark:bg-[#162947]/50 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#1a3052] dark:border-[#1a3052]/50 relative overflow-hidden group">
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">Assured Buyback</h2>
            <p className="text-slate-300 mb-8 max-w-sm">
              Get a pre-fixed buyback price for up to <span className="text-[#00C9AF] font-bold">3 years</span> from the date of purchase.
            </p>
            <Link to="/about-us">
              <button className="bg-white text-[#0c1b33] hover:bg-[#00C9AF] hover:text-[#0A1C3A] px-8 py-3 rounded-xl font-bold transition-all cursor-pointer shadow-lg hover:shadow-[#00C9AF]/20">
                Learn More
              </button>
            </Link>
          </div>
          <div className="relative z-10">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <ShieldCheck size={48} className="text-[#00C9AF]" />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform text-white">
            <Shield size={300} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default PromoSection;




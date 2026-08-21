import React, { useEffect } from 'react';
import { ShieldCheck, RefreshCcw, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';

export default function SelecttBuybackPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta title="Selectt BuyBack - Assured Future Resale & Upgrade | Selectt" description="Enjoy the freedom of car ownership with guaranteed future resale value extended to 12, 18 or 36 months." />
      
      <div className="min-h-screen bg-slate-50 font-sans w-full overflow-x-hidden text-slate-700 relative">

        {/* ───────────── Hero Section (Navy Blue #0C1B33) ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-36 overflow-hidden bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 z-0"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 text-[#00C9AF] font-bold shadow-sm backdrop-blur-md">
                <RefreshCcw size={18} className="text-[#00C9AF]" />
                Selectt Buyback
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                Assured future resale and upgrade
              </h1>
              <p className="text-[#00C9AF] text-lg md:text-xl font-bold mb-8">
                Enjoy the freedom that comes with your car with future assured resale value upon your purchase, extending to 12, 18 or 36 months.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/buy-cars"
                  className="inline-flex items-center gap-2 bg-[#00C9AF] hover:bg-[#00e9ca] text-[#0c1b33] font-extrabold py-3.5 px-8 rounded-full shadow-lg transition-all text-xs uppercase tracking-wider"
                >
                  Explore Cars with Buyback <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Benefits of Buyback (3 Pill Cards) ───────────── */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#0C1B33] mb-10 text-center">Benefits of Buyback</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4 font-black">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-base mb-2">Guaranteed future resale value</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Know your car's exact buyback price upfront before you make a purchase.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-[#00C9AF] flex items-center justify-center mx-auto mb-4 font-black">
                  <RefreshCcw size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-base mb-2">Easy upgrades</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Upgrade to another car model seamlessly when your tenure completes.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-black">
                  <Calendar size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-base mb-2">Flexible ownership tenures</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Choose from 12, 18, or 36 months duration according to your lifestyle needs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── 3 Detailed Feature Cards ───────────── */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 space-y-12">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm text-left flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block mb-2">1. OWNERSHIP FREEDOM</span>
                  <h3 className="text-xl font-black text-[#0C1B33] mb-4">Call your own</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Drive a car model that you've always wanted, in a color that you like, with a transmission that you prefer, for a tenure of your choice.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm text-left flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-purple-600 tracking-widest block mb-2">2. SELECTT SPECIAL</span>
                  <h3 className="text-xl font-black text-[#0C1B33] mb-4">Return, exchange, upgrade</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    At the end of your tenure, either hold on to your car, upgrade it or return for the assured buyback value.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm text-left flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-widest block mb-2">3. GUARANTEED PEACE</span>
                  <h3 className="text-xl font-black text-[#0C1B33] mb-4">The future's bright</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Upfront buyback value assurance at time of purchase, valid for a period of 12, 18 and 36 months.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ───────────── With you, in your car ownership journey ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-4xl font-black text-[#0C1B33] mb-4">With you, in your car ownership journey.</h2>
            <p className="text-slate-500 text-sm font-medium mb-12">Find out the benefits of Selectt Buyback</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-extrabold text-[#0C1B33] text-sm mb-2">Cost Benefits</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Benefit from up to 50% lower monthly ownership costs with no extra charge per kilometer.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-extrabold text-[#0C1B33] text-sm mb-2">Quality Assurance</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Experience 200-point inspection, 5-day money-back guarantee, and 1-year no-questions warranty.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-extrabold text-[#0C1B33] text-sm mb-2">Ownership Perks</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Enjoy complete self-ownership with no driving restrictions or commercial caps.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Need Further Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
}

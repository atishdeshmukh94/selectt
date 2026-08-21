import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, CheckCircle2, ChevronRight, FileText, Zap, HeartHandshake } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';

const CarInsurancePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta title="Used Car Insurance - Fast & Hassle-free | Selectt" description="Get comprehensive used car insurance quotes with hassle-free claims and quick approvals." />
      
      <div className="min-h-screen bg-slate-50 font-sans w-full overflow-x-hidden text-slate-700 relative">
        
        {/* ───────────── Hero Section (Navy Blue #0C1B33) ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-36 overflow-hidden bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 z-0"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 text-[#00C9AF] font-bold shadow-sm backdrop-blur-md">
                <ShieldCheck size={18} className="text-[#00C9AF]" />
                Selectt Insurance
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                Hassle-free Car Insurance
              </h1>
              <p className="text-slate-300 text-base md:text-lg font-medium max-w-xl mx-auto mb-8">
                Get instant comprehensive quotes with zero paperwork, zero hidden charges, and instant policy issuance.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 bg-[#00C9AF] hover:bg-[#00e9ca] text-[#0c1b33] font-extrabold py-3.5 px-8 rounded-full shadow-lg transition-all text-xs uppercase tracking-wider"
                >
                  Contact Insurance Advisor <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Features Section ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block mb-2">COMPLETE PROTECTION</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0C1B33]">Why Choose Selectt Insurance?</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mt-2">
                We partner with top-rated insurance providers to bring you instant policies and seamless claims.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#00C9AF] flex items-center justify-center mx-auto mb-5 font-black">
                  <Zap size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-lg mb-2">Instant Policy Issuance</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Generated in under 2 minutes with instant digital confirmation and zero physical paperwork.
                </p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#00C9AF] flex items-center justify-center mx-auto mb-5 font-black">
                  <HeartHandshake size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-lg mb-2">Cashless Claims Network</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Enjoy cashless repair claims at thousands of authorized partner workshops and all Selectt Car Hubs.
                </p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center hover:border-[#00C9AF]/40 hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#00C9AF] flex items-center justify-center mx-auto mb-5 font-black">
                  <FileText size={28} />
                </div>
                <h3 className="font-extrabold text-[#0C1B33] text-lg mb-2">Add-on Coverages</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Zero depreciation, engine protect, roadside assistance, and key replacement add-ons available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
};

export default CarInsurancePage;

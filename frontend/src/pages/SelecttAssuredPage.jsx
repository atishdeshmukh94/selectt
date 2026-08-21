import React, { useEffect } from 'react';
import { ShieldCheck, Award, Shield, Check, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function SelecttAssuredPage() {
  const { getSiteImage } = useSiteSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const assuredBanner = getSiteImage('assured_hero_banner', 'https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/SpinnyAssured/assets/handpicked-cars.png?q=85&w=600&dpr=1.3');

  return (
    <>
      <PageMeta title="Selectt Assured® - The sure road to car joy | Selectt" description="Experience complete transparency with Selectt Assured. 200-point inspection, 5-day money-back guarantee, and 1-year warranty." />

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
                Selectt Assured®
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                The sure road to car joy
              </h1>
              <p className="text-[#00C9AF] text-lg md:text-xl font-bold mb-8">
                Bringing you high-quality cars that offer a delightful ownership experience.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/buy-cars"
                  className="inline-flex items-center gap-2 bg-[#00C9AF] hover:bg-[#00e9ca] text-[#0c1b33] font-extrabold py-3.5 px-8 rounded-full shadow-lg transition-all text-xs uppercase tracking-wider"
                >
                  Browse Assured Cars <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Section 1: High Quality Options ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4 text-left">
                <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block">HIGH-QUALITY OPTIONS</span>
                <h2 className="text-3xl font-black text-[#0C1B33]">Handpicked cars, driven with care</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Our selection of 5,000+ high-quality, well-maintained Selectt Assured cars that have been owned and driven with love.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="max-w-md w-full flex justify-center">
                  <img src={assuredBanner} alt="Handpicked cars" className="w-full max-w-sm h-auto object-contain hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Section 2: 200-Point Inspection ───────────── */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center order-last lg:order-first">
                <div className="w-full max-w-sm flex justify-center">
                  <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/upload-document.svg?q=85&w=360&dpr=1.3" alt="200-point inspection" className="w-full h-64 md:h-72 object-contain hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="space-y-4 text-left">
                <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block">OUR 200-POINT INSPECTION</span>
                <h2 className="text-3xl font-black text-[#0C1B33]">Carefully evaluated, high-quality cars</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Every Selectt Assured car is carefully handpicked and inspected to ensure superior quality, so you don't miss out on that new car feeling. Only 1 out of every 20 cars we inspect makes it to our hub.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Section 3: One-Year Warranty Table ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block mb-2">ONE-YEAR WARRANTY</span>
            <h2 className="text-3xl font-black text-[#0C1B33] mb-4">There for you, when you need us.</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 max-w-2xl mx-auto">
              Car ownership is about doing things, going places and pushing towards your goals. Our one-year warranty is our way of being there for you in your journey. Our Warranty is segregated in two categories:
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 md:p-6 font-extrabold text-[#0C1B33] w-1/3">Feature</th>
                    <th className="p-4 md:p-6 font-extrabold text-[#0C1B33] w-1/3">Comprehensive Coverage</th>
                    <th className="p-4 md:p-6 font-extrabold text-[#0C1B33] w-1/3">Powertrain Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Warranty Coverage Overview</td>
                    <td className="p-4 md:p-6">Applicable for 90 days or up to 3,000 kms from the date of purchase</td>
                    <td className="p-4 md:p-6">Applicable for 365 days or up to 12,000 kms from the date of purchase</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Engine & Peripherals</td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Transmission</td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Steering System</td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                    <td className="p-4 md:p-6 text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Braking System</td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                    <td className="p-4 md:p-6 text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="p-4 md:p-6 font-bold text-[#0C1B33]">Air Conditioning</td>
                    <td className="p-4 md:p-6"><Check className="text-emerald-500" size={18} /></td>
                    <td className="p-4 md:p-6 text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-[11px] text-slate-400 font-medium">*Terms and conditions apply</p>
          </div>
        </section>

        {/* ───────────── Section 4: 5-Day Moneyback & Fixed Price ───────────── */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 space-y-20">
            {/* 5-Day Moneyback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4 text-left">
                <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block">5-DAY MONEYBACK GUARANTEE</span>
                <h2 className="text-3xl font-black text-[#0C1B33]">Don't like it? Return it to us within 5 days</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  At Selectt, we are only happy when you are. That's why every Selectt Assured car comes with a no-questions-asked 5-day moneyback guarantee.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-md text-center max-w-md w-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center mx-auto mb-4 shadow-md">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0C1B33] mb-2">100% Refund Guaranteed</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">Return the car within 5 days for a complete refund without any hassle.</p>
                </div>
              </div>
            </div>

            {/* Fixed Price */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center order-last lg:order-first">
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-md text-center max-w-md w-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Award size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0C1B33] mb-2">Transparent Pricing</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">No hidden fees, no negotiation friction. Fair prices calculated with market data.</p>
                </div>
              </div>
              <div className="space-y-4 text-left">
                <span className="text-xs font-black uppercase text-[#00C9AF] tracking-widest block">FIXED PRICE ASSURANCE</span>
                <h2 className="text-3xl font-black text-[#0C1B33]">Great deals each time, without haggling</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Fixed price assurance saves you from the unnecessary loop of negotiations and ensures you get the best deal upfront.
                </p>
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

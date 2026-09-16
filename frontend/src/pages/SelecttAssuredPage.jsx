import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Award,
  Shield,
  Check,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Gauge,
  Zap,
  Wrench,
  Sparkles,
  Search,
  FileCheck2,
  BadgeCheck,
  Car
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function SelecttAssuredPage() {
  const { getSiteImage } = useSiteSettings();
  const [selectedInspectionCategory, setSelectedInspectionCategory] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const assuredBanner = getSiteImage(
    'assured_hero_banner',
    'https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/SpinnyAssured/assets/handpicked-cars.png?q=85&w=600&dpr=1.3'
  );

  const inspectionCategories = [
    {
      title: 'Engine & Transmission',
      points: '45 Checkpoints',
      icon: Cpu,
      desc: 'Cylinder compression, oil leakage, turbocharger health, clutch bite point, and transmission fluid purity.'
    },
    {
      title: 'Suspension & Steering',
      points: '35 Checkpoints',
      icon: Gauge,
      desc: 'Strut damping, ball joints, wheel alignment, steering rack responsiveness, and electronic power steering.'
    },
    {
      title: 'Electricals & OBD-II',
      points: '40 Checkpoints',
      icon: Zap,
      desc: 'Complete ECU sensor diagnostics, battery health load test, alternator output, and wiring harness integrity.'
    },
    {
      title: 'Braking & Safety Systems',
      points: '30 Checkpoints',
      icon: ShieldCheck,
      desc: 'Disc rotor thickness, ABS hydraulic module test, brake pad wear, airbags sensor checks, and seatbelt retractors.'
    },
    {
      title: 'Exterior & Structure',
      points: '50 Checkpoints',
      icon: Wrench,
      desc: 'Paint depth gauge scanner, non-accidental chassis aprons, pillars, firewalls, and water damage flood checks.'
    }
  ];

  return (
    <>
      <PageMeta
        title="Selectt Assured® - The Gold Standard in Pre-Owned Quality | Selectt"
        description="Experience 100% peace of mind with Selectt Assured. Rigorous 200-point inspection, 5-day money-back guarantee, and 1-year comprehensive warranty."
      />

      <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">

        {/* ───────────── Hero Section ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-20 overflow-hidden bg-[#0C1B33] border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md">
                <ShieldCheck size={14} className="text-[#00C9AF]" />
                Selectt Assured® Quality Standard
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                The sure road to pre-owned car joy
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
                Only 1 in 20 cars inspected passes our strict standards. 200-point inspection, 5-day money-back guarantee, and 1-year warranty included.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  to="/buy-cars"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] font-bold py-3.5 px-8 rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Browse Assured Cars <ArrowRight size={15} />
                </Link>
                <a
                  href="#inspection-details"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold py-3.5 px-6 rounded-xl transition-all text-xs tracking-wider"
                >
                  Explore 200-Point Inspection
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── 3 Guarantees Strip ───────────── */}
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">200-Point Inspection</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Evaluated across engine, diagnostics, suspension, and structural integrity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 mt-0.5">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">5-Day Moneyback Guarantee</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Don't love your car? Return it within 5 days for a 100% no-questions-asked refund.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 mt-0.5">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">1-Year Warranty Included</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                    Comprehensive and powertrain protection covering engine and transmission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── 200-Point Inspection Detailed Breakdown ───────────── */}
        <section id="inspection-details" className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20">
                Scientific Diagnostics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2.5">
                Inside our rigorous 200-Point Evaluation
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-1.5 leading-relaxed">
                Every vehicle undergoes multi-stage digital diagnostic scans, paint thickness measurements, and road test evaluations before listing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {inspectionCategories.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected = selectedInspectionCategory === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedInspectionCategory(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-white border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                        : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-[#00C9AF] text-[#0C1B33]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a892] block mb-0.5">
                      {cat.points}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs leading-snug">
                      {cat.title}
                    </h3>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Details Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs text-left">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Category Focus • {inspectionCategories[selectedInspectionCategory].points}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {inspectionCategories[selectedInspectionCategory].title} Checkpoint Protocol
                </h3>
                <p className="text-slate-600 text-sm font-normal leading-relaxed">
                  {inspectionCategories[selectedInspectionCategory].desc}
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={15} />
                  <span>Full digital inspection report accessible for every vehicle on its details page</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── One-Year Warranty Table ───────────── */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20">
                1-Year Protection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2.5">
                Comprehensive vs Powertrain Warranty
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-1.5 leading-relaxed">
                Enjoy hassle-free drives with zero unexpected repair expenses.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs bg-white mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80">
                    <th className="p-4 sm:p-5 font-bold text-slate-900 w-1/3 text-sm">Feature & Component</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-900 w-1/3 text-sm">Comprehensive (90 Days)</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-900 w-1/3 text-sm">Powertrain (365 Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Duration & Kilometers</td>
                    <td className="p-4 sm:p-5 text-slate-600">90 Days / 3,000 kms</td>
                    <td className="p-4 sm:p-5 text-slate-600">365 Days / 12,000 kms</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Engine Block & Head Assemblies</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Manual / Automatic Transmission</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Steering Rack & Power Pump</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">ABS & Master Brake Cylinder</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">Air Conditioning Compressor & Condenser</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-[11px] text-slate-400 font-medium">*Standard terms and conditions apply</p>
          </div>
        </section>

        {/* ───────────── 5-Day Moneyback & Fixed Price Cards ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-left space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a892]">Zero Risk Test Period</span>
                  <h3 className="text-xl font-bold text-slate-900">5-Day No-Questions Moneyback Guarantee</h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Test your car on your daily commute, with your family, and in your parking slot. If it doesn't fit your life, return it within 5 days for a 100% complete refund.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-left space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Award size={24} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Zero Haggling</span>
                  <h3 className="text-xl font-bold text-slate-900">Fair & Transparent Fixed Pricing</h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Every car is priced using data from over 100,000 real-world transactions. No hidden dealer markups, no tedious haggling, and no surprise charges at checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Need Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
}

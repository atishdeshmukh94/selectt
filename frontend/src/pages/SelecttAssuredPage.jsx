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
      title: 'Mechanical & Electrical Systems',
      points: '75 Checkpoints',
      icon: Cpu,
      desc: 'Engine cylinder compression, turbocharger pressure, clutch bite point, automatic transmission torque converters, battery load testing, and comprehensive OBD-II ECU diagnostic error scans.'
    },
    {
      title: 'Suspension, Steering & Brakes',
      points: '45 Checkpoints',
      icon: Gauge,
      desc: 'Strut damping efficiency, ball joints, tie rods, steering rack responsiveness, electronic power steering calibration, disc rotor thickness, ABS hydraulic module, and brake pad wear analysis.'
    },
    {
      title: 'Exterior & Body Integrity',
      points: '50 Checkpoints',
      icon: Wrench,
      desc: 'Multi-point digital paint depth gauge scanner (detecting non-factory repaints), factory panel gaps, non-accidental chassis aprons, A/B/C pillar structural integrity, and submerged water/flood damage inspection.'
    },
    {
      title: 'Legal, Paperwork & RTO Verification',
      points: '30 Checkpoints',
      icon: FileCheck2,
      desc: '100% verified VAHAN national registry records, single/dual ownership chain audit, active bank hypothecation / loan NOC verification, and zero pending traffic e-challans guarantee.'
    }
  ];

  const inspectionFaqs = [
    {
      q: "What is the Selectt 200-Point Inspection Guarantee?",
      a: "Our certified evaluators test every vehicle against 200 rigid mechanical, structural, electrical, and legal criteria using digital diagnostic scanners and paint depth gauges. Only cars scoring above 90% and meeting zero-structural-damage standards earn the Selectt Certified badge."
    },
    {
      q: "What is the ₹50,000 Zero Hidden Damages Promise?",
      a: "We stand 100% behind our inspection report. In the rare event that an undisclosed mechanical defect arises during your warranty period that was missed during inspection, Selectt covers repair costs or provides an assurance reimbursement up to ₹50,000."
    },
    {
      q: "How does the 5-day money-back guarantee work with the inspection?",
      a: "When you receive your vehicle, you have 5 full days (or 250 km) to drive it on your everyday routes. If you find any discrepancies with the inspection report or aren't satisfied, return the car for a 100% refund."
    },
    {
      q: "Can I view the detailed 200-point inspection report before booking?",
      a: "Yes! Every single car listed on Selectt includes a downloadable, transparent digital inspection report showing checkpoint-by-checkpoint ratings, tyre tread depths, and body condition diagrams."
    }
  ];

  const inspectionSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": inspectionFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <PageMeta
        title="The Selectt Advantage: Our 200-Point Inspection Guarantee | Selectt"
        description="We reject 85% of cars so you only drive home the best. Discover our 200-point inspection checklist, 1-year warranty, and ₹50,000 assurance promise."
        canonical="https://selectt.in/selectt-inspection-process"
        schema={inspectionSchema}
      />

      <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">

        {/* ───────────── Hero Section ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-20 overflow-hidden bg-[#0C1B33] border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md mb-3.5">
                <ShieldCheck size={14} className="text-[#00C9AF]" />
                Selectt Assured® Quality Standard
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3.5">
                The Selectt Advantage: Our 200-Point Inspection Guarantee
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto mb-8">
                We reject 85% of cars so you only drive home the best. Learn what goes into every Selectt Certified vehicle.
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
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">200-Point Inspection</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-[1.75]">
                    Evaluated across engine, diagnostics, suspension, and structural integrity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 mt-0.5">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">5-Day Moneyback Guarantee</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-[1.75]">
                    Don't love your car? Return it within 5 days for a 100% no-questions-asked refund.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 mt-0.5">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">1-Year Warranty Included</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-[1.75]">
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
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5">
                Scientific Diagnostics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Inside our rigorous 200-Point Evaluation
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-3 leading-relaxed">
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
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-white border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                        : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${
                      isSelected ? 'bg-[#00C9AF] text-[#0C1B33]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a892] block mb-1">
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-9 shadow-xs text-left">
              <div className="max-w-3xl space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
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
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5">
                1-Year Protection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Comprehensive vs Powertrain Warranty
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-3 leading-relaxed">
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

        {/* ───────────── 3 Guarantees & Trust Badges ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3.5 py-1.5 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5">
                Buyer Protection
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-normal mb-3.5">
                Our Triple Guarantee For Every Certified Car
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00a892]">Zero Risk Test Period</span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 mt-1 mb-2">5-Day Money-Back Guarantee</h3>
                  <p className="text-slate-700 text-sm sm:text-base font-normal leading-[1.75]">
                    Test your car on your daily commute and with your family. If it doesn't fit your life, return it within 5 days (up to 250 km) for a 100% full refund with no questions asked.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-4">
                  <Shield size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Complete Protection</span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 mt-1 mb-2">1-Year Warranty Included</h3>
                  <p className="text-slate-700 text-sm sm:text-base font-normal leading-[1.75]">
                    Comprehensive and powertrain protection covering engine block, transmission, steering rack, and air conditioning for up to 12,000 kilometers.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-4">
                  <Award size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Inspection Assurance</span>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 mt-1 mb-2">₹50,000 Zero Hidden Damages Promise</h3>
                  <p className="text-slate-700 text-sm sm:text-base font-normal leading-[1.75]">
                    If an undisclosed mechanical issue arises during your warranty period that was missed during inspection, Selectt fixes it for free or offers up to ₹50,000 assurance cover.
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

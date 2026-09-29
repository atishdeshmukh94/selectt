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
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-semibold text-[12px] leading-[1.4] backdrop-blur-md mb-3.5">
                <ShieldCheck size={14} className="text-[#00C9AF]" />
                Selectt Assured® quality standard
              </div>
              
              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-heading font-semibold text-white leading-[1.2] mb-3.5">
                The Selectt advantage: our 200-point inspection guarantee
              </h1>
              
              <p className="text-[#CBD5E1] text-[17px] sm:text-[18px] font-normal leading-[1.6] max-w-2xl mx-auto mb-8">
                We reject 85% of cars so you only drive home the best. Learn what goes into every Selectt Certified vehicle.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  to="/buy-cars"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00C9AF] hover:bg-[#00b29c] text-slate-950 font-semibold py-3.5 px-8 rounded-xl shadow-xs transition-all text-[15px] leading-[1.45] cursor-pointer"
                >
                  Browse assured cars <ArrowRight size={16} />
                </Link>
                <a
                  href="#inspection-details"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold py-3.5 px-6 rounded-xl transition-all text-[15px] leading-[1.45]"
                >
                  Explore 200-point inspection
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
                  <h3 className="font-heading font-semibold text-[#0F172A] text-[16px] sm:text-[17px] mb-1">200-point inspection</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#475569] font-normal leading-[1.6]">
                    Evaluated across engine, diagnostics, suspension, and structural integrity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 mt-0.5">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[#0F172A] text-[16px] sm:text-[17px] mb-1">5-day moneyback guarantee</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#475569] font-normal leading-[1.6]">
                    Don't love your car? Return it within 5 days for a 100% no-questions-asked refund.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 mt-0.5">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[#0F172A] text-[16px] sm:text-[17px] mb-1">1-year warranty included</h3>
                  <p className="text-[14px] sm:text-[15px] text-[#475569] font-normal leading-[1.6]">
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
              <span className="text-[12px] font-medium text-[#008A79] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5 leading-[1.4]">
                Scientific diagnostics
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                Inside our rigorous 200-point evaluation
              </h2>
              <p className="text-[#475569] text-[17px] sm:text-[18px] font-normal mt-3 leading-[1.6]">
                Every vehicle undergoes multi-stage digital diagnostic scans, paint thickness measurements, and road test evaluations before listing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                    <span className="text-[12px] font-semibold text-[#008A79] block mb-1 leading-[1.4]">
                      {cat.points}
                    </span>
                    <h3 className="font-heading font-semibold text-[#0F172A] text-[15px] sm:text-[16px] leading-snug">
                      {cat.title}
                    </h3>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Details Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-9 shadow-xs text-left">
              <div className="max-w-3xl space-y-3.5">
                <span className="text-[12px] font-medium text-slate-500 block mb-1">
                  Category focus • {inspectionCategories[selectedInspectionCategory].points}
                </span>
                <h3 className="text-[20px] sm:text-[21px] font-heading font-semibold text-[#0F172A] leading-[1.35]">
                  {inspectionCategories[selectedInspectionCategory].title} checkpoint protocol
                </h3>
                <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
                  {inspectionCategories[selectedInspectionCategory].desc}
                </p>
                <div className="pt-3 flex items-center gap-2 text-[14px] font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
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
              <span className="text-[12px] font-medium text-[#008A79] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5 leading-[1.4]">
                1-year protection
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                Comprehensive vs powertrain warranty
              </h2>
              <p className="text-[#475569] text-[17px] sm:text-[18px] font-normal mt-3 leading-[1.6]">
                Enjoy hassle-free drives with zero unexpected repair expenses.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs bg-white mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80">
                    <th className="p-4 sm:p-5 font-heading font-semibold text-[#0F172A] w-1/3 text-[15px]">Feature & component</th>
                    <th className="p-4 sm:p-5 font-heading font-semibold text-[#0F172A] w-1/3 text-[15px]">Comprehensive (90 days)</th>
                    <th className="p-4 sm:p-5 font-heading font-semibold text-[#0F172A] w-1/3 text-[15px]">Powertrain (365 days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-[#475569] text-[14px] sm:text-[15px]">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">Duration & kilometers</td>
                    <td className="p-4 sm:p-5 text-[#475569]">90 days / 3,000 kms</td>
                    <td className="p-4 sm:p-5 text-[#475569]">365 days / 12,000 kms</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">Engine block & head assemblies</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">Manual / automatic transmission</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">Steering rack & power pump</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">ABS & master brake cylinder</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-medium text-[#0F172A]">Air conditioning compressor & condenser</td>
                    <td className="p-4 sm:p-5"><Check className="text-emerald-600" size={18} /></td>
                    <td className="p-4 sm:p-5 text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-[12px] text-slate-400 font-normal">*Standard terms and conditions apply</p>
          </div>
        </section>

        {/* ───────────── 3 Guarantees & Trust Badges ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[12px] font-medium text-[#008A79] bg-[#00C9AF]/10 px-3.5 py-1.5 rounded-full border border-[#00C9AF]/20 inline-block mb-3.5 leading-[1.4]">
                Buyer protection
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                Our triple guarantee for every certified car
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="text-[12px] font-semibold text-[#008A79]">Zero risk test period</span>
                  <h3 className="text-[20px] sm:text-[21px] font-heading font-semibold text-[#0F172A] mt-1 mb-2 leading-[1.35]">5-day money-back guarantee</h3>
                  <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
                    Test your car on your daily commute and with your family. If it doesn't fit your life, return it within 5 days (up to 250 km) for a 100% full refund with no questions asked.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-4">
                  <Shield size={24} />
                </div>
                <div>
                  <span className="text-[12px] font-semibold text-sky-600">Complete protection</span>
                  <h3 className="text-[20px] sm:text-[21px] font-heading font-semibold text-[#0F172A] mt-1 mb-2 leading-[1.35]">1-year warranty included</h3>
                  <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
                    Comprehensive and powertrain protection covering engine block, transmission, steering rack, and air conditioning for up to 12,000 kilometers.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs text-left space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-4">
                  <Award size={24} />
                </div>
                <div>
                  <span className="text-[12px] font-semibold text-amber-600">Inspection assurance</span>
                  <h3 className="text-[20px] sm:text-[21px] font-heading font-semibold text-[#0F172A] mt-1 mb-2 leading-[1.35]">₹50,000 zero hidden damages promise</h3>
                  <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
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

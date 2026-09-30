import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Car,
  FileCheck2,
  BadgeCheck,
  Gavel,
  Users2,
  Truck,
  ArrowRight,
  Star,
  Building2,
  TrendingUp,
  Clock,
  Sparkles,
  PhoneCall,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';
import { API_URL } from '../config/api';

export default function SelecttPartnersPage() {
  const [formData, setFormData] = useState({
    mobile: '',
    firstName: '',
    lastName: '',
    dealershipName: '',
    state: '',
    city: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/partners/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit partner application');
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Partner submission error:', err);
      setErrorMsg(err.message || 'Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Selectt Partners - Drive Your Dealership Growth | Selectt"
        description="Join India's premier network of verified used car dealers. Source 20,000+ certified cars monthly with transparent live auctions, dedicated account managers, and hassle-free RC transfer."
      />

      <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">

        {/* ───────────── Hero Section with Registration Form ───────────── */}
        <section className="relative pt-16 lg:pt-20 pb-20 bg-[#0C1B33] border-b border-slate-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md mb-3.5">
                <ShieldCheck size={14} /> Official Dealer Partner Network
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3.5">
                Scale Your Dealership with <span className="text-[#00C9AF]">Selectt Partners</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-xl mb-8">
                Source from over 20,000+ certified pre-owned vehicles monthly with transparent live auctions, digital 200-point inspections, and door-step delivery.
              </p>

              {/* Quick Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-200 mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>20,000+ Fresh Inflow Monthly</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>200-Point Inspection Reports</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>Pay Post Physical Inspection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>Full RC Transfer & Logistics Support</span>
                </div>
              </div>

              {/* Hero Graphic */}
              <div className="pt-2 max-w-md hidden sm:block">
                <img
                  src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/SpinnyPartners/assets/spinny-partners-hero-cars.png?q=85&w=720&dpr=1.3"
                  alt="Selectt Dealer Network Cars"
                  className="w-full h-auto object-contain drop-shadow-2xl opacity-90"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl text-left border border-slate-100">
                <div className="mb-6 text-center sm:text-left">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#00a892] mb-1">Join 4,500+ Dealers</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">Dealer Partner Sign Up</h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">Get early access to exclusive dealer auctions & inventory.</p>
                </div>
                
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle2 size={28} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-base">Application Received!</h4>
                      <p className="text-slate-500 text-xs font-normal leading-relaxed max-w-xs mx-auto">
                        Thank you. Your dedicated Key Account Manager will contact you within 2 business hours to verify your dealership credentials.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Mobile Number (for OTP & Verification)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98765 43210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Dealership / Business Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Auto Ventures"
                        value={formData.dealershipName}
                        onChange={(e) => setFormData({ ...formData, dealershipName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maharashtra"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pune"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-2 bg-[#00C9AF] hover:bg-[#00b29c] disabled:opacity-60 text-[#0C1B33] font-bold rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{loading ? 'Submitting Application...' : 'Submit Partner Application'}</span>
                      {!loading && <ArrowRight size={14} />}
                    </button>

                    <p className="text-[10px] text-slate-400 font-medium text-center pt-1">
                      By registering, you agree to Selectt's Dealer Terms of Service & Confidentiality Policies.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ───────────── Trust Numbers Bar ───────────── */}
        <section className="bg-white border-b border-slate-200/80 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">20,000+</span>
                <p className="text-xs text-slate-500 font-medium">Monthly Certified Cars</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">4,500+</span>
                <p className="text-xs text-slate-500 font-medium">Active Dealer Partners</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">200-Point</span>
                <p className="text-xs text-slate-500 font-medium">Rigorous Inspection</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#00a892] tracking-tight">100%</span>
                <p className="text-xs text-slate-500 font-medium">RC Transfer Assurance</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Why Partner with Us (Grid of 6 Cards) ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 mb-3.5">
                Partner Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Built to power modern used car dealerships
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Transparency, comprehensive inspection data, and dedicated operational support lie at the heart of every transaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-5">
                  <Car size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Massive Inventory Inflow</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  Access 20,000+ certified vehicles every month directly sourced from genuine individual sellers across all major Indian metros.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-5">
                  <FileCheck2 size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">200-Point Digital Inspection</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  High-definition photography, OBD-II scanner diagnostics, paint depth readings, and chassis verification sheets for every single listing.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-5">
                  <BadgeCheck size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Pay Post Physical Inspection</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  Gain peace of mind by physically validating vehicle condition and documentation at our regional hubs before transferring final payment.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-5">
                  <Gavel size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Transparent Live Bidding</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  Fair, algorithm-backed auction engine with real-time bidding alerts and instant deal closure without hidden distributor markups.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mb-5">
                  <Users2 size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Dedicated Account Manager</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  A dedicated Key Account Manager is assigned to your dealership to provide custom inventory alerts and priority customer support.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs hover:border-slate-300 transition-all text-left">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 mb-5">
                  <Truck size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">End-to-End Transport & RC</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-[1.75]">
                  Hassle-free doorstep car delivery, automated VAHAN RTO ownership transfer, and clear NOC dispatch straight to your showroom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── How It Works (3 Steps) ───────────── */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Streamlined Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                How sourcing works on Selectt Partners
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                A simple 3-step digital journey engineered to help you close verified inventory in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left relative">
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  01
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Browse & Place Your Bid</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Filter verified cars by brand, fuel type, manufacturing year, or region, and submit competitive bids during live auction windows.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left relative">
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  02
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Win & Lock The Deal</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Upon winning the auction, our procurement team negotiates seller handovers and ensures you receive the vehicle at the agreed transparent price.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left relative">
                <div className="w-9 h-9 rounded-lg bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs mb-5">
                  03
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Payment & Doorstep Delivery</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Complete secure payment post-verification and receive insured transportation to your dealership with full RTO documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Trusted by dealers across the nation! ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Partner Testimonials</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Trusted by 4,500+ car dealerships across India
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                See how automotive dealerships grow their monthly resale volume with Selectt Partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="stroke-none" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">
                    "Sourcing inventory via Selectt Partners has transformed our turn-around time. Registration was quick and the inspection sheets are accurate to the millimeter."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <strong className="block text-sm font-bold text-slate-900">Imran Baba</strong>
                  <span className="text-xs text-slate-400 font-medium">Sri Mookambika Cars, Bengaluru</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="stroke-none" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">
                    "We have been buying 15-20 cars monthly from Selectt Partners for the past 9 months. The physical inspection option before final payment gives us 100% confidence."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <strong className="block text-sm font-bold text-slate-900">Murlidhar Deshmukh</strong>
                  <span className="text-xs text-slate-400 font-medium">VCP Motors, Mumbai</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="stroke-none" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">
                    "Fair bidding rules and zero hidden charges. Our dedicated account manager keeps us informed on incoming SUVs and sedans regularly."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <strong className="block text-sm font-bold text-slate-900">Lalit Chawla</strong>
                  <span className="text-xs text-slate-400 font-medium">Chawla Motors, Delhi NCR</span>
                </div>
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


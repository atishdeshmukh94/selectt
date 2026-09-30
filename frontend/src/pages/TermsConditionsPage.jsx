import React, { useState, useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';
import { 
  FileText, 
  ShieldCheck, 
  Car, 
  DollarSign, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  Lock, 
  ChevronRight, 
  Phone, 
  Mail, 
  FileCheck2,
  Layers,
  Award
} from 'lucide-react';

const TermsConditionsPage = () => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [activeSection, setActiveSection] = useState('buyer-booking');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageMeta
        title="Terms of Use & Conditions | Selectt Cars India"
        description="Read the official terms and conditions for buying cars, selling vehicles, booking test drives, financing, and warranty coverage at Selectt."
      />

      <div className="min-h-screen bg-slate-50 text-[#0C1B33] font-sans pb-24 w-full overflow-x-clip pt-0">
        
        {/* Dark Hero Banner Section */}
        <section className="relative pt-24 pb-16 w-full flex items-center justify-center overflow-hidden border-b border-slate-800/80 bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <span className="text-[#00C9AF] text-xs md:text-sm font-black uppercase tracking-[0.25em] mb-3 block">
              LEGAL AGREEMENT & POLICIES
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
              Terms of Use & Conditions
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-3 max-w-2xl mx-auto">
              Clear, transparent rules governing vehicle bookings, doorstep evaluations, warranty claims, test drives, and financing on the Selectt Platform.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] md:text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                <CheckCircle2 size={13} className="text-[#00C9AF]" /> Version 2.4 (Updated 2026)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                <CheckCircle2 size={13} className="text-[#00C9AF]" /> Governing Law: Republic of India
              </span>
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
          
          {/* Main Category Tabs */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/80 flex flex-wrap gap-2 mb-8">
            {[
              { id: 'buyers', label: '1. Buyer Terms & Warranty', icon: Car },
              { id: 'sellers', label: '2. Seller Terms & RC Transfer', icon: DollarSign },
              { id: 'financial', label: '3. Loans, Insurance & Platform', icon: Scale },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0C1B33] text-[#00C9AF] shadow-md shadow-slate-900/10'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Left Quick Navigation Bar */}
            <div className="lg:col-span-4 self-start lg:sticky lg:top-24 z-20">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-2 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
                  {activeTab === 'buyers' && 'Buyer Sections'}
                  {activeTab === 'sellers' && 'Seller Sections'}
                  {activeTab === 'financial' && 'General & Legal Sections'}
                </h3>

                {activeTab === 'buyers' && (
                  <div className="space-y-1">
                    {[
                      { id: 'buyer-booking', title: 'Vehicle Token Booking' },
                      { id: 'buyer-inspection', title: '140+ Point Inspection' },
                      { id: 'buyer-moneyback', title: '7-Day Money Back Policy' },
                      { id: 'buyer-warranty', title: '1-Year Assured Warranty' },
                      { id: 'buyer-testdrive', title: 'Test Drive Rules & Safety' },
                      { id: 'buyer-delivery', title: 'Vehicle Handover & RC' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                          activeSection === s.id
                            ? 'bg-[#0C1B33] text-[#00C9AF]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{s.title}</span>
                        <ChevronRight size={13} className={activeSection === s.id ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'sellers' && (
                  <div className="space-y-1">
                    {[
                      { id: 'seller-evaluation', title: 'Doorstep Valuation & Inspection' },
                      { id: 'seller-pricing', title: 'Offer Acceptance & Payment' },
                      { id: 'seller-docs', title: 'RC & Title Documentation' },
                      { id: 'seller-liability', title: 'Challan & Ownership Handover' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                          activeSection === s.id
                            ? 'bg-[#0C1B33] text-[#00C9AF]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{s.title}</span>
                        <ChevronRight size={13} className={activeSection === s.id ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'financial' && (
                  <div className="space-y-1">
                    {[
                      { id: 'fin-loans', title: 'Used Car Loans & EMI' },
                      { id: 'fin-insurance', title: 'Motor Insurance Quotes' },
                      { id: 'fin-ip', title: 'Intellectual Property Rights' },
                      { id: 'fin-disclaimer', title: 'Disclaimer & Liability' },
                      { id: 'fin-disputes', title: 'Governing Law & Disputes' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                          activeSection === s.id
                            ? 'bg-[#0C1B33] text-[#00C9AF]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{s.title}</span>
                        <ChevronRight size={13} className={activeSection === s.id ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-[#0C1B33]">Official Entity:</p>
                    <p className="text-slate-500 text-[11px]">Selectt Technologies Pvt. Ltd.<br />Sector 48, Gurugram, Haryana</p>
                    <a href="mailto:contact@selectt.in" className="text-[#00C9AF] font-bold inline-block mt-1">contact@selectt.in</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Tab Content */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200/80 text-slate-600 leading-relaxed text-sm md:text-base space-y-10">
                
                {/* ─── TAB 1: BUYER TERMS ─── */}
                {activeTab === 'buyers' && (
                  <div className="space-y-10 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[#00C9AF] text-xs font-black uppercase tracking-widest block mb-1">
                        PART A — FOR VEHICLE BUYERS
                      </span>
                      <h2 className="text-2xl font-black text-[#0C1B33] tracking-tight">
                        Terms of Buying, Booking & Assured Warranty
                      </h2>
                    </div>

                    {/* 1. Vehicle Token Booking */}
                    <section id="buyer-booking" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Car className="text-[#00C9AF]" size={20} />
                        <h3>1. Vehicle Token Booking & Reservation</h3>
                      </div>
                      <p>
                        Buyers may reserve any listed vehicle by paying a 100% refundable token booking amount (₹5,000 for cars under 10 Lakhs, ₹11,000 for cars below 20 Lakhs, and ₹21,000 for cars 20 Lakhs & above as indicated during checkout).
                      </p>
                      <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
                        <li><strong>48-Hour Exclusive Hold:</strong> Once a token payment is successfully verified via our secure gateway, the vehicle is marked as reserved and will not be sold to other buyers for a period of 48 hours.</li>
                        <li><strong>100% Refundable Token:</strong> If after inspecting or test driving the car you decide not to proceed with the purchase, you may cancel the booking online or via customer support for a 100% full refund credited within 5 to 7 working days.</li>
                        <li><strong>Final Settlement:</strong> The token amount is fully adjusted against the final purchase invoice price upon completion of the transaction.</li>
                      </ul>
                    </section>

                    {/* 2. 140+ Point Inspection */}
                    <section id="buyer-inspection" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <FileCheck2 className="text-[#00C9AF]" size={20} />
                        <h3>2. 140+ Point Quality Inspection</h3>
                      </div>
                      <p>
                        Every car listed under <strong>Selectt Assured</strong> undergoes a comprehensive 140-point technical evaluation covering engine, transmission, steering, suspension, electricals, AC performance, structural chassis integrity, and digital scanner diagnostics.
                      </p>
                      <p className="text-xs md:text-sm">
                        The full digital inspection report with high-resolution photos of any minor imperfections is made available transparently to the buyer prior to purchase.
                      </p>
                    </section>

                    {/* 3. 7-Day Money Back Guarantee */}
                    <section id="buyer-moneyback" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <RotateCcw className="text-[#00C9AF]" size={20} />
                        <h3>3. 7-Day / 300 KM Money Back Guarantee</h3>
                      </div>
                      <p>
                        We stand firmly behind the quality of our certified vehicles. If you are not completely satisfied with your purchase:
                      </p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs md:text-sm space-y-2">
                        <p><strong>Eligibility Conditions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                          <li>Return request must be raised within <strong>7 calendar days</strong> from the official delivery date.</li>
                          <li>Vehicle must not have been driven more than <strong>300 kilometers</strong> from the delivery odometer reading.</li>
                          <li>Vehicle must remain in the same structural and physical condition as delivered, free of any accidental damage, modifications, third-party repairs, or new encumbrances.</li>
                        </ul>
                      </div>
                    </section>

                    {/* 4. 1-Year Assured Warranty */}
                    <section id="buyer-warranty" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Award className="text-[#00C9AF]" size={20} />
                        <h3>4. 1-Year Comprehensive Warranty Coverage</h3>
                      </div>
                      <p>
                        Selectt Assured cars include complimentary 1-Year / 15,000 KM warranty protection on major critical assemblies:
                      </p>
                      <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
                        <li><strong>Engine & Internal Components:</strong> Cylinder head, pistons, crankshaft, camshaft, oil pump, turbocharger.</li>
                        <li><strong>Transmission & Gearbox:</strong> Manual / automatic transmission assemblies, torque converter, gearbox internal gears.</li>
                        <li><strong>Cashless Claims:</strong> Serviceable across 5,000+ authorized cashless workshops across India.</li>
                      </ul>
                    </section>

                    {/* 5. Test Drives */}
                    <section id="buyer-testdrive" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <ShieldCheck className="text-[#00C9AF]" size={20} />
                        <h3>5. Test Drive Rules & Customer Safety</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        To book and experience a test drive at our Car Hubs or at your doorstep, you must possess a valid Indian Driving License. Customers must follow traffic regulations and safety instructions provided by the Selectt Car Specialist during the drive.
                      </p>
                    </section>

                    {/* 6. Delivery & RC Transfer */}
                    <section id="buyer-delivery" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <FileText className="text-[#00C9AF]" size={20} />
                        <h3>6. Vehicle Handover & RC Ownership Transfer</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        Selectt manages the complete RTO Registration Certificate (RC) transfer process on behalf of the buyer. The updated Smart Card RC is delivered to your registered residential address upon completion of RTO processing (typically within 45 to 60 business days depending on state RTO timelines).
                      </p>
                    </section>
                  </div>
                )}

                {/* ─── TAB 2: SELLER TERMS ─── */}
                {activeTab === 'sellers' && (
                  <div className="space-y-10 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[#00C9AF] text-xs font-black uppercase tracking-widest block mb-1">
                        PART B — FOR CAR SELLERS
                      </span>
                      <h2 className="text-2xl font-black text-[#0C1B33] tracking-tight">
                        Terms of Selling, Doorstep Valuation & RC Transfer
                      </h2>
                    </div>

                    {/* 1. Doorstep Valuation */}
                    <section id="seller-evaluation" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Car className="text-[#00C9AF]" size={20} />
                        <h3>1. Free Doorstep Valuation & Vehicle Inspection</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        Online instant valuations provided on the platform are algorithmic estimates based on historical market trends and inputs provided by the seller. Final offer price is determined after physical doorstep or Car Hub inspection by certified Selectt evaluators.
                      </p>
                    </section>

                    {/* 2. Offer Acceptance & Instant Payment */}
                    <section id="seller-pricing" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <DollarSign className="text-[#00C9AF]" size={20} />
                        <h3>2. Offer Acceptance & Instant Bank Transfer</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        Upon agreement on the final price and verification of original vehicle documents (RC, Insurance, Aadhaar, PAN), Selectt initiates direct bank transfer (IMPS / NEFT / RTGS) to the registered vehicle owner's bank account before vehicle pickup.
                      </p>
                    </section>

                    {/* 3. Documentation & Clean Title */}
                    <section id="seller-docs" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <FileCheck2 className="text-[#00C9AF]" size={20} />
                        <h3>3. Seller Documentation & Title Warranties</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        The seller warrants that: (a) they are the rightful registered legal owner or authorized representative; (b) the vehicle is free of any undisclosed hypothecation, legal dispute, criminal proceedings, or odometer tampering; and (c) all pending traffic challans or tax liabilities prior to handover date are settled by the seller.
                      </p>
                    </section>

                    {/* 4. Complete RC Transfer & Liability Protection */}
                    <section id="seller-liability" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <ShieldCheck className="text-[#00C9AF]" size={20} />
                        <h3>4. RC Transfer & Seller Liability Protection</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        From the moment of physical handover with signed Delivery Receipt, Selectt assumes full custodial responsibility for the vehicle and guarantees safe, legitimate RTO ownership transfer to the subsequent buyer.
                      </p>
                    </section>
                  </div>
                )}

                {/* ─── TAB 3: PLATFORM & FINANCIAL SERVICES ─── */}
                {activeTab === 'financial' && (
                  <div className="space-y-10 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[#00C9AF] text-xs font-black uppercase tracking-widest block mb-1">
                        PART C — GENERAL PLATFORM & FINANCIAL SERVICES
                      </span>
                      <h2 className="text-2xl font-black text-[#0C1B33] tracking-tight">
                        Used Car Loans, Insurance & Legal Terms
                      </h2>
                    </div>

                    {/* 1. Loans */}
                    <section id="fin-loans" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Scale className="text-[#00C9AF]" size={20} />
                        <h3>1. Used Car Loan Facilitation & EMI Calculator</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        Selectt partners with top Indian banking institutions and NBFCs (HDFC Bank, ICICI Bank, State Bank of India, Axis Bank, Kotak Mahindra Bank, IDFC First Bank) to assist buyers in procuring pre-owned auto financing.
                      </p>
                      <p className="text-xs md:text-sm text-slate-500">
                        Loan sanction, interest rates (starting from 11.5% p.a.), loan-to-value (LTV) ratio, and processing fees are determined exclusively by the respective lending bank based on your credit score (CIBIL) and income profile.
                      </p>
                    </section>

                    {/* 2. Insurance */}
                    <section id="fin-insurance" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <ShieldCheck className="text-[#00C9AF]" size={20} />
                        <h3>2. Motor Insurance Quote Facilitation</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        Car insurance quotations presented on the platform are sourced from IRDAI-registered insurance providers. Policies are issued directly by the insurer with cashless claim benefits across their garage network.
                      </p>
                    </section>

                    {/* 3. IP Rights */}
                    <section id="fin-ip" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Lock className="text-[#00C9AF]" size={20} />
                        <h3>3. Intellectual Property Rights</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        All content on this Platform—including text, graphics, logos, brand symbols, user interfaces, 140-point inspection algorithms, photography, and software code—is the proprietary property of <strong>Selectt Technologies Private Limited</strong> and protected under Indian copyright, trademark, and intellectual property laws.
                      </p>
                    </section>

                    {/* 4. Disclaimer */}
                    <section id="fin-disclaimer" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <AlertCircle className="text-[#00C9AF]" size={20} />
                        <h3>4. Limitation of Liability & Disclaimers</h3>
                      </div>
                      <p className="text-xs md:text-sm uppercase font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, SELECTT DISCLAIMS ALL INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OF THE WEBSITE, THIRD-PARTY BANKING LOAN DECISIONS, OR ACTS OF GOD. SELECTT'S AGGREGATE LIABILITY FOR ANY VERIFIED CLAIM SHALL BE STRICTLY LIMITED TO THE REVENUE RECEIVED BY SELECTT FROM THE SPECIFIC TRANSACTION.
                      </p>
                    </section>

                    {/* 5. Disputes */}
                    <section id="fin-disputes" className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[#0C1B33] font-bold text-lg border-b border-slate-100 pb-2">
                        <Scale className="text-[#00C9AF]" size={20} />
                        <h3>5. Governing Law & Dispute Resolution</h3>
                      </div>
                      <p className="text-xs md:text-sm">
                        These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any dispute, difference, or controversy arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts at <strong>Gurugram / New Delhi, India</strong>.
                      </p>
                    </section>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditionsPage;

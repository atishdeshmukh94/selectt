import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Users, 
  Share2, 
  Database, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'intro', title: '1. Introduction & Scope', icon: ShieldCheck },
    { id: 'collection', title: '2. Information We Collect', icon: Database },
    { id: 'usage', title: '3. How We Use Your Information', icon: Eye },
    { id: 'sharing', title: '4. Information Sharing & Third Parties', icon: Share2 },
    { id: 'cookies', title: '5. Cookies, Analytics & Meta Pixel', icon: FileText },
    { id: 'security', title: '6. Data Security & Protection', icon: Lock },
    { id: 'retention', title: '7. Data Retention & Deletion', icon: Clock },
    { id: 'rights', title: '8. Your Rights & Choices', icon: Users },
    { id: 'grievance', title: '9. Grievance Officer & Contact', icon: Phone },
  ];

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
        title="Privacy Policy | Selectt Cars India"
        description="Learn how Selectt collects, protects, uses, and processes your personal, vehicle, and financial data in compliance with Indian IT and DPDP regulations."
      />

      <div className="min-h-screen bg-slate-50 text-[#0C1B33] font-sans pb-24 w-full overflow-x-clip pt-0">
        {/* Dark Hero Banner */}
        <section className="relative pt-24 pb-16 w-full flex items-center justify-center overflow-hidden border-b border-slate-800/80 bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <span className="text-[#00C9AF] text-xs md:text-sm font-black uppercase tracking-[0.25em] mb-3 block">
              DATA PRIVACY & SECURITY
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
              Privacy Policy
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-3 max-w-2xl mx-auto">
              Your trust is our highest priority. Understand how Selectt safeguards your personal, vehicle, and transactional information.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] md:text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                <CheckCircle2 size={13} className="text-[#00C9AF]" /> Last Updated: March 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                <CheckCircle2 size={13} className="text-[#00C9AF]" /> DPDP Act (2023) & IT Act Compliant
              </span>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 self-start lg:sticky lg:top-24 z-20">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 mb-3">
                  Policy Table of Contents
                </h3>
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-[#0C1B33] text-[#00C9AF] shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-[#00C9AF]' : 'text-slate-400'} />
                        <span>{sec.title}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-[#0C1B33]">Need Privacy Assistance?</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Reach out to our Data Grievance Officer.</p>
                    <a
                      href="mailto:privacy@selectt.in"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#00C9AF] hover:underline"
                    >
                      <Mail size={12} /> privacy@selectt.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200/80 text-slate-600 leading-relaxed text-sm md:text-base space-y-10">
                
                {/* 1. Introduction & Scope */}
                <section id="intro" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <ShieldCheck className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">1. Introduction & Scope</h2>
                  </div>
                  <p>
                    Welcome to <strong>Selectt</strong> (referred to as <em>"Selectt"</em>, <em>"We"</em>, <em>"Us"</em>, or <em>"Our"</em>), operated by <strong>Selectt Technologies Private Limited</strong>. We provide an end-to-end digital ecosystem for buying certified pre-owned cars, selling used vehicles, securing used car loans, purchasing motor insurance, and scheduling test drives via our website (<span className="text-[#0C1B33] font-semibold">www.selectt.in</span>) and associated digital services (collectively, the <strong>"Platform"</strong>).
                  </p>
                  <p>
                    This Privacy Policy explains in detail how we collect, process, store, disclose, and safeguard your personal information and vehicle data when you visit our Platform, book a car, submit a loan or insurance inquiry, schedule a vehicle inspection, or communicate with our customer advisors.
                  </p>
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 text-xs md:text-sm text-blue-900">
                    <strong>Regulatory Compliance:</strong> This policy is drafted in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection (DPDP) Act, 2023.
                  </div>
                </section>

                {/* 2. Information We Collect */}
                <section id="collection" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Database className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">2. Information We Collect</h2>
                  </div>
                  <p>We collect various categories of information based on your interactions with the Platform:</p>
                  
                  <div className="space-y-4 text-xs md:text-sm">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-[#0C1B33] mb-1">A. Personal Identification & Contact Data</h4>
                      <p>When you register, book a car token, or request an evaluation: Name, mobile phone number, email address, physical delivery address, city, state, and identity verification credentials.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-[#0C1B33] mb-1">B. Vehicle & Ownership Data</h4>
                      <p>When selling a car or checking insurance: Vehicle Registration Number (e.g. MH02AB1234), Chassis/Engine Number, Make, Model, Variant, Year of Manufacture, Odometer KM reading, Insurance policy status, RC copy, and vehicle condition photographs.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-[#0C1B33] mb-1">C. Financial, EMI & Loan Application Data</h4>
                      <p>When applying for used car financing: Profession type (Salaried / Self-Employed), monthly net income, PAN Card number, bank account details, preferred EMI tenure, and loan sanction documentation required by our lending bank partners.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-[#0C1B33] mb-1">D. Transaction & Payment Information</h4>
                      <p>Token booking fees, payment status, Razorpay transaction reference IDs, and refund records. <em>Note: We do not store complete credit card or debit card numbers on our servers; payments are processed securely via RBI-licensed payment gateways.</em></p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-[#0C1B33] mb-1">E. Automated Device, Location & Usage Data</h4>
                      <p>IP address, browser type, operating system, pages viewed, time spent per page, referring URLs, and geo-location to suggest nearby Car Hubs and service locations.</p>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Your Information */}
                <section id="usage" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Eye className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">3. How We Use Your Information</h2>
                  </div>
                  <p>We process your data strictly for legitimate operational and customer service objectives:</p>
                  <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
                    <li><strong>Vehicle Booking & Fulfillment:</strong> Processing token reservations, preparing the 140+ point inspection report, and scheduling vehicle delivery or Car Hub pickup.</li>
                    <li><strong>Sell Car Evaluation & RC Transfer:</strong> Scheduling free doorstep inspections, providing instant market valuations, and coordinating official RTO vehicle ownership transfer.</li>
                    <li><strong>Used Car Loan Assistance:</strong> Transmitting your loan applications to selected partner financial institutions (HDFC, ICICI, SBI, Axis, Kotak, IDFC First) for loan underwriting and instant approval.</li>
                    <li><strong>Motor Insurance Quotes:</strong> Providing competitive comprehensive or zero-depreciation policy options directly on WhatsApp or Call.</li>
                    <li><strong>Customer Communication & Alerts:</strong> Sending one-time OTPs, booking confirmations, inspection status alerts, and post-sales warranty support via SMS, Email, and WhatsApp.</li>
                    <li><strong>Security & Anti-Fraud:</strong> Protecting our community from fraudulent vehicle listings, duplicate submissions, and unauthorized account access.</li>
                  </ul>
                </section>

                {/* 4. Information Sharing & Third Parties */}
                <section id="sharing" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Share2 className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">4. Information Sharing & Disclosures</h2>
                  </div>
                  <p>
                    <strong>We do not sell your personal information to data brokers.</strong> We disclose data only to trusted service partners strictly necessary for fulfilling your requests:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <h5 className="font-bold text-[#0C1B33]">Banking & Lending Partners</h5>
                      <p className="text-slate-500 mt-1">To process and sanction used car finance when you submit loan inquiries.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <h5 className="font-bold text-[#0C1B33]">Insurance Underwriters</h5>
                      <p className="text-slate-500 mt-1">To issue IRDAI-approved motor insurance policies for vehicle protection.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <h5 className="font-bold text-[#0C1B33]">RTO & Verification Agencies</h5>
                      <p className="text-slate-500 mt-1">To verify registration certificate (RC), challan records, and execute ownership transfer.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <h5 className="font-bold text-[#0C1B33]">Payment & Tech Gateways</h5>
                      <p className="text-slate-500 mt-1">Razorpay for secure token checkouts and Gallabox for transactional WhatsApp notifications.</p>
                    </div>
                  </div>
                </section>

                {/* 5. Cookies, Analytics & Meta Pixel */}
                <section id="cookies" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <FileText className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">5. Cookies, Analytics & Meta Pixel</h2>
                  </div>
                  <p>
                    We use first-party and third-party cookies, web beacons, and pixels (including Meta Pixel and Google Analytics) to improve your navigation experience, analyze platform performance, and display relevant pre-owned vehicle recommendations.
                  </p>
                  <p className="text-xs md:text-sm">
                    You can configure your web browser to reject cookies or alert you when cookies are being stored. However, certain interactive features (like wishlisting vehicles or accessing logged-in user profiles) may require cookies to function properly.
                  </p>
                </section>

                {/* 6. Data Security & Protection */}
                <section id="security" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Lock className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">6. Data Security & Protection</h2>
                  </div>
                  <p>
                    Selectt enforces comprehensive physical, electronic, and managerial safeguards to protect your personal information against unauthorized access, loss, alteration, or misuse:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <strong className="block mb-1 font-bold">256-Bit SSL Encryption</strong>
                      All in-transit data across the website and APIs is fully encrypted.
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <strong className="block mb-1 font-bold">Access Controls</strong>
                      Role-based access restrictions so only authorized staff can view inquiries.
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <strong className="block mb-1 font-bold">Secure Databases</strong>
                      Protected cloud servers with continuous monitoring and automated backups.
                    </div>
                  </div>
                </section>

                {/* 7. Data Retention & Deletion */}
                <section id="retention" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Clock className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">7. Data Retention & Account Deletion</h2>
                  </div>
                  <p>
                    We retain personal data as long as necessary to fulfill the services requested by you, maintain warranty records (1-Year Assured Warranty), comply with statutory tax, audit, and vehicle transfer regulations, or resolve disputes.
                  </p>
                  <p className="text-xs md:text-sm">
                    You may request deletion of your account and personal profile data at any time by emailing <a href="mailto:privacy@selectt.in" className="text-[#00C9AF] font-bold hover:underline">privacy@selectt.in</a>. Once verified, we will securely purge or anonymize your data, except records required to be retained under applicable Indian automotive or financial laws.
                  </p>
                </section>

                {/* 8. Your Rights & Choices */}
                <section id="rights" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Users className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">8. Your Rights & Choices</h2>
                  </div>
                  <p>Under applicable Indian data protection frameworks, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
                    <li><strong>Access & Review:</strong> Review the personal and vehicle data associated with your profile.</li>
                    <li><strong>Correction & Update:</strong> Request correction of inaccurate or incomplete contact or KYC details.</li>
                    <li><strong>Opt-Out of Marketing:</strong> Unsubscribe from non-essential promotional SMS, emails, or WhatsApp updates at any time by replying STOP or contacting support.</li>
                    <li><strong>Withdraw Consent:</strong> Revoke consent previously granted for data processing, subject to contractual requirements.</li>
                  </ul>
                </section>

                {/* 9. Grievance Officer & Contact */}
                <section id="grievance" className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0C1B33] pb-2 border-b border-slate-100">
                    <Phone className="text-[#00C9AF]" size={22} />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">9. Grievance Officer & Contact Information</h2>
                  </div>
                  <p>
                    In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the name and contact details of the Grievance Officer are provided below:
                  </p>
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-2 text-xs md:text-sm">
                    <p><strong>Grievance Redressal Officer:</strong> Mr. Rohit Kumar</p>
                    <p><strong>Entity:</strong> Selectt Technologies Private Limited</p>
                    <p><strong>Address:</strong> Selectt Auto Hub, Capital Business Park, Sector 48, Gurugram, Haryana - 122018</p>
                    <p><strong>Direct Email:</strong> <a href="mailto:grievance@selectt.in" className="text-[#00C9AF] underline">grievance@selectt.in</a></p>
                    <p><strong>Support Phone:</strong> +91 85919 69394 (10:00 AM – 7:00 PM IST, Monday to Saturday)</p>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;

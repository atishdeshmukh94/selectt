import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import { HelpCircle, Car, ArrowRight, ShieldCheck, FileText, Banknote, Sparkles } from 'lucide-react';

const FAQPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL' | 'LOAN' | 'DOCS' | 'INSPECTION'
  const [searchQuery, setSearchQuery] = useState('');

  // Categories & FAQ Data aligned with SEO Modular Blueprint
  const allCategories = [
    {
      id: 'BUY',
      tab: 'Buying Used Cars',
      title: 'Buying Certified Used Cars',
      items: [
        {
          q: "What makes a car 'Selectt Certified'?",
          a: "Every Selectt Certified car undergoes an uncompromising 200-point inspection covering engine compression, transmission, structural aprons, and electronics. Cars with major accidental history or water flood damage are 100% rejected. All certified vehicles come with a 1-year warranty and a 5-day money-back guarantee.",
          link: "/buy-cars",
          linkText: "Browse Certified Cars"
        },
        {
          q: "Can I take a test drive before buying?",
          a: "Yes! You can book a completely free test drive at any Selectt Hub or schedule a doorstep test drive at your home or office.",
          link: "/buy-cars",
          linkText: "Book a Free Test Drive"
        },
        {
          q: "How does the 5-day money-back guarantee work?",
          a: "Drive your car for up to 5 days (or 250 kms). If you aren't completely satisfied for any reason, return it to us for a 100% refund with zero cancellation charges.",
          link: "/selectt-inspection-process",
          linkText: "Learn About Buyer Guarantees"
        },
        {
          q: "Are the car prices fixed and non-negotiable?",
          a: "Yes. All Selectt cars feature transparent, fixed pricing calculated from over 100,000 real-world transactions so you get the best market value without haggling."
        }
      ]
    },
    {
      id: 'SELL',
      tab: 'Selling Used Cars',
      title: 'Selling Your Car',
      items: [
        {
          q: "How does Selectt guarantee the best price for my car?",
          a: "We evaluate real-time demand across thousands of verified dealer networks and end buyers nationwide to give you the highest competitive market offer within 24 hours.",
          link: "/sell-car-in-mumbai",
          linkText: "Get Instant Valuation"
        },
        {
          q: "How long does the inspection take?",
          a: "Our free doorstep car evaluation takes just 30 to 45 minutes and includes an engine health check, paint gauge test, and road test.",
          link: "/selectt-inspection-process",
          linkText: "View Inspection Checklist"
        },
        {
          q: "When will I receive payment for my car?",
          a: "Payment is transferred directly to your verified bank account via instant IMPS / NEFT immediately upon vehicle handover and document signing.",
          link: "/sell-car-in-mumbai",
          linkText: "Sell Your Car Today"
        },
        {
          q: "What is the Selectt Seller Protection Guarantee?",
          a: "From the moment you hand over your keys, Selectt assumes 100% legal responsibility for the vehicle, shielding you from any future traffic e-challans or third-party liabilities until RC transfer completes.",
          link: "/sell-car-in-mumbai",
          linkText: "Read Seller Guarantee"
        }
      ]
    },
    {
      id: 'LOAN',
      tab: 'Financing & Loans',
      title: 'Used Car Financing & EMI',
      items: [
        {
          q: "Do you offer used car loans and financing?",
          a: "Yes! Selectt partners with leading nationalized and private banks (including HDFC, ICICI, SBI, Axis) to offer instant approvals, low EMIs, and funding up to 100% on-road value.",
          link: "/used-car-loan",
          linkText: "Calculate Loan EMI"
        },
        {
          q: "What documents are required for a used car loan?",
          a: "You need PAN Card, Aadhaar Card, 6 months bank statements, latest 3 months salary slips (for salaried) or 2 years ITR (for self-employed), and electricity bill for address proof.",
          link: "/used-car-loan",
          linkText: "Check Loan Eligibility"
        },
        {
          q: "What is the maximum loan tenure available?",
          a: "Loan tenures range from 12 months up to 84 months (7 years) depending on vehicle age and borrower eligibility."
        }
      ]
    },
    {
      id: 'DOCS',
      tab: 'Documentation & RC Transfer',
      title: 'Documentation & RC Transfer Process',
      items: [
        {
          q: "How long does the RC transfer process take?",
          a: "RC transfer is handled end-to-end by Selectt and usually completes within 60 to 90 days depending on the state RTO jurisdiction. You can track live transfer milestones directly in your Selectt profile.",
          link: "/profile",
          linkText: "Track RC Status"
        },
        {
          q: "Are there any hidden charges for RC transfer?",
          a: "No. When you sell or buy with Selectt, all RTO documentation and transfer fees are fully managed with complete transparency."
        },
        {
          q: "What happens if my car has an existing bank loan / hypothecation?",
          a: "Selectt clears the outstanding loan balance directly with your lender, obtains the Form 35 NOC, and disburses the balance proceeds directly to your account."
        }
      ]
    },
    {
      id: 'INSPECTION',
      tab: '200-Point Inspection',
      title: '200-Point Inspection & Warranty',
      items: [
        {
          q: "What checkpoints are covered in the 200-point inspection?",
          a: "Our inspection covers Engine & Transmission (compression, leaks, mounts), Suspension & Steering (bushings, dampers, tie rods), Electricals & Sensors (OBD-II scans, battery load), Body & Structure (paint depth gauge, structural pillars), and Legal VAHAN verification.",
          link: "/selectt-inspection-process",
          linkText: "See Full 200-Point Checklist"
        },
        {
          q: "What is covered under the 1-year warranty?",
          a: "Our warranty covers critical high-value components including engine block, cylinder head assembly, manual/automatic gearbox, steering rack, and AC compressor.",
          link: "/selectt-inspection-process",
          linkText: "View Warranty Coverage"
        },
        {
          q: "What is the ₹50,000 Zero Hidden Damages Promise?",
          a: "If our evaluators missed an undisclosed defect during inspection, Selectt fixes the issue for free or reimburses repair costs up to ₹50,000 during your warranty period.",
          link: "/selectt-inspection-process",
          linkText: "Read Assurance Promise"
        }
      ]
    }
  ];

  // Flattened Q&A list for schema and search
  const allFaqs = allCategories.flatMap(cat => cat.items);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const currentCategories = activeTab === 'ALL'
    ? allCategories
    : allCategories.filter(cat => cat.id === activeTab);

  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return currentCategories;
    const query = searchQuery.toLowerCase();
    return currentCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0);
  };

  const displayedCategories = getFilteredCategories();

  return (
    <>
      <PageMeta
        title="Frequently Asked Questions About Buying & Selling Used Cars | Selectt"
        description="Find clear answers on how to buy, sell, inspect, finance, and transfer RC for used cars with Selectt. 100% transparent used car ecosystem."
        canonical="https://selectt.in/faq"
        schema={faqSchema}
      />
      <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#00C9AF]/10 border border-[#00C9AF]/30 text-[#008f7d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle size={14} /> Knowledge Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0C1B33] tracking-tight">
                Frequently Asked Questions About Buying & Selling Used Cars
              </h1>
              <div className="w-12 h-1 bg-[#00C9AF] mt-3 rounded"></div>
              <p className="text-slate-500 font-medium text-sm sm:text-base mt-3">
                Everything you need to know about buying, selling, inspections, financing, and paperwork.
              </p>
            </div>

            <div className="w-full md:max-w-md relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search topics (e.g. RC transfer, warranty, loan)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C9AF] focus:border-[#00C9AF] text-sm shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'ALL', label: 'All Topics' },
              { id: 'BUY', label: 'Buying Cars' },
              { id: 'SELL', label: 'Selling Cars' },
              { id: 'LOAN', label: 'Car Loans & EMI' },
              { id: 'DOCS', label: 'RC Transfer & Docs' },
              { id: 'INSPECTION', label: '200-Point Inspection' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#00C9AF] text-[#0C1B33] shadow-sm font-black'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Sections */}
          <div className="space-y-12">
            {displayedCategories.length > 0 ? (
              displayedCategories.map(cat => (
                <div key={cat.id} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-xs">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#00C9AF]/15 text-[#008f7d] flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{cat.title}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cat.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#00C9AF] transition-all">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{item.q}</h3>
                          <div className="w-8 h-0.5 bg-[#00C9AF] my-2.5 rounded"></div>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">{item.a}</p>
                        </div>
                        {item.link && (
                          <div className="pt-4 mt-3 border-t border-slate-200/60">
                            <Link
                              to={item.link}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00a892] hover:text-[#0C1B33] transition-colors"
                            >
                              {item.linkText || 'Learn more'} <ArrowRight size={13} />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <p className="text-slate-500 font-bold text-base">No questions found matching "{searchQuery}"</p>
                <p className="text-slate-400 text-xs mt-1">Try searching for other terms like 'loan', 'RC transfer', or 'warranty'</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 bg-[#00C9AF] text-[#0C1B33] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Bottom Quick Help CTA */}
          <div className="mt-14 bg-gradient-to-r from-[#0C1B33] via-[#102444] to-[#0C1B33] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00C9AF]">Still Have Questions?</span>
              <h3 className="text-2xl font-black mt-1">We're Here to Help Every Step of the Way</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl">
                Whether you're selling your car, booking a test drive, or calculating loan EMIs, our dedicated specialists are available 7 days a week.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact-us"
                className="bg-white text-[#0C1B33] hover:bg-slate-100 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                Contact Support
              </Link>
              <Link
                to="/sell-car-in-mumbai"
                className="bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00b29c] text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                Sell Your Car
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FAQPage;

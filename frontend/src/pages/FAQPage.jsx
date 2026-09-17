import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import {
  HelpCircle,
  Car,
  ArrowRight,
  ShieldCheck,
  FileText,
  Banknote,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Clock,
  ShieldAlert,
  ThumbsUp
} from 'lucide-react';

const FAQPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL' | 'LOAN' | 'DOCS' | 'INSPECTION'
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  // Toggle individual question accordion
  const toggleAccordion = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand / Collapse all in current view
  const toggleAll = (expand = true) => {
    const updated = {};
    allCategories.forEach(cat => {
      cat.items.forEach((_, idx) => {
        updated[`${cat.id}-${idx}`] = expand;
      });
    });
    setOpenItems(updated);
  };

  // Comprehensive Blueprint FAQ Data organized by intent
  const allCategories = [
    {
      id: 'BUY',
      tab: 'Buying Used Cars',
      title: 'Buying Certified Used Cars',
      icon: Car,
      items: [
        {
          q: "What does 'Selectt Certified' mean?",
          a: "Every Selectt Certified car undergoes an uncompromising 200-point inspection covering engine compression, transmission, structural aprons, electrical systems, and suspension. Cars with major accidental history or water flood damage are 100% rejected. All certified vehicles come with a 1-year warranty and a 5-day money-back guarantee.",
          link: "/used-cars-in-mumbai",
          linkText: "Browse Certified Inventory"
        },
        {
          q: "Can I take a test drive before buying?",
          a: "Yes! You can book a 100% free test drive for any car in our inventory. You can experience the drive at any Selectt Hub or have the car brought directly to your home or office for a doorstep test drive.",
          link: "/buy-cars",
          linkText: "Book a Free Test Drive"
        },
        {
          q: "What is the 5-Day Money-Back Guarantee?",
          a: "Drive your car for up to 5 days (or 250 kms). If you are not completely satisfied for any reason, return the car to Selectt for a full 100% refund with zero cancellation penalties or hidden deductions.",
          link: "/selectt-inspection-process",
          linkText: "Learn About Buyer Guarantees"
        },
        {
          q: "Are car prices fixed and non-negotiable?",
          a: "Yes. All Selectt cars feature transparent, fixed pricing calculated from over 100,000 real-world Indian used-car transactions, ensuring you get fair market pricing without the stress of haggling.",
          link: "/buy-cars",
          linkText: "Explore Fair-Priced Cars"
        },
        {
          q: "How does the doorstep delivery process work?",
          a: "Once payment and verification are completed, your certified car is sanitized, detailed, and delivered directly to your doorstep with all temporary documentation ready for immediate driving."
        }
      ]
    },
    {
      id: 'SELL',
      tab: 'Selling Your Car',
      title: 'Selling Your Car (Instant Valuation & Best Price)',
      icon: Banknote,
      items: [
        {
          q: "How do I sell my car online with Selectt?",
          a: "Enter your car's registration number and details on our website for an instant online valuation. Book a free doorstep inspection at your convenience. Once you accept our final price offer, we transfer the payment instantly and handle all paperwork.",
          link: "/sell-car-in-mumbai",
          linkText: "Get Instant Valuation"
        },
        {
          q: "How long does it take to get paid for my car?",
          a: "Selectt ensures you receive the full payment via secure instant bank transfer (IMPS/NEFT) within 24 hours of accepting our offer and signing handover documents.",
          link: "/sell-car-in-mumbai",
          linkText: "Sell Your Car in 24 Hours"
        },
        {
          q: "Is the car inspection really free?",
          a: "Yes, our comprehensive 200-point car inspection is 100% free of charge with zero obligation to sell. Our certified automotive evaluators can visit your home or office at your preferred time slot.",
          link: "/selectt-inspection-process",
          linkText: "View Inspection Process"
        },
        {
          q: "What documents are required to sell my car?",
          a: "You will need the original RC (Registration Certificate), valid motor insurance, valid PUC certificate, all original car keys, and your government PAN & Aadhaar cards. If the car has an existing bank loan, a loan foreclosure letter is also required."
        },
        {
          q: "What is the Selectt Seller Protection Guarantee?",
          a: "From the moment you hand over your keys, Selectt assumes 100% legal responsibility for the vehicle, shielding you from any traffic e-challans, third-party accidents, or legal disputes until the RC transfer is officially complete in the RTO records.",
          link: "/sell-car-in-mumbai",
          linkText: "Read Seller Protection Policy"
        },
        {
          q: "How does Selectt guarantee the best price for my car?",
          a: "We evaluate real-time demand across thousands of verified dealer networks and end buyers nationwide through our algorithmic pricing engine, delivering the highest competitive market offer for your vehicle."
        }
      ]
    },
    {
      id: 'LOAN',
      tab: 'Financing & Loans',
      title: 'Used Car Financing, EMI & Eligibility',
      icon: Banknote,
      items: [
        {
          q: "Do you offer used car loans and financing?",
          a: "Yes! Selectt partners with leading nationalized and private banks (including HDFC, ICICI, SBI, Axis, and Kotak) to offer instant loan approvals, low interest rates, and funding up to 100% on-road value.",
          link: "/used-car-loan",
          linkText: "Check EMI Calculator"
        },
        {
          q: "What documents are required for a used car loan?",
          a: "Salaried individuals require PAN Card, Aadhaar Card, latest 3 months salary slips, 6 months bank statements, and address proof. Self-employed individuals require 2 years ITR with computation, GST certificate (if applicable), and 6 months business bank statements.",
          link: "/used-car-loan",
          linkText: "Check Loan Eligibility"
        },
        {
          q: "What is the maximum loan tenure available?",
          a: "Loan tenures range from 12 months (1 year) up to 84 months (7 years) depending on the vehicle's manufacturing year and your credit profile."
        },
        {
          q: "Can I pre-close or make part-payments on my car loan?",
          a: "Yes, all our lending partners allow foreclosure and part-prepayment options as per standard banking terms and conditions after a minimum lock-in period (typically 6 months)."
        }
      ]
    },
    {
      id: 'DOCS',
      tab: 'Documentation & RC Transfer',
      title: 'Documentation, RC Transfer & Legal Process',
      icon: FileText,
      items: [
        {
          q: "How does Selectt handle the RC transfer?",
          a: "We manage the entire RC transfer process for free. Our dedicated RTO operations team handles all documentation, submission to the respective RTO, and tracking until the new Registration Certificate is issued to the buyer.",
          link: "/sell-car-in-mumbai",
          linkText: "Learn About RTO Support"
        },
        {
          q: "How long does the RC transfer process take?",
          a: "RC transfer usually takes between 60 to 90 days depending on the state and local RTO jurisdiction. You can track live milestone updates directly in your Selectt user dashboard.",
          link: "/profile",
          linkText: "Track RC Status"
        },
        {
          q: "Are there any hidden charges for RC transfer?",
          a: "No. All basic RTO documentation and transfer management fees are covered transparently when you buy or sell with Selectt."
        },
        {
          q: "What happens if my car has an existing bank loan or hypothecation?",
          a: "Selectt coordinates directly with your lending bank to clear the outstanding loan balance, obtains the Form 35 NOC, and transfers the remaining surplus balance directly into your bank account."
        },
        {
          q: "What should I do about my existing FASTag and insurance?",
          a: "You can close or transfer your existing FASTag through your issuer app. For insurance, you can either transfer your NCB (No Claim Bonus) to your next car or surrender the policy for a pro-rata refund upon sale."
        }
      ]
    },
    {
      id: 'INSPECTION',
      tab: '200-Point Inspection',
      title: '200-Point Inspection & Buyer Guarantees',
      icon: ShieldCheck,
      items: [
        {
          q: "What checkpoints are covered in the 200-point inspection?",
          a: "Our certified automotive engineers inspect 5 major categories: 1) Engine & Transmission (compression, leaks, mounts), 2) Suspension & Steering (bushings, shock absorbers, tie rods), 3) Electricals & OBD-II Diagnostics (alternator, battery health, ECUs), 4) Exterior Body & Paint Depth (repainting check, panel gaps, structural aprons), and 5) Legal VAHAN verification.",
          link: "/selectt-inspection-process",
          linkText: "View Full 200-Point Checklist"
        },
        {
          q: "What is the ₹50,000 Zero Hidden Damages Promise?",
          a: "If our evaluators missed an undisclosed structural or mechanical defect during our inspection, Selectt will repair the issue for free or reimburse repair costs up to ₹50,000 under our trust guarantee.",
          link: "/selectt-inspection-process",
          linkText: "Read Assurance Details"
        },
        {
          q: "What is covered under the 1-year warranty?",
          a: "Our comprehensive 1-year warranty covers critical, high-cost components including the engine block, cylinder head, manual/automatic gearbox assembly, steering rack, and air conditioning compressor.",
          link: "/selectt-inspection-process",
          linkText: "Check Warranty Coverage"
        },
        {
          q: "Can I see the inspection report before booking a car?",
          a: "Yes! Every single car listed on Selectt comes with an interactive, digital 200-point inspection report complete with high-resolution photos, tyre tread depth gauges, and OBD diagnostic summaries."
        }
      ]
    }
  ];

  // Flattened Q&A list for schema and full-text search
  const allFaqs = useMemo(() => allCategories.flatMap(cat => cat.items), [allCategories]);

  // Schema.org FAQPage JSON-LD
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

  const displayedCategories = useMemo(() => {
    if (!searchQuery.trim()) return currentCategories;
    const query = searchQuery.toLowerCase();
    return currentCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0);
  }, [currentCategories, searchQuery]);

  return (
    <>
      <PageMeta
        title="Frequently Asked Questions About Buying & Selling Used Cars | Selectt"
        description="Find clear answers on how to buy, sell, inspect, finance, and transfer RC for used cars with Selectt. 100% transparent, certified used car ecosystem."
        canonical="https://selectt.in/faq"
        schema={faqSchema}
      />
      <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero Knowledge Hub Header */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#00C9AF]/10 border border-[#00C9AF]/30 text-[#008f7d] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  <HelpCircle size={14} className="text-[#00a892]" /> Selectt Knowledge & Help Hub
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-[#0C1B33] tracking-tight leading-tight">
                  Frequently Asked Questions About Buying & Selling Used Cars
                </h1>
                <p className="text-slate-600 font-medium text-sm sm:text-base mt-3 leading-relaxed">
                  Everything you need to know about certified pre-owned cars, 200-point inspection guarantees, instant valuation, used car loans, and 100% free RC transfer.
                </p>

                {/* Quick Trust Highlights */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-5 pt-5 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 size={16} className="text-[#00C9AF]" /> 200-Point Inspected
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 size={16} className="text-[#00C9AF]" /> 5-Day Money-Back Guarantee
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 size={16} className="text-[#00C9AF]" /> Seller Protection Policy
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 size={16} className="text-[#00C9AF]" /> Free RC Transfer
                  </div>
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="w-full lg:max-w-md bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Answers</span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search e.g. RC transfer, warranty, loan, inspection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C9AF] focus:border-[#00C9AF] text-xs sm:text-sm shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Popular: <button onClick={() => setSearchQuery('warranty')} className="text-[#00a892] hover:underline">Warranty</button>, <button onClick={() => setSearchQuery('RC transfer')} className="text-[#00a892] hover:underline">RC Transfer</button>, <button onClick={() => setSearchQuery('loan')} className="text-[#00a892] hover:underline">EMI</button></span>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAll(true)} className="text-[#00a892] hover:underline">Expand All</button>
                    <span>•</span>
                    <button onClick={() => toggleAll(false)} className="text-slate-500 hover:underline">Collapse</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Category Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'ALL', label: 'All Topics', count: allFaqs.length },
              { id: 'BUY', label: 'Buying Used Cars', count: allCategories[0].items.length },
              { id: 'SELL', label: 'Selling Your Car', count: allCategories[1].items.length },
              { id: 'LOAN', label: 'Financing & EMI', count: allCategories[2].items.length },
              { id: 'DOCS', label: 'RC Transfer & Docs', count: allCategories[3].items.length },
              { id: 'INSPECTION', label: '200-Point Inspection', count: allCategories[4].items.length }
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00C9AF] text-[#0C1B33] shadow-sm font-black'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-[#0C1B33] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category FAQ Sections */}
          <div className="space-y-8">
            {displayedCategories.length > 0 ? (
              displayedCategories.map(cat => {
                const IconComponent = cat.icon || Sparkles;
                return (
                  <div key={cat.id} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs">
                    
                    {/* Category Title Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#00C9AF]/15 text-[#008f7d] flex items-center justify-center font-bold">
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-slate-900">{cat.title}</h2>
                          <span className="text-xs text-slate-400 font-medium">{cat.items.length} Questions Answered</span>
                        </div>
                      </div>
                    </div>

                    {/* FAQ Items Accordion / Card List */}
                    <div className="space-y-4">
                      {cat.items.map((item, idx) => {
                        const itemKey = `${cat.id}-${idx}`;
                        const isOpen = openItems[itemKey] !== false; // open by default unless explicitly collapsed

                        return (
                          <div
                            key={idx}
                            className={`border rounded-2xl transition-all ${
                              isOpen
                                ? 'bg-slate-50/60 border-slate-200'
                                : 'bg-white border-slate-200/70 hover:border-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAccordion(itemKey)}
                              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#00C9AF]/20 text-[#008f7d] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                  Q
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {item.q}
                                </h3>
                              </div>
                              <span className="text-slate-400 shrink-0">
                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed font-normal border-t border-slate-100/80">
                                <p className="pl-8">{item.a}</p>

                                {item.link && (
                                  <div className="pt-3 mt-3 pl-8">
                                    <Link
                                      to={item.link}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00a892] hover:text-[#0C1B33] transition-colors"
                                    >
                                      {item.linkText || 'Learn more'} <ArrowRight size={13} />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={22} />
                </div>
                <p className="text-slate-800 font-bold text-base">No questions found matching "{searchQuery}"</p>
                <p className="text-slate-500 text-xs mt-1">Try searching for other terms like 'loan', 'RC transfer', or 'inspection'</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 bg-[#00C9AF] text-[#0C1B33] text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#00b29c] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Quick Help & Direct Support CTA */}
          <div className="mt-12 bg-gradient-to-r from-[#0C1B33] via-[#112444] to-[#0C1B33] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00C9AF] bg-[#00C9AF]/15 px-3 py-1 rounded-full mb-2">
                <Clock size={12} /> Available 7 Days a Week
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Have a specific question not listed here?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Whether you want to sell your car, book a doorstep test drive, check used car loan eligibility, or verify RC status, our automotive specialists are ready to help.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-2 bg-white text-[#0C1B33] hover:bg-slate-100 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                <PhoneCall size={14} /> Contact Support
              </Link>
              <Link
                to="/sell-car-in-mumbai"
                className="inline-flex items-center gap-2 bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00b29c] text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                <Sparkles size={14} /> Instant Car Valuation
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FAQPage;

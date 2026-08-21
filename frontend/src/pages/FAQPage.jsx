import React, { useState, useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';

const FAQPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('SELL'); // 'SELL' | 'BUY'
  const [searchQuery, setSearchQuery] = useState('');

  // Categories & FAQ Data
  const faqData = {
    SELL: [
      {
        id: 'booking',
        title: 'Booking an Appointment',
        items: [
          { q: 'What if my city is listed, but my locality isn’t serviceable for home inspection?', a: 'If a home inspection isn’t available in your locality, you can still sell your car by visiting a nearby Selectt hub. The selling experience and pricing process remain the same, only the inspection location changes.' },
          { q: 'I cannot find my car’s registration state while booking the appointment online.', a: 'This may just happen because we are not currently present in your state. However, we are expanding at a rapid pace and plan to launch the used car buying service in many more cities pan India, very soon.' },
          { q: 'Can I choose a different inspection location after booking?', a: 'No. To get the inspection location changed, you will have to cancel your existing inspection and book a new one from the dashboard or contact support.' }
        ]
      },
      {
        id: 'branch',
        title: 'Branch Visit',
        items: [
          { q: 'What documents do I need to bring to the branch?', a: 'You need to bring the original RC, Insurance Policy, Government ID Proof (Aadhaar/PAN), and both keys of the car.' },
          { q: 'How long does the branch inspection process take?', a: 'The physical inspection along with road testing takes approximately 45 to 60 minutes.' }
        ]
      },
      {
        id: 'price',
        title: 'Selectt Best Price',
        items: [
          { q: 'How do you determine the best price for my car?', a: 'We use our proprietary pricing engine combined with a detailed 200-point inspection and real-time market auction bids to guarantee the best price.' },
          { q: 'Is the online valuation final?', a: 'The online valuation is an estimate. The final offer is provided only after the physical inspection of the car.' }
        ]
      },
      {
        id: 'protection',
        title: 'Seller Protection & Kavach',
        items: [
          { q: 'What is Seller protection?', a: 'Once you sell the car to us, we take full responsibility of the RC transfer and cover you from any liabilities until the ownership is officially transferred.' }
        ]
      },
      {
        id: 'post-sales',
        title: 'Post-Sales Support',
        items: [
          { q: 'How long does the RC transfer take?', a: 'The RC transfer typically takes 60 to 90 days depending on the RTO and buyer location. You can track the status live on your profile.' },
          { q: 'What happens to my active insurance policy after selling?', a: 'You can choose to transfer the insurance policy to the new buyer or cancel it to claim a refund of the premium for the remaining period.' }
        ]
      }
    ],
    BUY: [
      {
        id: 'testdrive',
        title: 'Booking a Test Drive',
        items: [
          { q: 'Is the test drive free?', a: 'Yes, we offer free test drives of any Selectt Assured car at our nearest hub. Home test drives are also available in select locations for a nominal refundable fee.' },
          { q: 'Can I test drive multiple cars?', a: 'Absolutely. You can shortlist multiple cars and test drive them at our hub to find the perfect fit.' }
        ]
      },
      {
        id: 'refund',
        title: 'Refund & Return Policy',
        items: [
          { q: 'What is the 5-day money-back guarantee?', a: 'If you buy a car from us and are not satisfied with it, you can return it within 5 days or 250 kms for a full refund, no questions asked.' }
        ]
      },
      {
        id: 'inspection',
        title: 'Vehicle Inspection & Quality',
        items: [
          { q: 'How detailed is the 200-point inspection?', a: 'Every car goes through a rigorous inspection covering engine, transmission, suspension, brakes, electricals, structure, and cosmetics. We do not sell cars with structural damage.' }
        ]
      },
      {
        id: 'finance',
        title: 'Financing & Loans',
        items: [
          { q: 'Can I get a loan with 0 down payment?', a: 'Yes, depending on your CIBIL score and eligibility, our partner banks offer 100% on-road funding options.' },
          { q: 'What is the processing time for loan approval?', a: 'We offer instant digital approvals with document verification completing within 24 to 48 working hours.' }
        ]
      }
    ]
  };

  const categories = faqData[activeTab];
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  // If active category is not found in the current tab's categories, reset it to the first category of that tab
  useEffect(() => {
    const exists = categories.some(cat => cat.id === activeCategory);
    if (!exists && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [activeTab, categories, activeCategory]);

  const selectedCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  // Search logic: Search through all categories of the active tab
  const getFilteredItems = () => {
    if (!searchQuery.trim()) {
      return selectedCategory.items;
    }
    const query = searchQuery.toLowerCase();
    const matches = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)) {
          matches.push(item);
        }
      });
    });
    return matches;
  };

  const filteredItems = getFilteredItems();

  return (
    <>
      <PageMeta title="FAQs - Frequently Asked Questions | Selectt" description="Find answers to common questions about buying, selling, inspections, financing, and paperwork." />
      <div className="min-h-screen bg-white font-sans pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-[#0C1B33] tracking-tight">FAQs</h1>
              <div className="w-10 h-1 bg-[#00C8AE] mt-2 rounded"></div>
              <p className="text-slate-400 font-medium text-[15px] mt-3">Search topics to find help you need</p>
            </div>

            <div className="w-full md:max-w-xl relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border border-[#E2E8F0] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C9AF] focus:border-[#00C9AF] text-[15px] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Navigation & Tabs */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Tab Selector */}
              <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
                <button
                  onClick={() => { setActiveTab('SELL'); setSearchQuery(''); }}
                  className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'SELL'
                      ? 'bg-[#00C8AE] text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Sell Car
                </button>
                <button
                  onClick={() => { setActiveTab('BUY'); setSearchQuery(''); }}
                  className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'BUY'
                      ? 'bg-[#00C8AE] text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Buy Car
                </button>
              </div>

              {/* Sidebar Menu */}
              {!searchQuery && (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex flex-col divide-y divide-[#E2E8F0]">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-6 py-4 text-[14px] font-bold transition-all ${activeCategory === cat.id
                            ? 'bg-[#F1F5F9] text-[#0C1B33]'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Q&A Content */}
            <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-sm min-h-[500px]">

              {/* Category Divider Header */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[#E2E8F0]"></div>
                </div>
                <div className="relative px-6 bg-white">
                  <span className="text-[12px] font-semibold tracking-wider text-slate-350 uppercase">
                    {searchQuery ? 'Search Results' : selectedCategory.title}
                  </span>
                </div>
              </div>

              {/* Q&A Items */}
              <div className="space-y-12 mt-10">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-start text-left">
                      <h2 className="text-xl md:text-2xl font-bold text-[#0C1B33] leading-snug">
                        {item.q}
                      </h2>
                      <div className="w-12 h-1 bg-[#00C8AE] mt-3 rounded"></div>
                      <p className="text-slate-500 text-[15px] md:text-[16px] leading-relaxed mt-5 font-normal">
                        {item.a}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <svg className="w-16 h-16 text-slate-350 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800">No results found</h3>
                    <p className="text-slate-400 text-sm mt-1">Try searching with different keywords</p>
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

export default FAQPage;

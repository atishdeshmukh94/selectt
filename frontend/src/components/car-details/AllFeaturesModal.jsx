import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, ShieldCheck, Sparkles } from 'lucide-react';

const AllFeaturesModal = ({ isOpen, onClose, sections = [], car = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset search and tab on modal open
      setSearchQuery('');
      setActiveCategory('ALL');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate total feature count across all sections
  const totalCount = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (sec.features?.length || 0), 0);
  }, [sections]);

  // Filter sections by selected category and search query
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sections
      .filter((section) => {
        if (activeCategory === 'ALL') return true;
        return section.title === activeCategory;
      })
      .map((section) => {
        const matchingFeatures = (section.features || []).filter((feat) => {
          if (!query) return true;
          return feat.toLowerCase().includes(query);
        });

        return {
          ...section,
          features: matchingFeatures,
        };
      })
      .filter((section) => section.features.length > 0);
  }, [sections, activeCategory, searchQuery]);

  const matchingCount = useMemo(() => {
    return filteredSections.reduce((acc, sec) => acc + sec.features.length, 0);
  }, [filteredSections]);

  if (!isOpen) return null;

  const carTitle = car
    ? `${car.year ? car.year + ' ' : ''}${car.brand || ''} ${car.model || ''} ${car.variant || ''}`.trim()
    : 'Vehicle';

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0C1B33] hover:text-white active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-sm z-30"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Modal Header */}
        <div className="pt-5 px-5 sm:pt-6 sm:px-7 pb-4 bg-white border-b border-slate-100 shrink-0 pr-16">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#00C9AF]/15 text-[#00A38D]">
              <Sparkles size={12} strokeWidth={2.5} />
              SELECTT VERIFIED FEATURES
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0C1B33] font-heading mt-1 mb-1 tracking-tight">
            All Features & Equipment
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            {carTitle} • <strong className="text-slate-800 font-bold">{totalCount} Total Features</strong>
          </p>

          {/* Search Bar */}
          <div className="mt-3.5 relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features (e.g. Sunroof, Camera, Airbags...)"
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C9AF] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-[#0C1B33] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            {sections.map((sec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCategory(sec.title)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === sec.title
                    ? 'bg-[#0C1B33] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec.title} ({sec.features.length})
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar bg-slate-50/50">
          {filteredSections.length > 0 ? (
            filteredSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                    {sec.title}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    {sec.features.length} {sec.features.length === 1 ? 'feature' : 'features'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {sec.features.map((featureName, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-[#00C9AF]/60 hover:shadow-sm transition-all"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#00C9AF]/15 flex items-center justify-center text-[#00A38D] shrink-0 border border-[#00C9AF]/30">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                        {featureName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                No matching features found
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                We couldn't find any feature matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
                className="px-4 py-2 bg-[#0C1B33] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-7 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck size={16} className="text-[#00A38D] shrink-0" />
            <span className="hidden sm:inline">
              140+ Points Quality Check & Verified
            </span>
            <span className="sm:hidden font-medium">Verified by Selectt</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0C1B33] text-white hover:bg-[#00C9AF] hover:text-[#0C1B33] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllFeaturesModal;

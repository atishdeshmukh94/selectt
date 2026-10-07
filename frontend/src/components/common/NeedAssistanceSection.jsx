import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, User } from 'lucide-react';
import SectionReveal from '../animation/SectionReveal';
import StaggerGroup, { StaggerItem } from '../animation/StaggerGroup';

const NeedAssistanceSection = ({ className = '' }) => {
  return (
    <SectionReveal amount={0.3} className={`py-14 bg-white border-b border-slate-100 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-base md:text-lg font-heading font-black text-[#2D114C] mb-8">
          Need further assistance?
        </h3>
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Card 1: Call Us */}
          <StaggerItem>
            <a
              href="tel:+918591969394"
              className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl bg-[#0C1B33] border border-slate-200/80 shadow-sm hover:border-[#00C9AF] hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DFEEC] text-[#0C1B33] flex items-center justify-center shrink-0">
                <Phone size={16} className="fill-[#0C1B33]" />
              </div>
              <div>
                <span className="block text-[11px] font-subheading font-bold text-slate-400 uppercase tracking-wider">
                  Call us on
                </span>
                <span className="text-xs md:text-sm font-heading font-black text-[#ffffff]">
                  +91 85919 69394
                </span>
              </div>
            </a>
          </StaggerItem>

          {/* Card 2: See how Buying works */}
          <StaggerItem>
            <Link
              to="/how-it-works/buying"
              className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl bg-[#0C1B33] border border-slate-200/80 shadow-sm hover:border-[#00C9AF] hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DFEEC] text-[#0C1B33] flex items-center justify-center shrink-0">
                <User size={18} className="text-[#0C1B33]" />
              </div>
              <div>
                <span className="block text-[11px] font-subheading font-bold text-slate-400 uppercase tracking-wider">
                  Buying Guide
                </span>
                <span className="text-xs md:text-sm font-heading font-black text-[#ffffff] block">
                  See how Buying works
                </span>
              </div>
            </Link>
          </StaggerItem>

          {/* Card 3: See how Selling works */}
          <StaggerItem>
            <Link
              to="/how-it-works/selling"
              className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl bg-[#0C1B33] border border-slate-200/80 shadow-sm hover:border-[#00C9AF] hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DFEEC] text-[#0C1B33] flex items-center justify-center shrink-0">
                <User size={18} className="text-[#0C1B33]" />
              </div>
              <div>
                <span className="block text-[11px] font-subheading font-bold text-slate-400 uppercase tracking-wider">
                  Selling Guide
                </span>
                <span className="text-xs md:text-sm font-heading font-black text-[#ffffff] block">
                  See how Selling works
                </span>
              </div>
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </SectionReveal>
  );
};

export default NeedAssistanceSection;

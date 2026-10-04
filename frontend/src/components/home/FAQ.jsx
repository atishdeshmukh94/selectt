import React, { useState } from 'react';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "What does 'Selectt Certified' mean?",
    answer: "Every Selectt Certified car undergoes an uncompromising 200-point inspection covering engine compression, transmission, suspension, electrical systems, and structural pillars. Cars with flood damage or major accidental history are 100% rejected. All certified cars include a 1-year warranty and a 5-day money-back guarantee."
  },
  {
    question: "What is the 5-Day Money-Back Guarantee?",
    answer: "Drive your car for up to 5 days (or 250 kms). If you aren't completely satisfied for any reason, return it to Selectt for a 100% full refund with zero cancellation charges."
  },
  {
    question: "How long does it take to get paid when selling my car?",
    answer: "Selectt ensures you receive full payment via secure instant bank transfer (IMPS/NEFT) within 24 hours of accepting our final offer and signing vehicle handover documents."
  },
  {
    question: "What is the Selectt Seller Protection Guarantee?",
    answer: "From the moment you hand over your keys, Selectt assumes 100% legal responsibility for the vehicle, shielding you from any traffic e-challans, third-party accidents, or legal disputes until RC transfer is officially complete."
  },
  {
    question: "Do you provide used car loans and financing?",
    answer: "Yes! Selectt partners with leading banks (HDFC, ICICI, SBI, Axis, Kotak) to offer instant loan approvals, flexible tenures up to 7 years, and up to 100% on-road funding."
  },
  {
    question: "How does Selectt handle the RC transfer?",
    answer: "We manage the entire RC transfer process 100% free of charge. Our dedicated RTO operations team handles all paperwork, submission, and tracking until the updated RC is issued."
  }
];

const FAQ = ({ dark = true }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`pt-8 md:pt-14 pb-2 md:pb-4 px-4 backdrop-blur-md relative z-10 ${dark
      ? 'bg-[#050b14]/40 text-white'
      : 'bg-white text-[#0C1B33]'
      }`}>
      <div className="max-w-3xl mx-auto">

        <h2 className={`text-[28px] sm:text-[40px] font-heading font-semibold mb-8 flex items-center justify-center gap-5 w-full leading-[1.2] ${dark ? 'text-white' : 'text-[#0F172A]'
          }`}>
          <div className={`h-px flex-1 max-w-[80px] md:max-w-none ${dark ? 'bg-white/10' : 'bg-[#0F172A]/10'}`} />
          <span className="shrink-0 text-center font-heading">Frequently asked questions</span>
          <div className={`h-px flex-1 max-w-[80px] md:max-w-none ${dark ? 'bg-white/10' : 'bg-[#0F172A]/10'}`} />
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? dark
                    ? 'border-[#00C9AF] bg-[#162947]/40 shadow-[0_4px_20px_rgba(0,196,175,0.08)]'
                    : 'border-[#00C9AF] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                  : dark
                    ? 'border-white/10 hover:border-white/20 bg-[#162947]/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className={`w-full cursor-pointer flex items-center justify-between p-5 md:p-6 text-left font-heading font-semibold select-none transition-colors duration-200 outline-none ${isOpen
                    ? 'text-[#00C9AF]'
                    : dark
                      ? 'text-white hover:text-[#00C9AF]'
                      : 'text-[#0F172A] hover:text-[#00A38D]'
                    }`}
                >
                  <span className="text-[16px] sm:text-[17px] pr-4 leading-[1.45]">{faq.question}</span>
                  <ChevronDown className={`transition-transform duration-300 text-[#00C9AF] shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={18} />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen
                    ? `max-h-96 opacity-100 border-t ${dark ? 'border-white/5' : 'border-slate-100'}`
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className={`px-5 md:px-6 pb-5 md:pb-6 pt-4 text-[15px] sm:text-[16px] leading-[1.6] font-normal ${dark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                    }`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redesigned Premium FAQ Knowledge Hub CTA */}
        <div className="mt-5 sm:mt-6 text-center flex justify-center">
          <Link
            to="/faq"
            className={`group w-full sm:w-auto inline-flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl border transition-all duration-300 ${
              dark
                ? 'bg-gradient-to-r from-white/[0.04] via-white/[0.07] to-white/[0.04] border-white/10 hover:border-[#00C9AF]/50 hover:bg-white/[0.08] shadow-lg shadow-black/20'
                : 'bg-gradient-to-r from-slate-50 via-teal-50/30 to-white border-slate-200/90 hover:border-[#00C9AF]/60 hover:bg-white shadow-xs hover:shadow-md hover:shadow-[#00C9AF]/10'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5 text-left min-w-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs ${
                  dark
                    ? 'bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/30'
                    : 'bg-[#00C9AF]/15 text-[#00A38D] border border-[#00C9AF]/30'
                }`}
              >
                <HelpCircle size={18} className="sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[13.5px] sm:text-[15px] font-heading font-bold transition-colors ${
                      dark ? 'text-white group-hover:text-[#00C9AF]' : 'text-slate-900 group-hover:text-[#00A38D]'
                    }`}
                  >
                    View all FAQs & Knowledge Hub
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00C9AF]/15 text-[#008A79] tracking-wider shrink-0">
                    25+ Answers
                  </span>
                </div>
                <p className={`text-[11.5px] sm:text-[12.5px] truncate font-normal mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Instant answers on inspection, warranty, loans & RC transfer
                </p>
              </div>
            </div>

            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:translate-x-1 ${
                dark
                  ? 'bg-white/10 text-white group-hover:bg-[#00C9AF] group-hover:text-slate-950'
                  : 'bg-white text-slate-700 border border-slate-200 shadow-xs group-hover:bg-[#00C9AF] group-hover:text-slate-950 group-hover:border-[#00C9AF]'
              }`}
            >
              <ArrowRight size={14} className="sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQ;

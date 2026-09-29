import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
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
    <section className={`pt-10 pb-6 md:py-20 px-4 backdrop-blur-md relative z-10 ${dark
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

        {/* View All FAQs Link */}
        <div className="text-center mt-8">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#00C9AF] hover:text-[#00b29c] transition-colors leading-[1.45]"
          >
            <Sparkles size={14} /> View all frequently asked questions & knowledge hub <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQ;

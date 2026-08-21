import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is the Selectt Cars 5-day Money Back Guarantee?",
    answer: "If you don't love your car, return it within 5 days for a 100% refund. No questions asked. We ensure your total satisfaction with every purchase."
  },
  {
    question: "How do you verify the car's condition?",
    answer: "Every car undergoes a mandatory 200-point inspection covering engine, suspension, electronics, and bodywork."
  },
  {
    question: "Can I get a loan for a used car?",
    answer: "Yes, we have tie-ups with major banks to provide instant car loans with rates starting from 11.49%."
  },
  {
    question: "How long does the car selling process take?",
    answer: "You can sell your car in just 1 hour. Get a quote online, book an inspection, and get paid instantly."
  },
  {
    question: "What documents are needed to buy a car?",
    answer: "Standard KYC documents including ID proof, address proof, and bank statements (for loans) are required."
  },
  {
    question: "Is the RC transfer handled by Selectt Cars?",
    answer: "Yes, we take care of all the paperwork and RC transfer free of cost for all our customers."
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

        <h2 className={`text-2xl font-bold mb-8 flex items-center justify-center gap-5 w-full ${dark ? 'text-white' : 'text-[#0C1B33]'
          }`}>
          <div className={`h-px flex-1 max-w-[100px] md:max-w-none ${dark ? 'bg-white/10' : 'bg-[#0c1b33]/10'}`} />
          <span className="shrink-0 text-center font-heading">Frequently Asked Questions</span>
          <div className={`h-px flex-1 max-w-[100px] md:max-w-none ${dark ? 'bg-white/10' : 'bg-[#0c1b33]/10'}`} />
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? dark
                    ? 'border-[#00C9AF] bg-[#162947]/30 shadow-[0_4px_20px_rgba(0,196,175,0.05)]'
                    : 'border-[#00C9AF] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                  : dark
                    ? 'border-white/10 hover:border-white/20 bg-[#162947]/10'
                    : 'border-slate-200 bg-white hover:border-slate-350'
                  }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className={`w-full cursor-pointer flex items-center justify-between p-6 text-left font-bold select-none transition-colors duration-200 outline-none ${isOpen
                    ? 'text-[#00C9AF]'
                    : dark
                      ? 'text-white hover:text-[#00C9AF]'
                      : 'text-slate-600 hover:text-[#0A1C3A]'
                    }`}
                >
                  <span className="text-sm md:text-base pr-4 font-heading">{faq.question}</span>
                  <ChevronDown className={`transition-transform duration-300 text-[#00C9AF] ${isOpen ? 'rotate-180' : ''}`} size={18} />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen
                    ? `max-h-40 opacity-100 border-t ${dark ? 'border-white/5' : 'border-slate-100'}`
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className={`px-6 pb-6 pt-4 text-xs md:text-sm leading-relaxed font-medium ${dark ? 'text-slate-350' : 'text-slate-600'
                    }`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

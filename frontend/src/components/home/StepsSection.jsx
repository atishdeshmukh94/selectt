import React from 'react';

const steps = [
  {
    image: '/img/how-selectt-works1.png',
    title: 'Choose from the best pre-owned cars',
    description: '20,000+ fully inspected cars online'
  },
  {
    image: '/img/how-selectt-works2.png',
    title: 'Take a test drive at your home or a Selectt Hub',
    description: 'Sanitized cars for every test drive'
  },
  {
    image: '/img/how-selectt-works3.png',
    title: 'Online Payment. Doorstep Delivery.',
    description: 'And 5-day money back guarantee'
  }
];

const StepsSection = () => {
  return (
    <section className="pt-8 pb-16 md:pt-5 md:pb-20 px-4 bg-white dark:bg-background-dark">
      <div className="max-w-7xl mx-auto text-center mb-8">
        <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          You won't just love our cars, you'll love the way you buy them.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">


          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 group">
              {/* Illustration */}
              <div className="w-40 h-40 md:w-60 md:h-60 flex-shrink-0 relative">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Text */}
              <div className="flex-1 md:text-center">
                <h3 className="text-sm md:text-base font-bold text-[#0C1B33] mb-1 line-clamp-2">
                  {step.title}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Watch Button */}
        <div className="mt-20 text-center flex justify-center">
          <button className="flex items-center gap-3 bg-[#00C9AF] text-[#0A1C3A] px-8 md:px-20 py-4 rounded-2xl font-bold text-lg hover:bg-[#0C1B33] transition-all shadow-xl shadow-[#00C9AF]/20 group">
            <span>Watch how it works</span>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;


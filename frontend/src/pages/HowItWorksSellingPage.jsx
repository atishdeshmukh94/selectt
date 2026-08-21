import React, { useEffect } from 'react';
import { ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import PageTransition from '../components/animation/PageTransition';
import SectionReveal from '../components/animation/SectionReveal';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';

const HowItWorksSellingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta title="How It Works - Selling Your Car | Selectt" description="Selectt SellRight - The best price, simplest selling experience. 5 simple steps." />

      <PageTransition className="min-h-screen bg-slate-50 font-sans w-full overflow-x-hidden text-slate-700 relative">

        {/* ───────────── Hero Section ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 z-0"></div>

          <SectionReveal className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 text-[#00C9AF] font-bold shadow-sm backdrop-blur-md">
                <ShieldCheck size={18} className="text-[#00C9AF]" />
                Selectt SellRight
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-4 tracking-tight">
                The best price, simplest selling experience
              </h1>
              <p className="text-slate-300 font-body text-base md:text-lg font-medium max-w-xl mx-auto mb-8">
                Sell your car from the comfort of your home with instant payout and free RC transfer.
              </p>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 font-bold text-white text-sm md:text-base font-body">
                  <CheckCircle2 size={18} className="text-[#00C9AF]" /> Instant Bank Payout
                </div>
                <div className="flex items-center gap-2 font-bold text-white text-sm md:text-base font-body">
                  <CheckCircle2 size={18} className="text-[#00C9AF]" /> Free Doorstep Inspection
                </div>
              </div>
            </div>
          </SectionReveal>
        </section>

        {/* Sub-header banner */}
        <SectionReveal amount={0.3} className="py-12 bg-white text-center border-b border-slate-100 relative z-20">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-heading font-black text-[#0C1B33] mb-3">Selling never felt this good</h2>
            <p className="text-slate-500 font-body text-sm md:text-base font-medium leading-relaxed mb-6">
              Selectt SellRight gets you more value for your car. The process is far simpler and safer, as we directly communicate with registered sellers and buyers, an integral part of our end-to-end experience.
            </p>
            <Link
              to="/sell-car"
              className="inline-flex items-center gap-2 border-2 border-[#00C9AF] text-[#00C9AF] hover:bg-[#00C9AF] hover:text-white font-button font-extrabold py-2.5 px-8 rounded-full transition-all duration-300 text-xs tracking-wider uppercase active:scale-95 shadow-sm hover:shadow-md hover:shadow-purple-500/20"
            >
              Sell your car <ChevronRight size={14} />
            </Link>
          </div>
        </SectionReveal>

        {/* ───────────── 5 Serpentine Steps (Scroll Reveal) ───────────── */}
        <section className="py-20 bg-white relative overflow-hidden border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 relative">

            <div className="space-y-12 relative">

              {/* ── Step 1 (Scroll Reveal) ── */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
              >
                <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pl-[117px]">
                  <svg width="47" height="114" viewBox="0 0 47 114" fill="none" className="w-10 md:w-12 h-auto shrink-0 select-none pointer-events-none">
                    <path d="M16.5259 112.361V112.861H17.0259H45.7439H46.2439V112.361V1.63867V1.13867H45.7439H1.25586H0.755859V1.63867V26.0407V26.5407H1.25586H16.5259V112.361Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0C1B33] mb-2">
                      Let's talk about your car
                    </h3>
                    <p className="text-slate-500 font-body font-medium text-sm leading-relaxed">
                      Tell us more about your beloved and get an instant quote.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-start lg:-ml-12">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[260px] md:max-w-[300px]"
                  >
                    <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HowItWorks/assets/talk-about-car.svg?q=85&w=360&dpr=1.3" alt="Let's talk about your car" className="w-full h-auto object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/loan-eligibility.svg?q=85&w=360&dpr=1.3"; }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Dotted Line 1→2 */}
              <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
                <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterOddLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
              </div>

              {/* ── Step 2 (Scroll Reveal) ── */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
              >
                <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pr-[117px]">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0C1B33] mb-2">
                      The good quote
                    </h3>
                    <p className="text-slate-500 font-body font-medium text-sm leading-relaxed">
                      A prompt, accurate online quote with a final offer that does not go above or below 5 percent of this original quote. Perfect, we think.
                    </p>
                  </div>
                  <svg width="93" height="117" viewBox="0 0 93 117" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                    <path d="M92.2436 90.7045V90.2045H91.7436H56.8289L74.4878 73.8069L74.4888 73.8061C84.5009 64.4614 91.0816 54.7105 91.0816 40.5725C91.0816 26.1275 84.6915 17.5414 80.1451 12.995C75.0824 7.9322 65.331 1.39453 48.5836 1.39453C34.6845 1.39453 24.4276 5.92138 16.856 13.493C10.9672 19.3818 4.59333 29.9602 4.42563 44.5508L4.41981 45.0565H4.92559H34.6396H35.1183L35.1391 44.5783C35.2207 42.7026 35.5478 40.2058 36.182 37.7511C36.8178 35.2899 37.7507 32.9166 39.0191 31.2504C40.7633 29.0322 43.7783 26.9625 48.2516 26.9625C51.7645 26.9625 54.4516 28.3984 56.0156 30.1189C57.5903 31.851 58.3944 34.117 58.8005 36.1273C59.2054 38.1313 59.2056 39.8339 59.2056 40.4065C59.2056 47.3959 56.284 52.7724 53.309 57.4002L53.309 57.4001L53.3061 57.4048C48.0187 65.8315 40.5735 74.9343 30.6255 85.3797L2.57196 114.761L1.76488 115.607H2.93359H91.7436H92.2436V115.107V90.7045Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                  </svg>
                </div>
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-end lg:-mr-12">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[260px] md:max-w-[300px]"
                  >
                    <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HowItWorks/assets/good-quote.svg?q=85&w=360&dpr=1.3" alt="The good quote" className="w-full h-auto object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/upload-document.svg?q=85&w=360&dpr=1.3"; }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Dotted Line 2→3 */}
              <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
                <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterEvenLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
              </div>

              {/* ── Step 3 (Scroll Reveal) ── */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
              >
                <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pl-[117px]">
                  <svg width="91" height="118" viewBox="0 0 91 118" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                    <path d="M1.25586 76.0124H0.707189L0.758009 76.5588C2.09934 90.9781 8.97624 100.549 14.6952 105.764C24.4454 114.841 36.0383 117.35 46.7399 117.35C63.2995 117.35 74.0528 111.493 80.1274 105.418C84.8458 100.7 90.0679 92.7769 90.0679 80.8284C90.0679 74.4353 88.5517 69.0221 85.3336 64.2797L85.3295 64.2737C83.0857 61.0683 79.3126 56.941 73.0039 54.3621C76.5384 52.3538 78.8467 49.625 80.7099 46.2095C83.2487 41.639 84.0919 37.2359 84.0919 32.3564C84.0919 23.7477 80.5458 16.1532 74.9814 10.5889L74.9778 10.5853C66.5399 2.31613 55.4233 0.648438 47.0719 0.648438C36.3796 0.648438 25.7643 2.98795 17.4988 11.5884C12.4407 16.6482 7.23811 25.5577 6.56667 37.3079L6.53647 37.8364H7.06586H33.7919H34.2919V37.3364C34.2919 33.9486 35.5885 30.113 37.951 27.9021L37.9573 27.9021L37.9634 27.896C39.5107 26.3487 42.195 25.2204 45.5779 25.2204C48.6298 25.2204 51.6457 26.3494 53.3583 28.062C54.911 29.6147 56.1999 32.8006 56.1999 35.6764C56.1999 38.0361 55.2562 40.8808 52.7204 43.1006C50.506 44.9978 46.9989 46.6149 41.3326 45.8055L40.7619 45.7239V46.3004V65.7224V66.4162L41.42 66.1968C42.8455 65.7216 44.2814 65.5584 46.0759 65.5584C49.5116 65.5584 53.6887 66.3812 56.3808 68.5974C58.2765 70.1776 60.5159 73.3635 60.5159 78.0064C60.5159 81.2261 59.717 84.0878 57.3251 86.8009C55.2364 89.0486 51.8761 91.4504 46.4079 91.4504C41.705 91.4504 37.863 89.8294 35.4846 87.2925L35.4791 87.2866L35.4734 87.2809C32.9228 84.7302 31.2995 80.5423 31.1375 76.4925L31.1183 76.0124H30.6379H1.25586Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0C1B33] mb-2">
                      What's your car's worth?
                    </h3>
                    <p className="text-slate-500 font-body font-medium text-sm leading-relaxed">
                      Pick a day and we'll be there - at home or your workplace, for a free doorstep evaluation to validate your car's worth and make you a final offer. Easy.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-start lg:-ml-12">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[260px] md:max-w-[300px]"
                  >
                    <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HowItWorks/assets/car-worth.svg?q=85&w=360&dpr=1.3" alt="What's your car's worth?" className="w-full h-auto object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/loan-approval.svg?q=85&w=360&dpr=1.3"; }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Dotted Line 3→4 */}
              <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
                <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterOddLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
              </div>

              {/* ── Step 4 (Scroll Reveal) ── */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
              >
                <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pr-[117px]">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0C1B33] mb-2">
                      Credited, the same day.
                    </h3>
                    <p className="text-slate-500 font-body font-medium text-sm leading-relaxed">
                      Accept the final offer and get paid for your car on the very same day. We'll also get working on the paperwork – our responsibility – right away. You're welcome.
                    </p>
                  </div>
                  <svg width="96" height="113" viewBox="0 0 96 113" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                    <path d="M81.7981 1.13867V0.638672H81.2981H43.7821H43.4985L43.3529 0.882158L0.690931 72.2622L0.620117 72.3806V72.5187V90.9447V91.4447H1.12012H54.2381V111.861V112.361H54.7381H81.2981H81.7981V111.861V91.4447H94.7441H95.2441V90.9447V68.8667V68.3667H94.7441H81.7981V1.13867ZM54.2381 25.5811V68.3667H29.542L54.2381 25.5811Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                  </svg>
                </div>
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-end lg:-mr-12">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[260px] md:max-w-[300px]"
                  >
                    <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HowItWorks/assets/credited-same-day.svg?q=85&w=360&dpr=1.3" alt="Credited, the same day." className="w-full h-auto object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/home-delivery.svg?q=85&w=360&dpr=1.3"; }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Dotted Line 4→5 */}
              <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
                <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterEvenLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
              </div>

              {/* ── Step 5 (Scroll Reveal) ── */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
              >
                <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pl-[117px]">
                  <svg width="85" height="116" viewBox="0 0 85 116" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                    <path d="M76.2899 1.39453V0.894531H75.7899H18.1879H17.7622L17.6943 1.31479L8.06626 60.9088L7.91062 61.8722L8.78347 61.4357C14.6883 58.4833 21.2516 56.8405 28.9779 56.8405C30.7961 56.8405 34.2447 56.8823 37.9745 57.579C41.7127 58.2774 45.6761 59.6237 48.5657 62.1922L48.5657 62.1923L48.5704 62.1964C50.9761 64.2813 53.7099 68.136 53.7099 73.7705C53.7099 78.2867 51.9356 82.149 49.5302 84.7154C46.325 88.0797 41.1571 90.0365 35.4519 90.0365C30.0543 90.0365 23.9842 88.5618 19.0633 86.2654L19.0588 86.2634C17.2628 85.447 11.6684 82.651 5.90924 77.3855L5.22508 76.76L5.07818 77.6753L0.762177 104.567L0.709811 104.894L0.989453 105.07C10.0316 110.763 21.7437 115.107 38.6059 115.107C49.2733 115.107 63.0578 113.276 73.493 102.504C78.8826 96.9463 84.2579 87.8616 84.2579 74.4345C84.2579 61.5069 79.0496 52.9185 73.9883 47.8558C68.7507 42.4508 59.3272 36.7505 44.4159 36.7505C42.9782 36.7505 39.9114 36.9008 36.0556 37.4808L37.8693 26.2965H75.7899H76.2899V25.7965V1.39453Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0C1B33] mb-2">
                      Sit back, relax. Car in transit.
                    </h3>
                    <p className="text-slate-500 font-body font-medium text-sm leading-relaxed">
                      Your car is safe with us and you'll be informed as soon as the ownership papers get transferred to a new owner.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-start lg:-ml-12">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[260px] md:max-w-[300px]"
                  >
                    <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HowItWorks/assets/car-in-transit.svg?q=85&w=360&dpr=1.3" alt="Sit back, relax. Car in transit." className="w-full h-auto object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/home-delivery.svg?q=85&w=360&dpr=1.3"; }} />
                  </motion.div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ───────────── Need Further Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <section className="relative overflow-hidden mb-4">
          <FAQ dark={false} />
        </section>

      </PageTransition>
    </>
  );
};

export default HowItWorksSellingPage;

import React, { useEffect } from 'react';
import { Target, Users, ShieldCheck, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageMeta from '../components/common/PageMeta';
import PageTransition from '../components/animation/PageTransition';
import SectionReveal from '../components/animation/SectionReveal';
import StaggerGroup, { StaggerItem } from '../components/animation/StaggerGroup';
import StatCounter from '../components/animation/StatCounter';
import AnimatedButton from '../components/animation/AnimatedButton';
import { buttonMotionVariants } from '../utils/animationVariants';
import aboutUsMissionImg from '../assets/about-us-mission.png';

const AboutUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { target: 10000, suffix: "+", label: "Cars Sold" },
    { target: 50, suffix: "+", label: "Cities" },
    { target: 100000, suffix: "+", label: "Happy Customers" },
    { target: 200, suffix: "+", label: "Inspection Points" }
  ];

  return (
    <>
      <PageMeta title="About Us - India's Trusted Used Car Platform | Selectt" description="Learn about Selectt's mission, values, and journey in India's pre-owned car market." />
      
      <PageTransition className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden">
        {/* Premium Hero Section */}
        <section className="relative pt-24 pb-32 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-35 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <SectionReveal className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
            <motion.span 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[#00C9AF] font-bold tracking-widest uppercase text-sm mb-4 block"
            >
              Who We Are
            </motion.span>
            
            <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 leading-tight tracking-tight">
              Driven by Trust.<br />Fuelled by Transparency.
            </h1>
            
            <p className="text-slate-300 text-base md:text-xl max-w-2xl mx-auto font-body font-medium leading-relaxed">
              Selectt is revolutionizing the used car market in India by bringing radical transparency, rigorous quality checks, and a seamless digital-first experience to car buying and selling.
            </p>
          </SectionReveal>
        </section>

        {/* Stats Section with CountUp */}
        <SectionReveal amount={0.3} className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <StatCounter 
                  value={stat.target} 
                  suffix={stat.suffix} 
                  duration={1.5} 
                  className="text-3xl md:text-5xl font-price font-black text-[#00C9AF] mb-2 block" 
                />
                <div className="text-xs md:text-sm font-subheading font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Mission & Vision */}
        <SectionReveal amount={0.2} className="max-w-5xl mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 5 }}
                className="w-16 h-16 bg-[#00C9AF]/10 text-[#00C9AF] border border-[#00C9AF]/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm cursor-pointer transition-transform"
              >
                <Target size={32} />
              </motion.div>
              <h2 className="text-3xl font-heading font-black text-[#0C1B33] mb-4">Our Mission</h2>
              <p className="text-slate-600 font-body font-medium leading-relaxed mb-6">
                To build the most trusted and transparent platform for used cars, completely eliminating the anxiety and friction traditionally associated with the process. We believe everyone deserves a high-quality car without the haggling.
              </p>
              <ul className="space-y-3">
                {[
                  'Fixed Price Assurance',
                  '200-Point Inspection',
                  '5-Day Money Back Guarantee'
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    className="flex items-center gap-3 text-slate-700 font-subheading font-bold"
                  >
                    <ShieldCheck size={20} className="text-[#00C9AF] shrink-0" /> {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <img src={aboutUsMissionImg} alt="Selectt Mission & 200-Point Quality Inspection" className="object-contain w-full max-h-[440px] drop-shadow-2xl" loading="lazy" />
            </motion.div>
          </div>
        </SectionReveal>

        {/* Values Section */}
        <SectionReveal amount={0.25} className="bg-white border-t border-b border-slate-200/40 py-20 text-slate-800">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black uppercase text-[#00C9AF] tracking-widest block mb-2">Our Foundation</span>
              <h2 className="text-2xl md:text-4xl font-heading font-black text-[#0C1B33]">What Drives Us</h2>
              <p className="text-slate-500 font-body font-semibold text-xs md:text-sm mt-2 max-w-xl mx-auto">Core values that dictate every decision we make at Selectt.</p>
            </div>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <motion.div 
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-slate-50 border border-slate-200/60 p-7 rounded-2xl hover:border-[#00C9AF]/50 hover:shadow-xl transition-all relative overflow-hidden group text-left h-full flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00C9AF] opacity-0 group-hover:opacity-100 transition-all" />
                  <div>
                    <div className="w-12 h-12 bg-[#00C9AF]/10 text-[#00C9AF] rounded-xl flex items-center justify-center mb-5 border border-[#00C9AF]/15 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-base font-subheading font-extrabold text-[#0C1B33] mb-2">Absolute Transparency</h3>
                    <p className="text-slate-500 font-body font-normal text-xs leading-relaxed">We share every detail about our cars, good or bad. No hidden flaws, no hidden charges.</p>
                  </div>
                </motion.div>
              </StaggerItem>

              <StaggerItem>
                <motion.div 
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-slate-50 border border-slate-200/60 p-7 rounded-2xl hover:border-[#00C9AF]/50 hover:shadow-xl transition-all relative overflow-hidden group text-left h-full flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00C9AF] opacity-0 group-hover:opacity-100 transition-all" />
                  <div>
                    <div className="w-12 h-12 bg-[#00C9AF]/10 text-[#00C9AF] rounded-xl flex items-center justify-center mb-5 border border-[#00C9AF]/15 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <h3 className="text-base font-subheading font-extrabold text-[#0C1B33] mb-2">Customer First</h3>
                    <p className="text-slate-500 font-body font-normal text-xs leading-relaxed">From home test drives to hassle-free returns, we design our processes around your convenience.</p>
                  </div>
                </motion.div>
              </StaggerItem>

              <StaggerItem>
                <motion.div 
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-slate-50 border border-slate-200/60 p-7 rounded-2xl hover:border-[#00C9AF]/50 hover:shadow-xl transition-all relative overflow-hidden group text-left h-full flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00C9AF] opacity-0 group-hover:opacity-100 transition-all" />
                  <div>
                    <div className="w-12 h-12 bg-[#00C9AF]/10 text-[#00C9AF] rounded-xl flex items-center justify-center mb-5 border border-[#00C9AF]/15 group-hover:scale-110 transition-transform">
                      <Award size={24} />
                    </div>
                    <h3 className="text-base font-subheading font-extrabold text-[#0C1B33] mb-2">Uncompromising Quality</h3>
                    <p className="text-slate-500 font-body font-normal text-xs leading-relaxed">We reject more cars than we buy. Only the top tier make it through our rigorous inspection.</p>
                  </div>
                </motion.div>
              </StaggerItem>
            </StaggerGroup>
          </div>
        </SectionReveal>

        {/* CTA Section */}
        <SectionReveal amount={0.3} className="mt-24 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-[#0C1B33] mb-8 tracking-tight">Ready to experience the Selectt difference?</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link to="/buy-cars" className="w-full md:w-auto">
              <AnimatedButton variant="solid" className="w-full md:w-auto py-4 px-10 rounded-xl shadow-xl shadow-[#00C9AF]/15 font-button text-sm uppercase tracking-wide">
                BROWSE CARS <ChevronRight size={18} />
              </AnimatedButton>
            </Link>
            <Link to="/sell-car" className="w-full md:w-auto">
              <AnimatedButton variant="dark" className="w-full md:w-auto py-4 px-10 rounded-xl font-button text-sm uppercase tracking-wide">
                SELL CAR <ChevronRight size={18} />
              </AnimatedButton>
            </Link>
          </div>
        </SectionReveal>
      </PageTransition>
    </>
  );
};

export default AboutUsPage;



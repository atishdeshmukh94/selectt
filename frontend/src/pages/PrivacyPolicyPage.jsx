import React, { useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta
        title="Privacy Policy | Selectt"
        description="Read Selectt's privacy policy regarding user data collection, security, and usage."
      />
      <div className="min-h-screen bg-slate-50 text-[#0C1B33] font-sans pb-20 w-full overflow-x-hidden pt-0">
        {/* Dark Hero Banner Section */}
        <section className="relative pt-24 pb-16 w-full flex items-center justify-center overflow-hidden border-b border-slate-800/80 bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <span className="text-[#00C9AF] text-xs md:text-sm font-black uppercase tracking-[0.25em] mb-3 block">
              DATA PRIVACY & PROTECTION
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
              Privacy Policy
            </h1>
          </div>
        </section>

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 prose max-w-none text-slate-600">
            <p className="mb-4"><strong>Effective Date:</strong> February 2026</p>
            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">1. Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
            
            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">2. How We Use Information</h2>
            <p className="mb-4">We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request.</p>

            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">3. Sharing of Information</h2>
            <p className="mb-4">We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with our bank partners if you apply for a loan.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;

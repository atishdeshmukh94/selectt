import React, { useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';

const CookiePolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta title="Cookie Policy | Selectt" description="Understand how we use cookies and tracking technologies to optimize your experience on Selectt." />
      <div className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden pt-28">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-[#0C1B33] mb-8">Cookie Policy</h1>
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 prose max-w-none text-slate-600">
            <p className="mb-4"><strong>Effective Date:</strong> February 2026</p>
            
            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">1. What are Cookies?</h2>
            <p className="mb-4">Cookies are small text files stored on your computer or mobile device when you visit our website. They help us make the website function properly, analyze web traffic, and personalize your experience.</p>
            
            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies to remember your preferences (like your preferred city), keep you logged in to your account, and analyze user behavior to improve site performance and speed.</p>

            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required to enable core site functionalities like user login, wishlist saving, and applying for car loans.</li>
              <li><strong>Preference Cookies:</strong> Used to remember choices you make, such as selected location filters.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site by gathering anonymous usage statistics.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#0C1B33] mt-6 mb-2">4. Managing Your Cookie Preferences</h2>
            <p className="mb-4">You can disable or remove cookies in your browser settings. However, doing so may disable certain features on our site, such as keeping you logged in or saving your shortlisted cars.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;

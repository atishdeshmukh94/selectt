import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SitemapPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black text-[#0C1B33] mb-8">Sitemap</h1>
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600">

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-[#0C1B33] mb-4 border-b pb-2">Main Pages</h3>
              <ul className="space-y-3 font-medium text-[#00C9AF]">
                <li><Link to="/" className="hover:underline">Home</Link></li>
                <li><Link to="/buy-cars" className="hover:underline">Buy Cars</Link></li>
                <li><Link to="/sell-car" className="hover:underline">Sell Car</Link></li>
                <li><Link to="/about-us" className="hover:underline">About Us</Link></li>
                <li><Link to="/contact-us" className="hover:underline">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0C1B33] mb-4 border-b pb-2">Guides & Processes</h3>
              <ul className="space-y-3 font-medium text-[#00C9AF]">
                <li><Link to="/how-it-works/buying" className="hover:underline">How Buying Works</Link></li>
                <li><Link to="/how-it-works/selling" className="hover:underline">How Selling Works</Link></li>
                <li><Link to="/used-car-loan" className="hover:underline">Used Car Loan</Link></li>
                <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
                <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SitemapPage;

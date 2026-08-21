import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';

export default function SelecttPartnersPage() {
  const [formData, setFormData] = useState({
    mobile: '',
    firstName: '',
    lastName: '',
    state: '',
    city: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageMeta title="Selectt Partners - Drive Your Business Ahead | Selectt" description="Join India's largest network of trusted used car dealers. Access 20,000+ verified cars monthly with transparent bidding." />

      <div className="min-h-screen bg-slate-50 font-sans w-full overflow-x-hidden text-slate-700 relative">

        {/* ───────────── Hero Section with Registration Form ───────────── */}
        <section className="relative pt-12 pb-24 bg-[#0C1B33] border-b border-slate-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 z-0"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-left text-white space-y-6">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md">
                <ShieldCheck size={16} /> Selectt Partners
              </span>
              <h1 className="text-4xl md:text-6xl font-black leading-tight text-white">
                Hello, Partner
              </h1>
              <p className="text-slate-300 text-lg md:text-xl font-bold">
                Drive your business ahead with trusted cars
              </p>

              {/* Hero Car Showcase Graphic */}
              <div className="pt-6">
                <img
                  src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/SpinnyPartners/assets/spinny-partners-hero-cars.png?q=85&w=720&dpr=1.3"
                  alt="Selectt Partners Cars"
                  className="w-full h-auto max-w-lg object-contain"
                  onError={(e) => { e.currentTarget.src = "https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/loan-eligibility.svg?q=85&w=360&dpr=1.3"; }}
                />
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-left border border-slate-100">
                <h3 className="text-xl font-black text-[#0C1B33] mb-2 text-center">Enter your details to join our network</h3>
                
                {submitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">Our key account manager will get in touch with you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Enter your mobile number"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0C1B33] focus:border-[#00C9AF] focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0C1B33] focus:border-[#00C9AF] focus:outline-none bg-slate-50"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0C1B33] focus:border-[#00C9AF] focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Select state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0C1B33] focus:border-[#00C9AF] focus:outline-none bg-slate-50"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Select city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0C1B33] focus:border-[#00C9AF] focus:outline-none bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#00C9AF] hover:bg-[#00e9ca] text-[#0C1B33] font-extrabold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
                    >
                      Register Now
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ───────────── Why Partner with Us (Grid of 6 Cards) ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-4xl font-black text-[#0C1B33] mb-3">Why Partner with Us</h2>
            <p className="text-slate-500 text-sm font-medium mb-14 max-w-2xl mx-auto">
              Transparency, trust and experience lie at the heart of every deal on Selectt Partners so that our partners can make an informed and worry-free purchase.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">20,000+ Cars Available For Sale Every Month</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Constant supply of certified used cars from across India.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Verified Inspection Reports</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Detailed 200-point inspection sheet available for every listed car.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Payment After Physical Inspection</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Inspect the car physically before making the complete payment.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Transparent Bidding Process</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Fair and competitive real-time auction bidding platform.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Dedicated Key Account Manager Assistance</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Personal manager assigned to help you select and purchase inventory.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-left hover:border-[#00C9AF]/50 hover:shadow-md transition-all">
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Hassle Free Delivery And Payment</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Complete digital documentation, RC transfer and door-step transport.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Trusted by dealers across the nation! ───────────── */}
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-black text-[#0C1B33] mb-3">Trusted by dealers across the nation!</h2>
            <p className="text-slate-500 text-sm font-medium mb-12">Don't just take our word for it. Hear it from our satisfied partners:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
                <p className="text-slate-600 text-xs font-semibold leading-relaxed italic">
                  "Getting a car through Selectt Partners is extremely convenient. Registration is simple and they have a wide assortment of cars on the platform."
                </p>
                <div>
                  <strong className="block text-sm font-extrabold text-[#0C1B33]">Imran Baba</strong>
                  <span className="text-xs text-[#00C9AF] font-bold">Sri Mookambika Cars, Bangalore</span>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
                <p className="text-slate-600 text-xs font-semibold leading-relaxed italic">
                  "I have been buying cars from Selectt Partners for the past 9 months. Unlike other platforms, they do a pre-delivery inspection to minimize mismatches."
                </p>
                <div>
                  <strong className="block text-sm font-extrabold text-[#0C1B33]">Murlidhar</strong>
                  <span className="text-xs text-[#00C9AF] font-bold">VCP Motors, Mumbai</span>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
                <p className="text-slate-600 text-xs font-semibold leading-relaxed italic">
                  "I recommend Selectt Partners to everyone who wants to buy cars for resale. I get cars at good prices and the process is very smooth."
                </p>
                <div>
                  <strong className="block text-sm font-extrabold text-[#0C1B33]">Lalit Chawla</strong>
                  <span className="text-xs text-[#00C9AF] font-bold">Chawla Motors, Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── How It Works (3 Steps) ───────────── */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-black text-[#0C1B33] mb-3">How It Works</h2>
            <p className="text-slate-500 text-sm font-medium mb-12">Our process is designed to make car-buying easy and convenient. Here's how it works:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0C1B33] text-[#00C9AF] font-extrabold flex items-center justify-center mx-auto mb-6 text-lg shadow-md">1</div>
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Place Your Bid</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Choose from our wide variety of quality cars and place your price bids.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0C1B33] text-[#00C9AF] font-extrabold flex items-center justify-center mx-auto mb-6 text-lg shadow-md">2</div>
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Close The Deal</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">We'll negotiate your offer with sellers and ensure you get your car at the best price.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0C1B33] text-[#00C9AF] font-extrabold flex items-center justify-center mx-auto mb-6 text-lg shadow-md">3</div>
                <h3 className="text-lg font-black text-[#0C1B33] mb-2">Payment & Delivery</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Pay online & get doorstep delivery of the car along with complete documentation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Need Further Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
}

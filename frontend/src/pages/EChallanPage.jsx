import React, { useState } from 'react';
import { Star, ShieldAlert, CheckCircle, Search, HelpCircle, ArrowRight, ShieldCheck, ChevronDown, Check } from 'lucide-react';

const MOCK_CHALLANS = [
  {
    id: 'ch1',
    challan_no: 'CH-8790-2026',
    violation: 'Overspeeding (Above 60 km/h in city limit)',
    date: '12 May 2026, 04:30 PM',
    location: 'Outer Ring Road, Bangalore',
    amount: 1000,
    status: 'Pending'
  },
  {
    id: 'ch2',
    challan_no: 'CH-1456-2026',
    violation: 'Signal Jumping / Red Light Breach',
    date: '08 Jun 2026, 11:15 AM',
    location: 'Koregaon Park Junction, Pune',
    amount: 500,
    status: 'Pending'
  }
];

const TESTIMONIALS = [
  {
    name: 'Lalitha Reddy',
    rating: 5,
    text: "Wife's car had a parking violation that came up during insurance renewal. Cleared same evening before she even knew about it.",
    date: '6 Jul 2026',
    location: 'Visakhapatnam'
  },
  {
    name: 'Rohit Bhatia',
    rating: 5,
    text: "Speed challan from near Karol Bagh. Paid on the Selectt app in just 2 minutes. NOC generated and sent on WhatsApp instantly.",
    date: '6 Jul 2026',
    location: 'Delhi'
  },
  {
    name: 'Kartik Shenoy',
    rating: 5,
    text: "Super convenient portal compared to government site loading times. Zero service fee is the best part!",
    date: '5 Jul 2026',
    location: 'Bangalore'
  },
  {
    name: 'Amit Malhotra',
    rating: 5,
    text: "Found out about an old speeding fine when selling my Swift. Paid here, got NOC instantly, and finished transaction.",
    date: '3 Jul 2026',
    location: 'Mumbai'
  },
  {
    name: 'Priyanka Sen',
    rating: 5,
    text: "Very fast and clean interface. Cleared a wrong parking fine with proof uploaded quickly. Best experience.",
    date: '20 Jun 2026',
    location: 'Kolkata'
  }
];

export default function EChallanPage() {
  const [vehicleNo, setVehicleNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [challans, setChallans] = useState([]);
  const [selectedChallans, setSelectedChallans] = useState([]);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState('selectt'); // selectt, parivahan, offline
  const [openFaq, setOpenFaq] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const maxIndex = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
    if (maxIndex <= 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [isMobile]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!vehicleNo.trim()) return;

    setLoading(true);
    setHasSearched(false);
    setPaymentSuccess(false);

    // Simulate VAHAN API fetch
    setTimeout(() => {
      setLoading(false);
      setHasSearched(true);
      // Give results for typical inputs, or mock challans if it has letters
      if (vehicleNo.trim().toLowerCase().includes('clean') || vehicleNo.trim().length < 8) {
        setChallans([]);
      } else {
        setChallans(MOCK_CHALLANS.map(c => ({ ...c, status: 'Pending' })));
        setSelectedChallans(MOCK_CHALLANS.map(c => c.id));
      }
    }, 1500);
  };

  const handleToggleSelect = (id) => {
    if (selectedChallans.includes(id)) {
      setSelectedChallans(selectedChallans.filter(cId => cId !== id));
    } else {
      setSelectedChallans([...selectedChallans, id]);
    }
  };

  const handlePayment = () => {
    if (selectedChallans.length === 0) return;
    setPaying(true);

    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setChallans(prev =>
        prev.map(c =>
          selectedChallans.includes(c.id) ? { ...c, status: 'Paid' } : c
        )
      );
      setSelectedChallans([]);
    }, 2000);
  };

  const totalAmount = challans
    .filter(c => selectedChallans.includes(c.id) && c.status === 'Pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingChallansCount = challans.filter(c => c.status === 'Pending').length;

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* Top Banner and Search Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-35 animate-pulse z-0"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Slogan */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/20 w-fit">
              <ShieldCheck size={12} /> Government Approved Partner
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Settle challans with zero service charge!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-semibold leading-relaxed">
              No hidden fees, just hassle-free challan payments. Directly integrated with Parivahan VAHAN database.
            </p>

            <div className="pt-2 hidden sm:flex items-center justify-center lg:justify-start gap-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00C9AF]" /> Safe Gateway</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00C9AF]" /> Instant Receipt</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00C9AF]" /> 24/7 Support</span>
            </div>
          </div>

          {/* Right Column: Check Card */}
          <div className="w-full max-w-md bg-white text-slate-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100/5 transition-all">
            <h3 className="text-lg font-black text-[#0C1B33] mb-4">Enter your Vehicle Number</h3>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2.5">
                {/* Prefix */}
                <div className="flex items-center justify-center gap-1.5 px-3.5 py-3 border border-slate-200 rounded-2xl bg-slate-50 font-black text-[#0C1B33] text-xs shrink-0 select-none">
                  <img src="https://flagcdn.com/w20/in.png" alt="IND" className="w-5 h-3.5 object-cover rounded-sm" />
                  <span>IND</span>
                </div>
                {/* Input */}
                <input
                  type="text"
                  placeholder="e.g. DL 12 CX 1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3.5 border border-slate-200 focus:border-[#00C9AF] rounded-2xl text-sm font-extrabold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00C9AF]/10 uppercase tracking-wider text-slate-850"
                  required
                />
              </div>

              <div className="flex items-start gap-2.5 text-[10px] text-slate-400 font-semibold leading-relaxed">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF]/30 mt-0.5" required id="agree" />
                <label htmlFor="agree" className="cursor-pointer select-none">
                  By clicking on check challan you agree to our <a href="/terms-conditions" className="text-[#00C9AF] font-bold hover:underline">Terms & Conditions</a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !vehicleNo.trim()}
                className="w-full py-4 bg-[#00C9AF] hover:bg-[#00b09a] text-[#0C1B33] font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#0C1B33] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={15} />
                )}
                {loading ? 'Fetching Details...' : 'Check Challan'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Verification Panel (Renders Search Results) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm animate-pulse">
            <div className="w-10 h-10 border-4 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-700">Connecting to VAHAN e-Challan Server...</h3>
            <p className="text-xs text-slate-400 mt-1">Retrieving active challan details associated with {vehicleNo}</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {challans.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#00C9AF] flex items-center justify-center border border-green-100">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">No active challans found!</h3>
                  <p className="text-slate-450 text-xs font-semibold mt-1">Vehicle {vehicleNo} is clean with zero outstanding challans in government records.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Challans List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-black text-slate-850 text-lg flex items-center gap-2">
                    <ShieldAlert className="text-amber-500" /> Outstanding Challans for {vehicleNo}
                  </h3>

                  {challans.map((ch) => {
                    const isSelected = selectedChallans.includes(ch.id);
                    const isPaid = ch.status === 'Paid';
                    return (
                      <div
                        key={ch.id}
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isPaid
                            ? 'border-green-200 bg-green-50/10'
                            : isSelected
                            ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Select Checkbox (if pending) */}
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(ch.id)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 cursor-pointer transition-all ${
                                isSelected ? 'bg-[#00C9AF] border-[#00C9AF] text-[#0C1B33]' : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={14} className="stroke-[3]" />}
                            </button>
                          )}
                          {isPaid && (
                            <div className="w-6 h-6 rounded-full bg-green-150 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle size={14} />
                            </div>
                          )}

                          <div className="space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-sm">{ch.challan_no}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-650 border-red-150'
                              }`}>
                                {ch.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-600 text-xs">{ch.violation}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {ch.date} <span className="mx-1 text-slate-200">|</span> {ch.location}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block font-black text-slate-800 text-base">₹{ch.amount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout Summary Card */}
                {pendingChallansCount > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-[#0C1B33] text-base border-b border-slate-100 pb-3">Payment Summary</h3>
                    
                    <div className="space-y-2.5 text-sm text-slate-500 font-semibold">
                      <div className="flex justify-between">
                        <span>Selected Challans</span>
                        <span className="font-extrabold text-slate-700">{selectedChallans.length}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-3 text-slate-800">
                        <span className="font-extrabold">Total Payable</span>
                        <span className="font-black text-lg text-slate-900">₹{totalAmount}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={selectedChallans.length === 0 || paying}
                      className="w-full py-3.5 bg-[#0C1B33] hover:bg-[#162a4d] text-white font-black uppercase tracking-wider text-xs rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      {paying ? 'Processing Payment...' : `Pay ₹${totalAmount} Now`}
                    </button>
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed text-center">
                      Payments are secure & processed via gateway directly linked with Parivahan.
                    </p>
                  </div>
                )}

                {/* Success Notification */}
                {paymentSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-green-800 text-left lg:col-span-3 mt-4 flex items-start gap-4">
                    <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={24} />
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-green-900">Payment Completed Successfully!</h4>
                      <p className="text-xs text-green-700 font-semibold leading-relaxed">
                        Your challan settlement request has been dispatched. The government records will update with the transaction reference ID <strong>TXN-{Math.floor(Math.random() * 90000) + 10000}</strong> in the next 15 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Info grids replicating pdf structure */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        
        {/* Speedup List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 items-center gap-10 text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#0C1B33] tracking-tight">Clearing your challans today can speed up:</h2>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C9AF]/10 text-[#00C9AF] flex items-center justify-center shrink-0 font-black">✓</div>
                <span className="font-bold text-slate-700 text-sm">Loan Approvals (Instant NOC clearances)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C9AF]/10 text-[#00C9AF] flex items-center justify-center shrink-0 font-black">✓</div>
                <span className="font-bold text-slate-700 text-sm">Insurance Renewal (Avoid premium penalty hikes)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C9AF]/10 text-[#00C9AF] flex items-center justify-center shrink-0 font-black">✓</div>
                <span className="font-bold text-slate-700 text-sm">Vehicle Resale (Clean registration transfer)</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            {/* Visual placeholder of approved documents */}
            <div className="w-64 h-48 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-6 text-center select-none shadow-inner">
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <ShieldCheck size={48} className="text-[#00C9AF] mb-3" />
              <h4 className="font-black text-[#0C1B33] text-sm">VAHAN Approved</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">NOC Clearance Generated Automatically</p>
            </div>
          </div>
        </div>

        {/* Customer Quotes */}
        <div className="space-y-6 overflow-hidden w-full relative">
          <h3 className="font-black text-[#0C1B33] text-xl text-left">See what our customers say</h3>
          <div className="overflow-hidden w-full py-2">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translate3d(-${isMobile ? activeIndex * 100 : activeIndex * 33.333}%, 0, 0)`
              }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="w-full md:w-1/3 px-3 shrink-0 text-left"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[170px] hover:border-slate-350 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-800 text-sm">{t.name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" className="stroke-none" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 font-semibold text-xs leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-4">{t.date} | {t.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-1.5 mt-2 select-none">
            {Array.from({ length: isMobile ? TESTIMONIALS.length : TESTIMONIALS.length - 2 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx ? 'bg-[#00C9AF] w-4' : 'bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Safety Tips */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-left">
          <h3 className="font-black text-[#0C1B33] text-lg mb-6">Quick safety tips to avoid challan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">⚠️</div>
              <h4 className="font-black text-[#0C1B33] text-sm">Seat Belts & Helmets</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Always wear seat belts and helmets, even for short trips around residential sectors.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">⚠️</div>
              <h4 className="font-black text-[#0C1B33] text-sm">Speed Limits</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Follow posted speed limits, especially near schools, flyover exits, and residential zones.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">⚠️</div>
              <h4 className="font-black text-[#0C1B33] text-sm">Digital Documents</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Keep your vehicle documents (PUC, Insurance, RC) updated digitally in mParivahan.</p>
            </div>
          </div>
        </div>

        {/* Guide Steps */}
        <div className="space-y-6">
          <h3 className="font-black text-[#0C1B33] text-xl text-left">How to Check & Pay Traffic Challan Online & Offline?</h3>
          
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl p-4 gap-6 justify-start">
            {['selectt', 'parivahan', 'offline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveInfoTab(tab)}
                className={`pb-2 text-xs font-black uppercase tracking-wider relative cursor-pointer ${
                  activeInfoTab === tab ? 'text-[#0C1B33]' : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                {tab === 'selectt' ? 'Selectt Portal' : tab === 'parivahan' ? 'Parivahan Site' : 'Offline Method'}
                {activeInfoTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C9AF] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-6 md:p-8 text-left space-y-4 shadow-sm min-h-[220px]">
            {activeInfoTab === 'selectt' && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Visit Selectt E-Challan Page</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  1. Go to the E-Challan section on our Selectt portal. Enter your vehicle registration number.<br />
                  2. Review the list of pulled active violations retrieved from the database.<br />
                  3. Select the challans you want to clear, click pay, and complete the settlement with zero service fees.
                </p>
              </div>
            )}
            {activeInfoTab === 'parivahan' && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Use the Official Parivahan website</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  1. Visit the Ministry of Road Transport and Highways (MoRTH) official portal: echallan.parivahan.gov.in.<br />
                  2. Input your vehicle number, license number, or challan number, and enter the verification captcha.<br />
                  3. Select the challan list, verify payment using net banking or gateway credentials, and save the generated PDF invoice.
                </p>
              </div>
            )}
            {activeInfoTab === 'offline' && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Offline Traffic Police Headquarters visit</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  1. Visit the nearest Traffic Police Station or regional Transport Office (RTO) with physical copies of your vehicle registration.<br />
                  2. Present your driving license, vehicle number details, and request officers to check pending fines.<br />
                  3. Settle payment in cash or card at the physical counter, and obtain a print receipt.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-left">
          <h3 className="font-black text-[#0C1B33] text-lg mb-6">Top 10 Latest Traffic Violations & Fines</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 font-bold uppercase text-slate-400">
                  <th className="pb-3 pr-4">Violation type</th>
                  <th className="pb-3 text-right">Challan Amount (Rs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                <tr><td className="py-3">Signal jumping / Red-light breach</td><td className="py-3 text-right">Rs. 1,000 – 5,000</td></tr>
                <tr><td className="py-3">Overspeeding</td><td className="py-3 text-right">Rs. 1,000 (LMV) / Rs. 2,000 (HMV)</td></tr>
                <tr><td className="py-3">Using mobile phone while driving</td><td className="py-3 text-right">Rs. 1,000 – 5,000</td></tr>
                <tr><td className="py-3">Driving without helmet/seatbelt</td><td className="py-3 text-right">Rs. 1,000</td></tr>
                <tr><td className="py-3">Driving without licence</td><td className="py-3 text-right">Rs. 5,000</td></tr>
                <tr><td className="py-3">Drunken driving / Intoxicated driving</td><td className="py-3 text-right">Rs. 10,000</td></tr>
                <tr><td className="py-3">Driving without valid insurance</td><td className="py-3 text-right">Rs. 2,000</td></tr>
                <tr><td className="py-3">Driving without valid PUC</td><td className="py-3 text-right">Rs. 10,000</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 text-left">
          <h3 className="font-black text-[#0C1B33] text-xl">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              {
                q: "Can I check and pay challan directly on Selectt?",
                a: "Yes! You can enter your vehicle number to check and pay any pending e-challans instantly with zero service charge through our secured gateways."
              },
              {
                q: "What is an e-challan?",
                a: "An e-challan is a digitally issued traffic fine receipt generated automatically when a traffic rule is violated. It is recorded against your vehicle registration details in the VAHAN database."
              },
              {
                q: "How long does it take for a traffic challan to appear online?",
                a: "Typically, it takes anywhere between 24 hours to 15 days for a challan to appear online on the Parivahan database, depending on RTO upload speeds."
              },
              {
                q: "Is it safe to share my vehicle information on Selectt?",
                a: "Absolutely. We employ bank-level encryption standards and conform to strict data privacy policies. Your registration details are solely used to query public RTO databases for active violations."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-[#0C1B33] text-left cursor-pointer hover:bg-slate-50/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-500 text-xs font-semibold leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

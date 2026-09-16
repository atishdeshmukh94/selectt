import React, { useState } from 'react';
import {
  Star,
  ShieldAlert,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Check,
  Zap,
  Landmark,
  Repeat,
  FileCheck,
  Shield,
  Gauge,
  FileText,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  Lock,
  Download
} from 'lucide-react';

const MOCK_CHALLANS = [
  {
    id: 'ch1',
    challan_no: 'CH-8790-2026',
    violation: 'Overspeeding (Exceeded 60 km/h in designated city corridor)',
    date: '12 May 2026, 04:30 PM',
    location: 'Outer Ring Road, Bengaluru',
    amount: 1000,
    status: 'Pending'
  },
  {
    id: 'ch2',
    challan_no: 'CH-1456-2026',
    violation: 'Signal Jumping / Red Light Stop Line Breach',
    date: '08 Jun 2026, 11:15 AM',
    location: 'Koregaon Park Junction, Pune',
    amount: 500,
    status: 'Pending'
  }
];

const TESTIMONIALS = [
  {
    name: 'Lalitha Reddy',
    role: 'Hyundai Creta Owner',
    initials: 'LR',
    rating: 5,
    text: "Had an unnoticed parking fine that showed up right before my policy renewal. Cleared it in under two minutes on Selectt without having to deal with the slow Parivahan gateway.",
    date: '6 Jul 2026',
    location: 'Visakhapatnam'
  },
  {
    name: 'Rohit Bhatia',
    role: 'Honda City Owner',
    initials: 'RB',
    rating: 5,
    text: "Speed camera challan from near Karol Bagh. The verification was instant, paid directly via UPI, and the receipt was delivered directly to my WhatsApp within minutes.",
    date: '6 Jul 2026',
    location: 'Delhi NCR'
  },
  {
    name: 'Kartik Shenoy',
    role: 'Kia Seltos Owner',
    initials: 'KS',
    rating: 5,
    text: "Remarkably fast compared to the standard government portal loading times. Zero service fee and instant clearance confirmation on VAHAN made this a breeze.",
    date: '5 Jul 2026',
    location: 'Bengaluru'
  },
  {
    name: 'Amit Malhotra',
    role: 'Maruti Suzuki Swift Owner',
    initials: 'AM',
    rating: 5,
    text: "Found an old outstanding violation while processing the resale of my car. Cleared it right on the spot and obtained the NOC instantaneously to close the deal.",
    date: '3 Jul 2026',
    location: 'Mumbai'
  },
  {
    name: 'Priyanka Sen',
    role: 'Tata Nexon EV Owner',
    initials: 'PS',
    rating: 5,
    text: "Very clean and dependable interface. No spam, no unnecessary steps. Highly recommended for any car owner who wants to keep their vehicle records 100% clean.",
    date: '20 Jun 2026',
    location: 'Kolkata'
  }
];

const TRAFFIC_FINES = [
  { violation: 'Signal jumping / Red-light breach', category: 'General', penalty: '₹1,000 – ₹5,000', law: 'Sec 184 MVA' },
  { violation: 'Overspeeding beyond designated speed limit', category: 'LMV / HMV', penalty: '₹1,000 (LMV) / ₹2,000 (HMV)', law: 'Sec 183 MVA' },
  { violation: 'Handheld mobile phone use while driving', category: 'General', penalty: '₹1,000 – ₹5,000', law: 'Sec 184(c) MVA' },
  { violation: 'Driving without wearing seat belt / helmet', category: 'Driver / Passenger', penalty: '₹1,000', law: 'Sec 194B MVA' },
  { violation: 'Driving without a valid Driving License', category: 'General', penalty: '₹5,000', law: 'Sec 181 MVA' },
  { violation: 'Drunken driving / Intoxicated driving', category: 'Severe Offense', penalty: '₹10,000 & Court Notice', law: 'Sec 185 MVA' },
  { violation: 'Driving vehicle without active Third-Party Insurance', category: 'Mandatory Cover', penalty: '₹2,000 (1st Offense)', law: 'Sec 196 MVA' },
  { violation: 'Driving without valid Pollution Certificate (PUC)', category: 'Environmental', penalty: '₹10,000', law: 'Sec 190(2) MVA' }
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

  const maxIndex = isMobile ? TESTIMONIALS.length - 1 : Math.max(0, TESTIMONIALS.length - 3);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

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
      if (vehicleNo.trim().toLowerCase().includes('clean') || vehicleNo.trim().length < 8) {
        setChallans([]);
      } else {
        setChallans(MOCK_CHALLANS.map(c => ({ ...c, status: 'Pending' })));
        setSelectedChallans(MOCK_CHALLANS.map(c => c.id));
      }
    }, 1400);
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
    }, 1800);
  };

  const totalAmount = challans
    .filter(c => selectedChallans.includes(c.id) && c.status === 'Pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingChallansCount = challans.filter(c => c.status === 'Pending').length;

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">
      
      {/* 1. Top Hero and Search Section (Preserved Original) */}
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
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00C9AF]" /> Safe Gateway</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00C9AF]" /> Instant Receipt</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00C9AF]" /> 24/7 Support</span>
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

      {/* 2. Interactive Verification Panel (Search Results & Checkout) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 border-3 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 text-base">Querying Parivahan VAHAN 4.0 Records</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Fetching active traffic violations for {vehicleNo}...</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            {challans.length === 0 ? (
              <div className="bg-white border border-emerald-200/80 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified VAHAN Status
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Active Challans Found</h3>
                  <p className="text-slate-500 text-xs font-medium mt-1 max-w-md mx-auto">
                    Vehicle <span className="font-semibold text-slate-800">{vehicleNo}</span> has zero pending traffic penalties or court notices.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Challans List */}
                <div className="lg:col-span-2 space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ShieldAlert className="text-amber-500" size={20} />
                      Pending Challans for {vehicleNo}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {pendingChallansCount} Unpaid Notice{pendingChallansCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {challans.map((ch) => {
                    const isSelected = selectedChallans.includes(ch.id);
                    const isPaid = ch.status === 'Paid';
                    return (
                      <div
                        key={ch.id}
                        className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isPaid
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : isSelected
                            ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Checkbox */}
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(ch.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                                isSelected ? 'bg-[#00C9AF] border-[#00C9AF] text-[#0C1B33]' : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={13} className="stroke-[3]" />}
                            </button>
                          )}
                          {isPaid && (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 size={13} />
                            </div>
                          )}

                          <div className="space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm tracking-tight">{ch.challan_no}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {ch.status}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-700 text-xs leading-snug">{ch.violation}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-0.5">
                              <span className="inline-flex items-center gap-1"><Clock size={11} className="text-slate-400" /> {ch.date}</span>
                              <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-slate-400" /> {ch.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:self-center shrink-0">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Fine</span>
                          <span className="font-extrabold text-slate-900 text-base">₹{ch.amount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout Summary Card */}
                {pendingChallansCount > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-[#0C1B33] text-base">Payment Summary</h3>
                      <p className="text-xs text-slate-400 font-medium">Clear selected dues instantly</p>
                    </div>
                    
                    <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between">
                        <span>Selected Violations</span>
                        <span className="font-bold text-slate-800">{selectedChallans.length} of {pendingChallansCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Convenience & Gateway Fee</span>
                        <span className="font-bold text-emerald-600 uppercase text-[11px]">₹0 (Free)</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-3 text-slate-900">
                        <span className="font-bold text-sm">Total Payable</span>
                        <span className="font-black text-lg text-[#0C1B33]">₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={selectedChallans.length === 0 || paying}
                      className="w-full py-3.5 bg-[#0C1B33] hover:bg-[#162a4d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Lock size={13} className="text-[#00C9AF]" />
                      )}
                      {paying ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} via UPI / Card`}
                    </button>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span>Direct 256-bit encrypted Parivahan settlement</span>
                    </div>
                  </div>
                )}

                {/* Success Notification */}
                {paymentSuccess && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-emerald-900 text-left lg:col-span-3 mt-2 flex items-start gap-3.5">
                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-emerald-950">Challan Settled Successfully!</h4>
                      <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                        Transaction reference <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">TXN-{Math.floor(Math.random() * 90000) + 10000}</code> has been transmitted. The government RTO database will update your clearance within 15 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Content Sections Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-14">
        
        {/* Why Clear Early Section */}
        <div className="space-y-6">
          <div className="text-center sm:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20">
              Why It Matters
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2.5">
              Why settle your e-challans early?
            </h2>
            <p className="text-slate-500 text-sm font-normal mt-1.5 leading-relaxed">
              Unresolved traffic penalties stay logged against your vehicle's registration certificate (RC) and impact critical ownership workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-4">
                <Landmark size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant Loan Approvals</h3>
              <p className="text-slate-500 text-xs font-normal mt-2 leading-relaxed">
                Banks and NBFCs run automated VAHAN background checks. Unpaid challans can delay loan disbursements and hypothecation approvals.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Smooth Insurance Renewal</h3>
              <p className="text-slate-500 text-xs font-normal mt-2 leading-relaxed">
                Avoid penalty surcharge loadings or policy issuance holds during your annual comprehensive motor insurance renewal cycle.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 mb-4">
                <Repeat size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Seamless Vehicle Resale</h3>
              <p className="text-slate-500 text-xs font-normal mt-2 leading-relaxed">
                RTO ownership transfer (Form 29/30) strictly requires an unconditional clean record with zero pending notices or court summons.
              </p>
            </div>
          </div>
        </div>

        {/* How to Pay Challan Guide with Modern Tabs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step-by-Step Guide</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                How to Check & Pay e-Challan
              </h2>
            </div>
            
            {/* Pill Switcher */}
            <div className="inline-flex bg-slate-100/90 p-1 rounded-xl gap-1 self-start sm:self-auto">
              {[
                { id: 'selectt', label: 'Selectt Portal' },
                { id: 'parivahan', label: 'Parivahan Site' },
                { id: 'offline', label: 'Traffic Police RTO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInfoTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeInfoTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Cards */}
          <div>
            {activeInfoTab === 'selectt' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Enter Vehicle Number</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Type your car or bike registration number in the search bar above to trigger instant VAHAN 4.0 sync.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Review Violations</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Examine camera proof, violation location, time, fine amount, and select the specific dues you want to clear.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Zero Fee Settlement</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Complete payment with 0% extra fee via UPI, Cards, or Net Banking. Instant digital clearance receipt generated.
                  </p>
                </div>
              </div>
            )}

            {activeInfoTab === 'parivahan' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Visit MoRTH Portal</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Open <code className="text-slate-700 bg-slate-200/70 px-1 py-0.5 rounded text-[11px]">echallan.parivahan.gov.in</code> on your web browser.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Enter Captcha & Details</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Input your vehicle number, engine/chassis number digits, and complete the visual captcha challenge.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Government Gateway</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Authenticate via the state Treasury payment gateway and download the formal MoRTH transaction PDF.
                  </p>
                </div>
              </div>
            )}

            {activeInfoTab === 'offline' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Visit Traffic Headquarters</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Visit your regional Traffic Police headquarters or local RTO dispute redressal helpdesk in person.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Present Vehicle RC</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Provide your physical RC smart card, driving license, and request the billing counter to print pending fines.
                  </p>
                </div>

                <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Counter Settlement</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Pay the fine over the physical counter via POS card machine or cash, and collect an official stamped paper receipt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fines Table Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Motor Vehicles Act Reference</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Standard Traffic Violations & Fine Schedule
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium self-start sm:self-auto bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-full">
              Updated as per MVA 2019 / 2024 Amendments
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/70 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Violation Type</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">MVA Clause</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 text-right">Standard Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {TRAFFIC_FINES.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.violation}
                      <span className="block sm:hidden text-[10px] text-slate-400 font-normal mt-0.5">{item.law}</span>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell text-slate-500 font-mono text-[11px]">
                      {item.law}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-slate-500">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {item.penalty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Tips Cards */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a892]">Best Practices</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Proactive Tips to Avoid Traffic Penalties
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
                <Gauge size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Observe Speed Corridors</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Automated speed enforcement cameras trigger instant notices. Monitor corridor speed boards on flyovers and ring roads.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Always Fasten Seat Belts</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  AI CCTV cameras identify front and rear passenger seatbelt compliance automatically at intersections.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 mt-0.5">
                <Smartphone size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">DigiLocker Verification</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Keep active digital copies of your RC, PUC, and Insurance in DigiLocker or mParivahan to avoid documentation fines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User Experiences</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Trusted by vehicle owners across India
              </h2>
            </div>
            
            {/* Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden w-full py-1">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translate3d(-${isMobile ? activeIndex * 100 : activeIndex * 33.333}%, 0, 0)`
              }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="w-full md:w-1/3 px-2.5 shrink-0 text-left"
                >
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full min-h-[220px] hover:border-slate-300 transition-all">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {t.initials}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-none">{t.name}</h4>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">{t.role}</span>
                          </div>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" className="stroke-none" />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-600 font-normal text-xs leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{t.location}</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 select-none pt-1">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx ? 'bg-[#00C9AF] w-5' : 'bg-slate-300 w-1.5'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-5 text-left">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Common Queries</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Can I check and pay any state traffic challan on Selectt?",
                a: "Yes. Our platform connects directly with the Ministry of Road Transport and Highways (MoRTH) Parivahan VAHAN database, covering all major states and municipal traffic police systems across India with 100% official payment clearance."
              },
              {
                q: "What is an e-challan and why was it issued?",
                a: "An e-challan is an electronic notice generated automatically by automated traffic cameras (RLVD, speed radars) or manually by traffic police officers whenever a traffic rule violation is recorded against your vehicle registration."
              },
              {
                q: "How long does it take for a cleared challan to reflect on government records?",
                a: "Once settled on Selectt, transaction status is transmitted immediately. The official Parivahan system typically updates the status to 'Disposed / Paid' within 15 minutes to 2 hours."
              },
              {
                q: "Are there any extra convenience or gateway fees?",
                a: "No. Settle your pending fines with exactly zero additional service fees through our safe and encrypted payment gateway."
              },
              {
                q: "Is it safe to search and enter vehicle registration details on this portal?",
                a: "Yes. We use standard 256-bit encryption. Your vehicle number is solely queried against public government databases to present outstanding violations accurately."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden transition-all shadow-xs">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-slate-900 text-left cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ml-3 ${isOpen ? 'rotate-180 text-slate-800' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-500 text-xs font-normal leading-relaxed border-t border-slate-100">
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

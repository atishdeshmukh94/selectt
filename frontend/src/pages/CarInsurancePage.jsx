import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  FileText,
  Zap,
  HeartHandshake,
  ArrowRight,
  Shield,
  Wrench,
  Clock,
  PhoneCall,
  Check,
  Percent,
  Car,
  BadgeCheck,
  LogIn,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const CarInsurancePage = () => {
  const { user, openLoginModal } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedRequestNo, setSubmittedRequestNo] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Comprehensive Plan');
  const [phoneInput, setPhoneInput] = useState('');
  const [carNoInput, setCarNoInput] = useState('');
  const [carNoError, setCarNoError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Autofill phone number if user is logged in
  useEffect(() => {
    if (user && user.phone) {
      setPhoneInput(user.phone.replace(/\D/g, '').slice(-10));
      setPhoneError('');
    }
  }, [user]);

  // Vehicle Registration Number Validation: Standard Indian RTO or BH series format (Max 10 chars)
  const validateVehicleNo = (val) => {
    const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!clean) {
      return 'Vehicle registration number is required';
    }
    if (clean.length < 8 || clean.length > 10) {
      return 'Vehicle number must be 8 to 10 characters (e.g. CG04LY4648, MH12AB1234)';
    }
    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
    if (!standardRegex.test(clean) && !bhRegex.test(clean)) {
      return 'Please enter a valid format (e.g. CG04LY4648, MH12AB1234, 22BH1234AA)';
    }
    return '';
  };

  // Indian Mobile Number Validation: 10 digits starting with 6-9
  const validateMobileNo = (val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      return 'Mobile number is required';
    }
    if (clean.length !== 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    if (!/^[6-9]/.test(clean)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    return '';
  };

  const handleCarNoChange = (e) => {
    const clean = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
    setCarNoInput(clean);
    if (carNoError) {
      setCarNoError('');
    }
    if (apiError) setApiError('');
  };

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(clean);
    if (phoneError) {
      setPhoneError('');
    }
    if (apiError) setApiError('');
  };

  const submitInsuranceRequest = async (plan = selectedPlan) => {
    setLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('customerToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/insurance/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          vehicle_number: carNoInput,
          phone: phoneInput,
          plan_type: plan || 'Comprehensive Plan',
          customer_id: user?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit quote request');
      }

      setSubmittedRequestNo(data.request_no || '');
      setFormSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Error submitting quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuote = (e) => {
    e.preventDefault();

    const carErr = validateVehicleNo(carNoInput);
    const phErr = validateMobileNo(phoneInput);

    if (carErr || phErr) {
      setCarNoError(carErr);
      setPhoneError(phErr);
      return;
    }

    if (!user) {
      openLoginModal(
        null,
        () => {
          submitInsuranceRequest();
        },
        phoneInput
      );
      return;
    }

    submitInsuranceRequest();
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const insurancePlans = [
    {
      name: 'Third-Party Cover',
      tag: 'Mandatory by Law',
      price: 'Starting ₹2,094/yr',
      desc: 'Covers legal liability against third-party property damage, injury, or demise as mandated by Motor Vehicles Act.',
      features: [
        'Third-party personal injury cover',
        'Third-party property damages up to ₹7.5 Lakh',
        'Personal accident cover of ₹15 Lakh for owner-driver',
        'Instant digital policy download'
      ],
      popular: false
    },
    {
      name: 'Comprehensive Plan',
      tag: 'Most Recommended',
      price: 'Starting ₹5,499/yr',
      desc: 'All-inclusive coverage protecting against own damage (accidents, fire, theft, natural disasters) + third-party risks.',
      features: [
        'All Third-Party liabilities included',
        'Own damage protection (Accidents, Fire, Flood, Theft)',
        'Cashless repairs at 5,000+ authorized garages',
        'No Claim Bonus (NCB) protection transfer',
        '24x7 Roadside Emergency Assistance'
      ],
      popular: true
    },
    {
      name: 'Zero-Depreciation Elite',
      tag: 'Maximum Payout',
      price: 'Starting ₹7,299/yr',
      desc: 'Zero out-of-pocket expenses for plastic, rubber, fiber, glass, and metal parts during claims. 100% claim settlement value.',
      features: [
        'Everything in Comprehensive Plan',
        '0% depreciation deduction on replacement parts',
        'Engine & Gearbox hydrostatic lock protection',
        'Key & Lock replacement cover up to ₹25,000',
        'Return to Invoice (RTI) add-on available'
      ],
      popular: false
    }
  ];

  return (
    <>
      <PageMeta
        title="Used Car Insurance - Instant Quotes & Cashless Claims | Selectt"
        description="Protect your car with comprehensive motor insurance. Get instant quotes with zero paperwork, zero depreciation add-ons, and cashless claims across 5,000+ garages."
      />
      
      <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">
        
        {/* ───────────── Hero Section ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-20 overflow-hidden bg-[#0C1B33] border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 text-left text-white space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md">
                <ShieldCheck size={14} className="text-[#00C9AF]" />
                Selectt Motor Insurance Protection
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Hassle-free Car Insurance with Instant Cashless Claims
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-xl">
                Compare and buy comprehensive insurance with zero inspection delays, up to 50% No Claim Bonus discount, and cashless settlements across India.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>5,000+ Cashless Garages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>Instant Digital Policy Issuance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>Up to 50% NCB Transfer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00C9AF] shrink-0" />
                  <span>24x7 On-Road Assistance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Quote Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-left border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a892]">Instant Calculator</span>
                  
                  {user ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[11px] font-bold text-[#00a892]">
                      <UserCheck size={12} />
                      <span>{user.first_name ? `${user.first_name}` : 'Signed In'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLoginModal()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#00a892] transition-colors cursor-pointer"
                    >
                      <LogIn size={12} />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Get Free Insurance Quote</h3>
                  <p className="text-slate-500 text-xs font-normal mt-1">Receive customized policy options directly on WhatsApp or Call.</p>
                </div>

                {formSubmitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Quote Request Received!</h4>
                    {submittedRequestNo && (
                      <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800">
                        Ref: {submittedRequestNo}
                      </span>
                    )}
                    <p className="text-slate-500 text-xs font-normal leading-relaxed max-w-xs mx-auto">
                      Our IRDAI-certified insurance advisor will share <span className="font-bold text-slate-800">{selectedPlan}</span> comparison quotes for vehicle <span className="font-bold text-slate-800">{carNoInput}</span> within 10 minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setSubmittedRequestNo('');
                        setCarNoInput('');
                        setPhoneInput('');
                      }}
                      className="text-xs font-bold text-[#00a892] hover:underline pt-2 cursor-pointer block mx-auto"
                    >
                      Calculate for another car
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickQuote} className="space-y-3.5" noValidate>
                    {apiError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{apiError}</span>
                      </div>
                    )}

                    {/* Vehicle Registration Number Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Vehicle Registration Number
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Max 10 Chars</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. CG04LY4648"
                          value={carNoInput}
                          onChange={handleCarNoChange}
                          onBlur={() => setCarNoError(validateVehicleNo(carNoInput))}
                          className={`w-full px-3.5 py-3 rounded-xl border text-xs font-bold text-slate-900 uppercase tracking-widest transition-all bg-slate-50/50 focus:bg-white focus:outline-none ${
                            carNoError
                              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-slate-200 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10'
                          }`}
                        />
                        {carNoInput.length > 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            {carNoInput.length}/10
                          </span>
                        )}
                      </div>
                      {carNoError && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-red-600">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{carNoError}</span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Number Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Mobile Number
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">10 Digits (6-9)</span>
                      </div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                          +91
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phoneInput}
                          onChange={handlePhoneChange}
                          onBlur={() => setPhoneError(validateMobileNo(phoneInput))}
                          className={`w-full pl-11 pr-3.5 py-3 rounded-xl border text-xs font-semibold text-slate-900 transition-all bg-slate-50/50 focus:bg-white focus:outline-none ${
                            phoneError
                              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                              : 'border-slate-200 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10'
                          }`}
                        />
                      </div>
                      {phoneError && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-red-600">
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{phoneError}</span>
                        </div>
                      )}
                    </div>

                    {/* Insurance Plan Type Selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Preferred Coverage Plan
                      </label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50 cursor-pointer"
                      >
                        <option value="Comprehensive Plan">Comprehensive Plan (Most Recommended)</option>
                        <option value="Third-Party Cover">Third-Party Cover (Mandatory by Law)</option>
                        <option value="Zero-Depreciation Elite">Zero-Depreciation Elite (Maximum Payout)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-2 bg-[#00C9AF] hover:bg-[#00b29c] disabled:opacity-60 text-[#0C1B33] font-bold rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Processing Request...</span>
                      ) : (
                        <>
                          <span>{user ? 'View Insurance Quotes' : 'Continue to Quotes'}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-400 font-medium text-center pt-1">
                      100% spam-free guarantee. No annoying unsolicited sales calls.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ───────────── Trust Numbers Strip ───────────── */}
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">5,000+</span>
                <p className="text-xs text-slate-500 font-medium">Cashless Garages</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">15 Min</span>
                <p className="text-xs text-slate-500 font-medium">Fast-Track Approvals</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Up to 50%</span>
                <p className="text-xs text-slate-500 font-medium">NCB Discount Bonus</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#00a892] tracking-tight">98.4%</span>
                <p className="text-xs text-slate-500 font-medium">Claims Settled Ratio</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Insurance Plans Comparison ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20">
                Tailored Coverages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2.5">
                Choose the right protection plan for your car
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-1.5 leading-relaxed">
                From basic mandatory legal liabilities to 100% bumper-to-bumper zero depreciation covers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insurancePlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-6 border flex flex-col justify-between text-left shadow-xs relative transition-all ${
                    plan.popular
                      ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0C1B33] text-[#00C9AF] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#00C9AF]/30">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {plan.tag}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                      <div className="text-sm font-extrabold text-[#00a892] mt-1">{plan.price}</div>
                    </div>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed mb-6">
                      {plan.desc}
                    </p>

                    <div className="space-y-2.5 border-t border-slate-100 pt-4">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                          <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        plan.popular
                          ? 'bg-[#0C1B33] text-white hover:bg-[#162a4d]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      Get Quote for this Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── 4-Step Cashless Claims Workflow ───────────── */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Claims Made Simple</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                4-Step Cashless Claim Process
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-1.5 leading-relaxed">
                Zero headache, zero out-of-pocket stress. We handle everything from surveyor check to workshop payment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 text-left space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Notify & Register Claim</h4>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Call our 24x7 claims helpline or register online in under 2 minutes with accident photos.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 text-left space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Network Garage Towing</h4>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Free towing directly to your nearest authorized cashless workshop or Selectt Car Hub.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 text-left space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Digital Self-Survey</h4>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Instant AI video surveyor assessment ensures repair approvals within 2 hours.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 text-left space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Cashless Delivery</h4>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Insurer pays workshop directly. Pick up your restored vehicle with zero out-of-pocket hassle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Need Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
};

export default CarInsurancePage;


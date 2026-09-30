import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_CARS } from '../data/mockCars';
import { CheckCircle2, Phone, CreditCard, Gift, ShieldCheck, MapPin, Search, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, Star, X, FileText, ArrowDown, ArrowRight, Check, Sparkles, RotateCcw, Car, Info, Navigation, Wrench, Plus, Calendar, Pencil, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../config/api';
import PageMeta from '../components/common/PageMeta';
import TestDriveModal from '../components/buy/TestDriveModal';

export const getBookingAmount = (price) => {
  const numericPrice = Number(price) || 0;
  if (numericPrice < 1000000) {
    return 5000; // Under 10 Lakhs
  } else if (numericPrice < 2000000) {
    return 11000; // Below 20 Lakhs (10L to 20L)
  } else {
    return 21000; // 20 Lakhs and above
  }
};

const DEFAULT_BUY_STEPS = [
  {
    stepNumber: 1,
    badge: 'Step 1',
    icon: <Search size={22} className="text-[#00C9AF]" />,
    title: '1. Discover your ride',
    desc: 'Book and reserve any car exclusively for yourself for up to 3 days.',
    bgClass: 'bg-gradient-to-br from-[#0C1B33] via-[#0E2242] to-[#122A4F] border-[#00C9AF]/40',
    glow: 'shadow-[#00C9AF]/15',
    accentColor: '#00C9AF',
    badgeBg: 'bg-[#00C9AF]/20 text-[#00C9AF] border-[#00C9AF]/40',
  },
  {
    stepNumber: 2,
    badge: 'Step 2',
    icon: <FileText size={22} className="text-cyan-400" />,
    title: '2. Submit documents effortlessly',
    desc: "We'll handle all the paperwork to make the process simple and stress-free.",
    bgClass: 'bg-gradient-to-br from-[#101F38] via-[#142646] to-[#1A2D52] border-cyan-500/40',
    glow: 'shadow-cyan-400/15',
    accentColor: '#22D3EE',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
  {
    stepNumber: 3,
    badge: 'Step 3',
    icon: <CreditCard size={22} className="text-purple-400" />,
    title: '3. Pay the balance, your way',
    desc: 'Choose from a range of payment options - pay in full or finance your purchase.',
    bgClass: 'bg-gradient-to-br from-[#18182E] via-[#1E1E3A] to-[#262642] border-purple-500/40',
    glow: 'shadow-purple-400/15',
    accentColor: '#C084FC',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
  },
  {
    stepNumber: 4,
    badge: 'Step 4',
    icon: <MapPin size={22} className="text-rose-400" />,
    title: '4. Delivered to your doorstep',
    desc: "Sit back and relax while we bring your dream car to your doorstep - it's that easy!",
    bgClass: 'bg-gradient-to-br from-[#1F1426] via-[#281830] to-[#331E3D] border-rose-500/40',
    glow: 'shadow-rose-400/15',
    accentColor: '#FB7185',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  }
];

export const ConfettiSavingsBanner = ({ savingAmount = 5000, className = "" }) => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E', '#EFFF1D', '#F59E0B', '#8B5CF6', '#EC4899'];
    const confettiAnimations = ['slow', 'medium', 'fast'];
    
    // Create confetti container
    let confettiContainer = el.querySelector('.confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      el.appendChild(confettiContainer);
    }

    const interval = setInterval(() => {
      if (!confettiContainer || !el) return;
      
      const confettiEl = document.createElement('div');
      const confettiSize = Math.floor(Math.random() * 4) + 6 + 'px'; // 6px to 9px
      const confettiBg = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const confettiLeft = Math.floor(Math.random() * (el.offsetWidth || 300)) + 'px';
      const confettiAnimation = confettiAnimations[Math.floor(Math.random() * confettiAnimations.length)];

      confettiEl.classList.add('confetti', `confetti-banner--${confettiAnimation}`);
      confettiEl.style.left = confettiLeft;
      confettiEl.style.width = confettiSize;
      confettiEl.style.height = confettiSize;
      confettiEl.style.backgroundColor = confettiBg;
      confettiEl.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';

      setTimeout(() => {
        if (confettiEl && confettiEl.parentNode) {
          confettiEl.parentNode.removeChild(confettiEl);
        }
      }, 2500);

      confettiContainer.appendChild(confettiEl);
    }, 90);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`js-container container relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50/90 to-emerald-50 border border-emerald-300/90 rounded-2xl px-4 py-3 flex items-center justify-between text-emerald-900 text-[14px] font-bold shadow-xs select-none min-h-[46px] ${className}`}
      style={{ top: '0px' }}
    >
      {/* Static / Floating celebration elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute top-0.5 right-20 text-[15px] animate-balloon opacity-85">🎈</span>
        <span className="absolute -bottom-1 right-36 text-[12px] animate-balloon [animation-delay:1.3s] opacity-75">🎈</span>
        <span className="absolute top-1 right-12 text-[14px] animate-ribbon opacity-90">🎊</span>
        <span className="absolute -top-1 right-28 text-[13px] animate-ribbon [animation-delay:0.7s] opacity-85">🎉</span>
        <span className="absolute top-1.5 left-48 text-[10px] animate-confetti text-amber-500">✨</span>
        <span className="absolute bottom-1.5 left-60 text-[9px] animate-confetti [animation-delay:1.5s] text-purple-500">✨</span>
      </div>

      {/* Banner Text with Rupee Icon */}
      <div className="flex items-center gap-2.5 relative z-10">
        <span className="w-5 h-5 rounded-full bg-[#00C09D] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
          ₹
        </span>
        <span className="font-extrabold text-emerald-900 text-[14px] sm:text-[15px] tracking-tight">
          Yay! You are saving ₹{Number(savingAmount).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export const CelebrationConfettiShower = () => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E', '#EFFF1D', '#F59E0B', '#8B5CF6', '#EC4899'];
    const confettiAnimations = ['slow', 'medium', 'fast'];
    
    let confettiContainer = el.querySelector('.confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      el.appendChild(confettiContainer);
    }

    const interval = setInterval(() => {
      if (!confettiContainer || !el) return;
      
      const confettiEl = document.createElement('div');
      const confettiSize = Math.floor(Math.random() * 4) + 7 + 'px';
      const confettiBg = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const confettiLeft = Math.floor(Math.random() * (window.innerWidth || 1200)) + 'px';
      const confettiAnimation = confettiAnimations[Math.floor(Math.random() * confettiAnimations.length)];

      confettiEl.classList.add('confetti', `confetti--animation-${confettiAnimation}`);
      confettiEl.style.left = confettiLeft;
      confettiEl.style.width = confettiSize;
      confettiEl.style.height = confettiSize;
      confettiEl.style.backgroundColor = confettiBg;
      confettiEl.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';

      setTimeout(() => {
        if (confettiEl && confettiEl.parentNode) {
          confettiEl.parentNode.removeChild(confettiEl);
        }
      }, 3000);

      confettiContainer.appendChild(confettiEl);
    }, 25);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="js-container fixed inset-0 pointer-events-none z-[9999999] overflow-hidden"
      style={{ top: '0px' }}
    />
  );
};

const CheckoutPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);

  useEffect(() => {
    // If not logged in, redirect home or login
    if (!user && !localStorage.getItem('customerToken')) {
      navigate('/');
      return;
    }

    // Fetch car details from API
    fetch(`${API_URL}/api/cars/${carId}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.status === 'coming_soon') {
          alert('This vehicle is currently "Coming Soon" and cannot be booked.');
          navigate('/buy-cars');
          return;
        }
        setCar(data);
      })
      .catch(() => {
        navigate('/buy-cars');
      });

    window.scrollTo(0, 0);
  }, [carId, user, navigate]);

  const [isBooking, setIsBooking] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [interestedInLoan, setInterestedInLoan] = useState(false);
  const [mobileLoanPromptVisible, setMobileLoanPromptVisible] = useState(true);
  const [isPriceSummaryOpen, setIsPriceSummaryOpen] = useState(false);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [testDriveLocation, setTestDriveLocation] = useState('hub');
  const [isTestDriveSkipped, setIsTestDriveSkipped] = useState(false);
  const [scheduledTestDrive, setScheduledTestDrive] = useState(null);
  const [steps, setSteps] = useState(DEFAULT_BUY_STEPS);

  // 1-Year Complete Maintenance Package state
  const [maintenancePackageAdded, setMaintenancePackageAdded] = useState(false);
  const [maintenancePaymentType, setMaintenancePaymentType] = useState('full'); // 'full' | 'monthly'
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isMaintenanceDetailsOpen, setIsMaintenanceDetailsOpen] = useState(false);
  const [showCelebrationToast, setShowCelebrationToast] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null); // 'warranty' | 'periodic' | 'rsa' | null (collapsed by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeBreakdownModal, setActiveBreakdownModal] = useState(null); // 'servicing' | 'fixes' | 'gst' | null

  const openTestDrive = (location = 'hub') => {
    setTestDriveLocation(location);
    setIsTestDriveOpen(true);
  };

  const handleConfirmMaintenance = () => {
    setMaintenancePackageAdded(true);
    setIsMaintenanceModalOpen(false);
    setShowCelebrationToast(true);
    setTimeout(() => {
      setShowCelebrationToast(false);
    }, 3500);
  };

  useEffect(() => {
    // Fetch dynamic buy steps from backend if customized
    fetch(`${API_URL}/api/banners?page=home&type=buy-step`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(s => s.is_active !== 0).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          if (active.length > 0) {
            setSteps(DEFAULT_BUY_STEPS.map((def, idx) => {
              const live = active[idx];
              if (!live) return def;
              return {
                ...def,
                badge: live.cta_text || def.badge,
                title: live.title ? `${idx + 1}. ${live.title.replace(/^\d+\.\s*/, '')}` : def.title,
                desc: live.subtitle || def.desc,
              };
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js').then((res) => {
      setRazorpayLoaded(res);
    });
  }, []);

  const handleBooking = async () => {
    if (isBooking || !razorpayLoaded) return;
    setIsBooking(true);

    const bookingAmount = getBookingAmount(car?.price);

    try {
      // 1. Create a placeholder booking in backend
      const bookingResp = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
        },
        body: JSON.stringify({
          car_id: car.id,
          final_amount: (Number(car.price) || 0) + (maintenancePackageAdded && maintenancePaymentType === 'full' ? 11287 : 0),
          booking_amount: bookingAmount,
          interested_in_loan: interestedInLoan ? 1 : 0,
          maintenance_package: maintenancePackageAdded ? 1 : 0,
          maintenance_plan_type: maintenancePackageAdded ? maintenancePaymentType : null,
          maintenance_price: maintenancePackageAdded ? (maintenancePaymentType === 'full' ? 11287 : 990) : null
        })
      });

      if (!bookingResp.ok) throw new Error('Failed to create booking');
      const bookingData = await bookingResp.json();
      const bookingId = bookingData.id;

      // 2. Create Razorpay Order
      const orderResp = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
        },
        body: JSON.stringify({
          amount: bookingAmount,
          currency: 'INR',
          receipt: bookingData.booking_no
        })
      });

      if (!orderResp.ok) {
        const errData = await orderResp.json();
        throw new Error(errData.message || 'Failed to create payment order');
      }
      const orderData = await orderResp.json();

      // 3. Get Public Key (I'll need to implement this endpoint or just fetch it here if I had it)
      const settingsResp = await fetch(`${API_URL}/api/settings/public`);
      const settingsData = await settingsResp.json();
      const razorpayKey = settingsData.razorpay_key_id;

      // 4. Open Razorpay Checktout
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Selectt Cars',
        description: `Booking for ${car.year} ${car.make} ${car.model}`,
        image: '/img/payment-logo.png',
        order_id: orderData.id,
        handler: async function (response) {
          // 5. Verify Payment
          const verifyResp = await fetch(`${API_URL}/api/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId
            })
          });

          if (verifyResp.ok) {
            navigate('/profile?tab=bookings&payment=success');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#00A884'
        }
      };

      console.log('Initializing Razorpay with options:', { ...options, key: 'MASKED' });
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!car || !user) return (
    <>
      <PageMeta title="Checkout - Secure Car Booking | Selectt" description="Securely book your certified pre-owned car at Selectt." />
      <div className="pt-32 text-center text-slate-500 font-bold bg-[#050B16] min-h-screen flex items-center justify-center">Loading Checkout...</div>
    </>
  );

  const originalPrice = car.price + 22000;

  return (
    <>
      <PageMeta title={`Checkout - Reserve ${car.year} ${car.make} ${car.model} | Selectt`} description={`Complete booking deposit for your ${car.year} ${car.make} ${car.model}.`} />
      <div className="bg-[#f9f9f9] min-h-screen pt-0 md:pt-4 lg:pt-8 pb-56 sm:pb-64 lg:pb-20 font-sans text-slate-800 relative">
        {/* Mobile Top Navigation with Bold Back Arrow */}
        <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs mb-4">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(`/car/${car?.id || carId}`);
              }
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-[#0C1B33] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            aria-label="Back"
          >
            <ArrowLeft size={22} strokeWidth={3} className="text-[#0C1B33]" />
          </button>

          <div className="text-center flex-1 pr-9">
            <span className="text-xs font-black text-[#0C1B33] uppercase tracking-wider block">
              Checkout
            </span>
            <span className="text-[11px] font-bold text-slate-500 truncate block max-w-[200px] mx-auto">
              {car?.year} {car?.make} {car?.model}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">

          {/* Progress Bar Header */}
          {/* Desktop Version */}
          <div className="hidden md:flex items-center justify-center mb-10 gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2 text-[#00C9AF]">
              <CheckCircle2 size={16} fill="#00C9AF" className="text-white" /> Car selected
            </div>
            <div className="w-24 h-px bg-[#00C9AF]" />
            <div className="flex items-center gap-2 text-[#00C9AF]">
              <div className="w-4 h-4 bg-[#00C9AF] text-[#0A1C3A] rounded-full flex items-center justify-center text-[10px]">2</div>
              Test drive preferences
            </div>
            <div className="w-24 h-px bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-[10px]">3</div>
              Payment
            </div>
          </div>

          {/* Mobile Version */}
          <div className="flex md:hidden flex-col items-center mb-6 w-full px-2">
            <div className="flex items-center justify-center w-full gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00C9AF] flex items-center justify-center text-white shadow-md shadow-[#00C9AF]/20">
                <CheckCircle2 size={14} fill="#00C9AF" className="text-white" />
              </div>
              <div className="h-[2px] flex-1 max-w-[80px] bg-[#00C9AF]" />
              <div className="w-7 h-7 rounded-full bg-[#00C9AF] text-[#0C1B33] font-black text-xs flex items-center justify-center shadow-md ring-4 ring-[#00C9AF]/15">
                2
              </div>
              <div className="h-[2px] flex-1 max-w-[80px] bg-slate-200" />
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs uppercase tracking-widest font-black text-slate-400 block mb-1">Step 2 of 3</span>
              <h3 className="text-sm sm:text-base font-black text-[#0C1B33] uppercase tracking-wider">Test Drive Preferences</h3>
            </div>
          </div>

          {/* Main Title Area */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#0F172A] mb-2 leading-tight">
                Reserve this car for <span className="text-[#00C9AF] font-bold font-price">₹5,000</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal">and find out if it's your perfect match</p>
            </div>
            <div className="hidden md:block">
              <img src="/img/illustration-relax.svg" alt="Relax" className="h-24 opacity-80 mix-blend-multiply" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Flow Options (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5">

              {/* 1. Interested in Car Loan? (Screenshot 1 top card) */}
              <div className="hidden md:block bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-[#0F172A] text-base mb-1">
                      Interested in car loan?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      Get your car financed at attractive interest rates. <a href="/privacy-policy" className="text-[#00A38D] font-bold hover:underline">Learn more</a>
                    </p>
                  </div>

                  {/* Checkbox button matching reference screenshot */}
                  <button
                    type="button"
                    onClick={() => setInterestedInLoan(!interestedInLoan)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                      interestedInLoan
                        ? 'bg-[#00C9AF] text-[#0C1B33] shadow-sm ring-2 ring-[#00C9AF]/30'
                        : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                    }`}
                    aria-label="Toggle car loan interest"
                  >
                    {interestedInLoan && <Check size={16} strokeWidth={3.5} />}
                  </button>
                </div>
              </div>

              {/* 2. 1-Year Complete Maintenance Package (Screenshot 1 middle card) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-teal-200">
                {/* Dark Pill Badge with Light Font */}
                <div className="inline-flex items-center gap-1.5 bg-[#0C1B33] text-[#00DFB8] border border-[#00C9AF]/30 text-[10.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-sm">
                  <Sparkles size={11} className="text-[#00DFB8]" />
                  <span>SAVE ₹31,263</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Left Icon & Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img 
                      src="/images/maintenance-package-icon.png" 
                      alt="Complete Maintenance Package" 
                      className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md shadow-[#00C9AF]/20" 
                    />
                    <div className="min-w-0">
                      <h3 className="font-black text-[#0F172A] text-sm sm:text-base leading-tight">
                        1-Year complete maintenance package
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                        Warranty, service, RSA & buyback
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsMaintenanceDetailsOpen(true)}
                        className="text-xs text-[#00A38D] font-black flex items-center gap-0.5 mt-1 hover:underline cursor-pointer"
                      >
                        <span>See details</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Right Price & Add/Added Button */}
                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-[#0F172A] block leading-tight font-price">
                        ₹10,801
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block leading-tight font-price">
                        or ₹947/m
                      </span>
                    </div>

                    {maintenancePackageAdded ? (
                      <button
                        type="button"
                        onClick={() => setIsMaintenanceModalOpen(true)}
                        className="py-1.5 px-4 rounded-xl border-2 border-[#00A38D] bg-[#00A38D]/10 text-[#00A38D] font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Check size={14} strokeWidth={3} />
                        <span>Added</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsMaintenanceModalOpen(true)}
                        className="py-1.5 px-4 rounded-xl border-2 border-[#00C9AF] text-[#008975] hover:bg-[#00C9AF]/10 bg-[#00C9AF]/5 font-black text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Plus size={14} strokeWidth={3} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Test Drive Preferences (Screenshot 1 bottom card) */}
              {scheduledTestDrive ? (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-[#00A38D]">
                        <Calendar size={16} />
                      </div>
                      <span className="font-black text-[#0F172A] text-sm sm:text-base">
                        {scheduledTestDrive.date_day || 'Wed, 30 Sep'} • {scheduledTestDrive.slot || '4pm - 5pm'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openTestDrive(scheduledTestDrive.location || 'hub')}
                      className="text-[#00A38D] font-bold text-xs hover:underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold pl-1">
                    <MapPin size={14} className="text-[#00A38D] shrink-0" />
                    <span>{scheduledTestDrive.location === 'hub' ? (scheduledTestDrive.hub_name || 'Selectt Car Hub, Pune') : 'Your Location (Doorstep)'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed border-t border-slate-100 pt-2">
                    We'll assign an agent during your test drive. If you can't make it for any reason, feel free to walk-in anytime.
                  </p>
                </div>
              ) : !isTestDriveSkipped ? (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      You haven’t taken a test drive yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsTestDriveSkipped(true)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                  <h4 className="font-black text-[#0F172A] text-base sm:text-lg">
                    Where would you prefer to take it?
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openTestDrive('doorstep')}
                      className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-[#00A38D] to-[#00BFA5] hover:from-[#008f7b] hover:to-[#00aa93] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#00A38D]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 group"
                    >
                      <MapPin size={15} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
                      <span>YOUR LOCATION</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openTestDrive('hub')}
                      className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-[#008975] to-[#00A38D] hover:from-[#007362] hover:to-[#008f7b] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#008975]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 group"
                    >
                      <Building2 size={15} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
                      <span>AT SELECTT HUB</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Car size={14} />
                    </div>
                    <span>Test drive skipped</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestDriveSkipped(false);
                      openTestDrive('hub');
                    }}
                    className="text-xs text-[#00A38D] font-bold hover:underline cursor-pointer"
                  >
                    Schedule now
                  </button>
                </div>
              )}

            </div>

            {/* Right Column: Order Summary & Price Breakdown (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4">

              {/* Savings Banner with Confetti, Ribbon & Balloon Celebration Animations */}
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50/90 to-emerald-50 border border-emerald-300/90 rounded-2xl px-4 py-3 flex items-center justify-between text-emerald-900 text-[14px] font-bold shadow-xs">
                {/* Floating Animated Balloons, Ribbons & Confetti Particles (Matching Screenshot 5) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                  {/* Floating Balloons */}
                  <span className="absolute top-0.5 right-20 text-[15px] animate-balloon opacity-80">🎈</span>
                  <span className="absolute -bottom-1 right-36 text-[12px] animate-balloon [animation-delay:1.3s] opacity-70">🎈</span>
                  
                  {/* Floating Ribbons / Streamers */}
                  <span className="absolute top-1 right-12 text-[14px] animate-ribbon opacity-85">🎊</span>
                  <span className="absolute -top-1 right-28 text-[13px] animate-ribbon [animation-delay:0.7s] opacity-80">🎉</span>
                  
                  {/* Confetti Dots & Sparkles */}
                  <span className="absolute top-1.5 left-48 text-[10px] animate-confetti text-amber-500">✨</span>
                  <span className="absolute bottom-1.5 left-60 text-[9px] animate-confetti [animation-delay:1.5s] text-purple-500">✨</span>
                  <span className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-amber-400 animate-confetti" />
                  <span className="absolute bottom-2 right-8 w-1.5 h-1.5 rounded-full bg-rose-400 animate-confetti [animation-delay:0.5s]" />
                  <span className="absolute top-2.5 right-16 w-1 h-2 rounded-xs bg-purple-500 animate-confetti [animation-delay:1.1s] rotate-45" />
                  <span className="absolute bottom-1.5 right-24 w-1.5 h-1.5 rounded-full bg-teal-500 animate-confetti [animation-delay:0.8s]" />
                  <span className="absolute top-1 right-44 w-1.5 h-1.5 rounded-full bg-blue-500 animate-confetti [animation-delay:1.7s]" />
                  <span className="absolute bottom-2 right-48 w-1 h-2 rounded-xs bg-emerald-500 animate-confetti [animation-delay:0.3s] -rotate-12" />
                  <span className="absolute top-2 left-44 w-1.5 h-1.5 rounded-full bg-pink-400 animate-confetti [animation-delay:1.4s]" />
                </div>

                {/* Banner Text */}
                <div className="flex items-center gap-2.5 relative z-10">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                    ₹
                  </span>
                  <span className="font-extrabold text-emerald-900 tracking-tight">Yay! You are saving ₹5,000</span>
                </div>
              </div>

              {/* Order Summary & Breakdown Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {/* Car Info Header */}
                <div className="p-4 sm:p-5 flex items-center gap-4 border-b border-slate-100">
                  <div className="w-28 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={getCarImageUrl(car?.image || car?.images?.[0])}
                      alt={car?.model || 'Car'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h3 className="font-heading font-extrabold text-[#0F172A] text-[15px] sm:text-[16px] leading-snug mb-1 truncate">
                      {car.year} {car.make} {car.model} {car.variant || ''}
                    </h3>
                    <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mb-1.5 truncate">
                      <span>{(car.km || 73000).toLocaleString()} Km</span> • <span>{car.fuelType || 'Petrol'}</span> • <span>{car.transmission || 'Manual'}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-price font-extrabold text-[#0F172A] text-lg sm:text-xl whitespace-nowrap leading-none">
                        ₹{(car.price / 100000).toFixed(2)} Lakh
                      </span>
                      <span className="text-xs sm:text-[13px] text-slate-400 line-through font-normal font-price whitespace-nowrap">
                        ₹{((car.price + 5000) / 100000).toFixed(2)} Lakh
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Amount Card (Matching Reference Screenshot) */}
                <div className="p-4 pb-0">
                  <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Booking Amount</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base text-[#0C1B33] font-price">
                      <span>₹{getBookingAmount(car?.price).toLocaleString('en-IN')}</span>
                      <Pencil size={13} className="text-[#00A38D] cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-2 pb-1 px-1">
                    <Info size={13} className="text-slate-400 shrink-0" />
                    <span>Discount valid only for deliveries within 3 days of booking.</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 sm:p-5 pt-3">
                  <h4 className="font-heading font-extrabold text-[#0F172A] text-[15px] sm:text-[16px] mb-3.5">
                    Price breakdown
                  </h4>

                  <div className="space-y-2.5 text-xs sm:text-[13px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal">Car price</span>
                      <span className="text-[#0F172A] font-bold font-price">₹{(car.price + 5000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Sparkles size={13} className="text-emerald-500" /> Sale Discount
                      </span>
                      <span className="font-bold font-price text-emerald-600">- ₹5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal">RC transfer facilitation</span>
                      <span className="text-[#0F172A] font-bold font-price">+ ₹4,000</span>
                    </div>
                    
                    {/* Servicing, cleaning, fuel & more (Interactive Info Trigger) */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveBreakdownModal('servicing')}
                        className="text-slate-600 font-normal flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer group text-left"
                      >
                        <span>Servicing, cleaning, fuel & more</span>
                        <Info size={13} className="text-slate-400 group-hover:text-[#00A38D] transition-colors shrink-0" />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through text-[11px] font-semibold font-price">₹8,700</span>
                        <span className="text-emerald-600 font-bold">Included</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal">Warranty (Protect)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through text-[11px] font-semibold font-price">₹5,500</span>
                        <span className="text-emerald-600 font-bold">Included</span>
                      </div>
                    </div>

                    {/* Fixes & upgrades (Interactive Info Trigger) */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveBreakdownModal('fixes')}
                        className="text-slate-600 font-normal flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer group text-left"
                      >
                        <span>Fixes & upgrades</span>
                        <Info size={13} className="text-slate-400 group-hover:text-[#00A38D] transition-colors shrink-0" />
                      </button>
                      <span className="text-emerald-600 font-bold">Included</span>
                    </div>

                    {/* GST govt taxes (Interactive Info Trigger) */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveBreakdownModal('gst')}
                        className="text-slate-600 font-normal flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer group text-left"
                      >
                        <span>GST (govt. taxes)</span>
                        <Info size={13} className="text-slate-400 group-hover:text-[#00A38D] transition-colors shrink-0" />
                      </button>
                      <span className="text-[#0F172A] font-bold font-price">₹2,430</span>
                    </div>

                    {maintenancePackageAdded && (
                      <div className="flex justify-between items-center text-[#00A38D] font-bold pt-1 border-t border-slate-100">
                        <span>1-Year Complete Maintenance ({maintenancePaymentType === 'full' ? 'Paid in Full' : 'Monthly'})</span>
                        <span className="font-price">
                          {maintenancePaymentType === 'full' ? '+ ₹11,287' : '+ ₹990/m'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Proceed to Pay inside right card for Desktop */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className={`relative overflow-hidden w-full bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] font-black py-3.5 px-5 rounded-xl transition-all duration-300 shadow-md shadow-[#00C9AF]/25 flex items-center justify-between cursor-pointer text-sm uppercase tracking-wider ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isBooking ? (
                        <div className="flex items-center justify-center gap-2 w-full">
                          <div className="w-4 h-4 border-2 border-[#0C1B33] border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <span>PROCEED TO PAY</span>
                          <span className="font-price font-black">
                            ₹{getBookingAmount(car?.price).toLocaleString('en-IN')} →
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 font-semibold">
                      100% refundable deposit • Cancel anytime
                    </p>
                  </div>
                </div>

                {/* Security Footer */}
                <div className="bg-slate-50/80 py-2.5 px-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-500 text-xs font-medium">
                  <ShieldCheck size={14} className="text-[#00A38D]" />
                  <span>100% secure payment gateway</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* What Happens Next - Expanded Dynamic Step-by-Step Section */}
        <div className="max-w-7xl mx-auto px-4 mt-16 sm:mt-20">
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0F172A] text-center flex items-center justify-center gap-4">
              <div className="h-px bg-slate-200 flex-1 max-w-[150px]" />
              <span>What happens next</span>
              <div className="h-px bg-slate-200 flex-1 max-w-[150px]" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
              Simple, transparent 4-step process from online reservation to doorstep delivery.
            </p>
          </div>

          {/* DESKTOP VIEW (Horizontal 4-Grid with Connectors) */}
          <div className="hidden lg:grid grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col">
                <div
                  className={`p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center border hover:-translate-y-1.5 transition-all duration-300 shadow-xl ${step.bgClass} ${step.glow} h-full relative overflow-hidden group`}
                >
                  {/* Subtle Top Glow Pill */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border ${step.badgeBg}`}>
                    {step.badge || `Step ${idx + 1}`}
                  </span>

                  <div className="w-13 h-13 p-3 border border-white/20 rounded-2xl flex items-center justify-center bg-white/10 mb-4 shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  <h4 className="font-heading font-bold text-white text-[16px] mb-2 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[13px] text-slate-300 font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* MOBILE / TABLET VIEW (Alternating Left/Right Animated Slide-ins with Down Arrows) */}
          <div className="flex flex-col gap-0 lg:hidden max-w-md sm:max-w-lg mx-auto">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0; // 0, 2 from LEFT, 1, 3 from RIGHT

              return (
                <div key={idx} className="flex flex-col items-center w-full">
                  {/* Step Card with Alternating Directional Animation */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -60 : 60, scale: 0.96 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className={`w-full p-6 rounded-2xl flex flex-col items-center text-center border shadow-xl ${step.bgClass} ${step.glow} relative overflow-hidden`}
                  >
                    {/* Step Badge & Directional Indicator */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${step.badgeBg}`}>
                        {step.badge || `Step ${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {isEven ? "Step " + (idx + 1) + " →" : "← Step " + (idx + 1)}
                      </span>
                    </div>

                    <div className="w-13 h-13 p-3 border border-white/20 rounded-2xl flex items-center justify-center bg-white/10 mb-3 shadow-md shrink-0">
                      {step.icon}
                    </div>

                    <h4 className="font-heading font-bold text-white text-[16px] sm:text-[17px] mb-2 leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-[13px] text-slate-300 font-normal leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>

                  {/* Animated Prominent Downward Connector Arrow between boxes */}
                  {idx < steps.length - 1 && (
                    <div className="flex flex-col items-center justify-center py-3 my-1 relative">
                      <div
                        className="w-1 h-6 rounded-full opacity-80"
                        style={{ backgroundColor: step.accentColor }}
                      />
                      <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 rounded-full bg-slate-900 border-[2.5px] shadow-2xl flex items-center justify-center my-1 z-10"
                        style={{
                          borderColor: step.accentColor,
                          boxShadow: `0 8px 24px -4px ${step.accentColor}40`
                        }}
                      >
                        <ArrowDown size={22} strokeWidth={2.5} style={{ color: step.accentColor }} />
                      </motion.div>
                      <div
                        className="w-1 h-6 rounded-full opacity-80"
                        style={{ backgroundColor: steps[idx + 1].accentColor }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile spacing spacer so content never gets hidden behind sticky footer prompts */}
          <div className="h-20 lg:hidden" />
        </div>
      </div>
      <TestDriveModal
        car={car}
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        onSuccess={(details) => setScheduledTestDrive(details)}
      />

      {/* 1-Year Complete Maintenance Package Payment Selection Modal / Bottom Sheet (Screenshots 2 & 3) */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsMaintenanceModalOpen(false)} />
          <div className="bg-white rounded-t-[28px] sm:rounded-3xl w-full max-w-md relative z-10 shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 border border-slate-200/90">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                Select payment type
              </h3>
              <button
                type="button"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2 Payment Type Toggle Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Option 1: Pay in Full */}
              <button
                type="button"
                onClick={() => setMaintenancePaymentType('full')}
                className={`p-3.5 pt-4 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${
                  maintenancePaymentType === 'full'
                    ? 'border-[#00C9AF] bg-[#00C9AF]/10 text-[#008975] shadow-xs ring-1 ring-[#00C9AF]/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#00C9AF] text-[#0C1B33] text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  SAVE EXTRA ₹594
                </span>
                <span className="block text-xs font-black uppercase tracking-wider mb-0.5">
                  Pay in full
                </span>
                <span className="block text-sm font-black text-[#0F172A]">
                  ₹11,287
                </span>
              </button>

              {/* Option 2: Pay monthly */}
              <button
                type="button"
                onClick={() => setMaintenancePaymentType('monthly')}
                className={`p-3.5 pt-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  maintenancePaymentType === 'monthly'
                    ? 'border-[#00C9AF] bg-[#00C9AF]/10 text-[#008975] shadow-xs ring-1 ring-[#00C9AF]/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block text-xs font-black uppercase tracking-wider mb-0.5">
                  Pay monthly
                </span>
                <span className="block text-xs font-black text-slate-800">
                  ₹990/m · <span className="text-[10px] text-slate-500 font-semibold">for 12 months</span>
                </span>
              </button>
            </div>

            {/* Breakdown Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Total price</span>
                <span className="font-bold text-slate-800">₹13,201</span>
              </div>
              <div className="flex items-center justify-between text-[#00A884] font-bold">
                <span>Package discount</span>
                <span>- ₹1,320</span>
              </div>
              {maintenancePaymentType === 'full' && (
                <div className="flex items-center justify-between text-[#00A884] font-bold">
                  <span>Full payment discount</span>
                  <span>- ₹594</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">
                  {maintenancePaymentType === 'full' ? '₹11,287' : '₹11,881'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-black text-[#0F172A]">You pay</span>
                <span className="font-black text-[#0F172A] text-base">
                  {maintenancePaymentType === 'full' ? '₹11,287' : '₹990/m (for 12 months)'}
                </span>
              </div>
              {maintenancePaymentType === 'monthly' && (
                <p className="text-[11px] text-slate-400 font-medium text-center pt-1">
                  You can setup an UPI autopay on the delivery day
                </p>
              )}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmMaintenance}
              className="w-full py-3.5 bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] rounded-xl font-black text-sm shadow-md shadow-[#00C9AF]/25 transition-all cursor-pointer"
            >
              Confirm
            </button>

            {maintenancePackageAdded && (
              <button
                type="button"
                onClick={() => {
                  setMaintenancePackageAdded(false);
                  setIsMaintenanceModalOpen(false);
                }}
                className="w-full text-center text-xs font-bold text-rose-500 hover:text-rose-700 py-1 cursor-pointer"
              >
                Remove package from booking
              </button>
            )}

            {/* Validity Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <Calendar size={13} />
              <span>Valid for 1 years from delivery</span>
            </div>

          </div>
        </div>
      )}

      {/* Celebration / Confetti Modal (Screenshot 3) */}
      {showCelebrationToast && (
        <>
          <CelebrationConfettiShower />
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-250 text-center border border-slate-100">
            {/* Green Top Wave Banner */}
            <div className="bg-[#00C9AF] text-[#0C1B33] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs">
              <span>🎉 Saving ₹1,320 on package + upto ₹30,000 on upgrade</span>
            </div>

            <div className="p-6 pt-5 space-y-3">
              {/* Central 3D Graphic */}
              <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                <img 
                  src="/images/maintenance-package-icon.png" 
                  alt="Complete Maintenance Package" 
                  className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-[#00C9AF]/25 transform -rotate-3" 
                />
                <span className="absolute -top-1 -right-1 text-lg animate-bounce">✨</span>
                <span className="absolute -bottom-1 -left-1 text-lg animate-pulse">🎊</span>
              </div>

              <div>
                <h4 className="font-black text-[#0F172A] text-base sm:text-lg leading-tight">
                  1-Year complete maintenance package added
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Enjoy complete ownership package for 1-Year
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCelebrationToast(false)}
                className="w-full py-2.5 bg-[#00C9AF] hover:bg-[#00b29a] text-[#0C1B33] font-black text-xs rounded-xl shadow-md cursor-pointer transition-all mt-2"
              >
                Great!
              </button>
            </div>
          </div>
        </div>
      </>
      )}

      {/* Full-Fidelity Complete Maintenance Package Details Modal / Drawer (Matching Screenshots 1, 2, 3, 4, 5) */}
      {isMaintenanceDetailsOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsMaintenanceDetailsOpen(false)} />
          <div className="bg-[#F8FAFC] w-full max-w-lg h-full sm:h-[92vh] sm:rounded-3xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250 border border-slate-200">
            
            {/* Top Navigation Bar */}
            <div className="bg-white px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs z-20">
              <button
                type="button"
                onClick={() => setIsMaintenanceDetailsOpen(false)}
                className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#0F172A] hover:text-[#00A38D] cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>Complete Maintenance Package</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMaintenanceDetailsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pb-28">
              
              {/* Hero Dark Teal Header Card */}
              <div className="bg-gradient-to-br from-[#0C1B33] via-[#1E293B] to-[#04433d] text-white p-5 pt-6 relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div className="max-w-[62%]">
                    <h2 className="text-xl sm:text-2xl font-black leading-tight">
                      <span className="relative inline-block text-[#00C9AF]">
                        1-Year
                        <svg className="absolute -bottom-1 left-0 w-full h-2 text-amber-400" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="4">
                          <path d="M0,10 Q50,20 100,10" />
                        </svg>
                      </span> complete maintenance package
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-2">
                      {maintenancePaymentType === 'full' ? '₹11,287 in full' : '₹11,881 or ₹990/m (for 12 months)'}
                    </p>
                  </div>

                  {/* 3D Toolbox Graphic Card */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center shrink-0">
                    <img 
                      src="/images/maintenance-package-icon.png" 
                      alt="Complete Maintenance Package" 
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl object-cover shadow-2xl border border-white/20 transform rotate-2" 
                    />
                  </div>
                </div>

                {/* Scalloped Green Wave Top Ribbon */}
                <div className="mt-4 -mx-5 -mb-5 bg-[#00C9AF] text-[#0C1B33] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md">
                  <span>🎉 Saving ₹1,320 on package + upto ₹30,000 on upgrade</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-4 sm:p-5 space-y-4">
                
                {/* 1. Warranty - Super Protect Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div 
                    onClick={() => setExpandedFeature(expandedFeature === 'warranty' ? null : 'warranty')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                        <Wrench size={22} className="text-amber-500 transform -rotate-12" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Warranty - Super Protect</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Covers all parts for upto 1 year</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹7,437</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹8,263</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹826
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'warranty' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 5) */}
                  {expandedFeature === 'warranty' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">
                      
                      {/* Powertrain coverage */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Powertrain coverage <span className="text-[10px] text-slate-400 font-semibold">(For 12 months/ 12,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Car size={13} className="text-[#00C9AF]" /> Engine & peripherals
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <RotateCcw size={13} className="text-[#00C9AF]" /> Transmission
                          </span>
                        </div>
                      </div>

                      {/* Key Systems */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Key Systems <span className="text-[10px] text-slate-400 font-semibold">(For 3 months/ 3,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <ShieldCheck size={13} className="text-[#00C9AF]" /> Steering system
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <CheckCircle2 size={13} className="text-[#00C9AF]" /> Braking system
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Air conditioning
                          </span>
                        </div>
                      </div>

                      {/* Functional */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Functional <span className="text-[10px] text-slate-400 font-semibold">(For 3 months/ 3,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <ShieldCheck size={13} className="text-[#00C9AF]" /> Suspension
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Info size={13} className="text-[#00C9AF]" /> Electrical & electronic systems
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Infotainment & comfort features
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Interior & exterior functional components
                          </span>
                        </div>
                      </div>

                      {/* Disclaimer Note */}
                      <div className="pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-400 leading-relaxed font-medium">
                        Note: Does not cover accident damage, wear & tear consumables, cosmetic issues, misuse, flooding, or modifications.
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Periodic Service Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div 
                    onClick={() => setExpandedFeature(expandedFeature === 'periodic' ? null : 'periodic')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Wrench size={20} className="text-[#00A38D]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Periodic service</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Scheduled service for every 12,000 km driven</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹3,905</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹4,339</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹434
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'periodic' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 6) */}
                  {expandedFeature === 'periodic' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-2">Standard service</div>
                        <ul className="space-y-2 text-[11px] text-slate-700 font-medium">
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Engine oil & oil filter replacement</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Air filter replacement</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Basic brake servicing & fluid top-ups</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Coolant & washer fluid replenishment</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Car health scan & essential checks</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Interior vacuuming & exterior wash</li>
                        </ul>
                      </div>

                      {/* 2 Boxes: What this covers / What this doesn't cover */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-[#0F172A] flex items-center gap-1 text-[11px] mb-1">
                            <Check size={12} className="text-[#00C9AF]" /> What this covers
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            One scheduled annual service <strong className="text-[#00C9AF]">12 months</strong> (or 12,000 km)
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-[#0F172A] flex items-center gap-1 text-[11px] mb-1">
                            <X size={12} className="text-rose-500" /> What this doesn't cover
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            Repairs or part replacements outside the service scope.
                          </p>
                        </div>
                      </div>

                      {/* Partner badge */}
                      <div className="text-center pt-2 text-[10px] font-bold text-slate-400">
                        POWERED BY <strong className="text-slate-700">SELECTT CERTIFIED WORKSHOPS</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Roadside Assistance 24x7 Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div 
                    onClick={() => setExpandedFeature(expandedFeature === 'rsa' ? null : 'rsa')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Navigation size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Roadside side assistance 24x7</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Stuck on the road? We've got you - 24x7</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹539</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹599</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹60
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'rsa' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 7) */}
                  {expandedFeature === 'rsa' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                      <div className="text-xs font-black text-[#0F172A] mb-1.5">Benefits</div>
                      <ul className="space-y-2 text-[11px] text-slate-700 font-medium">
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Dead battery? On-spot jump-start</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Flat tyre? Repaired or spare fitted, roadside</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Locked your keys in? Lockout help</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Out of fuel? We bring enough to reach the pump</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Minor breakdown? On-spot fix to get you moving</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Can't be fixed roadside? Free towing to nearest garage</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Plus (+) Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center text-xs font-black shadow-2xs">
                    +
                  </div>
                </div>

                {/* 4. Upgrade Discount Card (With Green FREE Ribbon) */}
                <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-2xs relative flex">
                  <div className="bg-[#00C9AF] text-[#0C1B33] px-2 py-4 flex items-center justify-center font-black text-[10px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 shrink-0">
                    FREE
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="font-black text-[#0F172A] text-sm">
                      Get up-to ₹30,000 off on upgrade
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      Sell this car back to Selectt when you upgrade and get <strong className="text-emerald-700">₹10,000 assured coupon</strong> + up to <strong className="text-emerald-700">₹20,000 off</strong> your next purchase.
                    </p>
                  </div>
                </div>

                {/* Trust Stats Strip (Teal brand style) */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3.5 grid grid-cols-3 divide-x divide-teal-200 text-center">
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">4.8 ★</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">AVG RATING</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">3,556+</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">HAPPY OWNERS</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">₹20,000</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">SAVED ON REPAIRS</span>
                  </div>
                </div>

                {/* FAQs Section (Matching Screenshots 3, 4, 5) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="font-black text-[#0F172A] text-base">FAQs</h3>

                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        q: "What is the Complete Maintenance Package (CMP)?",
                        a: "CMP is a single bundle that covers your car after purchase — Extended Warranty, Periodic Service, 24x7 Roadside Assistance, an Upgrade Voucher for your next Selectt car, and (on eligible cars) a 90-day Buyback assurance. Buying them together costs less than buying each separately."
                      },
                      {
                        q: "What does the warranty cover, and what's not covered?",
                        a: "Super Protect covers 100% of engine components, transmission (manual & automatic), steering, braking, AC, suspension, and electrical systems. It does not cover accidental damage, regular wear-and-tear consumables (wipers, tyres), cosmetic damages, or external flooding."
                      },
                      {
                        q: "How do I pay for CMP — all at once or monthly?",
                        a: "You can choose either 'Pay in full' for ₹11,287 (which gives you an extra ₹594 discount) or 'Pay monthly' at ₹990/month for 12 months with easy zero-cost UPI autopay setup on delivery day."
                      },
                      {
                        q: "When does my coverage start?",
                        a: "Your coverage begins on the exact day of vehicle delivery and remains valid for a full 12 months or 12,000 km (whichever occurs first)."
                      },
                      {
                        q: "What is the 90-day Buyback assurance?",
                        a: "If you decide to upgrade or sell within 90 days, Selectt guarantees a pre-determined locked valuation with minimal depreciation."
                      },
                      {
                        q: "Can I choose only some services instead of the full package?",
                        a: "CMP is specifically curated as an all-inclusive bundle to give you maximum savings (saving ₹31,320+ across 1 year). Individual services cost significantly more when purchased separately."
                      },
                      {
                        q: "How does the Upgrade Voucher work?",
                        a: "When you trade-in or sell this car back to Selectt in future, you get an instant ₹10,000 assured upgrade coupon + up to ₹20,000 discount on your next vehicle purchase."
                      },
                      {
                        q: "Can I buy CMP or the warranty after I've booked, or after delivery?",
                        a: "Yes, you can add CMP anytime before or on the delivery day. After delivery, special bundled pricing may expire."
                      },
                      {
                        q: "What happens to my coverage if a monthly payment fails?",
                        a: "We provide a 5-day grace period with automatic payment retry links sent to your WhatsApp and SMS so your coverage never gets interrupted."
                      },
                      {
                        q: "Can I cancel, and will I get a refund?",
                        a: "Yes, if you cancel your car booking prior to delivery, the CMP is 100% refunded along with your booking token deposit."
                      },
                      {
                        q: "How does Roadside Assistance work, and how is my service fulfilled?",
                        a: "Simply call our dedicated 24x7 helpline or click 'Request RSA' from your Selectt profile. A certified breakdown support team is dispatched to your GPS location with an average arrival time under 45 minutes."
                      }
                    ].map((faq, fIdx) => (
                      <div key={fIdx} className="py-2.5">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? -1 : fIdx)}
                          className="w-full text-left flex items-center justify-between gap-3 text-xs font-black text-[#0F172A] hover:text-[#00A38D] cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-slate-400 shrink-0">
                            {openFaqIndex === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>
                        {openFaqIndex === fIdx && (
                          <p className="text-[11px] text-slate-600 font-medium mt-2 leading-relaxed animate-in fade-in duration-150">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Footer */}
                <div className="text-center pt-1 pb-4">
                  <span className="text-[11px] text-slate-400 underline font-medium cursor-pointer">
                    Terms & Conditions apply
                  </span>
                </div>

              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] z-30 text-center space-y-2">
              <p className="text-xs font-black text-[#0F172A]">
                {maintenancePaymentType === 'full' 
                  ? 'You are paying in full ₹11,287' 
                  : 'You are paying monthly ₹990/m for 12 months'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsMaintenanceDetailsOpen(false);
                  setIsMaintenanceModalOpen(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] rounded-2xl font-black text-sm shadow-md shadow-[#00C9AF]/25 transition-all cursor-pointer"
              >
                {maintenancePackageAdded ? 'Change Payment Type' : 'Add Maintenance Package'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Sticky Footer Popup for Car Loan (Mobile Only) */}
      {mobileLoanPromptVisible && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-4 pb-5 bg-white rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.18)] border-t border-slate-200/90 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto">
            <div className="flex items-start gap-3 mb-3.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0 font-black text-sm">
                ₹
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#0C1B33] text-[15px] leading-tight mb-1">
                  Interested in car loan?
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  Get your car financed at attractive interest rates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setInterestedInLoan(false);
                  setMobileLoanPromptVisible(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer"
              >
                No, thanks
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterestedInLoan(true);
                  setMobileLoanPromptVisible(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00C9AF] hover:bg-[#00b29a] active:scale-[0.98] text-[#0C1B33] font-black text-xs sm:text-sm shadow-md shadow-[#00C9AF]/25 transition-all duration-150 cursor-pointer"
              >
                Yes, I'm interested
              </button>
            </div>

            {/* Slider Dots Indicator */}
            <div className="flex justify-center items-center gap-1 mt-2.5">
              <span className="w-4 h-1 rounded-full bg-slate-200" />
              <span className="w-1.5 h-1 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      )}

      {/* Price Summary Breakdown Popup Modal */}
      {isPriceSummaryOpen && car && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsPriceSummaryOpen(false)} 
          />
          <div className="bg-[#f8f9fa] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-20">
              <h3 className="font-heading font-extrabold text-[#0C1B33] text-lg sm:text-xl">
                Price Summary
              </h3>
              <button
                type="button"
                onClick={() => setIsPriceSummaryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close price summary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              
              {/* Savings Banner */}
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck size={16} />
                </div>
                <span>Yay! You are saving ₹{((car.original_price && car.original_price > car.price) ? (car.original_price - car.price) : 22000).toLocaleString()}</span>
              </div>

              {/* Fixed Price Assured Notice */}
              <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3.5 flex items-center gap-2.5 text-teal-950 text-xs sm:text-sm font-bold shadow-xs">
                <div className="w-7 h-7 rounded-full bg-[#00A38D] text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-black">
                  ₹
                </div>
                <span>Fixed price assured! To save you time on negotiations</span>
              </div>

              {/* White Breakdown Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-xs sm:text-sm">
                
                {/* Subtotal / Car Price */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-[#0C1B33] font-price">
                    ₹{((car.original_price && car.original_price > car.price ? car.original_price : (car.price + 22000))).toLocaleString()}
                  </span>
                </div>

                {/* Sale Discount */}
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-500" /> Sale Discount
                  </span>
                  <span className="font-price">
                    - ₹{((car.original_price && car.original_price > car.price) ? (car.original_price - car.price) : 22000).toLocaleString()}
                  </span>
                </div>

                {/* RC Transfer Facilitation */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">RC transfer facilitation</span>
                  <span className="font-bold text-[#0C1B33] font-price">+ ₹4,000</span>
                </div>

                {/* Servicing, Cleaning, Fuel */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    Servicing, cleaning, fuel & more <Info size={13} className="text-slate-400" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through font-normal text-xs font-price">₹10,700</span>
                    <span className="text-emerald-600 font-bold">Included</span>
                  </div>
                </div>

                {/* Warranty */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    Warranty (Protect)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through font-normal text-xs font-price">₹4,950</span>
                    <span className="text-emerald-600 font-bold">Included</span>
                  </div>
                </div>

                {/* Fixes & Upgrades */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    Fixes & upgrades <Info size={13} className="text-slate-400" />
                  </span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>

                {/* GST Taxes */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium flex items-center gap-1">
                    GST (govt. taxes) <Info size={13} className="text-slate-400" />
                  </span>
                  <span className="font-bold text-[#0C1B33] font-price">₹2,691</span>
                </div>

                {/* Total On-road Price Divider */}
                <div className="pt-4 mt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base">
                    Total on-road price
                  </span>
                  <span className="font-heading font-black text-[#0C1B33] text-lg sm:text-xl font-price">
                    ₹{((car.price || 550000) + 4000 + 2691).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Best-in-class values Section */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-3 my-4">
                  <div className="h-px bg-slate-200 flex-1 max-w-[70px]" />
                  <span className="font-bold text-[#0C1B33] text-xs sm:text-sm tracking-tight">
                    Best-in-class values
                  </span>
                  <div className="h-px bg-slate-200 flex-1 max-w-[70px]" />
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5 mb-4">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed flex-1">
                    Thorough inspection, expert refurbishment & cleaning has been conducted by our professionals.
                  </p>
                  <div className="w-16 h-14 shrink-0 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-center text-[#00C9AF] shadow-inner">
                    <Car size={30} strokeWidth={1.7} />
                  </div>
                </div>

                {/* SELECTT ASSURED BENEFITS Grid (Creative, Colorful, Highly Informative) */}
                <div className="bg-gradient-to-br from-slate-900 via-[#0C1B33] to-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                  
                  {/* Glowing decorative background aura */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C9AF]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-[#00C9AF]/15 border border-[#00C9AF]/40 px-3.5 py-1.5 rounded-full shadow-sm">
                      <Sparkles size={14} className="text-[#00C9AF] animate-pulse" />
                      <span className="text-xs font-black text-[#00C9AF] uppercase tracking-wider">
                        SELECTT ASSURED BENEFITS
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline-block">
                      100% Peace of Mind
                    </span>
                  </div>

                  {/* 6 Colorful, Informative Value Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                    
                    {/* Card 1: Warranty */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">6 Months Warranty</h4>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md uppercase">
                              COMPREHENSIVE
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Complete engine, transmission, steering & electrical coverage with zero deductible.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: 5-Day Money Back */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-amber-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                          <RotateCcw size={19} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">5-Day Money Back</h4>
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded-md uppercase">
                              NO RISK
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Love your car or return it within 5 days / 250 km for a 100% full refund. No questions asked.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Lowest EMI */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-cyan-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                          <CreditCard size={19} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">Lowest EMIs & Loans</h4>
                            <span className="text-[9px] bg-cyan-100 text-cyan-900 font-black px-1.5 py-0.5 rounded-md uppercase">
                              FROM 8.9% ROI
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Fast on-spot loan approvals from top partner banks with flexible 12 to 84 months tenure.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Strict 200-Point Selection */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-rose-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                          <Car size={19} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">1 in 20 Selection</h4>
                            <span className="text-[9px] bg-rose-100 text-rose-900 font-black px-1.5 py-0.5 rounded-md uppercase">
                              TOP 5% ONLY
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            200-point rigorous check: 100% non-accidental, non-flooded, verified odometer history.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 5: Showroom Refurbished */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-indigo-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                          <Sparkles size={19} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">Quality Assured</h4>
                            <span className="text-[9px] bg-indigo-100 text-indigo-900 font-black px-1.5 py-0.5 rounded-md uppercase">
                              REFURBISHED
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Detailed mechanical restoration, multi-stage paint polish, and deep ozone sanitization.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 6: Assured Buyback */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-teal-200/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0C1B33] to-[#00C9AF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00C9AF]/25 group-hover:scale-105 transition-transform">
                          <Gift size={19} className="text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="font-extrabold text-[#0C1B33] text-xs sm:text-sm">Buyback Guarantee</h4>
                            <span className="text-[9px] bg-[#00C9AF]/20 text-teal-900 font-black px-1.5 py-0.5 rounded-md uppercase">
                              ASSURED PRICE
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            Guaranteed locked valuation for up to 12 months with up to ₹30,000 extra upgrade bonus.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 3 Price Breakdown Info Modals (Servicing, Fixes, GST) */}
      {activeBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-slideUp flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00C9AF]/15 text-[#008975] flex items-center justify-center font-black">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-[#0C1B33] text-base sm:text-lg capitalize">
                    {activeBreakdownModal === 'servicing' && 'Servicing, cleaning, fuel & more'}
                    {activeBreakdownModal === 'fixes' && 'Fixes & upgrades'}
                    {activeBreakdownModal === 'gst' && 'GST (govt. taxes)'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {activeBreakdownModal === 'servicing' && 'Selectt Assured Pre-Delivery Care • ₹8,700 Value'}
                    {activeBreakdownModal === 'fixes' && 'Complete Quality Restoration & Refurbishment'}
                    {activeBreakdownModal === 'gst' && '18% Statutory Tax on Facilitation Services'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBreakdownModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* 1. Servicing Details */}
              {activeBreakdownModal === 'servicing' && (
                <>
                  <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 font-semibold flex items-center gap-2.5">
                    <Sparkles size={18} className="text-emerald-600 shrink-0" />
                    <span>Every Selectt vehicle undergoes premium servicing, multi-stage detailing, and fuel top-up at zero extra cost to you!</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0C1B33]">Comprehensive Periodic Servicing</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Engine oil flush & replacement, synthetic filter change, spark plugs cleaning, brake fluid & coolant top-up.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-slate-400 line-through text-[11px] font-semibold block font-price">₹4,200</span>
                        <span className="text-xs font-extrabold text-emerald-600 uppercase">FREE</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0C1B33]">Deep Interior & Exterior Detailing</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Full interior upholstery shampooing, seat dry clean, dashboard UV dressing, and 3-step high-gloss exterior buffing.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-slate-400 line-through text-[11px] font-semibold block font-price">₹2,800</span>
                        <span className="text-xs font-extrabold text-emerald-600 uppercase">FREE</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0C1B33]">Complimentary Fuel & Fluids</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          5 Litres pre-delivery fuel in the tank so you can drive home smoothly from delivery hub, plus windshield wiper fluid.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-slate-400 line-through text-[11px] font-semibold block font-price">₹1,200</span>
                        <span className="text-xs font-extrabold text-emerald-600 uppercase">FREE</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0C1B33]">Anti-Bacterial Ozone Cabin Treatment</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Complete AC duct disinfectant & 99.9% germ elimination treatment for healthy cabin air.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-slate-400 line-through text-[11px] font-semibold block font-price">₹500</span>
                        <span className="text-xs font-extrabold text-emerald-600 uppercase">FREE</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-100/90 rounded-2xl p-3.5 flex items-center justify-between font-bold text-xs sm:text-sm">
                    <span className="text-slate-700">Total Pre-Delivery Value</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 line-through text-xs font-price">₹8,700</span>
                      <span className="text-emerald-700 font-extrabold text-sm">₹0 (100% Included)</span>
                    </div>
                  </div>
                </>
              )}

              {/* 2. Fixes & Upgrades Details */}
              {activeBreakdownModal === 'fixes' && (
                <>
                  <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-3.5 text-xs text-indigo-950 font-semibold flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-indigo-600 shrink-0" />
                    <span>Every car is thoroughly tested across 200 checkpoints. All mechanical wear and minor cosmetic blemishes are fixed before delivery.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0C1B33]">Mechanical Tuning</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">COMPLETED</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Brake pad tuning, suspension alignment, clutch calibration & smooth gear shifting.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0C1B33]">Electrical & AC Diagnostics</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">TESTED</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        AC cooling efficiency verified, sensor check, infotainment & speakers functional check.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0C1B33]">Paint & Dent Restoration</span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-sm">RESTORED</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Minor paint scratch touch-up, high-grade paint sealant, and headlight lens buffing.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0C1B33]">Tires & Wheel Balancing</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">BALANCED</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Tire tread life &gt;70% assured, laser wheel alignment, and accurate pressure balancing.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Refurbishment Cost to Customer</span>
                    <span className="text-emerald-700 font-extrabold text-sm font-price">₹0 (Included in Price)</span>
                  </div>
                </>
              )}

              {/* 3. GST Details */}
              {activeBreakdownModal === 'gst' && (
                <>
                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 font-semibold flex items-center gap-2.5">
                    <Info size={18} className="text-amber-600 shrink-0" />
                    <span>GST (Goods & Services Tax) is charged strictly at 18% on facilitation and documentation service charges in compliance with Govt of India regulations.</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-[#0C1B33]">18% GST on RC Facilitation</h4>
                        <p className="text-[11px] text-slate-500">18% tax on ₹4,000 RC transfer service</p>
                      </div>
                      <span className="font-extrabold text-[#0C1B33] font-price">₹720</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-[#0C1B33]">18% GST on Documentation & Inspection</h4>
                        <p className="text-[11px] text-slate-500">Processing, background check & legal paperwork</p>
                      </div>
                      <span className="font-extrabold text-[#0C1B33] font-price">₹1,710</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-[#0C1B33]">GST on Pre-Owned Car Margin</h4>
                        <p className="text-[11px] text-slate-500">Pre-owned vehicle tax under margin scheme</p>
                      </div>
                      <span className="font-bold text-emerald-600 uppercase text-[11px]">Covered by Selectt</span>
                    </div>
                  </div>

                  <div className="bg-slate-100/90 rounded-2xl p-3.5 flex items-center justify-between font-bold text-xs sm:text-sm">
                    <span className="text-slate-700">Total Statutory Govt. Taxes</span>
                    <span className="text-[#0C1B33] font-extrabold text-sm font-price">₹2,430</span>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBreakdownModal(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_CARS } from '../data/mockCars';
import { CheckCircle2, Phone, CreditCard, Gift, ShieldCheck, MapPin, Search, ChevronRight, X, FileText } from 'lucide-react';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../config/api';
import PageMeta from '../components/common/PageMeta';
import TestDriveModal from '../components/buy/TestDriveModal';

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
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [scheduledTestDrive, setScheduledTestDrive] = useState(null);

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
          final_amount: car.price,
          booking_amount: 5000,
          interested_in_loan: interestedInLoan
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
          amount: 5000,
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
      <div className="bg-[#f9f9f9] min-h-screen pt-4 lg:pt-8 pb-12 font-sans text-slate-800 relative">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Flow Options */}
            <div className="space-y-6">

              {/* Finance Option */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#000] font-black text-base sm:text-lg tracking-tight italic flex items-center">
                      Get Finance This
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0C1B33] text-base mb-1.5">Interested in car loan?</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Get your car financed at attractive interest rates. <a href="/privacy-policy" className="text-[#00C9AF] font-bold hover:underline">Learn more</a>
                  </p>
                </div>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    id="interested_in_loan"
                    checked={interestedInLoan}
                    onChange={e => setInterestedInLoan(e.target.checked)}
                    className="w-5 h-5 accent-[#0C1B33] border-slate-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Test Drive Details */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-[#0C1B33] text-base mb-4">Test drive details</h3>
                {scheduledTestDrive ? (
                  <div className="flex justify-between items-center bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 mb-4">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-800">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      </div>
                      <span>Scheduled: <strong>{scheduledTestDrive.slot}</strong> on <strong>{scheduledTestDrive.date_day}</strong> ({scheduledTestDrive.location === 'hub' ? 'Selectt Hub' : 'Doorstep'})</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-600">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <X size={14} className="text-slate-500" />
                      </div>
                      <span>Test drive not scheduled</span>
                    </div>
                  </div>
                )}
                <div className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center justify-between pt-1">
                  <span>{scheduledTestDrive ? 'Want to reschedule?' : 'Changed your mind?'}</span>
                  <button onClick={() => setIsTestDriveOpen(true)} className="text-[#00C9AF] font-black text-sm flex items-center gap-1 hover:underline cursor-pointer">
                    {scheduledTestDrive ? 'Reschedule' : 'Find a slot'} <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              {/* Pay Action Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 bg-white">
                  <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                    This car will be booked on<br />
                    <span className="text-[#0C1B33] text-sm font-extrabold">{user.phone}</span>
                    <button className="text-[#00C9AF] font-bold ml-2 hover:underline cursor-pointer">EDIT</button>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className={`relative overflow-hidden w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] font-semibold py-3.5 sm:py-4 px-7 rounded-xl transition-all duration-300 shadow-[0_0_22px_rgba(0,201,175,0.45)] hover:shadow-[0_0_32px_rgba(0,201,175,0.6)] flex items-center justify-center gap-2.5 cursor-pointer text-[15px] leading-[1.45] transform hover:scale-[1.02] active:scale-[0.98] group ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {/* Continuous Shimmer Light Wave Effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/45 to-transparent -translate-x-full animate-[shimmer_2.4s_infinite] pointer-events-none" />

                    {isBooking ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <span className="w-4 h-4 border-2 border-[#0C1B33] border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2.5 relative z-10">
                        <ShieldCheck size={19} className="text-[#0C1B33] shrink-0 group-hover:rotate-12 transition-transform" />
                        <span>Proceed to pay</span>
                        <span className="bg-[#0C1B33]/15 text-[#0C1B33] px-2.5 py-0.5 rounded-lg text-sm sm:text-base font-bold font-price shadow-inner">₹5,000</span>
                        <ChevronRight size={20} className="text-[#0C1B33] shrink-0 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Reassurance & Security Section */}
                <div className="bg-[#0C1B33] text-white p-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#00C9AF] shrink-0 shadow-inner">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-sm font-semibold text-[#00C9AF] mb-1 flex items-center justify-center sm:justify-start gap-1">
                      100% refundable deposit
                    </div>
                    <p className="text-[12px] text-slate-300 font-normal leading-relaxed">
                      Your payment information is safe and secure. We use bank-grade security for all transactions. Cancel anytime for a full refund.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-4">

              {/* Savings Banner */}
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-4 py-3 flex items-center gap-2.5 text-emerald-800 text-[14px] font-medium shadow-xs">
                <Gift size={17} className="text-emerald-600 shrink-0" /> Yay! You are saving ₹22,000
              </div>

              {/* Car Snapshot & Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative">
                {/* Header Car Info */}
                <div className="p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 border-b border-slate-100 rounded-t-2xl">
                  <div className="w-24 h-20 sm:w-28 sm:h-22 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
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
                    <h3 className="font-heading font-semibold text-[#0F172A] text-[16px] sm:text-[17px] leading-snug mb-1 truncate">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <div className="text-[12px] sm:text-[13px] text-slate-500 font-normal flex items-center gap-1.5 mb-1.5 truncate">
                      <span>{(car.km || 0).toLocaleString()} Km</span> • <span>{car.fuelType}</span> • <span>{car.transmission}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-price font-bold text-[#0F172A] text-lg sm:text-xl whitespace-nowrap leading-none">
                        ₹{(car.price / 100000).toFixed(2)} Lakh
                      </span>
                      <span className="text-[12px] sm:text-[13px] text-slate-400 line-through font-normal font-price whitespace-nowrap">
                        ₹{((car.price + 22000) / 100000).toFixed(2)} Lakh
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Amount Highlight */}
                <div className="px-4 py-3.5 sm:px-5 bg-emerald-50/50 flex justify-between items-center border-b border-slate-100">
                  <div className="flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-emerald-900">
                    <CheckCircle2 size={17} className="text-emerald-600" /> Booking amount
                  </div>
                  <div className="font-price font-bold text-[#0F172A] text-[17px]">₹5,000</div>
                </div>

                {/* 3-Day Delivery Discount Notice with Tooltip */}
                <div className="bg-slate-50/70 px-4 py-2 border-b border-slate-100 flex items-center gap-2 relative">
                  <span className="relative group inline-flex items-center">
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-slate-200/80 hover:bg-[#00C9AF]/20 hover:text-[#0C1B33] text-slate-500 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                      aria-label="Delivery discount details"
                    >
                      i
                    </button>
                    <div className="absolute top-full left-[-4px] mt-2 w-64 p-3 bg-[#0C1B33] text-white rounded-xl shadow-2xl border border-white/10 text-left z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100">
                      <div className="font-heading font-bold text-[11px] sm:text-xs text-[#00C9AF] mb-1">
                        Express Delivery Discount
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-200 font-normal font-sans">
                        To claim the promotional ₹22,000 discount, vehicle delivery or hub pickup must be scheduled within 3 days of booking.
                      </p>
                      <div className="absolute bottom-full left-3.5 border-4 border-transparent border-b-[#0C1B33]" />
                    </div>
                  </span>
                  <span className="text-[12px] text-slate-600 font-normal">Discount valid only for deliveries within 3 days of booking.</span>
                </div>

                {/* Breakdown List */}
                <div className="p-4 sm:p-5">
                  <h4 className="font-heading font-semibold text-[#0F172A] text-[16px] sm:text-[17px] mb-4">Price breakdown</h4>

                  <div className="space-y-3 text-[14px] sm:text-[15px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal">Car price</span>
                      <span className="text-[#0F172A] font-semibold font-price">₹{originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium"><Gift size={14} /> Sale discount</span>
                      <span className="font-semibold font-price text-emerald-600">- ₹22,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal">RC transfer facilitation</span>
                      <span className="text-[#0F172A] font-semibold font-price">+ ₹4,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal flex items-center gap-1.5">
                        Insurance
                        <span className="relative group inline-flex items-center">
                          <button
                            type="button"
                            className="w-3.5 h-3.5 rounded-full bg-slate-100 hover:bg-[#00C9AF]/20 hover:text-[#0C1B33] text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                            aria-label="Insurance details"
                          >
                            i
                          </button>
                          <div className="absolute bottom-full left-[-8px] mb-2 w-60 sm:w-64 p-3 bg-[#0C1B33] text-white rounded-xl shadow-2xl border border-white/10 text-left z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100">
                            <div className="font-heading font-bold text-[11px] sm:text-xs text-[#00C9AF] mb-1">
                              Insurance Coverage
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-200 font-normal font-sans">
                              Comprehensive insurance policy transfer assistance, verification, and legal road coverage compliance.
                            </p>
                            <div className="absolute top-full left-3 border-4 border-transparent border-t-[#0C1B33]" />
                          </div>
                        </span>
                      </span>
                      <span className="text-[#0F172A] font-semibold font-price">+ ₹4,420</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal flex items-center gap-1.5">
                        FASTag, fuel & more
                        <span className="relative group inline-flex items-center">
                          <button
                            type="button"
                            className="w-3.5 h-3.5 rounded-full bg-slate-100 hover:bg-[#00C9AF]/20 hover:text-[#0C1B33] text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                            aria-label="FASTag and fuel details"
                          >
                            i
                          </button>
                          <div className="absolute bottom-full left-[-8px] mb-2 w-60 sm:w-64 p-3 bg-[#0C1B33] text-white rounded-xl shadow-2xl border border-white/10 text-left z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100">
                            <div className="font-heading font-bold text-[11px] sm:text-xs text-[#00C9AF] mb-1">
                              Delivery Essentials
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-200 font-normal font-sans">
                              Pre-activated FASTag with balance, complimentary fuel top-up for your drive home, and pre-delivery sanitization.
                            </p>
                            <div className="absolute top-full left-3 border-4 border-transparent border-t-[#0C1B33]" />
                          </div>
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through text-[12px] font-normal font-price">₹5,700</span>
                        <span className="text-emerald-700 font-medium text-[12px] sm:text-[13px] bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md">Included</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-normal flex items-center gap-1.5">
                        Fixes & upgrades
                        <span className="relative group inline-flex items-center">
                          <button
                            type="button"
                            className="w-3.5 h-3.5 rounded-full bg-slate-100 hover:bg-[#00C9AF]/20 hover:text-[#0C1B33] text-slate-400 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                            aria-label="Fixes and upgrades details"
                          >
                            i
                          </button>
                          <div className="absolute bottom-full left-[-8px] mb-2 w-60 sm:w-64 p-3 bg-[#0C1B33] text-white rounded-xl shadow-2xl border border-white/10 text-left z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform scale-95 group-hover:scale-100">
                            <div className="font-heading font-bold text-[11px] sm:text-xs text-[#00C9AF] mb-1">
                              Refurbishment Included
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-200 font-normal font-sans">
                              200-point inspection repairs, fluid top-ups, mechanical tune-ups, and cosmetic upgrades included at zero extra charge.
                            </p>
                            <div className="absolute top-full left-3 border-4 border-transparent border-t-[#0C1B33]" />
                          </div>
                        </span>
                      </span>
                      <span className="text-emerald-700 font-medium text-[12px] sm:text-[13px] bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md">Included</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-heading font-semibold text-slate-800 text-[15px] sm:text-[16px]">Final amount</span>
                      <span className="font-price font-bold text-[#00A38D] text-xl sm:text-[22px]">₹{car.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer of summary */}
                <div className="bg-slate-50/80 py-3 px-4 text-center border-t border-slate-100 rounded-b-2xl flex items-center justify-center gap-1.5 text-slate-600 text-[13px] font-medium">
                  <ShieldCheck size={16} className="text-[#00A38D]" />
                  <span>100% secure payment gateway</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* What Happens Next - Expanded Full Width Section */}
        <div className="max-w-7xl mx-auto px-4 mt-16 sm:mt-20">
          <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#0F172A] text-center mb-8 flex items-center justify-center gap-4">
            <div className="h-px bg-slate-200 flex-1 max-w-[150px]" />
            <span>What happens next</span>
            <div className="h-px bg-slate-200 flex-1 max-w-[150px]" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search size={24} className="text-[#00C9AF]" />,
                title: '1. Discover your ride',
                desc: 'Book and reserve any car exclusively for yourself for up to 3 days.',
                bgClass: 'bg-gradient-to-br from-[#0C1B33] to-[#122A4F] border-[#00C9AF]/30',
                glow: 'shadow-[#00C9AF]/10'
              },
              {
                icon: <FileText size={24} className="text-cyan-400" />,
                title: '2. Submit documents effortlessly',
                desc: 'We\'ll handle all the paperwork to make the process simple and stress-free.',
                bgClass: 'bg-gradient-to-br from-[#121E36] to-[#1A2D52] border-cyan-500/30',
                glow: 'shadow-cyan-400/10'
              },
              {
                icon: <CreditCard size={24} className="text-purple-400" />,
                title: '3. Pay the balance, your way',
                desc: 'Choose from a range of payment options - pay in full or finance your purchase.',
                bgClass: 'bg-gradient-to-br from-[#19192C] to-[#262642] border-purple-500/30',
                glow: 'shadow-purple-400/10'
              },
              {
                icon: <MapPin size={24} className="text-rose-400" />,
                title: '4. Delivered to your doorstep',
                desc: 'Sit back and relax while we bring your dream car to your doorstep - it\'s that easy!',
                bgClass: 'bg-gradient-to-br from-[#1F1426] to-[#331E3D] border-rose-500/30',
                glow: 'shadow-rose-400/10'
              }
            ].map((step, idx) => (
              <div key={idx} className={`p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center border hover:-translate-y-1.5 transition-all duration-300 shadow-xl ${step.bgClass} ${step.glow}`}>
                <div className="w-12 h-12 p-2.5 border border-white/15 rounded-2xl flex items-center justify-center bg-white/10 mb-4 shadow-md shrink-0">
                  {step.icon}
                </div>
                <h4 className="font-heading font-semibold text-white text-[16px] sm:text-[17px] mb-2 leading-snug max-w-[260px]">{step.title}</h4>
                <p className="text-[13px] text-slate-300 font-normal leading-relaxed max-w-[260px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TestDriveModal
        car={car}
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        onSuccess={(details) => setScheduledTestDrive(details)}
      />
    </>
  );
};

export default CheckoutPage;


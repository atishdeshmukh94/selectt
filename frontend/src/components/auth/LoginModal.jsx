import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../../config/api';

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp, redirectAfterLogin, prefilledPhone, setPrefilledPhone } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Phone, 2=OTP, 3=Registration, 4=Verified
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(localStorage.getItem('user_city') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!isLoginModalOpen) {
      setIsKeyboardOpen(false);
      return;
    }

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.85;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleViewportChange);
      vv.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', handleViewportChange);
        vv.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, [isLoginModalOpen]);

  useEffect(() => {
    if (isLoginModalOpen) {
      fetch(`${API_URL}/api/settings/public`)
        .then(res => res.json())
        .then(data => {
          if (data.login_modal_banner) {
            const img = data.login_modal_banner;
            setCustomBannerUrl(img.startsWith('http') ? img : `${API_URL}${img}`);
          }
        })
        .catch(() => { });

      if (prefilledPhone && prefilledPhone.length === 10) {
        setPhoneNumber(prefilledPhone);
        setStep(2);
        setError('');
        setLoading(true);
        setOtpHint('');
        sendOtp(prefilledPhone)
          .then((data) => {
            if (data && data.otp) {
              setOtpHint(data.otp);
            }
          })
          .catch((err) => {
            setError(err.message || 'Failed to send OTP. Please check your number.');
            setStep(1);
          })
          .finally(() => {
            setLoading(false);
            setPrefilledPhone('');
          });
      } else {
        setPhoneNumber('');
        setStep(1);
        setError('');
        setOtpHint('');
        setOtpDigits(['', '', '', '', '', '']);
        setOtp('');
      }
    }
  }, [isLoginModalOpen, prefilledPhone]);

  if (!isLoginModalOpen) return null;

  const handleInputFocus = () => {
    setIsKeyboardOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        setIsKeyboardOpen(false);
      }
    }, 200);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtp(newDigits.join(''));

    // Focus next field if digit entered
    if (digit && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pasteData.length > 0) {
      const newDigits = [...otpDigits];
      pasteData.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      setOtp(newDigits.join(''));

      // Focus the next empty field or the last one
      const nextIndex = Math.min(pasteData.length, 5);
      otpRefs.current[nextIndex]?.focus();
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;

    setError('');
    setLoading(true);
    setOtpHint('');

    try {
      const resData = await sendOtp(phoneNumber);
      setStep(2);
      if (resData && resData.otp) {
        setOtpHint(resData.otp);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp({ phone: phoneNumber, otp });
      if (data.existingUser) {
        // Show verified success screen then close
        setStep(4);
        setTimeout(() => {
          if (redirectAfterLogin) navigate(redirectAfterLogin);
          handleClose();
        }, 1800);
      } else {
        if (data.verificationToken) {
          setVerificationToken(data.verificationToken);
        }
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp({
        phone: phoneNumber,
        otp,
        verificationToken,
        firstName,
        lastName,
        email,
        city
      });
      if (redirectAfterLogin) navigate(redirectAfterLogin);
      handleClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPhoneNumber('');
    setOtpDigits(['', '', '', '', '', '']);
    setOtp('');
    setVerificationToken('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setCity(localStorage.getItem('user_city') || '');
    setError('');
    setIsKeyboardOpen(false);
    closeLoginModal();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#0C1B33]/50 backdrop-blur-[12px] animate-in fade-in duration-200 overflow-y-auto">

      {/* Outer Modal Container with flex layout for split design */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_24px_70px_rgba(12,27,51,0.25)] w-full max-w-sm sm:max-w-md md:max-w-[850px] relative group flex flex-col md:flex-row my-auto max-h-[calc(100dvh-2rem)] md:max-h-none overflow-hidden min-h-0 md:min-h-[535px]">

        {/* Left Side Banner (Hidden on Mobile, 450w x 535h on Desktop) */}
        <div className="hidden md:block w-[450px] min-w-[450px] h-[535px] relative overflow-hidden select-none shrink-0 bg-slate-900">
          <img
            src={customBannerUrl || "/login-banner-left-sdie.png"}
            alt="Selectt Login Banner"
            className="w-[450px] h-[535px] object-cover"
          />
        </div>

        {/* Right Side Form (Full Width on Mobile, Remaining Space on Desktop) */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-center relative text-left min-h-0 md:min-h-[535px] w-full max-w-full overflow-y-auto max-h-[calc(100dvh-2.5rem)] md:max-h-none">

          {/* Header Controls Bar */}
          <div className="flex items-center justify-between mb-2 sm:mb-4 shrink-0">
            {(step === 2 || step === 3) ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                aria-label="Back"
              >
                <ArrowLeft size={18} className="stroke-[2.5]" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleClose}
              className="p-2 -mr-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700 cursor-pointer ml-auto"
              aria-label="Close"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Form Content Steps */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-1 sm:pt-0">
              <h2 className="text-[22px] sm:text-[24px] font-heading font-semibold text-[#0F172A] mb-3 md:mb-6 pr-6 leading-[1.2]">
                Login or sign up
              </h2>

              {error && (
                <div className="mb-4 p-3 text-xs font-medium text-red-650 bg-red-50 border border-red-150 rounded-xl flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-[12px] sm:text-[13px] font-medium text-slate-600 mb-1.5 sm:mb-2">
                    Enter phone number
                  </label>
                  <div className="flex gap-2 sm:gap-2.5 w-full">
                    {/* Country Code Selector Box */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50/80 font-medium text-slate-800 text-sm shrink-0 select-none">
                      <img src="https://flagcdn.com/w20/in.png" alt="India Flag" className="w-4.5 sm:w-5 h-3 sm:h-3.5 object-cover rounded-sm" />
                      <span className="leading-none text-xs sm:text-sm font-semibold">91</span>
                    </div>
                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 sm:py-3.5 bg-slate-50/30 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 transition-all w-full"
                      maxLength="10"
                      autoComplete="off"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* WhatsApp Update Checkbox */}
                <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                  <input
                    type="checkbox"
                    id="whatsapp-updates"
                    defaultChecked
                    className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF]/30 cursor-pointer"
                  />
                  <label htmlFor="whatsapp-updates" className="text-[13px] font-medium text-slate-600 cursor-pointer select-none">
                    Get updates on WhatsApp
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={phoneNumber.length < 10 || loading}
                  className="w-full bg-[#0c1b33] hover:bg-[#162a4d] text-white font-semibold text-[15px] leading-[1.45] py-3.5 sm:py-4 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>

              {/* Legal disclaimer */}
              <div className="text-[11px] sm:text-[12px] text-slate-500 font-normal leading-relaxed mt-3 sm:mt-6">
                By continuing, you agree to Selectt's <a href="/terms-conditions" className="text-[#00C9AF] hover:underline font-semibold">Terms of service</a> &amp; <a href="/privacy-policy" className="text-[#00C9AF] hover:underline font-semibold">Privacy policy</a>, and Selectt NBFC's <a href="/terms-conditions" className="text-[#00C9AF] hover:underline font-semibold">Terms of Use</a> &amp; <a href="/terms-conditions" className="text-[#00C9AF] hover:underline font-semibold">TU CIBIL terms of use</a>.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-1 sm:pt-0">
              <h2 className="text-[22px] sm:text-[24px] font-heading font-semibold text-[#0F172A] mb-1 sm:mb-2 pr-6 leading-[1.2]">
                Verify OTP
              </h2>
              <p className="text-[14px] text-slate-600 font-normal leading-relaxed mb-3 sm:mb-6">
                Enter the 6-digit code sent to your WhatsApp number <strong className="text-[#0c1b33] font-semibold whitespace-nowrap">+91 {phoneNumber}</strong>
              </p>

              {otpHint && (
                <div className="mb-3 sm:mb-5 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl leading-relaxed">
                  <span className="font-semibold text-amber-800">Demo/Fallback code:</span> Enter <strong className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200 font-bold">{otpHint}</strong> to continue.
                </div>
              )}

              {error && (
                <div className="mb-3 sm:mb-5 p-3 text-xs font-medium text-red-650 bg-red-50 border border-red-150 rounded-xl flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit}>
                <div className="flex justify-between sm:justify-start gap-1.5 sm:gap-2.5 mb-4 sm:mb-8 overflow-x-auto py-1">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="tel"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      autoFocus={index === 0}
                      className="w-10 sm:w-11 h-11 sm:h-13 text-center text-lg sm:text-xl font-semibold border-2 border-slate-200 rounded-xl focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 focus:outline-none bg-slate-50/30 transition-all text-slate-800 shrink-0"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otp.length < 6 || loading}
                  className="w-full bg-[#0c1b33] hover:bg-[#162a4d] text-white font-semibold text-[15px] leading-[1.45] py-3.5 sm:py-4 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & continue'}
                </button>

                <div className="mt-4 sm:mt-6 text-xs sm:text-[13px] text-slate-500 font-medium">
                  Didn't receive code? <button type="button" onClick={handlePhoneSubmit} className="text-[#00C9AF] font-semibold hover:underline cursor-pointer">Resend on WhatsApp</button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-2 sm:pt-0">
              <h2 className="text-[22px] sm:text-[24px] font-heading font-semibold text-[#0F172A] mb-2 pr-6 leading-[1.2]">
                Complete profile
              </h2>
              <p className="text-[14px] text-slate-600 font-normal leading-relaxed mb-6">
                Almost there! Please tell us your name to finish setting up your account.
              </p>

              {error && (
                <div className="mb-5 p-3.5 text-xs font-medium text-red-650 bg-red-50 border border-red-150 rounded-xl flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[12px] sm:text-[13px] font-medium text-slate-600 mb-1.5">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      required
                      className="w-full px-3.5 sm:px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] sm:text-[13px] font-medium text-slate-600 mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="w-full px-3.5 sm:px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-medium text-slate-600 mb-1.5">Email address (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full px-3.5 sm:px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
                    placeholder="yourname@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-medium text-slate-600 mb-1.5">City (optional)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full px-3.5 sm:px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/15 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
                    placeholder="Your city"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!firstName || loading}
                  className="w-full bg-[#0c1b33] hover:bg-[#162a4d] text-white font-semibold text-[15px] leading-[1.45] py-3.5 sm:py-4 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-4 block"
                >
                  {loading ? 'Setting up account...' : 'Create account & continue'}
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#00C9AF]/10 border border-[#00C9AF]/20 flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px_rgba(0,201,175,0.15)]">
                <svg className="w-8 sm:w-10 h-8 sm:h-10 text-[#00C9AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[22px] sm:text-[24px] font-heading font-semibold text-[#0F172A] mb-2 leading-[1.2]">OTP verified!</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">You're now logged in. Welcome back! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

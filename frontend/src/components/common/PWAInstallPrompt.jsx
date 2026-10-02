import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, ShieldCheck, Zap, Bell, MoreVertical } from 'lucide-react';

const PWAInstallPrompt = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    if (typeof window !== 'undefined' && window.__pwaInstallPrompt) {
      return window.__pwaInstallPrompt;
    }
    return null;
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('selectt_pwa_installed') === 'true';
    return Boolean(isStandalone);
  });

  // Helper to check if PWA is already installed or dismissed within 30 mins
  const isInstalledOrCooldown = () => {
    if (typeof window === 'undefined') return true;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('selectt_pwa_installed') === 'true';

    if (isStandalone) return true;

    const dismissedUntil = localStorage.getItem('selectt_pwa_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return true;
    }

    return false;
  };

  // Global listeners for beforeinstallprompt & appinstalled events
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e;
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt captured successfully');
    };

    const handlePwaReady = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') window.__pwaInstallPrompt = null;
      localStorage.setItem('selectt_pwa_installed', 'true');
      console.log('[PWA] App successfully installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('selectt-pwa-ready', handlePwaReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('selectt-pwa-ready', handlePwaReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger 15-second timer on page open (only once per session/page, respected by 30-min cooldown)
  useEffect(() => {
    if (isInstalledOrCooldown()) {
      setShowPrompt(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!isInstalledOrCooldown()) {
        setShowPrompt(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null);

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          setIsInstalled(true);
          localStorage.setItem('selectt_pwa_installed', 'true');
          setShowPrompt(false);
        } else {
          console.log('[PWA] User dismissed native install prompt');
          handleDismiss();
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') window.__pwaInstallPrompt = null;
        return;
      } catch (err) {
        console.warn('[PWA] Native prompt execution error:', err);
      }
    }

    // If native prompt is not available (e.g. Brave, Chrome without active event, iOS, etc.):
    // DO NOT CLOSE! Switch to guided installation view right in the modal.
    setShowManualGuide(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowManualGuide(false);
    // 30 minute cooldown across all pages for this visitor
    const thirtyMinutesLater = Date.now() + 30 * 60 * 1000;
    localStorage.setItem('selectt_pwa_dismissed_until', String(thirtyMinutesLater));
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[370px] sm:max-w-[400px] overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.06)] text-slate-900 text-center"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* App Icon */}
          <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#12273F] border border-[#12273F] p-2 shadow-md shadow-[#12273F]/25 flex items-center justify-center">
            <img
              src="/pwa-icon-192.png"
              alt="Selectt App"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00C9AF] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>

          {/* Title & Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6FAF7] text-[#008A77] text-[11px] font-bold uppercase tracking-wider mb-3.5">
            <Zap size={12} /> Official Mobile App
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-[#0C1B33] mb-2.5">
            Install Selectt App
          </h3>

          <p className="text-slate-500 font-body text-xs sm:text-sm leading-relaxed mb-5 px-1">
            Lightning-fast browsing, test drive bookings, and real-time price-drop alerts.
          </p>

          {/* Step-by-Step Instructions when native prompt is unavailable or manual guide triggered */}
          {(showManualGuide || (isIOS && !deferredPrompt)) ? (
            isIOS ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-left animate-in fade-in duration-200">
                <p className="text-xs text-slate-800 font-bold mb-2 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#00C9AF]" /> Install on iPhone / iPad:
                </p>
                <div className="space-y-2 text-slate-600 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button <Share size={12} className="inline text-[#00C9AF] mx-0.5" /> in Safari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Scroll and tap <strong>"Add to Home Screen"</strong> <PlusSquare size={12} className="inline text-[#00C9AF] mx-0.5" /></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-5 text-left animate-in fade-in duration-200">
                <p className="text-xs text-slate-900 font-bold mb-2 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#00C9AF]" /> How to Install on your Phone:
                </p>
                <div className="space-y-2 text-slate-700 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tap browser menu (<strong><MoreVertical size={13} className="inline text-slate-800 -mt-0.5 mx-0.5" /></strong>) at top or bottom right</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Tap <strong>"Install"</strong> to confirm</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Feature Highlights Grid */
            <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <Zap size={15} className="text-[#00C9AF] shrink-0" />
                <span className="text-xs text-slate-700 font-semibold leading-tight">Fast 1-Click Access</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#00C9AF] shrink-0" />
                <span className="text-xs text-slate-700 font-semibold leading-tight">Verified History</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <Bell size={15} className="text-[#00C9AF] shrink-0" />
                <span className="text-xs text-slate-700 font-semibold leading-tight">Deal Alerts</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <Smartphone size={15} className="text-[#00C9AF] shrink-0" />
                <span className="text-xs text-slate-700 font-semibold leading-tight">Zero Storage</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(showManualGuide || (isIOS && !deferredPrompt)) ? (
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-5 rounded-xl bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-button font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#00C9AF]/20 active:scale-95 cursor-pointer"
            >
              Got It, Thanks!
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleInstallClick}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-button font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#00C9AF]/20 active:scale-95 cursor-pointer"
              >
                <Download size={16} strokeWidth={2.5} />
                <span>Install App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-button font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Later
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;

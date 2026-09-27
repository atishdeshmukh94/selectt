import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, ShieldCheck, Zap, Bell } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed recently (wait 2 days before showing again)
    const dismissedAt = localStorage.getItem('selectt_pwa_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 2) {
        return;
      }
    }

    // 3. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    let popupTimer = null;

    // 4. Handle Chromium `beforeinstallprompt`
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 18 seconds (15-20s window) after page load before showing the centered popup modal
      popupTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 18000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Detect if installed via browser event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] App successfully installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. For iOS or other browsers, show after 18s if not already standalone
    popupTimer = setTimeout(() => {
      setShowPrompt(true);
    }, 18000);

    return () => {
      if (popupTimer) clearTimeout(popupTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If browser doesn't support deferred prompt (e.g. iOS or manual install), show alert instructions
      if (isIOS) {
        return;
      }
      setShowPrompt(false);
      return;
    }
    // Show browser native install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('[PWA] User dismissed the install prompt');
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('selectt_pwa_dismissed_at', Date.now().toString());
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
          className="relative w-full max-w-[360px] sm:max-w-[380px] overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.04)] text-slate-900 text-center"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>

          {/* App Icon */}
          <div className="relative mx-auto mb-3 w-14 h-14 rounded-2xl bg-[#E6FAF7] border border-[#00C9AF]/30 p-2 shadow-sm flex items-center justify-center">
            <img
              src="/pwa-icon-192.png"
              alt="Selectt App"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00C9AF] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>

          {/* Title & Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6FAF7] text-[#008A77] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
            <Zap size={11} /> Official Mobile App
          </div>

          <h3 className="text-lg sm:text-xl font-black font-heading tracking-tight text-[#0C1B33] mb-1">
            Install Selectt App
          </h3>

          <p className="text-slate-500 font-body text-xs leading-relaxed mb-4 px-1">
            Lightning-fast browsing, test drive bookings, and real-time price-drop alerts.
          </p>

          {/* Compact Feature Highlights (Light Style) */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-left">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center gap-2">
              <Zap size={14} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-700 font-semibold leading-tight">Fast 1-Click Access</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-700 font-semibold leading-tight">Verified History</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center gap-2">
              <Bell size={14} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-700 font-semibold leading-tight">Deal Alerts</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center gap-2">
              <Smartphone size={14} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-700 font-semibold leading-tight">Zero Storage</span>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          {isIOS && !deferredPrompt ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 text-left">
              <p className="text-xs text-slate-800 font-bold mb-1 flex items-center gap-1.5">
                <Smartphone size={13} className="text-[#00C9AF]" /> Install on iPhone / iPad:
              </p>
              <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                <span>1. Tap Share</span>
                <Share size={12} className="text-[#00C9AF]" />
                <span>2. Tap "Add to Home Screen"</span>
                <PlusSquare size={12} className="text-[#00C9AF]" />
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleInstallClick}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-button font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#00C9AF]/20 active:scale-95 cursor-pointer"
              >
                <Download size={16} strokeWidth={2.5} />
                <span>Install App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-button font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Later
              </button>
            </div>
          )}

          {/* Close link under iOS instructions */}
          {isIOS && !deferredPrompt && (
            <button
              onClick={handleDismiss}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-button font-bold text-xs transition-all cursor-pointer"
            >
              Got It
            </button>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;

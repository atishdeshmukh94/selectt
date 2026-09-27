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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-[#0C1B33] via-[#0A162A] to-[#060D19] border border-[#00C9AF]/30 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,201,175,0.2)] text-white text-center"
        >
          {/* Top Neon Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00C9AF] via-[#14FFEC] to-[#00C9AF]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* App Icon */}
          <div className="relative mx-auto mb-4 w-20 h-20 rounded-2xl bg-[#081220] border-2 border-[#00C9AF]/40 p-3 shadow-xl flex items-center justify-center">
            <img
              src="/pwa-icon-192.png"
              alt="Selectt App"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
            />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#00C9AF] rounded-full border-2 border-[#0C1B33] flex items-center justify-center shadow-md">
              <Sparkles size={12} className="text-[#0C1B33]" />
            </div>
          </div>

          {/* Header */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C9AF]/15 border border-[#00C9AF]/30 text-[#00C9AF] text-[11px] font-bold uppercase tracking-widest mb-2">
            <Zap size={12} /> Official Mobile App
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white mb-2">
            Install Selectt App
          </h3>

          <p className="text-slate-300 font-body text-xs sm:text-sm leading-relaxed mb-5 px-2">
            Experience lightning-fast browsing, instant test drive bookings, and real-time price-drop alerts directly on your device.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Zap size={16} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-200 font-medium">1-Click Fast Access</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-200 font-medium">Verified Car History</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Bell size={16} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-200 font-medium">Instant Deal Alerts</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Smartphone size={16} className="text-[#00C9AF] shrink-0" />
              <span className="text-[11px] text-slate-200 font-medium">Zero Storage Space</span>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          {isIOS && !deferredPrompt ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 text-left">
              <p className="text-xs text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <Smartphone size={14} className="text-[#00C9AF]" /> Install on iPhone / iPad:
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <span>1. Tap Share</span>
                <Share size={13} className="text-[#00C9AF]" />
                <span>2. Tap "Add to Home Screen"</span>
                <PlusSquare size={13} className="text-[#00C9AF]" />
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleInstallClick}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00C9AF] to-[#14FFEC] hover:brightness-110 text-[#0C1B33] font-button font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#00C9AF]/30 active:scale-95 cursor-pointer"
              >
                <Download size={18} strokeWidth={2.5} />
                <span>Install Selectt App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-button font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          )}

          {/* Close link under iOS instructions */}
          {isIOS && !deferredPrompt && (
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-button font-bold text-xs transition-all cursor-pointer"
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

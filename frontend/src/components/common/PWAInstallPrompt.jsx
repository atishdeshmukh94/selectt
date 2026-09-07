import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare } from 'lucide-react';

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

    // 2. Check if user dismissed recently (wait 3 days before showing again)
    const dismissedAt = localStorage.getItem('selectt_pwa_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 3) {
        return;
      }
    }

    // 3. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Handle Chromium `beforeinstallprompt`
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 2.5 seconds after page load before showing the prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
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

    // 6. For iOS, also show prompt after 3.5s if not standalone
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
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
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0C1B33]/95 via-[#0A162A]/95 to-[#060D19]/95 backdrop-blur-xl border border-white/15 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,201,175,0.15)]">
          
          {/* Top Edge Neon Highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C9AF] to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3.5 sm:gap-4">
            {/* App Icon */}
            <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-[#0C1B33] border border-white/20 p-2 shadow-inner flex items-center justify-center">
              <img
                src="/pwa-icon-192.png"
                alt="Selectt"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = '/favicon.png'; }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00C9AF] rounded-full border-2 border-[#0C1B33] flex items-center justify-center">
                <Sparkles size={8} className="text-[#0C1B33]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-white font-heading font-black text-base sm:text-lg tracking-tight">
                  Install Selectt App
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#00C9AF]/20 text-[#00C9AF] border border-[#00C9AF]/30">
                  Fast
                </span>
              </div>
              <p className="text-slate-300 font-body text-xs sm:text-sm font-medium leading-snug">
                {isIOS && !deferredPrompt
                  ? 'Add to home screen for instant booking, live updates & fast experience.'
                  : 'Install our web app for a 1-click experience, faster browsing & offline access.'}
              </p>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          {isIOS && !deferredPrompt ? (
            <div className="mt-3.5 pt-3 border-t border-white/10 bg-white/5 rounded-xl p-2.5 text-xs text-slate-300 font-medium">
              <p className="flex items-center gap-1.5 text-slate-200 font-bold mb-1">
                <span>To install on iPhone / iPad:</span>
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span>1. Tap Share</span>
                <Share size={12} className="text-[#00C9AF]" />
                <span>2. Tap "Add to Home Screen"</span>
                <PlusSquare size={12} className="text-[#00C9AF]" />
              </div>
            </div>
          ) : (
            /* Action Buttons for Android, PC & Chrome/Edge */
            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00C9AF] hover:bg-[#14FFEC] text-[#0C1B33] font-button font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#00C9AF]/30 hover:shadow-lg hover:shadow-[#00C9AF]/50 active:scale-95 cursor-pointer"
              >
                <Download size={16} strokeWidth={2.5} />
                <span>Install Now</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-button font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;

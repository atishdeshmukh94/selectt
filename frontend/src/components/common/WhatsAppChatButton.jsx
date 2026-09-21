import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "🎁 Free Doorstep Car Inspection!",
  "🚗 500+ Certified Used Cars!",
  "⚡ Instant Valuation in 2 Mins!",
  "💬 Chat with Selectt Experts!",
  "🛡️ 1-Year Warranty & Easy EMI!"
];

const WhatsAppChatButton = () => {
  const [currentText, setCurrentText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);
  const [isGallaboxOpen, setIsGallaboxOpen] = useState(false);

  // Suppress Gallabox default raw launcher pill so only our animated WhatsApp button is visible
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'suppress-gallabox-launcher-pill';
    styleEl.innerHTML = `
      /* Suppress Gallabox default raw launcher button */
      #chatty-widget-container > button,
      #chatty-widget > button,
      .chatty-widget > button,
      [class*="chatty-widget-launcher"],
      [class*="chatty-launcher"],
      [id*="chatty-launcher"],
      button:has(> svg + span:contains("Chat with us")),
      #chatty-widget-container button:not(.chatty-close-button) {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Watch Gallabox iframe state
    const interval = setInterval(() => {
      const iframes = document.querySelectorAll('iframe[src*="gallabox"], iframe[id*="chatty"]');
      let isOpen = false;

      iframes.forEach((iframe) => {
        const height = iframe.offsetHeight || parseInt(iframe.style.height || '0', 10);
        // If iframe is just the launcher pill (small height < 150px), hide it
        if (height > 0 && height < 150) {
          iframe.style.opacity = '0';
          iframe.style.visibility = 'hidden';
          iframe.style.pointerEvents = 'none';
        } else if (height >= 150) {
          // Chat window is OPEN!
          isOpen = true;
          iframe.style.opacity = '1';
          iframe.style.visibility = 'visible';
          iframe.style.pointerEvents = 'auto';
          iframe.style.zIndex = '999999';
        }
      });

      // Check containers
      const containers = document.querySelectorAll('#chatty-widget-container, .chatty-widget, [id*="chatty"]');
      containers.forEach((container) => {
        const btns = container.querySelectorAll('button');
        btns.forEach((btn) => {
          if (btn.innerText && btn.innerText.includes('Chat with us')) {
            btn.style.display = 'none';
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
            btn.style.pointerEvents = 'none';
          }
        });
      });

      setIsGallaboxOpen(isOpen);
    }, 200);

    return () => {
      clearInterval(interval);
      styleEl.remove();
    };
  }, []);

  // Typewriter effect loop
  useEffect(() => {
    const fullText = MESSAGES[messageIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        const nextText = fullText.substring(0, currentText.length + 1);
        setCurrentText(nextText);

        if (nextText === fullText) {
          // Finished typing full message, pause before deleting
          setTypingSpeed(2200);
          setIsDeleting(true);
        } else {
          setTypingSpeed(60);
        }
      } else {
        // Deleting backward
        const nextText = fullText.substring(0, currentText.length - 1);
        setCurrentText(nextText);

        if (nextText === '') {
          // Finished deleting, move to next message
          setIsDeleting(false);
          setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
          setTypingSpeed(400);
        } else {
          setTypingSpeed(30);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, messageIndex, typingSpeed]);

  // Click Handler to trigger Gallabox Chat widget with fail-safe fallback
  const handleChatClick = () => {
    let gallaboxTriggered = false;

    // 1. Try Gallabox API if initialized
    if (typeof window !== 'undefined' && window.Chatty) {
      try {
        window.Chatty('open');
        gallaboxTriggered = true;
      } catch (e) {
        console.warn('Gallabox API open failed:', e);
      }
    }

    // 2. Click any native Gallabox trigger in DOM
    const selectors = [
      '#chatty-widget-container button',
      '#chatty-widget button',
      '[class*="chatty"] button',
      'button[class*="chatty"]',
      '#chatty-widget-iframe',
      'iframe[src*="gallabox"]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        try {
          el.click();
          gallaboxTriggered = true;
          break;
        } catch (err) {}
      }
    }

    // 3. Post message to Gallabox iframes
    try {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        if (iframe.src && iframe.src.includes('gallabox')) {
          iframe.contentWindow?.postMessage({ type: 'OPEN_CHAT' }, '*');
          iframe.contentWindow?.postMessage({ action: 'open' }, '*');
          gallaboxTriggered = true;
        }
      });
    } catch (e) {}

    // 4. Fallback directly to official WhatsApp support if Gallabox is blocked by ad-blocker
    if (!gallaboxTriggered) {
      const waUrl = `https://wa.me/918574667466?text=${encodeURIComponent(
        'Hi Selectt, I want to know more about buying/selling a certified car.'
      )}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // If Gallabox modal window is actively open, hide the floating trigger button so it doesn't block the chat text input
  if (isGallaboxOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[99998] flex items-center select-none">
      <button
        onClick={handleChatClick}
        type="button"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center gap-3 bg-gradient-to-r from-[#075E54] via-[#0E7A68] to-[#128C7E] hover:from-[#086B60] hover:to-[#17A08E] text-white px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-full shadow-[0_10px_30px_rgba(7,94,84,0.45)] hover:shadow-[0_14px_38px_rgba(7,94,84,0.6)] border border-white/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
      >
        {/* Pulse / Ripple Effect Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none opacity-40 duration-1000" />

        {/* WhatsApp Icon with green circle badge */}
        <div className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-md text-white">
          <svg
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.5C8.87 7.5 8.6 7.57 8.36 7.83C8.13 8.1 7.48 8.71 7.48 9.96C7.48 11.21 8.39 12.41 8.52 12.58C8.65 12.75 10.3 15.3 12.83 16.39C14.93 17.29 15.36 17.11 15.82 17.07C16.28 17.03 17.3 16.46 17.51 15.87C17.72 15.28 17.72 14.78 17.66 14.67C17.6 14.56 17.43 14.5 17.18 14.37C16.93 14.25 15.7 13.64 15.47 13.56C15.24 13.47 15.08 13.43 14.91 13.68C14.74 13.93 14.27 14.5 14.13 14.67C13.99 14.84 13.85 14.86 13.6 14.73C13.35 14.61 12.54 14.34 11.58 13.49C10.84 12.82 10.33 12 10.19 11.75C10.05 11.5 10.17 11.37 10.3 11.24C10.41 11.13 10.55 10.95 10.68 10.8C10.8 10.65 10.85 10.54 10.93 10.37C11.01 10.2 10.97 10.06 10.91 9.93C10.85 9.81 10.38 8.65 10.19 8.18C9.99 7.73 9.8 7.79 9.65 7.78C9.51 7.77 9.35 7.5 9.04 7.5Z" />
          </svg>
        </div>

        {/* Text Details with Typing Animation */}
        <div className="flex flex-col text-left pr-1 sm:pr-2">
          {/* Top Line: Status / Subtitle */}
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-semibold text-emerald-200 tracking-wide leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block shadow-[0_0_8px_#25D366] animate-pulse" />
            <span>Get Extra Discount</span>
          </div>

          {/* Bottom Line: Typing message */}
          <div className="text-xs sm:text-[13.5px] font-extrabold text-white tracking-tight flex items-center whitespace-nowrap min-w-[160px] sm:min-w-[210px] h-[18px] sm:h-[20px]">
            <span>{currentText}</span>
            <span className="text-[#FFB703] font-black text-sm ml-0.5 animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_infinite] inline-block">
              |
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default WhatsAppChatButton;

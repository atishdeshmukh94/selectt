import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "🎁 Free Doorstep Inspection!",
  "🚗 500+ Certified Used Cars!",
  "⚡ Instant Valuation in 2 Mins!",
  "💬 Chat with Selectt Experts!",
  "🛡️ 1-Year Warranty & Easy EMI!"
];

const WhatsAppChatButton = () => {
  const [currentText, setCurrentText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(1200);

  // Aggressively remove any leftover Gallabox / Chatty widgets or scripts
  useEffect(() => {
    const purgeGallabox = () => {
      // 1. Remove scripts
      document
        .querySelectorAll('script[src*="gallabox"], script[src*="chatty"]')
        .forEach((el) => el.remove());

      // 2. Remove injected containers, buttons, iframes, wrappers
      document
        .querySelectorAll(
          '#chatty-widget-container, #chatty-widget, #chatty-widget-frame, .chatty-widget, .chatty-widget-container, [id*="chatty"], [class*="chatty"], [id*="gallabox"], [class*="gallabox"], iframe[src*="gallabox"], iframe[src*="chatty"], .gbox-widget, #gbox-widget'
        )
        .forEach((el) => {
          try {
            el.remove();
          } catch (e) {}
        });

      // 3. Clear window object references
      if (window.Chatty) {
        try {
          if (typeof window.Chatty.destroy === 'function') window.Chatty.destroy();
        } catch (e) {}
        delete window.Chatty;
      }
      if (window.__chatty) delete window.__chatty;
      if (window.gallabox) delete window.gallabox;
    };

    purgeGallabox();
    const interval = setInterval(purgeGallabox, 400);

    // MutationObserver to immediately destroy any Gallabox nodes on creation
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const id = node.id || '';
            const className = typeof node.className === 'string' ? node.className : '';
            const src = node.getAttribute ? node.getAttribute('src') || '' : '';
            if (
              id.includes('chatty') ||
              id.includes('gallabox') ||
              className.includes('chatty') ||
              className.includes('gallabox') ||
              src.includes('chatty') ||
              src.includes('gallabox')
            ) {
              node.remove();
            }
          }
        });
      }
    });

    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Smooth expand -> typewriter -> hold -> delete -> collapse lifecycle loop (NO BOUNCING)
  useEffect(() => {
    const fullText = MESSAGES[messageIndex];

    const handleStep = () => {
      // 1. If currently collapsed, expand first and then begin typing
      if (!isExpanded && !isHovered) {
        setIsExpanded(true);
        setTypingSpeed(250); // wait for smooth expand transition before typing starts
        return;
      }

      // 2. Typing Forward
      if (!isDeleting) {
        const nextText = fullText.substring(0, currentText.length + 1);
        setCurrentText(nextText);

        if (nextText === fullText) {
          // Finished typing full message: hold open for 3.5 seconds
          setTypingSpeed(3500);
          setIsDeleting(true);
        } else {
          setTypingSpeed(50);
        }
      } else {
        // 3. Deleting Backward
        const nextText = fullText.substring(0, currentText.length - 1);
        setCurrentText(nextText);

        if (nextText === '') {
          // Finished deleting: collapse back to compact round icon smoothly
          setIsDeleting(false);
          setIsExpanded(false);
          setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
          // Stay collapsed as circular icon for 2.2 seconds before next expand
          setTypingSpeed(2200);
        } else {
          setTypingSpeed(25);
        }
      }
    };

    const timer = setTimeout(handleStep, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, isExpanded, isHovered, messageIndex, typingSpeed]);

  // Open WhatsApp directly with pre-filled message
  const handleChatClick = () => {
    const waUrl = `https://wa.me/918574667466?text=${encodeURIComponent(
      'Hi Selectt, I would like to know more about buying/selling a certified car.'
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const showText = isExpanded || isHovered;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .wa-chat-font {
          font-family: 'Varela Round', sans-serif !important;
          font-weight: 700;
        }
      `}</style>

      <div className="fixed bottom-[88px] sm:bottom-[92px] md:bottom-6 left-3 sm:left-6 z-[99998] flex items-center select-none wa-chat-font">
        <button
          onClick={handleChatClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          type="button"
          aria-label="Chat on WhatsApp"
          className={`group relative flex items-center bg-gradient-to-r from-[#075E54] via-[#0E7A68] to-[#128C7E] hover:from-[#086B60] hover:to-[#17A08E] text-white shadow-[0_8px_24px_rgba(7,94,84,0.4)] hover:shadow-[0_12px_32px_rgba(7,94,84,0.55)] border border-white/25 transition-all duration-500 ease-in-out cursor-pointer rounded-full overflow-hidden wa-chat-font ${
            showText
              ? 'h-[46px] sm:h-[54px] pl-1.5 sm:pl-1.5 pr-3.5 sm:pr-4 gap-2.5 sm:gap-3 max-w-[290px] sm:max-w-[340px] justify-start'
              : 'h-[46px] sm:h-[54px] w-[46px] sm:w-[54px] p-0 justify-center'
          }`}
        >
          {/* WhatsApp Circular Icon on Left Side - 100% Mathematically Centered */}
          <div className="shrink-0 w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] bg-[#25D366] rounded-full flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform my-auto">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.5C8.87 7.5 8.6 7.57 8.36 7.83C8.13 8.1 7.48 8.71 7.48 9.96C7.48 11.21 8.39 12.41 8.52 12.58C8.65 12.75 10.3 15.3 12.83 16.39C14.93 17.29 15.36 17.11 15.82 17.07C16.28 17.03 17.3 16.46 17.51 15.87C17.72 15.28 17.72 14.78 17.66 14.67C17.6 14.56 17.43 14.5 17.18 14.37C16.93 14.25 15.7 13.64 15.47 13.56C15.24 13.47 15.08 13.43 14.91 13.68C14.74 13.93 14.27 14.5 14.13 14.67C13.99 14.84 13.85 14.86 13.6 14.73C13.35 14.61 12.54 14.34 11.58 13.49C10.84 12.82 10.33 12 10.19 11.75C10.05 11.5 10.17 11.37 10.3 11.24C10.41 11.13 10.55 10.95 10.68 10.8C10.8 10.65 10.85 10.54 10.93 10.37C11.01 10.2 10.97 10.06 10.91 9.93C10.85 9.81 10.38 8.65 10.19 8.18C9.99 7.73 9.8 7.79 9.65 7.78C9.51 7.77 9.35 7.5 9.04 7.5Z" />
            </svg>
          </div>

          {/* Text Container on Right Side (Smooth Expand/Collapse to Right with Typewriter) */}
          <div
            className={`flex flex-col text-left justify-center transition-all duration-500 ease-in-out overflow-hidden wa-chat-font ${
              showText ? 'opacity-100 max-w-[220px] sm:max-w-[260px] translate-x-0' : 'opacity-0 max-w-0 w-0 pointer-events-none'
            }`}
          >
            {/* Top Line: Status / Subtitle */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-bold text-emerald-200 tracking-wide leading-none whitespace-nowrap wa-chat-font">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block shadow-[0_0_8px_#25D366] animate-pulse shrink-0" />
              <span>Get Extra Discount</span>
            </div>

            {/* Bottom Line: Typing message with cursor */}
            <div className="text-[11px] sm:text-[13px] font-bold text-white tracking-tight flex items-center whitespace-nowrap min-w-[130px] sm:min-w-[195px] leading-tight mt-0.5 sm:mt-1 wa-chat-font">
              <span className="truncate">{currentText || (isHovered ? '💬 Chat with Selectt Experts!' : '')}</span>
              <span className="text-[#FFB703] font-bold text-xs sm:text-sm ml-0.5 animate-[pulse_1.2s_ease-in-out_infinite] inline-block">
                |
              </span>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default WhatsAppChatButton;

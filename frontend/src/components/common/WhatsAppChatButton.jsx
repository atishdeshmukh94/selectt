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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(60);

  // Typewriter, bounce, and expand/collapse lifecycle loop
  useEffect(() => {
    const fullText = MESSAGES[messageIndex];

    const handleStep = () => {
      // 1. If currently collapsed and not bouncing, trigger bounce first before expanding
      if (!isExpanded && !isHovered) {
        if (!isBouncing) {
          setIsBouncing(true);
          // Bounce for 650ms before opening
          setTypingSpeed(650);
          return;
        } else {
          // Bounce completed, now expand and begin typing
          setIsBouncing(false);
          setIsExpanded(true);
          setTypingSpeed(60);
          return;
        }
      }

      // 2. Typing Forward
      if (!isDeleting) {
        const nextText = fullText.substring(0, currentText.length + 1);
        setCurrentText(nextText);

        if (nextText === fullText) {
          // Finished typing full message: hold expanded for 3.2 seconds
          setTypingSpeed(3200);
          setIsDeleting(true);
        } else {
          setTypingSpeed(55);
        }
      } else {
        // 3. Deleting Backward
        const nextText = fullText.substring(0, currentText.length - 1);
        setCurrentText(nextText);

        if (nextText === '') {
          // Finished deleting: collapse to icon only
          setIsDeleting(false);
          setIsExpanded(false);
          setIsBouncing(false);
          setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
          // Stay compact as icon for 2 seconds before the next bounce & typing
          setTypingSpeed(2000);
        } else {
          setTypingSpeed(25);
        }
      }
    };

    const timer = setTimeout(handleStep, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, isExpanded, isHovered, isBouncing, messageIndex, typingSpeed]);

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
        @keyframes waIconBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.3) translateY(-10px) rotate(-10deg); }
          45% { transform: scale(0.92) translateY(2px) rotate(6deg); }
          70% { transform: scale(1.15) translateY(-5px) rotate(-4deg); }
          85% { transform: scale(0.98) translateY(1px); }
        }
        .animate-wa-bounce {
          animation: waIconBounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[99998] flex items-center select-none">
        <button
          onClick={handleChatClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          type="button"
          aria-label="Chat on WhatsApp"
          className={`group relative flex items-center bg-gradient-to-r from-[#075E54] via-[#0E7A68] to-[#128C7E] hover:from-[#086B60] hover:to-[#17A08E] text-white shadow-[0_10px_30px_rgba(7,94,84,0.45)] hover:shadow-[0_14px_38px_rgba(7,94,84,0.6)] border border-white/25 transition-all duration-500 ease-out cursor-pointer rounded-full overflow-hidden ${
            showText
              ? 'pl-3.5 pr-2.5 py-2 sm:pl-4.5 sm:pr-3 sm:py-2.5 gap-2.5 sm:gap-3 max-w-[340px]'
              : 'p-2 sm:p-2.5 max-w-[50px] sm:max-w-[56px]'
          }`}
        >
          {/* Pulse / Ripple Effect Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping pointer-events-none opacity-50 duration-1000" />

          {/* Text Container on Left Side (Smooth Expand/Collapse with Typewriter) */}
          <div
            className={`flex flex-col text-left transition-all duration-500 overflow-hidden ${
              showText ? 'opacity-100 max-w-[260px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
            }`}
          >
            {/* Top Line: Status / Subtitle */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-200 tracking-wide leading-tight whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block shadow-[0_0_8px_#25D366] animate-pulse shrink-0" />
              <span>Get Extra Discount</span>
            </div>

            {/* Bottom Line: Typing message with blinking cursor */}
            <div className="text-xs sm:text-[13px] font-extrabold text-white tracking-tight flex items-center whitespace-nowrap min-w-[150px] sm:min-w-[195px] h-[18px] sm:h-[20px] mt-0.5">
              <span>{currentText || (isHovered ? '💬 Chat with Selectt Experts!' : '')}</span>
              <span className="text-[#FFB703] font-black text-sm ml-0.5 animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_infinite] inline-block">
                |
              </span>
            </div>
          </div>

          {/* WhatsApp Circular Icon on Right Side (with bounce animation) */}
          <div
            className={`relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform ${
              isBouncing ? 'animate-wa-bounce' : ''
            }`}
          >
            <svg
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.5C8.87 7.5 8.6 7.57 8.36 7.83C8.13 8.1 7.48 8.71 7.48 9.96C7.48 11.21 8.39 12.41 8.52 12.58C8.65 12.75 10.3 15.3 12.83 16.39C14.93 17.29 15.36 17.11 15.82 17.07C16.28 17.03 17.3 16.46 17.51 15.87C17.72 15.28 17.72 14.78 17.66 14.67C17.6 14.56 17.43 14.5 17.18 14.37C16.93 14.25 15.7 13.64 15.47 13.56C15.24 13.47 15.08 13.43 14.91 13.68C14.74 13.93 14.27 14.5 14.13 14.67C13.99 14.84 13.85 14.86 13.6 14.73C13.35 14.61 12.54 14.34 11.58 13.49C10.84 12.82 10.33 12 10.19 11.75C10.05 11.5 10.17 11.37 10.3 11.24C10.41 11.13 10.55 10.95 10.68 10.8C10.8 10.65 10.85 10.54 10.93 10.37C11.01 10.2 10.97 10.06 10.91 9.93C10.85 9.81 10.38 8.65 10.19 8.18C9.99 7.73 9.8 7.79 9.65 7.78C9.51 7.77 9.35 7.5 9.04 7.5Z" />
            </svg>
          </div>
        </button>
      </div>
    </>
  );
};

export default WhatsAppChatButton;

import React from 'react';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { API_URL } from '../../../config/api';

export const PromoBanner = ({ type, title, subtitle, cta }) => {
  const configs = {
    hotwheels: {
      bg: "linear-gradient(135deg, rgba(15, 14, 48, 0.96) 0%, rgba(34, 15, 90, 0.96) 100%)",
      border: "rgba(113, 203, 206, 0.28)",
      glow: "rgba(34, 15, 90, 0.45)",
      icon: <Sparkles className="w-8 h-8 text-[#71CBCE]/50 absolute -right-2 top-2 animate-pulse" />,
      image: "https://spn-sta.spinny.com/spinny-web/static-images/web-asset/sale_banner_car.png"
    },
    buyback: {
      bg: "linear-gradient(135deg, rgba(10, 25, 41, 0.96) 0%, rgba(15, 45, 54, 0.96) 100%)",
      border: "rgba(113, 203, 206, 0.22)",
      glow: "rgba(15, 14, 48, 0.45)",
      icon: <ShieldCheck className="w-12 h-12 text-[#71CBCE]/15 absolute right-4 bottom-0" />,
      image: null
    },
    trust: {
      bg: "linear-gradient(135deg, rgba(15, 14, 48, 0.96) 0%, rgba(22, 20, 65, 0.93) 50%, rgba(34, 15, 90, 0.96) 100%)",
      border: "rgba(113, 203, 206, 0.28)",
      glow: "rgba(113, 203, 206, 0.15)",
      icon: null,
      image: "https://spn-sta.spinny.com/spinny-web/static-images/web-asset/trust_icon.png"
    }
  };

  const config = configs[type] || configs.hotwheels;

  return (
    <div
      className="col-span-full rounded-3xl p-6 text-white relative overflow-hidden flex items-center my-6 min-h-[140px] transition-all duration-300 hover:shadow-[0_15px_45px_rgba(113,203,206,0.18)] group/promo"
      style={{
        background: config.bg,
        backdropFilter: 'blur(20px) saturate(190%)',
        WebkitBackdropFilter: 'blur(20px) saturate(190%)',
        border: `1px solid ${config.border}`,
        boxShadow: `0 12px 32px ${config.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.18)`,
      }}
    >
      {/* Top inner highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#71CBCE]/40 to-transparent" />
      
      <div className="z-10 flex-1">
        <h4 className="text-xl font-black uppercase italic leading-none mb-1 tracking-wide">{title}</h4>
        <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest text-[#71CBCE]">{subtitle}</p>
        <button className="mt-4 bg-[#71CBCE]/10 hover:bg-[#71CBCE]/20 backdrop-blur-md border border-[#71CBCE]/40 hover:border-[#71CBCE]/70 text-[#71CBCE] hover:text-white text-[10px] font-black px-4 py-2 rounded-full uppercase flex items-center gap-1 transition-all duration-300 group-hover/promo:translate-x-1">
          {cta} <ChevronRight size={14} />
        </button>
      </div>
      {config.image && (
        <img
          src={config.image}
          className="absolute right-0 bottom-0 h-full object-contain mix-blend-overlay opacity-80 md:opacity-95 transition-transform duration-700 group-hover/promo:scale-105"
          alt="promo"
        />
      )}
      {config.icon}
    </div>
  );
};

export const ExtraPromoCard = ({ data, logoUrl, btnLink, isActive, title = "Promo Banner" }) => {
  const active = isActive !== undefined ? isActive : (data ? data.extra_card_is_active : true);
  if (active === false || active === "false" || active === "0") return null;

  const link = btnLink || data?.extra_card_btn_link || "#";
  const imgUrl = logoUrl || data?.extra_card_logo_url;

  return (
    <a
      href={link}
      className="rounded-[20px] overflow-hidden hover:scale-[1.03] transition-all duration-500 block w-full h-full relative border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)] min-h-[350px] bg-slate-950 group"
    >
      {imgUrl ? (
        <img
          src={imgUrl.startsWith('/') ? `${API_URL}${imgUrl}` : imgUrl}
          alt={title || "Promo Banner"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/55 font-bold uppercase tracking-wider text-xs bg-gradient-to-br from-[#0c1b33] to-[#1a3357]">
          No Banner Image Uploaded
        </div>
      )}
    </a>
  );
};

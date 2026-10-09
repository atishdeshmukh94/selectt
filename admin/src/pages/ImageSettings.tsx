import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  ExternalLink,
  Eye,
  Sparkles,
  Save,
  Link as LinkIcon,
  Smartphone,
  CheckCircle2,
  X,
  Tag,
  Type,
  AlignLeft,
  Navigation,
  Layers,
  ArrowRight,
  HelpCircle,
  Video,
  Play,
  Trash2,
  Power,
  Youtube
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import { API_URL } from "../config/api";

const API = API_URL;

const resolveImgUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (cleanPath.startsWith("/uploads/")) {
    if (API && !API.includes("localhost")) {
      return `${API.replace(/\/$/, "")}${cleanPath}`;
    }
    return `https://api.selectt.in${cleanPath}`;
  }
  // Frontend static assets (/img/..., /images/..., /favicon.png, etc.)
  return `https://selectt.in${cleanPath}`;
};

interface MobileHeroSlideConfig {
  slideNumber: number;
  imageKey: string;
  badgeKey: string;
  headingKey: string;
  subheadingKey: string;
  btnTextKey: string;
  btnLinkKey: string;
  defaultImage: string;
  defaultBadge: string;
  defaultHeading: string;
  defaultSubheading: string;
  defaultBtnText: string;
  defaultBtnLink: string;
}

const MOBILE_HERO_SLIDES_CONFIG: MobileHeroSlideConfig[] = [
  {
    slideNumber: 1,
    imageKey: "mobile_hero_image",
    badgeKey: "mobile_hero_badge",
    headingKey: "mobile_hero_heading",
    subheadingKey: "mobile_hero_subheading",
    btnTextKey: "mobile_hero_btn_text",
    btnLinkKey: "mobile_hero_btn_link",
    defaultImage: "https://selectt.in/img/warranty_banner_1to1.png",
    defaultBadge: "Selectt assured cover",
    defaultHeading: "Don't just buy.Selectt.",
    defaultSubheading: "200-point inspection with 7-day money-back guarantee",
    defaultBtnText: "Explore cover",
    defaultBtnLink: "/pricing",
  },
  {
    slideNumber: 2,
    imageKey: "mobile_hero_2_image",
    badgeKey: "mobile_hero_2_badge",
    headingKey: "mobile_hero_2_heading",
    subheadingKey: "mobile_hero_2_subheading",
    btnTextKey: "mobile_hero_2_btn_text",
    btnLinkKey: "mobile_hero_2_btn_link",
    defaultImage: "https://selectt.in/img/car_loan_banner_1to1.png",
    defaultBadge: "Low EMI · 24hr approval",
    defaultHeading: "Used car loans",
    defaultSubheading: "Pre-approved loans starting at 8.9% ROI",
    defaultBtnText: "Apply loan",
    defaultBtnLink: "/used-car-loan",
  },
  {
    slideNumber: 3,
    imageKey: "mobile_hero_3_image",
    badgeKey: "mobile_hero_3_badge",
    headingKey: "mobile_hero_3_heading",
    subheadingKey: "mobile_hero_3_subheading",
    btnTextKey: "mobile_hero_3_btn_text",
    btnLinkKey: "mobile_hero_3_btn_link",
    defaultImage: "https://selectt.in/img/mobile_hero_cover.png",
    defaultBadge: "India's most trusted",
    defaultHeading: "Find your dream car",
    defaultSubheading: "India's most-trusted certified pre-owned cars",
    defaultBtnText: "Buy car",
    defaultBtnLink: "/buy-cars",
  },
];

export interface StepBannerItem {
  id?: number;
  page: "sell-car" | "home";
  type: "step" | "buy-step";
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  defaultImage: string;
  defaultBadge: string;
  defaultTitle: string;
  defaultSubtitle: string;
}

const DEFAULT_SELL_STEPS: StepBannerItem[] = [
  {
    id: 7,
    page: "sell-car",
    type: "step",
    stepNumber: 1,
    badge: "Instant Estimate",
    title: "1. Get an instant price estimate",
    subtitle: "Add car details to get an instant price",
    image_url: "https://api.selectt.in/uploads/banner_1788683273740_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(2).webp",
    sort_order: 0,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788683273740_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(2).webp",
    defaultBadge: "Instant Estimate",
    defaultTitle: "1. Get an instant price estimate",
    defaultSubtitle: "Add car details to get an instant price"
  },
  {
    id: 8,
    page: "sell-car",
    type: "step",
    stepNumber: 2,
    badge: "Free Inspection",
    title: "Book free doorstep inspection",
    subtitle: "Car experts will do a thorough car inspection.",
    image_url: "https://api.selectt.in/uploads/banner_1788683284054_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(1).webp",
    sort_order: 1,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788683284054_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(1).webp",
    defaultBadge: "Free Inspection",
    defaultTitle: "Book free doorstep inspection",
    defaultSubtitle: "Car experts will do a thorough car inspection."
  },
  {
    id: 9,
    page: "sell-car",
    type: "step",
    stepNumber: 3,
    badge: "Step 3",
    title: "Get price bids on your car",
    subtitle: "Your car is shown to 1500+ buyers across India.",
    image_url: "https://api.selectt.in/uploads/banner_1788683297342_WhatsApp_Image_2026-09-04_at_11.53.33_AM.webp",
    sort_order: 2,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788683297342_WhatsApp_Image_2026-09-04_at_11.53.33_AM.webp",
    defaultBadge: "Step 3",
    defaultTitle: "Get price bids on your car",
    defaultSubtitle: "Your car is shown to 1500+ buyers across India."
  },
  {
    id: 10,
    page: "sell-car",
    type: "step",
    stepNumber: 4,
    badge: "Step 4",
    title: "Get same-day payment",
    subtitle: "We'll pick up your car and pay you instantly.",
    image_url: "https://api.selectt.in/uploads/banner_1788683307855_WhatsApp_Image_2026-09-04_at_11.53.32_AM.webp",
    sort_order: 3,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788683307855_WhatsApp_Image_2026-09-04_at_11.53.32_AM.webp",
    defaultBadge: "Step 4",
    defaultTitle: "Get same-day payment",
    defaultSubtitle: "We'll pick up your car and pay you instantly."
  }
];

const DEFAULT_BUY_STEPS: StepBannerItem[] = [
  {
    id: 15,
    page: "home",
    type: "buy-step",
    stepNumber: 1,
    badge: "Step 1",
    title: "Browse & Shortlist",
    subtitle: "Filter by brand, budget. Every listing shows real inspection scores and AI-verified pricing.",
    image_url: "https://api.selectt.in/uploads/banner_1788684109402_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(1).webp",
    sort_order: 0,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788684109402_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(1).webp",
    defaultBadge: "Step 1",
    defaultTitle: "Browse & Shortlist",
    defaultSubtitle: "Filter by brand, budget. Every listing shows real inspection scores and AI-verified pricing."
  },
  {
    id: 16,
    page: "home",
    type: "buy-step",
    stepNumber: 2,
    badge: "Step 2",
    title: "Book Test Drive & Inspection",
    subtitle: "Book a free doorstep test drive or visit nearest hub at your preferred time.",
    image_url: "https://api.selectt.in/uploads/banner_1788684121814_WhatsApp_Image_2026-09-04_at_11.53.33_AM.webp",
    sort_order: 1,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788684121814_WhatsApp_Image_2026-09-04_at_11.53.33_AM.webp",
    defaultBadge: "Step 2",
    defaultTitle: "Book Test Drive & Inspection",
    defaultSubtitle: "Book a free doorstep test drive or visit nearest hub at your preferred time."
  },
  {
    id: 17,
    page: "home",
    type: "buy-step",
    stepNumber: 3,
    badge: "Step 3",
    title: "Get Financed & Reserve",
    subtitle: "Pay online securely, apply for instant loans, or reserve with a small refundable deposit.",
    image_url: "https://api.selectt.in/uploads/banner_1788684131831_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(2).webp",
    sort_order: 2,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788684131831_WhatsApp_Image_2026-09-04_at_11.53.32_AM_(2).webp",
    defaultBadge: "Step 3",
    defaultTitle: "Get Financed & Reserve",
    defaultSubtitle: "Pay online securely, apply for instant loans, or reserve with a small refundable deposit."
  },
  {
    id: 18,
    page: "home",
    type: "buy-step",
    stepNumber: 4,
    badge: "Step 4",
    title: "Drive It Home & Delivery",
    subtitle: "Get your certified car delivered to your home with RC transfer & 5-day money-back guarantee.",
    image_url: "https://api.selectt.in/uploads/banner_1788684143537_WhatsApp_Image_2026-09-04_at_11.53.32_AM.webp",
    sort_order: 3,
    is_active: 1,
    defaultImage: "https://api.selectt.in/uploads/banner_1788684143537_WhatsApp_Image_2026-09-04_at_11.53.32_AM.webp",
    defaultBadge: "Step 4",
    defaultTitle: "Drive It Home & Delivery",
    defaultSubtitle: "Get your certified car delivered to your home with RC transfer & 5-day money-back guarantee."
  }
];

interface ImageSlotConfig {
  key: string;
  type: "site_content" | "site_setting";
  title: string;
  placement: string;
  recommendedSize: string;
  description: string;
  defaultPlaceholder: string;
  isDarkBackground?: boolean;
  hasLink?: boolean;
  linkKey?: string;
  defaultLink?: string;
  hasVisibility?: boolean;
  visibilityKey?: string;
}

// 1. BRAND LOGOS & IDENTITY
const BRANDING_SLOTS: ImageSlotConfig[] = [
  {
    key: "frontend_header_logo",
    type: "site_setting",
    title: "Frontend Header Main Logo (Dark Navbar)",
    placement: "Main Website Top Navigation Bar (Desktop & Mobile)",
    recommendedSize: "240 × 60 px PNG / SVG (Transparent)",
    description: "Primary brand logo displayed in the top navbar across all user-facing website pages.",
    defaultPlaceholder: "https://selectt.in/img/light-logo.svg",
    isDarkBackground: true,
  },
  {
    key: "frontend_footer_logo",
    type: "site_setting",
    title: "Frontend Footer Logo",
    placement: "Main Website Bottom Footer Section",
    recommendedSize: "240 × 60 px PNG / SVG (Transparent)",
    description: "Brand logo displayed in the website footer navigation area.",
    defaultPlaceholder: "https://selectt.in/img/light-logo.svg",
    isDarkBackground: true,
  },
  {
    key: "header_logo_light",
    type: "site_setting",
    title: "Header Light / Contrast Logo",
    placement: "Light Background Header Mode & Checkout Page",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Alternative dark-text brand logo for white / light header modes and checkout page.",
    defaultPlaceholder: "https://selectt.in/img/dark-logo.svg",
    isDarkBackground: false,
  },
  {
    key: "og_image",
    type: "site_setting",
    title: "WhatsApp & Social Share Preview (OG Image)",
    placement: "Social Media, WhatsApp, Facebook & Twitter Link Cards",
    recommendedSize: "1200 × 630 px (1.91:1 Aspect Ratio)",
    description: "Rich preview banner image generated when website URLs are shared on WhatsApp, Facebook, iMessage, and Twitter.",
    defaultPlaceholder: "https://selectt.in/img/og-image.jpg",
  },
  {
    key: "admin_logo_icon",
    type: "site_setting",
    title: "Browser Favicon & PWA App Icon",
    placement: "Browser Tab, Bookmarks Bar & Mobile PWA Home Icon",
    recommendedSize: "64 × 64 px or 192 × 192 px PNG / ICO",
    description: "Icon displayed in browser tabs, address bars, bookmarks, and mobile shortcut icons.",
    defaultPlaceholder: "https://selectt.in/favicon.png",
  },
  {
    key: "auth_logo",
    type: "site_setting",
    title: "Login & Register Modal Logo",
    placement: "Customer Authentication Popup Header",
    recommendedSize: "200 × 50 px PNG / SVG",
    description: "Brand logo shown inside the OTP login and customer signup modal dialog.",
    defaultPlaceholder: "https://selectt.in/img/dark-logo.svg",
  },
  {
    key: "admin_logo",
    type: "site_setting",
    title: "Admin Panel Logo (Light Sidebar)",
    placement: "Admin Management Console Navigation Sidebar",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Logo shown in the top-left of the admin management console in light theme.",
    defaultPlaceholder: "https://selectt.in/img/dark-logo.svg",
  },
  {
    key: "admin_logo_dark",
    type: "site_setting",
    title: "Admin Panel Logo (Dark Sidebar)",
    placement: "Admin Management Console Sidebar (Dark Theme)",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Logo shown in the top-left of the admin management console when dark theme is enabled.",
    defaultPlaceholder: "https://selectt.in/img/light-logo.svg",
    isDarkBackground: true,
  },
  {
    key: "login_modal_banner",
    type: "site_setting",
    title: "Login / Signup Modal Left Side Illustration",
    placement: "Customer Authentication Popup > Left Side Visual",
    recommendedSize: "450 × 535 px (5:6)",
    description: "Visual banner illustration displayed on the left side of customer login and signup popup modal.",
    defaultPlaceholder: "https://selectt.in/login-banner-left-sdie.png",
  },
];

// 2. BUY CARS PAGE BANNERS (Top 3 Banners + In-Grid 3 Banners)
const BUY_CARS_SLOTS: ImageSlotConfig[] = [
  // ── Top 3 Promo Banners (Above Grid) ──
  {
    key: "buy_top_banner_1_img",
    type: "site_setting",
    title: "Top Promo Banner #1 (e.g. Instant Cash / Loan)",
    placement: "Buy Cars Page > Top Header Strip > Slot 1",
    recommendedSize: "400 × 200 px (2:1)",
    description: "First promotional glass banner card displayed above the inventory catalog.",
    defaultPlaceholder: "https://api.selectt.in/uploads/banner_1788683225930_banner1.webp",
    hasLink: true,
    linkKey: "buy_top_banner_1_link",
    defaultLink: "/used-car-loan",
  },
  {
    key: "buy_top_banner_2_img",
    type: "site_setting",
    title: "Top Promo Banner #2 (e.g. Kavach+ Warranty)",
    placement: "Buy Cars Page > Top Header Strip > Slot 2",
    recommendedSize: "400 × 200 px (2:1)",
    description: "Second promotional glass banner card displayed above the inventory catalog.",
    defaultPlaceholder: "https://api.selectt.in/uploads/banner_1788683225930_banner1.webp",
    hasLink: true,
    linkKey: "buy_top_banner_2_link",
    defaultLink: "/selectt-assured",
  },
  {
    key: "buy_top_banner_3_img",
    type: "site_setting",
    title: "Top Promo Banner #3 (e.g. Less Hassle / Scrap)",
    placement: "Buy Cars Page > Top Header Strip > Slot 3",
    recommendedSize: "400 × 200 px (2:1)",
    description: "Third promotional glass banner card displayed above the inventory catalog.",
    defaultPlaceholder: "https://api.selectt.in/uploads/banner_1788683247246_banner3.webp",
    hasLink: true,
    linkKey: "buy_top_banner_3_link",
    defaultLink: "/sell-car",
  },

  // ── In-Grid 3 Promo Banners (Inside Grid) ──
  {
    key: "extra_card_logo_url",
    type: "site_setting",
    title: "In-Grid Banner Card #1 (Row 1, Slot 3)",
    placement: "Vehicle Catalog Grid > Slot #1",
    recommendedSize: "400 × 500 px (4:5 Aspect Ratio)",
    description: "First promotional banner displayed seamlessly between car cards in the search catalog.",
    defaultPlaceholder: "https://api.selectt.in/uploads/extra_card_logo_url-1788683817835-117282823.webp",
    hasLink: true,
    linkKey: "extra_card_btn_link",
    defaultLink: "/used-car-loan",
    hasVisibility: true,
    visibilityKey: "extra_card_is_active",
  },
  {
    key: "buy_grid_banner_2_img",
    type: "site_setting",
    title: "In-Grid Banner Card #2 (3 Rows After Banner #1)",
    placement: "Vehicle Catalog Grid > Slot #2",
    recommendedSize: "400 × 500 px (4:5 Aspect Ratio)",
    description: "Second promotional banner card shown 3 lines (9 cars) after Banner #1.",
    defaultPlaceholder: "https://selectt.in/img/insurance_banner_1to1.webp",
    hasLink: true,
    linkKey: "buy_grid_banner_2_link",
    defaultLink: "/car-insurance",
    hasVisibility: true,
    visibilityKey: "buy_grid_banner_2_active",
  },
  {
    key: "buy_grid_banner_3_img",
    type: "site_setting",
    title: "In-Grid Banner Card #3 (3 Rows After Banner #2)",
    placement: "Vehicle Catalog Grid > Slot #3",
    recommendedSize: "400 × 500 px (4:5 Aspect Ratio)",
    description: "Third promotional banner card shown 3 lines (9 cars) after Banner #2.",
    defaultPlaceholder: "https://selectt.in/img/sell_car_banner.webp",
    hasLink: true,
    linkKey: "buy_grid_banner_3_link",
    defaultLink: "/sell-car",
    hasVisibility: true,
    visibilityKey: "buy_grid_banner_3_active",
  },
];

// 3. HOME & SELL PAGE VISUALS
const HOME_SELL_SLOTS: ImageSlotConfig[] = [
  {
    key: "buy_car_banner",
    type: "site_content",
    title: "Browse & Buy Cars Switcher Card",
    placement: "Home Page > Buy / Sell Switcher Tab",
    recommendedSize: "600 × 400 px (3:2)",
    description: "Promotional card image for the Buy Cars instant browse trigger.",
    defaultPlaceholder: "https://selectt.in/img/buy_car_banner.png",
  },
  {
    key: "sell_car_banner",
    type: "site_content",
    title: "Sell Car Instant Valuation Banner",
    placement: "Home & Sell Car Pages > Valuation Card",
    recommendedSize: "600 × 400 px (3:2)",
    description: "Visual banner for the Sell Car instant pricing calculation form.",
    defaultPlaceholder: "https://selectt.in/img/sell_car_banner.png",
  },
  {
    key: "trust_banner_1",
    type: "site_content",
    title: "Trust Badge #1 — 140-Point Inspection",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge highlighting certified quality check guarantee.",
    defaultPlaceholder: "https://selectt.in/img/trust_banner_1.webp",
  },
  {
    key: "trust_banner_2",
    type: "site_content",
    title: "Trust Badge #2 — 7-Day Money Back Guarantee",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge for customer return policy guarantee.",
    defaultPlaceholder: "https://selectt.in/img/trust_banner_2.webp",
  },
  {
    key: "trust_banner_3",
    type: "site_content",
    title: "Trust Badge #3 — 1-Year Comprehensive Warranty",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge for extended roadside assistance and warranty.",
    defaultPlaceholder: "https://selectt.in/img/trust_banner_3.webp",
  },
];

// 4. CAR DETAILS PAGE VISUALS
const CAR_DETAILS_SLOTS: ImageSlotConfig[] = [
  {
    key: "car_details_sidebar_banner",
    type: "site_content",
    title: "Car Details Sidebar Promo Banner",
    placement: "Car Details Page > Right Sidebar",
    recommendedSize: "600 × 350 px (16:9)",
    description: "Loan and warranty promotional banner displayed in vehicle view pages.",
    defaultPlaceholder: "https://api.selectt.in/uploads/banner_1788683587959_top-banner.webp",
  },
];

type ActiveTabType = "branding" | "mobile-hero" | "step-sliders" | "buy-cars" | "home-sell" | "car-details";

const DEFAULT_MOBILE_HOME_VIDEO = "https://mda-dev.spinny.com/sp-file-system/public/2026-02-16/3f7957ad509b4fc888114ae91d3690be/raw/file.mp4";

const renderMobileVideoPreview = (url: string, enabled: boolean) => {
  if (!url || !url.trim()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
        <Video size={36} className="text-slate-300 dark:text-slate-600" />
        <p className="text-xs font-semibold">No video configured</p>
        <p className="text-[11px] text-slate-400">Enter a YouTube link, Bunny.net embed URL, or upload a video below</p>
      </div>
    );
  }

  const trimmed = url.trim();
  const ytMatch = trimmed.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
  let player = null;

  if (ytMatch && ytMatch[2]?.length === 11) {
    const videoId = ytMatch[2];
    player = (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0`}
        title="YouTube Preview"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (trimmed.includes("mediadelivery.net") || trimmed.includes("bunnycdn.com") || trimmed.includes("iframe")) {
    player = (
      <iframe
        src={trimmed}
        title="Bunny.net Stream Preview"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else {
    const resolved = resolveImgUrl(trimmed);
    player = (
      <video
        src={resolved}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {player}
      {!enabled && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
          <Power size={24} className="text-rose-400 mb-1.5" />
          <span className="text-xs font-bold text-white">Video is Disabled</span>
          <span className="text-[11px] text-slate-300 mt-0.5">This video will not appear on the mobile website</span>
        </div>
      )}
    </div>
  );
};

const getVideoTypeBadge = (url?: string) => {
  if (!url) return null;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.includes("youtube") || trimmed.includes("youtu.be")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200">
        <Youtube size={12} /> YouTube
      </span>
    );
  }
  if (trimmed.includes("mediadelivery.net") || trimmed.includes("bunnycdn.com") || trimmed.includes("bunny")) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
        🐰 Bunny.net Stream
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
      <Video size={12} /> Direct Video (MP4)
    </span>
  );
};

export default function ImageSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTabType) || "branding";
  const [activeTab, setActiveTab] = useState<ActiveTabType>(
    ["branding", "mobile-hero", "step-sliders", "buy-cars", "home-sell", "car-details"].includes(initialTab) ? initialTab : "branding"
  );

  const [stepSubTab, setStepSubTab] = useState<"sell" | "buy">("sell");
  const [sellSteps, setSellSteps] = useState<StepBannerItem[]>(DEFAULT_SELL_STEPS);
  const [buySteps, setBuySteps] = useState<StepBannerItem[]>(DEFAULT_BUY_STEPS);
  const [uploadingStepIdx, setUploadingStepIdx] = useState<{ target: "sell" | "buy"; index: number } | null>(null);
  const stepFileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingBunnyVideo, setUploadingBunnyVideo] = useState(false);
  const bunnyVideoInputRef = useRef<HTMLInputElement>(null);

  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewImgModal, setPreviewImgModal] = useState<{ url: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentKeyForUpload, setCurrentKeyForUpload] = useState<{ key: string; type: "site_content" | "site_setting"; title: string } | null>(null);

  const getAuthToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || "";

  const [savingVideo, setSavingVideo] = useState(false);

  // Dedicated save handler for Mobile Home Highlight Video
  const handleSaveVideo = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login as administrator to save video");
      return;
    }
    setSavingVideo(true);
    const saveToast = toast.loading("Saving Mobile Home Video...");
    try {
      const videoUrl = (siteContent.mobile_home_video_url || "").trim();
      const videoEnabled = siteContent.mobile_home_video_enabled !== "false" ? "true" : "false";

      const payload = {
        mobile_home_video_url: videoUrl,
        mobile_home_video_enabled: videoEnabled,
      };

      // 1. Batch endpoint for site_content
      const p1 = fetch(`${API}/api/admin/site-content/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // 2. Direct individual PUT endpoints for guaranteed persistence
      const p2 = fetch(`${API}/api/admin/site-content/mobile_home_video_url`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: videoUrl }),
      }).catch(() => null);

      const p3 = fetch(`${API}/api/admin/site-content/mobile_home_video_enabled`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: videoEnabled }),
      }).catch(() => null);

      // 3. Fallback to site_settings table as well
      const p4 = fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      await Promise.all([p1, p2, p3, p4]);

      setSiteContent((prev) => ({ ...prev, ...payload }));
      setSiteSettings((prev) => ({ ...prev, ...payload }));

      toast.dismiss(saveToast);
      toast.success("✅ Mobile Home Video saved & published successfully!");
    } catch (err: any) {
      toast.dismiss(saveToast);
      toast.error("Failed to save video: " + (err?.message || "Network error"));
    } finally {
      setSavingVideo(false);
    }
  };

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load all settings, site content, and banner records
  const loadData = async () => {
    setLoading(true);
    try {
      const [contentRes, settingsRes, bannersRes] = await Promise.all([
        fetch(`${API}/api/site-content`).catch(() => null),
        fetch(`${API}/api/settings/public`).catch(() => null),
        fetch(`${API}/api/banners`).catch(() => null),
      ]);

      const contentData = contentRes && contentRes.ok ? await contentRes.json() : {};
      const settingsData = settingsRes && settingsRes.ok ? await settingsRes.json() : {};
      const bannersData = bannersRes && bannersRes.ok ? await bannersRes.json() : [];

      // 1. Sync / prefill Buy Cars Top Promo Banners from live banners if not set in siteSettings
      if (Array.isArray(bannersData) && bannersData.length > 0) {
        const buyPromoBanners = bannersData.filter((b: any) => b.page === "buy-cars" && (b.type === "promo" || b.type === "top"));
        if (buyPromoBanners.length > 0) {
          if (!settingsData.buy_top_banner_1_img && buyPromoBanners[0]?.image_url) {
            settingsData.buy_top_banner_1_img = buyPromoBanners[0].image_url;
            settingsData.buy_top_banner_1_link = buyPromoBanners[0].cta_link || "/used-car-loan";
          }
          if (!settingsData.buy_top_banner_2_img && buyPromoBanners[1]?.image_url) {
            settingsData.buy_top_banner_2_img = buyPromoBanners[1].image_url;
            settingsData.buy_top_banner_2_link = buyPromoBanners[1].cta_link || "/selectt-assured";
          }
          if (!settingsData.buy_top_banner_3_img && buyPromoBanners[2]?.image_url) {
            settingsData.buy_top_banner_3_img = buyPromoBanners[2].image_url;
            settingsData.buy_top_banner_3_link = buyPromoBanners[2].cta_link || "/sell-car";
          }
        }

        // 2. Sync Car details sidebar banner
        const carDetailSidebar = bannersData.find((b: any) => b.page === "car-detail" && b.type === "sidebar");
        if (carDetailSidebar?.image_url) {
          if (!contentData.car_details_sidebar_banner && !settingsData.car_details_sidebar_banner) {
            contentData.car_details_sidebar_banner = carDetailSidebar.image_url;
            settingsData.car_details_sidebar_banner = carDetailSidebar.image_url;
          }
        }

        // 3. Sync Mobile hero slides from banners table if available
        const homeMobileBanners = bannersData.filter((b: any) => b.page === "home" && b.type === "mobile");
        if (homeMobileBanners.length > 0) {
          if (!contentData.mobile_hero_image && homeMobileBanners[0]?.image_url) {
            contentData.mobile_hero_image = homeMobileBanners[0].image_url;
          }
          if (!contentData.mobile_hero_2_image && homeMobileBanners[1]?.image_url) {
            contentData.mobile_hero_2_image = homeMobileBanners[1].image_url;
          }
          if (!contentData.mobile_hero_3_image && homeMobileBanners[2]?.image_url) {
            contentData.mobile_hero_3_image = homeMobileBanners[2].image_url;
          }
        }

        // 4. Sync Sell Car Steps (page='sell-car' & type='step')
        const loadedSellSteps = bannersData
          .filter((b: any) => b.page === "sell-car" && b.type === "step")
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        if (loadedSellSteps.length > 0) {
          setSellSteps((prev) =>
            DEFAULT_SELL_STEPS.map((def, idx) => {
              const live = loadedSellSteps[idx];
              if (!live) return def;
              return {
                ...def,
                id: live.id,
                title: live.title || def.defaultTitle,
                subtitle: live.subtitle || def.defaultSubtitle,
                badge: live.cta_text || def.defaultBadge,
                image_url: live.image_url || def.defaultImage,
                sort_order: live.sort_order ?? idx,
                is_active: live.is_active ?? 1,
              };
            })
          );
        }

        // 5. Sync Buy Steps (page='home' & type='buy-step')
        const loadedBuySteps = bannersData
          .filter((b: any) => b.page === "home" && b.type === "buy-step")
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        if (loadedBuySteps.length > 0) {
          setBuySteps((prev) =>
            DEFAULT_BUY_STEPS.map((def, idx) => {
              const live = loadedBuySteps[idx];
              if (!live) return def;
              return {
                ...def,
                id: live.id,
                title: live.title || def.defaultTitle,
                subtitle: live.subtitle || def.defaultSubtitle,
                badge: live.cta_text || def.defaultBadge,
                image_url: live.image_url || def.defaultImage,
                sort_order: live.sort_order ?? idx,
                is_active: live.is_active ?? 1,
              };
            })
          );
        }
      }

      // Default fallbacks for Buy Top Banners
      if (!settingsData.buy_top_banner_1_img) {
        settingsData.buy_top_banner_1_img = "https://api.selectt.in/uploads/banner_1788683225930_banner1.webp";
        if (!settingsData.buy_top_banner_1_link) settingsData.buy_top_banner_1_link = "/used-car-loan";
      }
      if (!settingsData.buy_top_banner_2_img) {
        settingsData.buy_top_banner_2_img = "https://api.selectt.in/uploads/banner_1788683225930_banner1.webp";
        if (!settingsData.buy_top_banner_2_link) settingsData.buy_top_banner_2_link = "/selectt-assured";
      }
      if (!settingsData.buy_top_banner_3_img) {
        settingsData.buy_top_banner_3_img = "https://api.selectt.in/uploads/banner_1788683247246_banner3.webp";
        if (!settingsData.buy_top_banner_3_link) settingsData.buy_top_banner_3_link = "/sell-car";
      }

      // Default fallback for Car Details Sidebar Banner
      if (!contentData.car_details_sidebar_banner && !settingsData.car_details_sidebar_banner) {
        contentData.car_details_sidebar_banner = "https://api.selectt.in/uploads/banner_1788683587959_top-banner.webp";
        settingsData.car_details_sidebar_banner = "https://api.selectt.in/uploads/banner_1788683587959_top-banner.webp";
      }

      // Default fallbacks for Mobile Hero
      MOBILE_HERO_SLIDES_CONFIG.forEach((s) => {
        if (!contentData[s.imageKey]) contentData[s.imageKey] = s.defaultImage;
        if (!contentData[s.badgeKey]) contentData[s.badgeKey] = s.defaultBadge;
        if (!contentData[s.headingKey]) contentData[s.headingKey] = s.defaultHeading;
        if (!contentData[s.subheadingKey]) contentData[s.subheadingKey] = s.defaultSubheading;
        if (!contentData[s.btnTextKey]) contentData[s.btnTextKey] = s.defaultBtnText;
        if (!contentData[s.btnLinkKey]) contentData[s.btnLinkKey] = s.defaultBtnLink;
      });

      // Default fallback for mobile home video
      const liveVideoUrl = (contentData.mobile_home_video_url || settingsData.mobile_home_video_url || "").trim();
      const isExplicitlyDisabled = contentData.mobile_home_video_enabled === "false" || settingsData.mobile_home_video_enabled === "false";

      if (!liveVideoUrl && !isExplicitlyDisabled) {
        contentData.mobile_home_video_url = DEFAULT_MOBILE_HOME_VIDEO;
        settingsData.mobile_home_video_url = DEFAULT_MOBILE_HOME_VIDEO;
      } else {
        contentData.mobile_home_video_url = liveVideoUrl;
        settingsData.mobile_home_video_url = liveVideoUrl;
      }

      const liveVideoEnabled = (contentData.mobile_home_video_enabled !== undefined ? contentData.mobile_home_video_enabled : settingsData.mobile_home_video_enabled) ?? "true";
      contentData.mobile_home_video_enabled = liveVideoEnabled;
      settingsData.mobile_home_video_enabled = liveVideoEnabled;

      setSiteContent(contentData || {});
      setSiteSettings(settingsData || {});
    } catch (err) {
      console.error("Error loading image settings:", err);
      toast.error("Failed to load image settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload video directly to Bunny.net Stream CDN
  const handleUploadBunnyVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBunnyVideo(true);
    const token = getAuthToken();
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", `mobile_home_video_${Date.now()}`);

      const res = await fetch(`${API}/api/admin/videos/upload-bunny`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload video to Bunny.net");
      }

      const embedUrl = data.embedUrl || data.hlsUrl;
      setSiteContent((prev) => ({
        ...prev,
        mobile_home_video_url: embedUrl,
        mobile_home_video_enabled: "true",
      }));
      setSiteSettings((prev) => ({
        ...prev,
        mobile_home_video_url: embedUrl,
        mobile_home_video_enabled: "true",
      }));
      toast.success("Video uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Video upload failed");
    } finally {
      setUploadingBunnyVideo(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save changes to backend
  const handleSaveAll = async () => {
    setSaving(true);
    const token = getAuthToken();
    try {
      // 1. Save site_settings
      const settingsRes = await fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });

      // 2. Save site_content
      const contentRes = await fetch(`${API}/api/admin/site-content/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteContent),
      }).catch(async () => {
        const promises = Object.entries(siteContent).map(([k, v]) =>
          fetch(`${API}/api/admin/site-content/${k}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ value: v }),
          }).catch(() => null)
        );
        return Promise.all(promises);
      });

      // 3. Save all step banners (Sell Steps + Buy Steps)
      const allStepPromises = [...sellSteps, ...buySteps].map(async (step) => {
        const form = new FormData();
        form.append("page", step.page);
        form.append("type", step.type);
        form.append("title", step.title || "");
        form.append("subtitle", step.subtitle || "");
        form.append("cta_text", step.badge || "");
        form.append("image_url", step.image_url || "");
        form.append("sort_order", String(step.sort_order ?? 0));
        form.append("is_active", String(step.is_active ?? 1));

        const url = step.id ? `${API}/api/admin/banners/${step.id}` : `${API}/api/admin/banners`;
        const method = step.id ? "PUT" : "POST";
        return fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }).catch(() => null);
      });

      // Also ensure video keys are explicitly saved
      const videoUrl = (siteContent.mobile_home_video_url || "").trim();
      const videoEnabled = siteContent.mobile_home_video_enabled !== "false" ? "true" : "false";
      
      // Sync car_details_sidebar_banner to banners table
      const sidebarImgUrl = (siteContent.car_details_sidebar_banner || siteSettings.car_details_sidebar_banner || "").trim();
      const sidebarSyncPromise = sidebarImgUrl ? (async () => {
        try {
          const form = new FormData();
          form.append("page", "car-detail");
          form.append("type", "sidebar");
          form.append("image_url", sidebarImgUrl);
          form.append("is_active", "1");
          await fetch(`${API}/api/admin/banners/19`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
        } catch (_) {}
      })() : Promise.resolve();

      await Promise.all([
        sidebarSyncPromise,
        fetch(`${API}/api/admin/site-content/mobile_home_video_url`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ value: videoUrl }),
        }).catch(() => null),
        fetch(`${API}/api/admin/site-content/mobile_home_video_enabled`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ value: videoEnabled }),
        }).catch(() => null),
      ]);

      const isSuccessful = (settingsRes && settingsRes.ok) || (contentRes && (contentRes as any).ok);
      if (isSuccessful) {
        toast.success("✅ Image, Branding & Step Slider settings saved successfully!");
        loadData();
      } else {
        toast.success("✅ Settings updated successfully!");
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  // Upload handler for single slot / image key
  const handleTriggerUpload = (key: string, type: "site_content" | "site_setting", title: string) => {
    setCurrentKeyForUpload({ key, type, title });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentKeyForUpload) return;

    const { key, type, title } = currentKeyForUpload;
    setUploadingKey(key);
    const token = getAuthToken();
    const formData = new FormData();

    try {
      if (type === "site_content") {
        formData.append("file", file);
        formData.append("key", key);

        const res = await fetch(`${API}/api/admin/site-content`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setSiteContent((prev) => ({ ...prev, [key]: data.value }));
          toast.success(`${title} image uploaded successfully!`);
        } else {
          toast.error("Failed to upload image");
        }
      } else {
        formData.append(key, file);
        if (key === "frontend_header_logo") {
          formData.append("header_logo", file);
        }
        if (key === "frontend_footer_logo") {
          formData.append("footer_logo", file);
        }

        const res = await fetch(`${API}/api/settings/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          toast.success(`${title} updated successfully!`);
          loadData();
        } else {
          toast.error("Failed to upload image");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image");
    } finally {
      setUploadingKey(null);
      setCurrentKeyForUpload(null);
    }
  };

  // Save single mobile hero slide
  const handleSaveSingleMobileSlide = async (slide: MobileHeroSlideConfig) => {
    const token = getAuthToken();
    const saveToast = toast.loading(`Saving Mobile Slide #${slide.slideNumber}...`);
    try {
      const payload: Record<string, string> = {
        [slide.imageKey]: siteContent[slide.imageKey] || slide.defaultImage,
        [slide.badgeKey]: siteContent[slide.badgeKey] || slide.defaultBadge,
        [slide.headingKey]: siteContent[slide.headingKey] || slide.defaultHeading,
        [slide.subheadingKey]: siteContent[slide.subheadingKey] || slide.defaultSubheading,
        [slide.btnTextKey]: siteContent[slide.btnTextKey] || slide.defaultBtnText,
        [slide.btnLinkKey]: siteContent[slide.btnLinkKey] || slide.defaultBtnLink,
      };

      // 1. Save to site_content
      const p1 = fetch(`${API}/api/admin/site-content/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // 2. Save to site_settings as fallback
      const p2 = fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // 3. Save single keys in parallel
      const p3 = Promise.all(
        Object.entries(payload).map(([k, v]) =>
          fetch(`${API}/api/admin/site-content/${k}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ value: v }),
          }).catch(() => null)
        )
      );

      await Promise.all([p1, p2, p3]);

      setSiteContent((prev) => ({ ...prev, ...payload }));
      setSiteSettings((prev) => ({ ...prev, ...payload }));

      toast.success(`✅ Mobile Slide #${slide.slideNumber} saved & published!`, { id: saveToast });
    } catch (err) {
      toast.error("Network error while saving slide", { id: saveToast });
    }
  };

  // Step image upload handler
  const handleTriggerStepUpload = (target: "sell" | "buy", index: number) => {
    setUploadingStepIdx({ target, index });
    if (stepFileInputRef.current) {
      stepFileInputRef.current.value = "";
      stepFileInputRef.current.click();
    }
  };

  const handleStepFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingStepIdx) return;

    const { target, index } = uploadingStepIdx;
    const stepList = target === "sell" ? sellSteps : buySteps;
    const step = stepList[index];
    if (!step) return;

    const token = getAuthToken();
    const uploadToast = toast.loading(`Uploading image for Step ${index + 1}...`);
    const form = new FormData();
    form.append("image", file);
    form.append("page", step.page);
    form.append("type", step.type);
    form.append("title", step.title || "");
    form.append("subtitle", step.subtitle || "");
    form.append("cta_text", step.badge || "");
    form.append("sort_order", String(step.sort_order ?? index));
    form.append("is_active", "1");

    try {
      const url = step.id ? `${API}/api/admin/banners/${step.id}` : `${API}/api/admin/banners`;
      const method = step.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast.dismiss(uploadToast);
        toast.success(`Step ${index + 1} image uploaded successfully!`);
        loadData();
      } else {
        toast.dismiss(uploadToast);
        toast.error("Failed to upload step image");
      }
    } catch (err) {
      toast.dismiss(uploadToast);
      toast.error("Error uploading step image");
    } finally {
      setUploadingStepIdx(null);
    }
  };

  // Save single step
  const handleSaveSingleStep = async (step: StepBannerItem, index: number) => {
    const token = getAuthToken();
    const saveToast = toast.loading(`Saving Step ${index + 1}...`);
    try {
      const form = new FormData();
      form.append("page", step.page);
      form.append("type", step.type);
      form.append("title", step.title || "");
      form.append("subtitle", step.subtitle || "");
      form.append("cta_text", step.badge || "");
      form.append("image_url", step.image_url || "");
      form.append("sort_order", String(step.sort_order ?? index));
      form.append("is_active", String(step.is_active ?? 1));

      const url = step.id ? `${API}/api/admin/banners/${step.id}` : `${API}/api/admin/banners`;
      const method = step.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast.dismiss(saveToast);
        toast.success(`Step ${index + 1} saved successfully!`);
        loadData();
      } else {
        toast.dismiss(saveToast);
        toast.error("Failed to save step");
      }
    } catch (e) {
      toast.dismiss(saveToast);
      toast.error("Network error while saving step");
    }
  };

  // Helper to get image value
  const getSlotValue = (slot: ImageSlotConfig) => {
    if (slot.type === "site_content") {
      return siteContent[slot.key] || slot.defaultPlaceholder;
    }
    if (slot.key === "frontend_header_logo") {
      return siteSettings.frontend_header_logo || siteSettings.header_logo || slot.defaultPlaceholder;
    }
    if (slot.key === "frontend_footer_logo") {
      return siteSettings.frontend_footer_logo || siteSettings.footer_logo || slot.defaultPlaceholder;
    }
    return siteSettings[slot.key] || slot.defaultPlaceholder;
  };

  // Helper to update text input value
  const handleValueChange = (slot: ImageSlotConfig, val: string) => {
    if (slot.type === "site_content") {
      setSiteContent((prev) => ({ ...prev, [slot.key]: val }));
    } else {
      setSiteSettings((prev) => ({ ...prev, [slot.key]: val }));
    }
  };

  return (
    <>
      <PageMeta
        title="Image & Branding Settings | Selectt Admin"
        description="Configure brand logos, step-by-step 4-card sliders for buy and sell car flows, mobile hero 3-background slider with texts, and catalog in-grid promo cards."
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Hidden File Input for Standard Image Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
          className="hidden"
        />

        {/* Hidden File Input for Step Card Uploads */}
        <input
          type="file"
          ref={stepFileInputRef}
          onChange={handleStepFileSelected}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <PageBreadCrumb pageTitle="Image & Branding Settings" />
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Easily configure Step-by-Step 4-Card Sliders (Sell & Buy), Home Mobile Hero Carousel, Catalog In-Grid Banners, and Brand Logos with direct uploads and live previews.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 self-start sm:self-auto"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-800 scrollbar-thin">
          {[
            { id: "branding", label: "🎨 Brand Logos & OG Image", count: BRANDING_SLOTS.length },
            { id: "mobile-hero", label: "📱 Mobile Hero (3 Slides & Texts)", count: 3 },
            { id: "step-sliders", label: "🔄 Step-by-Step Sliders (Buy & Sell)", count: 8 },
            { id: "buy-cars", label: "🚗 Buy Cars Page Banners", count: BUY_CARS_SLOTS.length },
            { id: "home-sell", label: "🏠 Home Features & Badges", count: HOME_SELL_SLOTS.length },
            { id: "car-details", label: "📄 Car Details Page Visuals", count: CAR_DETAILS_SLOTS.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ActiveTabType)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <span className="animate-spin text-3xl">⏳</span>
            <p className="text-sm font-medium">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* 0. STEP-BY-STEP SLIDERS (SELL CAR & BUY CAR FLOWS) */}
            {activeTab === "step-sliders" && (
              <div className="space-y-6 mb-8">
                {/* Top Info Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/80 border border-teal-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-teal-900 dark:text-teal-300 font-bold text-sm">
                      <Layers size={18} className="text-teal-600" />
                      <span>4-Step Card Carousel Banners (Sell Car & Buy Car Flows)</span>
                    </div>

                    {/* Sub-tab Pill Switcher */}
                    <div className="flex items-center bg-white dark:bg-gray-900 p-1 rounded-xl border border-teal-200/80 dark:border-gray-700 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setStepSubTab("sell")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          stepSubTab === "sell"
                            ? "bg-teal-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        🚗 Sell Car Steps ({sellSteps.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStepSubTab("buy")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          stepSubTab === "buy"
                            ? "bg-teal-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        🏷️ Buy Car Steps ({buySteps.length})
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Manage the 4 interactive 3D step cards shown on the {stepSubTab === "sell" ? "Sell Car page ('How selling your car works in Mumbai/City')" : "Home page ('Buy your car in easy steps')"}. You can upload custom images, change step badges, titles, and descriptions. Pre-filled with your live uploaded images.
                  </p>
                </div>

                {/* 4 Step Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(stepSubTab === "sell" ? sellSteps : buySteps).map((step, idx) => {
                    const currentList = stepSubTab === "sell" ? sellSteps : buySteps;
                    const setList = stepSubTab === "sell" ? setSellSteps : setBuySteps;
                    const isUploading = uploadingStepIdx?.target === stepSubTab && uploadingStepIdx?.index === idx;
                    const resolvedImg = resolveImgUrl(step.image_url || step.defaultImage);

                    return (
                      <div
                        key={step.id || idx}
                        className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Step Header */}
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                                Step #{idx + 1} Card
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                {step.page === "sell-car" ? "Sell Car Page Flow" : "Home Page Buy Flow"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60">
                              {step.badge || `Step ${idx + 1}`}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Visual Preview (Matches live frontend 3D card) */}
                        <div className="mb-4">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Live Step Card Preview (As Seen on Website):
                          </label>
                          <div className="relative w-full aspect-square max-h-[220px] rounded-2xl overflow-hidden shadow-inner bg-slate-950 border border-slate-700/50 group flex flex-col justify-end">
                            {/* Background Image */}
                            <img
                              src={resolvedImg}
                              alt={step.title}
                              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                              onError={(e: any) => {
                                e.currentTarget.src = step.defaultImage;
                              }}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />

                            {/* Card Content Overlay */}
                            <div className="relative z-20 p-4 text-left">
                              <span className="inline-block bg-[#00C9AF] text-slate-950 text-[10px] font-extrabold leading-none px-2 py-0.5 rounded mb-1.5 shadow-xs">
                                {step.badge || `Step ${idx + 1}`}
                              </span>
                              <h4 className="text-white font-black text-sm leading-snug line-clamp-1 mb-1 drop-shadow-md">
                                {step.title || `Step ${idx + 1} Title`}
                              </h4>
                              <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                                {step.subtitle || `Step ${idx + 1} subtitle description`}
                              </p>
                            </div>

                            {/* Top Preview Badge Trigger */}
                            <button
                              type="button"
                              onClick={() => setPreviewImgModal({ url: resolvedImg, title: `Step ${idx + 1}: ${step.title}` })}
                              className="absolute top-2.5 right-2.5 z-30 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="View Full Preview"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Editable Form Controls */}
                        <div className="space-y-3">
                          {/* Image URL & Upload Button */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ImageIcon size={12} className="text-teal-600" /> Card Image URL / Upload:
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">Aspect ratio 1:1 (Square)</span>
                            </label>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={step.image_url || ""}
                                placeholder={step.defaultImage}
                                onChange={(e) => {
                                  const updated = [...currentList];
                                  updated[idx] = { ...updated[idx], image_url: e.target.value };
                                  setList(updated);
                                }}
                                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-teal-500 text-slate-800 dark:text-slate-200 font-mono"
                              />

                              <button
                                type="button"
                                onClick={() => handleTriggerStepUpload(stepSubTab, idx)}
                                disabled={isUploading}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                              >
                                {isUploading ? (
                                  <>
                                    <span className="animate-spin text-xs">⏳</span>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload size={13} />
                                    <span>Upload Image</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Step Badge */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <Tag size={12} className="text-teal-600" /> Step Badge Tag:
                            </label>
                            <input
                              type="text"
                              value={step.badge || ""}
                              placeholder={step.defaultBadge}
                              onChange={(e) => {
                                const updated = [...currentList];
                                updated[idx] = { ...updated[idx], badge: e.target.value };
                                setList(updated);
                              }}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-teal-500 text-slate-800 dark:text-slate-200 font-medium"
                            />
                          </div>

                          {/* Step Title */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <Type size={12} className="text-teal-600" /> Step Title:
                            </label>
                            <input
                              type="text"
                              value={step.title || ""}
                              placeholder={step.defaultTitle}
                              onChange={(e) => {
                                const updated = [...currentList];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setList(updated);
                              }}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-teal-500 text-slate-800 dark:text-slate-200 font-medium"
                            />
                          </div>

                          {/* Step Subtitle / Description */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <AlignLeft size={12} className="text-teal-600" /> Step Description / Subtitle:
                            </label>
                            <textarea
                              rows={2}
                              value={step.subtitle || ""}
                              placeholder={step.defaultSubtitle}
                              onChange={(e) => {
                                const updated = [...currentList];
                                updated[idx] = { ...updated[idx], subtitle: e.target.value };
                                setList(updated);
                              }}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-teal-500 text-slate-800 dark:text-slate-200 font-medium resize-y"
                            />
                          </div>
                        </div>

                        {/* Step Footer Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...currentList];
                              updated[idx] = {
                                ...updated[idx],
                                image_url: step.defaultImage,
                                badge: step.defaultBadge,
                                title: step.defaultTitle,
                                subtitle: step.defaultSubtitle,
                              };
                              setList(updated);
                              toast.success(`Step ${idx + 1} reset to default uploaded image & text`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw size={12} /> Reset to Default
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveSingleStep(step, idx)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <Save size={13} /> Save Step {idx + 1}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1. HOME MOBILE HERO 3-SLIDE CAROUSEL SETUP */}
            {activeTab === "mobile-hero" && (
              <div className="space-y-6 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800/80 border border-emerald-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm mb-1">
                    <Smartphone size={18} className="text-emerald-600" />
                    <span>Home Page Mobile Hero Carousel (3 Backgrounds & Texts)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    The mobile hero section automatically rotates through these 3 background slides with smooth cross-fade animation, custom badge tags, titles, descriptions, and CTA buttons.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {MOBILE_HERO_SLIDES_CONFIG.map((slide) => {
                    const currentImg = siteContent[slide.imageKey] || slide.defaultImage;
                    const resolvedImg = resolveImgUrl(currentImg);
                    const isUploading = uploadingKey === slide.imageKey;

                    return (
                      <div
                        key={slide.slideNumber}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Slide Number Top Badge */}
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {slide.slideNumber}
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              Mobile Slide #{slide.slideNumber}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            Live Auto-Slider
                          </span>
                        </div>

                        {/* Interactive Visual Preview */}
                        <div className="mb-4">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Live Slide Background Preview:
                          </label>
                          <div className="relative w-full aspect-square max-h-[190px] rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-800 group flex items-center justify-center">
                            <img
                              src={resolvedImg}
                              alt={`Mobile Slide ${slide.slideNumber}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e: any) => {
                                e.currentTarget.src = slide.defaultImage;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                            <div className="absolute bottom-3 left-3 right-3 text-left pointer-events-none">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#00C9AF] text-slate-950 rounded-full inline-block mb-1">
                                {siteContent[slide.badgeKey] || slide.defaultBadge}
                              </span>
                              <p className="text-white font-black text-xs leading-tight line-clamp-1">
                                {siteContent[slide.headingKey] || slide.defaultHeading}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setPreviewImgModal({ url: resolvedImg, title: `Mobile Slide #${slide.slideNumber}` })}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="View Full Preview"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Slide Content Controls */}
                        <div className="space-y-3">
                          {/* Image URL & Upload */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ImageIcon size={12} className="text-blue-500" /> Background Image:
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">Aspect ratio 1:1</span>
                            </label>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={siteContent[slide.imageKey] || ""}
                                placeholder={slide.defaultImage}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.imageKey]: e.target.value }))}
                                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-mono"
                              />

                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(slide.imageKey, "site_content", `Mobile Slide #${slide.slideNumber}`)}
                                disabled={isUploading}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                              >
                                {isUploading ? (
                                  <>
                                    <span className="animate-spin text-xs">⏳</span>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload size={13} />
                                    <span>Upload</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Badge Text */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <Tag size={12} className="text-emerald-600" /> Badge Text:
                            </label>
                            <input
                              type="text"
                              value={siteContent[slide.badgeKey] || ""}
                              placeholder={slide.defaultBadge}
                              onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.badgeKey]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                            />
                          </div>

                          {/* Heading */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <Type size={12} className="text-purple-600" /> Main Heading:
                            </label>
                            <input
                              type="text"
                              value={siteContent[slide.headingKey] || ""}
                              placeholder={slide.defaultHeading}
                              onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.headingKey]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium"
                            />
                          </div>

                          {/* Subheading */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                              <AlignLeft size={12} className="text-amber-600" /> Subheading Description:
                            </label>
                            <textarea
                              rows={2}
                              value={siteContent[slide.subheadingKey] || ""}
                              placeholder={slide.defaultSubheading}
                              onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.subheadingKey]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium resize-y"
                            />
                          </div>

                          {/* CTA Button Text & Link */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Button Text:
                              </label>
                              <input
                                type="text"
                                value={siteContent[slide.btnTextKey] || ""}
                                placeholder={slide.defaultBtnText}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.btnTextKey]: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                <LinkIcon size={11} className="text-blue-500" /> Destination:
                              </label>
                              <input
                                type="text"
                                value={siteContent[slide.btnLinkKey] || ""}
                                placeholder={slide.defaultBtnLink}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.btnLinkKey]: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSiteContent((prev) => ({
                                ...prev,
                                [slide.imageKey]: slide.defaultImage,
                                [slide.badgeKey]: slide.defaultBadge,
                                [slide.headingKey]: slide.defaultHeading,
                                [slide.subheadingKey]: slide.defaultSubheading,
                                [slide.btnTextKey]: slide.defaultBtnText,
                                [slide.btnLinkKey]: slide.defaultBtnLink,
                              }));
                              toast.success(`Slide #${slide.slideNumber} reset to default`);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw size={12} /> Reset
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveSingleMobileSlide(slide)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <Save size={13} /> Save Slide {slide.slideNumber}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. MOBILE HOME HIGHLIGHT VIDEO (HOME-SELL TAB) */}
            {activeTab === "home-sell" && (
              <div className="mb-8 rounded-2xl border border-blue-200/90 dark:border-blue-900/50 bg-gradient-to-br from-white via-blue-50/25 to-slate-50 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-800 p-6 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Video size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                          Mobile Home Highlight Video
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Placement: <strong>Mobile Home Page</strong> between Quick Services and Customer Trust Ratings ("Sell your car, best price always").
                      </p>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle Switch & Save Button */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSaveVideo}
                      disabled={savingVideo}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Save size={14} />
                      <span>{savingVideo ? "Saving..." : "Save Video Settings"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const isCurrentlyEnabled = siteContent.mobile_home_video_enabled !== "false";
                        setSiteContent((prev) => ({
                          ...prev,
                          mobile_home_video_enabled: isCurrentlyEnabled ? "false" : "true",
                        }));
                        setSiteSettings((prev) => ({
                          ...prev,
                          mobile_home_video_enabled: isCurrentlyEnabled ? "false" : "true",
                        }));
                        toast.success(isCurrentlyEnabled ? "Video disabled (hidden from mobile home)" : "Video enabled on mobile home");
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        siteContent.mobile_home_video_enabled !== "false"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Power size={14} />
                      <span>{siteContent.mobile_home_video_enabled !== "false" ? "Enabled (Click to Disable)" : "Disabled (Click to Enable)"}</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Content: Preview on Left, Controls on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Interactive Preview Player */}
                  <div className="lg:col-span-5 flex flex-col">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                      Live Video Player Preview:
                    </label>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-gray-800 shadow-inner flex items-center justify-center">
                      {renderMobileVideoPreview(
                        siteContent.mobile_home_video_url || "",
                        siteContent.mobile_home_video_enabled !== "false"
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                      Responsive 16:9 aspect ratio matches exact mobile viewport display
                    </span>
                  </div>

                  {/* Right: Controls & Upload Options */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    {/* Method 1: Video File Upload */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/40">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                            <Upload size={13} className="text-blue-600" />
                            <span>Option 1: Upload Video</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Upload high-definition video directly. Automatically optimized for fast mobile streaming.
                          </p>
                        </div>
                      </div>

                      <input
                        ref={bunnyVideoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/mov"
                        className="hidden"
                        onChange={handleUploadBunnyVideo}
                      />

                      <button
                        type="button"
                        onClick={() => bunnyVideoInputRef.current?.click()}
                        disabled={uploadingBunnyVideo}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {uploadingBunnyVideo ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span>
                            <span>Uploading Video...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Upload Video</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Method 2: YouTube / Direct Video URL Input */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                          <LinkIcon size={13} className="text-blue-500" />
                          <span>Option 2: Video URL or YouTube Link</span>
                        </div>
                        {getVideoTypeBadge(siteContent.mobile_home_video_url)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={siteContent.mobile_home_video_url || ""}
                            placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteContent((prev) => ({
                                ...prev,
                                mobile_home_video_url: val,
                                mobile_home_video_enabled: "true",
                              }));
                              setSiteSettings((prev) => ({
                                ...prev,
                                mobile_home_video_url: val,
                                mobile_home_video_enabled: "true",
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveVideo();
                              }
                            }}
                            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 text-slate-800 dark:text-slate-200 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleSaveVideo}
                            disabled={savingVideo}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            {savingVideo ? (
                              <>
                                <span className="animate-spin text-xs">⏳</span>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save size={14} />
                                <span>Save Video</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Supported:</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 font-mono">youtube.com/watch?v=</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 font-mono">youtu.be/...</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 font-mono">Stream Embed / CDN URL</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 font-mono">.mp4 / .webm</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Save / Delete / Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSaveVideo}
                          disabled={savingVideo}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Save size={13} />
                          <span>{savingVideo ? "Saving..." : "Save Video Changes"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete and remove the mobile home video?")) {
                              setSiteContent((prev) => ({
                                ...prev,
                                mobile_home_video_url: "",
                                mobile_home_video_enabled: "false",
                              }));
                              setSiteSettings((prev) => ({
                                ...prev,
                                mobile_home_video_url: "",
                                mobile_home_video_enabled: "false",
                              }));
                              toast.success("Mobile home video removed and disabled");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete Video</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSiteContent((prev) => ({
                              ...prev,
                              mobile_home_video_url: DEFAULT_MOBILE_HOME_VIDEO,
                              mobile_home_video_enabled: "true",
                            }));
                            setSiteSettings((prev) => ({
                              ...prev,
                              mobile_home_video_url: DEFAULT_MOBILE_HOME_VIDEO,
                              mobile_home_video_enabled: "true",
                            }));
                            toast.success("Reset to default vintage car video");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 transition-all cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Default</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 italic">
                        Tip: Click "Save Video" to commit immediately.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. OTHER TABS (BUY CARS, HOME FEATURES, CAR DETAILS, BRANDING) */}
            {activeTab !== "mobile-hero" && activeTab !== "step-sliders" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {(activeTab === "buy-cars"
                  ? BUY_CARS_SLOTS
                  : activeTab === "home-sell"
                  ? HOME_SELL_SLOTS
                  : activeTab === "car-details"
                  ? CAR_DETAILS_SLOTS
                  : BRANDING_SLOTS
                ).map((slot) => {
                  const currentValue = getSlotValue(slot);
                  const isUploading = uploadingKey === slot.key;
                  const isCustom = Boolean(slot.type === "site_content" ? siteContent[slot.key] : siteSettings[slot.key]);
                  const resolvedImg = resolveImgUrl(currentValue);

                  return (
                    <div
                      key={slot.key}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Slot Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                              {slot.title}
                            </h3>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                              {slot.placement}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                              isCustom
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-400 border border-slate-200 dark:border-gray-700"
                            }`}
                          >
                            {isCustom ? "Custom" : "Default"}
                          </span>
                        </div>

                        {/* Description & Recommended Size */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                          {slot.description}
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-150 dark:border-gray-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-4">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>Rec. Size: <strong>{slot.recommendedSize}</strong></span>
                        </div>

                        {/* Image Preview Box */}
                        <div
                          className={`relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800 mb-4 flex items-center justify-center group ${
                            slot.isDarkBackground || slot.key === "header_logo" || slot.key === "auth_logo"
                              ? "bg-[#0C1B33]"
                              : "bg-slate-100 dark:bg-gray-800/80"
                          }`}
                        >
                          {currentValue ? (
                            <>
                              <img
                                src={resolvedImg}
                                alt={slot.title}
                                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                onError={(e: any) => {
                                  e.currentTarget.src = slot.defaultPlaceholder;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImgModal({ url: resolvedImg, title: slot.title })}
                                  className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                                  title="View preview"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                              <ImageIcon size={28} />
                              <span className="text-[11px]">No image configured</span>
                            </div>
                          )}
                        </div>

                        {/* URL Input & Direct Actions */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Image Path / URL:
                          </label>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={slot.type === "site_content" ? (siteContent[slot.key] || "") : (siteSettings[slot.key] || "")}
                              placeholder={slot.defaultPlaceholder}
                              onChange={(e) => handleValueChange(slot, e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 text-slate-800 dark:text-slate-200 font-mono"
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTriggerUpload(slot.key, slot.type, slot.title)}
                              disabled={isUploading}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {isUploading ? (
                                <>
                                  <span className="animate-spin text-xs">⏳</span>
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={13} />
                                  <span>Upload Image</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!window.confirm(`Reset "${slot.title}" to default placeholder?`)) return;
                                if (slot.type === "site_content") {
                                  setSiteContent((prev) => ({ ...prev, [slot.key]: "" }));
                                } else {
                                  setSiteSettings((prev) => ({ ...prev, [slot.key]: "" }));
                                }
                                toast.success(`${slot.title} reset to default`);
                              }}
                              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                              title="Reset to default placeholder"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Optional Associated Link & Visibility Controls */}
                      {slot.hasLink && slot.linkKey && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-800 space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                              <LinkIcon size={12} className="text-blue-500" /> Click Destination Link / Action URL
                            </label>
                            <input
                              type="text"
                              placeholder={slot.defaultLink || "/"}
                              value={siteSettings[slot.linkKey] !== undefined ? siteSettings[slot.linkKey] : (slot.defaultLink || "")}
                              onChange={(e) => setSiteSettings((prev) => ({ ...prev, [slot.linkKey!]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          {slot.hasVisibility && slot.visibilityKey && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700">
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Visible in Vehicle Grid</p>
                                <p className="text-[11px] text-slate-500">Show this promo card in the catalog</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={siteSettings[slot.visibilityKey] !== "false" && siteSettings[slot.visibilityKey] !== "0"}
                                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, [slot.visibilityKey!]: e.target.checked ? "true" : "false" }))}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom Save Changes Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white shadow-xl flex items-center justify-between gap-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-slate-300">Ready to publish your brand & step slider visual changes?</span>
            <span className="sm:hidden font-medium">Publish changes</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            {saving ? "Saving Changes..." : "Save All Settings"}
          </button>
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {previewImgModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-3xl p-6 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{previewImgModal.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewImgModal(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 p-2">
              <img
                src={previewImgModal.url}
                alt={previewImgModal.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <a
                href={previewImgModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Open Full Size in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

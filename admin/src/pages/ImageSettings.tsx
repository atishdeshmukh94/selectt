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
  Layers,
  Tag,
  Type,
  AlignLeft,
  Navigation
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import { API_URL } from "../config/api";

const API = API_URL;

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
    defaultImage: "/img/warranty_banner_1to1.png",
    defaultBadge: "Selectt assured cover",
    defaultHeading: "1-Year warranty",
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
    defaultImage: "/img/car_loan_banner_1to1.png",
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
    defaultImage: "/img/mobile_hero_cover.png",
    defaultBadge: "India's most trusted",
    defaultHeading: "Find your dream car",
    defaultSubheading: "India's most-trusted certified pre-owned cars",
    defaultBtnText: "Buy car",
    defaultBtnLink: "/buy-cars",
  },
];

interface ImageSlotConfig {
  key: string;
  type: "site_content" | "site_setting";
  title: string;
  placement: string;
  recommendedSize: string;
  description: string;
  defaultPlaceholder: string;
  hasLink?: boolean;
  linkKey?: string;
  defaultLink?: string;
  hasVisibility?: boolean;
  visibilityKey?: string;
}

// 1. BRAND LOGOS & IDENTITY
const BRANDING_SLOTS: ImageSlotConfig[] = [
  {
    key: "header_logo",
    type: "site_setting",
    title: "Header Main Logo (Dark Navy Navbar)",
    placement: "Main Website Top Navigation Bar",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Primary brand logo displayed in the top header on desktop and mobile screens.",
    defaultPlaceholder: "/img/light-logo.svg",
  },
  {
    key: "header_logo_light",
    type: "site_setting",
    title: "Header Light / Contrast Logo",
    placement: "Light Background Header Mode",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Alternative brand logo for light mode backgrounds and white headers.",
    defaultPlaceholder: "/img/dark-logo.svg",
  },
  {
    key: "admin_logo_icon",
    type: "site_setting",
    title: "Browser Favicon & PWA App Icon",
    placement: "Browser Tab, Mobile Home Screen & Bookmarks",
    recommendedSize: "64 × 64 px or 192 × 192 px PNG / ICO",
    description: "App icon visible in browser tabs, address bars, and install dialogs.",
    defaultPlaceholder: "/favicon.png",
  },
  {
    key: "auth_logo",
    type: "site_setting",
    title: "Login & Register Modal Logo",
    placement: "Customer Authentication Popup Header",
    recommendedSize: "200 × 50 px PNG / SVG",
    description: "Brand logo shown inside the OTP login and customer signup modal dialog.",
    defaultPlaceholder: "/img/light-logo.svg",
  },
  {
    key: "admin_logo",
    type: "site_setting",
    title: "Admin Panel Logo (Light Sidebar)",
    placement: "Admin Portal Navigation Sidebar",
    recommendedSize: "240 × 60 px PNG / SVG",
    description: "Logo shown in the top-left of the admin management console.",
    defaultPlaceholder: "/images/logo/dark-logo.svg",
  },
  {
    key: "og_image",
    type: "site_setting",
    title: "WhatsApp & Social Share Preview (OpenGraph)",
    placement: "Social Media & WhatsApp Link Cards",
    recommendedSize: "1200 × 630 px (1.91:1)",
    description: "Rich preview image shown when website URLs are shared on WhatsApp, Facebook, or Twitter.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
  },
];

// 2. BUY CARS IN-GRID BANNERS
const BUY_CARS_SLOTS: ImageSlotConfig[] = [
  {
    key: "extra_card_logo_url",
    type: "site_setting",
    title: "In-Grid Banner Card #1 (Row 1, Slot 3)",
    placement: "Vehicle Catalog Grid > Slot #1",
    recommendedSize: "400 × 500 px (4:5 Aspect Ratio)",
    description: "First promotional banner displayed seamlessly between car cards in the search catalog.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
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
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
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
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
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
    defaultPlaceholder: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "sell_car_banner",
    type: "site_content",
    title: "Sell Car Instant Valuation Banner",
    placement: "Home & Sell Car Pages > Valuation Card",
    recommendedSize: "600 × 400 px (3:2)",
    description: "Visual banner for the Sell Car instant pricing calculation form.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "trust_banner_1",
    type: "site_content",
    title: "Trust Badge #1 — 140-Point Inspection",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge highlighting certified quality check guarantee.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop",
  },
  {
    key: "trust_banner_2",
    type: "site_content",
    title: "Trust Badge #2 — 7-Day Money Back Guarantee",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge for customer return policy guarantee.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop",
  },
  {
    key: "trust_banner_3",
    type: "site_content",
    title: "Trust Badge #3 — 1-Year Comprehensive Warranty",
    placement: "Home Page > Selectt Assured Trust Section",
    recommendedSize: "400 × 300 px (4:3)",
    description: "Illustration badge for extended roadside assistance and warranty.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=600&auto=format&fit=crop",
  },
];

// 4. CAR DETAILS & MODALS
const CAR_DETAILS_SLOTS: ImageSlotConfig[] = [
  {
    key: "login_modal_banner",
    type: "site_setting",
    title: "Login / Signup Modal Left Side Illustration",
    placement: "Authentication Popup > Left Side Visual",
    recommendedSize: "450 × 535 px (5:6)",
    description: "Visual banner shown on the left of customer login and signup modal.",
    defaultPlaceholder: "/login-banner-left-sdie.png",
  },
  {
    key: "car_details_sidebar_banner",
    type: "site_content",
    title: "Car Details Sidebar Promo Banner",
    placement: "Car Details Page > Right Sidebar",
    recommendedSize: "600 × 350 px (16:9)",
    description: "Loan and warranty promotional banner displayed in vehicle view pages.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  },
];

// 5. SERVICES & POLICIES
const SERVICE_POLICY_SLOTS: ImageSlotConfig[] = [
  {
    key: "loan_banner",
    type: "site_content",
    title: "Used Car Loan Page Hero Banner",
    placement: "Used Car Loan Page > Top Banner",
    recommendedSize: "1200 × 400 px (3:1)",
    description: "Header banner displayed on the Used Car Loan application page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "insurance_banner",
    type: "site_content",
    title: "Car Insurance Page Hero Banner",
    placement: "Car Insurance Page > Top Banner",
    recommendedSize: "1200 × 400 px (3:1)",
    description: "Header banner displayed on the Car Insurance quotes page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "warranty_banner",
    type: "site_content",
    title: "Selectt Assured Warranty Page Banner",
    placement: "Selectt Assured Quality Page > Top Header",
    recommendedSize: "1200 × 400 px (3:1)",
    description: "Header banner displayed on the Selectt Assured guarantee page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "buyback_banner",
    type: "site_content",
    title: "Selectt Buyback Guarantee Banner",
    placement: "Selectt Buyback Assurance Page > Top Header",
    recommendedSize: "1200 × 400 px (3:1)",
    description: "Header banner on the Buyback Assurance information page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop",
  },
];

type ActiveTabType = "mobile-hero" | "buy-cars" | "home-sell" | "car-details" | "services" | "branding";

export default function ImageSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTabType) || "mobile-hero";
  const [activeTab, setActiveTab] = useState<ActiveTabType>(
    ["mobile-hero", "buy-cars", "home-sell", "car-details", "services", "branding"].includes(initialTab) ? initialTab : "mobile-hero"
  );

  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewImgModal, setPreviewImgModal] = useState<{ url: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentKeyForUpload, setCurrentKeyForUpload] = useState<{ key: string; type: "site_content" | "site_setting"; title: string } | null>(null);

  const getAuthToken = () => localStorage.getItem("adminToken") || "";

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load all settings and content
  const loadData = async () => {
    setLoading(true);
    try {
      const [contentRes, settingsRes] = await Promise.all([
        fetch(`${API}/api/site-content`).catch(() => null),
        fetch(`${API}/api/settings/public`).catch(() => null),
      ]);

      if (contentRes && contentRes.ok) {
        const contentData = await contentRes.json();
        setSiteContent(contentData || {});
      }
      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSiteSettings(settingsData || {});
      }
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
        // Fallback: save keys individually
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

      if (settingsRes.ok || contentRes) {
        toast.success("✅ Image & Branding settings saved successfully!");
        loadData();
      } else {
        toast.error("Failed to save settings");
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

  // Helper to get image value
  const getSlotValue = (slot: ImageSlotConfig) => {
    if (slot.type === "site_content") {
      return siteContent[slot.key] || slot.defaultPlaceholder;
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
        description="Configure brand logos, mobile hero 3-background slider with texts, and catalog in-grid promo cards."
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Hidden File Input for Image Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
          className="hidden"
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <PageBreadCrumb pageTitle="Image & Branding Settings" />
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Easily configure Home Mobile Hero 3-Slide Carousel, Catalog In-Grid Banners, and Brand Logos with direct uploads and live previews.
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
          {[
            { id: "mobile-hero", label: "📱 Mobile Hero (3 Slides & Texts)", count: 3 },
            { id: "buy-cars", label: "🚗 Buy Cars In-Grid Banners", count: BUY_CARS_SLOTS.length },
            { id: "home-sell", label: "🏠 Home Features & Badges", count: HOME_SELL_SLOTS.length },
            { id: "car-details", label: "📄 Car Details & Modal Visuals", count: CAR_DETAILS_SLOTS.length },
            { id: "services", label: "🛡️ Services & Policy Banners", count: SERVICE_POLICY_SLOTS.length },
            { id: "branding", label: "🎨 Brand Logos & Identity", count: BRANDING_SLOTS.length },
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
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            750 × 600 px (5:4)
                          </span>
                        </div>

                        {/* Background Image Preview & Upload */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                              <ImageIcon size={12} /> Slide Background Image
                            </label>

                            <div className="relative group w-full h-44 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 overflow-hidden flex items-center justify-center mb-2.5">
                              <img
                                src={currentImg}
                                alt={`Slide ${slide.slideNumber}`}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = slide.defaultImage;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImgModal({ url: currentImg, title: `Mobile Slide #${slide.slideNumber}` })}
                                  className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-sm cursor-pointer"
                                  title="View Full Preview"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder={slide.defaultImage}
                                value={siteContent[slide.imageKey] || ""}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.imageKey]: e.target.value }))}
                                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 font-mono text-slate-800 dark:text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(slide.imageKey, "site_content", `Mobile Slide #${slide.slideNumber}`)}
                                disabled={isUploading}
                                className="px-3 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
                              >
                                {isUploading ? (
                                  <span className="animate-spin text-xs">⏳</span>
                                ) : (
                                  <Upload size={13} />
                                )}
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>

                          {/* Slide Content Fields */}
                          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-left">
                            {/* Badge Text */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Tag size={12} className="text-emerald-500" /> Badge Text
                              </label>
                              <input
                                type="text"
                                placeholder={slide.defaultBadge}
                                value={siteContent[slide.badgeKey] !== undefined ? siteContent[slide.badgeKey] : slide.defaultBadge}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.badgeKey]: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-medium"
                              />
                            </div>

                            {/* Heading / Title */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Type size={12} className="text-blue-500" /> Heading / Big Title
                              </label>
                              <input
                                type="text"
                                placeholder={slide.defaultHeading}
                                value={siteContent[slide.headingKey] !== undefined ? siteContent[slide.headingKey] : slide.defaultHeading}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.headingKey]: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-bold"
                              />
                            </div>

                            {/* Subtitle / Description */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <AlignLeft size={12} className="text-purple-500" /> Subtitle / Description
                              </label>
                              <textarea
                                rows={2}
                                placeholder={slide.defaultSubheading}
                                value={siteContent[slide.subheadingKey] !== undefined ? siteContent[slide.subheadingKey] : slide.defaultSubheading}
                                onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.subheadingKey]: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200 resize-none"
                              />
                            </div>

                            {/* Button Text & Link */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                  <Navigation size={11} className="text-amber-500" /> CTA Button Text
                                </label>
                                <input
                                  type="text"
                                  placeholder={slide.defaultBtnText}
                                  value={siteContent[slide.btnTextKey] !== undefined ? siteContent[slide.btnTextKey] : slide.defaultBtnText}
                                  onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.btnTextKey]: e.target.value }))}
                                  className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                                  <LinkIcon size={11} className="text-cyan-500" /> Target URL
                                </label>
                                <input
                                  type="text"
                                  placeholder={slide.defaultBtnLink}
                                  value={siteContent[slide.btnLinkKey] !== undefined ? siteContent[slide.btnLinkKey] : slide.defaultBtnLink}
                                  onChange={(e) => setSiteContent((prev) => ({ ...prev, [slide.btnLinkKey]: e.target.value }))}
                                  className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Top Control for Buy Cars Page Marquee Announcement */}
            {activeTab === "buy-cars" && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/60 border border-blue-200/80 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>Catalog Top Announcement Marquee (Optional)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Announcement text displayed at the top of the vehicle inventory grid on /buy-cars.
                </p>
                <input
                  type="text"
                  placeholder="e.g. ⚡ Mega Festival Offer: Zero Downpayment & Free 1-Year Insurance on Selected Cars!"
                  value={siteSettings.buy_cars_marquee_text || ""}
                  onChange={(e) => setSiteSettings((prev) => ({ ...prev, buy_cars_marquee_text: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* OTHER TABS CARDS GRID */}
            {activeTab !== "mobile-hero" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {(activeTab === "buy-cars" ? BUY_CARS_SLOTS :
                  activeTab === "home-sell" ? HOME_SELL_SLOTS :
                  activeTab === "car-details" ? CAR_DETAILS_SLOTS :
                  activeTab === "services" ? SERVICE_POLICY_SLOTS : BRANDING_SLOTS
                ).map((slot) => {
                  const currentVal = getSlotValue(slot);
                  const isUploading = uploadingKey === slot.key;

                  return (
                    <div
                      key={slot.key}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              {slot.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                                {slot.placement}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10.5px] font-bold text-blue-700 dark:text-blue-300">
                                {slot.recommendedSize}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                          {slot.description}
                        </p>

                        {/* Image Preview & Upload Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          {/* Image Thumbnail Box */}
                          <div className="relative group w-full sm:w-44 h-32 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                            {currentVal ? (
                              <img
                                src={currentVal}
                                alt={slot.title}
                                className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = slot.defaultPlaceholder;
                                }}
                              />
                            ) : (
                              <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                                <ImageIcon size={20} />
                                <span>No Image</span>
                              </div>
                            )}

                            {/* Hover Overlay with Preview Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewImgModal({ url: currentVal, title: slot.title })}
                                className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-sm cursor-pointer"
                                title="View Full Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <a
                                href={currentVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-sm"
                                title="Open Link"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                          </div>

                          {/* URL input and action buttons */}
                          <div className="flex-1 flex flex-col justify-between gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                                Image URL / Source
                              </label>
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
            <span className="hidden sm:inline text-slate-300">Ready to publish your brand visual changes?</span>
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
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-gray-800 p-2">
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

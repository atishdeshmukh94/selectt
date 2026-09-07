import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import {
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  ShieldCheck,
  HelpCircle,
  FileImage,
  Loader2,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  Car,
  DollarSign,
  LayoutList,
  LayoutGrid,
  CheckCircle2,
  Info,
  ShoppingBag,
  CreditCard,
  Layers,
  Save
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import { API_URL } from "../config/api";

const API = API_URL;

interface ImageSlotConfig {
  key: string;
  type: "site_content" | "site_setting";
  title: string;
  page: string;
  pageUrl: string;
  placement: string;
  recommendedSize: string;
  aspectRatio: string;
  description: string;
  defaultPlaceholder: string;
}

type Banner = {
  id: number;
  page: string;
  type: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  flip_image?: number;
};

// --- Page Wise Static Image Slots ---
const HOME_STATIC_SLOTS: ImageSlotConfig[] = [
  {
    key: "mobile_hero_cover",
    type: "site_content",
    title: "Mobile Hero Cover Banner",
    page: "Home Page",
    pageUrl: "/",
    placement: "Home > Mobile Hero Section",
    recommendedSize: "750 × 600 px",
    aspectRatio: "5:4",
    description: "Featured hero car showcase image on mobile smartphones.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "buy_car_banner",
    type: "site_content",
    title: "Buy Car Quick Search Banner",
    page: "Home Page",
    pageUrl: "/",
    placement: "Home > Buy / Sell Switcher Tab",
    recommendedSize: "600 × 400 px",
    aspectRatio: "3:2",
    description: "Visual banner for the Browse & Buy cars switcher card.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "sell_car_banner",
    type: "site_content",
    title: "Sell Your Car Form Banner",
    page: "Home & Sell Pages",
    pageUrl: "/sell-car",
    placement: "Home / Sell > Instant Valuation Card",
    recommendedSize: "600 × 400 px",
    aspectRatio: "3:2",
    description: "Visual banner for the Sell Car instant quote form.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "trust_banner_1",
    type: "site_content",
    title: "Trust Badge #1 — 140-Point Inspection",
    page: "Home Page",
    pageUrl: "/",
    placement: "Home > Selectt Trust Assurance",
    recommendedSize: "400 × 300 px",
    aspectRatio: "4:3",
    description: "Certification & rigorous inspection illustration / badge.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop",
  },
  {
    key: "trust_banner_2",
    type: "site_content",
    title: "Trust Badge #2 — 7-Day Money Back Guarantee",
    page: "Home Page",
    pageUrl: "/",
    placement: "Home > Selectt Trust Assurance",
    recommendedSize: "400 × 300 px",
    aspectRatio: "4:3",
    description: "Return policy & assurance badge illustration.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop",
  },
  {
    key: "trust_banner_3",
    type: "site_content",
    title: "Trust Badge #3 — 1-Year Comprehensive Warranty",
    page: "Home Page",
    pageUrl: "/",
    placement: "Home > Selectt Trust Assurance",
    recommendedSize: "400 × 300 px",
    aspectRatio: "4:3",
    description: "Warranty & roadside assistance badge illustration.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=600&auto=format&fit=crop",
  },
];

// --- Buy Cars Page Static Image Slots ---
const BUY_CARS_STATIC_SLOTS: ImageSlotConfig[] = [
  {
    key: "extra_card_logo_url",
    type: "site_setting",
    title: "In-Grid Banner #1 (Row 1, Slot 3)",
    page: "Buy Cars Page",
    pageUrl: "/buy-cars",
    placement: "Vehicle Grid > Slot #1 (Row 1)",
    recommendedSize: "400 × 500 px (4:5)",
    aspectRatio: "4:5",
    description: "First promotional banner card in the car grid (e.g. Used Car Loan @ ₹35L offer).",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "buy_grid_banner_2_img",
    type: "site_setting",
    title: "In-Grid Banner #2 (After 3-Row Gap)",
    page: "Buy Cars Page",
    pageUrl: "/buy-cars",
    placement: "Vehicle Grid > Slot #2 (3 Lines After Banner #1)",
    recommendedSize: "400 × 500 px (4:5)",
    aspectRatio: "4:5",
    description: "Second promotional banner card shown 3 lines/rows after Banner #1 (e.g. Insurance / Warranty).",
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "buy_grid_banner_3_img",
    type: "site_setting",
    title: "In-Grid Banner #3 (After 3-Row Gap)",
    page: "Buy Cars Page",
    pageUrl: "/buy-cars",
    placement: "Vehicle Grid > Slot #3 (3 Lines After Banner #2)",
    recommendedSize: "400 × 500 px (4:5)",
    aspectRatio: "4:5",
    description: "Third promotional banner card shown 3 lines/rows after Banner #2 (e.g. Sell Car / Valuation).",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  },
];

const CAR_DETAIL_STATIC_SLOTS: ImageSlotConfig[] = [
  {
    key: "login_modal_banner",
    type: "site_content",
    title: "Login / Signup Modal Side Banner",
    page: "Global Login Modal",
    pageUrl: "/",
    placement: "Authentication Popup > Left Side Visual",
    recommendedSize: "600 × 800 px",
    aspectRatio: "3:4",
    description: "Visual banner shown on the customer login/register popup modal.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "car_details_sidebar_banner",
    type: "site_content",
    title: "Car Details Sidebar Promo Banner",
    page: "Car Details Page",
    pageUrl: "/car/view",
    placement: "Car Details > Sticky Right Sidebar Banner",
    recommendedSize: "600 × 350 px",
    aspectRatio: "16:9",
    description: "Promotional loan / warranty banner in car details sidebar.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  },
];

const SERVICE_STATIC_SLOTS: ImageSlotConfig[] = [
  {
    key: "loan_banner",
    type: "site_content",
    title: "Used Car Loan Page Header Banner",
    page: "Used Car Loan",
    pageUrl: "/used-car-loan",
    placement: "Used Car Loan > Top Hero Banner",
    recommendedSize: "1200 × 400 px",
    aspectRatio: "3:1",
    description: "Banner displayed on the Used Car Loan application page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "insurance_banner",
    type: "site_content",
    title: "Car Insurance Page Header Banner",
    page: "Car Insurance",
    pageUrl: "/car-insurance",
    placement: "Car Insurance > Top Hero Banner",
    recommendedSize: "1200 × 400 px",
    aspectRatio: "3:1",
    description: "Banner displayed on the Car Insurance quote page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "warranty_banner",
    type: "site_content",
    title: "Selectt Assured Warranty Page Banner",
    page: "Selectt Assured",
    pageUrl: "/selectt-assured",
    placement: "Selectt Assured > Top Header Banner",
    recommendedSize: "1200 × 400 px",
    aspectRatio: "3:1",
    description: "Banner displayed on the Selectt Assured quality page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "buyback_banner",
    type: "site_content",
    title: "Assured Buyback Guarantee Banner",
    page: "Buyback Assurance",
    pageUrl: "/buyback-assurance",
    placement: "Buyback Assurance > Top Hero Banner",
    recommendedSize: "1200 × 400 px",
    aspectRatio: "3:1",
    description: "Banner displayed on the Guaranteed Buyback policy page.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop",
  },
];

const BRANDING_STATIC_SLOTS: ImageSlotConfig[] = [
  {
    key: "header_logo",
    type: "site_setting",
    title: "Header Main Logo (Dark Navbar)",
    page: "Global Header",
    pageUrl: "/",
    placement: "Top Navigation Bar (Dark / Transparent)",
    recommendedSize: "240 × 60 px PNG / SVG (Transparent)",
    aspectRatio: "4:1",
    description: "Primary logo displayed on dark navigation bar background.",
    defaultPlaceholder: "/brand-logo.png",
  },
  {
    key: "header_logo_dark",
    type: "site_setting",
    title: "Header Main Logo (Light Navbar)",
    page: "Global Header",
    pageUrl: "/",
    placement: "Top Navigation Bar (Light / White)",
    recommendedSize: "240 × 60 px PNG / SVG (Transparent)",
    aspectRatio: "4:1",
    description: "Secondary logo displayed when navbar turns white on scroll.",
    defaultPlaceholder: "/brand-logo-dark.png",
  },
  {
    key: "footer_logo",
    type: "site_setting",
    title: "Footer Logo",
    page: "Global Footer",
    pageUrl: "/",
    placement: "Website Footer Bottom Area",
    recommendedSize: "240 × 60 px PNG / SVG",
    aspectRatio: "4:1",
    description: "Logo displayed in the footer section across all pages.",
    defaultPlaceholder: "/brand-logo.png",
  },
  {
    key: "favicon",
    type: "site_setting",
    title: "Browser Favicon",
    page: "Browser Tab Icon",
    pageUrl: "/",
    placement: "Browser Tab & Bookmark Icon",
    recommendedSize: "64 × 64 px PNG / ICO",
    aspectRatio: "1:1",
    description: "Small icon visible in browser tabs and bookmarks.",
    defaultPlaceholder: "/favicon.ico",
  },
  {
    key: "og_image",
    type: "site_setting",
    title: "Social Share & WhatsApp Preview (OpenGraph)",
    page: "Social Links",
    pageUrl: "/",
    placement: "WhatsApp, Facebook, Twitter Link Previews",
    recommendedSize: "1200 × 630 px (1.91:1)",
    aspectRatio: "1.91:1",
    description: "Preview banner shown when website link is shared on WhatsApp or social media.",
    defaultPlaceholder: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function ImageSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "home";
  const [activeTab, setActiveTab] = useState<"home" | "buy-cars" | "car-detail" | "sell-car" | "services" | "branding">(
    ["home", "buy-cars", "car-detail", "sell-car", "services", "branding"].includes(initialTab) ? initialTab : "home"
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Buy Cars Page In-Grid 3 Banners & Marquee states
  const [extraCardBtnLink, setExtraCardBtnLink] = useState("/used-car-loan");
  const [extraCardIsActive, setExtraCardIsActive] = useState(true);

  const [gridBanner2Link, setGridBanner2Link] = useState("/car-insurance");
  const [gridBanner2Active, setGridBanner2Active] = useState(true);

  const [gridBanner3Link, setGridBanner3Link] = useState("/sell-car");
  const [gridBanner3Active, setGridBanner3Active] = useState(true);

  const [buyCarsMarquee, setBuyCarsMarquee] = useState("");
  const [savingBuyCarsSettings, setSavingBuyCarsSettings] = useState(false);

  const handleTabChange = (tab: "home" | "buy-cars" | "car-detail" | "sell-car" | "services" | "branding") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Full image preview modal
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string } | null>(null);

  // Banner CRUD modal
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [savingBanner, setSavingBanner] = useState(false);

  // Hidden file input ref for slot images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlotForUpload, setCurrentSlotForUpload] = useState<ImageSlotConfig | null>(null);

  const getAuthToken = () => localStorage.getItem("adminToken") || "";

  // Fetch all site content, settings, banners
  const fetchData = async () => {
    setLoading(true);
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [contentRes, settingsRes, bannersRes] = await Promise.all([
        fetch(`${API}/api/site-content`).catch(() => null),
        fetch(`${API}/api/settings/public`).catch(() => null),
        fetch(`${API}/api/admin/banners`, { headers }).catch(() => null),
      ]);

      if (contentRes && contentRes.ok) {
        const contentData = await contentRes.json();
        setSiteContent(contentData || {});
      }
      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSiteSettings(settingsData || {});
        if (settingsData.extra_card_btn_link !== undefined) {
          setExtraCardBtnLink(settingsData.extra_card_btn_link || "/used-car-loan");
        }
        if (settingsData.extra_card_is_active !== undefined) {
          setExtraCardIsActive(settingsData.extra_card_is_active !== "false" && settingsData.extra_card_is_active !== "0");
        }
        if (settingsData.buy_grid_banner_2_link !== undefined) {
          setGridBanner2Link(settingsData.buy_grid_banner_2_link || "/car-insurance");
        }
        if (settingsData.buy_grid_banner_2_active !== undefined) {
          setGridBanner2Active(settingsData.buy_grid_banner_2_active !== "false" && settingsData.buy_grid_banner_2_active !== "0");
        }
        if (settingsData.buy_grid_banner_3_link !== undefined) {
          setGridBanner3Link(settingsData.buy_grid_banner_3_link || "/sell-car");
        }
        if (settingsData.buy_grid_banner_3_active !== undefined) {
          setGridBanner3Active(settingsData.buy_grid_banner_3_active !== "false" && settingsData.buy_grid_banner_3_active !== "0");
        }
        if (settingsData.buy_cars_marquee_text !== undefined) {
          setBuyCarsMarquee(settingsData.buy_cars_marquee_text || "");
        }
      }
      if (bannersRes && bannersRes.ok) {
        const bData = await bannersRes.json();
        setBanners(Array.isArray(bData) ? bData : []);
      }
    } catch (err) {
      console.error("Failed to load settings data:", err);
      toast.error("Error loading image settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveBuyCarsSettings = async () => {
    setSavingBuyCarsSettings(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          extra_card_btn_link: extraCardBtnLink,
          extra_card_is_active: extraCardIsActive ? "true" : "false",
          buy_grid_banner_2_link: gridBanner2Link,
          buy_grid_banner_2_active: gridBanner2Active ? "true" : "false",
          buy_grid_banner_3_link: gridBanner3Link,
          buy_grid_banner_3_active: gridBanner3Active ? "true" : "false",
          buy_cars_marquee_text: buyCarsMarquee,
        }),
      });

      if (res.ok) {
        toast.success("All 3 In-Grid Banners & Buy Cars settings saved!");
        fetchData();
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Network error saving settings");
    } finally {
      setSavingBuyCarsSettings(false);
    }
  };

  // Slot Upload Handler
  const handleTriggerUpload = (slot: ImageSlotConfig) => {
    setCurrentSlotForUpload(slot);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlotForUpload) return;

    const slot = currentSlotForUpload;
    setUploadingKey(slot.key);
    const token = getAuthToken();
    const formData = new FormData();

    try {
      if (slot.type === "site_content") {
        formData.append("file", file);
        formData.append("key", slot.key);

        const res = await fetch(`${API}/api/admin/site-content`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setSiteContent((prev) => ({ ...prev, [slot.key]: data.value }));
          toast.success(`${slot.title} updated successfully!`);
        } else {
          toast.error("Failed to update image");
        }
      } else {
        formData.append(slot.key, file);

        const res = await fetch(`${API}/api/settings/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          toast.success(`${slot.title} updated successfully!`);
          fetchData();
        } else {
          toast.error("Failed to update logo/setting");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image");
    } finally {
      setUploadingKey(null);
      setCurrentSlotForUpload(null);
    }
  };

  const handleRemoveImage = async (slot: ImageSlotConfig) => {
    if (!window.confirm(`Are you sure you want to reset "${slot.title}" to default?`)) {
      return;
    }

    setDeletingKey(slot.key);
    const token = getAuthToken();

    try {
      if (slot.type === "site_content") {
        const res = await fetch(`${API}/api/admin/site-content/${slot.key}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          toast.success(`${slot.title} reset to default`);
          setSiteContent((prev) => {
            const next = { ...prev };
            delete next[slot.key];
            return next;
          });
        } else {
          toast.error("Failed to remove image");
        }
      } else {
        const res = await fetch(`${API}/api/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [slot.key]: "" }),
        });

        if (res.ok) {
          toast.success(`${slot.title} reset to default`);
          setSiteSettings((prev) => ({ ...prev, [slot.key]: "" }));
        } else {
          toast.error("Failed to reset setting");
        }
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Error removing image");
    } finally {
      setDeletingKey(null);
    }
  };

  // Banner CRUD
  const openNewBanner = (page: string, type: string) => {
    setEditingBanner({
      page,
      type,
      title: "",
      subtitle: "",
      cta_text: "",
      cta_link: "",
      image_url: "",
      sort_order: 0,
      is_active: 1,
    });
    setBannerImageFile(null);
    setBannerPreview("");
    setShowBannerModal(true);
  };

  const openEditBanner = (b: Banner) => {
    setEditingBanner({ ...b });
    setBannerImageFile(null);
    setBannerPreview(b.image_url ? (b.image_url.startsWith("http") ? b.image_url : `${API}${b.image_url}`) : "");
    setShowBannerModal(true);
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;
    setSavingBanner(true);
    const token = getAuthToken();
    const form = new FormData();
    Object.entries(editingBanner).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (bannerImageFile) form.append("image", bannerImageFile);

    const url = editingBanner.id ? `${API}/api/admin/banners/${editingBanner.id}` : `${API}/api/admin/banners`;
    const method = editingBanner.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: form });
      if (res.ok) {
        toast.success("Banner saved successfully!");
        fetchData();
        setShowBannerModal(false);
      } else {
        const d = await res.json();
        toast.error(d.message || "Failed to save banner");
      }
    } catch (err) {
      toast.error("Network error saving banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const token = getAuthToken();
    await fetch(`${API}/api/admin/banners/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast.success("Banner deleted");
    fetchData();
  };

  const handleToggleBanner = async (b: Banner) => {
    const token = getAuthToken();
    const form = new FormData();
    Object.entries(b).forEach(([k, v]) => form.append(k, String(v)));
    form.set("is_active", b.is_active ? "0" : "1");
    await fetch(`${API}/api/admin/banners/${b.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: form });
    fetchData();
  };

  const getSlotImage = (slot: ImageSlotConfig) => {
    if (slot.type === "site_content") {
      const val = siteContent[slot.key];
      if (val) return val.startsWith("http") ? val : `${API}${val}`;
      return slot.defaultPlaceholder;
    } else {
      const val = siteSettings[slot.key];
      if (val) return val.startsWith("http") ? val : `${API}${val}`;
      return slot.defaultPlaceholder;
    }
  };

  const isCustomImage = (slot: ImageSlotConfig) => {
    if (slot.type === "site_content") return !!siteContent[slot.key];
    return !!siteSettings[slot.key];
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  };

  // ── Render Static Image Slots (List Table or Grid Cards) ──
  const renderSlotsSection = (slots: ImageSlotConfig[], sectionTitle: string, subtitle?: string) => {
    if (slots.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span>{sectionTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1C3EB9] border border-blue-200 dark:border-blue-800/60">
                {slots.length} items
              </span>
            </h3>
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {viewMode === "list" ? (
          /* TABLE / LIST VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 w-20">Preview</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Image & Section</th>
                  <th className="py-2.5 px-3 w-32">Dimensions</th>
                  <th className="py-2.5 px-3 w-24">Status</th>
                  <th className="py-2.5 px-3 text-right min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {slots.map((slot) => {
                  const currentImg = getSlotImage(slot);
                  const isCustom = isCustomImage(slot);
                  const isSlotUploading = uploadingKey === slot.key;
                  const isSlotDeleting = deletingKey === slot.key;

                  return (
                    <tr key={slot.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-2 px-3">
                        <div
                          onClick={() => setPreviewModalImg({ url: currentImg, title: slot.title })}
                          className="w-14 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 relative group cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
                        >
                          <img
                            src={currentImg}
                            alt={slot.title}
                            className="w-full h-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = slot.defaultPlaceholder;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye size={12} />
                          </div>
                          {isSlotUploading && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-[#1C3EB9]">
                              <Loader2 size={14} className="animate-spin" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Placement */}
                      <td className="py-2 px-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{slot.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                            {slot.placement}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{slot.description}</p>
                      </td>

                      {/* Dimensions */}
                      <td className="py-2 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px] block">
                            {slot.recommendedSize}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">Ratio: {slot.aspectRatio}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        {isCustom ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={10} className="stroke-[3]" /> Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            Default
                          </span>
                        )}
                      </td>

                      {/* ACTION COLUMN: Replace, Delete/Reset, Copy, Open */}
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Replace / Upload Button */}
                          <button
                            onClick={() => handleTriggerUpload(slot)}
                            disabled={isSlotUploading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1C3EB9] hover:bg-[#153299] text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            title={isCustom ? "Replace with new image (Auto WebP)" : "Upload custom image (Auto WebP)"}
                          >
                            <Upload size={11} />
                            <span>{isCustom ? "Replace" : "Upload"}</span>
                          </button>

                          {/* Delete / Reset Button */}
                          <button
                            onClick={() => handleRemoveImage(slot)}
                            disabled={isSlotDeleting || !isCustom}
                            title={isCustom ? "Delete custom image and reset to default" : "Default system asset active"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isCustom
                                ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed opacity-50"
                            }`}
                          >
                            {isSlotDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                            <span>Delete</span>
                          </button>

                          {/* Copy URL */}
                          <button
                            onClick={() => copyUrl(currentImg)}
                            title="Copy image link"
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Copy size={12} />
                          </button>

                          {/* Open New Tab */}
                          <a
                            href={currentImg}
                            target="_blank"
                            rel="noreferrer"
                            title="Open original image"
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const currentImg = getSlotImage(slot);
              const isCustom = isCustomImage(slot);
              const isSlotUploading = uploadingKey === slot.key;
              const isSlotDeleting = deletingKey === slot.key;

              return (
                <div
                  key={slot.key}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1C3EB9]/10 text-[#1C3EB9] border border-[#1C3EB9]/20 uppercase">
                        {slot.placement}
                      </span>
                      {isCustom ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                          <Check size={10} className="stroke-[3]" /> Custom
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-400">Default</span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs tracking-tight">{slot.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-1">{slot.description}</p>
                  </div>

                  <div className="relative p-2 bg-slate-950/5 dark:bg-slate-950/30 flex items-center justify-center">
                    <div
                      onClick={() => setPreviewModalImg({ url: currentImg, title: slot.title })}
                      className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={currentImg}
                        alt={slot.title}
                        className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = slot.defaultPlaceholder;
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                        {slot.recommendedSize}
                      </div>
                      {isSlotUploading && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1.5">
                          <Loader2 size={18} className="animate-spin text-[#1C3EB9]" />
                          <span className="text-[10px] font-bold">Optimizing...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTriggerUpload(slot)}
                        disabled={isSlotUploading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1C3EB9] text-white hover:bg-[#153299] shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={12} /> <span>{isCustom ? "Replace" : "Upload"}</span>
                      </button>

                      <button
                        onClick={() => handleRemoveImage(slot)}
                        disabled={isSlotDeleting || !isCustom}
                        title={isCustom ? "Delete custom image and reset to default" : "Default system asset active"}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCustom
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {isSlotDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => copyUrl(currentImg)}
                        title="Copy direct image URL"
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      <a
                        href={currentImg}
                        target="_blank"
                        rel="noreferrer"
                        title="View full size image"
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Render Dynamic Banners Section (List Table or Grid Cards) ──
  const renderBannerListSection = (page: string, type: string, sectionTitle: string, description: string) => {
    const bannerItems = banners.filter((b) => b.page === page && b.type === type);

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span>{sectionTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1C3EB9] border border-blue-200 dark:border-blue-800/60">
                {bannerItems.length} banners
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          </div>

          <button
            onClick={() => openNewBanner(page, type)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1C3EB9] hover:bg-[#153299] text-white transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={13} /> Add Slide
          </button>
        </div>

        {bannerItems.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
            <ImageIcon size={28} className="mx-auto text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">No banner slides configured for this section yet.</p>
            <button
              onClick={() => openNewBanner(page, type)}
              className="text-xs font-bold text-[#1C3EB9] hover:underline cursor-pointer"
            >
              + Create First Slide
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* TABLE / LIST VIEW FOR BANNERS */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 w-20">Preview</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Banner Title & Subtitle</th>
                  <th className="py-2.5 px-3 w-40">CTA Button & Link</th>
                  <th className="py-2.5 px-3 w-24">Live Status</th>
                  <th className="py-2.5 px-3 text-right min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bannerItems.map((banner) => {
                  const img = banner.image_url.startsWith("http") ? banner.image_url : `${API}${banner.image_url}`;
                  return (
                    <tr key={banner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-2 px-3">
                        <div
                          onClick={() => setPreviewModalImg({ url: img, title: banner.title || "Banner Preview" })}
                          className="w-14 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 relative group cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
                        >
                          <img src={img} alt={banner.title || "Banner"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye size={12} />
                          </div>
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="py-2 px-3 space-y-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                          {banner.title || "Untitled Banner"}
                        </span>
                        {banner.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{banner.subtitle}</p>
                        )}
                      </td>

                      {/* CTA & Link */}
                      <td className="py-2 px-3 space-y-0.5">
                        {banner.cta_text && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block">
                            {banner.cta_text}
                          </span>
                        )}
                        {banner.cta_link && (
                          <span className="text-[9px] font-mono text-[#1C3EB9] block truncate max-w-[140px]">
                            {banner.cta_link}
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleToggleBanner(banner)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold cursor-pointer transition-all"
                          title="Click to toggle active status"
                        >
                          {banner.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <ToggleRight size={13} className="text-emerald-600" /> Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              <ToggleLeft size={13} className="text-slate-400" /> Draft
                            </span>
                          )}
                        </button>
                      </td>

                      {/* ACTION COLUMN: Edit, Replace, Delete, Copy */}
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => openEditBanner(banner)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            title="Edit banner content and image"
                          >
                            <Edit2 size={11} />
                            <span>Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                            title="Delete banner"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>

                          {/* Copy URL */}
                          <button
                            onClick={() => copyUrl(img)}
                            title="Copy direct image URL"
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Copy size={12} />
                          </button>

                          {/* Open New Tab */}
                          <a
                            href={img}
                            target="_blank"
                            rel="noreferrer"
                            title="Open original image"
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW FOR BANNERS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bannerItems.map((banner) => {
              const img = banner.image_url.startsWith("http") ? banner.image_url : `${API}${banner.image_url}`;
              return (
                <div
                  key={banner.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between"
                >
                  <div
                    onClick={() => setPreviewModalImg({ url: img, title: banner.title || "Banner Preview" })}
                    className="relative h-32 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer group"
                  >
                    <img src={img} alt={banner.title || "Banner"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          banner.is_active ? "bg-emerald-500 text-white" : "bg-slate-600 text-slate-200"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {banner.title || "Untitled Banner"}
                    </h4>
                    {banner.subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{banner.subtitle}</p>
                    )}
                    {banner.cta_link && (
                      <span className="text-[9px] font-mono text-[#1C3EB9] block truncate">
                        Link: {banner.cta_link}
                      </span>
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleToggleBanner(banner)}
                      className="text-xs font-bold flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#1C3EB9] cursor-pointer"
                    >
                      {banner.is_active ? (
                        <ToggleRight size={16} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={16} className="text-slate-400" />
                      )}
                      <span className="text-[11px]">{banner.is_active ? "Live" : "Off"}</span>
                    </button>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEditBanner(banner)}
                        className="p-1 rounded-lg text-slate-500 hover:text-[#1C3EB9] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Image Settings | Selectt Admin"
        description="Section-wise visual management for all frontend website images, banners, and logos."
      />

      <div className="space-y-4 max-w-7xl mx-auto w-full">
        {/* Hidden File Input for 1-Click Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg,.ico,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <PageBreadCrumb pageTitle="Image Settings" />

          {/* Quick Links & Refresh */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/media-library"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#1C3EB9] hover:text-[#1C3EB9] shadow-xs transition-all"
            >
              <FileImage size={14} className="text-[#1C3EB9]" />
              Open Media Library
            </Link>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#1C3EB9] transition-all cursor-pointer shadow-xs"
              title="Refresh images"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#1C3EB9]" : ""} />
            </button>
          </div>
        </div>

        {/* Toolbar: Page Tabs + View Mode Switcher + Search */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Clean Page-Wise Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <button
              onClick={() => handleTabChange("home")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "home"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Smartphone size={13} /> Home Page
            </button>

            <button
              onClick={() => handleTabChange("buy-cars")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "buy-cars"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShoppingBag size={13} /> Buy Cars Page
            </button>

            <button
              onClick={() => handleTabChange("car-detail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "car-detail"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Car size={13} /> Car Details Page
            </button>

            <button
              onClick={() => handleTabChange("sell-car")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "sell-car"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <DollarSign size={13} /> Sell Car Page
            </button>

            <button
              onClick={() => handleTabChange("services")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "services"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck size={13} /> Service & Policy Pages
            </button>

            <button
              onClick={() => handleTabChange("branding")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "branding"
                  ? "bg-[#1C3EB9] text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ImageIcon size={13} /> Brand Logos & Favicon
            </button>
          </div>

          {/* Controls: List/Grid View Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="List / Table Mode"
            >
              <LayoutList size={13} />
              <span className="text-[11px]">List</span>
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Grid / Cards Mode"
            >
              <LayoutGrid size={13} />
              <span className="text-[11px]">Grid</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-[#1C3EB9] mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading section configurations...</p>
          </div>
        ) : activeTab === "home" ? (
          /* ── TAB 1: HOME PAGE ── */
          <div className="space-y-4">
            {/* Desktop Hero Sliders */}
            {renderBannerListSection(
              "home",
              "desktop",
              "Home Desktop Hero Sliders",
              "Hero banner slider displayed on desktop computers and laptops."
            )}

            {/* Mobile Hero Sliders */}
            {renderBannerListSection(
              "home",
              "mobile",
              "Home Mobile Hero Sliders",
              "Hero banner slider formatted for mobile smartphones."
            )}

            {/* Feature Cards & Trust Badges */}
            {renderSlotsSection(
              HOME_STATIC_SLOTS,
              "Home Feature Sections & Trust Badges",
              "Instant valuation card, quick buy search card, and 3 trust badges."
            )}

            {/* 4 Easy Steps — Buy */}
            {renderBannerListSection(
              "home",
              "buy-step",
              "4 Easy Steps — Buy Car Process",
              "Step 1 to 4 illustrations explaining the car buying process."
            )}
          </div>
        ) : activeTab === "buy-cars" ? (
          /* ── TAB 2: BUY CARS PAGE ── */
          <div className="space-y-5">
            {/* 1. In-Grid 3 Promotional Banner Cards (3-line gap between each) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <CreditCard size={15} className="text-[#1C3EB9]" />
                    <span>3 In-Grid Promotional Banner Cards (3-Line Gap Between Each)</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1C3EB9] border border-blue-200 dark:border-blue-800/60">
                      3 Positions Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload 3 custom banner cards displayed inside the car inventory catalog on <span className="font-mono text-slate-700 dark:text-slate-300">/buy-cars</span>. Each banner card is separated by a 3-line (9 cars) gap.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBuyCarsSettings}
                    disabled={savingBuyCarsSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#1C3EB9] hover:bg-[#153299] text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingBuyCarsSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>Save Banner Settings</span>
                  </button>
                </div>
              </div>

              {/* Slot Table / Grid */}
              {renderSlotsSection(
                BUY_CARS_STATIC_SLOTS,
                "In-Grid Promotional Card Images & Live Preview",
                "Click Replace on any banner to upload a custom image (WebP auto-optimized). 3 banners show sequentially with 3-line gaps."
              )}

              {/* 3 Banners Individual Controls */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Configure Links & Grid Visibility For Each Banner
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Banner #1 Config */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">Banner #1 (Row 1)</span>
                      <span className="text-[10px] font-bold text-[#1C3EB9] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">Slot 1</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Click Action URL</label>
                      <input
                        type="text"
                        value={extraCardBtnLink}
                        onChange={(e) => setExtraCardBtnLink(e.target.value)}
                        placeholder="/used-car-loan"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setExtraCardIsActive(!extraCardIsActive)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        extraCardIsActive
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      <span className="text-[11px]">{extraCardIsActive ? "Visible in Grid" : "Hidden"}</span>
                      {extraCardIsActive ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                    </button>
                  </div>

                  {/* Banner #2 Config */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">Banner #2 (+3 Lines Gap)</span>
                      <span className="text-[10px] font-bold text-[#1C3EB9] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">Slot 2</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Click Action URL</label>
                      <input
                        type="text"
                        value={gridBanner2Link}
                        onChange={(e) => setGridBanner2Link(e.target.value)}
                        placeholder="/car-insurance"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setGridBanner2Active(!gridBanner2Active)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        gridBanner2Active
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      <span className="text-[11px]">{gridBanner2Active ? "Visible in Grid" : "Hidden"}</span>
                      {gridBanner2Active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                    </button>
                  </div>

                  {/* Banner #3 Config */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">Banner #3 (+3 Lines Gap)</span>
                      <span className="text-[10px] font-bold text-[#1C3EB9] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">Slot 3</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Click Action URL</label>
                      <input
                        type="text"
                        value={gridBanner3Link}
                        onChange={(e) => setGridBanner3Link(e.target.value)}
                        placeholder="/sell-car"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setGridBanner3Active(!gridBanner3Active)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        gridBanner3Active
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      <span className="text-[11px]">{gridBanner3Active ? "Visible in Grid" : "Hidden"}</span>
                      {gridBanner3Active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveBuyCarsSettings}
                    disabled={savingBuyCarsSettings}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#1C3EB9] hover:bg-[#153299] text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingBuyCarsSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>Save All In-Grid Banner Changes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Top Promotional Slider Banners */}
            {renderBannerListSection(
              "buy-cars",
              "promo",
              "Buy Cars Top Promotional Banners (Header Slides)",
              "Slider banners displayed at the top of the Buy Cars catalog (PRE-APPROVAL, Discounts, Lifetime Warranty, etc.)"
            )}

            {/* 3. Marquee Ticker Notice */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Sparkles size={14} className="text-[#1C3EB9]" />
                    <span>Buy Cars Marquee Ticker Bar</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Moving ticker message banner shown at the top of the buy cars page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveBuyCarsSettings}
                  disabled={savingBuyCarsSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1C3EB9] hover:bg-[#153299] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingBuyCarsSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Marquee</span>
                </button>
              </div>

              <input
                type="text"
                value={buyCarsMarquee}
                onChange={(e) => setBuyCarsMarquee(e.target.value)}
                placeholder="e.g. ⭐ Mega Used Car Carnival Live - Up to ₹1.5L Exchange Bonus on Select Vehicles ⭐"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#1C3EB9]"
              />
            </div>
          </div>
        ) : activeTab === "car-detail" ? (
          /* ── TAB 3: CAR DETAILS PAGE ── */
          <div className="space-y-4">
            {/* Car Details Sticky Promo Banners */}
            {renderBannerListSection(
              "car-detail",
              "sidebar",
              "Car Details Sidebar Promo Banners",
              "Sidebar promo banners displayed on individual vehicle details pages."
            )}

            {/* Static Login Modal & Sidebar Slots */}
            {renderSlotsSection(
              CAR_DETAIL_STATIC_SLOTS,
              "Login Modal & Detail Visuals",
              "Authentication popup visual illustration and sidebar banners."
            )}
          </div>
        ) : activeTab === "sell-car" ? (
          /* ── TAB 4: SELL CAR PAGE ── */
          <div className="space-y-4">
            {/* Sell Car Top Promo Banners */}
            {renderBannerListSection(
              "sell-car",
              "promo",
              "Sell Car Page Top Hero Banners",
              "Header hero banners displayed on the Sell Car landing page."
            )}

            {/* Sell Car 4 Easy Steps */}
            {renderBannerListSection(
              "sell-car",
              "step",
              "Sell Car 4 Easy Steps Banners",
              "Step 1 to 4 illustrations explaining how selling car works."
            )}

            {/* Instant Valuation Form Card Slot */}
            {renderSlotsSection(
              HOME_STATIC_SLOTS.filter((s) => s.key === "sell_car_banner"),
              "Instant Valuation Form Card Banner",
              "Form side banner for instant valuation quote."
            )}
          </div>
        ) : activeTab === "services" ? (
          /* ── TAB 5: SERVICE & POLICY PAGES ── */
          <div className="space-y-4">
            {renderSlotsSection(
              SERVICE_STATIC_SLOTS,
              "Service & Financial Page Header Banners",
              "Manage top hero banners for Loan, Insurance, Warranty, and Buyback Assurance pages."
            )}
          </div>
        ) : (
          /* ── TAB 6: BRAND LOGOS & IDENTITY ── */
          <div className="space-y-4">
            {renderSlotsSection(
              BRANDING_STATIC_SLOTS,
              "Brand Identity, Logos & Favicon",
              "Manage dark navbar logo, transparent white logo, footer branding, and social preview assets."
            )}
          </div>
        )}

        {/* Modal: Full Image Preview */}
        {previewModalImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
                <span className="font-extrabold text-sm">{previewModalImg.title}</span>
                <button
                  onClick={() => setPreviewModalImg(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 flex items-center justify-center bg-slate-950/80 max-h-[75vh]">
                <img src={previewModalImg.url} alt={previewModalImg.title} className="max-w-full max-h-[70vh] object-contain rounded-xl" />
              </div>
              <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-900 text-slate-400 px-6">
                <span className="font-mono truncate max-w-md">{previewModalImg.url}</span>
                <a
                  href={previewModalImg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#1C3EB9] text-white font-bold hover:bg-[#153299] flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Open Full Size
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Banner Slide */}
        {showBannerModal && editingBanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
              <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {editingBanner.id ? "Edit Banner Slide" : "Add New Banner Slide"}
                </h3>
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:px-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={editingBanner.title || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. Assured Quality Used Cars"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    placeholder="e.g. 140+ Inspection checkpoints & 1-year warranty"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Button Text (CTA)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.cta_text || ""}
                      onChange={(e) => setEditingBanner({ ...editingBanner, cta_text: e.target.value })}
                      placeholder="e.g. Explore Cars"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Button Link (URL)
                    </label>
                    <input
                      type="text"
                      value={editingBanner.cta_link || ""}
                      onChange={(e) => setEditingBanner({ ...editingBanner, cta_link: e.target.value })}
                      placeholder="e.g. /buy-cars"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#1C3EB9]"
                    />
                  </div>
                </div>

                {/* Banner Image Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Banner Image (Auto WebP)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBannerImageFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#1C3EB9] file:text-white cursor-pointer"
                  />

                  {bannerPreview && (
                    <div className="mt-2.5 h-32 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  disabled={savingBanner}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#1C3EB9] hover:bg-[#153299] text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingBanner && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

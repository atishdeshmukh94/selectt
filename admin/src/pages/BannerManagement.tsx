import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Image, Save, X, ToggleLeft, ToggleRight, Upload, Video, Camera, Monitor, Smartphone, Film } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;
const PAGE_OPTIONS = ["home", "buy-cars", "sell-car", "car-detail", "login"];

type Banner = {
  id: number; page: string; type: string; title: string; subtitle: string;
  cta_text: string; cta_link: string; image_url: string; sort_order: number; is_active: number;
  flip_image?: number;
};
type Testimonial = {
  id: number; video_url: string; poster_url: string; name: string;
  location: string; testimony: string; sort_order: number; is_active: number;
};
type SiteContent = Record<string, string>;

const TABS = [
  { id: "banners", label: "Page Banners", icon: <Monitor size={16} /> },
  { id: "login-banner", label: "Login Modal Banner", icon: <Image size={16} /> },
  { id: "sidebar-banner", label: "Car Detail Sidebar Banner", icon: <Image size={16} /> },
  { id: "mobile-hero", label: "Mobile Hero", icon: <Smartphone size={16} /> },
  { id: "sell-section", label: "Sell Section", icon: <Camera size={16} /> },
  { id: "easy-steps", label: "4 Easy Steps Banners", icon: <Film size={16} /> },
  { id: "video-testimonials", label: "Video Testimonial", icon: <Film size={16} /> },
  { id: "frontend-content", label: "Frontend Content", icon: <Monitor size={16} /> },
];

export default function BannerManagement() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("banners");
  const [stepsSubTab, setStepsSubTab] = useState<"sell" | "buy">("sell");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);
  const siteFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [siteFilePreviews, setSiteFilePreviews] = useState<Record<string, string>>({});
  const [siteFiles, setSiteFiles] = useState<Record<string, File>>({});
  const [savingSiteContent, setSavingSiteContent] = useState<string | null>(null);
  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  
  // Extra Card States
  const [extraCardTitle, setExtraCardTitle] = useState("");
  const [extraCardValue, setExtraCardValue] = useState("");
  const [extraCardDetails, setExtraCardDetails] = useState("");
  const [extraCardBtnText, setExtraCardBtnText] = useState("");
  const [extraCardBtnLink, setExtraCardBtnLink] = useState("");
  const [extraCardLogoUrl, setExtraCardLogoUrl] = useState("");
  const [extraCardBgGradient, setExtraCardBgGradient] = useState("");
  const [extraCardIsActive, setExtraCardIsActive] = useState("true");
  const [extraCardLogoFile, setExtraCardLogoFile] = useState<File | null>(null);
  const [extraCardLogoPreview, setExtraCardLogoPreview] = useState("");
  const extraCardLogoRef = useRef<HTMLInputElement>(null);

  const fetchMarquee = async () => {
    try {
      const res = await fetch(`${API}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        const findVal = (key: string) => data.find((s: any) => s.setting_key === key)?.setting_value;

        const marquee = findVal('buy_cars_marquee_text');
        if (marquee !== undefined) setMarqueeText(marquee);

        const cardTitle = findVal('extra_card_title');
        if (cardTitle !== undefined) setExtraCardTitle(cardTitle);

        const cardVal = findVal('extra_card_value');
        if (cardVal !== undefined) setExtraCardValue(cardVal);

        const cardDetails = findVal('extra_card_details');
        if (cardDetails !== undefined) setExtraCardDetails(cardDetails);

        const cardBtnText = findVal('extra_card_btn_text');
        if (cardBtnText !== undefined) setExtraCardBtnText(cardBtnText);

        const cardBtnLink = findVal('extra_card_btn_link');
        if (cardBtnLink !== undefined) setExtraCardBtnLink(cardBtnLink);

        const cardLogo = findVal('extra_card_logo_url');
        if (cardLogo !== undefined) {
          setExtraCardLogoUrl(cardLogo);
          if (cardLogo) {
            setExtraCardLogoPreview(cardLogo.startsWith('/') ? `${API}${cardLogo}` : cardLogo);
          }
        }

        const cardBg = findVal('extra_card_bg_gradient');
        if (cardBg !== undefined) setExtraCardBgGradient(cardBg);

        const cardActive = findVal('extra_card_is_active');
        if (cardActive !== undefined) setExtraCardIsActive(cardActive);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchMarquee();
  }, [token]);

  const handleSaveMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarqueeSaving(true);
    try {
      // 1. Upload Logo if selected
      let finalLogoUrl = extraCardLogoUrl;
      if (extraCardLogoFile) {
        const formData = new FormData();
        formData.append("extra_card_logo", extraCardLogoFile);
        const uploadRes = await fetch(`${API}/api/settings/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        if (!uploadRes.ok) {
          const errMsg = await uploadRes.text();
          throw new Error(`Failed to upload extra card logo: ${errMsg}`);
        }
        // Fetch settings again to get the uploaded file path
        const resGetForPath = await fetch(`${API}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resGetForPath.ok) {
          const data = await resGetForPath.json();
          finalLogoUrl = data.find((s: any) => s.setting_key === 'extra_card_logo')?.setting_value || "";
        }
      }

      // 2. Fetch current settings mapping
      const resGet = await fetch(`${API}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let settingsMap: Record<string, string> = {};
      if (resGet.ok) {
        const data = await resGet.json();
        data.forEach((s: any) => {
          settingsMap[s.setting_key] = s.setting_value;
        });
      }
      
      // Update values
      settingsMap.buy_cars_marquee_text = marqueeText;
      settingsMap.extra_card_title = extraCardTitle;
      settingsMap.extra_card_value = extraCardValue;
      settingsMap.extra_card_details = extraCardDetails;
      settingsMap.extra_card_btn_text = extraCardBtnText;
      settingsMap.extra_card_btn_link = extraCardBtnLink;
      settingsMap.extra_card_logo_url = finalLogoUrl;
      settingsMap.extra_card_bg_gradient = extraCardBgGradient;
      settingsMap.extra_card_is_active = extraCardIsActive;

      const res = await fetch(`${API}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsMap)
      });
      if (res.ok) {
        alert("Frontend Content settings saved successfully");
        setExtraCardLogoFile(null);
        fetchMarquee();
      } else {
        alert("Failed to save settings");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving settings");
    } finally {
      setMarqueeSaving(false);
    }
  };

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/admin/banners`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${API}/api/admin/video-testimonials`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${API}/api/site-content`).then(r => r.json()),
    ]).then(([b, t, c]) => {
      setBanners(Array.isArray(b) ? b : []);
      setTestimonials(Array.isArray(t) ? t : []);
      setSiteContent(c || {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // ————— BANNER CRUD —————
  const openNewBanner = () => {
    setEditingBanner({ page: "home", type: "desktop", title: "", subtitle: "", cta_text: "", cta_link: "", image_url: "", sort_order: 0, is_active: 1, flip_image: 0 });
    setImageFile(null); setPreview(""); setShowForm(true);
  };
  const openEditBanner = (b: Banner) => {
    setEditingBanner({ ...b });
    setImageFile(null);
    setPreview(b.image_url ? (b.image_url.startsWith('/') ? `${API}${b.image_url}` : b.image_url) : "");
    setShowForm(true);
  };
  const handleSaveBanner = async () => {
    if (!editingBanner) return;
    setSaving(true);
    const form = new FormData();
    Object.entries(editingBanner).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, String(v)); });
    if (imageFile) form.append("image", imageFile);
    const url = editingBanner.id ? `${API}/api/admin/banners/${editingBanner.id}` : `${API}/api/admin/banners`;
    const method = editingBanner.id ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: form });
      if (res.ok) { fetchAll(); setShowForm(false); }
      else { const d = await res.json(); alert(d.message || "Save failed"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  };
  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`${API}/api/admin/banners/${id}`, { method: "DELETE", headers: authHeaders });
    fetchAll();
  };
  const handleToggleBanner = async (b: Banner) => {
    const form = new FormData();
    Object.entries(b).forEach(([k, v]) => form.append(k, String(v)));
    form.set("is_active", b.is_active ? "0" : "1");
    await fetch(`${API}/api/admin/banners/${b.id}`, { method: "PUT", headers: authHeaders, body: form });
    fetchAll();
  };

  // ————— VIDEO TESTIMONIALS CRUD —————
  const openNewTestimonial = () => {
    setEditingTestimonial({ video_url: "", poster_url: "", name: "", location: "", testimony: "", sort_order: 0, is_active: 1 });
    setVideoFile(null); setPosterFile(null); setShowForm(true);
  };
  const openEditTestimonial = (t: Testimonial) => {
    setEditingTestimonial({ ...t });
    setVideoFile(null); setPosterFile(null); setShowForm(true);
  };
  const handleSaveTestimonial = async () => {
    if (!editingTestimonial) return;
    setSaving(true);
    const form = new FormData();
    Object.entries(editingTestimonial).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, String(v)); });
    if (videoFile) form.append("video", videoFile);
    if (posterFile) form.append("poster", posterFile);
    const url = editingTestimonial.id ? `${API}/api/admin/video-testimonials/${editingTestimonial.id}` : `${API}/api/admin/video-testimonials`;
    const method = editingTestimonial.id ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: form });
      if (res.ok) { fetchAll(); setShowForm(false); }
      else { const d = await res.json(); alert(d.message || "Save failed"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  };
  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`${API}/api/admin/video-testimonials/${id}`, { method: "DELETE", headers: authHeaders });
    fetchAll();
  };
  const handleToggleTestimonial = async (t: Testimonial) => {
    const form = new FormData();
    Object.entries(t).forEach(([k, v]) => form.append(k, String(v)));
    form.set("is_active", t.is_active ? "0" : "1");
    await fetch(`${API}/api/admin/video-testimonials/${t.id}`, { method: "PUT", headers: authHeaders, body: form });
    fetchAll();
  };

  // ————— SITE CONTENT SAVE —————
  const handleSaveSiteContent = async (key: string) => {
    setSavingSiteContent(key);
    const form = new FormData();
    form.append("key", key);
    if (siteFiles[key]) {
      form.append("file", siteFiles[key]);
    } else {
      form.append("value", siteContent[key] || "");
    }
    try {
      const res = await fetch(`${API}/api/admin/site-content`, { method: "PUT", headers: authHeaders, body: form });
      if (res.ok) { fetchAll(); setSiteFiles(p => { const n = {...p}; delete n[key]; return n; }); }
      else alert("Save failed");
    } catch { alert("Network error"); }
    finally { setSavingSiteContent(null); }
  };

  const handleSiteFileChange = (key: string, file: File) => {
    setSiteFiles(p => ({ ...p, [key]: file }));
    setSiteFilePreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
    setSiteContent(p => ({ ...p, [key]: URL.createObjectURL(file) }));
  };

  const grouped = PAGE_OPTIONS.reduce((acc, page) => {
    acc[page] = banners.filter(b => b.page === page);
    return acc;
  }, {} as Record<string, Banner[]>);

  const SITE_CONTENT_FIELDS = [
    { section: "Mobile Hero", fields: [
      { key: "mobile_hero_video", label: "Background Video URL / File", type: "video" },
      { key: "mobile_hero_image", label: "Background Image (overrides video)", type: "image" },
      { key: "mobile_hero_heading", label: "Heading (e.g. master)", type: "text" },
      { key: "mobile_hero_subheading", label: "Subheading text", type: "text" },
      { key: "mobile_hero_btn_text", label: "Button Text", type: "text" },
    ]},
    { section: "Sell Car Page Hero Section", fields: [
      { key: "sell_section_image", label: "Sell Car Hero Background Image", type: "image" },
      { key: "sell_hero_heading", label: "Left Side Main Heading Text (HTML tags allowed, e.g. Sell your car at the <br/><span class=\"text-[#15FFEC]\">BEST PRICE</span> in minutes)", type: "text" },
      { key: "sell_hero_subheading", label: "Left Side Subheading / Tagline (e.g. India's no.1 selling platform)", type: "text" },
      { key: "sell_section_cover_video", label: "Cover Video URL (auto-plays on left panel, optional)", type: "video" },
      { key: "sell_section_video", label: "Lightbox Video URL (plays fullscreen when ▶ clicked)", type: "video" },
    ]}
  ];

  const getSectionForTab = () => {
    if (activeTab === "mobile-hero") return SITE_CONTENT_FIELDS[0];
    if (activeTab === "sell-section") return SITE_CONTENT_FIELDS[1];
    return null;
  };

  const section = getSectionForTab();

  return (
    <>
      <PageMeta title="Banner Management | Selectt Admin" description="Manage banners and media content" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Banner Management</h1>
            <p className="text-sm text-gray-500 font-medium">Control all page banners, mobile hero, sell section, and video testimonials</p>
          </div>
          {(activeTab === "banners" || activeTab === "login-banner" || activeTab === "video-testimonials" || activeTab === "easy-steps" || activeTab === "sidebar-banner") && (
            <button
              onClick={() => {
                setEditingBanner(null); setEditingTestimonial(null);
                if (activeTab === "banners") openNewBanner();
                else if (activeTab === "login-banner") {
                  setEditingBanner({ page: "login", type: "modal", title: "Login Screen Banner", subtitle: "", cta_text: "", cta_link: "", image_url: "", sort_order: 0, is_active: 1, flip_image: 0 });
                  setImageFile(null); setPreview(""); setShowForm(true);
                }
                else if (activeTab === "sidebar-banner") {
                  setEditingBanner({ page: "car-detail", type: "sidebar", title: "", subtitle: "", cta_text: "", cta_link: "", image_url: "", sort_order: 0, is_active: 1, flip_image: 0 });
                  setImageFile(null); setPreview(""); setShowForm(true);
                }
                else if (activeTab === "video-testimonials") openNewTestimonial();
                else {
                  // Open new step banner for sell or buy
                  const isB = stepsSubTab === "buy";
                  setEditingBanner({ page: isB ? "home" : "sell-car", type: isB ? "buy-step" : "step", title: "", subtitle: "", cta_text: "", cta_link: "", image_url: "", sort_order: 0, is_active: 1, flip_image: 0 });
                  setImageFile(null); setPreview(""); setShowForm(true);
                }
              }}
              className="flex items-center gap-2 bg-[#0C1B33] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg cursor-pointer"
            >
              <Plus size={18} /> {activeTab === "banners" ? "Add Banner" : activeTab === "login-banner" ? "Upload Login Banner" : activeTab === "easy-steps" ? `Add ${stepsSubTab === "sell" ? "Sell" : "Buy"} Step` : activeTab === "sidebar-banner" ? "Upload Sidebar Banner" : "Add Video"}
            </button>
          )}
        </div>

        {/* Tabs - Wrapped and Compact (No Left/Right Scroll) */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#0C1B33] text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading...</div>
        ) : (
          <>
            {/* PAGE BANNERS TAB */}
            {activeTab === "banners" && (
              <>
                {Object.entries(grouped).map(([page, items]) => (
                  <div key={page} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                      <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">{page === "home" ? "Home Page" : "Buy Cars Page"}</h2>
                      <span className="ml-auto text-xs font-bold text-gray-400">{items.length} banners</span>
                    </div>
                    {items.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 text-sm">No banners yet.</div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {items.map(b => (
                          <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            <div className="w-20 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {b.image_url ? <img src={b.image_url.startsWith('/') ? `${API}${b.image_url}` : b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Image size={20} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-800 dark:text-white text-sm truncate">{b.image_url ? b.image_url.split('/').pop() : <span className="text-gray-400 italic">No image</span>}</div>
                              <div className="text-[11px] text-gray-400 font-medium mt-0.5"><span className="capitalize">{b.type}</span>{b.cta_link && <span className="ml-2 text-brand-500">· {b.cta_link}</span>}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleToggleBanner(b)} className={`p-1.5 rounded-lg transition-all ${b.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>{b.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                              <button onClick={() => openEditBanner(b)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* LOGIN MODAL BANNER TAB */}
            {activeTab === "login-banner" && (() => {
              const loginBanners = banners.filter(b => b.page === "login");
              return (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Login Modal — Left Side Banner</h2>
                    <span className="ml-auto text-xs font-bold text-gray-400">{loginBanners.length} banner{loginBanners.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                      This image appears on the left side of the Login / Sign-up modal popup across the website.
                      Recommended size: <strong>450 × 535 px</strong> (Aspect ratio ~ 5:6). The active banner will automatically replace the default image on the frontend.
                    </p>
                    {loginBanners.length === 0 ? (
                      <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                        <Image size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No custom login banner uploaded yet</p>
                        <p className="text-xs text-gray-400 mt-1">Default left banner is currently displayed on the frontend login screen.</p>
                        <button
                          onClick={() => {
                            setEditingBanner({ page: "login", type: "modal", title: "Login Screen Banner", subtitle: "", cta_text: "", cta_link: "", image_url: "", sort_order: 0, is_active: 1, flip_image: 0 });
                            setImageFile(null); setPreview(""); setShowForm(true);
                          }}
                          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md cursor-pointer"
                        >
                          <Plus size={16} /> Upload Login Banner
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loginBanners.map(b => (
                          <div key={b.id} className="flex items-center gap-5 py-4">
                            <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-sm">
                              {b.image_url ? (
                                <img src={b.image_url.startsWith('/') ? `${API}${b.image_url}` : b.image_url} alt={b.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><Image size={24} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-800 dark:text-white text-base">{b.title || 'Login Screen Banner'}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Page: <span className="font-bold text-indigo-600">login</span> | Type: <span className="font-semibold text-gray-700 dark:text-gray-300">{b.type}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1 font-mono truncate">{b.image_url}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleToggleBanner(b)} className={`p-1.5 rounded-lg transition-all ${b.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`} title="Toggle Banner Status">
                                {b.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                              </button>
                              <button onClick={() => openEditBanner(b)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit Banner"><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Banner"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* CAR DETAIL SIDEBAR BANNER TAB */}
            {activeTab === "sidebar-banner" && (() => {
              const sidebarBanners = banners.filter(b => b.page === "car-detail" && b.type === "sidebar");
              return (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Car Detail Page — Sidebar Banner</h2>
                    <span className="ml-auto text-xs font-bold text-gray-400">{sidebarBanners.length} banner{sidebarBanners.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                      This image appears at the top of the right sidebar on the car details page (above the price card). 
                      Upload a promotional banner image — recommended size: <strong>360×80px</strong>. Only the first active banner is displayed.
                    </p>
                    {sidebarBanners.length === 0 ? (
                      <div className="py-16 text-center text-gray-400">
                        <Image size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No sidebar banner uploaded yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Upload Sidebar Banner" above to add one.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sidebarBanners.map(b => (
                          <div key={b.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                            {/* Full-width image preview */}
                            <div className="w-full h-24 bg-slate-100 relative">
                              {b.image_url ? (
                                <img
                                  src={b.image_url.startsWith('/') ? `${API}${b.image_url}` : b.image_url}
                                  alt="Sidebar Banner"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Image size={32} />
                                </div>
                              )}
                              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${b.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                {b.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                            {/* Controls */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/30">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-gray-700 truncate">{b.image_url ? b.image_url.split('/').pop() : 'No image'}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">Page: car-detail · Type: sidebar</div>
                              </div>
                              <button onClick={() => handleToggleBanner(b)} className={`p-1.5 rounded-lg transition-all ${b.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                {b.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                              </button>
                              <button onClick={() => openEditBanner(b)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* MOBILE HERO & SELL SECTION TABS */}

            {section && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">{section.section} Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {section.fields.map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{field.label}</label>
                      {field.type === "text" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={siteContent[field.key] || ""}
                            onChange={e => setSiteContent(p => ({ ...p, [field.key]: e.target.value }))}
                            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                          />
                          <button onClick={() => handleSaveSiteContent(field.key)} disabled={savingSiteContent === field.key} className="px-4 py-2 bg-[#0C1B33] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-700">
                            <Save size={14} /> {savingSiteContent === field.key ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Current value preview */}
                          {(siteFilePreviews[field.key] || siteContent[field.key]) && (
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                              {field.type === "video" ? (
                                <video src={siteFilePreviews[field.key] || (siteContent[field.key]?.startsWith('/') ? `${API}${siteContent[field.key]}` : siteContent[field.key])} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={siteFilePreviews[field.key] || (siteContent[field.key]?.startsWith('/') ? `${API}${siteContent[field.key]}` : siteContent[field.key])} alt={field.label} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={siteFiles[field.key] ? "[File selected]" : (siteContent[field.key] || "")}
                              onChange={e => { setSiteContent(p => ({ ...p, [field.key]: e.target.value })); setSiteFiles(p => { const n={...p}; delete n[field.key]; return n; }); setSiteFilePreviews(p => { const n={...p}; delete n[field.key]; return n; }); }}
                              placeholder="Enter URL or upload file..."
                              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                            />
                            <button onClick={() => siteFileRefs.current[field.key]?.click()} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-1 hover:bg-gray-200 border border-gray-200">
                              <Upload size={14} /> Upload
                            </button>
                            <button onClick={() => handleSaveSiteContent(field.key)} disabled={savingSiteContent === field.key} className="px-4 py-2 bg-[#0C1B33] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-700">
                              <Save size={14} /> {savingSiteContent === field.key ? "..." : "Save"}
                            </button>
                          </div>
                          <input ref={el => { siteFileRefs.current[field.key] = el; }} type="file" accept={field.type === "video" ? "video/*" : "image/*"} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSiteFileChange(field.key, f); }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIDEO TESTIMONIALS TAB */}
            {activeTab === "video-testimonials" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">What Motivates Us — Video Testimonials</h2>
                  <span className="ml-auto text-xs font-bold text-gray-400">{testimonials.length} videos</span>
                </div>
                {testimonials.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">No video testimonials yet. Add one!</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {testimonials.map(t => (
                      <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                          {t.poster_url ? <img src={t.poster_url.startsWith('/') ? `${API}${t.poster_url}` : t.poster_url} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Video size={20} /></div>}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"><div className="w-0 h-0 border-l-[6px] border-l-gray-800 border-y-[4px] border-y-transparent ml-0.5"></div></div></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-800 dark:text-white text-sm">{t.name || <span className="text-gray-400 italic">No name</span>}</div>
                          <div className="text-[11px] text-gray-400 font-medium">{t.location}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">{t.testimony}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleToggleTestimonial(t)} className={`p-1.5 rounded-lg transition-all ${t.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>{t.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                          <button onClick={() => { openEditTestimonial(t); setActiveTab("video-testimonials"); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4 EASY STEPS TAB */}
            {activeTab === "easy-steps" && (() => {
              const sellSteps = banners.filter(b => b.page === "sell-car" && b.type === "step");
              const buySteps = banners.filter(b => b.page === "home" && b.type === "buy-step");
              const steps = stepsSubTab === "sell" ? sellSteps : buySteps;
              return (
                <div className="space-y-4">
                  {/* Sub-tabs */}
                  <div className="flex gap-2">
                    {(["sell", "buy"] as const).map(tab => (
                      <button key={tab} onClick={() => setStepsSubTab(tab)}
                        className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                          stepsSubTab === tab
                            ? "bg-[#0C1B33] text-white shadow"
                            : "bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {tab === "sell" ? "🚗 Sell Steps" : "🏷️ Buy Steps"}
                      </button>
                    ))}
                  </div>
                  {/* Step list */}
                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                      <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        {stepsSubTab === "sell" ? "Sell Your Car — 4 Easy Steps" : "How to Buy — Easy Steps"}
                      </h2>
                      <span className="ml-auto text-xs font-bold text-gray-400">{steps.length} steps</span>
                    </div>
                    {steps.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 text-sm">No steps yet. Click "Add Step" to create one.</div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {steps.sort((a,b) => a.sort_order - b.sort_order).map(b => (
                          <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {b.image_url ? <img src={b.image_url.startsWith('/') ? `${API}${b.image_url}` : b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Image size={20} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-800 dark:text-white text-sm">{b.title || <span className="text-gray-400 italic">Untitled Step</span>}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5 truncate">{b.subtitle}</div>
                              <div className="text-[10px] mt-0.5"><span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-bold">Order: {b.sort_order}</span>{b.cta_text && <span className="ml-2 text-gray-400">Badge: {b.cta_text}</span>}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleToggleBanner(b)} className={`p-1.5 rounded-lg transition-all ${b.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>{b.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                              <button onClick={() => { openEditBanner(b); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* FRONTEND CONTENT TAB */}
            {activeTab === "frontend-content" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 shadow-sm space-y-8">
                <h2 className="text-lg font-bold text-gray-850 dark:text-white mb-6">Frontend Content Settings</h2>
                <form onSubmit={handleSaveMarquee} className="space-y-6">
                  
                  {/* Marquee Text */}
                  <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Buy Cars Page Marquee Text</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-850 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-y min-h-[80px] font-medium text-sm"
                      placeholder="MONSOON OFFER: UP TO 45% OFF • FREEBIES ABOVE ₹1,999"
                      value={marqueeText}
                      onChange={(e) => setMarqueeText(e.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-gray-500 font-medium">
                      This text scrolls across the top of the Buy Cars page. Use a bullet • (Alt+0149) or | to separate items.
                    </p>
                  </div>

                  {/* Extra Card Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Buy Cars Listing: Promo Extra Card</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">This card appears in the grid position #3 (replaces the 3rd car slot) and repeats every 15 cars</p>
                      </div>
                      <select
                        value={extraCardIsActive}
                        onChange={(e) => setExtraCardIsActive(e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-bold"
                      >
                        <option value="true">Active (Show Card)</option>
                        <option value="false">Inactive (Hide Card)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Card Title / Headline</label>
                        <input
                          type="text"
                          value={extraCardTitle}
                          onChange={(e) => setExtraCardTitle(e.target.value)}
                          placeholder="Get a used car loan up to"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Highlight Value</label>
                        <input
                          type="text"
                          value={extraCardValue}
                          onChange={(e) => setExtraCardValue(e.target.value)}
                          placeholder="₹35,000,000*"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Image / Icon</label>
                      <div className="flex gap-4 items-center">
                        <div
                          onClick={() => extraCardLogoRef.current?.click()}
                          className="w-36 h-20 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/20 transition-all group relative overflow-hidden shrink-0 bg-slate-900"
                        >
                          {extraCardLogoPreview ? (
                            <img src={extraCardLogoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                          ) : (
                            <>
                              <Upload size={18} className="text-gray-300 group-hover:text-brand-400 transition-colors mb-1" />
                              <span className="text-[10px] text-gray-400 font-bold">Upload Logo</span>
                            </>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={extraCardLogoUrl}
                            onChange={(e) => {
                              setExtraCardLogoUrl(e.target.value);
                              setExtraCardLogoPreview(e.target.value);
                            }}
                            placeholder="Or paste Logo Image URL..."
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-medium"
                          />
                          <p className="text-[10px] text-gray-400 font-semibold">Recommended: transparent PNG or white/light logo icon.</p>
                        </div>
                        <input
                          ref={extraCardLogoRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setExtraCardLogoFile(f);
                              setExtraCardLogoPreview(URL.createObjectURL(f));
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bullet Details (Format: Key:Value|Key:Value|...)</label>
                      <input
                        type="text"
                        value={extraCardDetails}
                        onChange={(e) => setExtraCardDetails(e.target.value)}
                        placeholder="Up to zero:Down payment|Starting @10.99%:Interest rate|Up to 84:Months tenure"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                      />
                      <p className="mt-1 text-[10px] text-gray-400 font-semibold">Use colon (:) for column label and pipe (|) to separate bullets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Button Text</label>
                        <input
                          type="text"
                          value={extraCardBtnText}
                          onChange={(e) => setExtraCardBtnText(e.target.value)}
                          placeholder="Check loan offer"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Button Link / URL</label>
                        <input
                          type="text"
                          value={extraCardBtnLink}
                          onChange={(e) => setExtraCardBtnLink(e.target.value)}
                          placeholder="/loan-offer"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Gradient (CSS)</label>
                      <input
                        type="text"
                        value={extraCardBgGradient}
                        onChange={(e) => setExtraCardBgGradient(e.target.value)}
                        placeholder="linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={marqueeSaving}
                      className="bg-[#0C1B33] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-lg"
                    >
                      {marqueeSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>

                {/* Feature Cards & Custom Page Graphics */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Feature Cards & Page Graphics</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Upload custom graphic assets for special feature cards and about page banners</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureGraphicUploader 
                      label="Buyback Guarantee Feature Image" 
                      settingKey="buyback_feature_image" 
                      defaultValue="/images/features/buyback.png" 
                      onSuccess={fetchMarquee}
                    />
                    <FeatureGraphicUploader 
                      label="About Us Hero Banner Image" 
                      settingKey="about_hero_image" 
                      defaultValue="/images/about/hero.png" 
                      onSuccess={fetchMarquee}
                    />
                    <FeatureGraphicUploader 
                      label="About Us Story / Team Image" 
                      settingKey="about_team_image" 
                      defaultValue="/images/about/team.png" 
                      onSuccess={fetchMarquee}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Banner Add/Edit Modal */}
      {showForm && editingBanner !== null && (activeTab === "banners" || activeTab === "easy-steps" || activeTab === "sidebar-banner" || activeTab === "login-banner") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="font-black text-gray-800 dark:text-white">
                {activeTab === "login-banner"
                  ? (editingBanner.id ? "Edit Login Banner" : "Upload Login Banner")
                  : activeTab === "sidebar-banner"
                  ? (editingBanner.id ? "Edit Sidebar Banner" : "Upload Sidebar Banner")
                  : editingBanner.id
                    ? (activeTab === "easy-steps" ? "Edit Step" : "Edit Banner")
                    : (activeTab === "easy-steps" ? `New ${stepsSubTab === "sell" ? "Sell" : "Buy"} Step` : "New Banner")
                }
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-all"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Banner Image</label>
                <div onClick={() => fileRef.current?.click()} className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/20 transition-all group relative overflow-hidden">
                  {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0 rounded-2xl" /> : <><Upload size={24} className="text-gray-300 group-hover:text-brand-400 transition-colors mb-2" /><span className="text-xs text-gray-400 font-bold">Click to upload image</span></>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }} />
                <input type="text" placeholder="Or paste image URL..." value={editingBanner.image_url || ""} onChange={e => setEditingBanner(p => ({ ...p!, image_url: e.target.value }))} className="mt-2 w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-medium" />
              </div>
              {activeTab !== "easy-steps" && activeTab !== "sidebar-banner" && activeTab !== "login-banner" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Page</label>
                    <select value={editingBanner.page} onChange={e => setEditingBanner(p => ({ ...p!, page: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold">
                      <option value="home">Home</option>
                      <option value="buy-cars">Buy Cars</option>
                      <option value="sell-car">Sell Car</option>
                      <option value="car-detail">Car Detail Page</option>
                      <option value="login">Login Screen Modal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                    <select value={editingBanner.type} onChange={e => setEditingBanner(p => ({ ...p!, type: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold">
                      <option value="desktop">Desktop Slider</option>
                      <option value="mobile">Mobile Slider</option>
                      <option value="promo">Promo Banner</option>
                      <option value="sidebar">Sidebar Banner (Car Detail)</option>
                      <option value="modal">Login Modal Banner</option>
                      <option value="step">Step Card (Sell Car)</option>
                      <option value="buy-step">Step Card (Buy / Home)</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === "login-banner" && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2">
                  <span className="text-base mt-0.5">🔑</span>
                  <div>
                    <p className="text-xs text-emerald-700 font-bold">Login Screen Left Banner</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Appears on the left side of the Login Modal across the site. Page: <strong>login</strong> · Recommended size: <strong>450×535px</strong></p>
                  </div>
                </div>
              )}
              {activeTab === "sidebar-banner" && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2">
                  <span className="text-base mt-0.5">📌</span>
                  <div>
                    <p className="text-xs text-blue-700 font-bold">Car Detail Sidebar Banner</p>
                    <p className="text-[10px] text-blue-500 mt-0.5">This will appear at the top of the price sidebar on every car details page. Page: <strong>car-detail</strong> · Type: <strong>sidebar</strong></p>
                  </div>
                </div>
              )}
              {(activeTab === "easy-steps" || editingBanner.type === "step" || editingBanner.type === "buy-step") && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-2">
                  <span className="text-base mt-0.5">💡</span>
                  <div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">Step Card Image Format</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Images are displayed full-bleed with edge-to-edge cover. Recommended ratio: <strong>1:1 Square (600×600px)</strong> or <strong>4:3 (800×600px)</strong>.</p>
                  </div>
                </div>
              )}
              {editingBanner.type === "promo" && (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="pr-4">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Flip Image Horizontally</label>
                    <span className="text-[10px] text-gray-400 font-medium leading-normal block">When enabled, the banner background image is mirrored/flipped horizontally.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingBanner(p => ({ ...p!, flip_image: p!.flip_image ? 0 : 1 }))}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors shrink-0"
                  >
                    {editingBanner.flip_image ? (
                      <ToggleRight className="text-green-500" size={32} />
                    ) : (
                      <ToggleLeft className="text-gray-300 dark:text-gray-600" size={32} />
                    )}
                  </button>
                </div>
              )}
              {(
                editingBanner.type === "promo"
                  ? [["cta_link", "Button Link / URL"]]
                  : [
                      ["title", "Title / Step Heading"],
                      ["subtitle", "Subtitle / Description"],
                      ["cta_text", "Badge / Text"],
                      ["cta_link", "Button Link / URL"]
                    ]
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                  <input type="text" value={(editingBanner as any)[key] || ""} onChange={e => setEditingBanner(p => ({ ...p!, [key]: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sort Order</label>
                <input type="number" value={editingBanner.sort_order ?? 0} onChange={e => setEditingBanner(p => ({ ...p!, sort_order: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
              <button onClick={handleSaveBanner} disabled={saving} className="flex-2 py-3 px-8 bg-[#0C1B33] text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 hover:bg-slate-700">
                <Save size={16} /> {saving ? "Saving..." : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Testimonial Add/Edit Modal */}
      {showForm && editingTestimonial !== null && activeTab === "video-testimonials" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h3 className="font-black text-gray-800 dark:text-white">{editingTestimonial.id ? "Edit Video Testimonial" : "New Video Testimonial"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-all"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Video File or URL</label>
                <div className="flex gap-2">
                  <input type="text" value={editingTestimonial.video_url || ""} onChange={e => setEditingTestimonial(p => ({ ...p!, video_url: e.target.value }))} placeholder="https://..." className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
                  <button onClick={() => videoFileRef.current?.click()} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-1 border border-gray-200"><Upload size={14} /></button>
                </div>
                {videoFile && <p className="text-xs text-green-600 font-bold mt-1">File: {videoFile.name}</p>}
                <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Poster/Thumbnail Image URL or File</label>
                <div className="flex gap-2">
                  <input type="text" value={editingTestimonial.poster_url || ""} onChange={e => setEditingTestimonial(p => ({ ...p!, poster_url: e.target.value }))} placeholder="https://..." className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
                  <button onClick={() => posterFileRef.current?.click()} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-1 border border-gray-200"><Upload size={14} /></button>
                </div>
                {posterFile && <p className="text-xs text-green-600 font-bold mt-1">File: {posterFile.name}</p>}
                <input ref={posterFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setPosterFile(f); }} />
              </div>
              {([["name","Customer Name"],["location","City / Location"],["testimony","Testimonial Quote"]] as [string,string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                  {key === "testimony" ? (
                    <textarea value={(editingTestimonial as any)[key] || ""} onChange={e => setEditingTestimonial(p => ({ ...p!, [key]: e.target.value }))} rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
                  ) : (
                    <input type="text" value={(editingTestimonial as any)[key] || ""} onChange={e => setEditingTestimonial(p => ({ ...p!, [key]: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
                  )}
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sort Order</label>
                <input type="number" value={editingTestimonial.sort_order ?? 0} onChange={e => setEditingTestimonial(p => ({ ...p!, sort_order: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
              <button onClick={handleSaveTestimonial} disabled={saving} className="flex-2 py-3 px-8 bg-[#0C1B33] text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 hover:bg-slate-700">
                <Save size={16} /> {saving ? "Saving..." : "Save Video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FeatureGraphicUploader({
  label,
  settingKey,
  defaultValue,
  onSuccess
}: {
  label: string;
  settingKey: string;
  defaultValue: string;
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [currentVal, setCurrentVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/settings/public`)
      .then(res => res.json())
      .then(data => {
        if (data && data[settingKey]) {
          setCurrentVal(data[settingKey]);
        }
      })
      .catch(() => {});
  }, [settingKey]);

  const displayUrl = currentVal
    ? (currentVal.startsWith('http') ? currentVal : `${API}${currentVal}`)
    : defaultValue;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(settingKey, file);

    try {
      setUploading(true);
      const res = await fetch(`${API}/api/settings/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.settings && data.settings[settingKey]) {
        setCurrentVal(data.settings[settingKey]);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
      <label className="text-xs font-bold text-gray-700 dark:text-gray-200 block">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-32 h-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
          <img src={displayUrl} alt={label} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#1C3EB9] text-white text-xs font-bold rounded-xl hover:bg-[#153299] transition-all disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>
    </div>
  );
}

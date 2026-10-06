import React, { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { toast } from "react-hot-toast";
import {
  CalendarCheck,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  Eye,
  ChevronRight,
  Flame,
  Pencil,
  X
} from "lucide-react";

interface BookingConfig {
  booking_special_enabled: string;
  booking_special_badge: string;
  booking_special_title: string;
  booking_special_amount: string;
  booking_special_date: string;
  booking_special_subtext: string;
  booking_special_learn_more: string;
  booking_standard_title: string;
  booking_standard_amount: string;
  booking_standard_hold_days: string;
  booking_standard_learn_more: string;
}

const defaultBookingConfig: BookingConfig = {
  booking_special_enabled: "true",
  booking_special_badge: "🪔 Navratri Special",
  booking_special_title: "Reserve till Navratri",
  booking_special_amount: "25000",
  booking_special_date: "Sun, 11 Oct",
  booking_special_subtext: "Car held for you till Sun, 11 Oct",
  booking_special_learn_more: "Guaranteed vehicle reservation with extended festival holding period. 100% refundable token deposit with priority inspection & delivery.",
  booking_standard_title: "Standard booking",
  booking_standard_amount: "11000",
  booking_standard_hold_days: "3",
  booking_standard_learn_more: "Standard 3-day holding period to complete vehicle inspection and paperwork. 100% refundable token deposit."
};

const BookingSettings: React.FC = () => {
  const [config, setConfig] = useState<BookingConfig>(defaultBookingConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<"special" | "standard">("special");
  const [previewModal, setPreviewModal] = useState<"special" | "standard" | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/settings/public?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({
          ...prev,
          booking_special_enabled: data.booking_special_enabled !== undefined ? String(data.booking_special_enabled) : prev.booking_special_enabled,
          booking_special_badge: data.booking_special_badge || prev.booking_special_badge,
          booking_special_title: data.booking_special_title || prev.booking_special_title,
          booking_special_amount: data.booking_special_amount ? String(data.booking_special_amount) : prev.booking_special_amount,
          booking_special_date: data.booking_special_date || prev.booking_special_date,
          booking_special_subtext: data.booking_special_subtext || prev.booking_special_subtext,
          booking_special_learn_more: data.booking_special_learn_more || prev.booking_special_learn_more,
          booking_standard_title: data.booking_standard_title || prev.booking_standard_title,
          booking_standard_amount: data.booking_standard_amount ? String(data.booking_standard_amount) : prev.booking_standard_amount,
          booking_standard_hold_days: data.booking_standard_hold_days ? String(data.booking_standard_hold_days) : prev.booking_standard_hold_days,
          booking_standard_learn_more: data.booking_standard_learn_more || prev.booking_standard_learn_more,
        }));
      }
    } catch (err) {
      console.error("Failed to load booking settings", err);
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }
      const res = await fetch(`${API_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Failed to save (Status ${res.status})`);
      }

      toast.success("Booking settings saved & updated on Checkout page!");
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving booking settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset booking options to default values?")) {
      setConfig(defaultBookingConfig);
      toast.success("Reset to defaults. Remember to click Save!");
    }
  };

  const getDynamicStandardDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 3));
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  };

  const festivalTitle = config.booking_special_title || "Reserve till Navratri";
  const festivalName = festivalTitle
    .replace(/^Reserve till /i, '')
    .replace(/ Special$/i, '')
    .trim() || 'Navratri';

  const getPaperworkDate = (dateStr: string) => {
    if (!dateStr) return 'Sat, 10 Oct';
    try {
      const parts = dateStr.includes(',') ? dateStr.split(',')[1].trim() : dateStr.trim();
      const currentYear = new Date().getFullYear();
      const parsed = new Date(`${parts} ${currentYear}`);
      if (!isNaN(parsed.getTime())) {
        parsed.setDate(parsed.getDate() - 1);
        const dayName = parsed.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = parsed.getDate();
        const monthName = parsed.toLocaleDateString('en-US', { month: 'short' });
        return `${dayName}, ${dayNum} ${monthName}`;
      }
    } catch (e) {}
    return '1 day before delivery';
  };

  const isSpecialActive = config.booking_special_enabled === "true";

  return (
    <>
      <PageMeta
        title="Booking Settings | Selectt Admin"
        description="Configure festive special reservations and standard 3-day hold booking options shown on checkout."
      />
      <PageBreadCrumb pageTitle="Booking Settings" />

      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#00A38D] dark:text-teal-400 flex items-center justify-center">
                <CalendarCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Checkout Booking Plan Settings
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure the selectable booking plans on the customer checkout page (<code className="text-[#00A38D] dark:text-teal-400">/checkout/:id</code>)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <Button
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading settings...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Special Festive / Seasonal Reservation Plan */}
              <ComponentCard title="Festive / Special Reservation Plan">
                <div className="space-y-5">
                  {/* Enable / Disable Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00A38D] text-white flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          Enable Special Festive Reservation
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Show the festive highlight card on checkout (e.g. Navratri, Diwali, Year-End)
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.booking_special_enabled === "true"}
                        onChange={e => setConfig({ ...config, booking_special_enabled: e.target.checked ? "true" : "false" })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A38D]"></div>
                    </label>
                  </div>

                  <div className={`space-y-4 transition-opacity ${!isSpecialActive ? "opacity-50 pointer-events-none" : ""}`}>
                    {/* Badge Text */}
                    <div>
                      <Label>
                        Badge Tag <span className="text-gray-400 text-xs font-normal">(Shown as top pill tag)</span>
                      </Label>
                      <Input
                        type="text"
                        value={config.booking_special_badge}
                        onChange={e => setConfig({ ...config, booking_special_badge: e.target.value })}
                        placeholder="e.g. 🪔 Navratri Special, ✨ Diwali Dhamaka, 🎉 Festive Offer"
                      />
                    </div>

                    {/* Title & Amount Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Plan Title</Label>
                        <Input
                          type="text"
                          value={config.booking_special_title}
                          onChange={e => setConfig({ ...config, booking_special_title: e.target.value })}
                          placeholder="e.g. Reserve till Navratri"
                        />
                      </div>
                      <div>
                        <Label>Special Booking Amount (₹)</Label>
                        <Input
                          type="number"
                          value={config.booking_special_amount}
                          onChange={e => setConfig({ ...config, booking_special_amount: e.target.value })}
                          placeholder="25000"
                        />
                      </div>
                    </div>

                    {/* Special Date / Hold Subtext */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Special Hold Date</Label>
                        <Input
                          type="text"
                          value={config.booking_special_date}
                          onChange={e => {
                            const newDate = e.target.value;
                            setConfig({
                              ...config,
                              booking_special_date: newDate,
                              booking_special_subtext: `Car held for you till ${newDate}`
                            });
                          }}
                          placeholder="e.g. Sun, 11 Oct"
                        />
                      </div>
                      <div>
                        <Label>Full Card Subtext</Label>
                        <Input
                          type="text"
                          value={config.booking_special_subtext}
                          onChange={e => setConfig({ ...config, booking_special_subtext: e.target.value })}
                          placeholder="e.g. Car held for you till Sun, 11 Oct"
                        />
                      </div>
                    </div>

                    {/* Learn More Text */}
                    <div>
                      <Label>
                        "Learn More" Popup Explanation <span className="text-gray-400 text-xs font-normal">(Shown when user clicks ⓘ Learn more)</span>
                      </Label>
                      <textarea
                        rows={3}
                        value={config.booking_special_learn_more}
                        onChange={e => setConfig({ ...config, booking_special_learn_more: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
                        placeholder="Explain benefits, refund policy, and terms for this special festive reservation..."
                      />
                    </div>
                  </div>
                </div>
              </ComponentCard>

              {/* Card 2: Standard Booking Plan */}
              <ComponentCard title="Standard Booking Plan">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Standard Plan Title</Label>
                      <Input
                        type="text"
                        value={config.booking_standard_title}
                        onChange={e => setConfig({ ...config, booking_standard_title: e.target.value })}
                        placeholder="Standard booking"
                      />
                    </div>
                    <div>
                      <Label>Standard Amount (₹)</Label>
                      <Input
                        type="number"
                        value={config.booking_standard_amount || "11000"}
                        onChange={e => setConfig({ ...config, booking_standard_amount: e.target.value })}
                        placeholder="11000"
                      />
                    </div>
                    <div>
                      <Label>
                        Car Hold Duration <span className="text-purple-600 font-bold">(Days)</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={config.booking_standard_hold_days}
                        onChange={e => setConfig({ ...config, booking_standard_hold_days: e.target.value })}
                        placeholder="3"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Dynamic preview: <strong>Car held for {config.booking_standard_hold_days || 3} days until {getDynamicStandardDate(Number(config.booking_standard_hold_days) || 3)}</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Standard "Learn More" Explanation</Label>
                    <textarea
                      rows={3}
                      value={config.booking_standard_learn_more}
                      onChange={e => setConfig({ ...config, booking_standard_learn_more: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
                      placeholder="Explain standard 3-day booking policy and 100% refund guarantee..."
                    />
                  </div>
                </div>
              </ComponentCard>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <Eye size={18} className="text-purple-600" />
                    <span>Live Checkout Preview</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Interactive
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    How it looks on selectt.in/checkout/:id
                  </div>

                  {/* Dummy Car Header in Card */}
                  <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/70 dark:border-gray-700 flex items-center justify-between text-xs text-slate-500">
                    <div className="font-bold text-slate-800 dark:text-white">2022 Tata Safari XZA Plus</div>
                    <div className="font-black text-slate-900 dark:text-white">₹17.95 Lakh</div>
                  </div>

                  {/* PREVIEW OF OPTION 1: SPECIAL PLAN */}
                  {isSpecialActive && (
                    <div
                      onClick={() => setPreviewPlan("special")}
                      className={`relative p-4 sm:p-5 rounded-3xl transition-all cursor-pointer border-2 ${
                        previewPlan === "special"
                          ? "border-[#00A38D] bg-[#F0FDF9] shadow-xs ring-2 ring-[#00A38D]/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      {/* Pill Badge floating top-left */}
                      <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-amber-500/80 shadow-xs flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                        <span>{config.booking_special_badge || "🪔 Navratri Special"}</span>
                      </div>

                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-start gap-3">
                          {/* Custom Radio Button */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              previewPlan === "special"
                                ? "border-[#00A38D] bg-white"
                                : "border-slate-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                            }`}
                          >
                            {previewPlan === "special" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#00A38D]" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#0C1B33] dark:text-white text-sm sm:text-base leading-tight">
                              {config.booking_special_title || "Reserve till Navratri"}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 font-medium">
                              {config.booking_special_subtext || `Car held for you till ${config.booking_special_date || "Sun, 11 Oct"}`}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModal("special");
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00A38D] hover:underline mt-2 cursor-pointer"
                            >
                              <Info size={13} className="text-[#00A38D]" />
                              <span>Learn more</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-base sm:text-lg text-[#0C1B33] dark:text-white font-mono">
                            ₹ {Number(config.booking_special_amount || 25000).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW OF OPTION 2: STANDARD BOOKING */}
                  <div
                    onClick={() => setPreviewPlan("standard")}
                    className={`p-4 sm:p-5 rounded-3xl transition-all cursor-pointer border-2 ${
                      previewPlan === "standard"
                        ? "border-[#00A38D] bg-[#F0FDF9] shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Custom Radio Button */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            previewPlan === "standard"
                              ? "border-[#00A38D] bg-white"
                              : "border-slate-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                          }`}
                        >
                          {previewPlan === "standard" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00A38D]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#0C1B33] dark:text-white text-sm sm:text-base leading-tight">
                            {config.booking_standard_title || "Standard booking"}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 font-medium">
                            Car held for {config.booking_standard_hold_days || 3} days until {getDynamicStandardDate(Number(config.booking_standard_hold_days) || 3)}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModal("standard");
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00A38D] hover:underline mt-2 cursor-pointer"
                          >
                            <Info size={13} className="text-[#00A38D]" />
                            <span>Learn more</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-base sm:text-lg text-[#0C1B33] dark:text-white font-mono">
                          ₹ {Number(config.booking_standard_amount || 11000).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Amount Callout */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <span>Payable on Checkout:</span>
                    <span className="text-sm font-black font-mono">
                      ₹ {previewPlan === "special" && isSpecialActive
                        ? Number(config.booking_special_amount || 25000).toLocaleString("en-IN")
                        : Number(config.booking_standard_amount || 11000).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learn More Modal Preview (Matching Reference Screenshots 1 & 2) */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-[#0C1B33] tracking-tight">
                {previewModal === "special"
                  ? `How ${festivalName} reservation works`
                  : "Selectt Satisfaction Assurance"}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Special Festival Stepper (Screenshot 1) */}
            {previewModal === "special" ? (
              <div className="py-6 px-1 space-y-6">
                {/* Step 1 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      1
                    </div>
                    <div className="w-[1.5px] bg-teal-200 absolute top-7 bottom-[-24px] left-1/2 -translate-x-1/2 z-0" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Pay ₹{Number(config.booking_special_amount || 25000).toLocaleString("en-IN")} to book
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      The car is taken off the website and held only for you till {config.booking_special_date || "Sun, 11 Oct"}.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      2
                    </div>
                    <div className="w-[1.5px] bg-teal-200 absolute top-7 bottom-[-24px] left-1/2 -translate-x-1/2 z-0" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Finish paperwork before {festivalName}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Upload RC documents, get your loan approved and pay the balance by {getPaperworkDate(config.booking_special_date)}.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      3
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Drive home on {festivalName}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Take delivery on {config.booking_special_date || "Sun, 11 Oct"}. We will call you to fix the time.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Modal Body: Standard Assurance (Screenshot 2) */
              <div className="py-5 space-y-3.5 text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
                <p>
                  Placing a booking deposit allows us to reserve this car exclusively for you, for a total of {config.booking_standard_hold_days || 3} days. Use this time to freely decide if the car is your perfect fit.
                </p>
                <p>
                  If you’re not 100% satisfied with the car, we’ll refund your entire booking amount no-questions-asked.
                </p>
              </div>
            )}

            {/* Shared Callout Box (Screenshot 1 & 2) */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2 text-xs sm:text-[13px] leading-relaxed">
              <p className="text-slate-600">
                <strong className="font-bold text-[#0C1B33]">100% refundable</strong>{" "}
                Cancel any time before delivery and get the full amount back. No questions asked.
              </p>
              <p className="text-slate-600">
                <strong className="font-bold text-[#0C1B33]">Not an extra charge</strong>{" "}
                The ₹{(previewModal === "special" ? Number(config.booking_special_amount || 25000) : Number(config.booking_standard_amount || 11000)).toLocaleString("en-IN")} is part of your car price. Think of it as a down payment on your car.
              </p>
            </div>

            {/* Bottom Full-Width "Got it" Button (Selectt Brand Teal) */}
            <button
              type="button"
              onClick={() => setPreviewModal(null)}
              className="w-full mt-5 py-3.5 rounded-xl bg-[#00A38D] hover:bg-[#008f7b] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer text-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Save Success Popup Modal */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSuccessPopup(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Data Saved Successfully!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Booking settings have been successfully updated in the database and are now live on the customer checkout page.
            </p>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-gray-900/60 rounded-xl text-left text-xs space-y-1.5 border border-slate-100 dark:border-gray-700 font-sans text-slate-700 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Badge Tag:</span>
                <span className="font-bold text-amber-700">{config.booking_special_badge}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Special Amount:</span>
                <span className="font-bold font-mono">₹{Number(config.booking_special_amount || 25000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Special Date:</span>
                <span className="font-bold">{config.booking_special_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Standard Plan:</span>
                <span className="font-bold">{config.booking_standard_title} (₹{Number(config.booking_standard_amount || 11000).toLocaleString('en-IN')})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="w-full mt-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              Done / Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingSettings;

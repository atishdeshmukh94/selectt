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
  FileText,
  Upload,
  CheckCircle2,
  Save,
  Download,
  Building2,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  PenTool,
  RotateCcw,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface Setting {
  id?: number;
  setting_key: string;
  setting_value: string;
}

const defaultReceiptSettings = {
  receipt_company_name: "Selectt Cars India Private Limited",
  receipt_company_phone: "+91 85746 67466",
  receipt_company_email: "hello@selectt.in",
  receipt_company_website: "https://selectt.in",
  receipt_company_address: "Selectt Experience Hub, Andheri East, Mumbai, Maharashtra 400069",
  receipt_gstin: "27AAACS9821L1ZM",
  receipt_logo_url: "https://selectt.in/img/dark-logo.svg",
  receipt_title: "Payment Receipt",
  receipt_subtitle: "PRE-OWNED CARS • ASSURED QUALITY",
  receipt_guarantee_text: "This token booking advance is 100% refundable anytime prior to vehicle handover, plus backed by our 5-Day Money-Back Guarantee and 200-Point Quality Inspection.",
  receipt_footer_note: "*All warranties start from the date of physical vehicle handover. Verified Selectt Assured certified inventory.",
  receipt_signatory_name: "Rohit Deshmukh",
  receipt_signatory_title: "Authorized Signatory • Head of Customer Fulfillment",
  receipt_signature_url: "",
  receipt_show_digital_stamp: "true",
};

const ReceiptSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>(defaultReceiptSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [previewTab, setPreviewTab] = useState<"desktop" | "summary">("desktop");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data: Setting[] = await res.json();
      const map: Record<string, string> = { ...defaultReceiptSettings };
      data.forEach((item) => {
        if (item.setting_key.startsWith("receipt_")) {
          map[item.setting_key] = item.setting_value;
        }
      });
      setSettings(map);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load receipt settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: "receipt_logo_url" | "receipt_signature_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLogo = targetKey === "receipt_logo_url";
    if (isLogo) setUploadingLogo(true);
    else setUploadingSig(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        handleChange(targetKey, data.url);
        toast.success(`${isLogo ? "Logo" : "Signature"} uploaded successfully!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingSig(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Receipt design settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save receipt settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Payment Receipt Design & Content | Selectt Admin"
        description="Configure branding, terms, notes, and layout for booking payment receipts and PDF attachments."
      />
      <PageBreadCrumb pageTitle="Payment Receipt Design" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
        {/* LEFT COLUMN: Controls & Settings Form */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Header & Logo */}
            <ComponentCard title="Receipt Header & Branding">
              <div className="space-y-4">
                <div>
                  <Label>Receipt Logo Image</Label>
                  <div className="flex items-center gap-4 mt-1.5">
                    {settings.receipt_logo_url ? (
                      <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0">
                        <img
                          src={settings.receipt_logo_url}
                          alt="Receipt Logo"
                          className="h-10 w-auto max-w-[160px] object-contain"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 space-y-2">
                      <Input
                        type="text"
                        value={settings.receipt_logo_url}
                        onChange={(e) => handleChange("receipt_logo_url", e.target.value)}
                        placeholder="https://selectt.in/img/dark-logo.svg"
                      />
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-md text-xs font-semibold cursor-pointer transition-colors">
                          <Upload size={14} />
                          <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "receipt_logo_url")}
                            disabled={uploadingLogo}
                          />
                        </label>
                        <span className="text-[11px] text-gray-400">PNG, SVG, or JPG recommended (transparent bg)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Receipt Main Heading</Label>
                    <Input
                      type="text"
                      value={settings.receipt_title}
                      onChange={(e) => handleChange("receipt_title", e.target.value)}
                      placeholder="Payment Receipt"
                    />
                  </div>
                  <div>
                    <Label>Subheading / Tagline</Label>
                    <Input
                      type="text"
                      value={settings.receipt_subtitle}
                      onChange={(e) => handleChange("receipt_subtitle", e.target.value)}
                      placeholder="PRE-OWNED CARS • ASSURED QUALITY"
                    />
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* 2. Company & Contact Details */}
            <ComponentCard title="Company & Contact Information">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Legal Company Name</Label>
                    <Input
                      type="text"
                      value={settings.receipt_company_name}
                      onChange={(e) => handleChange("receipt_company_name", e.target.value)}
                      placeholder="Selectt Cars India Private Limited"
                    />
                  </div>
                  <div>
                    <Label>GSTIN / Tax Registration Number</Label>
                    <Input
                      type="text"
                      value={settings.receipt_gstin}
                      onChange={(e) => handleChange("receipt_gstin", e.target.value)}
                      placeholder="27AAACS9821L1ZM"
                    />
                  </div>
                </div>

                <div>
                  <Label>Registered Office / Hub Address</Label>
                  <textarea
                    rows={2}
                    value={settings.receipt_company_address}
                    onChange={(e) => handleChange("receipt_company_address", e.target.value)}
                    placeholder="Selectt Experience Hub, Andheri East, Mumbai, Maharashtra 400069"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#00C9AF]/30 focus:border-[#00C9AF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Support Phone</Label>
                    <Input
                      type="text"
                      value={settings.receipt_company_phone}
                      onChange={(e) => handleChange("receipt_company_phone", e.target.value)}
                      placeholder="+91 85746 67466"
                    />
                  </div>
                  <div>
                    <Label>Support Email</Label>
                    <Input
                      type="text"
                      value={settings.receipt_company_email}
                      onChange={(e) => handleChange("receipt_company_email", e.target.value)}
                      placeholder="hello@selectt.in"
                    />
                  </div>
                  <div>
                    <Label>Website URL</Label>
                    <Input
                      type="text"
                      value={settings.receipt_company_website}
                      onChange={(e) => handleChange("receipt_company_website", e.target.value)}
                      placeholder="https://selectt.in"
                    />
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* 3. Guarantees & Terms */}
            <ComponentCard title="Guarantee Box & Terms Note">
              <div className="space-y-4">
                <div>
                  <Label>Refundable Guarantee Promise Box</Label>
                  <textarea
                    rows={3}
                    value={settings.receipt_guarantee_text}
                    onChange={(e) => handleChange("receipt_guarantee_text", e.target.value)}
                    placeholder="This token booking advance is 100% refundable anytime prior to vehicle handover..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#00C9AF]/30 focus:border-[#00C9AF]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Highlighted in a green reassurance box on the receipt.</p>
                </div>

                <div>
                  <Label>Receipt Footer Terms & Conditions Note</Label>
                  <textarea
                    rows={2}
                    value={settings.receipt_footer_note}
                    onChange={(e) => handleChange("receipt_footer_note", e.target.value)}
                    placeholder="*All warranties start from the date of physical vehicle handover..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#00C9AF]/30 focus:border-[#00C9AF]"
                  />
                </div>
              </div>
            </ComponentCard>

            {/* 4. Authorized Signature & Stamp */}
            <ComponentCard title="Authorized Signatory & Verification Seal">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Signatory Name</Label>
                    <Input
                      type="text"
                      value={settings.receipt_signatory_name}
                      onChange={(e) => handleChange("receipt_signatory_name", e.target.value)}
                      placeholder="Rohit Deshmukh"
                    />
                  </div>
                  <div>
                    <Label>Signatory Designation</Label>
                    <Input
                      type="text"
                      value={settings.receipt_signatory_title}
                      onChange={(e) => handleChange("receipt_signatory_title", e.target.value)}
                      placeholder="Authorized Signatory • Head of Operations"
                    />
                  </div>
                </div>

                <div>
                  <Label>Signature Image (Optional)</Label>
                  <div className="flex items-center gap-4 mt-1.5">
                    {settings.receipt_signature_url ? (
                      <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 shrink-0">
                        <img
                          src={settings.receipt_signature_url}
                          alt="Signature"
                          className="h-10 w-auto max-w-[140px] object-contain"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 space-y-2">
                      <Input
                        type="text"
                        value={settings.receipt_signature_url}
                        onChange={(e) => handleChange("receipt_signature_url", e.target.value)}
                        placeholder="https://.../signature.png"
                      />
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-md text-xs font-semibold cursor-pointer transition-colors">
                          <Upload size={14} />
                          <span>{uploadingSig ? "Uploading..." : "Upload Signature"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "receipt_signature_url")}
                            disabled={uploadingSig}
                          />
                        </label>
                        <span className="text-[11px] text-gray-400">Transparent PNG recommended</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="digital_stamp"
                    checked={settings.receipt_show_digital_stamp === "true"}
                    onChange={(e) => handleChange("receipt_show_digital_stamp", e.target.checked ? "true" : "false")}
                    className="w-4 h-4 text-[#00C9AF] rounded border-gray-300 focus:ring-[#00C9AF]"
                  />
                  <label htmlFor="digital_stamp" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Show Selectt Verified Digital Stamp / Seal on receipt
                  </label>
                </div>
              </div>
            </ComponentCard>

            {/* Save Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#00C9AF] hover:bg-[#00b49d] text-[#0C1B33] font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} />
                <span>{saving ? "Saving Changes..." : "Save Receipt Settings"}</span>
              </Button>
              <button
                type="button"
                onClick={() => setSettings(defaultReceiptSettings)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Receipt Preview */}
        <div className="xl:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-800 dark:text-gray-100">
                <Sparkles size={16} className="text-[#00C9AF]" />
                <span>Live Receipt Preview</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Real-Time Updates
              </span>
            </div>

            {/* Preview Sheet Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-[#0F172A] font-sans text-xs">
              {/* Top Accent Strip */}
              <div className="h-1.5 bg-[#00C9AF] rounded-t-lg -mx-6 -mt-6 mb-5" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-dashed border-gray-200 pb-4 mb-4">
                <div>
                  {settings.receipt_logo_url ? (
                    <img
                      src={settings.receipt_logo_url}
                      alt="Logo"
                      className="h-7 w-auto mb-1 object-contain"
                      onError={(e: any) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="font-extrabold text-sm text-[#0C1B33]">{settings.receipt_company_name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{settings.receipt_subtitle}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-[#0C1B33] uppercase">{settings.receipt_title}</div>
                  <div className="font-bold text-xs text-[#00A38D] mt-0.5">#BK-560496</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">03 Oct 2026, 11:30 AM</div>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[9px] uppercase border border-emerald-200">
                    Payment Confirmed
                  </div>
                </div>
              </div>

              {/* 2 Grid Info Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-bold text-[9px] text-gray-400 uppercase tracking-wide mb-1">Customer Details</div>
                  <div className="font-bold text-gray-900 text-xs">Rohit Yadav</div>
                  <div className="text-gray-500 text-[10.5px] mt-0.5">+91 97530 03648</div>
                  <div className="text-gray-500 text-[10.5px]">rohit@selectt.in</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-bold text-[9px] text-gray-400 uppercase tracking-wide mb-1">Transaction Summary</div>
                  <div className="font-extrabold text-[#047857] text-sm">₹11,000.00</div>
                  <div className="text-gray-500 text-[10px]">Token Booking Advance</div>
                  <div className="text-gray-500 text-[10px] mt-0.5 truncate">ID: pay_TjKQWRyJMcPtmo</div>
                </div>
              </div>

              {/* Car Info Box */}
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 mb-4">
                <div className="font-bold text-[9px] text-emerald-800 uppercase tracking-wide mb-1">Reserved Vehicle</div>
                <div className="font-extrabold text-sm text-[#0C1B33]">2025 Skoda Kylaq Signature MT</div>
                <div className="text-gray-600 text-[10.5px] mt-0.5">14,200 KM • Petrol • Manual • Mumbai</div>
                <div className="text-[10px] text-[#00A38D] font-bold mt-1 underline">
                  https://selectt.in/car/41
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-4">
                <div className="flex justify-between items-center px-3 py-1.5 border-b border-slate-200 text-gray-700">
                  <span>Total Vehicle On-Road Price</span>
                  <span className="font-bold">₹11,45,000.00</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 border-b border-slate-200 text-[#047857] font-bold">
                  <span>Token Booking Advance Paid</span>
                  <span>- ₹11,000.00</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1.5 font-bold text-gray-900 bg-white">
                  <span>Remaining Balance Due at Handover</span>
                  <span>₹11,34,000.00</span>
                </div>
              </div>

              {/* Guarantee Box */}
              <div className="bg-teal-50/70 p-2.5 rounded-lg border border-teal-100 mb-4 text-teal-900 leading-snug">
                <div className="font-bold text-[9px] text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#00C9AF]" />
                  <span>Selectt Assured 100% Refundable Guarantee</span>
                </div>
                <div className="text-[10px] text-teal-800">{settings.receipt_guarantee_text}</div>
              </div>

              {/* Signature & Seal Row */}
              <div className="flex items-end justify-between border-t border-gray-100 pt-3 mb-3">
                <div className="space-y-0.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Contact & Support</div>
                  <div className="text-[10px] text-gray-600">{settings.receipt_company_phone} • {settings.receipt_company_email}</div>
                  <div className="text-[9px] text-gray-500">{settings.receipt_company_address}</div>
                  {settings.receipt_gstin && (
                    <div className="text-[9px] text-gray-500 font-mono">GSTIN: {settings.receipt_gstin}</div>
                  )}
                </div>

                <div className="text-right">
                  {settings.receipt_signature_url ? (
                    <img
                      src={settings.receipt_signature_url}
                      alt="Signature"
                      className="h-8 w-auto ml-auto mb-1 object-contain"
                    />
                  ) : settings.receipt_show_digital_stamp === "true" ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#00C9AF]/60 bg-[#00C9AF]/10 text-[#00A38D] font-extrabold text-[9px] mb-1">
                      <ShieldCheck size={11} />
                      <span>DIGITALLY VERIFIED</span>
                    </div>
                  ) : null}
                  <div className="font-bold text-[10px] text-[#0C1B33]">{settings.receipt_signatory_name}</div>
                  <div className="text-[9px] text-gray-500">{settings.receipt_signatory_title}</div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-[9px] text-gray-400 border-t border-gray-100 pt-2 text-center italic">
                {settings.receipt_footer_note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptSettings;

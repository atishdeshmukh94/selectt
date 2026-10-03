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
  receipt_company_name: "SELECTT FIRST PVT LTD",
  receipt_company_phone: "+91 85746 67466",
  receipt_company_email: "hello@selectt.in",
  receipt_company_website: "https://selectt.in",
  receipt_company_address: "Selectt Experience Hub, Andheri East, Mumbai, Maharashtra 400069",
  receipt_gstin: "27AACE3859E1ZJ",
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

            {/* Preview Sheet Card — mirrors the actual PDF receipt */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-[#0F172A] font-sans text-[10px]">

              {/* ── Teal top accent strip */}
              <div className="h-[5px] bg-[#0D9488]" />

              {/* ── White header row: Logo left | Booking info right */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <div className="flex-1">
                  {settings.receipt_logo_url ? (
                    <img
                      src={settings.receipt_logo_url}
                      alt="Logo"
                      className="h-8 w-auto object-contain"
                      onError={(e: any) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <span className="font-extrabold text-base text-[#0D9488]">Selectt</span>
                  )}
                </div>
                <div className="text-right shrink-0 pl-4 border-l border-gray-200">
                  <div className="font-bold text-[9px] text-[#0D9488] uppercase tracking-widest">Booking Receipt</div>
                  <div className="font-extrabold text-sm text-[#0F172A] mt-0.5">BK-560496</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">03/10/2026, 05:59 AM</div>
                </div>
              </div>

              {/* ── Company info strip */}
              <div className="flex items-center gap-1.5 px-5 py-1.5 bg-slate-50 border-b border-gray-200 text-[9px] text-gray-500">
                <span className="font-bold text-gray-700">{settings.receipt_company_name}</span>
                <span>•</span>
                <span>{settings.receipt_gstin}</span>
                <span>•</span>
                <span>selectt.in</span>
              </div>

              {/* ── Orange disclaimer */}
              <div className="mx-4 mt-3 flex items-center gap-2 bg-orange-50 border-l-4 border-orange-500 px-3 py-1.5 rounded-r-md">
                <span className="text-orange-700 font-bold text-[9px]">⚠ This is a booking receipt only — NOT a final invoice. The final Bill of Supply will be issued at delivery.</span>
              </div>

              {/* ── CUSTOMER section */}
              <div className="px-5 mt-4">
                <div className="font-extrabold text-[9px] text-[#0D9488] uppercase tracking-widest mb-2">Customer</div>
                <div className="grid grid-cols-2 gap-y-1.5">
                  <div className="flex gap-2"><span className="text-gray-400 w-9 shrink-0">Name</span><span className="font-bold">Rohit Yadav</span></div>
                  <div className="flex gap-2 justify-end"><span className="text-gray-400">Phone</span><span className="font-bold ml-2">+91 9753003648</span></div>
                  <div className="flex gap-2"><span className="text-gray-400 w-9 shrink-0">Email</span><span className="font-bold">itraipur36@gmail.com</span></div>
                  <div className="flex gap-2 justify-end"><span className="text-gray-400">City</span><span className="font-bold ml-2">Mumbai</span></div>
                </div>
                <div className="mt-3 border-t border-gray-100" />
              </div>

              {/* ── VEHICLE section */}
              <div className="px-5 mt-3">
                <div className="font-extrabold text-[9px] text-[#0D9488] uppercase tracking-widest mb-2">Vehicle</div>
                <div className="font-extrabold text-[11px] text-[#0F172A]">SKODA KYLAQ SIGNATURE AT</div>
                <div className="text-gray-400 text-[9px] mt-0.5">2025 • Automatic • Petrol</div>
                <div className="grid grid-cols-2 gap-y-1.5 mt-2">
                  <div className="flex gap-2"><span className="text-gray-400 w-14 shrink-0">Reg. No.</span><span className="font-bold">MH47AY8194</span></div>
                  <div className="flex gap-2 justify-end"><span className="text-gray-400">Colour</span><span className="font-bold ml-2">● Red</span></div>
                  <div className="flex gap-2"><span className="text-gray-400 w-14 shrink-0">KMs Driven</span><span className="font-bold">3,100 km</span></div>
                  <div className="flex gap-2 justify-end"><span className="text-gray-400">Owner</span><span className="font-bold ml-2">1st Owner</span></div>
                </div>
                <div className="mt-3 border-t border-gray-100" />
              </div>

              {/* ── PRICE BREAKUP table */}
              <div className="px-5 mt-3">
                <div className="font-extrabold text-[9px] text-[#0D9488] uppercase tracking-widest mb-2">Price Breakup</div>
                <div className="bg-slate-50 rounded overflow-hidden border border-slate-200">
                  <div className="grid grid-cols-4 bg-slate-100 px-2 py-1 text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                    <span className="col-span-2">Item</span><span className="text-right">Discount</span><span className="text-right">Amount</span>
                  </div>
                  {[
                    ["Vehicle – SKODA KYLAQ", "₹0 (0.00%)", "₹11,31,900"],
                    ["RC Transfer", "—", "₹10,500"],
                    ["Professional Detailing", "100%", "FREE"],
                    ["Standard Service", "100%", "FREE"],
                    ["Car Delivery & Refueling", "—", "₹2,600"],
                  ].map(([item, disc, amt], i) => (
                    <div key={i} className="grid grid-cols-4 px-2 py-1 border-t border-slate-200">
                      <span className="col-span-2 text-gray-700">{item}</span>
                      <span className="text-right text-gray-500">{disc}</span>
                      <span className={`text-right font-semibold ${amt === "FREE" ? "text-emerald-600" : "text-gray-800"}`}>{amt}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 px-2 py-1.5 border-t-2 border-gray-300 bg-white">
                    <span className="col-span-2 font-bold text-gray-800">Total Deal Value</span>
                    <span />
                    <span className="text-right font-extrabold text-gray-900">₹11,45,000</span>
                  </div>
                </div>
              </div>

              {/* ── Booking Amount green card */}
              <div className="mx-5 mt-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-emerald-800 text-[10px]">Booking Amount Received</div>
                  <div className="text-emerald-600 text-[9px] mt-0.5">UPI • Txn ID TjKQWRyJMcPtmo</div>
                </div>
                <div className="font-extrabold text-emerald-600 text-sm">₹11,000</div>
              </div>

              {/* ── Balance slate card */}
              <div className="mx-5 mt-2 mb-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-[10px]">Balance Payable at Delivery</span>
                <span className="font-extrabold text-gray-900 text-[11px]">₹11,34,000</span>
              </div>

              {/* ── Terms */}
              <div className="px-5 pb-2">
                <div className="font-extrabold text-[9px] text-[#0D9488] uppercase tracking-widest mb-1.5">Terms & Conditions</div>
                <ol className="space-y-0.5 text-[8.5px] text-gray-500 list-decimal list-inside">
                  <li>Vehicle sold on "As Is Where Is" basis after purchaser's inspection and acceptance.</li>
                  <li>Ownership transfer, insurance, and statutory compliance are the purchaser's responsibility post-delivery.</li>
                  <li>All liabilities, penalties, challans, or claims after delivery shall be borne by the purchaser.</li>
                  <li>Goods/Vehicle once sold will not be returned, exchanged, or refunded.</li>
                  <li>Subject to Mumbai Jurisdiction only.</li>
                </ol>
              </div>

              {/* ── Footer */}
              <div className="border-t border-gray-200 mx-5 mb-4 pt-2 space-y-0.5">
                <div className="text-[8.5px] text-gray-600">
                  <span className="font-bold text-gray-800">Bank: </span>
                  Selectt Mobility • IndusInd Bank, IC Colony Borivali | A/c 257878785288 • IFSC INDB0002144
                </div>
                <div className="text-[8.5px] text-gray-600">
                  <span className="font-bold text-gray-800">Contact: </span>
                  {settings.receipt_company_phone} • {settings.receipt_company_email}
                </div>
                <div className="text-[8px] text-gray-400">{settings.receipt_company_address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptSettings;

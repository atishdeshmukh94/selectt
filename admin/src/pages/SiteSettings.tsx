import React, { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { toast } from "react-hot-toast";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
}

interface SiteSettingsProps {
  section?: "location" | "payment" | "smtp" | "maintenance" | "whatsapp" | "branding";
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ section = "payment" }) => {
  const [activeSection, setActiveSection] = useState<string>(section);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (section) setActiveSection(section);
  }, [section]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data: Setting[] = await response.json();
      const settingsMap = data.reduce((acc, curr) => {
        acc[curr.setting_key] = curr.setting_value;
        return acc;
      }, {} as Record<string, string>);
      setSettings(settingsMap);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return (
    <>
      <PageMeta title={`Site Settings - ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} | Selectt Admin`} description="Configure global website settings." />
      <div className="p-6 text-center">Loading settings...</div>
    </>
  );

  return (
    <>
      <PageMeta title={`Site Settings - ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} | Selectt Admin`} description="Configure global website settings." />
      <div className="p-4 md:p-6">
        <PageBreadCrumb pageTitle={`Site Settings - ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}`} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          {[
            { id: "payment", label: "💳 Payment Gateway" },
            { id: "smtp", label: "✉️ SMTP & Email" },
            { id: "whatsapp", label: "💬 WhatsApp API" },
            { id: "maintenance", label: "🚧 Maintenance Mode" },
            { id: "location", label: "📍 Location & Contact" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:border-indigo-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      <div className="grid grid-cols-1 gap-6">
        {activeSection === "payment" && (
          <>
            <ComponentCard title="Payment Gateway (Razorpay)">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Razorpay Key ID</Label>
                    <Input
                      type="text"
                      placeholder="rzp_test_..."
                      value={settings.razorpay_key_id || ""}
                      onChange={(e) => handleChange("razorpay_key_id", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Found in Razorpay Dashboard {">"} Settings {">"} API Keys
                    </p>
                  </div>

                  <div>
                    <Label>Razorpay Key Secret</Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={settings.razorpay_key_secret || ""}
                      onChange={(e) => handleChange("razorpay_key_secret", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Keep this safe! Never share your key secret.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </ComponentCard>
            
            <ComponentCard title="Environment Info">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Current Mode:</strong> {settings.razorpay_key_id?.startsWith('rzp_test') ? '🧪 Test Mode' : '🚀 Live Mode'}</p>
                  <p><strong>Webhook URL:</strong> {API_URL}/api/payments/verify (Placeholder)</p>
              </div>
            </ComponentCard>
          </>
        )}

        {activeSection === "location" && (
          <ComponentCard title="Location & Contact Settings">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@yourdomain.com"
                    value={settings.contact_email || ""}
                    onChange={(e) => handleChange("contact_email", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    type="text"
                    placeholder="+91 9876543210"
                    value={settings.contact_phone || ""}
                    onChange={(e) => handleChange("contact_phone", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Office Address</Label>
                  <Input
                    type="text"
                    placeholder="123 Business Avenue, City, State ZIP"
                    value={settings.office_address || ""}
                    onChange={(e) => handleChange("office_address", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </ComponentCard>
        )}

        {activeSection === "smtp" && (
          <ComponentCard title="SMTP & Email Settings">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    type="text"
                    placeholder="smtp.example.com"
                    value={settings.smtp_host || ""}
                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                  />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={settings.smtp_port || ""}
                    onChange={(e) => handleChange("smtp_port", e.target.value)}
                  />
                </div>
                <div>
                  <Label>SMTP Username</Label>
                  <Input
                    type="text"
                    placeholder="user@example.com"
                    value={settings.smtp_user || ""}
                    onChange={(e) => handleChange("smtp_user", e.target.value)}
                  />
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={settings.smtp_pass || ""}
                    onChange={(e) => handleChange("smtp_pass", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </ComponentCard>
        )}
        {activeSection === "maintenance" && (
          <ComponentCard title="Site Maintenance Mode">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    checked={settings.maintenance_mode === "true"}
                    onChange={(e) => handleChange("maintenance_mode", e.target.checked ? "true" : "false")}
                  />
                  <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Maintenance Mode (Site Offline)
                  </label>
                </div>
                <div>
                  <Label>Maintenance Message</Label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90"
                    placeholder="We'll be back soon! The site is currently undergoing maintenance."
                    value={settings.maintenance_message || ""}
                    onChange={(e) => handleChange("maintenance_message", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This message will be displayed to users when the site is down.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </ComponentCard>
        )}

        {activeSection === "whatsapp" && (
          <div className="space-y-6">
            <ComponentCard title="WhatsApp Settings">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label>WhatsApp Gateway Provider</Label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:bg-gray-800"
                      value={settings.whatsapp_provider || "meta"}
                      onChange={(e) => handleChange("whatsapp_provider", e.target.value)}
                    >
                      <option value="meta">Official Meta WhatsApp Business API</option>
                      <option value="gallabox">Gallabox BSP (gallabox.com)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Choose whether to send OTP messages via Meta's Graph API directly or using Gallabox shared inbox BSP.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="whatsapp_test_mode"
                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    checked={settings.whatsapp_test_mode === "true"}
                    onChange={(e) => handleChange("whatsapp_test_mode", e.target.checked ? "true" : "false")}
                  />
                  <div>
                    <label htmlFor="whatsapp_test_mode" className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Enable Test Mode (Bypass API Calls)
                    </label>
                    <p className="text-xs text-gray-500 leading-tight">When enabled, OTPs will not be sent via WhatsApp. Use the Test OTP below.</p>
                  </div>
                </div>

                {settings.whatsapp_test_mode === "true" && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Label>Default Test OTP Code</Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={settings.whatsapp_test_otp || ""}
                      onChange={(e) => handleChange("whatsapp_test_otp", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter the fixed OTP code to use for all numbers during testing (e.g. 123456).</p>
                  </div>
                )}

                {(settings.whatsapp_provider || "meta") === "meta" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="md:col-span-2">
                      <Label>System User Access Token (Permanent)</Label>
                      <Input
                        type="password"
                        placeholder="EAAB..."
                        value={settings.whatsapp_api_token || ""}
                        onChange={(e) => handleChange("whatsapp_api_token", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Create a "System User" in Meta Business Suite and generate a token with `whatsapp_business_messaging` permission.
                      </p>
                    </div>
                    <div>
                      <Label>Phone Number ID</Label>
                      <Input
                        type="text"
                        placeholder="1234567890..."
                        value={settings.whatsapp_phone_number_id || ""}
                        onChange={(e) => handleChange("whatsapp_phone_number_id", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">Found in WhatsApp {">"} API Setup in Meta Dashboard.</p>
                    </div>
                    <div>
                      <Label>WABA ID (WhatsApp Business Account ID)</Label>
                      <Input
                        type="text"
                        placeholder="0987654321..."
                        value={settings.whatsapp_waba_id || ""}
                        onChange={(e) => handleChange("whatsapp_waba_id", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>OTP Template Name</Label>
                      <Input
                        type="text"
                        placeholder="otp_verification"
                        value={settings.whatsapp_otp_template_name || ""}
                        onChange={(e) => handleChange("whatsapp_otp_template_name", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">The name of your approved template in Meta Dashboard.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="md:col-span-2">
                      <Label>Gallabox API Key</Label>
                      <Input
                        type="text"
                        placeholder="Enter your Gallabox API Key"
                        value={settings.gallabox_api_key || ""}
                        onChange={(e) => handleChange("gallabox_api_key", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Generate this key from Gallabox Console under Settings {">"} API Keys.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Gallabox API Secret</Label>
                      <Input
                        type="password"
                        placeholder="Enter your Gallabox API Secret"
                        value={settings.gallabox_api_secret || ""}
                        onChange={(e) => handleChange("gallabox_api_secret", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Keep this secure! Never share your API Secret.
                      </p>
                    </div>
                    <div>
                      <Label>WhatsApp Channel ID</Label>
                      <Input
                        type="text"
                        placeholder="Enter Gallabox Channel ID"
                        value={settings.gallabox_channel_id || ""}
                        onChange={(e) => handleChange("gallabox_channel_id", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Found in Gallabox Console under Settings {">"} Connect {">"} WhatsApp Channel.
                      </p>
                    </div>
                    <div>
                      <Label>OTP Template Name</Label>
                      <Input
                        type="text"
                        placeholder="otp_verification"
                        value={settings.gallabox_template_name || ""}
                        onChange={(e) => handleChange("gallabox_template_name", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The name of the approved template in your Gallabox account.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </ComponentCard>

            <ComponentCard title="Meta Approval Guide for OTP Template">
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-bold text-gray-800 dark:text-white">
                  To get your WhatsApp OTP template approved by Meta, follow these exact guidelines in Meta Business Suite or the Gallabox dashboard:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Template Category</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">AUTHENTICATION</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Suggested Name</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">otp_verification</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Message Body Content</span>
                    <div className="mt-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg font-mono text-xs text-brand-600 dark:text-brand-400">
                      {"{{1}}"} is your verification code. For your security, do not share this code.
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Required Button</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Copy Code button</span>
                    <p className="text-xs text-gray-500 mt-0.5">Meta requires authentication templates to contain either a Copy Code or a One-tap Autofill button.</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs flex gap-2">
                  <span className="font-bold">Pro Tip:</span>
                  <span>OTPs templates approved under the AUTHENTICATION category generally bypass manual queue verification and are approved in 1-2 minutes by Meta.</span>
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {section === "branding" && (
          <div className="space-y-6">
            <ComponentCard title="Brand Logos & Navigation Images">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <LogoUploadField 
                    label="Frontend Header Logo"
                    settingKey="frontend_header_logo"
                    currentValue={settings.frontend_header_logo}
                    defaultValue="/images/logo/light-logo.svg"
                    onUploadSuccess={fetchSettings}
                  />

                  <LogoUploadField 
                    label="Frontend Footer Logo"
                    settingKey="frontend_footer_logo"
                    currentValue={settings.frontend_footer_logo}
                    defaultValue="/images/logo/light-logo.svg"
                    onUploadSuccess={fetchSettings}
                  />

                  <LogoUploadField 
                    label="Auth Modal / Login Logo"
                    settingKey="auth_logo"
                    currentValue={settings.auth_logo}
                    defaultValue="/images/logo/light-logo.svg"
                    onUploadSuccess={fetchSettings}
                  />

                  <LogoUploadField 
                    label="Admin Dashboard Logo (Light Theme)"
                    settingKey="admin_logo"
                    currentValue={settings.admin_logo}
                    defaultValue="/images/logo/dark-logo.svg"
                    onUploadSuccess={fetchSettings}
                  />

                  <LogoUploadField 
                    label="Admin Dashboard Logo (Dark Theme)"
                    settingKey="admin_logo_dark"
                    currentValue={settings.admin_logo_dark}
                    defaultValue="/images/logo/logo-dark.svg"
                    onUploadSuccess={fetchSettings}
                  />

                  <LogoUploadField 
                    label="Admin Icon / Favicon"
                    settingKey="admin_logo_icon"
                    currentValue={settings.admin_logo_icon}
                    defaultValue="/images/logo/app-logo.png"
                    isIcon={true}
                    onUploadSuccess={fetchSettings}
                  />
                </div>
              </div>
            </ComponentCard>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

interface LogoUploadFieldProps {
  label: string;
  settingKey: string;
  currentValue?: string;
  defaultValue: string;
  isIcon?: boolean;
  onUploadSuccess: () => void;
}

const LogoUploadField: React.FC<LogoUploadFieldProps> = ({ 
  label, settingKey, currentValue, defaultValue, isIcon, onUploadSuccess 
}) => {
  const [uploading, setUploading] = useState(false);
  const displayUrl = currentValue ? (currentValue.startsWith('http') ? currentValue : `${API_URL}${currentValue}`) : defaultValue;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(settingKey, file);

    try {
      setUploading(true);
      const response = await fetch(`${API_URL}/api/settings/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      toast.success(`${label} updated`);
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
      <Label>{label}</Label>
      <div className="mt-3 flex items-center gap-6">
        <div className={`relative flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${isIcon ? 'w-16 h-16' : 'w-48 h-16'}`}>
          <img 
            src={displayUrl} 
            alt={label} 
            className="max-w-full max-h-full object-contain p-2"
          />
        </div>
        <div className="flex-1">
          <input
            type="file"
            id={`file-${settingKey}`}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label 
            htmlFor={`file-${settingKey}`}
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-500 hover:bg-brand-600 focus:outline-none cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? "Uploading..." : "Change Logo"}
          </label>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;

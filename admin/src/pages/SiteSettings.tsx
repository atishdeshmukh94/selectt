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
  Image,
  Video,
  Cloud,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
}

interface SiteSettingsProps {
  section?: "location" | "payment" | "smtp" | "maintenance" | "whatsapp" | "branding" | "api_keys" | "security";
}

const SiteSettings: React.FC<SiteSettingsProps> = ({ section = "payment" }) => {
  const [activeSection, setActiveSection] = useState<string>(section);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 3rd Party API state
  const [showIkSecret, setShowIkSecret] = useState(false);
  const [showBunnySecret, setShowBunnySecret] = useState(false);
  const [showR2Secret, setShowR2Secret] = useState(false);
  const [testingIk, setTestingIk] = useState(false);
  const [ikTestResult, setIkTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testingBunny, setTestingBunny] = useState(false);
  const [bunnyTestResult, setBunnyTestResult] = useState<{ success?: boolean; message?: string; name?: string } | null>(null);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testSmtpEmail, setTestSmtpEmail] = useState("");
  const [smtpTestResult, setSmtpTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Two-Factor Authentication (2FA) State
  const [generatingTotpSecret, setGeneratingTotpSecret] = useState(false);
  const [totpTestCode, setTotpTestCode] = useState("");
  const [testingTotp, setTestingTotp] = useState(false);
  const [totpTestResult, setTotpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingWhatsapp2fa, setTestingWhatsapp2fa] = useState(false);
  const [whatsapp2faTestResult, setWhatsapp2faTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ secret: string; otpauthUrl: string; qrCodeUrl: string } | null>(null);

  const handleGenerateTotpSecret = async () => {
    try {
      setGeneratingTotpSecret(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/2fa/generate-secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleChange("two_factor_totp_secret", data.secret);
        setQrModalData(data);
        setShowQrModal(true);
        toast.success("New Google Authenticator secret key generated!");
      } else {
        toast.error(data.message || "Failed to generate secret key");
      }
    } catch (err: any) {
      toast.error("Error generating secret: " + err.message);
    } finally {
      setGeneratingTotpSecret(false);
    }
  };

  const handleTestTotpCode = async () => {
    if (!totpTestCode || totpTestCode.trim().length !== 6) {
      toast.error("Please enter a 6-digit code from Google Authenticator");
      return;
    }
    try {
      setTestingTotp(true);
      setTotpTestResult(null);
      const token = localStorage.getItem("adminToken");
      const secret = settings.two_factor_totp_secret || "JBSWY3DPEHPK3PXP";
      const res = await fetch(`${API_URL}/api/admin/2fa/test-totp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ secret, code: totpTestCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTotpTestResult({ success: true, message: data.message });
        toast.success("Google Authenticator verified successfully!");
      } else {
        setTotpTestResult({ success: false, message: data.message || "Invalid code" });
        toast.error(data.message || "Invalid code");
      }
    } catch (err: any) {
      setTotpTestResult({ success: false, message: err.message });
      toast.error("Error testing code: " + err.message);
    } finally {
      setTestingTotp(false);
    }
  };

  const handleTestWhatsapp2fa = async () => {
    const phone = settings.two_factor_whatsapp_phone || settings.whatsapp_admin_phone || "9753003648";
    try {
      setTestingWhatsapp2fa(true);
      setWhatsapp2faTestResult(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/2fa/test-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsapp2faTestResult({ success: true, message: data.message });
        toast.success(`WhatsApp 2FA test OTP sent to +${phone}!`);
      } else {
        setWhatsapp2faTestResult({ success: false, message: data.message || "Failed to send OTP" });
        toast.error(data.message || "Failed to send WhatsApp OTP");
      }
    } catch (err: any) {
      setWhatsapp2faTestResult({ success: false, message: err.message });
      toast.error("Error sending test OTP: " + err.message);
    } finally {
      setTestingWhatsapp2fa(false);
    }
  };

  // Live WhatsApp Test Sender state
  const [testPhone, setTestPhone] = useState("");
  const [selectedTestEvent, setSelectedTestEvent] = useState("sell_request");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [whatsappCategory, setWhatsappCategory] = useState("all");
  const [whatsappSearch, setWhatsappSearch] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  // Email Notification & Template state (29 Use Cases)
  const [emailCategory, setEmailCategory] = useState("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [expandedEmailEvents, setExpandedEmailEvents] = useState<Record<string, boolean>>({});
  const [testingEmailEventId, setTestingEmailEventId] = useState<string | null>(null);
  const [testEventRecipientEmail, setTestEventRecipientEmail] = useState("");
  const [previewEmailModal, setPreviewEmailModal] = useState<any>(null);

  const toggleEmailExpand = (id: string) => {
    setExpandedEmailEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllEmail = (eventsList: any[]) => {
    const all: Record<string, boolean> = {};
    eventsList.forEach((e) => {
      all[e.id] = true;
    });
    setExpandedEmailEvents(all);
  };

  const collapseAllEmail = () => {
    setExpandedEmailEvents({});
  };

  const handleTestEmailEvent = async (eventId: string) => {
    try {
      setTestingEmailEventId(eventId);
      const token = localStorage.getItem("adminToken");
      const targetEmail = testEventRecipientEmail.trim() || testSmtpEmail.trim() || settings.admin_notification_email || settings.smtp_user;
      const res = await fetch(`${API_URL}/api/admin/smtp/test-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          testEmail: targetEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `Test email for "${eventId}" sent successfully!`);
      } else {
        toast.error(data.message || data.error || "Failed to dispatch test email");
      }
    } catch (err: any) {
      toast.error("Error sending test email: " + err.message);
    } finally {
      setTestingEmailEventId(null);
    }
  };

  const handleResetEmailTemplate = (eventId: string) => {
    if (window.confirm("Reset this email template (subject, heading, body) back to system defaults?")) {
      setSettings((prev) => {
        const next = { ...prev };
        delete next[`email_tpl_${eventId}_subject`];
        delete next[`email_tpl_${eventId}_heading`];
        delete next[`email_tpl_${eventId}_body`];
        return next;
      });
      toast.success("Template reset to system default (click Save to persist)");
    }
  };

  const handleDeleteEmailTemplate = (eventId: string) => {
    if (window.confirm("Clear custom template overrides for this event?")) {
      setSettings((prev) => {
        const next = { ...prev };
        next[`email_tpl_${eventId}_subject`] = "";
        next[`email_tpl_${eventId}_heading`] = "";
        next[`email_tpl_${eventId}_body`] = "";
        return next;
      });
      toast.success("Custom template cleared (click Save to persist)");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = (eventsList: any[]) => {
    const all: Record<string, boolean> = {};
    eventsList.forEach((e) => {
      all[e.id] = true;
    });
    setExpandedEvents(all);
  };

  const collapseAll = () => {
    setExpandedEvents({});
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testPhone.trim()) {
      toast.error("Please enter a phone number to test");
      return;
    }
    await executeTestSend(selectedTestEvent, testPhone);
  };

  const handleTriggerSingleTest = async (eventId: string) => {
    if (!testPhone || !testPhone.trim()) {
      toast.error("Please enter a target phone number below to test");
      return;
    }
    await executeTestSend(eventId, testPhone);
  };

  const executeTestSend = async (eventId: string, phone: string) => {
    try {
      setIsSendingTest(true);
      setTestResult(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/whatsapp/test-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventType: eventId,
          phone: phone
        })
      });
      const data = await res.json();
      setTestResult(data);
      if (res.ok && data.success) {
        toast.success(data.mock ? "Simulated test notification dispatched (Test Mode)" : "WhatsApp message sent successfully!");
      } else {
        toast.error(data.message || "Failed to send test message");
      }
    } catch (err: any) {
      toast.error(err.message || "Error testing WhatsApp API");
    } finally {
      setIsSendingTest(false);
    }
  };

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

      // Pre-populate Google Workspace SMTP configuration for donotreply@selectt.in
      if (!settingsMap.smtp_host) settingsMap.smtp_host = "smtp.gmail.com";
      if (!settingsMap.smtp_port) settingsMap.smtp_port = "587";
      if (!settingsMap.smtp_user) settingsMap.smtp_user = "donotreply@selectt.in";
      if (!settingsMap.smtp_pass) settingsMap.smtp_pass = "fvks ldir ugpc mwxh";
      if (!settingsMap.smtp_from_name) settingsMap.smtp_from_name = "Selectt.";
      if (!settingsMap.smtp_from_email) settingsMap.smtp_from_email = "donotreply@selectt.in";
      if (!settingsMap.admin_notification_email) settingsMap.admin_notification_email = "donotreply@selectt.in";

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

  const handleTestImageKit = async () => {
    try {
      setTestingIk(true);
      setIkTestResult(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/imagekit/test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          publicKey: settings.imagekit_public_key,
          privateKey: settings.imagekit_private_key,
          urlEndpoint: settings.imagekit_url_endpoint
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIkTestResult({ success: true, message: data.message });
        toast.success("✅ ImageKit API connected successfully!");
      } else {
        setIkTestResult({ success: false, message: data.error || "Connection failed" });
        toast.error(`❌ ImageKit Error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setIkTestResult({ success: false, message: err.message });
      toast.error("ImageKit connection test failed");
    } finally {
      setTestingIk(false);
    }
  };

  const handleTestBunny = async () => {
    try {
      setTestingBunny(true);
      setBunnyTestResult(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/bunny/test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          libraryId: settings.bunny_stream_library_id,
          apiKey: settings.bunny_stream_api_key
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBunnyTestResult({ success: true, message: `${data.message} (Library: ${data.name})` });
        toast.success(`✅ Bunny Stream connected! Library: ${data.name}`);
      } else {
        setBunnyTestResult({ success: false, message: data.error || "Connection failed" });
        toast.error(`❌ Bunny Error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setBunnyTestResult({ success: false, message: err.message });
      toast.error("Bunny Stream connection test failed");
    } finally {
      setTestingBunny(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      setSmtpTestResult(null);
      const token = localStorage.getItem("adminToken");
      const targetEmail = testSmtpEmail.trim() || settings.admin_notification_email || settings.smtp_user;
      if (!targetEmail) {
        toast.error("Please enter a destination email address to receive the test email");
        setTestingSmtp(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/admin/smtp/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_user: settings.smtp_user,
          smtp_pass: settings.smtp_pass,
          smtp_from_email: settings.smtp_from_email,
          smtp_from_name: settings.smtp_from_name,
          test_to_email: targetEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({ success: true, message: data.message });
        toast.success(data.message || "Test email sent successfully!");
      } else {
        setSmtpTestResult({ success: false, message: data.error || "Failed to send test email" });
        toast.error(data.error || "Failed to send test email");
      }
    } catch (err: any) {
      setSmtpTestResult({ success: false, message: err.message });
      toast.error("SMTP test failed: " + err.message);
    } finally {
      setTestingSmtp(false);
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
            { id: "security", label: "🛡️ 2-Step Verification (2FA)" },
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

        {activeSection === "smtp" && (() => {
          const EMAIL_CATEGORIES = [
            { id: "all", name: "All Use Cases", count: 29 },
            { id: "sell", name: "🚗 Sell Car (5)", count: 5 },
            { id: "buy", name: "🛍️ Buy & Bookings (4)", count: 4 },
            { id: "test_drive", name: "🏎️ Test Drives (3)", count: 3 },
            { id: "finance", name: "🧮 Loans & Finance (3)", count: 3 },
            { id: "services", name: "🛡️ Services (4)", count: 4 },
            { id: "leads", name: "❤️ Leads (2)", count: 2 },
            { id: "auth", name: "🔐 Auth & OTP (2)", count: 2 },
            { id: "admin", name: "🚨 Admin Alerts (6)", count: 6 },
          ];

          const EMAIL_EVENTS = [
            // 🚗 1. CAR SELLING & VALUATION WORKFLOW
            {
              id: "sell_request",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "1. Sell Car Request Submitted (Under Review)",
              desc: "Sent to customer immediately when they submit their car for valuation/review on /sell-car",
              defaultSubject: "🚗 Your Sell Car Request for {{car_name}} is Under Review (ID: {{request_id}})",
              defaultHeading: "Sell Car Valuation Request Received",
              defaultLeadType: "Sell Car Workflow",
              defaultBody: "Hello {{customer_name}},\n\nThank you for choosing Selectt! We have received your car selling request for {{car_name}} (Request ID: {{request_id}}).\n\nOur certified automobile valuation team is reviewing your vehicle details and will generate a fair, AI-backed market price offer within 2 hours.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{customer_phone}}"],
              recipient: "Customer"
            },
            {
              id: "sell_inspection_booked",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "2. Car Evaluation / Inspection Scheduled",
              desc: "Sent to customer when home inspection or hub physical evaluation appointment is booked",
              defaultSubject: "📅 Doorstep Inspection Confirmed for {{car_name}}",
              defaultHeading: "Inspection Appointment Confirmed",
              defaultLeadType: "Sell Car Workflow",
              defaultBody: "Hello {{customer_name}},\n\nYour doorstep 200-point inspection appointment for {{car_name}} has been scheduled.\n\nDate & Time: {{date_slot}}\nLocation: {{location}}\nRequest ID: {{request_id}}\n\nOur certified inspector will arrive on time with complete diagnostic equipment.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{location}}", "{{request_id}}"],
              recipient: "Customer"
            },
            {
              id: "sell_request_approved",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "3. Car Approved & Listed in Catalog",
              desc: "Sent to seller when admin reviews and approves/publishes the car in live inventory",
              defaultSubject: "🎉 Congratulations! Your {{car_name}} is Live on Selectt",
              defaultHeading: "Vehicle Approved & Live in Catalog",
              defaultLeadType: "Sell Car Workflow",
              defaultBody: "Hello {{customer_name}},\n\nGreat news! Your vehicle {{car_name}} (ID: {{request_id}}) has passed quality inspection and is now actively listed in Selectt's inventory with verified inspection badges.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{status}}"],
              recipient: "Customer"
            },
            {
              id: "sell_car_sold",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "4. Listed Car Sold Out",
              desc: "Sent to seller when their listed vehicle is purchased and marked Sold Out",
              defaultSubject: "💰 Your {{car_name}} Has Been Sold! (₹{{sold_price}})",
              defaultHeading: "Vehicle Sold Successfully",
              defaultLeadType: "Sell Car Workflow",
              defaultBody: "Congratulations {{customer_name}},\n\nYour car {{car_name}} has been sold for ₹{{sold_price}}! Our operations executive will contact you to complete instantaneous bank settlement and hassle-free RC transfer.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{sold_price}}", "{{request_id}}"],
              recipient: "Customer"
            },
            {
              id: "sell_request_rejected",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "5. Sell Car Request Update / Rejected",
              desc: "Sent to customer if vehicle does not meet listing criteria or is cancelled",
              defaultSubject: "Update Regarding Your Sell Car Request for {{car_name}}",
              defaultHeading: "Sell Request Status Update",
              defaultLeadType: "Sell Car Workflow",
              defaultBody: "Hello {{customer_name}},\n\nWe reviewed your submission for {{car_name}} (Request ID: {{request_id}}). Unfortunately, we could not approve the listing due to: {{reason}}.\n\nPlease contact our dedicated seller support if you have any questions.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{reason}}"],
              recipient: "Customer"
            },

            // 🛍️ 2. CAR BUYING & BOOKINGS
            {
              id: "car_booking",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "6. Car Token Booking / Deposit Paid",
              desc: "Sent when customer pays online booking deposit on frontend",
              defaultSubject: "🎉 Booking Confirmed: ₹{{amount}} Token Received for {{car_name}}",
              defaultHeading: "Car Booking Token Confirmed",
              defaultLeadType: "Buy & Bookings",
              defaultBody: "Congratulations {{customer_name}}!\n\nYour booking deposit of ₹{{amount}} for {{car_name}} (Booking ID: {{booking_id}}) has been successfully received.\n\nThe vehicle is reserved exclusively for you. Our relationship manager will coordinate final delivery and paperwork.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{amount}}", "{{booking_id}}"],
              recipient: "Customer"
            },
            {
              id: "booking_confirmed",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "7. Booking Confirmed by Hub / Advance Cleared",
              desc: "Sent when dealer/admin confirms inventory reservation and paperwork readiness",
              defaultSubject: "✅ Car Reservation Confirmed by Selectt Hub (ID: {{booking_id}})",
              defaultHeading: "Hub Reservation Cleared",
              defaultLeadType: "Buy & Bookings",
              defaultBody: "Hello {{customer_name}},\n\nYour car booking for {{car_name}} has been verified and confirmed by our Hub Team.\n\nDelivery Hub: {{hub_location}}\nBooking ID: {{booking_id}}\n\nYour car is being prepped with our 200-point detailing checklist.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{booking_id}}", "{{hub_location}}"],
              recipient: "Customer"
            },
            {
              id: "car_delivered",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "8. Car Delivered / Handover Completed",
              desc: "Sent when customer takes delivery with warranty and ownership documents",
              defaultSubject: "🚗 Congratulations on Your New {{car_name}}!",
              defaultHeading: "Delivery & Handover Complete",
              defaultLeadType: "Buy & Bookings",
              defaultBody: "Dear {{customer_name}},\n\nCongratulations on driving home your certified {{car_name}} (Reg: {{reg_no}})!\n\nYour 1-Year Selectt Assured Warranty and 7-day return guarantee are now active. Thank you for choosing Selectt!",
              vars: ["{{customer_name}}", "{{car_name}}", "{{reg_no}}"],
              recipient: "Customer"
            },
            {
              id: "booking_cancelled",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "9. Booking Cancelled / Refund Processed",
              desc: "Sent if booking is cancelled and refund status is updated",
              defaultSubject: "Booking Cancellation & Refund Status (ID: {{booking_id}})",
              defaultHeading: "Booking Cancelled & Refund Update",
              defaultLeadType: "Buy & Bookings",
              defaultBody: "Hello {{customer_name}},\n\nYour booking for {{car_name}} (ID: {{booking_id}}) has been cancelled.\n\nRefund Status: {{refund_status}}\n\nAny refundable deposit will be credited back to your original payment source within 3-5 business days.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{booking_id}}", "{{refund_status}}"],
              recipient: "Customer"
            },

            // 🏎️ 3. TEST DRIVES
            {
              id: "test_drive",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "10. Test Drive Appointment Scheduled",
              desc: "Sent when customer schedules a test drive appointment on a car",
              defaultSubject: "🏎️ Your Test Drive for {{car_name}} is Scheduled",
              defaultHeading: "Test Drive Appointment Scheduled",
              defaultLeadType: "Test Drives",
              defaultBody: "Hello {{customer_name}},\n\nYour test drive appointment for {{car_name}} is scheduled.\n\nDate & Time: {{date_slot}}\nLocation: {{location}}\n\nOur representative will meet you at the scheduled time.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{location}}"],
              recipient: "Customer"
            },
            {
              id: "test_drive_confirmed",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "11. Test Drive Confirmed / Executive Assigned",
              desc: "Sent with hub executive contact details when appointment is confirmed",
              defaultSubject: "✅ Test Drive Confirmed for {{car_name}}",
              defaultHeading: "Executive Assigned for Test Drive",
              defaultLeadType: "Test Drives",
              defaultBody: "Hello {{customer_name}},\n\nYour test drive on {{date_slot}} for {{car_name}} has been confirmed. Your assigned hub executive is {{executive_name}}, who will assist you during your drive.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{executive_name}}"],
              recipient: "Customer"
            },
            {
              id: "test_drive_completed",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "12. Test Drive Completed & Feedback Request",
              desc: "Sent after test drive to collect ratings and provide booking link",
              defaultSubject: "How Was Your Test Drive with {{car_name}}?",
              defaultHeading: "Test Drive Completed",
              defaultLeadType: "Test Drives",
              defaultBody: "Hello {{customer_name}},\n\nThank you for test driving the {{car_name}} with Selectt! We would love to hear your feedback or assist you if you are ready to reserve this vehicle.",
              vars: ["{{customer_name}}", "{{car_name}}"],
              recipient: "Customer"
            },

            // 🧮 4. FINANCIAL SERVICES & LOANS
            {
              id: "emi_query",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "13. Used Car Loan / EMI Application Submitted",
              desc: "Sent when customer applies for used car loan or EMI calculation inquiry",
              defaultSubject: "💳 Used Car Loan Application Received for {{car_name}}",
              defaultHeading: "Car Finance Application Received",
              defaultLeadType: "Loans & Finance",
              defaultBody: "Hello {{customer_name}},\n\nWe have received your used car loan inquiry for {{car_name}}.\n\nRequested Loan Amount: ₹{{loan_amount}}\nEstimated Monthly EMI: ₹{{monthly_emi}}\n\nOur finance partners will process your pre-approval shortly.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{loan_amount}}", "{{monthly_emi}}"],
              recipient: "Customer"
            },
            {
              id: "loan_approved",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "14. Car Loan In-Principle Approved",
              desc: "Sent when partner banking/NBFC verifies eligibility and issues pre-approval",
              defaultSubject: "🎉 Congratulations! Your Car Loan of ₹{{loan_amount}} is Approved",
              defaultHeading: "Car Loan In-Principle Approval",
              defaultLeadType: "Loans & Finance",
              defaultBody: "Great news {{customer_name}}!\n\nYour used car loan application for ₹{{loan_amount}} has been approved in-principle at {{interest_rate}} interest rate. Please submit your KYC documents to finalize disbursement.",
              vars: ["{{customer_name}}", "{{loan_amount}}", "{{interest_rate}}"],
              recipient: "Customer"
            },
            {
              id: "loan_rejected",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "15. Loan Application Status Update",
              desc: "Sent if loan document verification requires additional details",
              defaultSubject: "Update on Your Car Loan Application (No: {{application_no}})",
              defaultHeading: "Loan Application Update",
              defaultLeadType: "Loans & Finance",
              defaultBody: "Hello {{customer_name}},\n\nThere is an update on your loan application (No: {{application_no}}). Additional documentation required: {{remarks}}.\n\nPlease contact our finance team to proceed.",
              vars: ["{{customer_name}}", "{{application_no}}", "{{remarks}}"],
              recipient: "Customer"
            },

            // 🛡️ 5. VALUE ADDED SERVICES
            {
              id: "insurance_query",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "16. Comprehensive Car Insurance Quote Request",
              desc: "Sent when customer requests car insurance renewal or policy inquiry",
              defaultSubject: "🛡️ Car Insurance Quote Request for {{car_name}} ({{reg_no}})",
              defaultHeading: "Insurance Quote Inquiry Received",
              defaultLeadType: "Services & Insurance",
              defaultBody: "Hello {{customer_name}},\n\nWe have received your insurance quote request for {{car_name}} (Registration: {{reg_no}}). Our insurance desk will send customized quotes with up to 50% NCB savings shortly.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{reg_no}}"],
              recipient: "Customer"
            },
            {
              id: "warranty_inquiry",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "17. Selectt Assured Extended Warranty Inquiry",
              desc: "Sent when customer requests 1-year comprehensive warranty coverage quote",
              defaultSubject: "🛡️ Selectt Assured 1-Year Comprehensive Warranty Info for {{car_name}}",
              defaultHeading: "Extended Warranty Inquiry Received",
              defaultLeadType: "Services & Insurance",
              defaultBody: "Hello {{customer_name}},\n\nThank you for inquiring about Selectt Assured Extended Warranty for {{car_name}}. Our warranty advisor will share comprehensive coverage details covering 500+ mechanical and electrical components.",
              vars: ["{{customer_name}}", "{{car_name}}"],
              recipient: "Customer"
            },
            {
              id: "buyback_inquiry",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "18. Assured Buyback Guarantee Inquiry",
              desc: "Sent when customer inquires about guaranteed 1-year buyback value program",
              defaultSubject: "🔄 Assured Buyback Guarantee Valuation for {{car_name}}",
              defaultHeading: "Buyback Guarantee Inquiry Received",
              defaultLeadType: "Services & Insurance",
              defaultBody: "Hello {{customer_name}},\n\nWe have received your inquiry regarding our Assured Buyback Guarantee for {{car_name}}. Our team will provide your guaranteed 1-year resale value breakdown.",
              vars: ["{{customer_name}}", "{{car_name}}"],
              recipient: "Customer"
            },
            {
              id: "challan_paid",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "19. Traffic e-Challan Paid & Receipt",
              desc: "Sent with transaction receipt when user clears traffic challan on Selectt",
              defaultSubject: "Receipt: Traffic e-Challan {{challan_no}} Paid Successfully",
              defaultHeading: "e-Challan Payment Receipt",
              defaultLeadType: "Services & Insurance",
              defaultBody: "Payment Confirmation:\n\nHello {{customer_name}}, your traffic e-challan (No: {{challan_no}}) of ₹{{amount}} has been successfully settled with the traffic authority. Please keep this email for your records.",
              vars: ["{{customer_name}}", "{{challan_no}}", "{{amount}}"],
              recipient: "Customer"
            },

            // ❤️ 6. LEADS & RETENTION
            {
              id: "wishlist",
              category: "leads",
              categoryName: "❤️ Leads & Retention",
              title: "20. Wishlist Price Drop / Stock Alert",
              desc: "Sent when a saved car gets a price reduction or limited-time deal",
              defaultSubject: "⚡ Price Drop Alert: {{car_name}} is Now ₹{{new_price}}!",
              defaultHeading: "Price Drop Alert on Saved Car",
              defaultLeadType: "Leads & Retention",
              defaultBody: "Great news {{customer_name}}!\n\nA car you saved in your wishlist ({{car_name}}) has just had a price reduction. New Price: ₹{{new_price}}.\n\nBook before it sells out!",
              vars: ["{{customer_name}}", "{{car_name}}", "{{new_price}}"],
              recipient: "Customer"
            },
            {
              id: "lead_inquiry",
              category: "leads",
              categoryName: "❤️ Leads & Retention",
              title: "21. General Customer Assistance / Callback Request",
              desc: "Sent when customer submits 'Need Assistance' or contact form query",
              defaultSubject: "We Received Your Inquiry Regarding {{subject}}",
              defaultHeading: "Customer Assistance Request",
              defaultLeadType: "Leads & Retention",
              defaultBody: "Hello {{customer_name}},\n\nThank you for reaching out to Selectt regarding {{subject}}. A senior automotive specialist will contact you on {{phone}} shortly.",
              vars: ["{{customer_name}}", "{{phone}}", "{{subject}}"],
              recipient: "Customer"
            },

            // 🔐 7. AUTH & ONBOARDING
            {
              id: "auth_otp",
              category: "auth",
              categoryName: "🔐 Auth & Onboarding",
              title: "22. Email / User Verification OTP",
              desc: "6-digit OTP verification code sent to customer email on Login/Signup",
              defaultSubject: "🔐 {{otp}} is Your Selectt Verification Code",
              defaultHeading: "Selectt Verification OTP",
              defaultLeadType: "Auth & Onboarding",
              defaultBody: "Hello,\n\nYour one-time verification code is {{otp}}. This code is valid for 10 minutes. For your security, do not share this code with anyone.",
              vars: ["{{otp}}", "{{customer_name}}"],
              recipient: "Customer"
            },
            {
              id: "welcome_customer",
              category: "auth",
              categoryName: "🔐 Auth & Onboarding",
              title: "23. New Customer Welcome & Account Created",
              desc: "Sent once upon first successful registration / login",
              defaultSubject: "👋 Welcome to Selectt, {{customer_name}}!",
              defaultHeading: "Welcome to India's Trusted Pre-Owned Car Platform",
              defaultLeadType: "Auth & Onboarding",
              defaultBody: "Welcome to Selectt, {{customer_name}}!\n\nYour account has been successfully created. You can now browse 100% certified pre-owned cars, save favorites, book doorstep test drives, and get transparent pricing.",
              vars: ["{{customer_name}}"],
              recipient: "Customer"
            },

            // 🚨 8. ADMIN ALERTS
            {
              id: "admin_sell_request",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "24. Admin Alert: New Car Sell Request",
              desc: "Instant email ping to Admin when any customer submits a car to sell",
              defaultSubject: "🚨 [NEW SELL CAR] {{customer_name}} Submitted {{car_name}} (ID: {{request_id}})",
              defaultHeading: "Admin Notification: New Sell Car Submission",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "A new car valuation request has been submitted on the website:\n\nCustomer: {{customer_name}}\nPhone: {{customer_phone}}\nCar: {{car_name}}\nRequest ID: {{request_id}}\n\nPlease review on the admin portal.",
              vars: ["{{customer_name}}", "{{customer_phone}}", "{{car_name}}", "{{request_id}}"],
              recipient: "Admin Staff"
            },
            {
              id: "admin_booking",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "25. Admin Alert: New Car Booking & Payment",
              desc: "Instant email ping to Admin when token advance is paid",
              defaultSubject: "🚨 [TOKEN PAID] ₹{{amount}} Received for {{car_name}} (ID: {{booking_id}})",
              defaultHeading: "Admin Notification: New Token Advance Paid",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "A customer has paid a booking token advance:\n\nCustomer: {{customer_name}}\nCar: {{car_name}}\nToken Amount: ₹{{amount}}\nBooking ID: {{booking_id}}\n\nPlease reserve inventory and assign relationship manager.",
              vars: ["{{customer_name}}", "{{car_name}}", "{{amount}}", "{{booking_id}}"],
              recipient: "Admin Staff"
            },
            {
              id: "admin_test_drive",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "26. Admin Alert: New Test Drive Appointment",
              desc: "Instant email ping to Admin when a test drive slot is booked",
              defaultSubject: "🚨 [TEST DRIVE] {{customer_name}} Booked Test Drive for {{car_name}}",
              defaultHeading: "Admin Notification: New Test Drive Booking",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "A test drive has been booked:\n\nCustomer: {{customer_name}}\nPhone: {{customer_phone}}\nCar: {{car_name}}\nTime Slot: {{date_slot}}\n\nPlease assign an executive.",
              vars: ["{{customer_name}}", "{{customer_phone}}", "{{car_name}}", "{{date_slot}}"],
              recipient: "Admin Staff"
            },
            {
              id: "admin_loan",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "27. Admin Alert: New Loan Application",
              desc: "Instant email ping to Admin when a loan application is submitted",
              defaultSubject: "🚨 [LOAN APP] {{customer_name}} Applied for ₹{{loan_amount}} Loan",
              defaultHeading: "Admin Notification: New Car Loan Inquiry",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "New used car loan application received:\n\nApplicant: {{customer_name}}\nPhone: {{phone}}\nLoan Amount: ₹{{loan_amount}}\n\nReview in Admin Portal.",
              vars: ["{{customer_name}}", "{{phone}}", "{{loan_amount}}"],
              recipient: "Admin Staff"
            },
            {
              id: "admin_insurance",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "28. Admin Alert: New Insurance Quote Lead",
              desc: "Instant email ping to Admin when insurance quote is requested",
              defaultSubject: "🚨 [INSURANCE] New Quote Request for Reg {{reg_no}}",
              defaultHeading: "Admin Notification: New Insurance Quote Lead",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "A customer requested an insurance quote:\n\nCustomer: {{customer_name}}\nPhone: {{phone}}\nCar Reg No: {{reg_no}}\n\nFollow up with insurance quotes.",
              vars: ["{{customer_name}}", "{{phone}}", "{{reg_no}}"],
              recipient: "Admin Staff"
            },
            {
              id: "admin_contact",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "29. Admin Alert: New Customer Contact / Assistance Lead",
              desc: "Instant email ping to Admin when someone requests a callback",
              defaultSubject: "🚨 [CALLBACK LEAD] {{customer_name}} - {{subject}}",
              defaultHeading: "Admin Notification: Customer Callback Request",
              defaultLeadType: "Admin Staff Alert",
              defaultBody: "A new callback request was submitted on the contact form:\n\nName: {{customer_name}}\nPhone: {{phone}}\nSubject/Message: {{subject}}\n\nRespond promptly.",
              vars: ["{{customer_name}}", "{{phone}}", "{{subject}}"],
              recipient: "Admin Staff"
            }
          ];

          const filteredEmailEvents = EMAIL_EVENTS.filter((evt) => {
            const matchesCategory = emailCategory === "all" || evt.category === emailCategory;
            const matchesSearch = !emailSearch ||
              evt.title.toLowerCase().includes(emailSearch.toLowerCase()) ||
              evt.desc.toLowerCase().includes(emailSearch.toLowerCase()) ||
              evt.defaultSubject.toLowerCase().includes(emailSearch.toLowerCase()) ||
              (settings[`email_tpl_${evt.id}_subject`] || "").toLowerCase().includes(emailSearch.toLowerCase()) ||
              (settings[`email_tpl_${evt.id}_body`] || "").toLowerCase().includes(emailSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          });

          return (
            <div className="space-y-6">
              {/* 1. SMTP Server Configuration Card */}
              <ComponentCard title="SMTP & Email Server Configuration">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Master Switch & Google Workspace Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-emerald-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                        ✉️
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-gray-900 dark:text-white">
                            Google Workspace SMTP: <span className="text-indigo-600 dark:text-indigo-400">donotreply@selectt.in</span>
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            Connected & Live
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 font-medium">
                          Automated HTML transactional notifications active across all 29 customer and admin workflows.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs shrink-0 self-start sm:self-auto">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="email_auto_notifications_enabled"
                          className="sr-only peer"
                          checked={settings.email_auto_notifications_enabled !== "false"}
                          onChange={(e) => handleChange("email_auto_notifications_enabled", e.target.checked ? "true" : "false")}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                      </label>
                      <label htmlFor="email_auto_notifications_enabled" className="text-xs font-black text-gray-900 dark:text-white cursor-pointer select-none">
                        Master Email Trigger: {settings.email_auto_notifications_enabled !== "false" ? <span className="text-emerald-600">ON</span> : <span className="text-rose-600">OFF</span>}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input
                        type="text"
                        placeholder="e.g. smtp.gmail.com or mail.selectt.in"
                        value={settings.smtp_host || ""}
                        onChange={(e) => handleChange("smtp_host", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 587 or 465"
                        value={settings.smtp_port || ""}
                        onChange={(e) => handleChange("smtp_port", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SMTP Username / Login Email</Label>
                      <Input
                        type="text"
                        placeholder="e.g. donotreply@selectt.in"
                        value={settings.smtp_user || ""}
                        onChange={(e) => handleChange("smtp_user", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SMTP Password / App Password</Label>
                      <Input
                        type="password"
                        placeholder="App Password (e.g. fvks ldir ugpc mwxh)"
                        value={settings.smtp_pass || ""}
                        onChange={(e) => handleChange("smtp_pass", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Admin Notification Email (Receives Lead & Form Alerts)</Label>
                      <Input
                        type="email"
                        placeholder="e.g. donotreply@selectt.in or admin@selectt.in"
                        value={settings.admin_notification_email || ""}
                        onChange={(e) => handleChange("admin_notification_email", e.target.value)}
                      />
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">Leave empty to fall back to SMTP Username or Contact Email.</p>
                    </div>
                    <div>
                      <Label>Sender Name (From Name)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Selectt."
                        value={settings.smtp_from_name || ""}
                        onChange={(e) => handleChange("smtp_from_name", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Sender Email Address (From Address)</Label>
                      <Input
                        type="email"
                        placeholder="e.g. donotreply@selectt.in"
                        value={settings.smtp_from_email || ""}
                        onChange={(e) => handleChange("smtp_from_email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save SMTP Settings"}</Button>
                  </div>
                </form>
              </ComponentCard>

              {/* 2. Global Test SMTP Connection Card */}
              <ComponentCard title="🧪 Live SMTP Server Diagnostic & Test Dispatch">
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Send a test ping directly using the SMTP server credentials above to verify Google Workspace TLS handshake and inbox delivery.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter destination email for test (e.g. donotreply@selectt.in or your personal email)"
                        value={testSmtpEmail}
                        onChange={(e) => setTestSmtpEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={testingSmtp}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap text-sm cursor-pointer"
                    >
                      {testingSmtp ? (
                        <>
                          <span className="animate-spin text-base">⏳</span> Sending Test...
                        </>
                      ) : (
                        <>
                          <span>✉️</span> Send Test Email
                        </>
                      )}
                    </button>
                  </div>

                  {smtpTestResult && (
                    <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                      smtpTestResult.success 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                    }`}>
                      <span className="text-xl">{smtpTestResult.success ? "✅" : "❌"}</span>
                      <div>
                        <p className="font-bold">{smtpTestResult.success ? "SMTP Connection Successful" : "SMTP Connection Failed"}</p>
                        <p className="text-xs mt-0.5 opacity-90 font-medium">{smtpTestResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ComponentCard>

              {/* 3. EMAIL NOTIFICATION TEMPLATES (29 USE CASES) */}
              <ComponentCard title="✉️ Email Notification Templates (1 to 29 Use Cases)">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Global Header & Test Recipient Configuration */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-gray-800/70 border border-slate-200 dark:border-gray-700 rounded-2xl">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        ⚡ Customized Email Templates for All 29 Platform Use Cases
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Configure custom subject lines, banner titles, and HTML/text bodies with dynamic variable tokens for each transaction event.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="w-full md:w-64">
                        <Input
                          type="email"
                          placeholder="🎯 Test destination email (optional)"
                          value={testEventRecipientEmail}
                          onChange={(e) => setTestEventRecipientEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search and Category Filter Pills */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-full md:w-72">
                      <Input
                        type="text"
                        placeholder="🔍 Search email templates or keywords..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => expandAllEmail(filteredEmailEvents)}
                        className="px-3 py-1.5 text-xs font-black bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>📂 Expand All (29)</span>
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllEmail}
                        className="px-3 py-1.5 text-xs font-black bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>📁 Collapse All</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    {EMAIL_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEmailCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          emailCategory === cat.id
                            ? "bg-[#0C1B33] text-white shadow-sm ring-2 ring-indigo-500/30"
                            : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* 29 Event Cards List */}
                  <div className="space-y-4 pt-2">
                    {filteredEmailEvents.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-500">No email templates match your search or filter.</p>
                      </div>
                    ) : (
                      filteredEmailEvents.map((evt) => {
                        const enabledKey = `email_event_${evt.id}_enabled`;
                        const subjectKey = `email_tpl_${evt.id}_subject`;
                        const headingKey = `email_tpl_${evt.id}_heading`;
                        const bodyKey = `email_tpl_${evt.id}_body`;

                        const isEnabled = settings[enabledKey] !== "false";
                        const isExpanded = expandedEmailEvents[evt.id] !== false; // default expanded
                        const hasCustomSubject = !!settings[subjectKey];
                        const hasCustomHeading = !!settings[headingKey];
                        const hasCustomBody = !!settings[bodyKey];
                        const isCustomized = hasCustomSubject || hasCustomHeading || hasCustomBody;

                        const currentSubject = settings[subjectKey] || evt.defaultSubject;
                        const currentHeading = settings[headingKey] || evt.defaultHeading;
                        const currentBody = settings[bodyKey] || evt.defaultBody;

                        return (
                          <div
                            key={evt.id}
                            className={`p-4 md:p-5 rounded-2xl border transition-all space-y-4 ${
                              isEnabled
                                ? "bg-white dark:bg-gray-800/80 border-slate-200/90 dark:border-gray-700 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600"
                                : "bg-gray-50/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-75"
                            }`}
                          >
                            {/* Header row: Toggle, Title, Badges, Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-gray-700/60 pb-3">
                              {/* Left: Switch + Event Info */}
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    id={enabledKey}
                                    className="sr-only peer"
                                    checked={isEnabled}
                                    onChange={(e) => handleChange(enabledKey, e.target.checked ? "true" : "false")}
                                  />
                                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                </label>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <label htmlFor={enabledKey} className="text-sm font-extrabold text-gray-900 dark:text-white cursor-pointer">
                                      {evt.title}
                                    </label>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                                      {evt.categoryName}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                      evt.recipient === "Customer"
                                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                                    }`}>
                                      👤 {evt.recipient}
                                    </span>
                                    {isCustomized && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        ✏️ Customized
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{evt.desc}</p>
                                </div>
                              </div>

                              {/* Right: Quick Action Buttons */}
                              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                                {/* Send Live Test Email */}
                                <button
                                  type="button"
                                  disabled={testingEmailEventId === evt.id}
                                  onClick={() => handleTestEmailEvent(evt.id)}
                                  className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {testingEmailEventId === evt.id ? (
                                    <>
                                      <span className="animate-spin text-xs">⏳</span> Sending...
                                    </>
                                  ) : (
                                    <>
                                      <span>⚡ Send Test</span>
                                    </>
                                  )}
                                </button>

                                {/* Preview Modal Trigger */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewEmailModal({
                                    title: evt.title,
                                    subject: currentSubject,
                                    heading: currentHeading,
                                    body: currentBody,
                                    leadType: evt.defaultLeadType,
                                    recipient: evt.recipient
                                  })}
                                  className="px-2.5 py-1.5 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>👁️ Preview</span>
                                </button>

                                {/* Reset to Default */}
                                {isCustomized && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetEmailTemplate(evt.id)}
                                    className="px-2 py-1.5 text-[11px] font-bold bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 rounded-lg transition-all cursor-pointer"
                                    title="Reset template to system defaults"
                                  >
                                    🔄 Reset
                                  </button>
                                )}

                                {/* Delete / Clear Override */}
                                {isCustomized && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEmailTemplate(evt.id)}
                                    className="px-2 py-1.5 text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg transition-all cursor-pointer"
                                    title="Clear custom overrides"
                                  >
                                    🗑️ Clear
                                  </button>
                                )}

                                {/* Expand/Collapse Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleEmailExpand(evt.id)}
                                  className={`px-2.5 py-1.5 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                    isExpanded
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{isExpanded ? "▲ Edit" : "▼ Edit"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Collapsed Preview Summary */}
                            {!isExpanded && (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
                                <div className="truncate flex items-center gap-1.5">
                                  <span className="font-bold text-gray-500">Subject:</span>
                                  <span className="font-mono text-gray-900 dark:text-gray-200 truncate">{currentSubject}</span>
                                </div>
                                <span className="text-[11px] text-gray-400 shrink-0 italic">Click "Edit" to modify template text & dynamic tags</span>
                              </div>
                            )}

                            {/* Expanded Template Editor & Dynamic Tokens */}
                            {isExpanded && (
                              <div className="space-y-4 pt-1 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Subject Line */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <Label>Email Subject Line</Label>
                                      {hasCustomSubject ? (
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Customized</span>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 font-medium">Default System Subject</span>
                                      )}
                                    </div>
                                    <Input
                                      type="text"
                                      placeholder={evt.defaultSubject}
                                      value={settings[subjectKey] || ""}
                                      onChange={(e) => handleChange(subjectKey, e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      Default: <code className="font-mono text-gray-600 dark:text-gray-300">{evt.defaultSubject}</code>
                                    </p>
                                  </div>

                                  {/* Header Title */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <Label>Email Header Banner Title</Label>
                                      {hasCustomHeading ? (
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Customized</span>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 font-medium">Default System Heading</span>
                                      )}
                                    </div>
                                    <Input
                                      type="text"
                                      placeholder={evt.defaultHeading}
                                      value={settings[headingKey] || ""}
                                      onChange={(e) => handleChange(headingKey, e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      Default: <code className="font-mono text-gray-600 dark:text-gray-300">{evt.defaultHeading}</code>
                                    </p>
                                  </div>
                                </div>

                                {/* Body Textarea */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <Label>Email Message Body (Text / HTML)</Label>
                                    {hasCustomBody ? (
                                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Customized Body</span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-medium">Default System Body</span>
                                    )}
                                  </div>
                                  <textarea
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-xs md:text-sm text-gray-800 dark:text-gray-200 focus:border-indigo-500 focus:outline-none font-mono leading-relaxed"
                                    placeholder={evt.defaultBody}
                                    value={settings[bodyKey] || ""}
                                    onChange={(e) => handleChange(bodyKey, e.target.value)}
                                  />
                                </div>

                                {/* Variable Tokens Chip Bar */}
                                <div className="p-3 bg-slate-50 dark:bg-gray-900/60 rounded-xl border border-slate-200/80 dark:border-gray-700/80 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                      ⚡ Click a token to append to body or copy:
                                    </span>
                                    <span className="text-[10px] text-gray-400">Auto-substituted on send</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {evt.vars.map((v) => (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() => {
                                          const prevVal = settings[bodyKey] !== undefined ? settings[bodyKey] : evt.defaultBody;
                                          handleChange(bodyKey, `${prevVal} ${v}`);
                                          toast.success(`Appended ${v} to body!`);
                                        }}
                                        className="px-2 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 rounded-md font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                                        title={`Click to append ${v} into body`}
                                      >
                                        + {v}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving Templates..." : "Save All Email Templates"}
                    </Button>
                  </div>
                </form>
              </ComponentCard>

              {/* 4. Live Email HTML Modal Preview */}
              {previewEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                      <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">
                          ✉️ Live HTML Email Preview
                        </h3>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{previewEmailModal.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewEmailModal(null)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center cursor-pointer transition-all"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-gray-950 space-y-4">
                      {/* Email Client Header Simulator */}
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                        <p><span className="font-bold text-gray-500">From:</span> Selectt. &lt;donotreply@selectt.in&gt;</p>
                        <p><span className="font-bold text-gray-500">Subject:</span> <span className="font-bold text-gray-900 dark:text-white">{previewEmailModal.subject}</span></p>
                        <p><span className="font-bold text-gray-500">To:</span> {previewEmailModal.recipient === "Customer" ? "customer@example.com" : "admin@selectt.in"}</p>
                      </div>

                      {/* Brand HTML Container */}
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 max-w-lg mx-auto">
                        {/* Header Banner */}
                        <div className="bg-[#0C1B33] p-6 text-center border-b-4 border-[#00C9AF]">
                          <h2 className="text-lg font-black text-[#00C9AF] m-0">
                            {previewEmailModal.heading}
                          </h2>
                          <span className="inline-block mt-2 bg-[#00C9AF]/20 text-[#00C9AF] border border-[#00C9AF]/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {previewEmailModal.leadType}
                          </span>
                        </div>

                        {/* Body Container */}
                        <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
                          <div className="p-4 bg-slate-50 border-l-4 border-[#00C9AF] rounded-lg whitespace-pre-wrap font-sans">
                            {previewEmailModal.body}
                          </div>

                          <div className="text-center pt-2">
                            <span className="inline-block bg-[#00C9AF] text-[#0C1B33] font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer">
                              ⚡ View Details on Selectt
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                          Selectt India • 100% Certified Pre-Owned Cars • Automated Dispatch via SMTP
                        </div>
                      </div>
                    </div>

                    <div className="p-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewEmailModal(null)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Close Preview
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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

        {activeSection === "whatsapp" && (() => {
          const GALLABOX_ACCOUNT_APPROVED_TEMPLATES = [
            // Core Transactional & Workflow Triggers
            { name: "customer_got_sell_price_for_their_car", type: "MARKETING", desc: "Sell Car Price Offer / Valuation Ready" },
            { name: "car_booking_confirmation", type: "MARKETING", desc: "Car Token Advance / Booking Confirmed" },
            { name: "schedule_visit_confim", type: "MARKETING", desc: "Showroom Visit / Test Drive Confirmed" },
            { name: "price_drop_message", type: "MARKETING", desc: "Price Drop Alert on Saved / Wishlisted Cars" },
            { name: "try_to_help_you", type: "MARKETING", desc: "Customer Inquiry Support & Doubt Help" },
            { name: "otp_template_name", type: "AUTHENTICATION", desc: "User Authentication & Verification OTP" },
            { name: "hi_message", type: "MARKETING", desc: "Welcome & Initial Greeting Message" },
            { name: "happy_customers_clinch", type: "MARKETING", desc: "Customer NPS & Handover Review" },
            { name: "final_happy_customers_clinch_clone", type: "MARKETING", desc: "Delivery Handover & Feedback Review (Clone)" },
            { name: "final_happy_customers_clinch_clone_clone", type: "MARKETING", desc: "Delivery Handover & Review (Variant 2)" },

            // Utility & Transaction Updates
            { name: "sequenceutlity_1", type: "UTILITY", desc: "Utility & Insurance Transaction Update" },
            { name: "sequence_utility2", type: "UTILITY", desc: "Utility & Extended Warranty Update" },
            { name: "sequence_ultility4", type: "UTILITY", desc: "Utility & Assured Buyback Update" },
            { name: "sequenceutlity8", type: "UTILITY", desc: "Utility & Traffic e-Challan Receipt" },

            // High Intent Lead & Loan Sequences
            { name: "hot_lead_sequence_1_2026", type: "MARKETING", desc: "High-intent Buyer & Finance Application 1" },
            { name: "hot_lead_sequence_2_2026", type: "MARKETING", desc: "High-intent Buyer Follow-up 2" },
            { name: "hot_lead_sequence_3_2026", type: "MARKETING", desc: "High-intent Buyer & Loan Approval Notice 3" },
            { name: "hot_lead_sequence_4_2026", type: "MARKETING", desc: "High-intent Buyer Follow-up 4" },
            { name: "hot_lead_sequence_5_2026", type: "MARKETING", desc: "High-intent Buyer Follow-up 5" },
            { name: "hot_lead_sequence_6_2026", type: "MARKETING", desc: "High-intent Buyer Follow-up 6" },

            // Visited Hub / Test Drive Follow-up Sequences
            { name: "visted_sequence_1", type: "MARKETING", desc: "Visited Hub Follow-up Sequence 1" },
            { name: "visited_sequence_2", type: "MARKETING", desc: "Visited Hub Follow-up Sequence 2" },
            { name: "visited_sequence_3", type: "MARKETING", desc: "Visited Hub Follow-up Sequence 3" },
            { name: "visted_sequence_5", type: "MARKETING", desc: "Visited Hub Follow-up Sequence 5" },
            { name: "visted_sequence_6", type: "MARKETING", desc: "Visited Hub Completed Follow-up Sequence 6" },

            // Cold Lead Re-activation Sequences
            { name: "cold_seqeunce_1", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 1" },
            { name: "cold_seqeunce_2", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 2" },
            { name: "cold_seqeunce_3", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 3" },
            { name: "cold_seqeunce_4", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 4" },
            { name: "cold_seqeunce_5", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 5" },
            { name: "cold_seqeunce_6", type: "MARKETING", desc: "Cold Lead Re-activation Sequence 6" },

            // Promotional, Broadcast & Call Permission Campaigns
            { name: "independence_day2026", type: "MARKETING", desc: "Independence Day / Festive Promotional Offer" },
            { name: "summer_sale_may", type: "MARKETING", desc: "Summer Sale & Season Offer Broadcast" },
            { name: "free_this_saturday_or_sunday_", type: "MARKETING", desc: "Weekend Test Drive & Visit Invitation" },
            { name: "final_followup_march_2026_clone", type: "MARKETING", desc: "Final Lead Nurture & Closing Follow-up" },
            { name: "gb_call_permission_request", type: "MARKETING", desc: "WhatsApp & Voice Call Permission Request" },

            // Automated Nurturing Sequences
            { name: "sequence2", type: "MARKETING", desc: "Automated Nurture Sequence 2" },
            { name: "sequence5", type: "MARKETING", desc: "Automated Nurture Sequence 5" },
            { name: "sequence6", type: "MARKETING", desc: "Automated Nurture Sequence 6" },
            { name: "sequence7", type: "MARKETING", desc: "Automated Nurture Sequence 7" },
            { name: "sequence8", type: "MARKETING", desc: "Automated Nurture Sequence 8" },
            { name: "sequence9", type: "MARKETING", desc: "Automated Nurture Sequence 9" },
            { name: "sequence09", type: "MARKETING", desc: "Automated Nurture Sequence 09 (Alt)" },
            { name: "sequence10", type: "MARKETING", desc: "Automated Nurture Sequence 10" }
          ];

          const WHATSAPP_CATEGORIES = [
            { id: "all", name: "All Use Cases", count: 29 },
            { id: "sell", name: "🚗 Sell Car (5)", count: 5 },
            { id: "buy", name: "🛍️ Buy & Bookings (4)", count: 4 },
            { id: "test_drive", name: "🏎️ Test Drives (3)", count: 3 },
            { id: "finance", name: "🧮 Loans & Finance (3)", count: 3 },
            { id: "services", name: "🛡️ Services (4)", count: 4 },
            { id: "leads", name: "❤️ Leads (2)", count: 2 },
            { id: "auth", name: "🔐 Auth & OTP (2)", count: 2 },
            { id: "admin", name: "🚨 Admin Alerts (6)", count: 6 },
          ];

          const WHATSAPP_EVENTS = [
            // 🚗 1. CAR SELLING & VALUATION WORKFLOW
            {
              id: "sell_request",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "1. Sell Car Request Submitted (Under Review)",
              desc: "Sent to customer immediately when they submit their car for valuation/review on /sell-car",
              defaultTpl: "customer_got_sell_price_for_their_car",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{1}}", "{{2}}", "{{3}}"],
              sampleText: "Namaste {{1}}, humein aapki car {{2}} bechne ki request mil gayi hai. Aapka Request ID: {{3}} hai. Humari team jald hi aapki valuation review karegi.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Request ID",
              recipient: "Customer"
            },
            {
              id: "sell_inspection_booked",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "2. Car Evaluation / Inspection Scheduled",
              desc: "Sent to customer when home inspection or hub physical evaluation appointment is booked",
              defaultTpl: "schedule_visit_confim",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{location}}", "{{request_id}}"],
              sampleText: "Hello {{1}}, aapki car {{2}} ke liye evaluation appointment confirm ho gayi hai.\n📅 Date & Slot: {{3}}\n📍 Location: {{4}}\nRequest ID: {{5}}",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Date/Slot, {{4}}=Location, {{5}}=Request ID",
              recipient: "Customer"
            },
            {
              id: "sell_request_approved",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "3. Car Approved & Listed in Catalog",
              desc: "Sent to seller when admin reviews and approves/publishes the car in live inventory",
              defaultTpl: "customer_got_sell_price_for_their_car",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{status}}"],
              sampleText: "Badhai ho {{1}}! Aapki car {{2}} review pass ho kar Selectt inventory par live list ho gayi hai (ID: {{3}}). Current Status: {{4}}.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Request ID, {{4}}=Status",
              recipient: "Customer"
            },
            {
              id: "sell_car_sold",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "4. Listed Car Sold Out",
              desc: "Sent to seller when their listed vehicle is purchased and marked Sold Out",
              defaultTpl: "happy_customers_clinch",
              vars: ["{{customer_name}}", "{{car_name}}", "{{sold_price}}", "{{request_id}}"],
              sampleText: "Congratulations {{1}}! Aapki car {{2}} ₹{{3}} me successfully sell ho chuki hai. Request ID: {{4}}. Humare executive payment transfer ke liye aapse contact karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Sold Price, {{4}}=Request ID",
              recipient: "Customer"
            },
            {
              id: "sell_request_rejected",
              category: "sell",
              categoryName: "🚗 Sell Car Workflow",
              title: "5. Sell Car Request Update / Rejected",
              desc: "Sent to customer if vehicle does not meet listing criteria or is cancelled",
              defaultTpl: "try_to_help_you",
              vars: ["{{customer_name}}", "{{car_name}}", "{{request_id}}", "{{reason}}"],
              sampleText: "Hello {{1}}, aapki car {{2}} (ID: {{3}}) ki listing request approve nahi ho saki. Reason: {{4}}. Kripya humari support team se sampark karein.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Request ID, {{4}}=Reason",
              recipient: "Customer"
            },

            // 🛍️ 2. CAR BUYING & BOOKINGS
            {
              id: "car_booking",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "6. Car Token Booking / Deposit Paid",
              desc: "Sent when customer pays online booking deposit on frontend",
              defaultTpl: "car_booking_confirmation",
              vars: ["{{customer_name}}", "{{car_name}}", "{{amount}}", "{{booking_id}}"],
              sampleText: "Congratulations {{1}}! Aapne car {{2}} ke liye token advance ₹{{3}} ka payment successfully kar diya hai. Booking ID: {{4}}. Humari team aapse delivery & paperwork ke liye jald connect karegi.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Booking Amount, {{4}}=Booking ID",
              recipient: "Customer"
            },
            {
              id: "booking_confirmed",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "7. Booking Confirmed by Hub / Advance Cleared",
              desc: "Sent when dealer/admin confirms inventory reservation and paperwork readiness",
              defaultTpl: "car_booking_confirmation",
              vars: ["{{customer_name}}", "{{car_name}}", "{{booking_id}}", "{{hub_location}}"],
              sampleText: "Hello {{1}}, aapki car booking {{2}} (ID: {{3}}) Selectt Hub dwara confirm kar di gayi hai. Car Inspection & Delivery Hub: {{4}}.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Booking ID, {{4}}=Hub Location",
              recipient: "Customer"
            },
            {
              id: "car_delivered",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "8. Car Delivered / Handover Completed",
              desc: "Sent when customer takes delivery with warranty and ownership documents",
              defaultTpl: "happy_customers_clinch",
              vars: ["{{customer_name}}", "{{car_name}}", "{{reg_no}}"],
              sampleText: "Congratulations {{1}}! Aapki nayi car {{2}} (Reg: {{3}}) ka delivery process complete ho gaya hai. Selectt par vishwas karne ke liye dhanyawad!",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Registration No",
              recipient: "Customer"
            },
            {
              id: "booking_cancelled",
              category: "buy",
              categoryName: "🛍️ Buy & Bookings",
              title: "9. Booking Cancelled / Refund Processed",
              desc: "Sent if booking is cancelled and refund status is updated",
              defaultTpl: "try_to_help_you",
              vars: ["{{customer_name}}", "{{car_name}}", "{{booking_id}}", "{{refund_status}}"],
              sampleText: "Hello {{1}}, aapki car booking {{2}} (ID: {{3}}) cancel kar di gayi hai. Refund Status: {{4}}. Agar koi sawal ho to humari team se sampark karein.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Booking ID, {{4}}=Refund Status",
              recipient: "Customer"
            },

            // 🏎️ 3. TEST DRIVES
            {
              id: "test_drive",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "10. Test Drive Appointment Scheduled",
              desc: "Sent when customer schedules a test drive appointment on a car",
              defaultTpl: "schedule_visit_confim",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{location}}"],
              sampleText: "Hello {{1}}, aapki test drive appointment for {{2}} schedule ho chuki hai.\n📅 Time: {{3}}\n📍 Location: {{4}}\nHumare executive aapko time par receive karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Date/Slot, {{4}}=Location",
              recipient: "Customer"
            },
            {
              id: "test_drive_confirmed",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "11. Test Drive Confirmed / Executive Assigned",
              desc: "Sent with hub executive contact details when appointment is confirmed",
              defaultTpl: "schedule_visit_confim",
              vars: ["{{customer_name}}", "{{car_name}}", "{{date_slot}}", "{{executive_name}}"],
              sampleText: "Hello {{1}}, aapki test drive {{2}} on {{3}} confirm ho gayi hai. Assigned Hub Executive: {{4}}. Wo test drive ke liye aapse connect karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Date/Slot, {{4}}=Executive Name",
              recipient: "Customer"
            },
            {
              id: "test_drive_completed",
              category: "test_drive",
              categoryName: "🏎️ Test Drives",
              title: "12. Test Drive Completed & Feedback Request",
              desc: "Sent after test drive to collect ratings and provide booking link",
              defaultTpl: "visted_sequence_1",
              vars: ["{{customer_name}}", "{{car_name}}"],
              sampleText: "Thank you {{1}}! Aapne {{2}} ki test drive complete kar li hai. Kripya humein apna experience rate karein ya car book karne ke liye reply karein.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model",
              recipient: "Customer"
            },

            // 🧮 4. FINANCIAL SERVICES & LOANS
            {
              id: "emi_query",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "13. Used Car Loan / EMI Application Submitted",
              desc: "Sent when customer applies for used car loan or EMI calculation inquiry",
              defaultTpl: "hot_lead_sequence_1_2026",
              vars: ["{{customer_name}}", "{{car_name}}", "{{loan_amount}}", "{{monthly_emi}}"],
              sampleText: "Hello {{1}}, aapki car loan enquiry for {{2}} receive ho gayi hai. Loan Amount: ₹{{3}} | Est. Monthly EMI: ₹{{4}}. Humare finance advisor aapse jald hi call karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Loan Amount, {{4}}=Monthly EMI",
              recipient: "Customer"
            },
            {
              id: "loan_approved",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "14. Car Loan In-Principle Approved",
              desc: "Sent when partner banking/NBFC verifies eligibility and issues pre-approval",
              defaultTpl: "hot_lead_sequence_3_2026",
              vars: ["{{customer_name}}", "{{loan_amount}}", "{{interest_rate}}"],
              sampleText: "Badhai ho {{1}}! Aapka car loan ₹{{2}} in-principle approve ho chuka hai at {{3}} interest rate. Kripya final documentation complete karein.",
              varLegend: "{{1}}=Customer Name, {{2}}=Loan Amount, {{3}}=Interest Rate",
              recipient: "Customer"
            },
            {
              id: "loan_rejected",
              category: "finance",
              categoryName: "🧮 Loans & Finance",
              title: "15. Loan Application Status Update",
              desc: "Sent if loan document verification requires additional details",
              defaultTpl: "try_to_help_you",
              vars: ["{{customer_name}}", "{{application_no}}", "{{remarks}}"],
              sampleText: "Hello {{1}}, aapki loan application (No: {{2}}) par ek update hai. Note: {{3}}. Kripya assistance ke liye call karein.",
              varLegend: "{{1}}=Customer Name, {{2}}=Application No, {{3}}=Remarks",
              recipient: "Customer"
            },

            // 🛡️ 5. VALUE ADDED SERVICES
            {
              id: "insurance_query",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "16. Comprehensive Car Insurance Quote Request",
              desc: "Sent when customer requests car insurance renewal or policy inquiry",
              defaultTpl: "sequenceutlity_1",
              vars: ["{{customer_name}}", "{{car_name}}", "{{reg_no}}"],
              sampleText: "Hello {{1}}, aapki car {{2}} (Reg: {{3}}) ke insurance renewal quote ki enquiry mil gayi hai. Humare insurance advisor best quote ke sath aapse call karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Reg Number",
              recipient: "Customer"
            },
            {
              id: "warranty_inquiry",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "17. Selectt Assured Extended Warranty Inquiry",
              desc: "Sent when customer requests 1-year comprehensive warranty coverage quote",
              defaultTpl: "sequence_utility2",
              vars: ["{{customer_name}}", "{{car_name}}"],
              sampleText: "Namaste {{1}}, aapne {{2}} ke liye Selectt Assured Extended Warranty plan ki jankari maangi hai. Humare representative aapse call karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model",
              recipient: "Customer"
            },
            {
              id: "buyback_inquiry",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "18. Assured Buyback Guarantee Inquiry",
              desc: "Sent when customer inquires about guaranteed 1-year buyback value program",
              defaultTpl: "sequence_ultility4",
              vars: ["{{customer_name}}", "{{car_name}}"],
              sampleText: "Hello {{1}}, aapki car {{2}} ke liye Assured Buyback Guarantee program enquiry receive ho gayi hai. Team aapse details share karegi.",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model",
              recipient: "Customer"
            },
            {
              id: "challan_paid",
              category: "services",
              categoryName: "🛡️ Services & Insurance",
              title: "19. Traffic e-Challan Paid & Receipt",
              desc: "Sent with transaction receipt when user clears traffic challan on Selectt",
              defaultTpl: "sequenceutlity8",
              vars: ["{{customer_name}}", "{{challan_no}}", "{{amount}}"],
              sampleText: "Payment Confirmed! Hello {{1}}, aapka traffic challan (No: {{2}}) ₹{{3}} successfully pay ho gaya hai. Selectt Services.",
              varLegend: "{{1}}=Customer Name, {{2}}=Challan No, {{3}}=Paid Amount",
              recipient: "Customer"
            },

            // ❤️ 6. LEADS & RETENTION
            {
              id: "wishlist",
              category: "leads",
              categoryName: "❤️ Leads & Retention",
              title: "20. Wishlist Price Drop / Stock Alert",
              desc: "Sent when a saved car gets a price reduction or limited-time deal",
              defaultTpl: "price_drop_message",
              vars: ["{{customer_name}}", "{{car_name}}", "{{new_price}}"],
              sampleText: "Great news {{1}}! Aapki pasandida car {{2}} par price drop hua hai. Naya Price: ₹{{3}}. Abhi visit karein aur book karein!",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=New Price",
              recipient: "Customer"
            },
            {
              id: "lead_inquiry",
              category: "leads",
              categoryName: "❤️ Leads & Retention",
              title: "21. General Customer Assistance / Callback Request",
              desc: "Sent when customer submits 'Need Assistance' or contact form query",
              defaultTpl: "try_to_help_you",
              vars: ["{{customer_name}}", "{{phone}}", "{{subject}}"],
              sampleText: "Hello {{1}}, aapka callback request on {{2}} regarding {{3}} receive ho gaya hai. Humare executive aapse call karenge.",
              varLegend: "{{1}}=Customer Name, {{2}}=Customer Phone, {{3}}=Subject / Query",
              recipient: "Customer"
            },

            // 🔐 7. AUTH & ONBOARDING
            {
              id: "auth_otp",
              category: "auth",
              categoryName: "🔐 Auth & Onboarding",
              title: "22. WhatsApp Login / Registration OTP",
              desc: "6-digit OTP verification code sent to customer phone on Login/Signup",
              defaultTpl: "otp_template_name",
              vars: ["{{otp}}", "{{1}}"],
              sampleText: "{{1}} is your Selectt verification code. Do not share this OTP with anyone. Valid for 10 minutes.",
              varLegend: "{{1}}=6-digit OTP Code",
              recipient: "Customer"
            },
            {
              id: "welcome_customer",
              category: "auth",
              categoryName: "🔐 Auth & Onboarding",
              title: "23. New Customer Welcome & Account Created",
              desc: "Sent once upon first successful WhatsApp login/registration",
              defaultTpl: "hi_message",
              vars: ["{{customer_name}}"],
              sampleText: "Welcome to Selectt, {{1}}! Aapka account successfully create ho chuka hai. Verified & certified pre-owned cars explore karein.",
              varLegend: "{{1}}=Customer Name",
              recipient: "Customer"
            },

            // 🚨 8. ADMIN ALERTS
            {
              id: "admin_sell_request",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "24. Admin Alert: New Car Sell Request",
              desc: "Instant WhatsApp ping to Admin phone when any customer submits a car to sell",
              defaultTpl: "customer_got_sell_price_for_their_car",
              vars: ["{{customer_name}}", "{{customer_phone}}", "{{car_name}}", "{{request_id}}"],
              sampleText: "🚨 ADMIN ALERT: New Car Sell Request!\nCustomer: {{1}} (📞 {{2}})\nCar: {{3}}\nRequest ID: {{4}}\nReview now on Admin Portal.",
              varLegend: "{{1}}=Customer Name, {{2}}=Customer Phone, {{3}}=Car Model, {{4}}=Request ID",
              recipient: "Admin Staff"
            },
            {
              id: "admin_booking",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "25. Admin Alert: New Car Booking & Payment",
              desc: "Instant WhatsApp ping to Admin phone when token advance is paid",
              defaultTpl: "car_booking_confirmation",
              vars: ["{{customer_name}}", "{{car_name}}", "{{amount}}", "{{booking_id}}"],
              sampleText: "🚨 ADMIN ALERT: New Car Token Advance Paid!\nCustomer: {{1}}\nCar: {{2}}\nAdvance Amount: ₹{{3}}\nBooking ID: {{4}}",
              varLegend: "{{1}}=Customer Name, {{2}}=Car Model, {{3}}=Token Amount, {{4}}=Booking ID",
              recipient: "Admin Staff"
            },
            {
              id: "admin_test_drive",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "26. Admin Alert: New Test Drive Appointment",
              desc: "Instant WhatsApp ping to Admin phone when a test drive slot is booked",
              defaultTpl: "schedule_visit_confim",
              vars: ["{{customer_name}}", "{{customer_phone}}", "{{car_name}}", "{{date_slot}}"],
              sampleText: "🚨 ADMIN ALERT: New Test Drive Booked!\nCustomer: {{1}} (📞 {{2}})\nCar: {{3}}\nSlot: {{4}}\nPlease assign an executive.",
              varLegend: "{{1}}=Customer Name, {{2}}=Customer Phone, {{3}}=Car Model, {{4}}=Date/Slot",
              recipient: "Admin Staff"
            },
            {
              id: "admin_loan",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "27. Admin Alert: New Loan Application",
              desc: "Instant WhatsApp ping to Admin phone when a loan application is submitted",
              defaultTpl: "hot_lead_sequence_1_2026",
              vars: ["{{customer_name}}", "{{phone}}", "{{loan_amount}}"],
              sampleText: "🚨 ADMIN ALERT: New Car Loan Inquiry!\nApplicant: {{1}} (📞 {{2}})\nLoan Amount: ₹{{3}}\nReview application in admin.",
              varLegend: "{{1}}=Applicant Name, {{2}}=Phone, {{3}}=Loan Amount",
              recipient: "Admin Staff"
            },
            {
              id: "admin_insurance",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "28. Admin Alert: New Insurance Quote Lead",
              desc: "Instant WhatsApp ping to Admin phone when insurance quote is requested",
              defaultTpl: "sequenceutlity_1",
              vars: ["{{customer_name}}", "{{phone}}", "{{reg_no}}"],
              sampleText: "🚨 ADMIN ALERT: New Insurance Quote Lead!\nCustomer: {{1}} (📞 {{2}})\nCar Reg No: {{3}}",
              varLegend: "{{1}}=Customer Name, {{2}}=Phone, {{3}}=Car Reg No",
              recipient: "Admin Staff"
            },
            {
              id: "admin_contact",
              category: "admin",
              categoryName: "🚨 Admin Staff Alerts",
              title: "29. Admin Alert: New Customer Contact / Assistance Lead",
              desc: "Instant WhatsApp ping to Admin phone when someone requests a callback",
              defaultTpl: "try_to_help_you",
              vars: ["{{customer_name}}", "{{phone}}", "{{subject}}"],
              sampleText: "🚨 ADMIN ALERT: Customer Callback Request!\nName: {{1}} (📞 {{2}})\nQuery: {{3}}",
              varLegend: "{{1}}=Customer Name, {{2}}=Phone, {{3}}=Subject / Query",
              recipient: "Admin Staff"
            }
          ];

          const filteredEvents = WHATSAPP_EVENTS.filter((evt) => {
            const matchesCategory = whatsappCategory === "all" || evt.category === whatsappCategory;
            const matchesSearch = !whatsappSearch || 
              evt.title.toLowerCase().includes(whatsappSearch.toLowerCase()) || 
              evt.desc.toLowerCase().includes(whatsappSearch.toLowerCase()) ||
              evt.defaultTpl.toLowerCase().includes(whatsappSearch.toLowerCase()) ||
              (settings[`gallabox_tpl_${evt.id}`] || "").toLowerCase().includes(whatsappSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          });

          return (
            <div className="space-y-6">
              {/* 1. API Credentials & Configuration Card */}
              <ComponentCard title="WhatsApp Gateway Credentials & Global Settings">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>WhatsApp Gateway Provider</Label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:bg-gray-800 font-bold"
                        value={settings.whatsapp_provider || "gallabox"}
                        onChange={(e) => handleChange("whatsapp_provider", e.target.value)}
                      >
                        <option value="gallabox">Gallabox BSP (gallabox.com - Recommended)</option>
                        <option value="meta">Official Meta WhatsApp Business API</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        Selectt uses Gallabox BSP to dispatch automated transactional templates and customer support chats.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl self-end">
                      <input
                        type="checkbox"
                        id="gallabox_auto_notifications_enabled"
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        checked={settings.gallabox_auto_notifications_enabled !== "false"}
                        onChange={(e) => handleChange("gallabox_auto_notifications_enabled", e.target.checked ? "true" : "false")}
                      />
                      <div>
                        <label htmlFor="gallabox_auto_notifications_enabled" className="text-sm font-black text-gray-900 dark:text-white cursor-pointer block">
                          Enable Automated WhatsApp Notifications
                        </label>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Master switch to trigger WhatsApp messages across all 29 workflows.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <input
                        type="checkbox"
                        id="whatsapp_test_mode"
                        className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        checked={settings.whatsapp_test_mode === "true"}
                        onChange={(e) => handleChange("whatsapp_test_mode", e.target.checked ? "true" : "false")}
                      />
                      <div>
                        <label htmlFor="whatsapp_test_mode" className="text-sm font-extrabold text-gray-900 dark:text-white cursor-pointer block">
                          Enable Simulation / Test Mode (Bypass API Credits)
                        </label>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Logs payloads to server console for testing templates without using Gallabox message credits.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <input
                        type="checkbox"
                        id="whatsapp_admin_alerts_enabled"
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={settings.whatsapp_admin_alerts_enabled !== "false"}
                        onChange={(e) => handleChange("whatsapp_admin_alerts_enabled", e.target.checked ? "true" : "false")}
                      />
                      <div>
                        <label htmlFor="whatsapp_admin_alerts_enabled" className="text-sm font-extrabold text-gray-900 dark:text-white cursor-pointer block">
                          Enable Admin WhatsApp Alerts
                        </label>
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Instantly ping admin/staff phones when a new car is listed, booked, or requested.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="md:col-span-1">
                      <Label>Gallabox API Key</Label>
                      <Input
                        type="text"
                        placeholder="e.g. gbx_api_key_..."
                        value={settings.gallabox_api_key || ""}
                        onChange={(e) => handleChange("gallabox_api_key", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label>Gallabox API Secret</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={settings.gallabox_api_secret || ""}
                        onChange={(e) => handleChange("gallabox_api_secret", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label>WhatsApp Channel ID</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 64a8b...12"
                        value={settings.gallabox_channel_id || ""}
                        onChange={(e) => handleChange("gallabox_channel_id", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label>Admin WhatsApp Phone(s)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 9753003648"
                        value={settings.whatsapp_admin_phone || ""}
                        onChange={(e) => handleChange("whatsapp_admin_phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving}>{saving ? "Saving Credentials..." : "Save WhatsApp Credentials"}</Button>
                  </div>
                </form>
              </ComponentCard>

              {/* 2. Automated Trigger Events & Template Mapping for ALL Project Use Cases */}
              <ComponentCard title="All Project WhatsApp Event Templates (29 Use Cases)">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Shared datalist for all approved templates in user's Gallabox account */}
                  <datalist id="gallabox-account-templates">
                    {GALLABOX_ACCOUNT_APPROVED_TEMPLATES.map((gtpl) => (
                      <option key={gtpl.name} value={gtpl.name}>
                        [{gtpl.type}] {gtpl.desc}
                      </option>
                    ))}
                  </datalist>

                  {/* Gallabox Channel Sync Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                        💬
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-gray-900 dark:text-white">
                            Gallabox WhatsApp Account Connected: <span className="text-emerald-600 dark:text-emerald-400">Selectt</span>
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            Active Channel
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                          Channel ID: <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{settings.gallabox_channel_id || "687de856ba93969639c5815d"}</code> • <span className="font-bold text-indigo-600 dark:text-indigo-400">{GALLABOX_ACCOUNT_APPROVED_TEMPLATES.length} Meta Approved Templates</span> available for 1-click mapping.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-gray-900 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                        ⚡ Auto-dispatch Live
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Configure and map approved Gallabox / Meta template names for each transaction event across the Selectt platform.
                    </p>
                    <div className="w-full md:w-64">
                      <Input
                        type="text"
                        placeholder="🔍 Search templates or events..."
                        value={whatsappSearch}
                        onChange={(e) => setWhatsappSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills & Expand/Collapse Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {WHATSAPP_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setWhatsappCategory(cat.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            whatsappCategory === cat.id
                              ? "bg-[#0C1B33] text-white shadow-sm"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => expandAll(filteredEvents)}
                        className="px-3 py-1 text-xs font-extrabold bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>📂 Expand All Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={collapseAll}
                        className="px-3 py-1 text-xs font-extrabold bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>📁 Collapse All</span>
                      </button>
                    </div>
                  </div>

                  {/* Event List */}
                  <div className="space-y-4 pt-2">
                    {filteredEvents.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-500">No WhatsApp templates match your search or filter.</p>
                      </div>
                    ) : (
                      filteredEvents.map((evt) => {
                        const enabledKey = `gallabox_event_${evt.id}_enabled`;
                        const tplKey = `gallabox_tpl_${evt.id}`;
                        const isEnabled = settings[enabledKey] !== "false";
                        const isExpanded = expandedEvents[evt.id] !== false; // default expanded or toggleable
                        const configuredTpl = settings[tplKey] || evt.defaultTpl;

                        return (
                          <div 
                            key={evt.id} 
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isEnabled 
                                ? "bg-slate-50 dark:bg-gray-800/60 border-slate-200/90 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-700" 
                                : "bg-gray-100/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-gray-700/60 pb-3">
                              {/* Left side: Enable Checkbox & Title & Badges */}
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    id={enabledKey}
                                    className="sr-only peer"
                                    checked={isEnabled}
                                    onChange={(e) => handleChange(enabledKey, e.target.checked ? "true" : "false")}
                                  />
                                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                </label>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <label htmlFor={enabledKey} className="text-sm font-extrabold text-gray-900 dark:text-white cursor-pointer">
                                      {evt.title}
                                    </label>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                                      {evt.categoryName}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                      evt.recipient === "Customer" 
                                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50" 
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                                    }`}>
                                      👤 {evt.recipient}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{evt.desc}</p>
                                </div>
                              </div>

                              {/* Right side: Action Buttons & Expand Details Toggle */}
                              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTestEvent(evt.id);
                                    if (testPhone && testPhone.trim()) {
                                      handleTriggerSingleTest(evt.id);
                                    } else {
                                      toast("Enter a target phone number in the Test Sender below to dispatch.", { icon: "ℹ️" });
                                      const el = document.getElementById("test-sender-section");
                                      if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }
                                  }}
                                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>⚡ Quick Test</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleExpand(evt.id)}
                                  className={`px-2.5 py-1.5 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isExpanded 
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" 
                                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{isExpanded ? "▲ Hide Details" : "▼ View Details"}</span>
                                </button>

                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                                  isEnabled ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                  {isEnabled ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            </div>

                            {/* Collapsed Summary Preview if not expanded */}
                            {!isExpanded && (
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                                <span className="flex items-center gap-1.5">
                                  <span>Template:</span>
                                  <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{configuredTpl}</code>
                                </span>
                                <span className="text-[11px] text-gray-400 italic">Click "View Details" to configure tokens & copy Gallabox reference</span>
                              </div>
                            )}

                            {/* Expanded Full Details Section */}
                            {isExpanded && (
                              <div className="space-y-3 pt-1 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label>Gallabox Approved Template Name</Label>
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                        ✓ Meta Approved
                                      </span>
                                    </div>
                                    
                                    {/* Direct Autocomplete Input */}
                                    <Input
                                      type="text"
                                      list="gallabox-account-templates"
                                      placeholder={evt.defaultTpl}
                                      value={settings[tplKey] || ""}
                                      onChange={(e) => handleChange(tplKey, e.target.value)}
                                    />

                                    {/* Quick Selection Dropdown from Gallabox account library */}
                                    <select
                                      className="w-full text-xs rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-1.5 text-indigo-900 dark:text-indigo-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                      value={settings[tplKey] || ""}
                                      onChange={(e) => {
                                        if (e.target.value) handleChange(tplKey, e.target.value);
                                      }}
                                    >
                                      <option value="">⚡ Quick Select from Approved Gallabox Templates ({GALLABOX_ACCOUNT_APPROVED_TEMPLATES.length})...</option>
                                      {GALLABOX_ACCOUNT_APPROVED_TEMPLATES.map((gtpl) => (
                                        <option key={gtpl.name} value={gtpl.name}>
                                          [{gtpl.type}] {gtpl.name} — {gtpl.desc}
                                        </option>
                                      ))}
                                    </select>

                                    <span className="text-[10px] text-gray-400 block">
                                      Default: <code className="font-mono text-gray-600 dark:text-gray-300 font-bold">{evt.defaultTpl}</code>
                                    </span>
                                  </div>
                                  <div>
                                    <Label>Available Template Variable Tokens</Label>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                      {evt.vars.map((v) => (
                                        <span key={v} className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                          {v}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                      Both named variables and positional <code className="font-mono">{"{{1}}"}</code>, <code className="font-mono">{"{{2}}"}</code> are automatically mapped.
                                    </span>
                                  </div>
                                </div>

                                {/* 📋 Template Reference / Gallabox & Meta Sample Message Box */}
                                <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                                        <span>📋 Template Reference (Gallabox / Meta Text):</span>
                                      </span>
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {evt.varLegend}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(evt.sampleText);
                                        toast.success("Sample template text copied to clipboard!");
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                                    >
                                      <span>📑 Copy Template Text</span>
                                    </button>
                                  </div>
                                  <pre className="text-[11px] text-gray-800 dark:text-gray-200 font-sans whitespace-pre-wrap bg-slate-50 dark:bg-gray-950/80 p-2.5 rounded-lg border border-slate-200/70 dark:border-gray-800 leading-relaxed font-medium select-all">
                                    {evt.sampleText}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button type="submit" disabled={saving}>{saving ? "Saving Template Mapping..." : "Save Template Mapping"}</Button>
                  </div>
                </form>
              </ComponentCard>

              {/* 3. Live Interactive WhatsApp Message Test Console */}
              <div id="test-sender-section">
                <ComponentCard title="⚡ Live WhatsApp Message Simulator & Test Console">
                  <form onSubmit={handleSendTestMessage} className="space-y-4">
                    <p className="text-xs text-gray-500 font-medium">
                      Trigger any of the 29 project templates to test Gallabox connection, variable formatting, and delivery.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Target Phone Number</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 9876543210"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Select Event Template</Label>
                        <select
                          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:bg-gray-800 font-bold"
                          value={selectedTestEvent}
                          onChange={(e) => setSelectedTestEvent(e.target.value)}
                        >
                          {WHATSAPP_EVENTS.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.title} ({e.recipient})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={isSendingTest}
                          className="w-full bg-[#155DFC] hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <span>{isSendingTest ? "Sending WhatsApp..." : "Send Test WhatsApp Message"}</span>
                        </button>
                      </div>
                    </div>

                    {testResult && (
                      <div className={`p-4 rounded-xl text-xs font-mono border ${
                        testResult.success ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}>
                        <div className="font-bold mb-1">
                          {testResult.mock ? "🧪 Simulation Mode Output:" : "📡 Gallabox API Response:"}
                        </div>
                        <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(testResult, null, 2)}</pre>
                      </div>
                    )}
                  </form>
                </ComponentCard>
              </div>
            </div>
          );
        })()}

        {activeSection === "security" && (
          <div className="space-y-6">
            {/* 1. Master Two-Step Verification Switch & Status Banner */}
            <ComponentCard title="🛡️ Two-Step Authentication (2FA) for Admin & Staff Sign-In">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white">
                          Two-Step Verification Status:{" "}
                          <span className={settings.two_factor_auth_enabled === "true" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                            {settings.two_factor_auth_enabled === "true" ? "ACTIVE & ENFORCED" : "DISABLED"}
                          </span>
                        </h4>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          settings.two_factor_auth_enabled === "true"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300"
                        }`}>
                          {settings.two_factor_auth_enabled === "true" ? "High Security" : "Standard Security"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium leading-relaxed">
                        When enabled, all Admin and Staff logins require a secondary verification step via instant WhatsApp OTP or Google Authenticator code.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs shrink-0 self-start sm:self-auto">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="two_factor_auth_enabled"
                        className="sr-only peer"
                        checked={settings.two_factor_auth_enabled === "true"}
                        onChange={(e) => handleChange("two_factor_auth_enabled", e.target.checked ? "true" : "false")}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                    <label htmlFor="two_factor_auth_enabled" className="text-xs font-black text-gray-900 dark:text-white cursor-pointer select-none">
                      Enable 2FA Sign-In
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Method 1: WhatsApp OTP */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Method 1: WhatsApp OTP</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.two_factor_whatsapp_enabled !== "false"}
                          onChange={(e) => handleChange("two_factor_whatsapp_enabled", e.target.checked ? "true" : "false")}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Dispatches an automated 6-digit security OTP directly to the designated Admin WhatsApp number via Gallabox API.
                    </p>

                    <div>
                      <Label>Admin WhatsApp Phone Number</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 9753003648"
                        value={settings.two_factor_whatsapp_phone || ""}
                        onChange={(e) => handleChange("two_factor_whatsapp_phone", e.target.value)}
                      />
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">
                        Defaults to Admin WhatsApp Phone configured in WhatsApp settings if left empty.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={testingWhatsapp2fa}
                      onClick={handleTestWhatsapp2fa}
                      className="px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {testingWhatsapp2fa ? (
                        <>
                          <span className="animate-spin text-xs">⏳</span> Sending Test OTP...
                        </>
                      ) : (
                        <>
                          <span>📲</span> Send Test WhatsApp 2FA OTP
                        </>
                      )}
                    </button>

                    {whatsapp2faTestResult && (
                      <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        whatsapp2faTestResult.success
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200"
                      }`}>
                        <span>{whatsapp2faTestResult.success ? "✅" : "❌"}</span>
                        <span>{whatsapp2faTestResult.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Method 2: Google Authenticator (TOTP) */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔐</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Method 2: Google Authenticator (App)</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.two_factor_totp_enabled !== "false"}
                          onChange={(e) => handleChange("two_factor_totp_enabled", e.target.checked ? "true" : "false")}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Standard RFC 6238 Time-based One-Time Password (TOTP) compatible with Google Authenticator, Microsoft Authenticator, and Authy.
                    </p>

                    <div>
                      <Label>Authenticator Secret Key (Base32)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono"
                          placeholder="JBSWY3DPEHPK3PXP"
                          value={settings.two_factor_totp_secret || "JBSWY3DPEHPK3PXP"}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const sec = settings.two_factor_totp_secret || "JBSWY3DPEHPK3PXP";
                            navigator.clipboard.writeText(sec);
                            toast.success("Secret key copied!");
                          }}
                          className="px-3 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Copy secret key"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={generatingTotpSecret}
                        onClick={handleGenerateTotpSecret}
                        className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        {generatingTotpSecret ? "⏳ Generating..." : "🔑 Generate New Secret & QR"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sec = settings.two_factor_totp_secret || "JBSWY3DPEHPK3PXP";
                          const otpauthUrl = `otpauth://totp/Selectt:admin%40selectt.in?secret=${sec}&issuer=Selectt&algorithm=SHA1&digits=6&period=30`;
                          setQrModalData({
                            secret: sec,
                            otpauthUrl,
                            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauthUrl)}`
                          });
                          setShowQrModal(true);
                        }}
                        className="px-3.5 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📱 View App QR Code</span>
                      </button>
                    </div>

                    {/* Test Authenticator Code Box */}
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <Label>Test 6-Digit App Code</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter live 6-digit code"
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono tracking-widest text-center"
                          value={totpTestCode}
                          onChange={(e) => setTotpTestCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        />
                        <button
                          type="button"
                          disabled={testingTotp || totpTestCode.length !== 6}
                          onClick={handleTestTotpCode}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          {testingTotp ? "⏳ Testing..." : "Verify Code"}
                        </button>
                      </div>

                      {totpTestResult && (
                        <div className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                          totpTestResult.success
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200"
                        }`}>
                          <span>{totpTestResult.success ? "✅" : "❌"}</span>
                          <span>{totpTestResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving Security Settings..." : "Save 2FA Security Settings"}
                  </Button>
                </div>
              </form>
            </ComponentCard>

            {/* QR Code Setup Modal */}
            {showQrModal && qrModalData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
                  <div className="p-4 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📱</span>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        Scan Google Authenticator QR Code
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(false)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center cursor-pointer transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 text-center space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      Open <strong>Google Authenticator</strong> (or Microsoft Authenticator / Authy) on your smartphone, tap <strong>"+"</strong> and scan this QR code:
                    </p>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block shadow-inner">
                      <img
                        src={qrModalData.qrCodeUrl}
                        alt="2FA QR Code"
                        className="w-52 h-52 mx-auto rounded-lg"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-700 text-left space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Or Enter Key Manually:</span>
                      <p className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 select-all break-all">
                        {qrModalData.secret}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(false)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              </div>
            )}
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

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to reset ${label} to default?`)) return;
    try {
      setUploading(true);
      const res = await fetch(`${API_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ [settingKey]: "" }),
      });
      if (!res.ok) throw new Error("Reset failed");
      toast.success(`${label} reset to default`);
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset logo");
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
        <div className="flex-1 flex items-center gap-2">
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
          {currentValue && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center justify-center px-3 py-2 border border-rose-200 dark:border-rose-800 text-sm font-medium rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 cursor-pointer transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;

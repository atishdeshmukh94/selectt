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

  // Live WhatsApp Test Sender state
  const [testPhone, setTestPhone] = useState("");
  const [selectedTestEvent, setSelectedTestEvent] = useState("sell_request");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [whatsappCategory, setWhatsappCategory] = useState("all");
  const [whatsappSearch, setWhatsappSearch] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

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

        {activeSection === "whatsapp" && (() => {
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
              defaultTpl: "sell_request_received",
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
              defaultTpl: "sell_inspection_scheduled",
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
              defaultTpl: "sell_car_approved_listed",
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
              defaultTpl: "sell_car_sold_out",
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
              defaultTpl: "sell_car_rejected_update",
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
              defaultTpl: "car_booking_confirmed",
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
              defaultTpl: "booking_dealer_confirmed",
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
              defaultTpl: "car_delivered_success",
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
              defaultTpl: "booking_refund_cancelled",
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
              defaultTpl: "test_drive_booked",
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
              defaultTpl: "test_drive_hub_confirmed",
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
              defaultTpl: "test_drive_feedback_request",
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
              defaultTpl: "loan_application_received",
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
              defaultTpl: "loan_pre_approved_notice",
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
              defaultTpl: "loan_application_update",
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
              defaultTpl: "insurance_enquiry_received",
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
              defaultTpl: "warranty_plan_enquiry",
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
              defaultTpl: "buyback_assurance_enquiry",
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
              defaultTpl: "echallan_payment_receipt",
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
              defaultTpl: "wishlist_alert",
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
              defaultTpl: "customer_assistance_callback",
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
              defaultTpl: "whatsapp_login_otp",
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
              defaultTpl: "welcome_customer_onboarding",
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
              defaultTpl: "admin_alert_sell_request",
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
              defaultTpl: "admin_alert_car_booking",
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
              defaultTpl: "admin_alert_test_drive",
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
              defaultTpl: "admin_alert_loan_app",
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
              defaultTpl: "admin_alert_insurance_inquiry",
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
              defaultTpl: "admin_alert_contact_lead",
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-2">
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
                                  <div>
                                    <Label>Gallabox Approved Template Name</Label>
                                    <Input
                                      type="text"
                                      placeholder={evt.defaultTpl}
                                      value={settings[tplKey] || ""}
                                      onChange={(e) => handleChange(tplKey, e.target.value)}
                                    />
                                    <span className="text-[10px] text-gray-400 mt-1 block">
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

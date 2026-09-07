import React, { useState, useEffect } from "react";
import { 
  X, 
  Shield, 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Car, 
  FileText, 
  Users, 
  Settings, 
  Activity, 
  CreditCard, 
  Calendar, 
  BookmarkCheck, 
  FolderOpen, 
  PieChart, 
  Heart, 
  Briefcase,
  Layers,
  Save,
  Loader2,
  Tag,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { API_URL } from "../../config/api";
import { toast } from "react-hot-toast";

export interface PermissionItem {
  key: string;
  name: string;
  description: string;
  category: "Inventory & Catalog" | "Sales & Leads" | "Content & Media" | "Analytics & Reports" | "Administration";
  icon: any;
}

export const PERMISSION_MODULES: PermissionItem[] = [
  // 🚗 Inventory & Catalog
  {
    key: "cars",
    name: "Manage Cars & Inventory",
    description: "Add, edit, delete, inspect, and update car listings and pricing",
    category: "Inventory & Catalog",
    icon: Car
  },
  {
    key: "brands",
    name: "Brands & Models",
    description: "Manage manufacturer brands, car models, and variant specs",
    category: "Inventory & Catalog",
    icon: Tag
  },
  {
    key: "booked_cars",
    name: "Booked Cars",
    description: "View and manage customer vehicle bookings and token payments",
    category: "Inventory & Catalog",
    icon: BookmarkCheck
  },

  // 💼 Sales & Leads
  {
    key: "sell_requests",
    name: "Sell Car Requests & RC",
    description: "Review car seller submissions, evaluations, and RC documents",
    category: "Sales & Leads",
    icon: FileText
  },
  {
    key: "test_drives",
    name: "Test Drive Bookings",
    description: "Schedule, approve, and track customer test drive requests",
    category: "Sales & Leads",
    icon: Calendar
  },
  {
    key: "loan_applications",
    name: "Loan & Finance Applications",
    description: "Process used car loan inquiries, bank approvals, and EMI leads",
    category: "Sales & Leads",
    icon: CreditCard
  },
  {
    key: "wishlist",
    name: "Wishlisted Cars",
    description: "Analyze customer car saves, favorites, and demand trends",
    category: "Sales & Leads",
    icon: Heart
  },
  {
    key: "customers",
    name: "Customer Management",
    description: "Access registered buyer and seller accounts and contact details",
    category: "Sales & Leads",
    icon: Users
  },

  // 📝 Content & Media
  {
    key: "blog",
    name: "Blog & Content Posts",
    description: "Create, edit, and publish automotive blogs, guides, and SEO news",
    category: "Content & Media",
    icon: FileText
  },
  {
    key: "media",
    name: "Media Library & Uploads",
    description: "Browse media gallery, upload banner assets, and edit image alt tags",
    category: "Content & Media",
    icon: FolderOpen
  },

  // 📊 Analytics & Reports
  {
    key: "reports_payments",
    name: "Payment Transactions",
    description: "View Razorpay token transaction logs and financial summaries",
    category: "Analytics & Reports",
    icon: PieChart
  },
  {
    key: "reports_visitors",
    name: "Website Visitors & Live Traffic",
    description: "Real-time live visitor monitor, pageviews, bounce rate, and location logs",
    category: "Analytics & Reports",
    icon: Activity
  },

  // ⚙️ Administration & Settings
  {
    key: "site_settings",
    name: "Site Settings & Branding",
    description: "Configure homepage banners, video reviews, hub locations, and WhatsApp OTP",
    category: "Administration",
    icon: Settings
  },
  {
    key: "staff",
    name: "Staff & User Access Control",
    description: "Manage staff accounts, assign roles, and grant permissions",
    category: "Administration",
    icon: Shield
  }
];

interface StaffPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: any | null;
  onSuccess?: () => void;
}

export default function StaffPermissionsModal({
  isOpen,
  onClose,
  staffUser,
  onSuccess
}: StaffPermissionsModalProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staffUser) {
      if (staffUser.role === "admin") {
        setSelectedKeys(PERMISSION_MODULES.map(p => p.key));
      } else {
        const currentPerms = Array.isArray(staffUser.permissions) ? staffUser.permissions : [];
        setSelectedKeys(currentPerms);
      }
    }
  }, [staffUser, isOpen]);

  if (!isOpen || !staffUser) return null;

  const togglePermission = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedKeys(PERMISSION_MODULES.map(p => p.key));
  };

  const clearAll = () => {
    setSelectedKeys([]);
  };

  // Preset Shortcuts
  const applyPreset = (preset: "sales" | "inventory" | "marketing") => {
    if (preset === "sales") {
      setSelectedKeys(["cars", "booked_cars", "sell_requests", "test_drives", "loan_applications", "wishlist", "customers"]);
    } else if (preset === "inventory") {
      setSelectedKeys(["cars", "brands", "booked_cars", "sell_requests"]);
    } else if (preset === "marketing") {
      setSelectedKeys(["blog", "media", "reports_visitors", "site_settings"]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${staffUser.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || localStorage.getItem("token")}`
        },
        body: JSON.stringify({ permissions: selectedKeys })
      });

      if (res.ok) {
        toast.success(`Access permissions updated for ${staffUser.first_name}!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("Failed to update permissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving permissions");
    } finally {
      setSaving(false);
    }
  };

  const categories = Array.from(new Set(PERMISSION_MODULES.map(p => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-3xl w-full h-[90vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center font-bold">
              <Shield className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  Staff Access & Module Permissions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-blue-50 text-[#1C3EB9] border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                  {staffUser.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Assigning module permissions for <span className="font-bold text-gray-800 dark:text-gray-200">{staffUser.first_name} {staffUser.last_name}</span> ({staffUser.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick Action Presets Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset("sales")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              Sales Staff
            </button>
            <button
              type="button"
              onClick={() => applyPreset("inventory")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              Inventory Manager
            </button>
            <button
              type="button"
              onClick={() => applyPreset("marketing")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            >
              Content & SEO
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#1C3EB9] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Permissions Body (Scrollable categorized grid) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-black/20">
          {categories.map((cat) => {
            const catItems = PERMISSION_MODULES.filter(p => p.category === cat);
            const allCatSelected = catItems.every(p => selectedKeys.includes(p.key));

            return (
              <div key={cat} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1C3EB9]"></span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      {cat}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (allCatSelected) {
                        setSelectedKeys(prev => prev.filter(k => !catItems.some(ci => ci.key === k)));
                      } else {
                        const newKeys = Array.from(new Set([...selectedKeys, ...catItems.map(ci => ci.key)]));
                        setSelectedKeys(newKeys);
                      }
                    }}
                    className="text-[11px] font-bold text-[#1C3EB9] hover:underline"
                  >
                    {allCatSelected ? "Deselect Category" : "Select Category"}
                  </button>
                </div>

                {/* Grid of Permission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catItems.map((item) => {
                    const Icon = item.icon;
                    const isGranted = selectedKeys.includes(item.key);

                    return (
                      <div
                        key={item.key}
                        onClick={() => togglePermission(item.key)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
                          isGranted
                            ? "bg-white dark:bg-gray-800 border-[#1C3EB9] ring-2 ring-[#1C3EB9]/15 shadow-sm"
                            : "bg-white/80 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isGranted 
                              ? "bg-[#1C3EB9] text-white" 
                              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                            <Icon size={16} />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-bold transition-colors ${
                                isGranted ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                              }`}>
                                {item.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Toggle Switch Check */}
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isGranted 
                            ? "bg-[#1C3EB9] text-white shadow-xs" 
                            : "border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        }`}>
                          {isGranted && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {selectedKeys.length} of {PERMISSION_MODULES.length}
            </span>
            <span className="text-gray-400 font-medium">modules granted access</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#1C3EB9] hover:bg-[#153096] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

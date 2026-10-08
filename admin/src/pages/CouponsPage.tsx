import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Percent, 
  IndianRupee, 
  Calendar, 
  Copy, 
  Tag, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Car
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { toast } from "react-hot-toast";
import { API_URL } from "../config/api";

interface Coupon {
  id: number;
  code: string;
  title: string | null;
  description: string | null;
  discount_type: "flat" | "percentage";
  discount_value: number;
  applies_to: "booking_amount" | "car_price";
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function CouponsPage() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createdCouponSuccess, setCreatedCouponSuccess] = useState<{
    code: string;
    title?: string | null;
    discount_type: string;
    discount_value: number | string;
  } | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "flat" as "flat" | "percentage",
    discount_value: "",
    applies_to: "booking_amount" as "booking_amount" | "car_price",
    min_order_amount: "0",
    max_discount_amount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const headers = { 
    "Content-Type": "application/json", 
    Authorization: `Bearer ${token}` 
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/admin/coupons?`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      toast.error(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: "",
      title: "",
      description: "",
      discount_type: "flat",
      discount_value: "",
      applies_to: "car_price",
      min_order_amount: "0",
      max_discount_amount: "",
      usage_limit: "",
      valid_from: "",
      valid_until: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      title: coupon.title || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      applies_to: coupon.applies_to,
      min_order_amount: String(coupon.min_order_amount || 0),
      max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : "",
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : "",
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 16) : "",
      is_active: coupon.is_active === 1,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const val = parseFloat(form.discount_value);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase().replace(/\s+/g, ""),
        title: form.title.trim() || form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: val,
        applies_to: form.applies_to,
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 19).replace('T', ' ') : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 19).replace('T', ' ') : null,
        is_active: form.is_active ? 1 : 0,
      };

      const url = editingCoupon 
        ? `${API_URL}/api/admin/coupons/${editingCoupon.id}`
        : `${API_URL}/api/admin/coupons`;
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Failed to save coupon");
      }

      if (!editingCoupon) {
        setCreatedCouponSuccess({
          code: payload.code,
          title: payload.title,
          discount_type: payload.discount_type,
          discount_value: payload.discount_value
        });
        toast.success("Coupon created successfully!");
      } else {
        toast.success("Coupon updated successfully!");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/coupons/${coupon.id}/toggle-status`, {
        method: "PATCH",
        headers
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: c.is_active === 1 ? 0 : 1 } : c));
      toast.success(`Coupon ${coupon.code} is now ${coupon.is_active === 1 ? 'inactive' : 'active'}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      toast.success(`Coupon "${code}" deleted successfully`);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected coupon(s)?`)) return;
    
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/coupons/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error("Failed to delete selected coupons");
      toast.success("Selected coupons deleted successfully");
      setSelectedIds([]);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active === 1).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <>
      <PageMeta title="Coupons & Discount Offers | Selectt Admin" description="Manage coupons and promotional discount codes" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#00A38D]/10 text-[#00A38D] flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Coupon & Discount Codes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Create and manage discount codes for vehicle checkout and deposits
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchCoupons}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-[#00A38D]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Coupons</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalCoupons}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Codes</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{activeCoupons}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Redemptions</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalRedemptions}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D] text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "all" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "active" ? "bg-white dark:bg-slate-900 text-emerald-600 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "inactive" ? "bg-white dark:bg-slate-900 text-rose-600 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Inactive
              </button>
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-3 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={coupons.length > 0 && selectedIds.length === coupons.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(coupons.map(c => c.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded text-[#00A38D] focus:ring-[#00A38D] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Applies To</th>
                  <th className="py-3.5 px-4">Min / Max</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#00A38D] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Loading coupons...</span>
                      </div>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Ticket className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">No coupons found</p>
                        <p className="text-xs text-slate-400">Click &ldquo;Create Coupon&rdquo; to add your first promotional discount.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const isSelected = selectedIds.includes(coupon.id);
                    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
                    
                    return (
                      <tr 
                        key={coupon.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-[#00A38D]/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedIds(prev => 
                                prev.includes(coupon.id) ? prev.filter(i => i !== coupon.id) : [...prev, coupon.id]
                              );
                            }}
                            className="rounded text-[#00A38D] focus:ring-[#00A38D] cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white tracking-wide">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-slate-400 hover:text-[#00A38D] transition-colors p-1 cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.title && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {coupon.title}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {coupon.discount_type === "percentage" ? (
                              <span className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold">
                                {Number(coupon.discount_value)}% OFF
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                ₹{Number(coupon.discount_value).toLocaleString("en-IN")} FLAT
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            coupon.applies_to === "booking_amount"
                              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800"
                              : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800"
                          }`}>
                            {coupon.applies_to === "booking_amount" ? "Booking Deposit" : "Car Price"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div>
                            <span className="text-slate-400">Min: </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {coupon.min_order_amount > 0 ? `₹${Number(coupon.min_order_amount).toLocaleString("en-IN")}` : "None"}
                            </span>
                          </div>
                          {coupon.max_discount_amount && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              <span>Cap: </span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                ₹{Number(coupon.max_discount_amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {coupon.used_count || 0}
                            <span className="text-slate-400 font-normal">
                              {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " used"}
                            </span>
                          </div>
                          {coupon.usage_limit && (
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className="bg-[#00A38D] h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((coupon.used_count || 0) / coupon.usage_limit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {coupon.valid_until ? (
                            <div className={isExpired ? "text-rose-500 font-semibold flex items-center gap-1" : ""}>
                              {isExpired && <AlertCircle className="w-3 h-3 shrink-0" />}
                              <span>{new Date(coupon.valid_until).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                              {isExpired && <span className="text-[10px] uppercase">(Expired)</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400">No Expiry</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(coupon)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              coupon.is_active === 1 && !isExpired
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active === 1 && !isExpired ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            <span>{coupon.is_active === 1 ? (isExpired ? "Expired" : "Active") : "Inactive"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(coupon)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#00A38D] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(coupon.id, coupon.code)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A38D]/10 text-[#00A38D] flex items-center justify-center font-bold">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingCoupon ? "Edit Coupon Code" : "Create New Coupon"}
                    </h3>
                    <p className="text-xs text-slate-500">Configure discount code, rules, and validity</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSave} className="p-6 space-y-4">
                
                {/* Code & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Coupon Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                      placeholder="e.g. SELECTT500"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 font-mono font-bold tracking-wider text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Festival Booking Offer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Description / Terms Note
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Get ₹500 off on vehicle booking token deposit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Discount Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, discount_type: "flat" })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          form.discount_type === "flat"
                            ? "bg-[#00A38D]/10 border-[#00A38D] text-[#00A38D]"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>Flat Amount</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, discount_type: "percentage" })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          form.discount_type === "percentage"
                            ? "bg-[#00A38D]/10 border-[#00A38D] text-[#00A38D]"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Percentage</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {form.discount_type === "flat" ? "Discount Amount (₹)" : "Discount Percent (%)"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                      placeholder={form.discount_type === "flat" ? "e.g. 500" : "e.g. 10"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>
                </div>

                {/* Applies To (Car Price vs Booking Amount) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Discount Applies To
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, applies_to: "car_price" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        form.applies_to === "car_price"
                          ? "bg-[#00A38D]/10 border-[#00A38D] text-[#00A38D]"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Total Car Price (Default)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, applies_to: "booking_amount" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        form.applies_to === "booking_amount"
                          ? "bg-[#00A38D]/10 border-[#00A38D] text-[#00A38D]"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Booking Token Deposit</span>
                    </button>
                  </div>
                </div>

                {/* Min Order Value & Usage Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.min_order_amount}
                      onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                      placeholder="0 (No minimum)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.usage_limit}
                      onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                      placeholder="Leave blank for unlimited"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>
                </div>

                {/* Percentage Max Discount Cap (Only when percentage discount) */}
                {form.discount_type === "percentage" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.max_discount_amount}
                      onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                      placeholder="e.g. 1000 (Optional limit)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>
                )}

                {/* Validity Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Valid From (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.valid_from}
                      onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Valid Until / Expiry (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.valid_until}
                      onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00A38D]/20 focus:border-[#00A38D]"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00A38D] focus:ring-[#00A38D] cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Coupon is Active & Ready for Customers
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white rounded-xl text-sm font-bold shadow-md shadow-[#00A38D]/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Success Popup Screen on Coupon Creation */}
        {createdCouponSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background decorative glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00A38D]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setCreatedCouponSuccess(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated checkmark icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                Coupon Created Successfully!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Your new discount coupon is now active and ready for customers at checkout.
              </p>

              {/* Coupon Code Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-[#00A38D]/40 rounded-2xl p-4 mb-5 relative group">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Coupon Code
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black tracking-widest text-[#00A38D] select-all">
                    {createdCouponSuccess.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCouponSuccess.code);
                      setCopiedCode(createdCouponSuccess.code);
                      toast.success("Coupon code copied!");
                      setTimeout(() => setCopiedCode(null), 2500);
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 hover:border-[#00A38D] text-slate-600 dark:text-slate-200 hover:text-[#00A38D] transition-all cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode === createdCouponSuccess.code ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Summary Details */}
              <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-xl p-3.5 mb-6 text-left border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-400 dark:text-slate-500">Discount Benefit:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {createdCouponSuccess.discount_type === "percentage"
                      ? `${createdCouponSuccess.discount_value}% Off`
                      : `₹${Number(createdCouponSuccess.discount_value).toLocaleString("en-IN")} Flat Off`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-400 dark:text-slate-500">Applies To:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Booking Deposit
                  </span>
                </div>
                {createdCouponSuccess.title && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-400 dark:text-slate-500">Title:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                      {createdCouponSuccess.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdCouponSuccess.code);
                    toast.success("Coupon code copied!");
                    setCreatedCouponSuccess(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy & Close</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedCouponSuccess(null)}
                  className="flex-1 py-3 px-4 bg-[#00A38D] hover:bg-[#008f7b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

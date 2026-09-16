import { useState, useEffect } from "react";
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  Filter, 
  RotateCcw, 
  Calendar, 
  Download, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Car, 
  FileText, 
  Trash2, 
  Eye, 
  Send, 
  MessageSquare, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";

const API = API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  contacted: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  quoted: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  issued: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  contacted: <Phone size={13} />,
  quoted: <FileText size={13} />,
  issued: <Check size={13} />,
  rejected: <X size={13} />,
};

interface InsuranceRequest {
  id: number;
  request_no: string;
  customer_id?: number | null;
  vehicle_number: string;
  phone: string;
  plan_type: string;
  status: "pending" | "contacted" | "quoted" | "issued" | "rejected";
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export default function InsuranceRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State (50 items/page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Modal / Action States
  const [selectedReq, setSelectedReq] = useState<InsuranceRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [editNotes, setEditNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API}/api/admin/insurance-requests`, { headers })
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching insurance requests:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDetail = (req: InsuranceRequest) => {
    setSelectedReq(req);
    setEditStatus(req.status || "pending");
    setEditNotes(req.notes || "");
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReq) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/admin/insurance-requests/${selectedReq.id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
        }),
      });
      if (res.ok) {
        setDetailModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      console.error("Error updating insurance request status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this insurance request? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/admin/insurance-requests/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        if (selectedReq?.id === id) setDetailModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      console.error("Error deleting insurance request:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const uniquePlans = Array.from(new Set(requests.map(r => r.plan_type).filter(Boolean))).sort();

  // Filtering Logic
  const filtered = requests.filter(req => {
    // 1. Status Filter
    if (statusFilter !== "all" && req.status !== statusFilter) return false;

    // 2. Plan Filter
    if (planFilter !== "all" && (req.plan_type || "") !== planFilter) return false;

    // 3. Text Search
    const searchLower = search.toLowerCase().trim();
    if (searchLower) {
      const reqNo = (req.request_no || "").toLowerCase();
      const vehNo = (req.vehicle_number || "").toLowerCase();
      const phone = (req.phone || "").toLowerCase();
      const fullName = `${req.first_name || ""} ${req.last_name || ""}`.toLowerCase();
      const email = (req.email || "").toLowerCase();
      const notes = (req.notes || "").toLowerCase();

      const match = 
        reqNo.includes(searchLower) ||
        vehNo.includes(searchLower) ||
        phone.includes(searchLower) ||
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        notes.includes(searchLower);

      if (!match) return false;
    }

    // 4. Date Filter
    if (req.created_at) {
      const aDate = new Date(req.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        if (aDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (aDate < sevenDaysAgo) return false;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (aDate < thirtyDaysAgo) return false;
      } else if (dateFilter === "thisMonth") {
        if (aDate.getMonth() !== now.getMonth() || aDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (aDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (aDate > end) return false;
        }
      }
    }

    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (!filtered.length) {
      alert("No records to export.");
      return;
    }

    const headersList = [
      "Request No",
      "Vehicle Number",
      "Phone",
      "Customer Name",
      "Email",
      "Plan Selected",
      "Status",
      "Internal Notes",
      "Submission Date"
    ];

    const rows = filtered.map(req => {
      const customerName = `${req.first_name || ""} ${req.last_name || ""}`.trim() || "Guest";
      const dateFormatted = req.created_at ? new Date(req.created_at).toLocaleString("en-IN") : "";

      return [
        `"${req.request_no || ""}"`,
        `"${req.vehicle_number || ""}"`,
        `"${req.phone || ""}"`,
        `"${customerName}"`,
        `"${req.email || ""}"`,
        `"${req.plan_type || ""}"`,
        `"${(req.status || "pending").toUpperCase()}"`,
        `"${(req.notes || "").replace(/"/g, '""')}"`,
        `"${dateFormatted}"`
      ].join(",");
    });

    const csvContent = [headersList.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Insurance_Requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPlanFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedRequests = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Statistics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const contactedCount = requests.filter(r => r.status === "contacted").length;
  const issuedCount = requests.filter(r => r.status === "issued").length;

  return (
    <>
      <PageMeta 
        title="Insurance Requests | Selectt Admin"
        description="Review, process, and manage vehicle car insurance quote inquiries and leads."
      />

      <div className="space-y-6 pb-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Insurance Requests
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage instant car insurance inquiries, follow up with vehicle owners, and issue policies.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={fetchRequests}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
            >
              <RotateCcw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Leads</span>
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {totalCount}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">All submitted quote requests</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {pendingCount}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">Awaiting initial call / WhatsApp</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Contact</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Phone size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {contactedCount}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">Advisor contacted customer</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Policies Issued</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Check size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {issuedCount}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">Successfully converted deals</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by Vehicle No (e.g. MH02AB1234), Phone, Request ID, or Customer Name..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Coverage Plan Dropdown */}
            <select
              value={planFilter}
              onChange={e => { setPlanFilter(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="all">All Plan Types</option>
              {uniquePlans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>

            {/* Date Range Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                <select
                  value={dateFilter}
                  onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range...</option>
                </select>
              </div>
            </div>

            {(search || statusFilter !== "all" || planFilter !== "all" || dateFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === "custom" && (
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white"
              />
              <span className="text-xs font-medium text-gray-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800/80">
            {[
              { id: "all", label: "All Inquiries", count: requests.length },
              { id: "pending", label: "Pending", count: requests.filter(r => r.status === "pending").length },
              { id: "contacted", label: "Contacted", count: requests.filter(r => r.status === "contacted").length },
              { id: "quoted", label: "Quoted", count: requests.filter(r => r.status === "quoted").length },
              { id: "issued", label: "Issued", count: requests.filter(r => r.status === "issued").length },
              { id: "rejected", label: "Rejected", count: requests.filter(r => r.status === "rejected").length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  statusFilter === tab.id
                    ? "bg-white/20 dark:bg-gray-900/20 text-current"
                    : "bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading insurance requests...</p>
            </div>
          ) : paginatedRequests.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mb-3">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Insurance Requests Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== "all" || planFilter !== "all" || dateFilter !== "all"
                  ? "Try resetting your search query or filters to see more results."
                  : "When customers submit car insurance quote requests from the website, they will appear here."}
              </p>
              {(search || statusFilter !== "all" || planFilter !== "all" || dateFilter !== "all") && (
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded-xl hover:bg-teal-100 transition-colors"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">Vehicle Number</th>
                    <th className="py-3.5 px-4">Customer / Contact</th>
                    <th className="py-3.5 px-4">Plan Selected</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
                  {paginatedRequests.map(req => {
                    const customerName = `${req.first_name || ""} ${req.last_name || ""}`.trim();
                    const cleanPhone = (req.phone || "").replace(/\D/g, "");
                    const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello, regarding your Selectt Car Insurance quote request for vehicle ${req.vehicle_number} (${req.request_no}). How can we assist you today?`)}`;

                    return (
                      <tr 
                        key={req.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetail(req)}
                      >
                        {/* Request ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-md border border-teal-200/50 dark:border-teal-800/50">
                            {req.request_no}
                          </span>
                        </td>

                        {/* Vehicle Number (Indian License Plate Look) */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 text-white font-mono font-bold text-xs tracking-wider shadow-xs">
                            <span className="text-amber-400 text-[10px] font-bold uppercase tracking-tight pr-1 border-r border-gray-700">IND</span>
                            {req.vehicle_number}
                          </div>
                        </td>

                        {/* Customer / Contact */}
                        <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                              <User size={13} className="text-gray-400" />
                              {customerName || "Guest User"}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a 
                                href={`tel:${cleanPhone}`}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center gap-1 font-mono"
                              >
                                <Phone size={11} />
                                {req.phone}
                              </a>
                              {cleanPhone && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                            {req.email && (
                              <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Mail size={10} />
                                {req.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Plan Selected */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <ShieldCheck size={14} className="text-teal-500 shrink-0" />
                            {req.plan_type || "Comprehensive Plan"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[req.status] || STATUS_COLORS.pending}`}>
                            {STATUS_ICONS[req.status] || STATUS_ICONS.pending}
                            <span className="capitalize">{req.status || "pending"}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {req.created_at ? new Date(req.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) : "—"}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(req)}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors"
                              title="View & Edit Status"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              disabled={deletingId === req.id}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, filtered.length)}</b> of <b>{filtered.length}</b> inquiries</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="ml-2 px-2 py-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
                >
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details & Status Update Modal */}
      {detailModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Insurance Request Details
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-medium">
                    {selectedReq.request_no}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3.5 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Vehicle Number</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-900 text-white font-mono font-bold text-xs tracking-wider">
                      <span className="text-amber-400 text-[9px]">IND</span>
                      {selectedReq.vehicle_number}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan Selected</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {selectedReq.plan_type || "Comprehensive Plan"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer Contact</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {`${selectedReq.first_name || ""} ${selectedReq.last_name || ""}`.trim() || "Guest Submission"}
                  </p>
                  <a 
                    href={`tel:${selectedReq.phone}`} 
                    className="text-xs text-teal-600 dark:text-teal-400 font-mono flex items-center gap-1 hover:underline mt-0.5"
                  >
                    <Phone size={11} /> {selectedReq.phone}
                  </a>
                  {selectedReq.email && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {selectedReq.email}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date & Time</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                    {selectedReq.created_at ? new Date(selectedReq.created_at).toLocaleString("en-IN") : "—"}
                  </p>
                  {selectedReq.customer_id ? (
                    <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      ✓ Registered User (ID #{selectedReq.customer_id})
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] text-gray-400 font-medium mt-1">
                      Guest Lead
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedReq.phone?.replace(/\D/g, "")}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
                >
                  <Phone size={14} className="text-teal-500" />
                  Call Customer
                </a>
                <a
                  href={`https://wa.me/91${selectedReq.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, regarding your Selectt Car Insurance quote request for vehicle ${selectedReq.vehicle_number} (${selectedReq.request_no}). We have custom IRDAI policy quotes ready for you.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <MessageSquare size={14} className="text-emerald-500" />
                  WhatsApp Advisor Quote
                </a>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: "pending", label: "Pending", color: "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
                    { id: "contacted", label: "Contacted", color: "border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
                    { id: "quoted", label: "Quoted", color: "border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950/50" },
                    { id: "issued", label: "Issued", color: "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
                    { id: "rejected", label: "Rejected", color: "border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/50" },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditStatus(st.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all capitalize text-center ${
                        editStatus === st.id
                          ? `${st.color} shadow-xs scale-102`
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Internal Notes & Insurance Advisor Remarks
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g., Customer requested Zero-Dep quote from HDFC Ergo & ICICI Lombard. Follow-up scheduled tomorrow 4 PM."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedReq.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                Delete Request
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                >
                  {updating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

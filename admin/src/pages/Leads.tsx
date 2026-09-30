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
  ChevronRight,
  Building2,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Coins,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";

const API = API_URL;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  contacted: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  new: <Clock size={12} />,
  pending: <Clock size={12} />,
  contacted: <Phone size={12} />,
  in_progress: <RefreshCw size={12} />,
  converted: <CheckCircle2 size={12} />,
  closed: <X size={12} />,
};

const LEAD_TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  car_insurance: { label: "Car Insurance", color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300", icon: <ShieldCheck size={13} /> },
  dealer_partner: { label: "Dealer Partner", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300", icon: <Building2 size={13} /> },
  contact_us: { label: "Contact Us", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300", icon: <MessageSquare size={13} /> },
  buyback_inquiry: { label: "Buyback Assurance", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300", icon: <RefreshCw size={13} /> },
  loan_inquiry: { label: "Used Car Loan", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300", icon: <Coins size={13} /> },
  general_lead: { label: "General Lead", color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300", icon: <FileText size={13} /> },
};

interface Lead {
  id: number;
  lead_type?: string;
  name: string;
  email?: string | null;
  phone: string;
  subject?: string | null;
  message?: string | null;
  car_id?: number | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  details?: string | Record<string, any> | null;
  status: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export default function Leads() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination (50 items default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Detail Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("new");
  const [editNotes, setEditNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const activeToken = token || localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${activeToken}` };

  const fetchLeads = () => {
    const currentToken = token || localStorage.getItem("adminToken");
    if (!currentToken) return;
    setLoading(true);
    fetch(`${API}/api/admin/leads`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` } })
      .then(r => r.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching leads:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  // Parse details helper
  const parseDetails = (details: any) => {
    if (!details) return {};
    if (typeof details === "object") return details;
    try {
      return JSON.parse(details);
    } catch {
      return { Details: details };
    }
  };

  // Filter Logic
  const filtered = leads.filter(item => {
    // 1. Status Filter
    if (statusFilter !== "all" && item.status !== statusFilter) {
      if (!(statusFilter === "new" && item.status === "pending")) return false;
    }

    // 2. Type Filter
    if (typeFilter !== "all" && item.lead_type !== typeFilter) {
      return false;
    }

    // 3. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const detailsStr = typeof item.details === "string" ? item.details : JSON.stringify(item.details || {});
      const matches = 
        (item.name || "").toLowerCase().includes(q) ||
        (item.phone || "").toLowerCase().includes(q) ||
        (item.email || "").toLowerCase().includes(q) ||
        (item.subject || "").toLowerCase().includes(q) ||
        (item.message || "").toLowerCase().includes(q) ||
        (item.lead_type || "").toLowerCase().includes(q) ||
        (item.make || "").toLowerCase().includes(q) ||
        (item.model || "").toLowerCase().includes(q) ||
        detailsStr.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 4. Date Filter
    if (item.created_at) {
      const reqDate = new Date(item.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        if (reqDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (reqDate < sevenDaysAgo) return false;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (reqDate < thirtyDaysAgo) return false;
      } else if (dateFilter === "thisMonth") {
        if (reqDate.getMonth() !== now.getMonth() || reqDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (reqDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (reqDate > end) return false;
        }
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || typeFilter !== "all" || statusFilter !== "all" || dateFilter !== "all" || startDate || endDate;

  // Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === "new" || l.status === "pending").length;
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const contactedLeads = leads.filter(l => l.status === "contacted" || l.status === "in_progress").length;

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedLeads = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status || "new");
    setEditNotes(lead.admin_notes || "");
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/admin/leads/${selectedLead.id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: editStatus, admin_notes: editNotes })
      });
      if (res.ok) {
        fetchLeads();
        setModalOpen(false);
      } else {
        alert("Failed to update status");
      }
    } catch (e: any) {
      alert(e.message || "Error updating lead");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/admin/leads/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        if (selectedLead?.id === id) setModalOpen(false);
      } else {
        alert("Failed to delete lead");
      }
    } catch (e: any) {
      alert(e.message || "Error deleting lead");
    } finally {
      setDeletingId(null);
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (filtered.length === 0) {
      alert("No leads found matching current filter criteria to export.");
      return;
    }

    const headers = ["Lead ID", "Form / Lead Type", "Customer Name", "Phone", "Email", "Subject / Topic", "Vehicle Info", "Key Details", "Status", "Admin Notes", "Submitted At"];
    const rows = filtered.map(item => {
      const detailsObj = parseDetails(item.details);
      const detailsSummary = Object.entries(detailsObj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");

      const carInfo = item.make ? `${item.year || ''} ${item.make} ${item.model || ''}`.trim() : "N/A";

      return [
        item.id,
        item.lead_type || "general_lead",
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${(item.phone || "").replace(/"/g, '""')}"`,
        `"${(item.email || "N/A").replace(/"/g, '""')}"`,
        `"${(item.subject || "N/A").replace(/"/g, '""')}"`,
        `"${carInfo.replace(/"/g, '""')}"`,
        `"${(detailsSummary || item.message || "N/A").replace(/"/g, '""')}"`,
        item.status,
        `"${(item.admin_notes || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(item.created_at).toLocaleString("en-IN")}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `selectt_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Leads & Inquiries | Selectt Admin" description="Manage all website inbound leads, partner applications, and quote requests" />

      <div className="p-4 md:p-6 space-y-5">
        {/* Header & Metric Cards */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Leads & Form Inquiries</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {newLeads} new uncontacted leads • {filtered.length} total displayed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchLeads}
              className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              title="Refresh leads"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Inquiries</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalLeads}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">New / Uncontacted</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{newLeads}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">In Follow-Up</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{contactedLeads}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Converted</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{convertedLeads}</div>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Leads & Submissions</span>
              <span className="text-[11px] font-bold text-gray-400 normal-case">({filtered.length} matches)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Live Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search name, phone, email, details..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white"
              />
            </div>

            {/* 2. Form Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📂 All Form Types</option>
                <option value="car_insurance">🛡️ Car Insurance Quote</option>
                <option value="dealer_partner">🤝 Dealer Partner Application</option>
                <option value="contact_us">✉️ Contact Us Inquiry</option>
                <option value="buyback_inquiry">🚗 Buyback Assurance</option>
                <option value="loan_inquiry">🧮 Used Car Loan Inquiry</option>
                <option value="general_lead">📋 General Lead</option>
              </select>
            </div>

            {/* 3. Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏷️ All Statuses</option>
                <option value="new">🟡 New / Pending</option>
                <option value="contacted">🔵 Contacted</option>
                <option value="in_progress">🟣 In Progress</option>
                <option value="converted">🟢 Converted</option>
                <option value="closed">⚪ Closed</option>
              </select>
            </div>

            {/* 4. Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Date: All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium dark:bg-gray-800 dark:text-white"
              />
              <span className="text-xs font-bold text-gray-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Leads Table Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Form / Type</th>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Subject / Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      Loading leads...
                    </td>
                  </tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      No leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map(lead => {
                    const typeConfig = LEAD_TYPE_LABELS[lead.lead_type || "general_lead"] || LEAD_TYPE_LABELS.general_lead;
                    const detailsObj = parseDetails(lead.details);

                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        {/* Form Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeConfig.color}`}>
                            {typeConfig.icon}
                            <span>{typeConfig.label}</span>
                          </span>
                        </td>

                        {/* Customer & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-white">{lead.name || "Valued Customer"}</div>
                          <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone size={10} className="text-gray-400" />
                            <span>{lead.phone}</span>
                            {lead.email && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px]" title={lead.email}>{lead.email}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Details / Message */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          {lead.subject && (
                            <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">
                              {lead.subject}
                            </div>
                          )}
                          <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {lead.message || Object.entries(detailsObj).map(([k, v]) => `${k}: ${v}`).join(" | ") || "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                            {STATUS_ICONS[lead.status] || STATUS_ICONS.new}
                            <span>{lead.status}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 font-medium">
                          {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          <div className="text-[10px] text-gray-400">
                            {new Date(lead.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(lead)}
                              className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-[#1C3EB9]/10 hover:text-[#1C3EB9] rounded-lg text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                              title="View full lead details"
                            >
                              <Eye size={14} />
                            </button>
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Call customer"
                            >
                              <Phone size={14} />
                            </a>
                            <a
                              href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-teal-50 dark:bg-teal-950/40 text-[#00C9AF] hover:bg-teal-100 rounded-lg transition-colors"
                              title="WhatsApp chat"
                            >
                              <MessageSquare size={14} />
                            </a>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              disabled={deletingId === lead.id}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete lead"
                            >
                              <Trash2 size={14} />
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

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 font-semibold text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail & Status Modal */}
      {modalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#00C9AF]/15 text-[#00a892] flex items-center justify-center font-bold">
                  {LEAD_TYPE_LABELS[selectedLead.lead_type || "general_lead"]?.icon || <FileText size={16} />}
                </span>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Lead #{selectedLead.id} Details
                  </h3>
                  <span className="text-xs text-gray-400 capitalize">
                    {LEAD_TYPE_LABELS[selectedLead.lead_type || "general_lead"]?.label || selectedLead.lead_type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Customer Name</span>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm mt-0.5">{selectedLead.name}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Phone Number</span>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm mt-0.5">{selectedLead.phone}</p>
              </div>
              {selectedLead.email && (
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Email Address</span>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{selectedLead.email}</p>
                </div>
              )}
              {selectedLead.subject && (
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Topic / Subject</span>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{selectedLead.subject}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Submitted Date & Time</span>
                <p className="font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {new Date(selectedLead.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Parsed Custom Details */}
            {selectedLead.details && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Submission Specifics</span>
                <div className="bg-slate-50 dark:bg-gray-800 p-3.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs space-y-1.5">
                  {Object.entries(parseDetails(selectedLead.details)).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 capitalize">{k}:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-right">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Body */}
            {selectedLead.message && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Message / Note</span>
                <div className="bg-slate-50 dark:bg-gray-800 p-3.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedLead.message}
                </div>
              </div>
            )}

            {/* Status & Admin Notes Form */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Update Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold dark:bg-gray-800 dark:text-white"
                  >
                    <option value="new">🟡 New / Pending</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="in_progress">🟣 In Progress</option>
                    <option value="converted">🟢 Converted</option>
                    <option value="closed">⚪ Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Quick Contact</label>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-emerald-200"
                    >
                      <Phone size={12} /> Call
                    </a>
                    <a
                      href={`https://wa.me/91${selectedLead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-teal-50 text-[#00a892] font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-teal-200"
                    >
                      <MessageSquare size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Internal Admin Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  placeholder="Add notes about call discussion, next follow-up date, etc..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-5 py-2 bg-[#1C3EB9] hover:bg-[#153096] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

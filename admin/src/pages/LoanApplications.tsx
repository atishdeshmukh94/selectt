import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Clock, ExternalLink, User, Briefcase, FileText, Filter, RotateCcw, Calendar, Download, Landmark, ShieldCheck, FileCheck2, Trash2, CheckSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  approved: <Check size={13} />,
  rejected: <X size={13} />,
};

export default function LoanApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [professionFilter, setProfessionFilter] = useState("all");

  // Selection & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [updating, setUpdating] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingDocField, setDeletingDocField] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const activeToken = token || localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${activeToken}` };

  const fetchApplications = () => {
    const currentToken = token || localStorage.getItem("adminToken");
    if (!currentToken) return;
    setLoading(true);
    fetch(`${API}/api/loan-applications`, { 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` } 
    })
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching loan applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [token]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/loan-applications/${id}/status`, {
        method: "PUT", 
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally { setUpdating(null); }
  };

  const handleDeleteApplication = async (id: number, appNo: string) => {
    if (!window.confirm(`Are you sure you want to delete loan application #${appNo}? This will permanently remove the record and all attached documents.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/loan-applications/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setSelectedIds(prev => prev.filter(item => item !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
        fetchApplications();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete loan application.");
      }
    } catch (err) {
      console.error("Error deleting loan application:", err);
      alert("Failed to delete loan application.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDocument = async (appId: number, docField: string, docLabel: string) => {
    if (!window.confirm(`Are you sure you want to remove the ${docLabel} document?`)) {
      return;
    }
    setDeletingDocField(docField);
    try {
      const res = await fetch(`${API}/api/loan-applications/${appId}/documents/${docField}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setSelectedApp((prev: any) => prev ? { ...prev, [docField]: null } : null);
        fetchApplications();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to remove document.");
      }
    } catch (err) {
      console.error("Error removing document:", err);
      alert("Failed to remove document.");
    } finally {
      setDeletingDocField(null);
    }
  };

  // Toggle individual row selection
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle selection for current page
  const handleToggleSelectPage = (pageIds: number[]) => {
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Select all filtered items
  const handleSelectAllFiltered = (filteredItems: any[]) => {
    setSelectedIds(filteredItems.map(a => a.id));
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Delete all selected
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected loan applications? All submitted documents will be permanently deleted.`)) {
      return;
    }
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API}/api/loan-applications/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        if (selectedApp && selectedIds.includes(selectedApp.id)) setSelectedApp(null);
        fetchApplications();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete selected applications.");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete selected applications.");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Delete all applications (complete wipe)
  const handleDeleteAll = async () => {
    if (applications.length === 0) return;
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to DELETE ALL ${applications.length} loan applications? This action CANNOT be undone!`)) {
      return;
    }
    const allIds = applications.map(a => a.id);
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API}/api/loan-applications/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: allIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        setSelectedApp(null);
        fetchApplications();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete all applications.");
      }
    } catch (err) {
      console.error("Delete all error:", err);
      alert("Failed to delete all applications.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const uniqueProfessions = Array.from(new Set(applications.map(a => a.profession_type).filter(Boolean))).sort();

  const filtered = applications.filter(a => {
    // 1. Status Filter
    const matchesStatus = filter === "all" || a.status === filter;

    // 2. Text Search
    const fullName = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
    const email = (a.email || "").toLowerCase();
    const phone = (a.phone || "").toLowerCase();
    const appNo = (a.application_no || "").toLowerCase();
    const searchLower = search.toLowerCase().trim();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower) || appNo.includes(searchLower);

    // 3. Profession Filter
    const matchesProfession = professionFilter === "all" || (a.profession_type || "").toLowerCase() === professionFilter.toLowerCase();

    // 4. Date Filter
    let matchesDate = true;
    if (a.created_at) {
      const aDate = new Date(a.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = aDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = aDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = aDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = aDate.getMonth() === now.getMonth() && aDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && aDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && aDate <= end;
        }
      }
    }

    return matchesStatus && matchesSearch && matchesProfession && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, dateFilter, professionFilter, startDate, endDate, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedApplications = filtered.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setProfessionFilter("all");
  };

  const hasActiveFilters = search || filter !== "all" || dateFilter !== "all" || professionFilter !== "all" || startDate || endDate;

  const counts: Record<string, number> = { 
    all: applications.length, 
    pending: applications.filter(a => a.status === "pending").length, 
    approved: applications.filter(a => a.status === "approved").length, 
    rejected: applications.filter(a => a.status === "rejected").length 
  };

  const getDocUrl = (path: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API}${path}`;
  };

  // CSV Export Handler
  const exportCSV = () => {
    const csvHeaders = ["Application No", "Customer Name", "Phone", "Email", "Profession", "Documents Count", "Status", "Submitted Date"];
    const rows = filtered.map(a => {
      const docFields = ['pan_card', 'aadhar_card', 'bank_statement', 'salary_slip', 'gst_certificate', 'gumasta_license', 'electricity_bill', 'msme_certificate'];
      const docCount = docFields.filter(f => a[f]).length;
      return [
        a.application_no || "",
        `${a.first_name || ""} ${a.last_name || ""}`.trim(),
        a.phone || "",
        a.email || "",
        a.profession_type || "",
        `${docCount} Files`,
        a.status || "pending",
        new Date(a.created_at).toLocaleDateString("en-IN")
      ];
    });

    const csvContent = [csvHeaders, ...rows].map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loan_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Loan Applications & Financing | Selectt Admin" description="Manage customer car loan applications with document verification" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Loan Applications</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Review, verify, and approve customer car financing and loan document submissions</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "pending", "approved", "rejected"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all capitalize shadow-2xs cursor-pointer ${filter === s ? "bg-[#465FFF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}>
                  {s} ({counts[s]})
                </button>
              ))}
            </div>

            {/* Bulk Selection & Action Controls */}
            {applications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectedIds.length === applications.length ? handleClearSelection : () => setSelectedIds(applications.map(a => a.id))}
                  className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs"
                  title={selectedIds.length === applications.length ? "Deselect All" : "Select All Applications"}
                >
                  <CheckSquare size={14} className={selectedIds.length > 0 ? "text-[#1C3EB9]" : "text-slate-400"} />
                  <span>{selectedIds.length === applications.length ? "Deselect All" : `Select All (${applications.length})`}</span>
                </button>

                {selectedIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    <span>{bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
                    title="Delete all loan applications"
                  >
                    <Trash2 size={14} />
                    <span>Delete All</span>
                  </button>
                )}
              </div>
            )}

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Download size={15} />
              <span>Export CSV ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Total Applications</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{applications.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Landmark size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Pending Review</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{counts.pending}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Approved Loans</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{counts.approved}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Verified Document Files</span>
              <span className="text-xl font-black text-[#1C3EB9] mt-0.5 block">
                {applications.reduce((acc, a) => {
                  const docFields = ['pan_card', 'aadhar_card', 'bank_statement', 'salary_slip', 'gst_certificate', 'gumasta_license', 'electricity_bill', 'msme_certificate'];
                  return acc + docFields.filter(f => a[f]).length;
                }, 0)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center">
              <FileCheck2 size={20} />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-gray-200 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Loan Applications</span>
              <span className="text-[11px] font-bold text-slate-400 normal-case">({filtered.length} applications)</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by name, email, phone, app no..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏷️ All Statuses ({applications.length})</option>
                <option value="pending">Pending ({counts.pending})</option>
                <option value="approved">Approved ({counts.approved})</option>
                <option value="rejected">Rejected ({counts.rejected})</option>
              </select>
            </div>

            {/* Date Filter Dropdown */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Application Date: All Time</option>
                <option value="today">Applied Today</option>
                <option value="7days">Applied Last 7 Days</option>
                <option value="30days">Applied Last 30 Days</option>
                <option value="thisMonth">Applied This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Profession Filter Dropdown */}
            <div>
              <select
                value={professionFilter}
                onChange={e => setProfessionFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">💼 All Professions ({uniqueProfessions.length})</option>
                {uniqueProfessions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Controls */}
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9]">
                  <Calendar className="size-3.5" />
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Custom Date Range</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label 
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) {
                      try { (input as any).showPicker(); } catch (err) {}
                    }
                  }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 hover:border-[#1C3EB9] rounded-xl px-3.5 py-2 shadow-2xs cursor-pointer transition-all active:scale-98"
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase select-none">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    onClick={e => {
                      try { (e.currentTarget as any).showPicker(); } catch (err) {}
                    }}
                    className="bg-transparent border-none text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-32"
                  />
                </label>
                <span className="text-xs font-extrabold text-slate-400">→</span>
                <label 
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) {
                      try { (input as any).showPicker(); } catch (err) {}
                    }
                  }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 hover:border-[#1C3EB9] rounded-xl px-3.5 py-2 shadow-2xs cursor-pointer transition-all active:scale-98"
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase select-none">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    onClick={e => {
                      try { (e.currentTarget as any).showPicker(); } catch (err) {}
                    }}
                    className="bg-transparent border-none text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-32"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Selection Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black text-[#1C3EB9] dark:text-blue-300">
                {selectedIds.length} of {applications.length} loan applications selected
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              {selectedIds.length < filtered.length ? (
                <button
                  type="button"
                  onClick={() => handleSelectAllFiltered(filtered)}
                  className="text-xs font-extrabold text-[#1C3EB9] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Select all {filtered.length} matching
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-500">All matching selected</span>
              )}
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-black text-slate-700 dark:text-gray-300 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={bulkDeleting}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <Trash2 size={14} />
                <span>{bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-extrabold text-xs uppercase tracking-wider animate-pulse">Loading Loan Applications...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-30" />
              <p className="font-extrabold text-sm text-slate-600 dark:text-gray-300">No loan applications match your filter criteria</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-[#1C3EB9] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-gray-800 text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={paginatedApplications.length > 0 && paginatedApplications.every(a => selectedIds.includes(a.id))}
                        onChange={() => handleToggleSelectPage(paginatedApplications.map(a => a.id))}
                        className="w-4 h-4 rounded text-[#1C3EB9] focus:ring-[#1C3EB9] border-gray-300 dark:border-gray-700 cursor-pointer accent-[#1C3EB9]"
                        title="Select / Deselect all on current page"
                      />
                    </th>
                    {["App No", "Customer Details", "Profession", "Documents", "Submitted Date", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-gray-800">
                  {paginatedApplications.map(a => {
                    const docFields = ['pan_card', 'aadhar_card', 'bank_statement', 'salary_slip', 'gst_certificate', 'gumasta_license', 'electricity_bill', 'msme_certificate'];
                    const docCount = docFields.filter(f => a[f]).length;
                    const isSelected = selectedIds.includes(a.id);
                    
                    return (
                      <tr key={a.id} className={`transition-colors ${isSelected ? 'bg-blue-50/70 dark:bg-blue-950/30' : 'hover:bg-slate-50/70 dark:hover:bg-gray-800/40'}`}>
                        <td className="px-4 py-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(a.id)}
                            className="w-4 h-4 rounded text-[#1C3EB9] focus:ring-[#1C3EB9] border-gray-300 dark:border-gray-700 cursor-pointer accent-[#1C3EB9]"
                          />
                        </td>
                        <td className="px-5 py-4 font-mono text-xs font-black text-[#1C3EB9]">
                          {a.application_no}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900 dark:text-white capitalize text-xs">{a.first_name} {a.last_name}</div>
                          <div className="text-xs text-slate-500 font-semibold">{a.email} • {a.phone}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="capitalize px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-xs font-black text-slate-700 dark:text-gray-300 border border-slate-200/80 dark:border-gray-700">
                            {a.profession_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700 dark:text-gray-300 font-extrabold text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 font-black text-[11px]">
                            {docCount} Files Attached
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-800 dark:text-gray-200 font-extrabold text-xs whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border capitalize ${STATUS_COLORS[a.status]}`}>
                            {STATUS_ICONS[a.status]} {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedApp(a)} 
                              className="text-xs font-black px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <FileText size={13} className="text-[#1C3EB9]" />
                              View Docs
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(a.id, a.application_no)}
                              disabled={deletingId === a.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 disabled:opacity-40"
                              title="Delete Loan Application"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-gray-800/60 border-t border-slate-200/80 dark:border-gray-800 text-xs text-slate-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <strong className="text-slate-900 dark:text-white font-extrabold">{totalItems > 0 ? startIndex + 1 : 0}</strong> to <strong className="text-slate-900 dark:text-white font-extrabold">{endIndex}</strong> of <strong className="text-slate-900 dark:text-white font-extrabold">{totalItems}</strong> entries
                  </span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[11px] font-bold text-slate-400">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={e => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-extrabold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;
                      return (
                        <span key={p} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-xl font-black transition-all cursor-pointer flex items-center justify-center text-xs ${
                              currentPage === p
                                ? "bg-[#1C3EB9] text-white shadow-xs"
                                : "bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Docs Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Loan Application File</h2>
                <p className="text-xs font-mono font-bold text-[#1C3EB9]">#{selectedApp.application_no}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500 cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700">
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase mb-1 flex items-center gap-1"><User size={12}/> Customer Info</div>
                  <div className="font-black text-slate-900 dark:text-white">{selectedApp.first_name} {selectedApp.last_name}</div>
                  <div className="text-xs text-slate-500 font-semibold">{selectedApp.email}</div>
                  <div className="text-xs text-slate-500 font-semibold">{selectedApp.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase mb-1 flex items-center gap-1"><Briefcase size={12}/> Employment / Business</div>
                  <div className="font-black text-slate-900 dark:text-white capitalize">{selectedApp.profession_type}</div>
                  <div className="text-xs text-slate-500 font-semibold">Submitted: {new Date(selectedApp.created_at).toLocaleString("en-IN")}</div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Submitted Verification Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "PAN Card", field: "pan_card" },
                    { label: "Aadhar Card", field: "aadhar_card" },
                    { label: "Bank Statement", field: "bank_statement" },
                    { label: "Salary Slip", field: "salary_slip" },
                    { label: "GST Certificate", field: "gst_certificate" },
                    { label: "Gumasta License", field: "gumasta_license" },
                    { label: "Electricity Bill", field: "electricity_bill" },
                    { label: "MSME Certificate", field: "msme_certificate" },
                  ].map(doc => {
                    const url = getDocUrl(selectedApp[doc.field]);
                    if (!url) return null;
                    
                    return (
                      <div key={doc.field} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-[#1C3EB9] transition-all group bg-white dark:bg-gray-800/40">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9] group-hover:bg-[#1C3EB9] group-hover:text-white transition-colors shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-slate-800 dark:text-gray-200 truncate">{doc.label}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                              Open file <ExternalLink size={10} />
                            </span>
                          </div>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(selectedApp.id, doc.field, doc.label)}
                          disabled={deletingDocField === doc.field}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer ml-2 shrink-0 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
                          title={`Delete ${doc.label}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update & Delete Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-gray-800 space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase text-center tracking-wider">Update Loan Application Status</label>
                <div className="flex gap-3">
                  <button onClick={() => updateStatus(selectedApp.id, "rejected")} disabled={updating === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 rounded-2xl font-black text-xs transition-colors disabled:opacity-60 cursor-pointer">
                    <X size={16} /> Reject Application
                  </button>
                  <button onClick={() => updateStatus(selectedApp.id, "approved")} disabled={updating === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs transition-colors disabled:opacity-60 cursor-pointer shadow-md">
                    <Check size={16} /> Approve Loan
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteApplication(selectedApp.id, selectedApp.application_no)}
                  disabled={deletingId === selectedApp.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-black transition-colors cursor-pointer border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-300"
                >
                  <Trash2 size={14} /> Delete This Loan File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

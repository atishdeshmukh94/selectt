import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Clock, Car, User, Calendar as CalendarIcon, MapPin, Filter, RotateCcw, Download, Eye, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const getImageUrl = (img?: string) => {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${API}${img}`;
  return `${API}/${img}`;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800",
  approved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  approved: <Check size={13} />,
  rejected: <X size={13} />,
};

export default function TestDriveRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [updating, setUpdating] = useState<number | null>(null);

  // Car Details Modal State
  const [selectedRequestModal, setSelectedRequestModal] = useState<any | null>(null);

  const activeToken = token || localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${activeToken}` };

  const fetchRequests = () => {
    const currentToken = token || localStorage.getItem("adminToken");
    if (!currentToken) return;
    setLoading(true);
    fetch(`${API}/api/test-drives`, { 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` } 
    })
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching test drives:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [token]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/test-drives/${id}/status`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
        if (selectedRequestModal && selectedRequestModal.id === id) {
          setSelectedRequestModal((prev: any) => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally { setUpdating(null); }
  };

  const uniqueLocations = Array.from(new Set(requests.map(r => r.location).filter(Boolean))).sort();

  const filtered = requests.filter(r => {
    // 1. Status Filter
    const matchesStatus = filter === "all" || r.status?.toLowerCase() === filter.toLowerCase();

    // 2. Text Search
    const customerName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
    const carInfo = `${r.year || ""} ${r.make || ""} ${r.model || ""} ${r.variant || ""} ${r.registration_no || r.registrationNo || ""}`.toLowerCase();
    const searchLower = search.toLowerCase().trim();
    const matchesSearch = !searchLower || customerName.includes(searchLower) || carInfo.includes(searchLower) || r.email?.toLowerCase().includes(searchLower) || r.phone?.includes(searchLower);

    // 3. Location Filter
    const matchesLocation = locationFilter === "all" || (r.location || "").toLowerCase() === locationFilter.toLowerCase();

    // 4. Date Filter
    let matchesDate = true;
    if (r.created_at || r.date_day) {
      const rDate = new Date(r.created_at || r.date_day);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = rDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = rDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = rDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && rDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && rDate <= end;
        }
      }
    }

    return matchesStatus && matchesSearch && matchesLocation && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, dateFilter, locationFilter, startDate, endDate, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRequests = filtered.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setLocationFilter("all");
  };

  const hasActiveFilters = search || filter !== "all" || dateFilter !== "all" || locationFilter !== "all" || startDate || endDate;

  const counts: Record<string, number> = { 
    all: requests.length, 
    pending: requests.filter(r => r.status?.toLowerCase() === "pending").length, 
    approved: requests.filter(r => r.status?.toLowerCase() === "approved").length, 
    rejected: requests.filter(r => r.status?.toLowerCase() === "rejected").length 
  };

  // CSV Export Handler
  const exportCSV = () => {
    const csvHeaders = ["ID", "Customer Name", "Phone", "Email", "Car Make", "Car Model", "Registration No", "Test Drive Location", "Drive Date", "Time Slot", "Status", "Requested Date"];
    const rows = filtered.map(r => [
      r.id,
      `${r.first_name || ""} ${r.last_name || ""}`.trim(),
      r.phone || "",
      r.email || "",
      r.make || "",
      `${r.model || ""} ${r.variant || ""}`.trim(),
      r.registration_no || r.registrationNo || `MH-${(r.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + r.car_id)}`,
      r.location || "",
      `${r.date_day || ""} (${r.date_label || ""})`,
      r.slot || "",
      r.status || "pending",
      new Date(r.created_at).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...rows].map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `test_drive_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Test Drive Requests | Selectt Admin" description="Manage car test drive bookings with date and location filters" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Test Drive Requests</h1>
            <p className="text-sm text-gray-500">{counts.pending} pending requests ({filtered.length} matching filters)</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "pending", "approved", "rejected"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all capitalize shadow-2xs cursor-pointer ${filter === s ? "bg-[#465FFF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}>
                  {s} ({counts[s]})
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-[#0C1B33] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <Download size={14} />
              <span>Export CSV ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Test Drives</span>
              <span className="text-[11px] font-bold text-gray-400 normal-case">({filtered.length} requests)</span>
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search customer, car, email..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏷️ All Statuses ({requests.length})</option>
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

            {/* Location Filter Dropdown */}
            <div>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📍 All Locations ({uniqueLocations.length})</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Controls */}
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9]">
                  <CalendarIcon className="size-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Custom Date Range</span>
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

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-16 text-center text-gray-400 font-extrabold text-xs uppercase tracking-wider animate-pulse">Loading Test Drives...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-30" />
              <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No test drive requests match your filter criteria</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#1C3EB9] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100/90 dark:bg-gray-800 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["Customer", "Car Details", "Registration No", "Location", "Date & Time", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedRequests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 border border-brand-100 dark:border-brand-900/40">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 dark:text-white capitalize">{r.first_name} {r.last_name}</div>
                            <div className="text-xs text-gray-500 font-semibold">{r.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button 
                          onClick={() => setSelectedRequestModal(r)}
                          className="flex items-center gap-2 text-left group cursor-pointer"
                        >
                          <Car size={14} className="text-[#1C3EB9] shrink-0" />
                          <div>
                            <div className="font-extrabold text-gray-900 dark:text-gray-100 uppercase text-xs group-hover:text-[#1C3EB9] transition-colors flex items-center gap-1">
                              <span>{r.year} {r.make} {r.model}</span>
                              <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1C3EB9]" />
                            </div>
                            <div className="text-[10px] text-gray-500 font-extrabold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded inline-block font-mono mt-0.5">
                              ID: #{r.car_id}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                          {r.registration_no || r.registrationNo || `MH-${(r.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + r.car_id)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-extrabold capitalize">
                          <MapPin size={13} className="text-[#1C3EB9]" />
                          {r.location}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-extrabold text-gray-900 dark:text-gray-100">
                            <CalendarIcon size={13} className="text-[#1C3EB9]" />
                            {r.date_day} ({r.date_label})
                          </div>
                          <div className="text-xs font-semibold text-gray-500 ml-4.5">{r.slot}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border capitalize ${STATUS_COLORS[r.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {STATUS_ICONS[r.status] || <Clock size={13} />}
                          <span className="leading-none">{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {r.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(r.id, "approved")}
                                disabled={updating === r.id}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                title="Approve"
                              >
                                <Check size={15} />
                              </button>
                              <button 
                                onClick={() => updateStatus(r.id, "rejected")}
                                disabled={updating === r.id}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                title="Reject"
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {r.status !== 'pending' && (
                             <button 
                               onClick={() => updateStatus(r.id, "pending")}
                               disabled={updating === r.id}
                               className="text-xs font-bold text-gray-400 hover:text-brand-500 hover:underline transition-all disabled:opacity-50 cursor-pointer"
                             >
                               Reset to Pending
                             </button>
                          )}
                        </div>
                      </td>
                      </tr>
                    ))}
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
                              className={`w-8 h-8 rounded-xl font-extrabold transition-all cursor-pointer flex items-center justify-center text-xs ${
                              currentPage === p
                                ? "bg-[#155DFC] text-white shadow-md shadow-blue-500/20"
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

      {/* Car & Booking Details Modal Popup */}
      {selectedRequestModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
            {/* Modal Image & Header */}
            <div className="relative h-56 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
              {selectedRequestModal.image ? (
                <img
                  src={getImageUrl(selectedRequestModal.image)}
                  alt={selectedRequestModal.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car size={50} className="text-slate-600" />
              )}
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full text-white text-xs font-mono font-bold">
                Car ID #{selectedRequestModal.car_id}
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-tight">
                  {selectedRequestModal.year} {selectedRequestModal.make} {selectedRequestModal.model} {selectedRequestModal.variant}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {selectedRequestModal.price && (
                    <span className="text-lg font-black text-[#1C3EB9]">₹{Number(selectedRequestModal.price).toLocaleString()}</span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold uppercase">
                    Reg: {selectedRequestModal.registration_no || selectedRequestModal.registrationNo || `MH-${(selectedRequestModal.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + selectedRequestModal.car_id)}`}
                  </span>
                </div>
              </div>

              {/* Customer Booking Section */}
              <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 space-y-3">
                <div className="text-xs font-extrabold text-[#1C3EB9] uppercase tracking-wider">Test Drive Booking Details</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold uppercase block text-[10px]">Customer Name</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{selectedRequestModal.first_name} {selectedRequestModal.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase block text-[10px]">Phone Number</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{selectedRequestModal.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase block text-[10px]">Drive Date & Time</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{selectedRequestModal.date_day} ({selectedRequestModal.date_label}) • {selectedRequestModal.slot}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase block text-[10px]">Test Drive Hub / Location</span>
                    <span className="font-extrabold text-gray-900 dark:text-white capitalize">{selectedRequestModal.location}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-500">Current Status: <strong className="capitalize text-gray-800 dark:text-gray-200">{selectedRequestModal.status}</strong></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedRequestModal.id, "rejected")}
                    disabled={updating === selectedRequestModal.id}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequestModal.id, "approved")}
                    disabled={updating === selectedRequestModal.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  RotateCcw, 
  Globe, 
  MapPin, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye, 
  X,
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";

interface VisitorLog {
  id: number;
  session_id: string;
  visitor_id: string;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  page_url: string;
  page_title: string;
  referrer: string;
  device_type: string;
  browser: string;
  os: string;
  duration_seconds: number;
  is_bounce: number;
  created_at: string;
  updated_at: string;
}

export default function VisitorReports() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<string[]>([]);
  
  // Pagination & Filtering
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let start = startDate;
      let end = endDate;

      if (dateFilter === "today") {
        const today = new Date().toISOString().split("T")[0];
        start = today;
        end = today;
      } else if (dateFilter === "7days") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split("T")[0];
        end = new Date().toISOString().split("T")[0];
      } else if (dateFilter === "30days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.toISOString().split("T")[0];
        end = new Date().toISOString().split("T")[0];
      }

      let url = `${API_URL}/api/admin/analytics/logs?page=${page}&limit=${limit}&sortBy=created_at&sortOrder=DESC`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (cityFilter !== "all") url += `&city=${encodeURIComponent(cityFilter)}`;
      if (deviceFilter !== "all") url += `&device=${encodeURIComponent(deviceFilter)}`;
      if (start && end) url += `&startDate=${start}&endDate=${end}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
        if (data.filterOptions?.cities) {
          setCities(data.filterOptions.cities);
        }
      }
    } catch (err) {
      console.error("Error fetching visitor logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token, page, limit, cityFilter, deviceFilter, dateFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCityFilter("all");
    setDeviceFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this visitor record?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics/logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs(prev => prev.filter(l => l.id !== id));
        setTotalRecords(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = [
      "ID",
      "Visitor ID",
      "Session ID",
      "IP Address",
      "City",
      "Region",
      "Country",
      "Page URL",
      "Page Title",
      "Duration (s)",
      "Device",
      "Browser",
      "OS",
      "Referrer",
      "Bounce",
      "Date Time"
    ];

    const rows = logs.map(l => [
      l.id,
      l.visitor_id,
      l.session_id,
      l.ip_address,
      `"${l.city || ''}"`,
      `"${l.region || ''}"`,
      `"${l.country || ''}"`,
      `"${l.page_url || ''}"`,
      `"${(l.page_title || '').replace(/"/g, '""')}"`,
      l.duration_seconds,
      l.device_type,
      l.browser,
      l.os,
      `"${(l.referrer || '').replace(/"/g, '""')}"`,
      l.is_bounce ? "Yes" : "No",
      new Date(l.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Selectt_Visitor_Reports_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta
        title="Visitor Reports & Logs | Selectt Admin"
        description="Comprehensive real-time website visitor activity, geo-location, and duration reports"
      />

      <div className="space-y-4 sm:space-y-5">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-gray-800 p-4 sm:px-6 sm:py-4 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Website Visitor & Traffic Logs
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C3EB9] bg-[#1C3EB9]/10 px-2.5 py-0.5 rounded-full border border-[#1C3EB9]/20">
                <span>{totalRecords.toLocaleString()} Total Records</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Detailed tracking data including visitor locations, page journeys, device analytics, and time spent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={logs.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-gray-800 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-2xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search URL, Page Title, IP, City, Visitor ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9]"
              />
            </div>

            {/* City Filter */}
            <div>
              <select
                value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9] cursor-pointer"
              >
                <option value="all">📍 All Locations (Cities)</option>
                {cities.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Device Filter */}
            <div>
              <select
                value={deviceFilter}
                onChange={e => { setDeviceFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9] cursor-pointer"
              >
                <option value="all">📱 All Devices</option>
                <option value="Desktop">🖥️ Desktop</option>
                <option value="Mobile">📱 Mobile</option>
                <option value="Tablet">📟 Tablet</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9] cursor-pointer"
              >
                <option value="all">📅 All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
          </form>

          {/* Custom Date Range if selected */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
              />
              <button
                onClick={fetchLogs}
                className="px-3 py-1.5 rounded-xl bg-[#1C3EB9] text-white text-xs font-bold hover:bg-[#153096]"
              >
                Apply
              </button>
            </div>
          )}

          {/* Reset Filters */}
          {(search || cityFilter !== "all" || deviceFilter !== "all" || dateFilter !== "all") && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-500">Filtered results: {totalRecords} matching visits</span>
              <button
                onClick={handleResetFilters}
                className="text-[#1C3EB9] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Visitor / Session</th>
                  <th className="py-3 px-4">Location & IP</th>
                  <th className="py-3 px-4">Page Visited</th>
                  <th className="py-3 px-4 text-center">Time Spent</th>
                  <th className="py-3 px-4">Device & OS</th>
                  <th className="py-3 px-4 text-center">Journey Status</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <div className="w-8 h-8 rounded-full border-2 border-[#1C3EB9] border-t-transparent animate-spin mx-auto mb-2"></div>
                      <span className="font-semibold text-xs">Loading Visitor Logs...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Globe className="size-8 mx-auto mb-2 text-gray-300 stroke-1" />
                      <span className="font-semibold text-xs">No visitor logs found matching criteria</span>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const DeviceIcon = log.device_type === "Mobile" ? Smartphone : (log.device_type === "Tablet" ? Tablet : Monitor);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        {/* Visitor / Session */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] font-bold text-gray-900 dark:text-white">
                            {log.visitor_id.substring(0, 10)}...
                          </div>
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {log.session_id.substring(0, 8)}
                          </span>
                        </td>

                        {/* Location & IP */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                            <MapPin className="size-3 text-emerald-600 shrink-0" />
                            <span>{log.city || "Raipur"}</span>
                            {log.region && <span className="text-gray-400 font-normal">, {log.region}</span>}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block pl-4.5">
                            {log.ip_address || "127.0.0.1"}
                          </span>
                        </td>

                        {/* Page Visited */}
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="font-bold text-[#1C3EB9] truncate" title={log.page_url}>
                            {log.page_url}
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate block" title={log.page_title}>
                            {log.page_title || "Selectt"}
                          </span>
                        </td>

                        {/* Time Spent */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            log.duration_seconds >= 60 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" 
                              : (log.duration_seconds >= 15 ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300")
                          }`}>
                            <Clock className="size-3" />
                            <span>{formatDuration(log.duration_seconds)}</span>
                          </span>
                        </td>

                        {/* Device & OS */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                            <DeviceIcon className="size-3.5 text-gray-500" />
                            <span>{log.device_type}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block pl-5">
                            {log.browser} • {log.os}
                          </span>
                        </td>

                        {/* Journey Status */}
                        <td className="py-3 px-4 text-center">
                          {log.is_bounce ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                              Single Page Bounce
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Active / Multi-page
                            </span>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {new Date(log.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-[#1C3EB9] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="View Session Details"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="size-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div className="text-gray-500 font-medium">
              Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} records
            </div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-semibold cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>

              <span className="font-bold text-gray-800 dark:text-gray-200 px-2">
                Page {page} of {totalPages || 1}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center font-bold">
                <Globe className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Visitor Session Inspection
                </h3>
                <span className="text-xs text-gray-400 font-mono">Record #{selectedLog.id}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Visitor ID</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white break-all">{selectedLog.visitor_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Session ID</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white break-all">{selectedLog.session_id}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Page URL:</span>
                  <span className="font-bold text-[#1C3EB9]">{selectedLog.page_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Page Title:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLog.page_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referrer:</span>
                  <span className="text-gray-600 dark:text-gray-400 font-mono text-[11px] truncate max-w-[220px]">{selectedLog.referrer || 'Direct'}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Location</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.city}, {selectedLog.region}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedLog.country}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Client IP</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedLog.ip_address}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Device</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.device_type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Browser</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.browser}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">OS</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.os}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Duration on Page:</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatDuration(selectedLog.duration_seconds)} ({selectedLog.duration_seconds} seconds)
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

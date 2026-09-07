import { useState, useEffect } from "react";
import { Search, Download, Calendar, User, Navigation, Filter, RotateCcw, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function WishlistReport() {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const fetchReports = () => {
    setLoading(true);
    fetch(`${API}/api/reports/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching wishlist reports:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  // Extract unique brands & locations dynamically
  const uniqueBrands = Array.from(new Set(reports.map(r => r.make).filter(Boolean))).sort();
  const uniqueLocations = Array.from(new Set(reports.map(r => r.car_location || r.city).filter(Boolean))).sort();

  // Filter Logic
  const filtered = reports.filter(r => {
    // 1. Text Search
    const searchLower = search.toLowerCase().trim();
    const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
    const carName = `${r.make || ""} ${r.model || ""} ${r.variant || ""}`.toLowerCase();
    const phone = `${r.phone || ""}`;
    const locationInfo = `${r.city || ""} ${r.state || ""} ${r.car_location || ""}`.toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || carName.includes(searchLower) || phone.includes(searchLower) || locationInfo.includes(searchLower);

    // 2. Brand Filter
    const matchesBrand = brandFilter === "all" || (r.make || "").toLowerCase() === brandFilter.toLowerCase();

    // 3. Location Filter
    const matchesLocation = locationFilter === "all" || (r.car_location || r.city || "").toLowerCase() === locationFilter.toLowerCase();

    // 4. Date Filter
    let matchesDate = true;
    if (r.wishlisted_at) {
      const itemDate = new Date(r.wishlisted_at);
      const now = new Date();
      
      if (dateFilter === "today") {
        matchesDate = itemDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = itemDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = itemDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && itemDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && itemDate <= end;
        }
      }
    }

    return matchesSearch && matchesBrand && matchesLocation && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter, brandFilter, locationFilter, startDate, endDate, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedReports = filtered.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch("");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setBrandFilter("all");
    setLocationFilter("all");
  };

  const hasActiveFilters = search || dateFilter !== "all" || brandFilter !== "all" || locationFilter !== "all" || startDate || endDate;

  const exportCSV = () => {
    const headers = ["Date Added", "Customer Name", "Customer Phone", "Customer Location", "Car Make", "Car Model", "Car Year", "Car Variant", "Car Price", "Car Location"];
    const rows = filtered.map(r => [
      new Date(r.wishlisted_at).toLocaleDateString(),
      `${r.first_name || ""} ${r.last_name || ""}`.trim(),
      r.phone || "",
      `${r.city || ""}, ${r.state || ""}`.trim(),
      r.make || "",
      r.model || "",
      r.year || "",
      r.variant || "N/A",
      r.price || 0,
      r.car_location || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wishlist_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Wishlist Reports | Selectt Admin" description="Reports of all wishlisted cars with advanced filters" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Wishlisted Cars</h1>
            <p className="text-sm text-gray-500 font-medium">Download, filter, and monitor wishlisted cars across all customers</p>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download size={18} />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Wishlist Data</span>
              <span className="text-[11px] font-bold text-gray-400 normal-case">({filtered.length} items found)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search customer, car, location..." 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Date Range Selector */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 All Time (Any Date)</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Brand / Make Filter */}
            <div>
              <select
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🚗 All Car Makes ({uniqueBrands.length})</option>
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📍 All Locations ({uniqueLocations.length})</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Picker inputs (Visible if custom selected) */}
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9]">
                  <Calendar className="size-3.5" />
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

        {/* Data Table Container */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Generating Wishlist Report...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
               <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No wishlisted cars found matching your filter criteria</p>
               <button
                 onClick={resetFilters}
                 className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1C3EB9] hover:underline cursor-pointer"
               >
                 Clear all filters
               </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100/90 dark:bg-gray-800 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3">Date Added</th>
                    <th className="px-5 py-3">Customer Details</th>
                    <th className="px-5 py-3">Car Details</th>
                    <th className="px-5 py-3">Location Information</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedReports.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200 font-extrabold uppercase">
                          <Calendar size={14} className="text-[#1C3EB9]" />
                          {new Date(r.wishlisted_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/80 dark:border-gray-700">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 dark:text-white capitalize text-xs">{r.first_name} {r.last_name}</div>
                            <div className="text-xs text-gray-500 font-semibold">{r.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-extrabold text-gray-900 dark:text-gray-100 uppercase text-xs flex items-center gap-1">
                              <span>{r.make} {r.model}</span>
                              {r.variant && <span className="text-[11px] font-semibold text-gray-500 normal-case">({r.variant})</span>}
                            </div>
                            <div className="text-xs text-[#1C3EB9] font-extrabold mt-0.5">
                              {r.year} • ₹{(r.price / 100000).toFixed(2)} Lakh
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                         <div className="space-y-1">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-gray-400 font-extrabold uppercase w-16">Customer:</span>
                               <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                 <Navigation size={12} className="text-blue-500" />
                                 {r.city}, {r.state}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-gray-400 font-extrabold uppercase w-16">Car At:</span>
                               <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                 <Navigation size={12} className="text-[#1C3EB9]" />
                                 {r.car_location || 'N/A'}
                               </span>
                            </div>
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
    </>
  );
}

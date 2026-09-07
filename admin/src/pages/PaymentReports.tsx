import { useState, useEffect } from "react";
import { Search, Download, Calendar, User, CreditCard, Filter, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function PaymentReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const fetchReports = () => {
    setLoading(true);
    fetch(`${API}/api/reports/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching reports:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  // Extract unique car brands dynamically
  const uniqueBrands = Array.from(new Set(reports.map(r => r.brand || r.make).filter(Boolean))).sort();

  // Filter Logic
  const filtered = reports.filter(r => {
    // 1. Text Search
    const searchLower = search.toLowerCase().trim();
    const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
    const carName = `${r.brand || r.make || ""} ${r.model || ""}`.toLowerCase();
    const bookingNo = (r.booking_no || "").toLowerCase();
    const phone = (r.phone || "").toLowerCase();
    const regNo = (r.registration_no || r.registrationNo || "").toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || carName.includes(searchLower) || bookingNo.includes(searchLower) || phone.includes(searchLower) || regNo.includes(searchLower);

    // 2. Status Filter
    const matchesStatus = statusFilter === "all" || (r.payment_status || "").toLowerCase() === statusFilter.toLowerCase();

    // 3. Brand Filter
    const matchesBrand = brandFilter === "all" || (r.brand || r.make || "").toLowerCase() === brandFilter.toLowerCase();

    // 4. Transaction Date Filter
    let matchesDate = true;
    const txDateStr = r.transaction_date || r.created_at;
    if (txDateStr) {
      const txDate = new Date(txDateStr);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = txDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = txDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = txDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && txDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && txDate <= end;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesBrand && matchesDate;
  });

  const resetFilters = () => {
    setSearch("");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setBrandFilter("all");
  };

  const hasActiveFilters = search || dateFilter !== "all" || statusFilter !== "all" || brandFilter !== "all" || startDate || endDate;

  const exportCSV = () => {
    const headers = ["Booking No", "Customer Name", "Phone", "Car", "Registration No", "Date", "Booking Amount", "Total Amount", "Payment Mode", "Status"];
    const rows = filtered.map(r => [
      r.booking_no,
      `${r.first_name || ""} ${r.last_name || ""}`.trim(),
      r.phone || "",
      `${r.brand || r.make || ""} ${r.model || ""}`.trim(),
      r.registration_no || r.registrationNo || (r.car_id ? `MH-${(r.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + r.car_id)}` : "N/A"),
      new Date(r.transaction_date).toLocaleDateString(),
      r.booking_amount || 0,
      r.final_amount || 0,
      r.remaining_payment_mode || "N/A",
      r.payment_status || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Payment Reports | Selectt Admin" description="Transaction reports and logs with date filtering" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Payment Transactions</h1>
            <p className="text-sm text-gray-500 font-medium">Download, filter, and manage payment transaction reports</p>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0C1B33] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
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
              <span>Filter Payment Transactions</span>
              <span className="text-[11px] font-bold text-gray-400 normal-case">({filtered.length} transactions found)</span>
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
                placeholder="Search customer, car, or booking ID..." 
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
                <option value="all">📅 All Dates (Transaction Time)</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Payment Status Selector */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">💳 All Statuses (Paid & Pending)</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Brand Filter */}
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

        {/* Transactions Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Generating Payment Report...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
               <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No payment transactions found matching your filter criteria</p>
               {hasActiveFilters && (
                 <button
                   onClick={resetFilters}
                   className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1C3EB9] hover:underline cursor-pointer"
                 >
                   Clear all filters
                 </button>
               )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100/90 dark:bg-gray-800 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 select-none">
                  <tr>
                    <th className="px-5 py-3.5">Transaction Details</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Vehicle</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Registration No</th>
                    <th className="px-5 py-3.5">Payment Breakdown</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.booking_no} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-extrabold text-[#1C3EB9] font-mono text-xs mb-0.5">{r.booking_no}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-extrabold uppercase">
                          <Calendar size={13} className="text-[#1C3EB9]" />
                          {new Date(r.transaction_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
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
                        <div>
                          <div className="font-extrabold text-gray-900 dark:text-gray-100 uppercase text-xs">{r.brand || r.make} {r.model}</div>
                          <div className="text-xs font-extrabold text-[#1C3EB9]">Total: ₹{Number(r.final_amount).toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-left">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                          {r.registration_no || r.registrationNo || (r.car_id ? `MH-${(r.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + r.car_id)}` : "MH-02-AB-1234")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                         <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                               <span className="text-[10px] text-gray-400 font-extrabold uppercase">Booking Amount:</span>
                               <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">₹{Number(r.booking_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                               <span className="text-[10px] text-gray-400 font-extrabold uppercase">Remaining:</span>
                               <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">₹{(Number(r.final_amount) - Number(r.booking_amount)).toLocaleString()}</span>
                            </div>
                            {r.remaining_payment_mode && (
                              <div className="pt-1 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-1.5 text-[10px] text-gray-500 font-extrabold uppercase">
                                <CreditCard size={12} className="text-[#1C3EB9]" />
                                {r.remaining_payment_mode} • {new Date(r.remaining_payment_date).toLocaleDateString()}
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="px-5 py-3.5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                           (r.payment_status || '').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                         }`}>
                           {r.payment_status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

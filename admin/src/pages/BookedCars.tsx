import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Calendar, CheckCircle, Filter, RotateCcw, Download, Car, Landmark, Clock, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  failed: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  completed: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
};

export default function BookedCars() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanInterestFilter, setLoanInterestFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [updating, setUpdating] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchBookings = () => {
    setLoading(true);
    fetch(`${API}/api/bookings`, { headers })
      .then(r => r.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: number, field: "booking_status" | "payment_status", value: string, additionalData = {}) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/bookings/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ [field]: value, ...additionalData })
      });
      if (res.ok) {
        fetchBookings();
        setShowCompleteModal(false);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    } finally { setUpdating(null); }
  };

  const handleComplete = (booking: any) => {
    setSelectedBooking(booking);
    setShowCompleteModal(true);
  };

  // Check if booking customer requested/interested in loan
  const checkLoanInterest = (b: any): boolean => {
    if (b.interested_in_loan == 1 || b.interested_in_loan === true || b.interested_in_loan === "yes" || b.interested_in_loan === "1") return true;
    if (b.need_loan == 1 || b.need_loan === true || b.need_loan === "yes" || b.need_loan === "1") return true;
    if (b.loan_interest == 1 || b.loan_interest === true || b.loan_interest === "yes" || b.loan_interest === "1") return true;
    if (b.is_loan_interested == 1 || b.is_loan_interested === true || b.is_loan_interested === "yes" || b.is_loan_interested === "1") return true;
    return false;
  };

  const filtered = bookings.filter(b => {
    // 1. Status Filter
    const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;

    // 2. Loan Interest Filter
    const isLoanInterested = checkLoanInterest(b);
    const matchesLoan = loanInterestFilter === "all" || 
      (loanInterestFilter === "yes" && isLoanInterested) || 
      (loanInterestFilter === "no" && !isLoanInterested);

    // 3. Text Search
    const searchLower = search.toLowerCase().trim();
    const fullName = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
    const carName = `${b.make || ""} ${b.model || ""} ${b.variant || ""} ${b.registration_no || b.registrationNo || ""}`.toLowerCase();
    const bookingNo = (b.booking_no || "").toLowerCase();
    const phone = (b.phone || "").toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || carName.includes(searchLower) || bookingNo.includes(searchLower) || phone.includes(searchLower);

    // 4. Date Filter
    let matchesDate = true;
    if (b.created_at) {
      const bDate = new Date(b.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = bDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = bDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = bDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && bDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && bDate <= end;
        }
      }
    }

    return matchesStatus && matchesLoan && matchesSearch && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, loanInterestFilter, dateFilter, startDate, endDate, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedBookings = filtered.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setLoanInterestFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = search || statusFilter !== "all" || loanInterestFilter !== "all" || dateFilter !== "all" || startDate || endDate;

  // KPI Calculations
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed").length;
  const loanInterestedCount = bookings.filter(b => checkLoanInterest(b)).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.booking_amount) || 0), 0);

  // CSV Export Handler
  const exportCSV = () => {
    const csvHeaders = ["Booking No", "Customer Name", "Phone", "Email", "Vehicle", "Registration No", "Booking Amount", "Total Price", "Payment Status", "Booking Status", "Interested in Loan", "Booking Date"];
    const rows = filtered.map(b => [
      b.booking_no || "",
      `${b.first_name || ""} ${b.last_name || ""}`.trim(),
      b.phone || "",
      b.email || "",
      `${b.year || ""} ${b.make || ""} ${b.model || ""} ${b.variant || ""}`.trim(),
      b.registration_no || b.registrationNo || `MH-${(b.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + b.car_id)}`,
      b.booking_amount || 0,
      b.final_amount || 0,
      b.payment_status || "pending",
      b.booking_status || "pending",
      checkLoanInterest(b) ? "Interested" : "Self-Financed",
      new Date(b.created_at).toLocaleDateString("en-IN")
    ]);

    const csvContent = [csvHeaders, ...rows].map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `booked_cars_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMeta title="Booked Cars & Reservations | Selectt Admin" description="Manage car reservations, loan interest, and payments" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Booked Cars</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage customer vehicle reservations, loan interests, and payment completions</p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Download size={16} />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>

        {/* KPI Metrics Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Total Reservations</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalBookings}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Confirmed / Completed</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{confirmedBookings}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Interested in Loan</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 block">{loanInterestedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Landmark size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Token Advances Collected</span>
              <span className="text-xl font-black text-[#1C3EB9] mt-0.5 block">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-gray-200 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Reservations</span>
              <span className="text-[11px] font-bold text-slate-400 normal-case">({filtered.length} matching)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
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
                placeholder="Search customer, booking ID, or car..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏷️ All Booking Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Loan Interest Filter Dropdown */}
            <div>
              <select
                value={loanInterestFilter}
                onChange={e => setLoanInterestFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏦 All Loan Interests</option>
                <option value="yes">✓ Interested in Loan</option>
                <option value="no">✕ Self-Financed (No Loan)</option>
              </select>
            </div>

            {/* Date Filter Dropdown */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Booking Date: All Time</option>
                <option value="today">Booked Today</option>
                <option value="7days">Booked Last 7 Days</option>
                <option value="30days">Booked Last 30 Days</option>
                <option value="thisMonth">Booked This Month</option>
                <option value="custom">Custom Date Range...</option>
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
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Custom Booking Range</span>
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-20 text-center">
               <div className="w-8 h-8 border-4 border-[#1C3EB9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Loading reservation data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-20 mb-1 text-slate-400" />
              <p className="font-extrabold text-sm text-slate-600 dark:text-gray-300">No car bookings found matching your filter criteria</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-[#1C3EB9] hover:underline cursor-pointer"
                >
                  Clear all active filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-gray-800/80 text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Booking Info</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Customer Details</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Vehicle Specs</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Registration No</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Token Advance</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Booking Status</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Loan Interest</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-gray-800">
                  {paginatedBookings.map(b => {
                    const isLoanInterested = checkLoanInterest(b);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-black text-[#1C3EB9] mb-0.5 whitespace-nowrap">{b.booking_no}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 font-extrabold uppercase flex items-center gap-1 whitespace-nowrap">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(b.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-black text-slate-900 dark:text-white text-xs leading-tight mb-0.5 whitespace-nowrap">{b.first_name} {b.last_name}</div>
                          <div className="text-xs text-slate-500 font-semibold mb-1 whitespace-nowrap">{b.phone}</div>
                          {b.test_drive_date ? (
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 w-max whitespace-nowrap">
                              <span>Drive: {b.test_drive_date} • {b.test_drive_slot}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic whitespace-nowrap">No Test Drive</span>
                          )}
                        </td>

                        <td className="px-5 py-4 max-w-[220px]">
                          <div>
                            <div className="font-black text-slate-900 dark:text-white uppercase text-xs leading-snug break-words">{b.make} {b.model} {b.variant || ""}</div>
                            <div className="text-xs text-[#1C3EB9] font-black whitespace-nowrap mt-1">{b.year} • ₹{(b.final_amount/100000).toFixed(2)} Lakh</div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                            {b.registration_no || b.registrationNo || `MH-${(b.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + b.car_id)}`}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                 <span className="text-xs font-black text-slate-900 dark:text-white">₹{Number(b.booking_amount).toLocaleString()}</span>
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${PAYMENT_STATUS_COLORS[b.payment_status] || "bg-gray-100 text-gray-700"}`}>
                                   {b.payment_status}
                                 </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-extrabold whitespace-nowrap">Total: ₹{Number(b.final_amount).toLocaleString()}</div>
                           </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border capitalize ${BOOKING_STATUS_COLORS[b.booking_status] || "bg-gray-100 text-gray-700"}`}>
                             {b.booking_status}
                          </span>
                        </td>

                        {/* LOAN INTEREST COLUMN BUG FIX */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isLoanInterested ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                              <Landmark size={12} />
                              <span>✓ Interested</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400 border border-slate-200 dark:border-gray-700">
                              <span>✕ Self-Financed</span>
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {b.booking_status === 'pending' && (
                               <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'confirmed')}
                                disabled={updating === b.id}
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Confirm Booking"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            
                            {b.booking_status === 'confirmed' && (
                              <button 
                                onClick={() => handleComplete(b)}
                                disabled={updating === b.id}
                                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Mark Completed"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}

                            {b.booking_status !== 'cancelled' && b.booking_status !== 'completed' && (
                              <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'cancelled')}
                                disabled={updating === b.id}
                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                <X size={16} />
                              </button>
                            )}
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

        {/* Completion Modal */}
        {showCompleteModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Complete Reservation & Collect Final Payment</h3>
              <p className="text-xs text-slate-500 font-semibold">
                You are completing booking <strong className="text-[#1C3EB9] font-mono">#{selectedBooking.booking_no}</strong> for customer <strong>{selectedBooking.first_name} {selectedBooking.last_name}</strong>.
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-gray-300 mb-1">Final Payment Method</label>
                  <select 
                    value={paymentMode} 
                    onChange={e => setPaymentMode(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-gray-300 mb-1">Final Payment Date</label>
                  <input 
                    type="date" 
                    value={paymentDate} 
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-gray-800">
                <button 
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => updateStatus(selectedBooking.id, 'booking_status', 'completed', { payment_mode: paymentMode, payment_date: paymentDate })}
                  disabled={updating === selectedBooking.id}
                  className="px-5 py-2 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Confirm Completion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

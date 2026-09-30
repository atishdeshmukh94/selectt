import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Calendar, CheckCircle, Filter, RotateCcw, Download, Car, Landmark, Clock, TrendingUp, ShieldCheck, DollarSign, Wrench, Eye, Phone, Mail, User, MapPin } from "lucide-react";
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
  const [maintenanceFilter, setMaintenanceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [updating, setUpdating] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const activeToken = token || localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${activeToken}` };

  const fetchBookings = () => {
    const currentToken = token || localStorage.getItem("adminToken");
    if (!currentToken) return;
    setLoading(true);
    fetch(`${API}/api/bookings`, { 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` } 
    })
      .then(r => r.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [token]);

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
        if (detailBooking && detailBooking.id === id) {
          setDetailBooking((prev: any) => ({ ...prev, [field]: value, ...additionalData }));
        }
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    } finally { setUpdating(null); }
  };

  const handleComplete = (booking: any) => {
    setSelectedBooking(booking);
    setShowCompleteModal(true);
  };

  const handleViewDetails = (booking: any) => {
    setDetailBooking(booking);
    setShowDetailModal(true);
  };

  // Check if booking customer requested/interested in loan
  const checkLoanInterest = (b: any): boolean => {
    if (b.interested_in_loan == 1 || b.interested_in_loan === true || b.interested_in_loan === "yes" || b.interested_in_loan === "1") return true;
    if (b.need_loan == 1 || b.need_loan === true || b.need_loan === "yes" || b.need_loan === "1") return true;
    if (b.loan_interest == 1 || b.loan_interest === true || b.loan_interest === "yes" || b.loan_interest === "1") return true;
    if (b.is_loan_interested == 1 || b.is_loan_interested === true || b.is_loan_interested === "yes" || b.is_loan_interested === "1") return true;
    return false;
  };

  // Check 1-Year Complete Maintenance Package
  const checkMaintenancePkg = (b: any) => {
    const isAdded = b.maintenance_package == 1 || b.maintenance_package === true || b.maintenance_package === "1" || !!b.maintenance_plan_type;
    const planType = b.maintenance_plan_type || (b.maintenance_price > 1000 ? "full" : "monthly");
    const price = b.maintenance_price || (planType === "full" ? 11287 : 990);
    return { isAdded, planType, price };
  };

  const filtered = bookings.filter(b => {
    // 1. Status Filter
    const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;

    // 2. Loan Interest Filter
    const isLoanInterested = checkLoanInterest(b);
    const matchesLoan = loanInterestFilter === "all" || 
      (loanInterestFilter === "yes" && isLoanInterested) || 
      (loanInterestFilter === "no" && !isLoanInterested);

    // 3. Maintenance Package Filter
    const pkg = checkMaintenancePkg(b);
    const matchesMaintenance = maintenanceFilter === "all" ||
      (maintenanceFilter === "yes" && pkg.isAdded) ||
      (maintenanceFilter === "no" && !pkg.isAdded);

    // 4. Text Search
    const searchLower = search.toLowerCase().trim();
    const fullName = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
    const carName = `${b.make || ""} ${b.model || ""} ${b.variant || ""} ${b.registration_no || b.registrationNo || ""}`.toLowerCase();
    const bookingNo = (b.booking_no || "").toLowerCase();
    const phone = (b.phone || "").toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || carName.includes(searchLower) || bookingNo.includes(searchLower) || phone.includes(searchLower);

    // 5. Date Filter
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

    return matchesStatus && matchesLoan && matchesMaintenance && matchesSearch && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, loanInterestFilter, maintenanceFilter, dateFilter, startDate, endDate, itemsPerPage]);

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
    setMaintenanceFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = search || statusFilter !== "all" || loanInterestFilter !== "all" || maintenanceFilter !== "all" || dateFilter !== "all" || startDate || endDate;

  // KPI Calculations
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.booking_status === "confirmed" || b.booking_status === "completed").length;
  const loanInterestedCount = bookings.filter(b => checkLoanInterest(b)).length;
  const maintenancePkgCount = bookings.filter(b => checkMaintenancePkg(b).isAdded).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.booking_amount) || 0), 0);

  // CSV Export Handler
  const exportCSV = () => {
    const csvHeaders = ["Booking No", "Customer Name", "Phone", "Email", "Vehicle", "Registration No", "1-Yr Maintenance Pkg", "Booking Amount", "Total Price", "Payment Status", "Booking Status", "Interested in Loan", "Booking Date"];
    const rows = filtered.map(b => {
      const pkg = checkMaintenancePkg(b);
      return [
        b.booking_no || "",
        `${b.first_name || ""} ${b.last_name || ""}`.trim(),
        b.phone || "",
        b.email || "",
        `${b.year || ""} ${b.make || ""} ${b.model || ""} ${b.variant || ""}`.trim(),
        b.registration_no || b.registrationNo || `MH-${(b.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + b.car_id)}`,
        pkg.isAdded ? `1-Yr Pkg (${pkg.planType === 'full' ? 'Full ₹11,287' : 'Monthly ₹990/m'})` : "None",
        b.booking_amount || 0,
        b.final_amount || 0,
        b.payment_status || "pending",
        b.booking_status || "pending",
        checkLoanInterest(b) ? "Interested" : "Self-Financed",
        new Date(b.created_at).toLocaleDateString("en-IN")
      ];
    });

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
      <PageMeta title="Booked Cars & Reservations | Selectt Admin" description="Manage car reservations, loan interest, maintenance packages, and payments" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Booked Cars</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage customer vehicle reservations, maintenance packages, loan interests, and payment completions</p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Download size={16} />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>

        {/* KPI Metrics Summary Bar (5 Pillars) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Total Bookings</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalBookings}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Confirmed</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{confirmedBookings}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">1-Yr Maintenance</span>
              <span className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5 block">{maintenancePkgCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wrench size={18} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Loan Interested</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 block">{loanInterestedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Landmark size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider block">Token Advances</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search customer, car..." 
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
                <option value="all">🏷️ All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Maintenance Package Filter */}
            <div>
              <select
                value={maintenanceFilter}
                onChange={e => setMaintenanceFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🛡️ Maintenance: All</option>
                <option value="yes">✓ With 1-Yr Package</option>
                <option value="no">✕ No Package</option>
              </select>
            </div>

            {/* Loan Interest Filter Dropdown */}
            <div>
              <select
                value={loanInterestFilter}
                onChange={e => setLoanInterestFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">🏦 Loan: All</option>
                <option value="yes">✓ Interested in Loan</option>
                <option value="no">✕ Self-Financed</option>
              </select>
            </div>

            {/* Date Filter Dropdown */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Date: All Time</option>
                <option value="today">Booked Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range...</option>
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
                    <th className="px-4 py-3.5 whitespace-nowrap">Booking Info</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Vehicle Specs</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Registration No</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">1-Yr Maintenance</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Token Advance</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Booking Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Loan Interest</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-gray-800">
                  {paginatedBookings.map(b => {
                    const isLoanInterested = checkLoanInterest(b);
                    const pkg = checkMaintenancePkg(b);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-black text-[#1C3EB9] mb-0.5 whitespace-nowrap">{b.booking_no}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 font-extrabold uppercase flex items-center gap-1 whitespace-nowrap">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(b.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
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

                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <div className="font-black text-slate-900 dark:text-white uppercase text-xs leading-snug break-words">{b.make} {b.model} {b.variant || ""}</div>
                            <div className="text-xs text-[#1C3EB9] font-black whitespace-nowrap mt-1">{b.year} • ₹{(b.final_amount/100000).toFixed(2)} Lakh</div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                            {b.registration_no || b.registrationNo || `MH-${(b.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + b.car_id)}`}
                          </span>
                        </td>

                        {/* 1-Yr Maintenance Package Column */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {pkg.isAdded ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs">
                              <Wrench size={12} className="text-teal-600" />
                              <span>{pkg.planType === 'full' ? '1-Yr (₹11,287)' : '1-Yr (₹990/m)'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 italic">— None</span>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
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

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border capitalize ${BOOKING_STATUS_COLORS[b.booking_status] || "bg-gray-100 text-gray-700"}`}>
                             {b.booking_status}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
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

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDetails(b)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="View Full Booking Details"
                            >
                              <Eye size={15} />
                            </button>

                            {b.booking_status === 'pending' && (
                               <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'confirmed')}
                                disabled={updating === b.id}
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Confirm Booking"
                              >
                                <Check size={15} />
                              </button>
                            )}
                            
                            {b.booking_status === 'confirmed' && (
                              <button 
                                onClick={() => handleComplete(b)}
                                disabled={updating === b.id}
                                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Mark Completed"
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}

                            {b.booking_status !== 'cancelled' && b.booking_status !== 'completed' && (
                              <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'cancelled')}
                                disabled={updating === b.id}
                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                <X size={15} />
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

        {/* Full Details Modal */}
        {showDetailModal && detailBooking && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reservation Details</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                    #{detailBooking.booking_no}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Customer Information</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Name</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{detailBooking.first_name} {detailBooking.last_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Phone</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{detailBooking.phone || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium block">Email</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{detailBooking.email || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Box */}
              <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vehicle Information</span>
                <div className="text-xs space-y-1.5">
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {detailBooking.year} {detailBooking.make} {detailBooking.model} {detailBooking.variant || ""}
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-gray-300">
                    <span>Registration No:</span>
                    <span className="font-mono font-bold">{detailBooking.registration_no || detailBooking.registrationNo || `MH-${(detailBooking.car_id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + detailBooking.car_id)}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-gray-300">
                    <span>Vehicle Price:</span>
                    <span className="font-black text-[#1C3EB9]">₹{Number(detailBooking.final_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons & Services */}
              <div className="space-y-2.5 text-xs">
                {/* 1-Yr Maintenance Package */}
                {(() => {
                  const pkg = checkMaintenancePkg(detailBooking);
                  return (
                    <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench size={16} className="text-teal-600" />
                        <div>
                          <span className="font-black text-teal-950 dark:text-teal-200 block">1-Year Maintenance Package</span>
                          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                            {pkg.isAdded ? `Plan: ${pkg.planType === 'full' ? 'Pay in Full (₹11,287)' : 'Pay Monthly (₹990/m)'}` : 'Not Subscribed'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${pkg.isAdded ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {pkg.isAdded ? 'Active' : 'No'}
                      </span>
                    </div>
                  );
                })()}

                {/* Car Loan Interest */}
                <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-purple-600" />
                    <div>
                      <span className="font-black text-purple-950 dark:text-purple-200 block">Car Loan Assistance</span>
                      <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">
                        {checkLoanInterest(detailBooking) ? 'Buyer requested finance support' : 'Self-Financed / Direct Payment'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${checkLoanInterest(detailBooking) ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {checkLoanInterest(detailBooking) ? 'Interested' : 'Self'}
                  </span>
                </div>

                {/* Test Drive Details */}
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-blue-600" />
                    <div>
                      <span className="font-black text-blue-950 dark:text-blue-200 block">Test Drive Status</span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                        {detailBooking.test_drive_date ? `${detailBooking.test_drive_date} • ${detailBooking.test_drive_slot}` : 'No test drive scheduled'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${detailBooking.test_drive_date ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {detailBooking.test_drive_date ? 'Booked' : 'None'}
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-gray-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                {detailBooking.booking_status === 'pending' && (
                  <button
                    onClick={() => updateStatus(detailBooking.id, 'booking_status', 'confirmed')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 shadow-md cursor-pointer"
                  >
                    Confirm Reservation
                  </button>
                )}
                {detailBooking.booking_status === 'confirmed' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleComplete(detailBooking);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 shadow-md cursor-pointer"
                  >
                    Complete & Collect Final Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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

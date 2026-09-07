import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Check, X, AlertCircle, Clock, FileText, Filter, RotateCcw, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

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

const LocationCell = ({ location }: { location: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (!location) return <span className="text-gray-400 text-xs">—</span>;

  const words = location.trim().split(/\s+/);
  const isLong = words.length > 3 || location.length > 25;
  const shortText = isLong ? words.slice(0, 3).join(" ") + "..." : location;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => isLong && setExpanded(!expanded)}
        title={location}
        className={`text-left text-xs transition-colors ${
          isLong ? "cursor-pointer hover:text-brand-600 dark:hover:text-brand-400" : "cursor-default"
        }`}
      >
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {expanded ? location : shortText}
        </span>
        {isLong && (
          <span className="ml-1 text-[10px] text-brand-500 font-bold underline">
            {expanded ? "less" : "more"}
          </span>
        )}
      </button>
    </div>
  );
};

export default function SellRequests() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  // Date & City Filter States
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [editForm, setEditForm] = useState<any>({});

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API}/api/sell-requests`, { headers })
      .then(r => r.json()).then(data => setRequests(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`${API}/api/sell-requests/${id}/status`, {
        method: "PUT", headers,
        body: JSON.stringify({ 
          status, 
          admin_notes: adminNotes,
          ...editForm
        })
      });
      fetchRequests();
      setSelectedReq(null);
      setAdminNotes("");
      setEditForm({});
    } finally { setUpdating(null); }
  };

  // Extract unique cities
  const uniqueCities = Array.from(new Set(requests.map(r => r.location).filter(Boolean))).sort();

  // Multi-parameter filter logic
  const filtered = requests.filter(r => {
    // 1. Status Filter
    const matchesStatus = filter === "all" || r.status === filter;

    // 2. Text Search
    const searchLower = search.toLowerCase().trim();
    const matchesSearch = !searchLower || `${r.make} ${r.model} ${r.customer_name} ${r.customer_phone} ${r.location}`.toLowerCase().includes(searchLower);

    // 3. City Filter
    const matchesCity = cityFilter === "all" || (r.location || "").toLowerCase() === cityFilter.toLowerCase();

    // 4. Date Filter
    let matchesDate = true;
    if (r.created_at) {
      const reqDate = new Date(r.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = reqDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = reqDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = reqDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && reqDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && reqDate <= end;
        }
      }
    }

    return matchesStatus && matchesSearch && matchesCity && matchesDate;
  });

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setCityFilter("all");
  };

  const hasActiveFilters = search || filter !== "all" || dateFilter !== "all" || cityFilter !== "all" || startDate || endDate;

  const counts = { 
    all: requests.length, 
    pending: requests.filter(r => r.status === "pending").length, 
    approved: requests.filter(r => r.status === "approved").length, 
    rejected: requests.filter(r => r.status === "rejected").length 
  };

  return (
    <>
      <PageMeta title="Sell Requests | Selectt Admin" description="Manage car sell requests with date and location filters" />
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Inbound Sell Requests</h1>
            <p className="text-sm text-gray-500">{counts.pending} pending review ({filtered.length} matching filters)</p>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all capitalize shadow-2xs ${filter === s ? "bg-[#465FFF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Sell Requests</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by car, customer, phone..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Date Filter Dropdown */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Submitted: All Dates</option>
                <option value="today">Submitted Today</option>
                <option value="7days">Submitted Last 7 Days</option>
                <option value="30days">Submitted Last 30 Days</option>
                <option value="thisMonth">Submitted This Month</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📍 All Locations ({uniqueCities.length})</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
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
            <div className="py-16 text-center text-gray-400 font-extrabold text-xs uppercase tracking-wider animate-pulse">Loading Sell Requests...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-30" />
              <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No sell requests match your filter criteria</p>
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
              <table className="w-full text-xs">
                <thead className="bg-gray-100/90 dark:bg-gray-800 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["Car", "Customer", "Contact", "KM / Ownership", "Location", "Submitted", "Inspection", "Status", "Actions"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-extrabold text-gray-900 dark:text-white text-xs">{r.year} {r.make} {r.model}</div>
                        <div className="text-[10px] text-gray-500 font-semibold mt-0.5 whitespace-nowrap">
                          {r.variant}{r.fuel_type && !r.variant?.toLowerCase().includes(r.fuel_type?.toLowerCase()) ? ` • ${r.fuel_type}` : ""}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-extrabold text-gray-800 dark:text-gray-200 text-xs">{r.customer_name || `${r.first_name || ""} ${r.last_name || ""}`.trim() || "Guest"}</div>
                        <div className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]" title={r.customer_email}>{r.customer_email}</div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-semibold">{r.customer_phone}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-semibold">{r.km ? `${r.km.toLocaleString('en-IN')} km` : "—"} · {r.ownership}</td>
                      <td className="px-3 py-2.5 text-xs max-w-[200px]"><LocationCell location={r.location} /></td>
                      <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200 font-extrabold text-[11px] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                        {r.inspection_date ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="font-extrabold text-brand-600 dark:text-brand-400 text-xs">
                              {isNaN(new Date(r.inspection_date).getTime()) ? r.inspection_date : new Date(r.inspection_date).toLocaleDateString("en-IN")}
                            </div>
                            {r.inspection_time && (
                              <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                {r.inspection_time}
                              </div>
                            )}
                            {r.inspection_notes && (
                              <div className="text-[9px] text-gray-400 leading-tight" title={r.inspection_notes}>
                                {r.inspection_notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border capitalize ${STATUS_COLORS[r.status]}`}>
                          {STATUS_ICONS[r.status]} {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {r.status === 'approved' && r.car_id ? (
                          <button onClick={() => navigate(`/cars/edit/${r.car_id}`)} className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-brand-500 bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors cursor-pointer">
                            Listed - Edit Car
                          </button>
                        ) : (
                          <button onClick={() => { 
                              setSelectedReq(r); 
                              setAdminNotes(r.admin_notes || ""); 

                              const computedFuel = r.fuel_type || (r.variant?.toLowerCase().includes('diesel') ? 'Diesel' 
                                         : r.variant?.toLowerCase().includes('cng') ? 'CNG'
                                         : r.variant?.toLowerCase().includes('electric') || r.variant?.toLowerCase().includes('ev') ? 'Electric'
                                         : r.variant?.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Petrol');

                              const computedTransmission = r.transmission || (r.variant?.toLowerCase().includes('automatic') || r.variant?.toLowerCase().includes('amt') || r.variant?.toLowerCase().includes('at') ? 'Automatic' : 'Manual');

                              let computedPrice = r.asking_price;
                              if (!computedPrice || Number(computedPrice) === 0) {
                                  const makeStr = r.make || "";
                                  const modelStr = r.model || "";
                                  const yearNum = Number(r.year || 2020);
                                  const kmNum = Number(r.km || 0);
                                  const ownershipStr = r.ownership || "";
                                  const cityStr = r.location || "Mumbai";

                                  const localMakesAndModels: Record<string, Record<string, { base: number, demand: number }>> = {
                                    'maruti suzuki': {
                                      swift: { base: 7.8, demand: 1.12 },
                                      baleno: { base: 8.8, demand: 1.1 },
                                      dzire: { base: 8.6, demand: 1.11 },
                                      brezza: { base: 10.8, demand: 1.08 },
                                      ertiga: { base: 11.6, demand: 1.08 },
                                      xl6: { base: 13.2, demand: 1.05 },
                                      fronx: { base: 9.2, demand: 1.09 },
                                      'grand vitara': { base: 14.8, demand: 1.08 },
                                      'e vitara': { base: 18.8, demand: 1.06 }
                                    },
                                    hyundai: {
                                      i20: { base: 8.6, demand: 1.03 },
                                      venue: { base: 11.2, demand: 1.05 },
                                      verna: { base: 13.6, demand: 1.01 },
                                      creta: { base: 16.8, demand: 1.14 },
                                      alcazar: { base: 18.9, demand: 1.04 },
                                      'kona electric': { base: 23.5, demand: 0.95 },
                                      cretaev: { base: 18.5, demand: 1.05 }
                                    },
                                    tata: {
                                      altroz: { base: 8.8, demand: 1.0 },
                                      punch: { base: 9.1, demand: 1.12 },
                                      nexon: { base: 13.4, demand: 1.13 },
                                      harrier: { base: 20.6, demand: 1.04 },
                                      safari: { base: 23.8, demand: 1.02 },
                                      'tiago ev': { base: 9.6, demand: 1.06 },
                                      'punch ev': { base: 12.4, demand: 1.08 },
                                      'nexon ev': { base: 15.8, demand: 1.1 },
                                      'curvv ev': { base: 19.4, demand: 1.07 }
                                    },
                                    mahindra: {
                                      xuv3xo: { base: 10.4, demand: 1.05 },
                                      scorpion: { base: 18.8, demand: 1.12 },
                                      xuv700: { base: 21.2, demand: 1.14 },
                                      thar: { base: 15.4, demand: 1.1 },
                                      'xuv400 ev': { base: 15.6, demand: 1.04 },
                                      'be 6': { base: 19.8, demand: 1.07 }
                                    }
                                  };

                                  const matchedMake = Object.keys(localMakesAndModels).find(m => m === makeStr.toLowerCase());
                                  let basePrice = 10.0;
                                  let demandMultiplier = 1.0;
                                  if (matchedMake) {
                                    const matchedModel = Object.keys(localMakesAndModels[matchedMake]).find(mo => mo === modelStr.toLowerCase() || modelStr.toLowerCase().includes(mo));
                                    if (matchedModel) {
                                      basePrice = localMakesAndModels[matchedMake][matchedModel].base;
                                      demandMultiplier = localMakesAndModels[matchedMake][matchedModel].demand;
                                    }
                                  }

                                  const age = Math.max(1, 2026 - yearNum);
                                  const expectedKm = Math.max(age * 12000, 10000);
                                  const kmDelta = kmNum - expectedKm;

                                  const owners = ownershipStr === '4+ Owner' || ownershipStr === '4th+ Owner' ? 4 : Number(ownershipStr.replace(/\D/g, '') || 1);
                                  const ownerPenalty = Math.max(0.82, 1 - (owners - 1) * 0.06);
                                  const agePenalty = Math.max(0.42, 1 - age * 0.085);
                                  const kmPenalty = kmDelta > 0 ? Math.max(0.8, 1 - kmDelta / 250000) : Math.min(1.06, 1 + Math.abs(kmDelta) / 300000);
                                  
                                  const fuel = computedFuel;
                                  const fuelMultiplierMap: Record<string, number> = {
                                    Petrol: 1, Diesel: 0.97, CNG: 0.94, Hybrid: 1.05,
                                    Electric: cityStr === 'Bengaluru' || cityStr === 'Mumbai' || cityStr === 'Delhi' || cityStr === 'Pune' ? 1.08 : 1.03
                                  };
                                  const fuelMultiplier = fuelMultiplierMap[fuel] || 1;
                                  const transmissionMultiplier = computedTransmission === 'Automatic' ? 1.02 : 0.99;
                                  const cityMultiplierMap: Record<string, number> = {
                                    Mumbai: 1.03, Delhi: 1.01, Bengaluru: 1.04, Pune: 1.02, Hyderabad: 1.01, Chennai: 1,
                                    Ahmedabad: 0.99, Kolkata: 0.98, Jaipur: 0.99, Chandigarh: 1, Lucknow: 0.98,
                                    Indore: 0.98, Surat: 0.99, Kochi: 1, Nagpur: 0.98, Goa: 1.01
                                  };
                                  const cityMultiplier = cityMultiplierMap[cityStr] || 1.0;
                                  const procurementBoost = age <= 5 && owners === 1 ? 1.03 : 1.01;

                                  const fairValue = basePrice * agePenalty * kmPenalty * ownerPenalty * fuelMultiplier * transmissionMultiplier * cityMultiplier * demandMultiplier * procurementBoost;
                                  computedPrice = Math.round(Math.max(1.25, fairValue) * 100000);
                              } else if (Number(computedPrice) < 1000) {
                                  computedPrice = Math.round(Number(computedPrice) * 100000);
                              }

                              setEditForm({
                                  make: r.make || "",
                                  model: r.model || "",
                                  variant: r.variant || "",
                                  year: r.year || "",
                                  km: r.km || "",
                                  fuel_type: computedFuel,
                                  transmission: computedTransmission,
                                  ownership: r.ownership || "",
                                  location: r.location || "",
                                  asking_price: computedPrice,
                                  description: r.description || ""
                              });
                          }} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer">
                            Review / Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Review Request #{selectedReq.id}</h2>
              <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Vehicle Details & Uploaded Documents */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-250 pb-1">Vehicle Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: "Make", field: "make" },
                        { label: "Model", field: "model" },
                        { label: "Year", field: "year", type: "number" },
                        { label: "KM", field: "km", type: "number" },
                        { label: "Fuel Type", field: "fuel_type" },
                        { label: "Transmission", field: "transmission" },
                        { label: "Ownership", field: "ownership" },
                        { label: "Location", field: "location" },
                        { label: "Estimated Price (₹)", field: "asking_price", type: "number" }
                      ].map(({ label, field, type }) => (
                        <div key={label}>
                          <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">{label}</label>
                          <input 
                            type={type || "text"}
                            value={editForm[field] || ""}
                            onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Documents Card */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase border-b border-gray-200 dark:border-gray-700 pb-1 flex justify-between items-center">
                      <span>Uploaded Documents</span>
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* RC Document */}
                      <div className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Registration Certificate (RC)</span>
                        {selectedReq.rc_document ? (
                          <a
                            href={selectedReq.rc_document.startsWith('http') ? selectedReq.rc_document : `${API}${selectedReq.rc_document}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2"
                          >
                            <FileText size={13} /> View RC
                          </a>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 shrink-0 ml-2">
                            RC Missing
                          </span>
                        )}
                      </div>

                      {/* Insurance Document */}
                      <div className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Insurance Policy</span>
                        {selectedReq.insurance_document ? (
                          <a
                            href={selectedReq.insurance_document.startsWith('http') ? selectedReq.insurance_document : `${API}${selectedReq.insurance_document}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2"
                          >
                            <FileText size={13} /> View Insurance
                          </a>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700 shrink-0 ml-2">
                            Optional / Missing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer Details, Inspection details, Admin Notes & Action Buttons */}
                <div className="md:col-span-5 space-y-4">
                  {/* Customer Details Card */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                    <div className="text-xs text-gray-400 font-semibold uppercase border-b border-gray-200 dark:border-gray-700 pb-1">Customer Details</div>
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">{selectedReq.customer_name || "Guest"}</div>
                    <div className="text-xs text-gray-500">{selectedReq.customer_phone} · {selectedReq.customer_email || "N/A"}</div>
                  </div>

                  {/* Inspection Details Card */}
                  {selectedReq.inspection_date && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                      <div className="text-xs text-gray-400 font-semibold uppercase border-b border-gray-200 dark:border-gray-700 pb-1">Inspection Details</div>
                      <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                        Date: {new Date(selectedReq.inspection_date).toLocaleDateString("en-IN")}
                        {selectedReq.inspection_time && ` (${selectedReq.inspection_time})`}
                      </div>
                      {selectedReq.inspection_notes && (
                        <div className="text-[11px] text-gray-550 leading-relaxed mt-1">
                          Notes: {selectedReq.inspection_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Admin Notes (optional)</label>
                    <textarea 
                      value={adminNotes} 
                      onChange={e => setAdminNotes(e.target.value)} 
                      rows={3} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none" 
                      placeholder="Add notes for this request..." 
                    />
                  </div>

                  {/* Approve/Reject Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => updateStatus(selectedReq.id, "rejected")} 
                      disabled={updating === selectedReq.id}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-semibold text-xs transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedReq.id, "approved")} 
                      disabled={updating === selectedReq.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <Check size={14} /> Approve
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { Search, Edit, Trash2, X, Users, Phone, Mail, MapPin, Download, Eye, Camera, User, Loader, Filter, RotateCcw, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import AvatarCropModal from "../components/common/AvatarCropModal";

import { API_URL } from "../config/api";
const API = API_URL;

export default function Customers() {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  // Pagination State (50 per page default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API}/api/customers`, { headers: authHeaders })
      .then(r => r.json()).then(data => setCustomers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  // Extract unique cities / states for filter dropdown
  const uniqueCities = Array.from(new Set(customers.map(c => c.city || c.state).filter(Boolean))).sort();

  // Filter Logic
  const filtered = customers.filter(c => {
    // 1. Text Search
    const searchLower = search.toLowerCase().trim();
    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const phone = `${c.phone || ""}`;
    const email = `${c.email || ""}`.toLowerCase();
    const city = `${c.city || ""} ${c.state || ""}`.toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || phone.includes(searchLower) || email.includes(searchLower) || city.includes(searchLower);

    // 2. City / Location Filter
    const matchesCity = cityFilter === "all" || (c.city || c.state || "").toLowerCase() === cityFilter.toLowerCase();

    // 3. Registration Date Filter
    let matchesDate = true;
    if (c.created_at) {
      const regDate = new Date(c.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        matchesDate = regDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = regDate >= sevenDaysAgo;
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = regDate >= thirtyDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && regDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && regDate <= end;
        }
      }
    }

    return matchesSearch && matchesCity && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter, dateFilter, startDate, endDate, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCustomers = filtered.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch("");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setCityFilter("all");
  };

  const hasActiveFilters = search || dateFilter !== "all" || cityFilter !== "all" || startDate || endDate;

  const openEdit = (c: any) => { setEditForm({ ...c }); setEditing(c); };
  const closeEdit = () => setEditing(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/customers/${editing.id}`, {
        method: "PUT", headers: authHeaders, body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error();
      closeEdit();
      fetchCustomers();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setCropSrc(ev.target.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!editing) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");
    try {
      const res = await fetch(`${API}/api/customers/${editing.id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setEditForm((f: any) => ({ ...f, avatar_url: data.imageUrl }));
        setCropSrc(null);
        fetchCustomers();
      } else alert(data.message || "Upload failed");
    } catch { alert("Upload failed"); }
    finally { setAvatarUploading(false); }
  };

  const handleExport = () => {
    const hdrs = ["ID", "First Name", "Last Name", "Email", "Phone", "City", "State", "Pincode", "Registered At"];
    const rows = filtered.map(c => [
      c.id, c.first_name, c.last_name, c.email || "N/A", c.phone,
      c.city || "N/A", c.state || "N/A", c.pincode || "N/A",
      new Date(c.created_at).toLocaleDateString("en-IN")
    ]);
    const csvContent = [hdrs.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`${API}/api/customers/${id}`, { method: "DELETE", headers: authHeaders });
    fetchCustomers();
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white";

  return (
    <>
      <PageMeta title="Customers | Selectt Admin" description="Manage customer accounts and filter by registration date" />
      <div className="p-4 md:p-6 space-y-5">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500">{customers.length} registered accounts ({filtered.length} matching filter)</p>
          </div>
          {user?.role === "admin" && (
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer">
              <Download size={16} /> Export CSV ({filtered.length})
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Filter size={14} className="text-[#1C3EB9]" />
              <span>Filter Customer Directory</span>
              <span className="text-[11px] font-bold text-gray-400 normal-case">({filtered.length} registered accounts)</span>
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
                placeholder="Search by name, phone, email..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white" 
              />
            </div>

            {/* Registration Date Filter Dropdown */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📅 Registered: All Dates</option>
                <option value="today">Registered Today</option>
                <option value="7days">Registered Last 7 Days</option>
                <option value="30days">Registered Last 30 Days</option>
                <option value="thisMonth">Registered This Month</option>
                <option value="custom">Custom Reg. Date Range...</option>
              </select>
            </div>

            {/* City Location Filter Dropdown */}
            <div>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">📍 All Cities ({uniqueCities.length})</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Picker inputs */}
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9]">
                  <Calendar className="size-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Custom Registration Range</span>
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

        {/* Customers Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-16 text-center text-gray-400 font-bold text-xs uppercase tracking-wider animate-pulse">Loading Customers Directory...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Users size={36} className="opacity-30" />
              <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No customer accounts match your filter criteria</p>
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
                    {["Name & ID", "Phone", "Email", "City", "Registered", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 border border-gray-200">
                            {c.avatar_url
                              ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                              : <User size={16} />}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 text-xs dark:text-white capitalize">{c.first_name} {c.last_name}</div>
                            <div className="text-[11px] font-bold text-[#1C3EB9] font-mono">ID #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1.5"><Phone size={13} className="text-blue-500" /> {c.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1.5"><Mail size={13} className="text-indigo-500" /> {c.email || <span className="text-gray-400 italic font-normal">N/A</span>}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1.5"><MapPin size={13} className="text-amber-500" /> {c.city || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-extrabold text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#1C3EB9]" />
                          {new Date(c.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewing(c)} title="View Details" className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"><Eye size={15} /></button>
                          <button onClick={() => openEdit(c)} title="Edit Customer" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(c.id)} title="Delete Customer" className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
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

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Customer Details</h2>
              <button onClick={() => setViewing(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200">
                  {viewing.avatar_url
                    ? <img src={viewing.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <User size={28} />}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-white text-lg">{viewing.first_name} {viewing.last_name}</div>
                  <div className="text-xs text-gray-400">ID #{viewing.id}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400 text-xs font-bold uppercase block">Phone</span><span className="font-semibold text-gray-700 dark:text-gray-200">{viewing.phone || "—"}</span></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase block">Alt Phone</span><span className="font-semibold text-gray-700 dark:text-gray-200">{viewing.alt_phone || "—"}</span></div>
                <div className="col-span-2"><span className="text-gray-400 text-xs font-bold uppercase block">Email</span><span className="font-semibold text-gray-700 dark:text-gray-200">{viewing.email || "—"}</span></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase block">City</span><span className="font-semibold text-gray-700 dark:text-gray-200">{viewing.city || "—"}</span></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase block">State</span><span className="font-semibold text-gray-700 dark:text-gray-200">{viewing.state || "—"}</span></div>
                <div className="col-span-2"><span className="text-gray-400 text-xs font-bold uppercase block">Registered</span><span className="font-semibold text-gray-700 dark:text-gray-200">{new Date(viewing.created_at).toLocaleDateString("en-IN")}</span></div>
              </div>
              <button onClick={() => { setViewing(null); openEdit(viewing); }}
                className="w-full bg-[#1C3EB9] hover:bg-[#153299] text-white py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                Edit This Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Customer</h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar Upload Row */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <label className="relative cursor-pointer group shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200 group-hover:border-[#1C3EB9] transition-colors">
                    {editForm.avatar_url
                      ? <img src={editForm.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <User size={24} />}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {avatarUploading ? <Loader size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={avatarUploading} />
                </label>
                <div>
                  <div className="font-semibold text-gray-700 dark:text-gray-200">{editForm.first_name} {editForm.last_name}</div>
                  <div className="text-xs text-gray-400">Click avatar to change photo</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label><input className={inp} value={editForm.first_name || ""} onChange={e => setEditForm((f: any) => ({...f, first_name: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label><input className={inp} value={editForm.last_name || ""} onChange={e => setEditForm((f: any) => ({...f, last_name: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label><input className={inp} value={editForm.phone || ""} onChange={e => setEditForm((f: any) => ({...f, phone: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Alt Phone</label><input className={inp} value={editForm.alt_phone || ""} onChange={e => setEditForm((f: any) => ({...f, alt_phone: e.target.value}))} /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">Email</label><input type="email" className={inp} value={editForm.email || ""} onChange={e => setEditForm((f: any) => ({...f, email: e.target.value}))} /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">Address</label><input className={inp} value={editForm.address || ""} onChange={e => setEditForm((f: any) => ({...f, address: e.target.value}))} /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1">Area/Street</label><input className={inp} value={editForm.area || ""} onChange={e => setEditForm((f: any) => ({...f, area: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">City</label><input className={inp} value={editForm.city || ""} onChange={e => setEditForm((f: any) => ({...f, city: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">State</label><input className={inp} value={editForm.state || ""} onChange={e => setEditForm((f: any) => ({...f, state: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Pincode</label><input className={inp} value={editForm.pincode || ""} onChange={e => setEditForm((f: any) => ({...f, pincode: e.target.value}))} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 text-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1C3EB9] hover:bg-[#153299] text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 cursor-pointer">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onClose={() => setCropSrc(null)}
        />
      )}
    </>
  );
}

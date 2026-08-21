import { useState, useEffect } from "react";
import { Search, Download, Calendar, User, Navigation } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function WishlistReport() {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = reports.filter(r => {
    const searchLower = search.toLowerCase();
    const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
    const carName = `${r.brand || ""} ${r.model || ""} ${r.make || ""}`.toLowerCase();
    const locationInfo = `${r.city || ""} ${r.state || ""} ${r.car_location || ""}`.toLowerCase();
    return fullName.includes(searchLower) || carName.includes(searchLower) || locationInfo.includes(searchLower);
  });

  const exportCSV = () => {
    const headers = ["Date Added", "Customer Name", "Customer Phone", "Customer Location", "Car Brand", "Car Model", "Car Year", "Car Variant", "Car Price", "Car Location"];
    const rows = filtered.map(r => [
      new Date(r.wishlisted_at).toLocaleDateString(),
      `${r.first_name} ${r.last_name}`,
      r.phone,
      `${r.city}, ${r.state}`,
      r.make,
      r.model,
      r.year,
      r.variant || "N/A",
      r.price,
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
      <PageMeta title="Wishlist Reports | Selectt Admin" description="Reports of all wishlisted cars" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Wishlisted Cars</h1>
            <p className="text-sm text-gray-500 font-medium">Download and monitor wishlisted cars across all customers</p>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0C1B33] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by customer, car, or location..." 
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm" 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Generating Report...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
               <p className="font-bold">No wishlisted cars found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-5">Date Added</th>
                    <th className="px-6 py-5">Customer Details</th>
                    <th className="px-6 py-5">Car Details</th>
                    <th className="px-6 py-5">Location Information</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold uppercase">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(r.wishlisted_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white capitalize">{r.first_name} {r.last_name}</div>
                            <div className="text-xs text-gray-500 font-medium">{r.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold text-gray-700 dark:text-gray-200 leading-tight uppercase text-xs">{r.make} {r.model}</div>
                            <div className="text-[10px] text-gray-400 font-bold tracking-tighter">{r.year} • ₹{(r.price / 100000).toFixed(2)} Lakh</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-gray-400 font-bold uppercase w-16">Customer:</span>
                               <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                 <Navigation size={12} className="text-[#0070F3]" />
                                 {r.city}, {r.state}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] text-gray-400 font-bold uppercase w-16">Car At:</span>
                               <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                 <Navigation size={12} className="text-brand-500" />
                                 {r.car_location || 'N/A'}
                               </span>
                            </div>
                         </div>
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

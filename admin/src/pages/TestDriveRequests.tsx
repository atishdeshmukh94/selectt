import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Clock, Car, User, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API}/api/test-drives`, { headers })
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching test drives:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

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
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally { setUpdating(null); }
  };

  const filtered = requests
    .filter(r => filter === "all" || r.status?.toLowerCase() === filter.toLowerCase())
    .filter(r => {
        const customerName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
        const carInfo = `${r.year || ""} ${r.make || ""} ${r.model || ""}`.toLowerCase();
        const searchLower = search.toLowerCase();
        return customerName.includes(searchLower) || carInfo.includes(searchLower) || r.email?.toLowerCase().includes(searchLower) || r.phone?.includes(searchLower);
    });

  const counts: Record<string, number> = { 
    all: requests.length, 
    pending: requests.filter(r => r.status?.toLowerCase() === "pending").length, 
    approved: requests.filter(r => r.status?.toLowerCase() === "approved").length, 
    rejected: requests.filter(r => r.status?.toLowerCase() === "rejected").length 
  };

  return (
    <>
      <PageMeta title="Test Drive Requests | Selectt Admin" description="Manage car test drive bookings" />
      <div className="p-4 md:p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Test Drive Requests</h1>
          <p className="text-sm text-gray-500">{counts.pending} pending requests</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${filter === s ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, car, email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-30" />
              <p>No test drive requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    {["Customer", "Car Details", "Location", "Date & Time", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white">{r.first_name} {r.last_name}</div>
                            <div className="text-[10px] text-gray-400">{r.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-gray-400" />
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300">{r.year} {r.make} {r.model}</div>
                            <div className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded inline-block">ID: #{r.car_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 capitalize">
                          <MapPin size={13} className="text-brand-500" />
                          {r.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
                            <CalendarIcon size={13} className="text-gray-400" />
                            {r.date_day} ({r.date_label})
                          </div>
                          <div className="text-xs text-gray-400 ml-4.5">{r.slot}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[r.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {STATUS_ICONS[r.status] || <Clock size={13} />}
                          <span className="leading-none">{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          {r.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(r.id, "approved")}
                                disabled={updating === r.id}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => updateStatus(r.id, "rejected")}
                                disabled={updating === r.id}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {r.status !== 'pending' && (
                             <button 
                               onClick={() => updateStatus(r.id, "pending")}
                               disabled={updating === r.id}
                               className="text-xs font-bold text-gray-400 hover:text-brand-500 hover:underline transition-all disabled:opacity-50"
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}

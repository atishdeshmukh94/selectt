import { useState, useEffect } from "react";
import { Search, Download, Calendar, User, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function PaymentReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = reports.filter(r => {
    const searchLower = search.toLowerCase();
    const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
    const carName = `${r.brand || ""} ${r.model || ""}`.toLowerCase();
    const bookingNo = (r.booking_no || "").toLowerCase();
    return fullName.includes(searchLower) || carName.includes(searchLower) || bookingNo.includes(searchLower);
  });

  const exportCSV = () => {
    const headers = ["Booking No", "Customer Name", "Phone", "Car", "Date", "Booking Amount", "Total Amount", "Payment Mode", "Status"];
    const rows = filtered.map(r => [
      r.booking_no,
      `${r.first_name} ${r.last_name}`,
      r.phone,
      `${r.brand} ${r.model}`,
      new Date(r.transaction_date).toLocaleDateString(),
      r.booking_amount,
      r.final_amount,
      r.remaining_payment_mode || "N/A",
      r.payment_status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
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
      <PageMeta title="Payment Reports | Selectt Admin" description="Transaction reports and logs" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Payment Transactions</h1>
            <p className="text-sm text-gray-500 font-medium">Download and manage payment reports</p>
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
              placeholder="Search by customer, car, or booking ID..." 
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
               <p className="font-bold">No transactions found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-5">Transaction Details</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Vehicle</th>
                    <th className="px-6 py-5">Payment Breakdown</th>
                    <th className="px-6 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.booking_no} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-black text-brand-600 mb-1">{r.booking_no}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                          <Calendar size={12} />
                          {new Date(r.transaction_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white capitalize">{r.first_name} {r.last_name}</div>
                            <div className="text-xs text-gray-400 font-medium">{r.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                             <img src={r.image} alt="" className="w-full h-full object-cover opacity-80" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 dark:text-gray-200 leading-tight uppercase text-xs">{r.brand} {r.model}</div>
                            <div className="text-[10px] text-gray-400 font-bold tracking-tighter">Total: ₹{r.final_amount.toLocaleString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Booking Amount:</span>
                               <span className="text-xs font-black text-gray-700 dark:text-gray-300">₹{r.booking_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Remaining:</span>
                               <span className="text-xs font-black text-[#0070F3]">₹{(r.final_amount - r.booking_amount).toLocaleString()}</span>
                            </div>
                            {r.remaining_payment_mode && (
                              <div className="pt-1 mt-1 border-t border-dashed border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                <CreditCard size={12} />
                                {r.remaining_payment_mode} • {new Date(r.remaining_payment_date).toLocaleDateString()}
                              </div>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           r.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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

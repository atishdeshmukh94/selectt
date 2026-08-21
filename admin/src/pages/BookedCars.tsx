import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, CreditCard, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-700 border-gray-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function BookedCars() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filtered = bookings
    .filter(b => statusFilter === "all" || b.booking_status === statusFilter)
    .filter(b => {
        const fullName = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
        const carName = `${b.make || ""} ${b.model || ""}`.toLowerCase();
        const bookingNo = (b.booking_no || "").toLowerCase();
        const searchLower = search.toLowerCase();
        return fullName.includes(searchLower) || carName.includes(searchLower) || bookingNo.includes(searchLower);
    });

  return (
    <>
      <PageMeta title="Booked Cars | Selectt Admin" description="Manage car reservations" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">Booked Cars</h1>
            <p className="text-sm text-gray-500">Manage customer car reservations and payments</p>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={fetchBookings} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                <Calendar size={18} />
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by customer name, booking no, or car..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none min-w-[160px]"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
               <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-gray-400 text-sm font-medium">Loading bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={48} className="opacity-20 mb-2" />
              <p className="font-medium">No car bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Booking Info</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Payments</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Loan Interest</th>
                     <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold text-brand-600 mb-1">{b.booking_no}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                          {new Date(b.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 dark:text-white leading-tight mb-0.5">{b.first_name} {b.last_name}</div>
                        <div className="text-xs text-gray-400 mb-2">{b.phone}</div>
                        {b.test_drive_date ? (
                          <div className="flex flex-col bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-xl text-[10px] max-w-[200px] shadow-sm">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400 mb-0.5 uppercase tracking-wider text-[9px]">Test Drive</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{b.test_drive_date} • {b.test_drive_slot}</span>
                            <span className="text-gray-500 dark:text-gray-400 mt-0.5 capitalize font-medium">({b.test_drive_location})</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">No Test Drive</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                             <img src={b.image?.startsWith('/') ? `${API}${b.image}` : b.image} alt={b.model} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 dark:text-gray-200 leading-tight">{b.make} {b.model}</div>
                            <div className="text-xs text-gray-400">{b.year} • ₹{(b.final_amount/100000).toFixed(2)}L</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{b.booking_amount.toLocaleString()}</span>
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${PAYMENT_STATUS_COLORS[b.payment_status]}`}>
                                 {b.payment_status}
                               </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">Total: ₹{b.final_amount.toLocaleString()}</div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${BOOKING_STATUS_COLORS[b.booking_status]}`}>
                           {b.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                          {b.interested_in_loan ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">✓ Interested</span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {b.booking_status === 'pending' && (
                               <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'confirmed')}
                                disabled={updating === b.id}
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                title="Confirm Booking"
                               >
                                  <Check size={16} />
                               </button>
                            )}
                            {b.payment_status === 'pending' && (
                               <button 
                                onClick={() => updateStatus(b.id, 'payment_status', 'paid')}
                                disabled={updating === b.id}
                                className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-lg transition-all"
                                title="Mark as Paid"
                               >
                                  <CreditCard size={16} />
                               </button>
                            )}
                            {b.booking_status === 'confirmed' && (
                               <button 
                                onClick={() => handleComplete(b)}
                                disabled={updating === b.id}
                                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-all"
                                title="Complete Booking"
                               >
                                  <CheckCircle size={16} />
                               </button>
                            )}
                            {b.booking_status !== 'cancelled' && b.booking_status !== 'completed' && (
                               <button 
                                onClick={() => updateStatus(b.id, 'booking_status', 'cancelled')}
                                disabled={updating === b.id}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                title="Cancel Booking"
                               >
                                  <X size={16} />
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

      {/* Completion Modal */}
      {showCompleteModal && selectedBooking && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">Complete Booking</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Record final payment for {selectedBooking.booking_no}</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Remaining Amount</span>
                   <span className="text-xl font-black text-brand-600">₹{(selectedBooking.final_amount - selectedBooking.booking_amount).toLocaleString()}</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Price</span>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{selectedBooking.final_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Payment Mode</label>
                  <select 
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="EMI/Loan">EMI / Loan</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Payment Date</label>
                  <input 
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-3 text-sm font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateStatus(selectedBooking.id, 'booking_status', 'completed', {
                  remaining_payment_mode: paymentMode,
                  remaining_payment_date: paymentDate,
                  payment_status: 'paid'
                })}
                disabled={updating === selectedBooking.id}
                className="flex-3 py-3 px-8 bg-purple-600 hover:bg-purple-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-200"
              >
                {updating === selectedBooking.id ? 'Processing...' : 'Complete & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

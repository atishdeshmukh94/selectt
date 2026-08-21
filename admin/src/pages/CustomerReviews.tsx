import { useState, useEffect } from "react";
import { Search, Edit, Trash2, X, Plus, Check, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function CustomerReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    review_date: "",
    location: "",
    rating: 5,
    review_text: "",
    review_type: "buyer",
    category: "All Reviews"
  });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchReviews = () => {
    setLoading(true);
    fetch(`${API}/api/customer-reviews`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const openAdd = () => {
    setForm({
      name: "",
      review_date: new Date().toISOString().split('T')[0],
      location: "",
      rating: 5,
      review_text: "",
      review_type: "buyer",
      category: "All Reviews"
    });
    setIsAdding(true);
  };

  const openEdit = (r: any) => {
    setForm({ ...r });
    setEditing(r);
  };

  const closeForm = () => {
    setEditing(null);
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isAdding ? `${API}/api/admin/customer-reviews` : `${API}/api/admin/customer-reviews/${editing.id}`;
      const method = isAdding ? "POST" : "PUT";
      const res = await fetch(url, {
        method, headers, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      closeForm();
      fetchReviews();
    } catch { alert("Failed to save review"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer review?")) return;
    try {
      const res = await fetch(`${API}/api/admin/customer-reviews/${id}`, { method: "DELETE", headers });
      if (res.ok) fetchReviews();
    } catch { alert("Failed to delete"); }
  };

  const filtered = reviews.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.review_text.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all";

  return (
    <>
      <PageMeta title="Customer Reviews | Selectt Admin" description="Manage customer testimonials and reviews" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Customer Reviews</h1>
            <p className="text-sm text-gray-500">Manage buyer and seller reviews shown on the website</p>
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100"
          >
            <Plus size={18} /> Add Review
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search reviews by name, content, or city..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
               <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p>Loading reviews...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Star size={40} className="opacity-30" />
              <p>No customer reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Customer</th>
                    <th className="px-6 py-4 text-left">Type / Category</th>
                    <th className="px-6 py-4 text-left">Rating</th>
                    <th className="px-6 py-4 text-left">Review Text</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4 text-left whitespace-nowrap">
                        <div className="font-bold text-gray-800 dark:text-white">{r.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{r.location} | {r.review_date}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full w-fit ${r.review_type === 'buyer' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {r.review_type}
                          </span>
                          <span className="text-gray-500 text-xs font-semibold">{r.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left max-w-xs md:max-w-md truncate text-gray-600 dark:text-gray-300">
                        {r.review_text}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(r)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
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

      {/* Form Modal */}
      {(editing || isAdding) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{isAdding ? "Add New Review" : "Edit Review"}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Customer Name</label>
                  <input required className={inp} value={form.name || ""} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} placeholder="e.g. Mankrit, Pooja" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City / Location</label>
                  <input required className={inp} value={form.location || ""} onChange={e => setForm((f: any) => ({...f, location: e.target.value}))} placeholder="e.g. Bangalore, Pune" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Review Date</label>
                  <input type="date" required className={inp} value={form.review_date || ""} onChange={e => setForm((f: any) => ({...f, review_date: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rating (1-5)</label>
                  <select className={inp} value={form.rating} onChange={e => setForm((f: any) => ({...f, rating: parseInt(e.target.value)}))}>
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Review Type</label>
                  <select className={inp} value={form.review_type} onChange={e => setForm((f: any) => ({...f, review_type: e.target.value}))}>
                    <option value="buyer">From Buyer</option>
                    <option value="seller">From Seller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category Tag</label>
                  <select className={inp} value={form.category} onChange={e => setForm((f: any) => ({...f, category: e.target.value}))}>
                    <option value="All Reviews">All Reviews</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Quality of Cars">Quality of Cars</option>
                    <option value="Value Added Services">Value Added Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Review Content</label>
                <textarea required rows={4} className={inp + " resize-none"} value={form.review_text || ""} onChange={e => setForm((f: any) => ({...f, review_text: e.target.value}))} placeholder="Write the customer's testimonial review here..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeForm} className="flex-1 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-widest">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#0C1B33] hover:bg-[#162947] text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 transition-all shadow-lg shadow-gray-200 dark:shadow-none uppercase tracking-widest flex items-center justify-center gap-2">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : <Check size={18} />}
                  {saving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from "react";
import { Search, Edit, Trash2, X, MapPin, Plus, Check, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function Locations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ name: "", image: "", is_popular: 0 });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchLocations = () => {
    setLoading(true);
    fetch(`${API}/api/locations`)
      .then(r => r.json())
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLocations(); }, []);

  const openAdd = () => { setForm({ name: "", image: "", is_popular: 0 }); setIsAdding(true); };
  const openEdit = (l: any) => { setForm({ ...l }); setEditing(l); };
  const closeForm = () => { setEditing(null); setIsAdding(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isAdding ? `${API}/api/locations` : `${API}/api/locations/${editing.id}`;
      const method = isAdding ? "POST" : "PUT";
      const res = await fetch(url, {
        method, headers, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      closeForm();
      fetchLocations();
    } catch { alert("Failed to save location"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this location? This might affect car listings associated with it.")) return;
    try {
        const res = await fetch(`${API}/api/locations/${id}`, { method: "DELETE", headers });
        if (res.ok) fetchLocations();
    } catch { alert("Failed to delete"); }
  };

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all";

  return (
    <>
      <PageMeta title="Locations | Selectt Admin" description="Manage available cities for car listings" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Locations</h1>
            <p className="text-sm text-gray-500">Manage cities where cars are available</p>
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100"
          >
            <Plus size={18} /> Add Location
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search city name..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
               <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p>Loading locations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <MapPin size={40} className="opacity-30" />
              <p>No locations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">City</th>
                    <th className="px-6 py-4 text-left">Popularity</th>
                    <th className="px-6 py-4 text-left">Added On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                              {l.image ? (
                                 <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <MapPin size={20} />
                                 </div>
                              )}
                           </div>
                           <span className="font-bold text-gray-800 dark:text-white">{l.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        {l.is_popular ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 w-fit">
                            <Star size={12} fill="currentColor" /> Popular
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-left text-gray-500 text-xs whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(l)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(l.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{isAdding ? "Add New Location" : "Edit Location"}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City Name</label>
                <input required className={inp} value={form.name || ""} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} placeholder="e.g. Mumbai, Navi Mumbai..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City Image URL (Optional)</label>
                <input className={inp} value={form.image || ""} onChange={e => setForm((f: any) => ({...f, image: e.target.value}))} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                 <button 
                  type="button"
                  onClick={() => setForm((f: any) => ({...f, is_popular: f.is_popular ? 0 : 1}))}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${form.is_popular ? 'bg-brand-500' : 'bg-gray-300'}`}
                 >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${form.is_popular ? 'translate-x-4' : 'translate-x-0'}`}></div>
                 </button>
                 <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Show in Popular Cities</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeForm} className="flex-1 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-widest">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#0C1B33] hover:bg-[#162947] text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 transition-all shadow-lg shadow-gray-200 dark:shadow-none uppercase tracking-widest flex items-center justify-center gap-2">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : <Check size={18} />}
                  {saving ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

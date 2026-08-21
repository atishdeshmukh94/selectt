import { useState, useEffect, useRef } from "react";
import { Search, Edit, Trash2, X, Users, Phone, Mail, MapPin, Download, Eye, Camera, User, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import AvatarCropModal from "../components/common/AvatarCropModal";

import { API_URL } from "../config/api";
const API = API_URL;

export default function Customers() {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
    fetch(`/api/customers`, { headers: authHeaders })
      .then(r => r.json()).then(data => setCustomers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openEdit = (c: any) => { setEditForm({ ...c }); setEditing(c); };
  const closeEdit = () => setEditing(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${editing.id}`, {
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
      const res = await fetch(`/api/customers/${editing.id}/avatar`, {
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
    const rows = customers.map(c => [
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
    await fetch(`/api/customers/${id}`, { method: "DELETE", headers: authHeaders });
    fetchCustomers();
  };

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white";

  return (
    <>
      <PageMeta title="Customers | Selectt Admin" description="Manage customer accounts" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500">{customers.length} registered customers</p>
          </div>
          {user?.role === "admin" && (
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <Download size={18} /> Export CSV
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Users size={40} className="opacity-30" /><p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    {["Name", "Phone", "Email", "City", "Registered", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 border border-gray-200">
                            {c.avatar_url
                              ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                              : <User size={16} />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-white">{c.first_name} {c.last_name}</div>
                            <div className="text-xs text-gray-400">ID #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1"><Phone size={13} /> {c.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1"><Mail size={13} /> {c.email || <span className="text-gray-300 italic">N/A</span>}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1"><MapPin size={13} /> {c.city || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewing(c)} title="View Details" className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"><Eye size={16} /></button>
                          <button onClick={() => openEdit(c)} title="Edit Customer" className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(c.id)} title="Delete Customer" className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
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

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Customer Details</h2>
              <button onClick={() => setViewing(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
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
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
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
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar Upload Row */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <label className="relative cursor-pointer group shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200 group-hover:border-brand-500 transition-colors">
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
                <button type="button" onClick={closeEdit} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
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

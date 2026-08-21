import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, PlusCircle, Edit, Trash2, X, Shield, User, Mail, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

export default function StaffManagement() {
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`, { headers });
      if (res.status === 403) {
        setUsers([]); // User is not an admin
      } else {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { navigate("/profile?mode=add"); };
  const openEdit = (u: any) => { navigate(`/profile?id=${u.id}`); };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) return alert("You cannot delete your own account!");
    if (!confirm("Delete this user account permanently?")) return;
    try {
      await fetch(`${API}/api/users/${id}`, { method: "DELETE", headers });
      fetchUsers();
    } catch { alert("Failed to delete"); }
  };

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.role} ${u.job_title}`.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white";

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <Shield size={48} className="mx-auto mb-4 text-red-500 opacity-50" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Access Denied</h2>
        <p className="text-gray-500">Only administrators can manage staff accounts.</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Staff Management | Selectt Admin" description="Manage team accounts and permissions" />
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Staff Management</h1>
            <p className="text-sm text-gray-500">{users.length} team members</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <PlusCircle size={18} /> Add New Member
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, role..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading team members...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <User size={40} className="opacity-30" />
              <p>No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    {["Name", "Role", "Email", "Job Title", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 dark:text-white">{u.first_name} {u.last_name}</div>
                        <div className="text-xs text-gray-400">UID #{u.id} {u.id === currentUser.id && "(You)"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />} {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1"><Mail size={13} /> {u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1"><Briefcase size={13} /> {u.job_title || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" disabled={u.id === currentUser.id}><Trash2 size={16} /></button>
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

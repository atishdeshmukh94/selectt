import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, PlusCircle, Edit, Trash2, Shield, User, Mail, Briefcase, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import StaffPermissionsModal, { PERMISSION_MODULES } from "../components/staff/StaffPermissionsModal";
import { API_URL } from "../config/api";

const API = API_URL;

export default function StaffManagement() {
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Permissions Modal state
  const [permsUser, setPermsUser] = useState<any | null>(null);
  const [isPermsOpen, setIsPermsOpen] = useState(false);

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

  const openPermissions = (u: any) => {
    setPermsUser(u);
    setIsPermsOpen(true);
  };

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
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#1C3EB9] hover:bg-[#153096] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm">
            <PlusCircle size={18} /> Add New Member
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, role..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C3EB9] dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs">
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
                    {["Name", "Role", "Email", "Job Title", "Module Permissions", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(u => {
                    const userPerms = Array.isArray(u.permissions) ? u.permissions : [];
                    const permCount = u.role === 'admin' ? PERMISSION_MODULES.length : userPerms.length;

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-800 dark:text-white">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-gray-400">UID #{u.id} {u.id === currentUser.id && "(You)"}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            u.role === 'admin' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' 
                              : 'bg-blue-50 text-[#1C3EB9] border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                          }`}>
                            {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />} {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" /> {u.email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Briefcase size={13} className="text-gray-400" /> {u.job_title || "—"}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                              <CheckCircle2 size={13} /> Full Administrator Access
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openPermissions(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-[#1C3EB9]/5 hover:border-[#1C3EB9]/40 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer group"
                            >
                              <KeyRound size={13} className="text-[#1C3EB9] group-hover:scale-110 transition-transform" />
                              <span>
                                <strong className="text-[#1C3EB9] font-bold">{permCount}</strong> / {PERMISSION_MODULES.length} Access Granted
                              </span>
                              <span className="ml-1 text-[10px] text-gray-400 group-hover:text-[#1C3EB9] font-bold">Edit</span>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => openPermissions(u)} 
                                title="Manage Module Permissions"
                                className="p-2 hover:bg-blue-50 text-[#1C3EB9] dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                              >
                                <KeyRound size={16} />
                              </button>
                            )}
                            <button onClick={() => openEdit(u)} title="Edit Profile" className="p-2 hover:bg-gray-100 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(u.id)} title="Delete Member" className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer" disabled={u.id === currentUser.id}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Modal */}
      {permsUser && (
        <StaffPermissionsModal
          isOpen={isPermsOpen}
          onClose={() => {
            setIsPermsOpen(false);
            setPermsUser(null);
          }}
          staffUser={permsUser}
          onSuccess={fetchUsers}
        />
      )}
    </>
  );
}


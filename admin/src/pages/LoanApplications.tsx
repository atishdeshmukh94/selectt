import { useState, useEffect } from "react";
import { Search, Check, X, AlertCircle, Clock, ExternalLink, User, Briefcase, FileText } from "lucide-react";
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

export default function LoanApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchApplications = () => {
    setLoading(true);
    fetch(`${API}/api/loan-applications`, { headers })
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching loan applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/loan-applications/${id}/status`, {
        method: "PUT", 
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally { setUpdating(null); }
  };

  const filtered = applications
    .filter(a => filter === "all" || a.status === filter)
    .filter(a => {
        const fullName = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
        const email = (a.email || "").toLowerCase();
        const phone = (a.phone || "").toLowerCase();
        const appNo = (a.application_no || "").toLowerCase();
        const searchLower = search.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower) || appNo.includes(searchLower);
    });

  const counts: Record<string, number> = { 
    all: applications.length, 
    pending: applications.filter(a => a.status === "pending").length, 
    approved: applications.filter(a => a.status === "approved").length, 
    rejected: applications.filter(a => a.status === "rejected").length 
  };

  const getDocUrl = (path: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API}${path}`;
  };

  return (
    <>
      <PageMeta title="Loan Applications | Selectt Admin" description="Manage car loan applications" />
      <div className="p-4 md:p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Loan Applications</h1>
          <p className="text-sm text-gray-500">{counts.pending} pending review</p>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone, app no..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-30" />
              <p>No loan applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    {["App No", "Customer", "Profession", "Documents Count", "Submitted", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(a => {
                    const docFields = ['pan_card', 'aadhar_card', 'bank_statement', 'salary_slip', 'gst_certificate', 'gumasta_license', 'electricity_bill', 'msme_certificate'];
                    const docCount = docFields.filter(f => a[f]).length;
                    
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-brand-600">
                          {a.application_no}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-800 dark:text-white">{a.first_name} {a.last_name}</div>
                          <div className="text-xs text-gray-400">{a.email} • {a.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {a.profession_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {docCount} Files
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[a.status]}`}>
                            {STATUS_ICONS[a.status]} {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => setSelectedApp(a)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                            View Docs
                          </button>
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

      {/* View Docs Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Loan Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Customer Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><User size={12}/> Customer</div>
                  <div className="font-bold text-gray-800 dark:text-white">{selectedApp.first_name} {selectedApp.last_name}</div>
                  <div className="text-sm text-gray-500">{selectedApp.email}</div>
                  <div className="text-sm text-gray-500">{selectedApp.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><Briefcase size={12}/> Profession</div>
                  <div className="font-bold text-gray-800 dark:text-white capitalize">{selectedApp.profession_type}</div>
                  <div className="text-sm text-gray-500">Submitted: {new Date(selectedApp.created_at).toLocaleString("en-IN")}</div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Submitted Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "PAN Card", field: "pan_card" },
                    { label: "Aadhar Card", field: "aadhar_card" },
                    { label: "Bank Statement", field: "bank_statement" },
                    { label: "Salary Slip", field: "salary_slip" },
                    { label: "GST Certificate", field: "gst_certificate" },
                    { label: "Gumasta License", field: "gumasta_license" },
                    { label: "Electricity Bill", field: "electricity_bill" },
                    { label: "MSME Certificate", field: "msme_certificate" },
                  ].map(doc => {
                    const url = getDocUrl(selectedApp[doc.field]);
                    if (!url) return null;
                    
                    return (
                      <a key={doc.field} href={url} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-500 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <FileText size={20} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{doc.label}</span>
                        </div>
                        <ExternalLink size={16} className="text-gray-300 group-hover:text-brand-500" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Section */}
              <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 text-center">Update Application Status</label>
                <div className="flex gap-3">
                  <button onClick={() => updateStatus(selectedApp.id, "rejected")} disabled={updating === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                    <X size={16} /> Reject
                  </button>
                  <button onClick={() => updateStatus(selectedApp.id, "approved")} disabled={updating === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                    <Check size={16} /> Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

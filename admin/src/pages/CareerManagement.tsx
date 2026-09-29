import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Search,
  Download,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  X,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", text: "Pending", icon: Clock },
  shortlisted: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", text: "Shortlisted", icon: CheckCircle },
  interviewed: { bg: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", text: "Interviewed", icon: Users },
  hired: { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", text: "Hired", icon: CheckCircle },
  rejected: { bg: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", text: "Rejected", icon: XCircle }
};

export default function CareerManagement() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"applications" | "jobs">("applications");

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appSearch, setAppSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);

  // Preview & Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Job Openings State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "Mumbai",
    job_type: "Full-time",
    description: "",
    is_active: true
  });
  const [savingJob, setSavingJob] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // Fetch Applications
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status: statusFilter,
        search: appSearch
      });
      const res = await fetch(`${API_URL}/api/admin/careers/applications?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalApps(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch Jobs
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/jobs`, { headers });
      const data = await res.json();
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    } else {
      fetchJobs();
    }
  }, [activeTab, page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  // Update Status
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/applications/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(apps =>
          apps.map(a => (a.id === id ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Delete Application
  const handleDeleteApp = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/applications/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        setApplications(apps => apps.filter(a => a.id !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
      }
    } catch (err) {
      alert("Failed to delete application");
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/applications/export`, { headers });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Selectt_Career_Applications_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export applications");
    }
  };

  // Save Job Opening (Create / Update)
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    try {
      const url = editingJob
        ? `${API_URL}/api/admin/careers/jobs/${editingJob.id}`
        : `${API_URL}/api/admin/careers/jobs`;
      const method = editingJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(jobForm)
      });
      if (!res.ok) throw new Error();
      setIsJobModalOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      alert("Failed to save job opening");
    } finally {
      setSavingJob(false);
    }
  };

  // Delete Job Opening
  const handleDeleteJob = async (id: number) => {
    if (!confirm("Delete this job opening? It will no longer appear on the careers page.")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/jobs/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  // Toggle Job Active Status
  const handleToggleJobActive = async (job: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/careers/jobs/${job.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...job,
          is_active: !job.is_active
        })
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const getFullResumeUrl = (url: string | null | undefined): string => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  return (
    <>
      <PageMeta title="Careers Management | Selectt Admin" description="Manage job openings and candidate applications" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-brand-500" /> Career & Recruitment Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review received resumes, candidate applications, and manage live job postings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "applications" && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" /> Export CSV ({totalApps})
              </button>
            )}
            {activeTab === "jobs" && (
              <button
                onClick={() => {
                  setEditingJob(null);
                  setJobForm({
                    title: "",
                    location: "Mumbai",
                    job_type: "Full-time",
                    description: "",
                    is_active: true
                  });
                  setIsJobModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
          <button
            onClick={() => setActiveTab("applications")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 relative transition-colors ${
              activeTab === "applications"
                ? "text-brand-500 border-b-2 border-brand-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Users className="w-4 h-4" /> Applications List
            <span className="px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {totalApps}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 relative transition-colors ${
              activeTab === "jobs"
                ? "text-brand-500 border-b-2 border-brand-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Current Openings ({jobs.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, position..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </form>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-gray-500 font-medium">Status:</span>
                {["all", "pending", "shortlisted", "interviewed", "hired", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      statusFilter === s
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={fetchApplications}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              {loadingApps ? (
                <div className="py-16 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                  Loading candidate applications...
                </div>
              ) : applications.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">No applications found</p>
                  <p className="text-xs text-gray-400 mt-1">Applications submitted on /careers will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-5 py-3.5">Candidate</th>
                        <th className="px-5 py-3.5">Position</th>
                        <th className="px-5 py-3.5">Contact Details</th>
                        <th className="px-5 py-3.5">Applied Date</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Resume</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {applications.map((app) => {
                        const badge = STATUS_BADGES[app.status] || STATUS_BADGES.pending;
                        const resumeUrl = getFullResumeUrl(app.resume_url);

                        return (
                          <tr key={app.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-bold text-gray-900 dark:text-white">{app.full_name}</div>
                              {app.message && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]" title={app.message}>
                                  "{app.message}"
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 font-semibold text-brand-600 dark:text-brand-400">
                              {app.position}
                            </td>
                            <td className="px-5 py-4 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(app.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-brand-500 ${badge.bg}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interviewed">Interviewed</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              {resumeUrl ? (
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" /> View PDF
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">No file</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                                  title="View Full Profile & Resume"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteApp(app.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                  title="Delete Application"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: JOB OPENINGS */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingJobs ? (
                <div className="col-span-3 py-12 text-center text-gray-500">Loading job postings...</div>
              ) : jobs.length === 0 ? (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  No job postings active. Click "Post New Job" above.
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      job.is_active
                        ? "border-gray-200 dark:border-gray-800 shadow-sm"
                        : "border-dashed border-gray-300 dark:border-gray-700 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{job.title}</h3>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            job.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {job.is_active ? "Active" : "Paused"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-500" /> {job.location || "Mumbai"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-500" /> {job.job_type || "Full-time"}
                        </span>
                      </div>

                      {job.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleJobActive(job)}
                        className="text-gray-500 hover:text-brand-500 font-semibold"
                      >
                        {job.is_active ? "Pause Opening" : "Activate"}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setJobForm({
                              title: job.title,
                              location: job.location,
                              job_type: job.job_type,
                              description: job.description || "",
                              is_active: Boolean(job.is_active)
                            });
                            setIsJobModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CANDIDATE RESUME PREVIEW MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedApp.full_name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGES[selectedApp.status]?.bg}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                    Applied for {selectedApp.position}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-brand-500" />
                    <span>{selectedApp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-brand-500" />
                    <span>{selectedApp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <span>Applied: {new Date(selectedApp.created_at).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Update Status:</span>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Cover Letter / Message */}
                {selectedApp.message && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Cover Letter / Message</h4>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedApp.message}
                    </div>
                  </div>
                )}

                {/* Resume Download / Preview Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Attached Resume</h4>
                  {selectedApp.resume_url ? (
                    <div className="p-4 rounded-2xl border border-brand-200 dark:border-brand-900/40 bg-brand-50/50 dark:bg-brand-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {selectedApp.full_name.replace(/\s+/g, "_")}_Resume
                          </div>
                          <div className="text-xs text-gray-500">Document Uploaded</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={getFullResumeUrl(selectedApp.resume_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Download / Open PDF
                        </a>
                        <a
                          href={getFullResumeUrl(selectedApp.resume_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs text-center">
                      No resume file was attached with this application.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 bg-gray-50/50 dark:bg-gray-800/40">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE / EDIT JOB OPENING MODAL */}
        {isJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingJob ? "Edit Job Opening" : "Post New Job Opening"}
                </h3>
                <button
                  onClick={() => setIsJobModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Car Evaluator"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / Remote"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Job Type
                    </label>
                    <select
                      value={jobForm.job_type}
                      onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Remote">Remote</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Job Description & Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Brief details about the role, required experience, and perks..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={jobForm.is_active}
                    onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <label htmlFor="is_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Active & visible on website careers page
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingJob}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow"
                  >
                    {savingJob ? "Saving..." : editingJob ? "Update Job" : "Publish Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

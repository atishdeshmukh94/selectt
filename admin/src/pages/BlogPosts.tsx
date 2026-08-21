import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Edit2, Trash2, Eye, FileText, Clock, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700" },
};

export default function BlogPosts() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API}/api/admin/blog/posts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`${API}/api/admin/blog/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchPosts();
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = posts.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      <PageMeta title="Blog Posts | Selectt Admin" description="Manage blog posts" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Blog Posts</h1>
            <p className="text-sm text-gray-500 font-medium">{posts.length} total posts</p>
          </div>
          <Link to="/blog/new" className="flex items-center gap-2 bg-[#0C1B33] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg w-fit">
            <Plus size={18} /> New Post
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Published", count: counts.published || 0, icon: <CheckCircle size={20} />, color: "text-green-600 bg-green-50" },
            { label: "Drafts", count: counts.draft || 0, icon: <FileText size={20} />, color: "text-gray-600 bg-gray-100" },
            { label: "Pending", count: counts.pending || 0, icon: <AlertCircle size={20} />, color: "text-yellow-600 bg-yellow-50" },
            { label: "Scheduled", count: counts.scheduled || 0, icon: <Clock size={20} />, color: "text-blue-600 bg-blue-50" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div><p className="text-xl font-black text-gray-800 dark:text-white">{s.count}</p><p className="text-xs text-gray-500 font-bold">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Posts list */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="font-bold text-gray-400">No posts found</p>
              <Link to="/blog/new" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-blue-500 hover:underline"><Plus size={14} /> Create your first post</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(post => (
                <div key={post.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {post.featured_image
                      ? <img src={post.featured_image.startsWith('/') ? `${API}${post.featured_image}` : post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={18} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 dark:text-white text-sm truncate">{post.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[post.status]?.color || 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_CONFIG[post.status]?.label || post.status}
                      </span>
                      {post.categories && <span className="text-[10px] text-gray-400 font-medium">{post.categories}</span>}
                      {post.published_at && <span className="text-[10px] text-gray-400">{new Date(post.published_at).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {post.status === 'published' && (
                      <a href={`http://localhost:5173/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                        <Eye size={15} />
                      </a>
                    )}
                    <button onClick={() => navigate(`/blog/edit/${post.id}`)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

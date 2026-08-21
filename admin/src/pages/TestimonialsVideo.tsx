import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Youtube, Eye, EyeOff, GripVertical } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";

const API = API_URL;

type Testimonial = {
  id: number;
  video_url: string;
  youtube_url?: string;
  poster_url: string;
  name: string;
  location: string;
  testimony: string;
  sort_order: number;
  is_active: number;
};

/**
 * Robust YouTube Video ID / Embed URL Extractor
 */
export const extractYouTubeId = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return extractYouTubeId(match[1]);
  }

  if (trimmed.includes('/shorts/')) {
    const parts = trimmed.split('/shorts/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (trimmed.includes('watch?v=')) {
    const parts = trimmed.split('watch?v=')[1];
    return parts?.split('&')[0]?.split('?')[0]?.split('"')[0];
  }
  if (trimmed.includes('/embed/')) {
    const parts = trimmed.split('/embed/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 5) {
    return trimmed;
  }
  return null;
};

export default function TestimonialsVideo() {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const fetchTestimonials = () => {
    setLoading(true);
    fetch(`${API}/api/admin/video-testimonials`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching testimonials:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === testimonials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(testimonials.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Change
  const handleBulkStatus = async (status: number) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/video-testimonials/bulk-status`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ids: selectedIds, is_active: status })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchTestimonials();
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Network error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected video review(s)?`)) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/video-testimonials/bulk-delete`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchTestimonials();
      } else {
        alert("Failed to delete selected reviews");
      }
    } catch {
      alert("Network error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Mouse Drag and Drop Reordering Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const list = [...testimonials];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(dropIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));

    setTestimonials(updatedList);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      await fetch(`${API}/api/admin/video-testimonials/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: updatedList.map((item) => ({ id: item.id, sort_order: item.sort_order }))
        })
      });
    } catch (err) {
      console.error("Reorder save error:", err);
    }
  };

  const openNew = () => {
    setEditing({ youtube_url: "", is_active: 1, sort_order: testimonials.length });
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    const existingUrl = t.youtube_url || t.video_url || "";
    setEditing({
      ...t,
      youtube_url: existingUrl
    });
    setShowForm(true);
  };

  const handleInputChange = (val: string) => {
    const extractedId = extractYouTubeId(val);
    if (extractedId && (val.includes('<iframe') || val.includes('http://') || val.includes('https://'))) {
      setEditing((p) => ({ ...p!, youtube_url: extractedId }));
    } else {
      setEditing((p) => ({ ...p!, youtube_url: val }));
    }
  };

  const handleSave = async () => {
    const rawVal = editing?.youtube_url;
    const finalVideoId = extractYouTubeId(rawVal);

    if (!finalVideoId) {
      alert("Please paste a valid YouTube Short ID or link (e.g. Y4O2PoXeJ7s).");
      return;
    }

    setSaving(true);
    const form = new FormData();
    form.append("youtube_url", finalVideoId);
    form.append("video_url", finalVideoId);
    form.append("name", editing?.name || "");
    form.append("location", editing?.location || "");
    form.append("testimony", editing?.testimony || "");
    form.append("sort_order", String(editing?.sort_order ?? 0));
    form.append("is_active", String(editing?.is_active ?? 1));

    const url = editing?.id ? `${API}/api/admin/video-testimonials/${editing.id}` : `${API}/api/admin/video-testimonials`;
    const method = editing?.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      if (res.ok) {
        fetchTestimonials();
        setShowForm(false);
      } else {
        const d = await res.json();
        alert(d.message || d.error || "Save failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video review?")) return;
    await fetch(`${API}/api/admin/video-testimonials/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTestimonials();
  };

  const handleToggleStatus = async (t: Testimonial) => {
    const form = new FormData();
    Object.entries(t).forEach(([k, v]) => form.append(k, String(v)));
    form.set("is_active", t.is_active ? "0" : "1");
    await fetch(`${API}/api/admin/video-testimonials/${t.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    fetchTestimonials();
  };

  return (
    <>
      <PageMeta title="Video Reviews Management | Selectt Admin" description="Manage YouTube Shorts Video Reviews" />

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Youtube size={20} />
              </span>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Video Reviews (YouTube Shorts)
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Paste YouTube Short ID or link to publish on frontend <span className="text-[#00C9AF] font-bold">/customer-reviews</span>
            </p>
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#0C1B33] hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus size={18} /> Add YouTube Short
          </button>
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#0C1B33] text-white p-4 px-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-[#00C9AF]/40 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#00C9AF] text-[#0C1B33] font-black text-xs flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Item(s) Selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkStatus(1)}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <Eye size={14} /> Publish Selected
              </button>

              <button
                onClick={() => handleBulkStatus(0)}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                <EyeOff size={14} /> Move to Draft
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <Trash2 size={14} /> Delete Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content Table / List */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading video reviews...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center space-y-4">
            <Youtube size={48} className="mx-auto text-red-500/30" />
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">No YouTube Shorts Added Yet</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Click "Add YouTube Short" above to paste your first YouTube Short ID or link.</p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 bg-[#00C9AF] text-[#0C1B33] px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-sm hover:bg-[#00e9ca] transition-all"
            >
              <Plus size={16} /> Add First YouTube Short
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-4 md:p-5 w-8 text-center">
                      <span className="sr-only">Drag Handle</span>
                    </th>
                    <th className="p-4 md:p-5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === testimonials.length && testimonials.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF] cursor-pointer"
                      />
                    </th>
                    <th className="p-4 md:p-5">YouTube Short Preview</th>
                    <th className="p-4 md:p-5">Video ID</th>
                    <th className="p-4 md:p-5 text-center">Status</th>
                    <th className="p-4 md:p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {testimonials.map((t, idx) => {
                    const isChecked = selectedIds.includes(t.id);
                    const videoId = extractYouTubeId(t.youtube_url || t.video_url);

                    return (
                      <tr
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                          setDragOverIndex(null);
                        }}
                        className={`group transition-all ${
                          draggedIndex === idx
                            ? "opacity-30 bg-[#00C9AF]/10 border-2 border-dashed border-[#00C9AF]"
                            : dragOverIndex === idx
                            ? "border-t-4 border-[#00C9AF] bg-[#00C9AF]/5"
                            : isChecked
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Drag Handle */}
                        <td className="p-4 md:p-5 text-center cursor-grab active:cursor-grabbing">
                          <GripVertical size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors mx-auto" />
                        </td>

                        {/* Checkbox Row Selection */}
                        <td className="p-4 md:p-5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(t.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF] cursor-pointer"
                          />
                        </td>

                        {/* Video Preview */}
                        <td className="p-4 md:p-5">
                          <div className="w-16 h-24 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-md">
                            {videoId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}?controls=0`}
                                title="Preview"
                                className="w-full h-full border-0 pointer-events-none"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Youtube size={20} />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* YouTube Video ID */}
                        <td className="p-4 md:p-5">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-red-50 text-red-600 rounded-lg shrink-0">
                              <Youtube size={14} />
                            </span>
                            <span className="font-mono text-sm font-black text-slate-800 dark:text-white">
                              {videoId || t.youtube_url || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Published / Draft Status Badge */}
                        <td className="p-4 md:p-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(t)}
                            className="cursor-pointer inline-flex items-center gap-1.5"
                            title={t.is_active ? "Click to set as Draft" : "Click to Publish"}
                          >
                            {t.is_active ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Published
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Draft
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 md:p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                              title="Edit Review"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Simple YouTube Short Video ID / Link Modal Dialog */}
      {showForm && editing !== null && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold">
                  <Youtube size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    {editing.id ? "Edit YouTube Short" : "New YouTube Short"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    Paste Video ID (e.g. Y4O2PoXeJ7s) or YouTube Short link below
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Youtube size={16} className="text-red-600" />
                  YouTube Video ID or Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editing.youtube_url || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="e.g. Y4O2PoXeJ7s or paste YouTube Shorts URL"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold text-slate-800 dark:text-white focus:border-[#00C9AF] focus:outline-none transition-all"
                />
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  You can paste just the Video ID (<span className="font-mono text-slate-700 dark:text-slate-300 font-bold">Y4O2PoXeJ7s</span>), a YouTube link, or embed code.
                </p>
              </div>

              {/* Live Embed Preview if valid */}
              {editing.youtube_url && extractYouTubeId(editing.youtube_url) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-16 h-24 rounded-xl bg-slate-900 overflow-hidden shrink-0 shadow-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(editing.youtube_url)}?controls=0`}
                      title="Live Preview"
                      className="w-full h-full border-0 pointer-events-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-0.5">
                      ✓ Valid YouTube Video Detected
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      ID: {extractYouTubeId(editing.youtube_url)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3.5 bg-[#0C1B33] hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={16} className="text-[#00C9AF]" />
                {saving ? "Saving..." : editing.id ? "Update YouTube Short" : "Save YouTube Short"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

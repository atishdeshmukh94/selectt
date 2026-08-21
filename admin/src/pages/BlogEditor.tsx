import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, Eye, ArrowLeft, Upload, Link as LinkIcon, X, Plus, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, Code, Image as ImageIcon, Video as VideoIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";

import { API_URL } from "../config/api";
const API = API_URL;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

// ─── Rich Text Toolbar ─────────────────────────────────────────────
const ToolbarBtn = ({ title, onClick, icon }: { title: string; onClick: () => void; icon: React.ReactNode }) => (
  <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
    {icon}
  </button>
);

const RichEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || "");
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  };

  const insertYoutube = () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      const html = `<div class="yt-embed" style="position:relative;padding-bottom:56.25%;height:0;margin:16px 0"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen></iframe></div>`;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, html);
      onChange(editorRef.current?.innerHTML || "");
    } else {
      alert("Invalid YouTube URL");
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <ToolbarBtn title="Bold" onClick={() => exec("bold")} icon={<Bold size={15} />} />
        <ToolbarBtn title="Italic" onClick={() => exec("italic")} icon={<Italic size={15} />} />
        <ToolbarBtn title="Underline" onClick={() => exec("underline")} icon={<Underline size={15} />} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarBtn title="Heading 1" onClick={() => exec("formatBlock", "h1")} icon={<Heading1 size={15} />} />
        <ToolbarBtn title="Heading 2" onClick={() => exec("formatBlock", "h2")} icon={<Heading2 size={15} />} />
        <ToolbarBtn title="Paragraph" onClick={() => exec("formatBlock", "p")} icon={<AlignLeft size={15} />} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarBtn title="Bullet List" onClick={() => exec("insertUnorderedList")} icon={<List size={15} />} />
        <ToolbarBtn title="Numbered List" onClick={() => exec("insertOrderedList")} icon={<ListOrdered size={15} />} />
        <ToolbarBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")} icon={<Quote size={15} />} />
        <ToolbarBtn title="Code" onClick={() => exec("formatBlock", "pre")} icon={<Code size={15} />} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarBtn title="Align Left" onClick={() => exec("justifyLeft")} icon={<AlignLeft size={15} />} />
        <ToolbarBtn title="Align Center" onClick={() => exec("justifyCenter")} icon={<AlignCenter size={15} />} />
        <ToolbarBtn title="Align Right" onClick={() => exec("justifyRight")} icon={<AlignRight size={15} />} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarBtn title="Insert Link" onClick={insertLink} icon={<LinkIcon size={15} />} />
        <ToolbarBtn title="Insert Image (URL)" onClick={insertImage} icon={<ImageIcon size={15} />} />
        <ToolbarBtn title="Embed YouTube" onClick={insertYoutube} icon={<VideoIcon size={15} />} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarBtn title="Remove Formatting" onClick={() => exec("removeFormat")} icon={<X size={15} />} />
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; onChange(editorRef.current?.innerHTML || ""); }}
        onInput={() => { if (!isComposing.current) onChange(editorRef.current?.innerHTML || ""); }}
        className="min-h-[400px] px-5 py-4 text-gray-800 dark:text-gray-200 outline-none prose prose-sm max-w-none focus:outline-none"
        style={{ lineHeight: "1.8" }}
        data-placeholder="Start writing your post..."
      />
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
        [contenteditable] h1 { font-size: 1.8em; font-weight: 800; margin: .6em 0; }
        [contenteditable] h2 { font-size: 1.4em; font-weight: 700; margin: .5em 0; }
        [contenteditable] blockquote { border-left: 3px solid #00C9AF; padding: 8px 16px; margin: 12px 0; color: #64748b; background: #fef2f2; border-radius: 4px; }
        [contenteditable] pre { background: #1e293b; color: #e2e8f0; padding: 12px 16px; border-radius: 8px; overflow-x: auto; font-size: .85em; margin: 12px 0; }
        [contenteditable] a { color: #00C9AF; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; margin: 8px 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; margin: 8px 0; }
      `}</style>
    </div>
  );
};

// ─── Main Editor ────────────────────────────────────────────────────
export default function BlogEditor() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", slug: "", content: "", excerpt: "",
    featured_image: "", image_url: "", video_url: "", video_type: "youtube",
    status: "draft", published_at: "",
    meta_title: "", meta_description: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newCat, setNewCat] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<"seo" | "image" | "video" | "cats" | "tags">("image");

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const authH = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/blog/categories`).then(r => r.json()),
      fetch(`${API}/api/blog/tags`).then(r => r.json()),
    ]).then(([c, t]) => { setCategories(Array.isArray(c) ? c : []); setTags(Array.isArray(t) ? t : []); });

    if (isEdit) {
      fetch(`${API}/api/admin/blog/posts/${id}`, { headers: authH }).then(r => r.json()).then(d => {
        setForm({
          title: d.title || "", slug: d.slug || "", content: d.content || "", excerpt: d.excerpt || "",
          featured_image: d.featured_image || "", image_url: d.featured_image || "",
          video_url: d.video_url || "", video_type: d.video_type || "youtube",
          status: d.status || "draft",
          published_at: d.published_at ? d.published_at.slice(0, 16) : "",
          meta_title: d.meta_title || "", meta_description: d.meta_description || "",
        });
        setSelectedCats(d.category_ids || []);
        setSelectedTags(d.tag_ids || []);
        if (d.featured_image) setImagePreview(d.featured_image.startsWith('/') ? `${API}${d.featured_image}` : d.featured_image);
      });
    }
  }, [id]);

  // Auto-generate slug from title
  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!isEdit) set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    if (!form.meta_title) set("meta_title", v);
  };

  const handleSave = async (statusOverride?: string) => {
    if (!form.title) { alert("Title is required"); return; }
    setSaving(true);
    const formData = new FormData();
    const finalStatus = statusOverride || form.status;
    Object.entries({ ...form, status: finalStatus }).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });
    if (imageFile) formData.append("featured_image", imageFile);
    selectedCats.forEach(c => formData.append("category_ids", String(c)));
    selectedTags.forEach(t => formData.append("tag_ids", String(t)));
    try {
      const url = isEdit ? `${API}/api/admin/blog/posts/${id}` : `${API}/api/admin/blog/posts`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (res.ok) { navigate("/blog"); }
      else alert(data.message || "Save failed");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch(`${API}/api/admin/blog/tags`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: newTag }) });
    const d = await res.json();
    if (d.id) { const slug = newTag.toLowerCase().replace(/[^a-z0-9]+/g, "-"); setTags(p => [...p, { id: d.id, name: newTag, slug }]); setSelectedTags(p => [...p, d.id]); }
    setNewTag("");
  };
  const handleAddCat = async () => {
    if (!newCat.trim()) return;
    const res = await fetch(`${API}/api/admin/blog/categories`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: newCat }) });
    const d = await res.json();
    if (d.id) { const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, "-"); setCategories(p => [...p, { id: d.id, name: newCat, slug }]); setSelectedCats(p => [...p, d.id]); }
    setNewCat("");
  };

  const toggleCat = (id: number) => setSelectedCats(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  const toggleTag = (id: number) => setSelectedTags(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);

  const seoScore = (() => {
    let score = 0;
    if (form.meta_title && form.meta_title.length >= 30 && form.meta_title.length <= 60) score += 34;
    if (form.meta_description && form.meta_description.length >= 100 && form.meta_description.length <= 160) score += 33;
    if (form.featured_image || imageFile) score += 33;
    return score;
  })();

  return (
    <>
      <PageMeta title={isEdit ? "Edit Post | Selectt Admin" : "New Post | Selectt Admin"} description="Blog editor" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/blog")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-sm font-bold transition-colors">
            <ArrowLeft size={18} /> All Posts
          </button>
          <div className="flex-1" />
          <select value={form.status} onChange={e => set("status", e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => handleSave("draft")} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-black text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
            <Save size={14} /> Save Draft
          </button>
          <button onClick={() => handleSave("published")} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white bg-[#00C9AF] hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-200">
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <input
                type="text" placeholder="Post title..." value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full text-3xl font-black text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-300 mb-2"
              />
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Slug:</span>
                <input type="text" value={form.slug} onChange={e => set("slug", e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 outline-none" />
              </div>
            </div>

            {/* Content editor */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Content</label>
              <RichEditor value={form.content} onChange={v => set("content", v)} />
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Excerpt (short summary)</label>
              <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={3}
                placeholder="Write a short summary for this post..."
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none resize-none text-gray-700 dark:text-gray-300 border-none" />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Publish panel */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Publish</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-bold border-none outline-none">
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {(form.status === "scheduled" || form.status === "published") && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Publish Date</label>
                    <input type="datetime-local" value={form.published_at} onChange={e => set("published_at", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border-none outline-none" />
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleSave("draft")} disabled={saving} className="flex-1 py-2 text-xs font-black text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">Save Draft</button>
                  <button onClick={() => handleSave("published")} disabled={saving} className="flex-1 py-2 text-xs font-black text-white bg-[#00C9AF] hover:bg-rose-700 rounded-lg transition-all">{saving ? "..." : "Publish"}</button>
                </div>
              </div>
            </div>

            {/* Accordion panels */}
            {[
              { key: "image", label: "Featured Image" },
              { key: "video", label: "Video" },
              { key: "cats", label: "Categories" },
              { key: "tags", label: "Tags" },
              { key: "seo", label: `SEO (Score: ${seoScore}%)` },
            ].map(panel => (
              <div key={panel.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <button onClick={() => setActivePanel(activePanel === panel.key as any ? "image" : panel.key as any)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{panel.label}</h3>
                  <span className="text-gray-400 text-xs">{activePanel === panel.key ? "▲" : "▼"}</span>
                </button>
                {activePanel === panel.key && (
                  <div className="p-4">
                    {/* Featured Image */}
                    {panel.key === "image" && (
                      <div className="space-y-2">
                        {imagePreview && <div className="w-full h-32 rounded-xl overflow-hidden border border-gray-200 mb-2"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /></div>}
                        <div onClick={() => fileRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/20 transition-all">
                          <Upload size={20} className="text-gray-300 mb-1" />
                          <span className="text-xs text-gray-400 font-bold">Upload image</span>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                        }} />
                        <input type="text" placeholder="Or paste image URL..." value={form.image_url}
                          onChange={e => { set("image_url", e.target.value); if (!imageFile) setImagePreview(e.target.value); }}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs border-none outline-none" />
                      </div>
                    )}
                    {/* Video */}
                    {panel.key === "video" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Type</label>
                          <select value={form.video_type} onChange={e => set("video_type", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border-none outline-none font-bold">
                            <option value="youtube">YouTube</option>
                            <option value="upload">Upload / URL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            {form.video_type === "youtube" ? "YouTube URL" : "Video URL"}
                          </label>
                          <input type="text" value={form.video_url} onChange={e => set("video_url", e.target.value)}
                            placeholder={form.video_type === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs border-none outline-none" />
                        </div>
                      </div>
                    )}
                    {/* Categories */}
                    {panel.key === "cats" && (
                      <div className="space-y-2">
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {categories.map(c => (
                            <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900">
                              <input type="checkbox" checked={selectedCats.includes(c.id)} onChange={() => toggleCat(c.id)} className="accent-rose-500 w-3.5 h-3.5" />
                              {c.name}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCat()} placeholder="New category..." className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs border-none outline-none" />
                          <button onClick={handleAddCat} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all"><Plus size={12} /></button>
                        </div>
                      </div>
                    )}
                    {/* Tags */}
                    {panel.key === "tags" && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map(t => (
                            <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${selectedTags.includes(t.id) ? 'bg-[#00C9AF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                              {t.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddTag()} placeholder="New tag, press Enter..." className="flex-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs border-none outline-none" />
                          <button onClick={handleAddTag} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all"><Plus size={12} /></button>
                        </div>
                      </div>
                    )}
                    {/* SEO */}
                    {panel.key === "seo" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${seoScore}%`, background: seoScore >= 80 ? '#22c55e' : seoScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className={`text-xs font-black ${seoScore >= 80 ? 'text-green-500' : seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{seoScore}%</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            Meta Title <span className={form.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}>{form.meta_title.length}/60</span>
                          </label>
                          <input type="text" value={form.meta_title} onChange={e => set("meta_title", e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border-none outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            Meta Description <span className={form.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}>{form.meta_description.length}/160</span>
                          </label>
                          <textarea value={form.meta_description} onChange={e => set("meta_description", e.target.value)} rows={3}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border-none outline-none resize-none" />
                        </div>
                        {/* Google preview */}
                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Google Preview</p>
                          <p className="text-blue-600 text-sm font-semibold truncate">{form.meta_title || form.title || "Post Title"}</p>
                          <p className="text-green-600 text-[11px]">selecttcars.com/blog/{form.slug || "post-slug"}</p>
                          <p className="text-gray-600 text-[11px] mt-1 line-clamp-2">{form.meta_description || form.excerpt || "Post description..."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

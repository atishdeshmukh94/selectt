import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon, 
  X, 
  Plus, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Code, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  FolderOpen,
  Trash2,
  RefreshCw,
  Check,
  Globe,
  Sparkles,
  Calendar,
  Clock,
  FileText,
  Tag as TagIcon,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import MediaGalleryModal from "../components/common/MediaGalleryModal";
import { toast } from "react-hot-toast";

import { API_URL } from "../config/api";
const API = API_URL;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "pending", label: "Pending Review", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { value: "published", label: "Published", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
];

// ─── Rich Text Toolbar Button ─────────────────────────────────────────────
const ToolbarBtn = ({ title, onClick, icon, active = false }: { title: string; onClick: () => void; icon: React.ReactNode; active?: boolean }) => (
  <button 
    type="button" 
    title={title} 
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
      active 
        ? "bg-[#1C3EB9]/10 text-[#1C3EB9] font-bold" 
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    {icon}
  </button>
);

const RichEditor = ({ 
  value, 
  onChange, 
  onOpenMediaGallery, 
  editorRefInstance 
}: { 
  value: string; 
  onChange: (v: string) => void;
  onOpenMediaGallery?: () => void;
  editorRefInstance?: React.MutableRefObject<any>;
}) => {
  const localEditorRef = useRef<HTMLDivElement>(null);
  const editorRef = editorRefInstance || localEditorRef;
  const isComposing = useRef(false);
  const contentFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    const url = prompt("Enter link URL (e.g. https://selectt.in):");
    if (url) exec("createLink", url);
  };

  const insertImagePrompt = () => {
    const url = prompt("Enter direct image URL:");
    if (url) exec("insertImage", url);
  };

  const insertYoutube = () => {
    const url = prompt("Enter YouTube URL (e.g. https://www.youtube.com/watch?v=...):");
    if (!url) return;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      const html = `<div class="yt-embed" style="position:relative;padding-bottom:56.25%;height:0;margin:20px 0;overflow:hidden;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.15)"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, html);
      onChange(editorRef.current?.innerHTML || "");
    } else {
      toast.error("Invalid YouTube URL format");
    }
  };

  // Upload image directly into post content
  const handleContentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || localStorage.getItem("token")}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const fullImgUrl = data.url.startsWith("http") ? data.url : `${API}${data.url.startsWith("/") ? "" : "/"}${data.url}`;
        editorRef.current?.focus();
        document.execCommand("insertImage", false, fullImgUrl);
        onChange(editorRef.current?.innerHTML || "");
        toast.success("Image inserted into post!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Error uploading image");
    } finally {
      setIsUploadingImage(false);
      if (contentFileRef.current) contentFileRef.current.value = "";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xs">
      {/* Rich Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850/60 sticky top-[61px] z-10 backdrop-blur-xs">
        <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")} icon={<Bold size={15} />} />
        <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")} icon={<Italic size={15} />} />
        <ToolbarBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")} icon={<Underline size={15} />} />
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        <ToolbarBtn title="Heading 1" onClick={() => exec("formatBlock", "h1")} icon={<Heading1 size={15} />} />
        <ToolbarBtn title="Heading 2" onClick={() => exec("formatBlock", "h2")} icon={<Heading2 size={15} />} />
        <ToolbarBtn title="Paragraph" onClick={() => exec("formatBlock", "p")} icon={<AlignLeft size={15} />} />
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        <ToolbarBtn title="Bullet List" onClick={() => exec("insertUnorderedList")} icon={<List size={15} />} />
        <ToolbarBtn title="Numbered List" onClick={() => exec("insertOrderedList")} icon={<ListOrdered size={15} />} />
        <ToolbarBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")} icon={<Quote size={15} />} />
        <ToolbarBtn title="Code Block" onClick={() => exec("formatBlock", "pre")} icon={<Code size={15} />} />
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        <ToolbarBtn title="Align Left" onClick={() => exec("justifyLeft")} icon={<AlignLeft size={15} />} />
        <ToolbarBtn title="Align Center" onClick={() => exec("justifyCenter")} icon={<AlignCenter size={15} />} />
        <ToolbarBtn title="Align Right" onClick={() => exec("justifyRight")} icon={<AlignRight size={15} />} />
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        <ToolbarBtn title="Insert Link" onClick={insertLink} icon={<LinkIcon size={15} />} />

        {/* Gallery Button */}
        <button
          type="button"
          title="Select from Media Gallery"
          onClick={() => onOpenMediaGallery && onOpenMediaGallery()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#1C3EB9]/10 text-[#1C3EB9] hover:bg-[#1C3EB9]/20 transition-all cursor-pointer shadow-2xs"
        >
          <FolderOpen size={13} />
          <span>Gallery</span>
        </button>

        {/* Upload Image Button */}
        <button
          type="button"
          title="Upload image from computer"
          onClick={() => contentFileRef.current?.click()}
          disabled={isUploadingImage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-2xs"
        >
          {isUploadingImage ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
          <span>{isUploadingImage ? "Uploading..." : "Upload Image"}</span>
        </button>
        <input
          ref={contentFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleContentFileUpload}
        />

        <ToolbarBtn title="Insert Image URL" onClick={insertImagePrompt} icon={<ImageIcon size={15} />} />
        <ToolbarBtn title="Embed YouTube Video" onClick={insertYoutube} icon={<VideoIcon size={15} />} />
        
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <ToolbarBtn title="Clear Formatting" onClick={() => exec("removeFormat")} icon={<X size={15} />} />
      </div>

      {/* Editable Writing Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; onChange(editorRef.current?.innerHTML || ""); }}
        onInput={() => { if (!isComposing.current) onChange(editorRef.current?.innerHTML || ""); }}
        className="min-h-[480px] p-6 text-gray-800 dark:text-gray-100 outline-none max-w-none focus:outline-none leading-relaxed text-sm sm:text-base selection:bg-[#1C3EB9]/20"
        data-placeholder="Write your article content here with rich formatting, headings, images, and embeds..."
      />

      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; font-style: italic; }
        [contenteditable] h1 { font-size: 1.85em; font-weight: 800; margin: 0.8em 0 0.4em; color: #111827; letter-spacing: -0.02em; }
        [contenteditable] h2 { font-size: 1.45em; font-weight: 700; margin: 0.7em 0 0.3em; color: #1f2937; letter-spacing: -0.01em; }
        .dark [contenteditable] h1, .dark [contenteditable] h2 { color: #f9fafb; }
        [contenteditable] blockquote { border-left: 4px solid #1C3EB9; padding: 10px 18px; margin: 16px 0; color: #475569; background: rgba(28, 62, 185, 0.04); border-radius: 0 12px 12px 0; font-style: italic; }
        .dark [contenteditable] blockquote { color: #cbd5e1; background: rgba(28, 62, 185, 0.12); }
        [contenteditable] pre { background: #0f172a; color: #e2e8f0; padding: 14px 18px; border-radius: 12px; overflow-x: auto; font-size: 0.85em; margin: 16px 0; border: 1px solid #1e293b; }
        [contenteditable] a { color: #1C3EB9; text-decoration: underline; font-weight: 600; }
        [contenteditable] img { max-width: 100%; border-radius: 14px; margin: 16px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        [contenteditable] ul { list-style: disc; padding-left: 1.6em; margin: 12px 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.6em; margin: 12px 0; }
        [contenteditable] p { margin: 8px 0; }
      `}</style>
    </div>
  );
};

// ─── Main Blog Editor Page ────────────────────────────────────────────────────
export default function BlogEditor() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", 
    slug: "", 
    content: "", 
    excerpt: "",
    featured_image: "", 
    image_url: "", 
    video_url: "", 
    video_type: "youtube",
    status: "draft", 
    published_at: "",
    meta_title: "", 
    meta_description: "",
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
  const [loadingPost, setLoadingPost] = useState(false);

  // Media Gallery Modal State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<"featured" | "content">("featured");
  const richEditorRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "https://selectt.in";

  const handleMediaSelect = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API}${url.startsWith("/") ? "" : "/"}${url}`;
    if (mediaModalTarget === "featured") {
      set("featured_image", url);
      set("image_url", url);
      setImageFile(null);
      setImagePreview(fullUrl);
      toast.success("Featured image selected from Media Gallery!");
    } else {
      if (richEditorRef.current) {
        richEditorRef.current.focus();
        document.execCommand("insertImage", false, fullUrl);
        set("content", richEditorRef.current.innerHTML || "");
        toast.success("Image inserted into post content!");
      }
    }
  };

  useEffect(() => {
    const authH = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/blog/categories`).then(r => r.json()),
      fetch(`${API}/api/blog/tags`).then(r => r.json()),
    ]).then(([c, t]) => { 
      setCategories(Array.isArray(c) ? c : []); 
      setTags(Array.isArray(t) ? t : []); 
    });

    if (isEdit) {
      setLoadingPost(true);
      fetch(`${API}/api/admin/blog/posts/${id}`, { headers: authH })
        .then(r => {
          if (!r.ok) throw new Error("Failed to load post");
          return r.json();
        })
        .then(d => {
          setForm({
            title: d.title || "", 
            slug: d.slug || "", 
            content: d.content || "", 
            excerpt: d.excerpt || "",
            featured_image: d.featured_image || "", 
            image_url: d.featured_image || "",
            video_url: d.video_url || "", 
            video_type: d.video_type || "youtube",
            status: d.status || "draft",
            published_at: d.published_at ? d.published_at.slice(0, 16) : "",
            meta_title: d.meta_title || "", 
            meta_description: d.meta_description || "",
          });
          setSelectedCats(d.category_ids || []);
          setSelectedTags(d.tag_ids || []);
          if (d.featured_image) {
            setImagePreview(d.featured_image.startsWith('/') ? `${API}${d.featured_image}` : d.featured_image);
          }
        })
        .catch(() => toast.error("Error loading post data"))
        .finally(() => setLoadingPost(false));
    }
  }, [id]);

  // Auto-generate slug and meta title from title
  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!isEdit || !form.slug) {
      set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
    if (!form.meta_title) set("meta_title", v);
  };

  // Word count & reading time
  const stats = useMemo(() => {
    const text = form.content.replace(/<[^>]*>/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const chars = text.length;
    return { words, readTime, chars };
  }, [form.content]);

  // SEO Score calculation
  const seoScore = useMemo(() => {
    let score = 0;
    if (form.title && form.title.length >= 10) score += 20;
    if (form.meta_title && form.meta_title.length >= 25 && form.meta_title.length <= 65) score += 25;
    if (form.meta_description && form.meta_description.length >= 70 && form.meta_description.length <= 160) score += 25;
    if (form.featured_image || imageFile) score += 15;
    if (form.content && stats.words >= 150) score += 15;
    return score;
  }, [form.title, form.meta_title, form.meta_description, form.featured_image, imageFile, stats.words]);

  const handleSave = async (statusOverride?: string) => {
    if (!form.title.trim()) { 
      toast.error("Please enter an article title"); 
      return; 
    }
    setSaving(true);
    const formData = new FormData();
    const finalStatus = statusOverride || form.status;
    
    Object.entries({ ...form, status: finalStatus }).forEach(([k, v]) => { 
      if (v !== undefined && v !== null) formData.append(k, String(v)); 
    });

    if (imageFile) formData.append("featured_image", imageFile);
    selectedCats.forEach(c => formData.append("category_ids", String(c)));
    selectedTags.forEach(t => formData.append("tag_ids", String(t)));

    try {
      const url = isEdit ? `${API}/api/admin/blog/posts/${id}` : `${API}/api/admin/blog/posts`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { 
        method, 
        headers: { Authorization: `Bearer ${token}` }, 
        body: formData 
      });
      const data = await res.json();
      if (res.ok) { 
        toast.success(isEdit ? "Post updated successfully!" : "Post published successfully!");
        navigate("/blog"); 
      } else {
        toast.error(data.message || data.error || "Failed to save post");
      }
    } catch { 
      toast.error("Network error while saving post"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/blog/tags`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, 
        body: JSON.stringify({ name: newTag.trim() }) 
      });
      const d = await res.json();
      if (d.id) { 
        const slug = newTag.toLowerCase().replace(/[^a-z0-9]+/g, "-"); 
        setTags(p => [...p, { id: d.id, name: newTag.trim(), slug }]); 
        setSelectedTags(p => [...p, d.id]); 
        toast.success(`Tag "${newTag}" added!`);
      }
    } catch {
      toast.error("Failed to add tag");
    }
    setNewTag("");
  };

  const handleAddCat = async () => {
    if (!newCat.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/blog/categories`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, 
        body: JSON.stringify({ name: newCat.trim() }) 
      });
      const d = await res.json();
      if (d.id) { 
        const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, "-"); 
        setCategories(p => [...p, { id: d.id, name: newCat.trim(), slug }]); 
        setSelectedCats(p => [...p, d.id]); 
        toast.success(`Category "${newCat}" added!`);
      }
    } catch {
      toast.error("Failed to add category");
    }
    setNewCat("");
  };

  const toggleCat = (catId: number) => {
    setSelectedCats(p => p.includes(catId) ? p.filter(c => c !== catId) : [...p, catId]);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(p => p.includes(tagId) ? p.filter(t => t !== tagId) : [...p, tagId]);
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-[#1C3EB9]" />
          <span className="text-xs font-bold text-gray-500">Loading post editor...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta 
        title={isEdit ? `Edit Post: ${form.title || 'Article'} | Selectt Admin` : "Create New Post | Selectt Admin"} 
        description="Selectt Blog Article Editor" 
      />

      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-16">
        {/* Sticky Top Action Header */}
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          {/* Left: Breadcrumbs & Status */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => navigate("/blog")} 
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">All Posts</span>
            </button>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-gray-400 hidden md:inline">Blog /</span>
              <h1 className="text-sm font-extrabold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {form.title ? form.title : (isEdit ? "Edit Post" : "Draft New Article")}
              </h1>
            </div>

            {/* Status Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold capitalize ${
              STATUS_OPTIONS.find(o => o.value === form.status)?.color || "bg-gray-100 text-gray-700"
            }`}>
              {form.status}
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Preview Button */}
            {form.slug && (
              <a
                href={`${frontendUrl}/blog/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all shadow-2xs"
                title="Preview live article"
              >
                <ExternalLink size={13} />
                <span>Preview</span>
              </a>
            )}

            {/* Save Draft */}
            <button 
              onClick={() => handleSave("draft")} 
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Save size={14} className="text-gray-500" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {/* Primary Publish / Update Button */}
            <button 
              onClick={() => handleSave(form.status === "draft" ? "published" : form.status)} 
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-[#1C3EB9] hover:bg-[#153299] rounded-xl transition-all shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>{isEdit ? "Update Post" : "Publish Article"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Form */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (8 of 12 cols): Title, Content, Excerpt, SEO */}
            <div className="lg:col-span-8 space-y-6">

              {/* Title & Permalink Box */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-[#1C3EB9]" />
                    <span>Article Title</span>
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {form.title.length} characters
                  </span>
                </div>

                <input
                  type="text" 
                  placeholder="Enter a compelling article title..." 
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-black text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-300 dark:placeholder-gray-700 tracking-tight"
                />

                {/* Slug / URL preview */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2 text-xs text-gray-500">
                  <Globe size={13} className="text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-400 shrink-0 select-none">selectt.in/blog/</span>
                  <input 
                    type="text" 
                    value={form.slug} 
                    onChange={e => set("slug", e.target.value)}
                    placeholder="article-url-slug"
                    className="flex-1 bg-gray-50 dark:bg-gray-800/80 rounded-lg px-2.5 py-1 text-xs font-mono text-[#1C3EB9] dark:text-blue-400 border border-gray-200/60 dark:border-gray-700/60 outline-none focus:border-[#1C3EB9]" 
                  />
                </div>
              </div>

              {/* Rich Content Editor */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-[#1C3EB9]" />
                    <span>Article Content</span>
                  </label>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                    <span>{stats.words} words</span>
                    <span>·</span>
                    <span>{stats.readTime} min read</span>
                  </div>
                </div>

                <RichEditor 
                  value={form.content} 
                  onChange={v => set("content", v)} 
                  onOpenMediaGallery={() => {
                    setMediaModalTarget("content");
                    setShowMediaModal(true);
                  }}
                  editorRefInstance={richEditorRef}
                />
              </div>

              {/* Excerpt / Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    Excerpt (Short Summary for Card Lists & Social Previews)
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {form.excerpt.length} characters
                  </span>
                </div>
                <textarea 
                  value={form.excerpt} 
                  onChange={e => set("excerpt", e.target.value)} 
                  rows={3}
                  placeholder="Summarize this article in 1-2 engaging sentences..."
                  className="w-full bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl p-4 text-xs sm:text-sm outline-none resize-none text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700 focus:border-[#1C3EB9] transition-all leading-relaxed" 
                />
              </div>

              {/* SEO & Search Preview Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Search size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        Search Engine Optimization (SEO)
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Optimize how this article ranks and appears on Google
                      </p>
                    </div>
                  </div>

                  {/* SEO Health Meter */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                    <span className="text-[11px] font-bold text-gray-500">Score:</span>
                    <span className={`text-xs font-black ${seoScore >= 80 ? 'text-emerald-600' : seoScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {seoScore}%
                    </span>
                  </div>
                </div>

                {/* Google Snippet Live Preview Box */}
                <div className="p-4 rounded-2xl bg-[#f8f9fa] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-left space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                    <Globe size={11} /> Google Snippet Preview
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 font-bold text-sm hover:underline truncate cursor-pointer">
                    {form.meta_title || form.title || "Post Title Preview — Selectt"}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 text-xs font-medium truncate">
                    https://selectt.in/blog/{form.slug || "article-url-slug"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-xs leading-snug line-clamp-2 pt-0.5">
                    {form.meta_description || form.excerpt || "Article description preview snippet for search engines..."}
                  </div>
                </div>

                {/* Meta Inputs */}
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Meta Title
                      </label>
                      <span className={`text-[10px] font-semibold ${form.meta_title.length > 60 ? 'text-rose-500' : 'text-gray-400'}`}>
                        {form.meta_title.length}/60 chars
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={form.meta_title} 
                      onChange={e => set("meta_title", e.target.value)}
                      placeholder="Title for Google search results..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9]" 
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Meta Description
                      </label>
                      <span className={`text-[10px] font-semibold ${form.meta_description.length > 160 ? 'text-rose-500' : 'text-gray-400'}`}>
                        {form.meta_description.length}/160 chars
                      </span>
                    </div>
                    <textarea 
                      value={form.meta_description} 
                      onChange={e => set("meta_description", e.target.value)} 
                      rows={3}
                      placeholder="Concise summary for search engine snippet..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9] resize-none leading-relaxed" 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Sidebar (4 of 12 cols): Publishing, Featured Image, Categories, Tags, Video */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. Publishing Options Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <Clock size={16} className="text-[#1C3EB9]" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Publishing Settings
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                      Post Status
                    </label>
                    <select 
                      value={form.status} 
                      onChange={e => set("status", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {(form.status === "scheduled" || form.status === "published") && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                        {form.status === "scheduled" ? "Schedule Date & Time" : "Published Date"}
                      </label>
                      <input 
                        type="datetime-local" 
                        value={form.published_at} 
                        onChange={e => set("published_at", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 outline-none" 
                      />
                    </div>
                  )}

                  {/* Action buttons inside card */}
                  <div className="pt-2 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleSave("draft")} 
                      disabled={saving} 
                      className="flex-1 py-2.5 text-xs font-extrabold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      Save Draft
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSave("published")} 
                      disabled={saving} 
                      className="flex-1 py-2.5 text-xs font-extrabold text-white bg-[#1C3EB9] hover:bg-[#153299] rounded-xl transition-all shadow-sm shadow-blue-900/20 cursor-pointer active:scale-95"
                    >
                      {saving ? "Saving..." : (isEdit ? "Update" : "Publish")}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Featured Image Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <ImageIcon size={16} className="text-[#1C3EB9]" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Featured Cover Image
                  </h3>
                </div>

                {imagePreview ? (
                  <div className="space-y-2.5">
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group bg-slate-900">
                      <img src={imagePreview} alt="Featured Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaModalTarget("featured");
                            setShowMediaModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                        >
                          <FolderOpen size={13} />
                          <span>Gallery</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            set("featured_image", "");
                            set("image_url", "");
                          }}
                          className="p-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium px-1">
                      <span className="truncate max-w-[200px] font-mono">
                        {imageFile ? imageFile.name : (form.featured_image?.split("/").pop() || "Featured Cover")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          set("featured_image", "");
                          set("image_url", "");
                        }}
                        className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Media Gallery Option */}
                    <div
                      onClick={() => {
                        setMediaModalTarget("featured");
                        setShowMediaModal(true);
                      }}
                      className="p-4 border-2 border-dashed border-[#1C3EB9]/30 dark:border-[#1C3EB9]/40 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1C3EB9] hover:bg-[#1C3EB9]/5 transition-all group"
                    >
                      <div className="size-9 rounded-xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <FolderOpen size={18} />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">Media Gallery</span>
                      <span className="text-[10px] text-gray-400">Browse assets</span>
                    </div>

                    {/* From Computer */}
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                    >
                      <div className="size-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">From Computer</span>
                      <span className="text-[10px] text-gray-400">Upload new</span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                      set("image_url", "");
                    }
                  }}
                />

                <div className="pt-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Or Direct Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/cover.jpg"
                    value={form.image_url}
                    onChange={(e) => {
                      set("image_url", e.target.value);
                      set("featured_image", e.target.value);
                      if (!imageFile) setImagePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9]"
                  />
                </div>
              </div>

              {/* 3. Categories Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-[#1C3EB9]" />
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      Categories
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#1C3EB9] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    {selectedCats.length} selected
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {categories.map(c => (
                    <label 
                      key={c.id} 
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        selectedCats.includes(c.id) 
                          ? "bg-blue-50/70 dark:bg-blue-950/40 text-[#1C3EB9] dark:text-blue-300 font-bold" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{c.name}</span>
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(c.id)} 
                        onChange={() => toggleCat(c.id)} 
                        className="accent-[#1C3EB9] w-4 h-4 rounded cursor-pointer" 
                      />
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No categories yet</p>
                  )}
                </div>

                {/* Add Quick Category */}
                <div className="flex gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <input 
                    type="text" 
                    value={newCat} 
                    onChange={e => setNewCat(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && handleAddCat()} 
                    placeholder="New category..." 
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9]" 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCat} 
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* 4. Tags Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TagIcon size={16} className="text-[#1C3EB9]" />
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      Article Tags
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {selectedTags.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {tags.map(t => (
                    <button 
                      key={t.id} 
                      type="button" 
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        selectedTags.includes(t.id) 
                          ? 'bg-[#1C3EB9] text-white shadow-sm shadow-blue-900/20' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>#{t.name}</span>
                      {selectedTags.includes(t.id) && <Check size={11} />}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-xs text-gray-400 py-1">No tags yet</p>
                  )}
                </div>

                {/* Add Quick Tag */}
                <div className="flex gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <input 
                    type="text" 
                    value={newTag} 
                    onChange={e => setNewTag(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && handleAddTag()} 
                    placeholder="New tag (press enter)..." 
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9]" 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTag} 
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* 5. Video Embed Option */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <VideoIcon size={16} className="text-[#1C3EB9]" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Optional Video
                  </h3>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    YouTube URL
                  </label>
                  <input 
                    type="text" 
                    value={form.video_url} 
                    onChange={e => set("video_url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 focus:border-[#1C3EB9]" 
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Media Gallery Selector Modal */}
      <MediaGalleryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        title={mediaModalTarget === "featured" ? "Select Featured Cover from Gallery" : "Insert Image into Post Content"}
      />
    </>
  );
}



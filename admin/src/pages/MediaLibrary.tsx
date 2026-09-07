import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "react-hot-toast";
import {
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Edit3,
  X,
  Upload,
  Play,
  FileText,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Copy,
  ExternalLink,
  Download,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  Eye,
  RefreshCw,
  Sliders,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { API_URL } from "../config/api";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";

interface MediaItem {
  url: string;
  filename?: string;
  thumbnailUrl?: string;
  size: number;
  createdAt: string;
  alt: string;
  type?: "image" | "video" | "document";
}

const PAGE_SIZE = 48;

// ── Helpers ────────────────────────────────────────────────────────────────
function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function getFileType(url: string): "image" | "video" | "document" {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "m4v", "avi", "mkv"].includes(ext)) return "video";
  return "document";
}

function getFullUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "document">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "largest" | "smallest" | "name">("newest");

  // Selection & Bulk Actions
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editAltItem, setEditAltItem] = useState<MediaItem | null>(null);
  const [altTextInput, setAltTextInput] = useState("");
  const [isSavingAlt, setIsSavingAlt] = useState(false);

  // Delete Confirmations
  const [deleteSingleItem, setDeleteSingleItem] = useState<MediaItem | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        const data: MediaItem[] = await res.json();
        setMedia(data);
      } else {
        toast.error("Failed to load media files");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      fetchMedia();
    }
  };

  // Copy Link
  const handleCopyLink = (url: string) => {
    const full = getFullUrl(url);
    navigator.clipboard.writeText(full);
    toast.success("Image URL copied to clipboard!");
  };

  // Download File
  const handleDownload = (url: string, filename?: string) => {
    const full = getFullUrl(url);
    const a = document.createElement("a");
    a.href = full;
    a.download = filename || url.split("/").pop() || "media";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Save Alt Text
  const handleSaveAlt = async () => {
    if (!editAltItem) return;
    setIsSavingAlt(true);
    try {
      const res = await fetch(`${API_URL}/api/media/alt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          filePath: editAltItem.url,
          altText: altTextInput.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Alt text saved successfully");
        setMedia((prev) =>
          prev.map((item) =>
            item.url === editAltItem.url ? { ...item, alt: altTextInput.trim() } : item
          )
        );
        setEditAltItem(null);
      } else {
        toast.error("Failed to update alt text");
      }
    } catch {
      toast.error("Error updating alt text");
    } finally {
      setIsSavingAlt(false);
    }
  };

  // Delete Single Item
  const confirmDeleteSingle = async () => {
    if (!deleteSingleItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/media?filePath=${encodeURIComponent(deleteSingleItem.url)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Media deleted and storage cleared");
        setMedia((prev) => prev.filter((item) => item.url !== deleteSingleItem.url));
        setSelectedUrls((prev) => {
          const next = new Set(prev);
          next.delete(deleteSingleItem.url);
          return next;
        });
        if (previewItem?.url === deleteSingleItem.url) setPreviewItem(null);
        setDeleteSingleItem(null);
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      toast.error("Error deleting file");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete
  const confirmBulkDelete = async () => {
    if (selectedUrls.size === 0) return;
    setIsDeleting(true);
    const urlsArray = Array.from(selectedUrls);

    try {
      const res = await fetch(`${API_URL}/api/media/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ filePaths: urlsArray }),
      });

      if (res.ok) {
        toast.success(`Deleted ${urlsArray.length} files from storage`);
        setMedia((prev) => prev.filter((item) => !selectedUrls.has(item.url)));
        setSelectedUrls(new Set());
        setShowBulkDeleteConfirm(false);
      } else {
        toast.error("Failed to delete selected files");
      }
    } catch {
      toast.error("Error performing bulk deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle selection
  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  // Filtered & Sorted Media
  const filteredMedia = useMemo(() => {
    return media
      .filter((item) => {
        const itemType = item.type || getFileType(item.url);
        if (typeFilter !== "all" && itemType !== typeFilter) return false;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const filename = (item.filename || item.url.split("/").pop() || "").toLowerCase();
          const alt = (item.alt || "").toLowerCase();
          return filename.includes(query) || alt.includes(query) || item.url.toLowerCase().includes(query);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "largest") {
          return (b.size || 0) - (a.size || 0);
        }
        if (sortBy === "smallest") {
          return (a.size || 0) - (b.size || 0);
        }
        if (sortBy === "name") {
          const nameA = a.filename || a.url.split("/").pop() || "";
          const nameB = b.filename || b.url.split("/").pop() || "";
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [media, typeFilter, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMedia.length / PAGE_SIZE) || 1;
  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMedia.slice(start, start + PAGE_SIZE);
  }, [filteredMedia, currentPage]);

  const allCurrentPageSelected =
    paginatedMedia.length > 0 && paginatedMedia.every((item) => selectedUrls.has(item.url));

  const toggleSelectCurrentPage = () => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        paginatedMedia.forEach((item) => next.delete(item.url));
      } else {
        paginatedMedia.forEach((item) => next.add(item.url));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedUrls(new Set(filteredMedia.map((m) => m.url)));
  };

  const clearSelection = () => {
    setSelectedUrls(new Set());
  };

  return (
    <>
      <PageMeta
        title="Media Library | Selectt Admin"
        description="Unified media storage management with bulk cleanup and direct section configuration."
      />

      <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Top Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageBreadCrumb pageTitle="Media Library" />

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/image-settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#1C3EB9] hover:text-[#1C3EB9] shadow-sm transition-all"
            >
              <Sliders size={16} className="text-[#1C3EB9]" />
              Image Settings (By Section)
            </Link>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1C3EB9] hover:bg-[#153299] text-white shadow-md shadow-[#1C3EB9]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Media
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by filename or alt text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#1C3EB9] transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Pills, Sort & View Mode */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter Pills */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  All ({media.length})
                </button>
                <button
                  onClick={() => {
                    setTypeFilter("image");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    typeFilter === "image"
                      ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <ImageIcon size={13} />
                  Images
                </button>
                <button
                  onClick={() => {
                    setTypeFilter("video");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    typeFilter === "video"
                      ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <VideoIcon size={13} />
                  Videos
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="newest" className="dark:bg-slate-800">Newest First</option>
                  <option value="oldest" className="dark:bg-slate-800">Oldest First</option>
                  <option value="largest" className="dark:bg-slate-800">Largest Size</option>
                  <option value="smallest" className="dark:bg-slate-800">Smallest Size</option>
                  <option value="name" className="dark:bg-slate-800">Name (A-Z)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-900 text-[#1C3EB9] shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchMedia}
                title="Refresh media files"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Bulk Action Bar (When selected) */}
          {selectedUrls.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#1C3EB9]/10 dark:bg-[#1C3EB9]/15 border border-[#1C3EB9]/30 rounded-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#1C3EB9]" />
                  {selectedUrls.size} item{selectedUrls.size > 1 ? "s" : ""} selected
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={selectAllFiltered}
                  className="text-xs font-semibold text-[#1C3EB9] hover:underline cursor-pointer"
                >
                  Select All Filtered ({filteredMedia.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  Delete Selected ({selectedUrls.size})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center space-y-4">
            <Loader2 size={36} className="animate-spin text-[#1C3EB9] mx-auto" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Loading media files from storage...
            </p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No media files found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || typeFilter !== "all"
                ? "No items match your active search or filter criteria. Try resetting filters."
                : "Your media storage is empty. Upload images or banners to get started."}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1C3EB9] text-white hover:brightness-105 shadow-sm"
            >
              <Upload size={14} /> Upload First File
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID (CARD) VIEW ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
            {paginatedMedia.map((item) => {
              const isSelected = selectedUrls.has(item.url);
              const itemType = item.type || getFileType(item.url);
              const filename = item.filename || item.url.split("/").pop() || "media";
              const thumb = item.thumbnailUrl ? getFullUrl(item.thumbnailUrl) : getFullUrl(item.url);

              return (
                <div
                  key={item.url}
                  className={`group relative bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
                    isSelected
                      ? "border-[#1C3EB9] ring-2 ring-[#1C3EB9]/30 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                  }`}
                >
                  {/* Media Preview Box */}
                  <div
                    onClick={() => setPreviewItem(item)}
                    className="relative w-full aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer select-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.03) 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                    }}
                  >
                    {itemType === "image" ? (
                      <img
                        src={thumb}
                        alt={item.alt || filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // fallback to full image
                          (e.target as HTMLImageElement).src = getFullUrl(item.url);
                        }}
                      />
                    ) : itemType === "video" ? (
                      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={16} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                        <FileText size={28} />
                        <span className="text-[10px] uppercase font-bold mt-1">
                          {filename.split(".").pop()}
                        </span>
                      </div>
                    )}

                    {/* Overlay Quick Action Bar */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                      {/* Top Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.url);
                        }}
                        className="self-start cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#1C3EB9] text-white shadow-sm"
                              : "bg-black/50 text-white border border-white/40 hover:bg-black/80"
                          }`}
                        >
                          {isSelected && <Check size={13} className="stroke-[3]" />}
                        </div>
                      </div>

                      {/* Bottom Action Icons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 bg-black/70 backdrop-blur-md rounded-lg p-1"
                      >
                        <button
                          onClick={() => setPreviewItem(item)}
                          title="Preview Full Screen"
                          className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleCopyLink(item.url)}
                          title="Copy Link"
                          className="p-1 rounded text-white/80 hover:text-[#1C3EB9] hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setEditAltItem(item);
                            setAltTextInput(item.alt || "");
                          }}
                          title="Edit Alt Tag"
                          className="p-1 rounded text-white/80 hover:text-amber-400 hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteSingleItem(item)}
                          title="Delete File (Permanent)"
                          className="p-1 rounded text-white/80 hover:text-rose-400 hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Checkbox always visible if selected */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="w-5 h-5 rounded-md bg-[#1C3EB9] text-white flex items-center justify-center shadow-sm">
                          <Check size={13} className="stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
                    <p
                      title={filename}
                      className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate"
                    >
                      {filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>{formatBytes(item.size)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST (TABLE) VIEW ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] select-none">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={toggleSelectCurrentPage}
                        className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center mx-auto"
                      >
                        {allCurrentPageSelected ? (
                          <CheckSquare size={16} className="text-[#1C3EB9]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4 w-20">PREVIEW</th>
                    <th className="py-3 px-4 min-w-[240px]">FILENAME / PATH</th>
                    <th className="py-3 px-4 min-w-[200px]">ALT TEXT / DESCRIPTION</th>
                    <th className="py-3 px-4 w-28">SIZE</th>
                    <th className="py-3 px-4 w-32">UPLOAD DATE</th>
                    <th className="py-3 px-4 w-36 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedMedia.map((item) => {
                    const isSelected = selectedUrls.has(item.url);
                    const itemType = item.type || getFileType(item.url);
                    const filename = item.filename || item.url.split("/").pop() || "media";
                    const thumb = item.thumbnailUrl ? getFullUrl(item.thumbnailUrl) : getFullUrl(item.url);

                    return (
                      <tr
                        key={item.url}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#1C3EB9]/5 dark:bg-[#1C3EB9]/10"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleSelect(item.url)}
                            className="cursor-pointer flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-[#1C3EB9]" />
                            ) : (
                              <Square size={16} className="text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <div
                            onClick={() => setPreviewItem(item)}
                            className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-slate-800 shrink-0 shadow-2xs group"
                          >
                            {itemType === "image" ? (
                              <img
                                src={thumb}
                                alt={item.alt || filename}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getFullUrl(item.url);
                                }}
                              />
                            ) : itemType === "video" ? (
                              <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                                <Play size={14} className="text-white fill-white" />
                              </div>
                            ) : (
                              <FileText size={18} className="text-slate-400" />
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-sm" title={filename}>
                              {filename}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-sm mt-0.5" title={item.url}>
                              {item.url}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                          {item.alt ? (
                            <span className="text-xs truncate max-w-xs block font-medium" title={item.alt}>
                              {item.alt}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setEditAltItem(item);
                                setAltTextInput("");
                              }}
                              className="text-[11px] text-slate-400 italic hover:text-[#1C3EB9] cursor-pointer transition-colors"
                            >
                              + Add alt tag
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          {formatBytes(item.size)}
                        </td>

                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs font-semibold whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 text-slate-400">
                            <button
                              onClick={() => setPreviewItem(item)}
                              title="Preview"
                              className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleCopyLink(item.url)}
                              title="Copy Link"
                              className="p-1.5 rounded-lg hover:text-[#1C3EB9] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              onClick={() => handleDownload(item.url, filename)}
                              title="Download"
                              className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setEditAltItem(item);
                                setAltTextInput(item.alt || "");
                              }}
                              title="Edit Alt"
                              className="p-1.5 rounded-lg hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteSingleItem(item)}
                              title="Delete Permanently"
                              className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * PAGE_SIZE, filteredMedia.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {filteredMedia.length}
              </span>{" "}
              items
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── PREVIEW LIGHTBOX MODAL ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2 max-w-[80%]">
                <span className="font-bold text-white text-sm truncate">
                  {previewItem.filename || previewItem.url.split("/").pop()}
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Media Viewer */}
            <div
              className="flex-1 bg-black/40 flex items-center justify-center p-6 overflow-auto max-h-[60vh]"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "20px 20px",
              }}
            >
              {getFileType(previewItem.url) === "image" ? (
                <img
                  src={getFullUrl(previewItem.url)}
                  alt={previewItem.alt || "Preview"}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : getFileType(previewItem.url) === "video" ? (
                <video
                  src={getFullUrl(previewItem.url)}
                  controls
                  autoPlay
                  className="max-h-[55vh] max-w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText size={48} className="text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">Document File</p>
                </div>
              )}
            </div>

            {/* Modal Footer: Metadata & Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-slate-400">
                <div>
                  <span className="text-slate-500 font-semibold">Size:</span>{" "}
                  {formatBytes(previewItem.size)} |{" "}
                  <span className="text-slate-500 font-semibold">Uploaded:</span>{" "}
                  {formatDate(previewItem.createdAt)}
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Alt Text:</span>{" "}
                  <span className="text-slate-300">{previewItem.alt || "None"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(previewItem.url)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy size={14} /> Copy URL
                </button>
                <button
                  onClick={() => handleDownload(previewItem.url, previewItem.filename)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    setDeleteSingleItem(item);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ALT TEXT MODAL ── */}
      {editAltItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={16} className="text-[#1C3EB9]" />
                Edit Alt Text / SEO Tag
              </h3>
              <button
                onClick={() => setEditAltItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Alternative Text (Screen readers & SEO):
              </label>
              <textarea
                rows={3}
                value={altTextInput}
                onChange={(e) => setAltTextInput(e.target.value)}
                placeholder="e.g. Maruti Suzuki Swift front angle view in white color"
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#1C3EB9] text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400">
                Descriptive alt tags improve SEO and accessibility for this image.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditAltItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAlt}
                disabled={isSavingAlt}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C3EB9] text-white hover:brightness-105 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingAlt && <Loader2 size={14} className="animate-spin" />}
                Save Alt Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE DELETE CONFIRMATION MODAL ── */}
      {deleteSingleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete File from Storage?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action will permanently remove{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {deleteSingleItem.filename || deleteSingleItem.url.split("/").pop()}
                </span>{" "}
                and its generated thumbnail from the server disk and database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteSingleItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSingle}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Yes, Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK DELETE CONFIRMATION MODAL ── */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Delete {selectedUrls.size} Files Permanently?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to permanently delete{" "}
                <span className="font-bold text-rose-500">{selectedUrls.size}</span> selected media files
                and their thumbnails from the server disk storage. This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Confirm Delete All ({selectedUrls.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

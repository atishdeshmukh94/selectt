import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  Grid,
  List,
  Trash2,
  Edit2,
  X,
  Upload,
  Play,
  FileText,
  Loader2,
  Check,
  ChevronDown,
  Image,
  Video,
} from "lucide-react";
import { API_URL } from "../config/api";
import PageMeta from "../components/common/PageMeta";

interface MediaItem {
  url: string;
  thumbnailUrl?: string;
  size: number;
  createdAt: string;
  alt: string;
}

const PAGE_SIZE = 50;

// ── Lazy image wrapper ──────────────────────────────────────────────────────
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className = "",
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={visible ? src : undefined}
      data-src={src}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      loading="lazy"
    />
  );
};

// ── Lazy video thumbnail (canvas frame capture) ─────────────────────────────
const VideoThumbnail: React.FC<{ src: string; className?: string }> = ({
  src,
  className = "",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const video = document.createElement("video");
        video.src = src;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.crossOrigin = "anonymous";

        const draw = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 180;
          try {
            canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
            setCaptured(true);
          } catch {
            setError(true);
          }
          video.src = ""; // free memory
        };

        video.addEventListener("seeked", draw, { once: true });
        video.addEventListener("error", () => setError(true), { once: true });
        video.addEventListener("loadedmetadata", () => {
          video.currentTime = Math.min(1, video.duration * 0.1);
        }, { once: true });

        video.load();
      },
      { rootMargin: "300px" }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={wrapperRef} className={`relative w-full h-full ${className}`}>
      {/* Canvas thumbnail */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          captured ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Fallback dark bg when not yet captured or error */}
      {!captured && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Play size={16} className="fill-white text-white ml-0.5" />
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────

const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "largest">("newest");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");

  // Pagination
  const [page, setPage] = useState(1);

  // Alt text editing modal state
  const [selectedMediaForAlt, setSelectedMediaForAlt] = useState<MediaItem | null>(null);
  const [altTextVal, setAltTextVal] = useState("");

  // Deletion modal state
  const [selectedMediaForDelete, setSelectedMediaForDelete] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Video lightbox
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Load-more sentinel for auto infinite scroll (optional)
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      } else {
        toast.error("Failed to load media items");
      }
    } catch (e) {
      console.error("Failed to fetch media", e);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Reset to page 1 whenever search, sort, or type filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, typeFilter]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      fetchMedia();
    }
    e.target.value = "";
  };

  const handleOpenAltModal = (item: MediaItem) => {
    setSelectedMediaForAlt(item);
    setAltTextVal(item.alt);
  };

  const handleSaveAlt = async () => {
    if (!selectedMediaForAlt) return;
    try {
      const response = await fetch(`${API_URL}/api/media/alt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          filePath: selectedMediaForAlt.url,
          altText: altTextVal,
        }),
      });
      if (response.ok) {
        toast.success("Alt text updated successfully!");
        setSelectedMediaForAlt(null);
        fetchMedia();
      } else {
        toast.error("Failed to update alt text");
      }
    } catch (e) {
      toast.error("Error updating alt text");
    }
  };

  const handleDelete = async () => {
    if (!selectedMediaForDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/media?filePath=${encodeURIComponent(selectedMediaForDelete.url)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Media deleted successfully!");
        setSelectedMediaForDelete(null);
        fetchMedia();
      } else {
        toast.error("Failed to delete media");
      }
    } catch (e) {
      toast.error("Error deleting media");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isVideoFile = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    return ext === "mp4" || ext === "mov" || ext === "webm";
  };

  // Filtering & Sorting
  const filteredMedia = media
    .filter((item) => {
      const filename = item.url.split("/").pop() || "";
      const matchesSearch =
        filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alt.toLowerCase().includes(searchQuery.toLowerCase());
      const isVideo = isVideoFile(item.url);
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "video" && isVideo) ||
        (typeFilter === "image" && !isVideo);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "largest") return b.size - a.size;
      return 0;
    });

  // Pagination slice
  const totalPages = Math.ceil(filteredMedia.length / PAGE_SIZE);
  const visibleMedia = filteredMedia.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < filteredMedia.length;

  // Statistics (always from full list)
  const totalCount = media.length;
  const imageCount = media.filter((item) => !isVideoFile(item.url)).length;
  const videoCount = media.filter((item) => isVideoFile(item.url)).length;
  const totalSize = media.reduce((acc, item) => acc + item.size, 0);

  const inpClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white";

  return (
    <>
      <PageMeta
        title="Media Library | Selectt Admin"
        description="View and manage all website media uploads."
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              Media Library
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and describe all media files uploaded across the website.
            </p>
          </div>

          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all shadow-xl shadow-indigo-100 dark:shadow-none self-start md:self-auto">
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload Media</span>
              </>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Stats Section — cards are clickable type filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Assets", val: totalCount, type: "all" as const, icon: null },
            { label: "Images", val: imageCount, type: "image" as const, icon: <Image size={16} /> },
            { label: "Videos", val: videoCount, type: "video" as const, icon: <Play size={16} /> },
            { label: "Storage Used", val: formatBytes(totalSize), type: null, icon: null },
          ].map((st, i) => {
            const isActive = st.type !== null && typeFilter === st.type;
            const isClickable = st.type !== null;
            return (
              <div
                key={i}
                onClick={() => {
                  if (isClickable) {
                    setTypeFilter(typeFilter === st.type ? "all" : st.type!);
                    setPage(1);
                  }
                }}
                className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-center transition-all ${
                  isClickable ? "cursor-pointer" : ""
                } ${
                  isActive
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-200 dark:shadow-none"
                    : "bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-black tracking-wider ${
                    isActive ? "text-indigo-100" : "text-gray-400"
                  }`}>
                    {st.label}
                  </span>
                  {st.icon && (
                    <span className={isActive ? "text-indigo-200" : "text-gray-300"}>
                      {st.icon}
                    </span>
                  )}
                </div>
                <span className={`text-xl md:text-2xl font-black mt-0.5 ${
                  isActive ? "text-white" : "text-gray-900 dark:text-white"
                }`}>
                  {st.val}
                </span>
                {isActive && (
                  <span className="text-[9px] text-indigo-200 font-bold mt-1 uppercase tracking-wider">Active filter ✕</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Control bar */}
        <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              className={inpClass + " pl-10"}
              placeholder="Search by file name or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter Pill Toggle */}
            <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 gap-0.5">
              {(["all", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === t
                      ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {t === "image" && <Image size={12} />}
                  {t === "video" && <Video size={12} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Result count */}
            <span className="text-xs font-bold text-gray-400 hidden md:block">
              Showing {Math.min(visibleMedia.length, filteredMedia.length)} of{" "}
              {filteredMedia.length}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Sort:</span>
              <select
                className="bg-gray-50 dark:bg-gray-850 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="largest">Largest File Size</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-50 dark:bg-gray-850 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid / List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
            <p className="text-gray-400 font-bold">Scanning uploaded files...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-850 py-24 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              No media files found
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {searchQuery
                ? "Try refining your search query or upload new files above."
                : "Get started by uploading images or videos from your computer."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {visibleMedia.map((item, idx) => {
                const filename = item.url.split("/").pop() || "";
                const isVideo = isVideoFile(item.url);
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-850 shadow-sm flex flex-col group"
                    style={{ animationDelay: `${(idx % PAGE_SIZE) * 20}ms` }}
                  >
                    {/* Visual Preview */}
                    <div
                      className={`aspect-video w-full bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-850 overflow-hidden relative flex items-center justify-center ${isVideo ? "cursor-pointer" : ""}`}
                      onClick={() => isVideo && setPlayingVideo(`${API_URL}${item.url}`)}
                    >
                      {isVideo ? (
                        <VideoThumbnail
                          src={`${API_URL}${item.url}`}
                          className="w-full h-full"
                        />
                      ) : (
                        <LazyImage
                          src={`${API_URL}${item.thumbnailUrl || item.url}`}
                          alt={item.alt || filename}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Size Pill */}
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-[9px] font-mono">
                        {formatBytes(item.size, 1)}
                      </span>
                    </div>

                    {/* Info Section — filename + icon actions only */}
                    <div className="px-3 py-2 flex items-center justify-between gap-2">
                      {/* Filename */}
                      <span
                        className="text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0"
                        title={filename}
                      >
                        {filename}
                      </span>

                      {/* Icon Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenAltModal(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                          title={item.alt ? `Alt: ${item.alt}` : "Add alt text"}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedMediaForDelete(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More / Pagination */}
            {hasMore && (
              <div className="flex flex-col items-center gap-3 mt-10">
                <p className="text-xs text-gray-400 font-semibold">
                  Showing {visibleMedia.length} of {filteredMedia.length} files
                </p>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-2 bg-white dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <ChevronDown size={18} />
                  Load More ({filteredMedia.length - visibleMedia.length} remaining)
                </button>

                {/* Page indicator dots */}
                <div className="flex gap-1.5 mt-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i < page
                          ? "bg-indigo-500 w-4"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All loaded state */}
            {!hasMore && filteredMedia.length > PAGE_SIZE && (
              <div className="flex items-center justify-center mt-10 gap-3">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 font-bold px-3">
                  All {filteredMedia.length} files loaded
                </span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
          </>
        ) : (
          <>
            {/* List View */}
            <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-[9px] font-black tracking-wider border-b border-gray-100 dark:border-gray-850">
                      <th className="py-4 px-6">Preview</th>
                      <th className="py-4 px-6">File Name</th>
                      <th className="py-4 px-6">Alt Text</th>
                      <th className="py-4 px-6">Size</th>
                      <th className="py-4 px-6">Uploaded At</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {visibleMedia.map((item, idx) => {
                      const filename = item.url.split("/").pop() || "";
                      const isVideo = isVideoFile(item.url);
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all"
                        >
                          <td className="py-3 px-6">
                            <div
                              className={`w-14 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex items-center justify-center ${isVideo ? "cursor-pointer" : ""}`}
                              onClick={() => isVideo && setPlayingVideo(`${API_URL}${item.url}`)}
                            >
                              {isVideo ? (
                                <VideoThumbnail
                                  src={`${API_URL}${item.url}`}
                                  className="w-full h-full"
                                />
                              ) : (
                                <LazyImage
                                  src={`${API_URL}${item.thumbnailUrl || item.url}`}
                                  alt={item.alt || filename}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </td>
                          <td
                            className="py-3 px-6 font-mono text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs"
                            title={filename}
                          >
                            {filename}
                          </td>
                          <td className="py-3 px-6 text-xs text-gray-600 dark:text-gray-300 max-w-md">
                            {item.alt ? (
                              <span className="font-semibold">{item.alt}</span>
                            ) : (
                              <span className="text-gray-400 italic">No alt text set</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-xs font-mono text-gray-500">
                            {formatBytes(item.size)}
                          </td>
                          <td className="py-3 px-6 text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenAltModal(item)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-md transition-all border border-transparent hover:border-indigo-100"
                                title="Edit Alt"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setSelectedMediaForDelete(item)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all border border-transparent hover:border-red-100"
                                title="Delete"
                              >
                                <Trash2 size={14} />
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

            {/* Load More for list view */}
            {hasMore && (
              <div className="flex flex-col items-center gap-3 mt-8">
                <p className="text-xs text-gray-400 font-semibold">
                  Showing {visibleMedia.length} of {filteredMedia.length} files
                </p>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-2 bg-white dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <ChevronDown size={18} />
                  Load More ({filteredMedia.length - visibleMedia.length} remaining)
                </button>
              </div>
            )}

            {!hasMore && filteredMedia.length > PAGE_SIZE && (
              <div className="flex items-center justify-center mt-8 gap-3">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 font-bold px-3">
                  All {filteredMedia.length} files loaded
                </span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
          </>
        )}

        {/* Sentinel for future auto-scroll (ref attached but not auto-triggering) */}
        <div ref={loadMoreRef} className="h-1" />

        {/* ── Modal: Edit Alt Text ─────────────────────────────────────────── */}
        {selectedMediaForAlt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-850">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Edit Alt Text Description
                </h3>
                <button
                  onClick={() => setSelectedMediaForAlt(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="aspect-video bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-850 flex items-center justify-center">
                  {isVideoFile(selectedMediaForAlt.url) ? (
                    <video
                      src={`${API_URL}${selectedMediaForAlt.url}`}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={`${API_URL}${selectedMediaForAlt.url}`}
                      className="w-full h-full object-contain"
                      alt=""
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <textarea
                    className={inpClass + " min-h-[80px] resize-none"}
                    placeholder="Describe what is in this image..."
                    value={altTextVal}
                    onChange={(e) => setAltTextVal(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                    Alt text helps search engines and screen readers understand the image.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-850">
                <button
                  onClick={() => setSelectedMediaForAlt(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAlt}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  <Check size={14} />
                  <span>Save Description</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Confirm Deletion ──────────────────────────────────────── */}
        {selectedMediaForDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 mb-4 border border-red-100 dark:border-red-900/50">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                  Delete Media Asset?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="font-mono">
                    {selectedMediaForDelete.url.split("/").pop()}
                  </strong>
                  ? This cannot be undone. Any car listings using this image will show a broken
                  image.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-850">
                <button
                  onClick={() => setSelectedMediaForDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-100 dark:shadow-none disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Video Lightbox ────────────────────────────────────────────────── */}
      {playingVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999999] flex flex-col items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            onClick={() => setPlayingVideo(null)}
          >
            <X size={20} />
          </button>

          {/* Filename label */}
          <p className="text-white/50 text-xs font-mono mb-3 max-w-xl truncate px-4">
            {playingVideo.split("/").pop()}
          </p>

          {/* Video player */}
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={playingVideo}
              src={playingVideo}
              controls
              autoPlay
              className="w-full max-h-[80vh] bg-black"
              style={{ outline: "none" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MediaLibrary;

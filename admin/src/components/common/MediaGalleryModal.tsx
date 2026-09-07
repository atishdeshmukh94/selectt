import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  ExternalLink,
  FolderOpen,
  RefreshCw,
  HardDrive
} from "lucide-react";
import { API_URL } from "../../config/api";
import { toast } from "react-hot-toast";

export interface MediaItem {
  url: string;
  filename?: string;
  thumbnailUrl?: string;
  size?: number;
  createdAt?: string;
  alt?: string;
  type?: "image" | "video" | "document";
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  title?: string;
}

export default function MediaGalleryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select from Media Gallery"
}: MediaGalleryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("image");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data: MediaItem[] = await res.json();
        setMedia(data);
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl("");
      setSelectedItem(null);
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let lastUploadedUrl = "";

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") || localStorage.getItem("token")}`
          },
          body: formData
        });

        if (res.ok) {
          const result = await res.json();
          lastUploadedUrl = result.url || result.filePath || "";
        }
      }

      toast.success("Image uploaded to Media Library!");
      await fetchMedia();
      if (lastUploadedUrl) {
        setSelectedUrl(lastUploadedUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredMedia = media.filter((item) => {
    const filename = item.url.split("/").pop() || "";
    const matchesSearch = 
      !search.trim() || 
      filename.toLowerCase().includes(search.toLowerCase()) || 
      (item.alt && item.alt.toLowerCase().includes(search.toLowerCase()));

    const isVideo = ["mp4", "webm", "mov"].some(ext => item.url.toLowerCase().endsWith(ext));
    if (filterType === "image" && isVideo) return false;
    if (filterType === "video" && !isVideo) return false;

    return matchesSearch;
  });

  const handleConfirm = () => {
    if (!selectedUrl) return;
    onSelect(selectedUrl, selectedItem || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-4xl w-full h-[88vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center font-bold">
              <FolderOpen className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Choose an image from existing uploads or upload a new file
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Toolbar (Search, Filter, and Upload Directly to Media Gallery) */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search images by name or alt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9]"
              />
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === "all" ? "bg-white dark:bg-gray-700 text-[#1C3EB9] shadow-xs font-bold" : "text-gray-500"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("image")}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === "image" ? "bg-white dark:bg-gray-700 text-[#1C3EB9] shadow-xs font-bold" : "text-gray-500"}`}
              >
                Images
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMedia}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-xs transition-all"
              title="Refresh Media Gallery"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-gray-800 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>Upload to Gallery</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Media Grid & Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-black/20">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="size-8 animate-spin text-[#1C3EB9] mb-2" />
              <span className="text-xs font-semibold">Loading Media Gallery...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-gray-400 text-center">
              <ImageIcon className="size-10 text-gray-300 stroke-1 mb-2" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">No media items found</span>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                Upload images from your computer to start using them in your blog posts.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#1C3EB9] text-white text-xs font-bold shadow-xs hover:bg-[#153096]"
              >
                Upload First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredMedia.map((item, idx) => {
                const isSelected = selectedUrl === item.url;
                const fullImgUrl = getFullUrl(item.thumbnailUrl || item.url);
                const filename = item.url.split("/").pop() || "";

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedItem(item);
                    }}
                    onDoubleClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedItem(item);
                      onSelect(item.url, item);
                      onClose();
                    }}
                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all select-none ${
                      isSelected
                        ? "border-[#1C3EB9] ring-3 ring-[#1C3EB9]/20 shadow-md bg-[#1C3EB9]/5"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <img
                      src={fullImgUrl}
                      alt={item.alt || filename}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23ccc'><rect width='100' height='100'/></svg>";
                      }}
                    />

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1C3EB9] text-white flex items-center justify-center shadow-md">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Hover Caption */}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white font-medium truncate">{filename}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Selection Preview & Action Buttons */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedUrl ? (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                  <img
                    src={getFullUrl(selectedUrl)}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate max-w-[240px] sm:max-w-[320px]">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                    {selectedUrl.split("/").pop()}
                  </span>
                  <span className="text-[10px] text-[#1C3EB9] font-mono truncate block">
                    {selectedUrl}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No image selected</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="px-5 py-2 rounded-xl bg-[#1C3EB9] hover:bg-[#153096] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="size-3.5 stroke-[2.5]" />
              <span>Select Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

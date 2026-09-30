import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, X, MapPin, Plus, Check, Star, CheckSquare, Square, AlertTriangle, Upload, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { toast } from "react-hot-toast";
import { API_URL } from "../config/api";

const API = API_URL;

const resolveImgUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (cleanPath.startsWith("/uploads/")) {
    if (API && !API.includes("localhost")) {
      return `${API.replace(/\/$/, "")}${cleanPath}`;
    }
    return `https://api.selectt.in${cleanPath}`;
  }
  if (API && !API.includes("localhost")) {
    return `${API.replace(/\/$/, "")}${cleanPath}`;
  }
  return `https://selectt.in${cleanPath}`;
};

export default function Locations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<any>({ name: "", image: "", is_popular: 0 });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/locations`);
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  // Checkbox handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((l) => l.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const openAdd = () => {
    setForm({ name: "", image: "", is_popular: 0 });
    setIsAdding(true);
  };

  const openEdit = (l: any) => {
    setForm({ ...l });
    setEditing(l);
  };

  const closeForm = () => {
    setEditing(null);
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isAdding ? `${API}/api/locations` : `${API}/api/locations/${editing.id}`;
      const method = isAdding ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(isAdding ? "Location added successfully" : "Location updated successfully");
      closeForm();
      fetchLocations();
    } catch {
      toast.error("Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This might affect car listings associated with it.`)) return;
    try {
      const res = await fetch(`${API}/api/locations/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast.success(`"${name}" deleted successfully`);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchLocations();
      } else {
        toast.error("Failed to delete location");
      }
    } catch {
      toast.error("Network error while deleting");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (
      !window.confirm(
        `Are you sure you want to delete ${count} selected location${count > 1 ? "s" : ""}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      // 1. Try bulk delete endpoint
      const bulkRes = await fetch(`${API}/api/locations/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: selectedIds }),
      }).catch(() => null);

      if (bulkRes && bulkRes.ok) {
        toast.success(`Successfully deleted ${count} location${count > 1 ? "s" : ""}`);
      } else {
        // Fallback: delete sequentially
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`${API}/api/locations/${id}`, { method: "DELETE", headers }).catch(() => null)
          )
        );
        toast.success(`Successfully deleted ${count} location${count > 1 ? "s" : ""}`);
      }
      setSelectedIds([]);
      fetchLocations();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete selected locations");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Direct Image Upload in modal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", `location_${Date.now()}`);

    try {
      const res = await fetch(`${API}/api/admin/site-content`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev: any) => ({ ...prev, image: data.value }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < filtered.length;

  const inp =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all";

  return (
    <>
      <PageMeta title="Service Locations | Selectt Admin" description="Manage available service cities for car listings" />

      <div className="p-4 md:p-6 space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Service Locations</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage service cities where cars, inspection hubs & operations are active
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Plus size={18} /> Add Service Location
          </button>
        </div>

        {/* Search & Bulk Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLocations}
              disabled={loading}
              className="p-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
              title="Refresh Locations"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Floating / Sticky Bulk Action Banner */}
        {selectedIds.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {selectedIds.length}
              </span>
              <span className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                {selectedIds.length} location{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline cursor-pointer ml-1"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer active:scale-95"
              >
                {bulkDeleting ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Delete All Selected ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Locations Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium">Loading locations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <MapPin size={40} className="opacity-30" />
              <p className="text-sm font-medium">No locations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    {/* Checkbox Header */}
                    <th className="px-4 py-3.5 text-left w-12">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
                        title={isAllSelected ? "Deselect All" : "Select All"}
                      >
                        {isAllSelected ? (
                          <CheckSquare size={18} className="text-blue-600" />
                        ) : isPartiallySelected ? (
                          <div className="w-4.5 h-4.5 rounded border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                            <div className="w-2.5 h-0.5 bg-blue-600 rounded"></div>
                          </div>
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left">City Name</th>
                    <th className="px-4 py-3.5 text-left">Popularity</th>
                    <th className="px-4 py-3.5 text-left">Added On</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((l) => {
                    const isSelected = selectedIds.includes(l.id);
                    const resolvedImg = resolveImgUrl(l.image);

                    return (
                      <tr
                        key={l.id}
                        className={`transition-colors group ${
                          isSelected
                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                            : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="px-4 py-3.5 text-left">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(l.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>

                        {/* City Name & Image */}
                        <td className="px-4 py-3.5 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 shrink-0 border border-slate-200 dark:border-gray-700 flex items-center justify-center">
                              {l.image ? (
                                <img
                                  src={resolvedImg}
                                  alt={l.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/favicon.png";
                                  }}
                                />
                              ) : (
                                <MapPin size={18} className="text-slate-400" />
                              )}
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                              {l.name}
                            </span>
                          </div>
                        </td>

                        {/* Popularity Badge */}
                        <td className="px-4 py-3.5 text-left">
                          {l.is_popular ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 w-fit">
                              <Star size={12} fill="currentColor" /> Popular City
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Date Added */}
                        <td className="px-4 py-3.5 text-left text-gray-500 text-xs whitespace-nowrap">
                          {l.created_at
                            ? new Date(l.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(l)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(l.id, l.name)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer"
                              title="Delete"
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
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {(editing || isAdding) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                {isAdding ? "Add New Location" : `Edit "${editing?.name}"`}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  City Name *
                </label>
                <input
                  required
                  className={inp}
                  value={form.name || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mumbai, Pune, Delhi..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  City Image URL / Upload (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    className={inp}
                    value={form.image || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, image: e.target.value }))}
                    placeholder="https://... or /uploads/..."
                  />
                  <label className="px-3.5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 hover:bg-slate-800">
                    <Upload size={14} />
                    <span>{uploadingImage ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview image if present */}
              {form.image && (
                <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  <img
                    src={resolveImgUrl(form.image)}
                    alt="City Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/favicon.png";
                    }}
                  />
                </div>
              )}

              {/* Popular City Toggle */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 block">
                    Show in Popular Cities
                  </span>
                  <span className="text-[11px] text-gray-400 block">Highlight in header city picker & hero switcher</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f: any) => ({ ...f, is_popular: f.is_popular ? 0 : 1 }))}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                    form.is_popular ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${
                      form.is_popular ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs disabled:opacity-60 transition-all shadow-md shadow-blue-500/20 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check size={16} />
                  )}
                  {saving ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

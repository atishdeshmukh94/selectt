import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, X, MapPin, Plus, Check, CheckSquare, Square, Upload, RefreshCw, Phone, Clock, Car } from "lucide-react";
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

export default function CarHubs() {
  const { token } = useAuth();
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    city: "",
    address: "",
    open_hours: "10am - 8pm (Mon - Sun)",
    image_path: "",
    car_count: 0,
    phone: "+91 85919 69394"
  });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchHubs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/car-hub-locations`);
      const data = await res.json();
      setHubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching car hubs:", err);
      toast.error("Failed to load car hubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const filtered = hubs.filter(
    (h) =>
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.toLowerCase().includes(search.toLowerCase())
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
      setSelectedIds(filtered.map((h) => h.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const openAdd = () => {
    setForm({
      name: "",
      city: "",
      address: "",
      open_hours: "10am - 8pm (Mon - Sun)",
      image_path: "",
      car_count: 0,
      phone: "+91 85919 69394"
    });
    setIsAdding(true);
  };

  const openEdit = (h: any) => {
    setForm({ ...h });
    setEditing(h);
  };

  const closeForm = () => {
    setEditing(null);
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isAdding
        ? `${API}/api/admin/car-hub-locations`
        : `${API}/api/admin/car-hub-locations/${editing.id}`;
      const method = isAdding ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(isAdding ? "Car hub created successfully" : "Car hub updated successfully");
      closeForm();
      fetchHubs();
    } catch {
      toast.error("Failed to save car hub");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete car hub "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/admin/car-hub-locations/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast.success(`"${name}" deleted successfully`);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchHubs();
      } else {
        toast.error("Failed to delete car hub");
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
        `Are you sure you want to delete ${count} selected car hub${count > 1 ? "s" : ""}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      // 1. Try bulk delete endpoint
      const bulkRes = await fetch(`${API}/api/admin/car-hub-locations/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: selectedIds }),
      }).catch(() => null);

      if (bulkRes && bulkRes.ok) {
        toast.success(`Successfully deleted ${count} car hub${count > 1 ? "s" : ""}`);
      } else {
        // Fallback: delete sequentially
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`${API}/api/admin/car-hub-locations/${id}`, { method: "DELETE", headers }).catch(() => null)
          )
        );
        toast.success(`Successfully deleted ${count} car hub${count > 1 ? "s" : ""}`);
      }
      setSelectedIds([]);
      fetchHubs();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete selected car hubs");
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
    formData.append("key", `car_hub_${Date.now()}`);

    try {
      const res = await fetch(`${API}/api/admin/site-content`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev: any) => ({ ...prev, image_path: data.value }));
        toast.success("Hub image uploaded successfully");
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
      <PageMeta title="Car Hubs | Selectt Admin" description="Manage Selectt Car Hub Locations" />

      <div className="p-4 md:p-6 space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Car Hub Locations</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage premium offline hubs where customers can check, test drive & purchase cars
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Plus size={18} /> Add Car Hub
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search car hubs by name, city, or address..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHubs}
              disabled={loading}
              className="p-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
              title="Refresh Hubs"
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
                {selectedIds.length} car hub{selectedIds.length > 1 ? "s" : ""} selected
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

        {/* Hubs Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium">Loading car hubs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <MapPin size={40} className="opacity-30" />
              <p className="text-sm font-medium">No car hubs found</p>
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
                    <th className="px-4 py-3.5 text-left">Hub Details</th>
                    <th className="px-4 py-3.5 text-left">City</th>
                    <th className="px-4 py-3.5 text-left">Open Hours & Contact</th>
                    <th className="px-4 py-3.5 text-left">Inventory</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((h) => {
                    const isSelected = selectedIds.includes(h.id);
                    const resolvedImg = resolveImgUrl(h.image_path);

                    return (
                      <tr
                        key={h.id}
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
                            onClick={() => handleToggleSelect(h.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>

                        {/* Hub Details */}
                        <td className="px-4 py-3.5 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 shrink-0 border border-slate-200 dark:border-gray-700 flex items-center justify-center">
                              {h.image_path ? (
                                <img
                                  src={resolvedImg}
                                  alt={h.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/favicon.png";
                                  }}
                                />
                              ) : (
                                <MapPin size={22} className="text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
                                {h.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {h.address}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* City */}
                        <td className="px-4 py-3.5 text-left">
                          <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                            {h.city}
                          </span>
                        </td>

                        {/* Open Hours & Phone */}
                        <td className="px-4 py-3.5 text-left text-gray-500 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Clock size={12} className="text-blue-500 shrink-0" />
                              <span>{h.open_hours || "10am - 8pm (Mon - Sun)"}</span>
                            </div>
                            {h.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Phone size={12} className="text-emerald-500 shrink-0" />
                                <span>{h.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Car Count Badge */}
                        <td className="px-4 py-3.5 text-left">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                            <Car size={12} />
                            {h.car_count || 0} Cars
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(h)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id, h.name)}
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
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                {isAdding ? "Add New Car Hub" : `Edit "${editing?.name}"`}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Hub Name *
                  </label>
                  <input
                    required
                    className={inp}
                    value={form.name || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Selectt Hub, Bellandur"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    required
                    className={inp}
                    value={form.city || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Bangalore, Mumbai, Pune"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Open Hours
                  </label>
                  <input
                    className={inp}
                    value={form.open_hours || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, open_hours: e.target.value }))}
                    placeholder="e.g. 10am - 8pm (Mon - Sun)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Available Cars Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    className={inp}
                    value={form.car_count}
                    onChange={(e) => setForm((f: any) => ({ ...f, car_count: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Mobile / Contact No
                  </label>
                  <input
                    className={inp}
                    value={form.phone || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. +91 85919 69394"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Hub Photo URL / Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      className={inp}
                      value={form.image_path || ""}
                      onChange={(e) => setForm((f: any) => ({ ...f, image_path: e.target.value }))}
                      placeholder="https://..."
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
              </div>

              {/* Preview image if present OR neutral grey blank placeholder */}
              {form.image_path ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 group shadow-xs">
                  <img
                    src={resolveImgUrl(form.image_path)}
                    alt="Hub Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Overlay Remove Button (matches user request & red circle) */}
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f: any) => ({ ...f, image_path: "" }));
                      toast.success("Hub photo removed. Click 'Save' to apply changes.");
                    }}
                    title="Remove Photo"
                    className="absolute top-2 right-2 bg-red-600/95 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 z-10"
                  >
                    <X size={15} />
                    <span>Remove Photo</span>
                  </button>
                </div>
              ) : (
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center text-gray-400 dark:text-gray-300">
                    <MapPin size={16} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    No Hub Photo Selected
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    A clean neutral grey placeholder will be displayed (no stock photos)
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Physical Address *
                </label>
                <textarea
                  required
                  rows={2}
                  className={inp + " resize-none"}
                  value={form.address || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))}
                  placeholder="Enter full postal address details of the car hub..."
                />
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
                  {saving ? "Saving..." : "Save Car Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

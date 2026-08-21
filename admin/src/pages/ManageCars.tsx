import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle, Edit, Trash2, Search, Car, Check, Eye, ChevronUp, ChevronDown,
  ChevronsUpDown, CheckCircle, Tag, Fuel, Sliders, X, Filter, RefreshCw,
  ExternalLink, ShieldCheck, CheckSquare, Square, Info, Calendar, MapPin, IndianRupee
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router";
import { API_URL } from "../config/api";

const API = API_URL;

const slugify = (text: string) => {
  if (!text) return 'car';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const getCarDetailsUrl = (car: any, baseUrl: string) => {
  if (!car) return `${baseUrl}/buy-cars`;
  const id = car.id || car.car_id;
  const make = slugify(car.make || 'car');
  const model = slugify(car.model || 'model');
  const carName = slugify(`${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''}`.trim());
  return `${baseUrl}/car/${make}/${model}/${carName}/${id}`;
};

export default function ManageCars() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [makeFilter, setMakeFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  // Quick View Modal
  const [quickViewCar, setQuickViewCar] = useState<any | null>(null);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<string | null>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Toast alert notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchCars = () => {
    setLoading(true);
    fetch(`${API}/api/cars`, { headers })
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch cars");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) setCars(data);
      })
      .catch(err => {
        console.error("Error fetching cars:", err);
        showToast("Error loading cars inventory", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Unique list of car makes for filter dropdown
  const uniqueMakes = useMemo(() => {
    const makes = new Set<string>();
    cars.forEach(c => { if (c.make) makes.add(c.make); });
    return Array.from(makes).sort();
  }, [cars]);

  // Sorting Handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronsUpDown size={14} className="inline text-gray-400 ml-1 hover:text-indigo-600 transition-colors cursor-pointer" />;
    }
    return sortDirection === "asc"
      ? <ChevronUp size={14} className="inline text-indigo-600 ml-1 cursor-pointer" />
      : <ChevronDown size={14} className="inline text-indigo-600 ml-1 cursor-pointer" />;
  };

  const openAdd = () => { navigate("/cars/add"); };
  const openEdit = (car: any) => { navigate(`/cars/edit/${car.id}`); };

  // Single Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this car? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/cars/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed");
      setCars(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
      showToast("Car deleted successfully");
    } catch (e: any) {
      showToast(e.message || "Failed to delete car", "error");
    }
  };

  // Inline Quick Status Change (PATCH)
  const handleInlineStatusChange = async (carId: number, newStatus: string) => {
    // Optimistic UI update
    setCars(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c));
    try {
      const res = await fetch(`${API}/api/cars/${carId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        // Fallback try PUT if PATCH not available
        await fetch(`${API}/api/cars/${carId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ ...cars.find(c => c.id === carId), status: newStatus })
        });
      }
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`);
    } catch (e) {
      fetchCars();
      showToast("Failed to update car status", "error");
    }
  };

  // Inline Assured Toggle (PATCH)
  const handleInlineAssuredToggle = async (car: any) => {
    const nextAssured = !car.isAssured;
    setCars(prev => prev.map(c => c.id === car.id ? { ...c, isAssured: nextAssured } : c));
    try {
      await fetch(`${API}/api/cars/${car.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isAssured: nextAssured })
      });
      showToast(nextAssured ? "Marked as Selectt Assured" : "Removed from Selectt Assured");
    } catch (e) {
      fetchCars();
      showToast("Failed to update status", "error");
    }
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginated.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdatingBulk(true);
    try {
      const res = await fetch(`${API}/api/cars/bulk-update`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        setCars(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: newStatus } : c));
        showToast(`Updated ${selectedIds.length} cars to "${newStatus.replace('_', ' ')}"`);
        setSelectedIds([]);
      } else {
        throw new Error("Bulk update failed");
      }
    } catch (e) {
      // Fallback sequentially
      await Promise.all(selectedIds.map(id =>
        fetch(`${API}/api/cars/${id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: newStatus })
        }).catch(() => {})
      ));
      fetchCars();
      showToast(`Updated selected cars status`, "info");
      setSelectedIds([]);
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected cars?`)) return;
    setIsUpdatingBulk(true);
    try {
      await Promise.all(selectedIds.map(id =>
        fetch(`${API}/api/cars/${id}`, { method: "DELETE", headers })
      ));
      setCars(prev => prev.filter(c => !selectedIds.includes(c.id)));
      showToast(`Deleted ${selectedIds.length} cars`);
      setSelectedIds([]);
    } catch (e) {
      fetchCars();
      showToast("Error performing bulk deletion", "error");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  // Filter Logic
  const filtered = useMemo(() => {
    return cars.filter(c => {
      const searchStr = `${c.make || ''} ${c.model || ''} ${c.variant || ''} ${c.year || ''} ${c.location || ''} ${c.id || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(search.toLowerCase().trim());
      const matchesStatus = statusFilter === "all" || (c.status || "active") === statusFilter;
      const matchesMake = makeFilter === "all" || (c.make || "").toLowerCase() === makeFilter.toLowerCase();
      
      const carFuel = (c.fuelType || c.fuel_type || "").toLowerCase();
      const matchesFuel = fuelFilter === "all" || 
        (fuelFilter === "ev" ? ["electric", "ev", "battery"].includes(carFuel) : carFuel.includes(fuelFilter.toLowerCase()));

      const carTrans = (c.transmission || "").toLowerCase();
      const matchesTrans = transmissionFilter === "all" || carTrans.includes(transmissionFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMake && matchesFuel && matchesTrans;
    });
  }, [cars, search, statusFilter, makeFilter, fuelFilter, transmissionFilter]);

  // Sorting Logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (!sortField) return 0;

      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "car") {
        valA = `${a.make || ''} ${a.model || ''}`.toLowerCase();
        valB = `${b.make || ''} ${b.model || ''}`.toLowerCase();
      } else if (sortField === "price" || sortField === "km" || sortField === "year" || sortField === "id") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDirection]);

  // Pagination Logic
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, makeFilter, fuelFilter, transmissionFilter, itemsPerPage]);

  // Stats calculation
  const totalListed = cars.length;
  const activeCount = cars.filter(c => (c.status || "active") === "active").length;
  const soldOutCount = cars.filter(c => c.status === "sold_out").length;
  const holdCount = cars.filter(c => c.status === "hold").length;
  const deactiveCount = cars.filter(c => c.status === "deactive").length;

  const petrolCount = cars.filter(c => (c.fuelType || c.fuel_type || "").toLowerCase() === "petrol").length;
  const dieselCount = cars.filter(c => (c.fuelType || c.fuel_type || "").toLowerCase() === "diesel").length;
  const evCount = cars.filter(c => ["electric", "ev", "battery", "hybrid"].some(t => (c.fuelType || c.fuel_type || "").toLowerCase().includes(t))).length;

  const manualCount = cars.filter(c => (c.transmission || "").toLowerCase().includes("manual")).length;
  const autoCount = cars.filter(c => (c.transmission || "").toLowerCase().includes("auto")).length;

  const isAllPaginatedSelected = paginated.length > 0 && paginated.every(c => selectedIds.includes(c.id));

  const hasActiveFilters = search !== "" || statusFilter !== "all" || makeFilter !== "all" || fuelFilter !== "all" || transmissionFilter !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMakeFilter("all");
    setFuelFilter("all");
    setTransmissionFilter("all");
  };

  return (
    <>
      <PageMeta title="Manage Cars | Selectt Admin" description="Manage car inventory" />
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-bounce transition-all ${
          toast.type === "error" ? "bg-red-600 text-white border-red-700" :
          toast.type === "info" ? "bg-blue-600 text-white border-blue-700" :
          "bg-emerald-600 text-white border-emerald-700"
        }`}>
          {toast.type === "error" ? <X size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Manage Cars
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {cars.length} cars total
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Filter, edit, feature, and manage all listed vehicle inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchCars} 
              className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              title="Refresh inventory"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={openAdd} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer">
              <PlusCircle size={18} /> Add New Car
            </button>
          </div>
        </div>

        {/* Inventory Summary Cards (Interactive Filters) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Card 1: Total */}
          <div 
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-2xl border bg-white dark:bg-gray-900 transition-all cursor-pointer hover:shadow-md ${
              statusFilter === "all" ? "ring-2 ring-indigo-500 border-indigo-200" : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inventory</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center">
                <Car size={18} />
              </div>
            </div>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{totalListed}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Click to show all</p>
          </div>

          {/* Card 2: Active */}
          <div 
            onClick={() => setStatusFilter("active")}
            className={`p-4 rounded-2xl border bg-white dark:bg-gray-900 transition-all cursor-pointer hover:shadow-md ${
              statusFilter === "active" ? "ring-2 ring-emerald-500 border-emerald-200" : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
            </div>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{activeCount}</h4>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">Available for buyers</p>
          </div>

          {/* Card 3: Sold Out */}
          <div 
            onClick={() => setStatusFilter("sold_out")}
            className={`p-4 rounded-2xl border bg-white dark:bg-gray-900 transition-all cursor-pointer hover:shadow-md ${
              statusFilter === "sold_out" ? "ring-2 ring-rose-500 border-rose-200" : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Sold Out</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center">
                <Tag size={18} />
              </div>
            </div>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{soldOutCount}</h4>
            <p className="text-[10px] text-rose-500 mt-0.5 font-medium">Marked as sold</p>
          </div>

          {/* Card 4: Fuel Stats */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Fuel Mix</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
                <Fuel size={18} />
              </div>
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-white mt-2 flex items-center justify-between">
              <span onClick={() => setFuelFilter("petrol")} className="hover:text-indigo-600 cursor-pointer">P: {petrolCount}</span>
              <span onClick={() => setFuelFilter("diesel")} className="hover:text-indigo-600 cursor-pointer">D: {dieselCount}</span>
              <span onClick={() => setFuelFilter("ev")} className="hover:text-indigo-600 cursor-pointer">EV: {evCount}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Click fuel to filter</p>
          </div>

          {/* Card 5: Transmission */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Transmission</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
                <Sliders size={18} />
              </div>
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-white mt-2 flex items-center gap-3">
              <span onClick={() => setTransmissionFilter("manual")} className="hover:text-indigo-600 cursor-pointer">Manual: {manualCount}</span>
              <span onClick={() => setTransmissionFilter("automatic")} className="hover:text-indigo-600 cursor-pointer">Auto: {autoCount}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Click to filter</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search make, model, variant, location, or ID..."
                className="w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Status */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Statuses ({cars.length})</option>
                <option value="active">Active ({activeCount})</option>
                <option value="deactive">Deactivated ({deactiveCount})</option>
                <option value="hold">On Hold ({holdCount})</option>
                <option value="sold_out">Sold Out ({soldOutCount})</option>
              </select>

              {/* Brand/Make */}
              <select
                value={makeFilter}
                onChange={e => setMakeFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Makes</option>
                {uniqueMakes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Fuel */}
              <select
                value={fuelFilter}
                onChange={e => setFuelFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="ev">Electric / Hybrid</option>
              </select>

              {/* Transmission */}
              <select
                value={transmissionFilter}
                onChange={e => setTransmissionFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Transmissions</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 font-medium">Filtered results: <strong className="text-gray-800 dark:text-white">{filtered.length}</strong> of {cars.length}</span>
                {statusFilter !== "all" && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">Status: {statusFilter}</span>}
                {makeFilter !== "all" && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">Make: {makeFilter}</span>}
                {fuelFilter !== "all" && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">Fuel: {fuelFilter}</span>}
                {transmissionFilter !== "all" && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">Trans: {transmissionFilter}</span>}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Sticky Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckSquare size={18} className="text-indigo-300" />
              <span>{selectedIds.length} cars selected</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-indigo-200">Quick Actions:</span>
              <button
                disabled={isUpdatingBulk}
                onClick={() => handleBulkStatusChange("active")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Mark Active
              </button>
              <button
                disabled={isUpdatingBulk}
                onClick={() => handleBulkStatusChange("sold_out")}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Mark Sold Out
              </button>
              <button
                disabled={isUpdatingBulk}
                onClick={() => handleBulkStatusChange("hold")}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Mark On Hold
              </button>
              <button
                disabled={isUpdatingBulk}
                onClick={() => handleBulkStatusChange("deactive")}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Deactivate
              </button>
              <button
                disabled={isUpdatingBulk}
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 text-indigo-300 hover:text-white underline cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Cars Inventory Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-indigo-600" />
              <p className="font-semibold text-sm">Loading car inventory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-3">
              <Car size={48} className="opacity-30" />
              <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300">No cars found</h3>
              <p className="text-xs">No vehicle matches your current filter or search criteria.</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-2 text-xs text-indigo-600 font-bold hover:underline">
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto lg:overflow-x-visible">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-2 py-2.5 text-center w-8">
                        <input
                          type="checkbox"
                          checked={isAllPaginatedSelected}
                          onChange={handleSelectAll}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-2 py-2.5 text-left w-16">Image</th>
                      <th onClick={() => handleSort("car")} className="px-2 py-2.5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Car Model {renderSortIcon("car")}
                      </th>
                      <th onClick={() => handleSort("year")} className="px-2 py-2.5 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-14">
                        Year {renderSortIcon("year")}
                      </th>
                      <th onClick={() => handleSort("price")} className="px-2 py-2.5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Price {renderSortIcon("price")}
                      </th>
                      <th onClick={() => handleSort("km")} className="px-2 py-2.5 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                        KM {renderSortIcon("km")}
                      </th>
                      <th onClick={() => handleSort("isAssured")} className="px-2 py-2.5 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Assured {renderSortIcon("isAssured")}
                      </th>
                      <th onClick={() => handleSort("status")} className="px-2 py-2.5 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Status {renderSortIcon("status")}
                      </th>
                      <th onClick={() => handleSort("listedBy")} className="px-2 py-2.5 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Listed By {renderSortIcon("listedBy")}
                      </th>
                      <th className="px-2 py-2.5 text-right w-24">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginated.map(car => {
                      const isSelected = selectedIds.includes(car.id);
                      return (
                        <tr 
                          key={car.id} 
                          className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors ${
                            isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(car.id)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Image */}
                          <td className="px-2 py-2">
                            <button onClick={() => setQuickViewCar(car)} className="cursor-pointer group block">
                              {car.image ? (
                                <img
                                  src={car.image.startsWith('/') ? `${API}${car.image}` : car.image}
                                  alt={car.model}
                                  className="w-14 h-10 object-cover rounded-lg group-hover:scale-105 transition-all shadow-sm border border-gray-100"
                                />
                              ) : (
                                <div className="w-14 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                  <Car size={16} />
                                </div>
                              )}
                            </button>
                          </td>

                          {/* Car Model & ID */}
                          <td className="px-2 py-2">
                            <button onClick={() => setQuickViewCar(car)} className="text-left group cursor-pointer block">
                              <div className="font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                <span>{car.make} {car.model}</span>
                                <span className="text-[9px] text-gray-400 font-mono font-normal">#{car.id}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1 flex-wrap mt-0.5">
                                {car.variant && <span className="font-medium">{car.variant}</span>}
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[9px] font-bold capitalize">
                                  <Fuel size={9} />
                                  {car.fuelType || car.fuel_type || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[9px] font-bold capitalize">
                                  <Sliders size={9} />
                                  {car.transmission || "N/A"}
                                </span>
                                {car.location && <span className="text-[9px] text-slate-400 truncate max-w-[110px]">📍 {car.location}</span>}
                              </div>
                            </button>
                          </td>

                          {/* Year */}
                          <td className="px-2 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">{car.year}</td>

                          {/* Price */}
                          <td className="px-2 py-2 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ₹{Number(car.price || 0).toLocaleString()}
                            <div className="text-[9px] text-slate-400 font-normal">
                              ₹{(car.price / 100000).toFixed(2)}L
                            </div>
                          </td>

                          {/* KM */}
                          <td className="px-2 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {car.km ? `${car.km.toLocaleString()} km` : "N/A"}
                          </td>

                          {/* Assured Toggle */}
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => handleInlineAssuredToggle(car)}
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                                car.isAssured
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 hover:text-gray-600"
                              }`}
                              title="Click to toggle Selectt Assured badge"
                            >
                              <ShieldCheck size={11} />
                              {car.isAssured ? "Assured" : "Standard"}
                            </button>
                          </td>

                          {/* Inline Status Dropdown Selector */}
                          <td className="px-2 py-2 text-center">
                            <select
                              value={car.status || "active"}
                              onChange={e => handleInlineStatusChange(car.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer transition-colors ${
                                (car.status || "active") === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : car.status === "sold_out"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                                  : car.status === "hold"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <option value="active">🟢 Active</option>
                              <option value="hold">🟠 On Hold</option>
                              <option value="sold_out">🔴 Sold Out</option>
                              <option value="deactive">⚪ Deactive</option>
                            </select>
                          </td>

                          {/* Listed By */}
                          <td className="px-2 py-2 text-center">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded">
                              {car.listedBy || "Admin"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-2 py-2 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              {/* Quick View */}
                              <button
                                onClick={() => setQuickViewCar(car)}
                                className="p-1 hover:bg-indigo-50 text-indigo-600 rounded transition-colors cursor-pointer"
                                title="Quick View Specs"
                              >
                                <Eye size={15} />
                              </button>

                              {/* View on Frontend */}
                              <a
                                href={getCarDetailsUrl(car, frontendUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors cursor-pointer"
                                title="Open detail page on live site"
                              >
                                <ExternalLink size={15} />
                              </a>

                              {/* Edit Car */}
                              <button
                                onClick={() => openEdit(car)}
                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors cursor-pointer"
                                title="Edit Full Car Record"
                              >
                                <Edit size={15} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(car.id)}
                                className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer"
                                title="Delete Car"
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

              {/* Table Footer & Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 gap-3">
                {/* Page Size & Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Showing <strong className="text-gray-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                    <strong className="text-gray-800 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{" "}
                    <strong className="text-gray-800 dark:text-white">{totalItems}</strong> cars
                  </span>
                  <div className="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={e => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav className="inline-flex items-center gap-1" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="text-gray-400 text-xs px-1">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </div>

        {/* Quick View Modal */}
        {quickViewCar && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 relative">
              <button
                onClick={() => setQuickViewCar(null)}
                className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full bg-gray-100 dark:bg-gray-800 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-start gap-4">
                <img
                  src={quickViewCar.image?.startsWith('/') ? `${API}${quickViewCar.image}` : quickViewCar.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"}
                  alt={quickViewCar.model}
                  className="w-32 h-24 object-cover rounded-2xl border border-gray-100 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">#{quickViewCar.id}</span>
                    {quickViewCar.isAssured && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck size={12} /> Assured
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {quickViewCar.year} {quickViewCar.make} {quickViewCar.model}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">{quickViewCar.variant}</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    ₹{Number(quickViewCar.price || 0).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-gray-400">({(quickViewCar.price / 100000).toFixed(2)} Lakh)</span>
                  </p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">KM Driven</span>
                  <span className="font-bold text-gray-800 dark:text-white">{quickViewCar.km ? `${quickViewCar.km.toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Fuel Type</span>
                  <span className="font-bold text-gray-800 dark:text-white capitalize">{quickViewCar.fuelType || quickViewCar.fuel_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Transmission</span>
                  <span className="font-bold text-gray-800 dark:text-white capitalize">{quickViewCar.transmission || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Ownership</span>
                  <span className="font-bold text-gray-800 dark:text-white">{quickViewCar.ownership || '1st Owner'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Registration</span>
                  <span className="font-bold text-gray-800 dark:text-white">{quickViewCar.regState || quickViewCar.reg_state || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Location</span>
                  <span className="font-bold text-gray-800 dark:text-white truncate block">{quickViewCar.location || 'Hub'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <a
                  href={getCarDetailsUrl(quickViewCar, frontendUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <ExternalLink size={14} /> Open Live Frontend Listing Page
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const id = quickViewCar.id;
                      setQuickViewCar(null);
                      openEdit({ id });
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Edit Car Record
                  </button>
                  <button
                    onClick={() => setQuickViewCar(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

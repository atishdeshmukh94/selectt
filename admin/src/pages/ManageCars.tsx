import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle, Edit, Trash2, Search, Car, Check, Eye, ChevronUp, ChevronDown,
  ChevronsUpDown, CheckCircle, Tag, Fuel, Sliders, X, Filter, RefreshCw,
  ExternalLink, ShieldCheck, CheckSquare, Square, Info, Calendar, MapPin, IndianRupee,
  Upload, Download, Clock, Sparkles, Key, FileText, CheckCircle2, Play, AlertCircle,
  Percent, Award, Layers, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { useNavigate } from "react-router";
import { API_URL } from "../config/api";

const API = API_URL;

const DEFAULT_CAR_IMG = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop";

const getImageUrl = (img?: string | any) => {
  if (!img) return DEFAULT_CAR_IMG;
  let target: string = "";
  if (typeof img === "string") {
    target = img;
  } else if (typeof img === "object") {
    target = img.image || img.img || img.coverImage || img.cover_image || "";
    if (!target && Array.isArray(img.moreImages) && img.moreImages.length > 0) target = img.moreImages[0];
    if (!target && Array.isArray(img.more_images) && img.more_images.length > 0) target = img.more_images[0];
    if (!target && Array.isArray(img.images) && img.images.length > 0) target = img.images[0];
  }

  if (!target || !target.trim()) return DEFAULT_CAR_IMG;

  if (target.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(target);
      if (Array.isArray(parsed) && parsed.length > 0) target = parsed[0];
    } catch {}
  }

  if (typeof target !== "string" || !target.trim()) return DEFAULT_CAR_IMG;

  if (target.startsWith("http://") || target.startsWith("https://")) return target;
  if (target.startsWith("/")) return `${API}${target}`;
  return `${API}/${target}`;
};

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
  const [yearFilter, setYearFilter] = useState("all");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  // Quick View Modal
  const [quickViewCar, setQuickViewCar] = useState<any | null>(null);
  const [selectedModalImg, setSelectedModalImg] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"specs" | "features" | "report" | "description">("specs");

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

  // Unique list of registration years for filter dropdown
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    cars.forEach(c => {
      const y = String(c.year || c.regYear || '');
      if (y) years.add(y);
    });
    return Array.from(years).sort().reverse();
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

  // Inline Quick Actions
  const handleInlineStatusChange = async (carId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API}/api/cars/${carId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setCars(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c));
        const statusLabel = 
          newStatus === 'in_stock' ? 'In Stock' : 
          newStatus === 'out_of_stock' ? 'Out of Stock' : 
          newStatus === 'booked' ? 'Booked' : 
          newStatus === 'sold_out' ? 'Sold Out' : 
          'Coming Soon';
        showToast(`Car #${carId} status set to "${statusLabel}"`);
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Network error updating status", "error");
    }
  };

  const handleDelete = async (carId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle from inventory?")) return;
    try {
      const res = await fetch(`${API}/api/cars/${carId}`, { method: "DELETE", headers });
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== carId));
        showToast(`Vehicle #${carId} deleted successfully`);
      } else {
        showToast("Failed to delete car", "error");
      }
    } catch {
      showToast("Network error deleting car", "error");
    }
  };

  // CSV Bulk Upload Handler
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        showToast("CSV file is empty or missing data rows", "error");
        return;
      }

      const headersArr = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const newCars: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (!row || row.length === 0) continue;
        
        const values = row.map(v => v.trim().replace(/^"|"$/g, ''));
        const carObj: Record<string, any> = {};
        headersArr.forEach((h, idx) => {
          if (values[idx] !== undefined) {
            carObj[h] = values[idx];
          }
        });

        if (carObj.make || carObj.model) {
          newCars.push({
            make: carObj.make || carObj.brand || "Maruti Suzuki",
            model: carObj.model || "Swift",
            variant: carObj.variant || "VXI",
            year: Number(carObj.year || carObj.regyear || 2023),
            price: Number(carObj.price || 500000),
            km: Number(carObj.km || carObj.kms || 10000),
            fuelType: carObj.fueltype || carObj.fuel_type || carObj.fuel || "Petrol",
            transmission: carObj.transmission || "Manual",
            location: carObj.location || carObj.city || "Mumbai",
            registrationNo: carObj.registrationno || carObj.registration_no || carObj.regno || carObj.registrationnumber || `MH-${Math.floor(Math.random()*45+1).toString().padStart(2,'0')}-XX-${Math.floor(Math.random()*9000+1000)}`,
            status: carObj.status || "in_stock",
            image: carObj.image || carObj.image_url || "/img/suv.png"
          });
        }
      }

      if (newCars.length === 0) {
        showToast("No valid car records found in CSV", "error");
        return;
      }

      const res = await fetch(`${API}/api/cars/bulk-import`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cars: newCars })
      });

      if (res.ok) {
        showToast(`Successfully imported ${newCars.length} cars from CSV!`, "success");
        fetchCars();
      } else {
        await Promise.all(newCars.map(c => fetch(`${API}/api/cars`, {
          method: "POST",
          headers,
          body: JSON.stringify(c)
        })));
        showToast(`Successfully imported ${newCars.length} cars from CSV!`, "success");
        fetchCars();
      }
    } catch (err) {
      showToast("Failed to upload cars CSV", "error");
    }
    e.target.value = "";
  };

  const downloadCSVTemplate = () => {
    const template = "make,model,variant,year,price,km,fuelType,transmission,location,registrationNo,status\nHyundai,Creta,SX (O),2024,1450000,12000,Petrol,Automatic,Mumbai,MH-01-AB-1234,in_stock\nMaruti Suzuki,Swift,ZXI,2023,680000,25000,CNG,Manual,Pune,MH-12-CD-5678,in_stock";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "selectt_cars_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        showToast(`Updated ${selectedIds.length} cars status`);
        setSelectedIds([]);
      } else {
        throw new Error("Bulk update failed");
      }
    } catch (e) {
      await Promise.all(selectedIds.map(id =>
        fetch(`${API}/api/cars/${id}`, {
          method: "PUT",
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
      const searchStr = `${c.make || ''} ${c.model || ''} ${c.variant || ''} ${c.year || ''} ${c.registrationNo || c.registration_no || ''} ${c.location || ''} ${c.id || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(search.toLowerCase().trim());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "in_stock" && ["in_stock", "active"].includes((c.status || "active").toLowerCase())) ||
        (statusFilter === "out_of_stock" && ["out_of_stock", "deactive"].includes((c.status || "").toLowerCase())) ||
        (statusFilter === "booked" && ["booked", "on_hold", "hold", "reserved"].includes((c.status || "").toLowerCase())) ||
        (statusFilter === "sold_out" && (c.status || "").toLowerCase() === "sold_out") ||
        (statusFilter === "coming_soon" && (c.status || "").toLowerCase() === "coming_soon") ||
        (c.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesMake = makeFilter === "all" || (c.make || "").toLowerCase() === makeFilter.toLowerCase();
      const matchesYear = yearFilter === "all" || String(c.year || c.regYear || '') === yearFilter;
      
      const carFuel = (c.fuelType || c.fuel_type || "").toLowerCase();
      const matchesFuel = fuelFilter === "all" || 
        (fuelFilter === "ev" ? ["electric", "ev", "battery"].includes(carFuel) : carFuel.includes(fuelFilter.toLowerCase()));

      const carTrans = (c.transmission || "").toLowerCase();
      const matchesTrans = transmissionFilter === "all" || carTrans.includes(transmissionFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMake && matchesYear && matchesFuel && matchesTrans;
    });
  }, [cars, search, statusFilter, makeFilter, yearFilter, fuelFilter, transmissionFilter]);

  // Sorting Logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (!sortField) return 0;
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "car") {
        valA = `${a.make} ${a.model}`.toLowerCase();
        valB = `${b.make} ${b.model}`.toLowerCase();
      } else if (sortField === "price" || sortField === "km" || sortField === "year" || sortField === "id") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMakeFilter("all");
    setFuelFilter("all");
    setTransmissionFilter("all");
    setYearFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || statusFilter !== "all" || makeFilter !== "all" || fuelFilter !== "all" || transmissionFilter !== "all" || yearFilter !== "all";

  // Summary Metrics Counts
  const inStockCount = cars.filter(c => ["in_stock", "active"].includes((c.status || "active").toLowerCase())).length;
  const outOfStockCount = cars.filter(c => ["out_of_stock", "deactive"].includes((c.status || "").toLowerCase())).length;
  const bookedCount = cars.filter(c => ["booked", "on_hold", "hold", "reserved"].includes((c.status || "").toLowerCase())).length;
  const soldOutCount = cars.filter(c => (c.status || "").toLowerCase() === "sold_out").length;
  const comingSoonCount = cars.filter(c => (c.status || "").toLowerCase() === "coming_soon").length;

  return (
    <>
      <PageMeta
        title="Manage Cars | Selectt Admin"
        description="Filter, edit, feature, and manage all listed vehicle inventory"
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-xl border font-extrabold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success"
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
            : toast.type === "error"
            ? "bg-rose-600 text-white border-rose-500 shadow-rose-200"
            : "bg-slate-900 text-white border-slate-800"
        }`}>
          <CheckCircle size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-gray-800 p-4 sm:px-6 sm:py-4 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Manage Cars
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {cars.length} cars total
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Filter, edit, bulk upload via CSV, and manage all listed vehicle inventory
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* CSV Import Button */}
            <label className="px-3.5 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95">
              <Upload className="size-4 text-[#1C3EB9]" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>

            {/* CSV Template Download */}
            <button 
              onClick={downloadCSVTemplate} 
              className="px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all"
              title="Download CSV Template"
            >
              <Download className="size-3.5 text-gray-500" />
              <span>CSV Template</span>
            </button>

            <button
              onClick={fetchCars}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
              title="Refresh Catalog Data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#1C3EB9]" : ""} />
            </button>
            <button
              onClick={() => navigate('/cars/add')}
              className="px-4 py-2 rounded-full bg-[#1C3EB9] hover:bg-[#153299] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="size-4 stroke-[2.5]" />
              <span>Add New Car</span>
            </button>
          </div>
        </div>

        {/* Compact Quick KPI Metric Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          <div 
            onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
              <span>TOTAL</span>
              <Car size={14} className="text-indigo-600" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">{cars.length}</div>
          </div>

          <div 
            onClick={() => { setStatusFilter("in_stock"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "in_stock"
                ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
              <span>IN STOCK</span>
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">{inStockCount}</div>
          </div>

          <div 
            onClick={() => { setStatusFilter("out_of_stock"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "out_of_stock"
                ? "bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider mb-0.5">
              <span>OUT OF STOCK</span>
              <Tag size={14} className="text-rose-600" />
            </div>
            <div className="text-lg font-black text-rose-700 dark:text-rose-400">{outOfStockCount}</div>
          </div>

          <div 
            onClick={() => { setStatusFilter("booked"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "booked"
                ? "bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-0.5">
              <span>BOOKED</span>
              <Fuel size={14} className="text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-700 dark:text-amber-400">{bookedCount}</div>
          </div>

          <div 
            onClick={() => { setStatusFilter("sold_out"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "sold_out"
                ? "bg-purple-50/80 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider mb-0.5">
              <span>SOLD OUT</span>
              <Tag size={14} className="text-purple-600" />
            </div>
            <div className="text-lg font-black text-purple-700 dark:text-purple-400">{soldOutCount}</div>
          </div>

          <div 
            onClick={() => { setStatusFilter("coming_soon"); setCurrentPage(1); }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "coming_soon"
                ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">
              <span>COMING SOON</span>
              <Clock size={14} className="text-blue-600" />
            </div>
            <div className="text-lg font-black text-blue-700 dark:text-blue-400">{comingSoonCount}</div>
          </div>
        </div>

        {/* Filter Controls Suite Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search make, model, variant, reg. no, location, or ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Statuses ({cars.length})</option>
                <option value="in_stock">In Stock ({inStockCount})</option>
                <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
                <option value="booked">Booked ({bookedCount})</option>
                <option value="sold_out">Sold Out ({soldOutCount})</option>
                <option value="coming_soon">Coming Soon ({comingSoonCount})</option>
              </select>

              {/* Brand/Make */}
              <select
                value={makeFilter}
                onChange={e => setMakeFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Makes ({uniqueMakes.length})</option>
                {uniqueMakes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
              >
                <option value="all">All Years ({uniqueYears.length})</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y}>{y}</option>
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
                <option value="cng">CNG</option>
                <option value="hybrid">Hybrid</option>
                <option value="ev">Electric</option>
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
                {yearFilter !== "all" && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">Year: {yearFilter}</span>}
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

        {/* Bulk Selection Operations Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#0C1B33] dark:bg-gray-900 text-white p-3.5 px-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700/80 dark:border-gray-800 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckSquare size={15} className="text-emerald-400" />
                <span className="font-extrabold tracking-wide">{selectedIds.length} vehicles selected</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white underline text-xs cursor-pointer font-medium transition-colors"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Set Status:</span>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("in_stock")}
                disabled={isUpdatingBulk}
                className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                In Stock
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("out_of_stock")}
                disabled={isUpdatingBulk}
                className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Out of Stock
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("booked")}
                disabled={isUpdatingBulk}
                className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Booked
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("sold_out")}
                disabled={isUpdatingBulk}
                className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Sold Out
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("coming_soon")}
                disabled={isUpdatingBulk}
                className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Coming Soon
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isUpdatingBulk}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all sm:ml-2 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Cars Inventory Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Vehicle Inventory...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Car size={40} className="mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No cars found matching your filter criteria</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  Reset filters and try again
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100/90 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700 select-none">
                  <tr>
                    <th className="px-2.5 py-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === paginated.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-2.5 py-3 text-left w-16">Image</th>
                    <th onClick={() => handleSort("car")} className="px-2.5 py-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Car Model {renderSortIcon("car")}
                    </th>
                    <th onClick={() => handleSort("year")} className="px-2.5 py-3 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-16">
                      Year {renderSortIcon("year")}
                    </th>
                    <th onClick={() => handleSort("price")} className="px-2.5 py-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Price {renderSortIcon("price")}
                    </th>
                    <th onClick={() => handleSort("km")} className="px-2.5 py-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                      KM {renderSortIcon("km")}
                    </th>
                    <th onClick={() => handleSort("registrationNo")} className="px-2.5 py-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap font-extrabold">
                      REGISTRATION NO {renderSortIcon("registrationNo")}
                    </th>
                    <th onClick={() => handleSort("status")} className="px-2.5 py-3 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Status {renderSortIcon("status")}
                    </th>
                    <th className="px-2.5 py-3 text-right w-24">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginated.map(car => {
                    const isSelected = selectedIds.includes(car.id);
                    const carStatus = (car.status || "active").toLowerCase();

                    return (
                      <tr 
                        key={car.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                          isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-2.5 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(car.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* Image */}
                        <td className="px-2.5 py-2.5">
                          <button onClick={() => setQuickViewCar(car)} className="cursor-pointer group block">
                            {car.image ? (
                              <img
                                src={car.image.startsWith('/') ? `${API}${car.image}` : car.image}
                                alt={car.model}
                                className="w-16 h-11 object-cover rounded-lg group-hover:scale-105 transition-all shadow-xs border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-11 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                <Car size={18} />
                              </div>
                            )}
                          </button>
                        </td>

                        {/* Car Model & ID (with Location directly below) */}
                        <td className="px-2.5 py-2.5">
                          <button onClick={() => setQuickViewCar(car)} className="text-left group cursor-pointer block">
                            <div className="font-extrabold text-gray-900 text-sm dark:text-white group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                              <span>{car.make} {car.model}</span>
                              <span className="text-xs font-bold text-[#1C3EB9] font-mono">#{car.id}</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 flex-wrap mt-1">
                              {car.variant && <span className="font-bold text-gray-700 dark:text-gray-200">{car.variant}</span>}
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-extrabold capitalize ${
                                (car.fuelType || car.fuel_type || "").toLowerCase().includes("hybrid")
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : (car.fuelType || car.fuel_type || "").toLowerCase().includes("electric")
                                  ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}>
                                <Fuel size={11} />
                                {car.fuelType || car.fuel_type || "N/A"}
                              </span>
                            </div>
                            {/* Location & Transmission below variant and fuel type */}
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                              {car.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={12} className="text-rose-500 shrink-0" />
                                  <span>{car.location}</span>
                                </div>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-extrabold capitalize">
                                <Sliders size={11} />
                                {car.transmission || "N/A"}
                              </span>
                            </div>
                          </button>
                        </td>

                        {/* Year */}
                        <td className="px-2.5 py-2.5 text-center font-extrabold text-sm text-gray-900 dark:text-gray-100">{car.year}</td>

                        {/* Price */}
                        <td className="px-2.5 py-2.5 font-black text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          ₹{Number(car.price || 0).toLocaleString()}
                          <div className="text-xs font-bold text-[#1C3EB9]">
                            ₹{(car.price / 100000).toFixed(2)}L
                          </div>
                        </td>

                        {/* KM */}
                        <td className="px-2.5 py-2.5 text-xs font-extrabold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {car.km ? `${car.km.toLocaleString()} km` : "N/A"}
                        </td>

                        {/* Vehicle Registration Number Cell */}
                        <td className="px-2.5 py-2.5 whitespace-nowrap text-left">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono text-xs font-extrabold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                            {car.registrationNo || car.registration_no || car.reg_no || car.regNo || `MH-${(car.id % 45 + 1).toString().padStart(2, '0')}-XX-${(1000 + car.id)}`}
                          </span>
                        </td>

                        {/* Inline Status Dropdown (In Stock, Out of Stock, Booked, Sold Out, Coming Soon) */}
                        <td className="px-2.5 py-2.5 text-center">
                          <select
                            value={
                              ["in_stock", "active"].includes(carStatus) ? "in_stock" :
                              carStatus === "sold_out" ? "sold_out" :
                              carStatus === "coming_soon" ? "coming_soon" :
                              ["out_of_stock", "deactive"].includes(carStatus) ? "out_of_stock" :
                              "booked"
                            }
                            onChange={e => handleInlineStatusChange(car.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold border focus:outline-none cursor-pointer transition-colors ${
                              ["in_stock", "active"].includes(carStatus)
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : carStatus === "sold_out"
                                ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300"
                                : carStatus === "coming_soon"
                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300"
                                : carStatus === "booked"
                                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300"
                            }`}
                          >
                            <option value="in_stock">🟢 In Stock</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                            <option value="booked">🟠 Booked</option>
                            <option value="sold_out">🏷️ Sold Out</option>
                            <option value="coming_soon">⏳ Coming Soon</option>
                          </select>
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
                              onClick={() => navigate(`/cars/edit/${car.id}`)}
                              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Full Car Record"
                            >
                              <Edit size={15} />
                            </button>

                            {/* Delete Car */}
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
          )}

          {/* Pagination Controls Footer */}
          {!loading && sorted.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 text-xs">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <span>Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, sorted.length)}</strong> of <strong>{sorted.length}</strong> vehicles</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 font-extrabold text-gray-800 dark:text-gray-200">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Vehicle Details Spec Modal */}
      {quickViewCar && (() => {
        // Extract gallery images
        const galleryImages: string[] = [];
        if (quickViewCar.image) galleryImages.push(quickViewCar.image);
        let more = quickViewCar.moreImages || quickViewCar.more_images || quickViewCar.images;
        if (typeof more === 'string') {
          try { more = JSON.parse(more); } catch {}
        }
        if (Array.isArray(more)) {
          more.forEach((img: string) => {
            if (img && !galleryImages.includes(img)) galleryImages.push(img);
          });
        }

        // Extract features
        let featuresList: string[] = [];
        let feat = quickViewCar.features;
        if (typeof feat === 'string') {
          try { feat = JSON.parse(feat); } catch {}
        }
        if (Array.isArray(feat)) {
          featuresList = feat.map((f: any) => typeof f === 'object' && f !== null ? (f.name || f.title || JSON.stringify(f)) : String(f));
        } else if (typeof feat === 'object' && feat !== null) {
          Object.values(feat).forEach((val: any) => {
            if (Array.isArray(val)) {
              val.forEach((item: any) => {
                featuresList.push(typeof item === 'object' && item !== null ? (item.name || item.title || JSON.stringify(item)) : String(item));
              });
            } else if (typeof val === 'string') {
              featuresList.push(val);
            }
          });
        }

        // Extract reasons to buy
        let reasonsList: any[] = [];
        let reasons = quickViewCar.reasonsToBuy || quickViewCar.reasons_to_buy;
        if (typeof reasons === 'string') {
          try { reasons = JSON.parse(reasons); } catch {}
        }
        if (Array.isArray(reasons)) reasonsList = reasons;

        // Extract quality report
        let qReport = quickViewCar.qualityReport || quickViewCar.quality_report;
        if (typeof qReport === 'string') {
          try { qReport = JSON.parse(qReport); } catch {}
        }

        const activeImg = selectedModalImg || getImageUrl(quickViewCar);
        const originalPriceVal = Number(quickViewCar.originalPrice || quickViewCar.original_price || 0);
        const sellingPriceVal = Number(quickViewCar.price || 0);
        const hasDiscount = originalPriceVal > sellingPriceVal;

        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
              
              {/* Modal Header */}
              <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900 sticky top-0 z-20">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#1C3EB9]/10 text-[#1C3EB9] border border-[#1C3EB9]/25 font-mono">
                    ID #{quickViewCar.id}
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase leading-tight flex items-center gap-2">
                      <span>{quickViewCar.year} {quickViewCar.make} {quickViewCar.model}</span>
                      {quickViewCar.variant && (
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">
                          ({quickViewCar.variant})
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                    quickViewCar.status === "in_stock"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : quickViewCar.status === "booked"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : quickViewCar.status === "coming_soon"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      : quickViewCar.status === "sold_out"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}>
                    {quickViewCar.status ? quickViewCar.status.replace("_", " ") : "In Stock"}
                  </span>
                  <button
                    onClick={() => {
                      setQuickViewCar(null);
                      setSelectedModalImg(null);
                      setActiveModalTab("specs");
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                {/* TOP SECTION: 2-COLUMN SPLIT (Left: Image & Gallery, Right: Core Info & Key Specs) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Image & Gallery (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="relative w-full h-64 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-inner">
                      <img
                        src={activeImg}
                        alt={quickViewCar.model || "Car Image"}
                        className="w-full h-full object-cover transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_CAR_IMG;
                        }}
                      />

                      {/* Top Left Badges Overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                        {quickViewCar.listing_type === 'luxury' || quickViewCar.listingType === 'luxury' || (quickViewCar.tag && quickViewCar.tag.toLowerCase().includes('luxury')) ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                            👑 Selectt Luxury
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-md flex items-center gap-1">
                            Standard
                          </span>
                        )}
                        {quickViewCar.tag && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#155DFC] text-white shadow-md">
                            {quickViewCar.tag}
                          </span>
                        )}
                        {quickViewCar.badgeText && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md flex items-center gap-1">
                            <Tag size={12} /> {quickViewCar.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Video Link Overlay */}
                      {quickViewCar.videoUrl && (
                        <a
                          href={quickViewCar.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                        >
                          <Play size={13} className="fill-white" />
                          <span>Watch Video Tour</span>
                        </a>
                      )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {galleryImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {galleryImages.map((img, idx) => {
                          const thumbUrl = getImageUrl(img);
                          const isCurrent = activeImg === thumbUrl;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedModalImg(thumbUrl)}
                              className={`w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                                isCurrent
                                  ? "border-[#1C3EB9] ring-2 ring-[#1C3EB9]/30 scale-105"
                                  : "border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={thumbUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Core Important Info (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Title & Location */}
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-tight">
                        {quickViewCar.year} {quickViewCar.make} {quickViewCar.model}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
                        {quickViewCar.variant && (
                          <span className="text-slate-800 dark:text-slate-200">{quickViewCar.variant}</span>
                        )}
                        {quickViewCar.location && (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <MapPin size={13} /> {quickViewCar.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200/80 dark:border-gray-700 space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Selling Price
                      </span>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-black text-[#1C3EB9] dark:text-blue-400">
                          ₹{sellingPriceVal.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          ({(sellingPriceVal / 100000).toFixed(2)} Lakh)
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-bold text-gray-400 line-through">
                            ₹{originalPriceVal.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {hasDiscount && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-500/10 text-rose-600 border border-rose-500/30">
                            Save ₹{(originalPriceVal - sellingPriceVal).toLocaleString()}
                          </span>
                        )}
                        {quickViewCar.emi && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-[#155DFC] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                            EMI: ₹{Number(quickViewCar.emi).toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Core Specs 2x3 Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">KM Driven</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {quickViewCar.km ? `${Number(quickViewCar.km).toLocaleString()} km` : "N/A"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">Fuel Type</span>
                        <span className="font-extrabold text-gray-900 dark:text-white capitalize">
                          {quickViewCar.fuelType || quickViewCar.fuel_type || "N/A"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">Transmission</span>
                        <span className="font-extrabold text-gray-900 dark:text-white capitalize">
                          {quickViewCar.transmission || "N/A"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">Ownership</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {quickViewCar.ownership || "1st Owner"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">Registration No</span>
                        <span className="font-extrabold text-gray-900 dark:text-white font-mono uppercase">
                          {quickViewCar.registrationNo || quickViewCar.registration_no || "N/A"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                        <span className="text-gray-400 font-bold uppercase block text-[9px]">Reg. Year</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {quickViewCar.regYear || quickViewCar.year || "N/A"} ({quickViewCar.regState || "MH"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM SECTION: FULL WIDTH TABS & DETAILED INFO */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-800 text-xs font-bold">
                    <button
                      onClick={() => setActiveModalTab("specs")}
                      className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        activeModalTab === "specs"
                          ? "bg-[#1C3EB9] text-white shadow-sm font-black"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Sliders size={14} /> Full Vehicle Specs
                    </button>
                    {featuresList.length > 0 && (
                      <button
                        onClick={() => setActiveModalTab("features")}
                        className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          activeModalTab === "features"
                            ? "bg-[#1C3EB9] text-white shadow-sm font-black"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Sparkles size={14} /> Features ({featuresList.length})
                      </button>
                    )}
                    {qReport && (
                      <button
                        onClick={() => setActiveModalTab("report")}
                        className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          activeModalTab === "report"
                            ? "bg-[#1C3EB9] text-white shadow-sm font-black"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <CheckCircle2 size={14} /> Quality Report
                      </button>
                    )}
                    {quickViewCar.description && (
                      <button
                        onClick={() => setActiveModalTab("description")}
                        className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          activeModalTab === "description"
                            ? "bg-[#1C3EB9] text-white shadow-sm font-black"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <FileText size={14} /> Description
                      </button>
                    )}
                  </div>

                  {/* Tab 1: Full Specs */}
                  {activeModalTab === "specs" && (
                    <div className="space-y-4">
                      {/* Technical Specs Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Manufacturing Year</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">{quickViewCar.year || "N/A"}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Kilometers (KM)</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {quickViewCar.km ? `${Number(quickViewCar.km).toLocaleString()} km` : "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Fuel Type</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.fuelType || quickViewCar.fuel_type || "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Transmission</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.transmission || "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Ownership</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {quickViewCar.ownership || "1st Owner"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Engine Capacity</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {quickViewCar.engineCapacity || quickViewCar.engine_capacity ? `${quickViewCar.engineCapacity || quickViewCar.engine_capacity} cc` : "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Registration No</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm font-mono uppercase">
                            {quickViewCar.registrationNo || quickViewCar.registration_no || "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Reg. Year & State</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {quickViewCar.regYear || quickViewCar.year || "—"} ({quickViewCar.regState || "MH"})
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Location / City</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.location || "Mumbai"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Car Hub / Center</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {quickViewCar.hub || "Selectt Hub"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Body Type</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.bodyType || quickViewCar.body_type || "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Color</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.color || "N/A"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Insurance</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.insuranceStatus || quickViewCar.insurance_status || "Comprehensive"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60">
                          <span className="text-gray-400 font-bold uppercase block text-[10px]">Spare Key</span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm capitalize">
                            {quickViewCar.spareKey || quickViewCar.spare_key || "Yes"}
                          </span>
                        </div>

                        {quickViewCar.listedBy && (
                          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 col-span-2">
                            <span className="text-gray-400 font-bold uppercase block text-[10px]">Source / Listed By</span>
                            <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                              {quickViewCar.listedBy}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Reasons to Buy Highlights */}
                      {reasonsList.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                          <h4 className="font-extrabold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={14} /> Key Highlights / Reasons to Buy
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {reasonsList.map((reason, rIdx) => {
                              const isObj = typeof reason === 'object' && reason !== null;
                              const title = isObj ? (reason.title || reason.name || '') : String(reason);
                              const desc = isObj ? reason.description : '';
                              return (
                                <div key={rIdx} className="flex items-start gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">{title}</span>
                                    {desc && (
                                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal block leading-tight mt-0.5">
                                        {desc}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Features */}
                  {activeModalTab === "features" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {featuresList.map((featName, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200"
                          >
                            <CheckCircle size={14} className="text-[#1C3EB9] shrink-0" />
                            <span className="truncate">{featName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Quality Report */}
                  {activeModalTab === "report" && qReport && (
                    <div className="space-y-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <ShieldCheck size={16} /> 140-Point Quality Inspection Passed & Certified
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        {Object.entries(qReport).map(([catKey, catVal]: [string, any]) => (
                          <div
                            key={catKey}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                          >
                            <span className="text-gray-400 font-bold uppercase block text-[10px]">
                              {catKey.replace(/_/g, " ")}
                            </span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                              <CheckCircle2 size={13} /> {typeof catVal === "object" ? (catVal.status || "Passed") : String(catVal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Description */}
                  {activeModalTab === "description" && quickViewCar.description && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                      {quickViewCar.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex items-center justify-between gap-3 sticky bottom-0 z-20">
                <a
                  href={getCarDetailsUrl(quickViewCar, frontendUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs hover:border-[#1C3EB9] hover:text-[#1C3EB9] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} />
                  <span>View Live Page</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuickViewCar(null);
                      setSelectedModalImg(null);
                      setActiveModalTab("specs");
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const carToEdit = quickViewCar;
                      setQuickViewCar(null);
                      navigate(`/cars/edit/${carToEdit.id}`);
                    }}
                    className="px-5 py-2.5 bg-[#1C3EB9] hover:bg-[#153299] text-white rounded-xl font-extrabold text-xs shadow-md shadow-blue-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Full Car Record</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

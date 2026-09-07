import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Car, Settings, Image as ImageIcon, CheckCircle, X, ChevronRight, Upload, Download, FileSpreadsheet, AlertCircle, Check, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageMeta from "../components/common/PageMeta";
import { toast } from "react-hot-toast";

import { API_URL } from "../config/api";
const API = API_URL;

interface Variant {
  id: number | null;
  model_id: number | null;
  name: string;
}

interface Model {
  id: number | null;
  brand_id: number | null;
  name: string;
  variants?: Variant[];
}

interface Brand {
  id: number;
  name: string;
  logo_url: string;
  models: Model[];
}

const BrandModels = () => {
  const { token } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null); // the active brand being viewed/edited
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  // CSV Import Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [brandForm, setBrandForm] = useState<{ id: number | null; name: string; logo_url: string }>({ id: null, name: '', logo_url: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [modelForm, setModelForm] = useState<Model>({ id: null, brand_id: null, name: '' });
  const [variantForm, setVariantForm] = useState<Variant>({ id: null, model_id: null, name: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/brands`);
      const data: Brand[] = await res.json();
      setBrands(data);
      if (selectedBrand) {
        setSelectedBrand(data.find(b => b.id === selectedBrand.id) || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- CSV IMPORT / EXPORT HANDLERS ---
  const handleDownloadSampleCsv = () => {
    const sampleData = [
      "Brand,Model,Variant,Logo_URL",
      "Maruti Suzuki,Swift,ZXi Plus,/img/maruti-suzuki.png",
      "Maruti Suzuki,Swift,VXi,/img/maruti-suzuki.png",
      "Maruti Suzuki,Baleno,Alpha,/img/maruti-suzuki.png",
      "Hyundai,Creta,SX (O),/img/hyundai.webp",
      "Hyundai,Venue,SX,/img/hyundai.webp",
      "Tata,Nexon,Creative Plus,/img/tata.webp",
      "Tata,Punch,Accomplished,/img/tata.webp",
      "Mahindra,Thar,LX 4x4 Hard Top,/img/mahindra.webp",
      "Mahindra,XUV700,AX7 Luxury,/img/mahindra.webp",
      "Kia,Seltos,GTX Plus,/img/kia.webp",
      "Toyota,Fortuner,4x4 AT,/img/toyota.webp",
      "Honda,City,ZX CVT,/img/honda.webp"
    ].join("\n");

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Sample_Brands_Models_Variants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample CSV template downloaded!");
  };

  const handleExportCsv = () => {
    if (brands.length === 0) {
      toast.error("No brands available to export");
      return;
    }

    const rows: string[] = ["Brand,Model,Variant,Logo_URL"];

    brands.forEach((brand) => {
      if (!brand.models || brand.models.length === 0) {
        rows.push(`"${brand.name}","","","${brand.logo_url || ''}"`);
      } else {
        brand.models.forEach((model) => {
          if (!model.variants || model.variants.length === 0) {
            rows.push(`"${brand.name}","${model.name}","","${brand.logo_url || ''}"`);
          } else {
            model.variants.forEach((variant) => {
              rows.push(`"${brand.name}","${model.name}","${variant.name}","${brand.logo_url || ''}"`);
            });
          }
        });
      }
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Selectt_Brands_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Current Brands, Models & Variants exported as CSV!");
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid .csv file");
      return;
    }

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or has no data rows");
        setParsedRows([]);
        return;
      }

      // Parse CSV Header
      const headerLine = lines[0];
      const headers = headerLine.split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

      const brandIdx = headers.findIndex((h) => h.includes("brand") || h.includes("make"));
      const modelIdx = headers.findIndex((h) => h.includes("model"));
      const variantIdx = headers.findIndex((h) => h.includes("variant") || h.includes("trim"));
      const logoIdx = headers.findIndex((h) => h.includes("logo") || h.includes("image"));

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Basic CSV column splitter handling quotes
        const match = line.match(/(?:[^\s",]+|"[^"]*")+/g) || line.split(",");
        const cols = match.map((c) => c.replace(/^["']|["']$/g, "").trim());

        const brand = brandIdx !== -1 ? cols[brandIdx] : cols[0] || "";
        const model = modelIdx !== -1 ? cols[modelIdx] : cols[1] || "";
        const variant = variantIdx !== -1 ? cols[variantIdx] : cols[2] || "";
        const logo = logoIdx !== -1 ? cols[logoIdx] : cols[3] || "";

        if (brand && brand.trim()) {
          rows.push({
            brand: brand.trim(),
            model: (model || "").trim(),
            variant: (variant || "").trim(),
            logo_url: (logo || "").trim()
          });
        }
      }

      setParsedRows(rows);
      toast.success(`Parsed ${rows.length} rows from CSV file!`);
    };
    reader.readAsText(file);
  };

  const handleImportCsvSubmit = async () => {
    if (parsedRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    try {
      setIsImporting(true);
      const res = await fetch(`${API}/api/admin/brands/import-csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: parsedRows })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to import CSV");
      }

      toast.success(data.message || "CSV Imported successfully!");
      setIsCsvModalOpen(false);
      setParsedRows([]);
      setCsvFileName("");
      fetchBrands();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  // --- BRAND HANDLERS ---
  const handleOpenBrandModal = (brand: Brand | null = null) => {
    if (brand) {
      setBrandForm({ id: brand.id, name: brand.name, logo_url: brand.logo_url });
      setLogoPreview(brand.logo_url ? (brand.logo_url.startsWith('http') ? brand.logo_url : `${API}${brand.logo_url}`) : null);
    } else {
      setBrandForm({ id: null, name: '', logo_url: '' });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", brandForm.name);
    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (brandForm.logo_url && !logoFile) {
      formData.append("logo_url", brandForm.logo_url);
    }

    const url = brandForm.id ? `${API}/api/admin/brands/${brandForm.id}` : `${API}/api/admin/brands`;
    const method = brandForm.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        fetchBrands();
        setIsBrandModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save brand", err);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm("Are you sure? This will delete the brand and ALL its associated models!")) return;
    try {
      const res = await fetch(`${API}/api/admin/brands/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (selectedBrand?.id === id) setSelectedBrand(null);
        fetchBrands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- MODEL HANDLERS ---
  const handleOpenModelModal = (brandId: number | null, model: Model | null = null) => {
    if (model) {
      setModelForm({ id: model.id, brand_id: brandId, name: model.name });
    } else {
      setModelForm({ id: null, brand_id: brandId, name: '' });
    }
    setIsModelModalOpen(true);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modelForm.id ? `${API}/api/admin/models/${modelForm.id}` : `${API}/api/admin/models`;
    const method = modelForm.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(modelForm),
      });
      if (res.ok) {
        fetchBrands();
        setIsModelModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save model", err);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm("Delete this model?")) return;
    try {
      const res = await fetch(`${API}/api/admin/models/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  // --- VARIANT HANDLERS ---
  const handleOpenVariantModal = (modelId: number | null, variant: Variant | null = null) => {
    if (variant) {
      setVariantForm({ id: variant.id, model_id: modelId, name: variant.name });
    } else {
      setVariantForm({ id: null, model_id: modelId, name: '' });
    }
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = variantForm.id ? `${API}/api/admin/variants/${variantForm.id}` : `${API}/api/admin/variants`;
    const method = variantForm.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(variantForm),
      });
      if (res.ok) {
        fetchBrands();
        setIsVariantModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save variant", err);
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!window.confirm("Delete this variant?")) return;
    try {
      const res = await fetch(`${API}/api/admin/variants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <>
      <PageMeta title="Brands & Models | Selectt Admin" description="Configure the car catalog tree for the frontend and admin panel." />
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brands & Models Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure manufacturer brands, car models, and variant trims.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs border border-gray-200 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={15} /> <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet size={15} /> <span>Import CSV</span>
          </button>
          <button
            onClick={() => handleOpenBrandModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} /> <span>Add New Brand</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Col: Brands List */}
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[70vh]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Brands ({brands.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && <p className="text-gray-400 text-center py-6 text-sm">Loading...</p>}
            {!loading && brands.map(brand => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedBrand?.id === brand.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="w-12 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {brand.logo_url ? (
                    <img src={brand.logo_url.startsWith('http') ? brand.logo_url : `${API}${brand.logo_url}`} alt={brand.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Car size={16} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${selectedBrand?.id === brand.id ? 'text-indigo-900' : 'text-gray-800'}`}>{brand.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{brand.models.length} Models</p>
                </div>
                <ChevronRight size={18} className={`${selectedBrand?.id === brand.id ? 'text-indigo-400' : 'text-gray-300'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Associated Models */}
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[70vh]">
          {selectedBrand ? (
            <>
              <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-2 shadow-sm">
                    {selectedBrand.logo_url ? (
                      <img src={selectedBrand.logo_url.startsWith('http') ? selectedBrand.logo_url : `${API}${selectedBrand.logo_url}`} alt={selectedBrand.name} className="w-full h-full object-contain" />
                    ) : <Car className="text-gray-400" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedBrand.name} Models</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage models & variants under this brand</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBrandModal(selectedBrand)}
                    className="flex justify-center items-center w-9 h-9 border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(selectedBrand.id)}
                    className="flex justify-center items-center w-9 h-9 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-2"></div>
                  <button
                    onClick={() => handleOpenModelModal(selectedBrand.id)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-indigo-100"
                  >
                    <Plus size={16} /> Add Model
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
                {selectedBrand.models.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Settings className="text-gray-300" size={24} /></div>
                    <h3 className="text-sm font-semibold text-gray-700">No models found</h3>
                    <p className="text-xs text-gray-500 mt-2 max-w-xs">Add models to {selectedBrand.name} so they appear in dropdowns across the application.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedBrand.models.map(model => (
                      <div key={model.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm group hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{model.name}</h4>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleOpenModelModal(selectedBrand.id, model)} className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                                <Edit size={13} />
                              </button>
                              <button onClick={() => model.id && handleDeleteModel(model.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Variants List */}
                          <div className="mt-2 mb-3">
                            <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                              <span>Variants ({(model.variants || []).length})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                              {(model.variants || []).length === 0 ? (
                                <span className="text-[11px] text-gray-400 italic">No variants added</span>
                              ) : (
                                (model.variants || []).map(v => (
                                  <span key={v.id} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                                    {v.name}
                                    <button onClick={() => v.id && handleDeleteVariant(v.id)} className="text-gray-400 hover:text-red-500 ml-0.5">
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenVariantModal(model.id)}
                          className="w-full mt-2 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-indigo-100/60"
                        >
                          <Plus size={13} /> Add Variant
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
              <Car size={48} className="text-gray-200 mb-4" strokeWidth={1} />
              <h3 className="text-lg font-medium text-gray-900">No Brand Selected</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">Select a brand from the left sidebar to view and manage its associated car models and variants.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD/EDIT BRAND MODAL --- */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{brandForm.id ? 'Edit Brand' : 'Add New Brand'}</h2>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBrand} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name</label>
                <input type="text" required value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Maruti Suzuki" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full text-center">
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsBrandModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT MODEL MODAL --- */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{modelForm.id ? 'Edit Model' : 'Add New Model'}</h2>
              <button onClick={() => setIsModelModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModel} className="p-5">
              <div className="mb-2">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">BRAND</p>
                <p className="text-sm font-semibold text-gray-700 mb-4">{brands.find(b => b.id === modelForm.brand_id)?.name}</p>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Model Name</label>
                <input type="text" required value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="e.g. Swift" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModelModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors">Save Model</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT VARIANT MODAL --- */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{variantForm.id ? 'Edit Variant' : 'Add New Variant'}</h2>
              <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveVariant} className="p-5">
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Variant Name</label>
                <input type="text" required value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="e.g. VXi, ZXi Plus, 320d" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsVariantModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors">Save Variant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- IMPORT CSV MODAL --- */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Import Brands, Models & Variants via CSV</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bulk upload your vehicle catalog hierarchy directly into database.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setParsedRows([]);
                  setCsvFileName("");
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Instructions & Template Download */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-300">Need the standard CSV structure?</span>
                  <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400">Columns: <code className="font-mono font-bold bg-white/70 dark:bg-gray-900 px-1.5 py-0.5 rounded">Brand</code>, <code className="font-mono font-bold bg-white/70 dark:bg-gray-900 px-1.5 py-0.5 rounded">Model</code>, <code className="font-mono font-bold bg-white/70 dark:bg-gray-900 px-1.5 py-0.5 rounded">Variant</code>, <code className="font-mono font-bold bg-white/70 dark:bg-gray-900 px-1.5 py-0.5 rounded">Logo_URL</code></p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="px-3.5 py-2 text-xs font-extrabold bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} /> <span>Download Sample Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Select CSV File</label>
                <input
                  type="file"
                  ref={csvFileInputRef}
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />
                <div 
                  onClick={() => csvFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-800/20 group"
                >
                  <Upload size={28} className="mx-auto text-gray-400 group-hover:text-indigo-600 transition-colors mb-2" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {csvFileName ? `Selected: ${csvFileName}` : "Click to browse or drop your .csv file here"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Supports unlimited rows of Brands, Models & Variants</p>
                </div>
              </div>

              {/* Live Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>Live Preview</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-mono">
                        {parsedRows.length} rows ready
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-400">Showing first 5 entries</span>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 font-bold">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Brand / Make</th>
                          <th className="p-2.5">Model</th>
                          <th className="p-2.5">Variant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                        {parsedRows.slice(0, 5).map((r, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="p-2.5 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-gray-900 dark:text-white">{r.brand}</td>
                            <td className="p-2.5 text-gray-700 dark:text-gray-300">{r.model || <span className="text-gray-400 italic">—</span>}</td>
                            <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">{r.variant || <span className="text-gray-400 italic">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/40 dark:bg-gray-800/20">
              <button
                type="button"
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setParsedRows([]);
                  setCsvFileName("");
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isImporting}
                onClick={handleImportCsvSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing Records...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Records Now` : "CSV"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default BrandModels;

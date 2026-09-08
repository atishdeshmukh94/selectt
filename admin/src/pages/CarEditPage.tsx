import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Info,
  Layers,
  Cpu,
  ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  X,
  Play,
  Search,
  IndianRupee,
  Tag
} from "lucide-react";

import { API_URL } from "../config/api";
import PageMeta from "../components/common/PageMeta";
const API = API_URL;

const CarEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [activeTab, setActiveTab] = useState("basic");
  const [videoSource, setVideoSource] = useState<"upload" | "youtube" | "url">("upload");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<'main' | 'gallery'>('main');
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<string[]>([]);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getMediaType = (url: string) => {
    if (!url) return 'image';
    const cleanUrl = url.split('?')[0];
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.MP4') || cleanUrl.endsWith('.MOV')) {
      return 'video';
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    return 'image';
  };

  const updateVideoInGallery = (newUrl: string) => {
    const cleanImages = formData.moreImages.filter((img: string) => {
      const t = getMediaType(img);
      return t !== 'video' && t !== 'youtube';
    });
    const newImages = newUrl ? [newUrl, ...cleanImages] : cleanImages;
    setFormData({
      ...formData,
      videoUrl: newUrl,
      moreImages: newImages
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    if (sourceIndexStr === "") return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === targetIndex) return;

    const items = [...formData.moreImages];
    const draggedItem = items[sourceIndex];
    items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    setFormData({ ...formData, moreImages: items });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      if (targetField === 'main') {
        const file = files[0];
        const uFormData = new FormData();
        uFormData.append("file", file);

        const response = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          body: uFormData
        });

        if (!response.ok) throw new Error("Upload failed");
        const resData = await response.json();
        const imageUrl = resData.url;
        setFormData({ ...formData, image: imageUrl });
        toast.success("Main image uploaded successfully!");
      } else {
        // Upload multiple files in parallel
        const uploadPromises = Array.from(files).map(async (file) => {
          const uFormData = new FormData();
          uFormData.append("file", file);

          const response = await fetch(`${API}/api/upload`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: uFormData
          });

          if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
          const resData = await response.json();
          return resData.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter(Boolean);
        if (validUrls.length > 0) {
          const currentImages = [...formData.moreImages];
          const newImages = [...currentImages];
          validUrls.forEach(url => {
            if (!newImages.includes(url)) {
              newImages.push(url);
            }
          });
          setFormData({ ...formData, moreImages: newImages });
          toast.success(`Successfully uploaded ${validUrls.length} file(s)!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image files.");
    } finally {
      setIsUploadingImage(false);
      // Reset input element value so that uploading the same file again triggers onChange
      e.target.value = "";
    }
  };

  const openMediaLibrary = async (target: 'main' | 'gallery') => {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
    setLibraryLoading(true);
    setLibrarySearch("");
    setSelectedLibraryUrls([]);
    try {
      const response = await fetch(`${API}/api/media`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLibraryMedia(data);
      }
    } catch (e) {
      console.error("Failed to load library media", e);
    } finally {
      setLibraryLoading(false);
    }
  };

  const selectLibraryImage = (url: string) => {
    if (libraryTarget === 'main') {
      setFormData({ ...formData, image: url });
      toast.success("Main image set from library!");
    } else {
      if (!formData.moreImages.includes(url)) {
        setFormData({ ...formData, moreImages: [...formData.moreImages, url] });
        toast.success("Image added to gallery!");
      } else {
        toast.error("Image already in gallery!");
      }
    }
    setIsLibraryOpen(false);
  };

  const handleMediaClick = (url: string) => {
    if (libraryTarget === 'main') {
      selectLibraryImage(url);
    } else {
      setSelectedLibraryUrls(prev => 
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
    }
  };

  const confirmLibrarySelection = () => {
    const newImages = [...formData.moreImages];
    let addedCount = 0;
    selectedLibraryUrls.forEach(url => {
      if (!newImages.includes(url)) {
        newImages.push(url);
        addedCount++;
      }
    });
    setFormData({ ...formData, moreImages: newImages });
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} image(s) to gallery!`);
    }
    setIsLibraryOpen(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    const uFormData = new FormData();
    uFormData.append("file", file);

    try {
      const response = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: uFormData
      });

      if (!response.ok) throw new Error("Upload failed");
      const resData = await response.json();
      updateVideoInGallery(resData.url);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload video file.");
    } finally {
      setIsUploadingVideo(false);
    }
  };
  const [formData, setFormData] = useState<any>({
    make: "",
    model: "",
    variant: "",
    year: new Date().getFullYear(),
    price: "",
    emi: "",
    km: "",
    fuelType: "Petrol",
    transmission: "Manual",
    location: "",
    image: "",
    listingType: "standard",
    isAssured: false,
    tag: "",
    badgeText: "",
    hub: "",
    ownership: "1st Owner",
    engineCapacity: "",
    regYear: new Date().getFullYear(),
    regState: "",
    spareKey: "Yes",
    insuranceStatus: "Active",
    color: "",
    bodyType: "",
    description: "",
    reasonsToBuy: [],
    specifications: [],
    features: {
      "Comfort & Convenience": [],
      "Safety": [],
      "Exterior": []
    },
    qualityReport: {
      summary: "",
      fullReportUrl: "",
      coreScore: "",
      supportingScore: "",
      interiorsScore: "",
      exteriorsScore: "",
      wearTearScore: ""
    },
    moreImages: [],
    videoUrl: "",
    status: "active"
  });

  useEffect(() => {
    if (isEdit) {
      fetchCar();
    }
    fetchBrands();
  }, [id]);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API}/api/brands`);
      if (res.ok) setBrandsList(await res.json());
    } catch (e) {
      console.error("Failed to load brands list");
    }
  };

  const fetchCar = async () => {
    try {
      const response = await fetch(`${API}/api/cars/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch car");
      const data = await response.json();
      
      // Ensure features object has correct structure
      let features = data.features;
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch(e) { features = {}; }
      }
      if (!features || typeof features !== 'object' || Array.isArray(features)) {
        features = { "Comfort & Convenience": [], "Safety": [], "Exterior": [] };
      }

      let moreImages = data.moreImages || [];
      if (data.videoUrl && !moreImages.includes(data.videoUrl)) {
        moreImages = [data.videoUrl, ...moreImages];
      }

      setFormData({
        ...data,
        listingType: data.listingType || data.listing_type || (data.tag && data.tag.toLowerCase().includes('luxury') ? "luxury" : "standard"),
        reasonsToBuy: data.reasonsToBuy || [],
        specifications: data.specifications || [],
        features: features,
        moreImages: moreImages,
        videoUrl: data.videoUrl || "",
        qualityReport: data.qualityReport || { summary: "", fullReportUrl: "", coreScore: "", supportingScore: "", interiorsScore: "", exteriorsScore: "", wearTearScore: "" }
      });

      if (data.videoUrl) {
        if (data.videoUrl.includes("youtube.com") || data.videoUrl.includes("youtu.be")) {
          setVideoSource("youtube");
        } else if (data.videoUrl.startsWith("/uploads")) {
          setVideoSource("upload");
        } else {
          setVideoSource("url");
        }
      }
    } catch (error) {
      toast.error("Error fetching car details");
      navigate("/cars");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-extract first video to sync with videoUrl field in database
    const firstVideo = formData.moreImages.find((url: string) => {
      const t = getMediaType(url);
      return t === 'video' || t === 'youtube';
    }) || "";

    const updatedFormData = {
      ...formData,
      videoUrl: firstVideo
    };

    const url = isEdit ? `${API}/api/cars/${id}` : `${API}/api/cars`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) throw new Error("Failed to save car");
      toast.success(isEdit ? "Car updated successfully" : "Car added successfully");
      navigate("/cars");
    } catch (error) {
      toast.error("Error saving car");
    }
  };

  const addItem = (key: string, defaultObj: any) => {
    setFormData({ ...formData, [key]: [...formData[key], defaultObj] });
  };

  const removeItem = (key: string, index: number) => {
    const list = [...formData[key]];
    list.splice(index, 1);
    setFormData({ ...formData, [key]: list });
  };

  const updateItem = (key: string, index: number, field: string, value: any) => {
    const list = [...formData[key]];
    list[index] = { ...list[index], [field]: value };
    setFormData({ ...formData, [key]: list });
  };

  const toggleFeature = (category: string, feature: string) => {
    const features = { ...formData.features };
    if (!features[category]) features[category] = [];
    
    if (features[category].includes(feature)) {
      features[category] = features[category].filter((f: string) => f !== feature);
    } else {
      features[category] = [...features[category], feature];
    }
    setFormData({ ...formData, features });
  };

  const FeatureCategory = ({ title, options }: { title: string, options: string[] }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      <h3 className="text-md font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <div 
              onClick={() => toggleFeature(title, opt)}
              className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                formData.features[title]?.includes(opt) 
                ? "bg-indigo-600 border-indigo-600 text-white" 
                : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
              }`}
            >
              {formData.features[title]?.includes(opt) && <CheckCircle2 size={12} />}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
        activeTab === id 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  if (loading) return (
    <>
      <PageMeta title="Loading Car Details... | Selectt Admin" description="Loading car details." />
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading car details...</p>
      </div>
    </>
  );

  const inpClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1";

  const filteredLibraryMedia = libraryMedia.filter((item: any) => {
    if (!librarySearch) return true;
    const filename = item.url.split('/').pop() || "";
    const alt = item.alt || "";
    const searchLower = librarySearch.toLowerCase();
    return filename.toLowerCase().includes(searchLower) || alt.toLowerCase().includes(searchLower);
  });

  const STEPS = [
    { id: "basic", step: 1, title: "1. Basic & Pricing", desc: "Overview, Price & Reasons", icon: Info },
    { id: "specs", step: 2, title: "2. Specs & History", desc: "Mileage, Owner & Tech Specs", icon: Cpu },
    { id: "features", step: 3, title: "3. Features & Quality", desc: "Checklist & Inspection", icon: CheckCircle2 },
    { id: "images", step: 4, title: "4. Photos & Media", desc: "Cover, Gallery & Video", icon: ImageIcon },
  ];

  const getStepIndex = (tab: string) => {
    if (tab === "basic" || tab === "reasons") return 0;
    if (tab === "specs") return 1;
    if (tab === "features" || tab === "report") return 2;
    if (tab === "images") return 3;
    return 0;
  };

  const currentStepIndex = getStepIndex(activeTab);

  return (
    <>
      <PageMeta 
        title={isEdit ? `Edit ${formData.make || ''} ${formData.model || ''} | Selectt Admin` : "Create New Listing | Selectt Admin"} 
        description="Manage Selectt car inventory listings." 
      />
      <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-24">
        {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/cars")}
            className="p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {isEdit ? "Edit Vehicle Listing" : "Create New Vehicle Listing"}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
              <span>Inventory</span>
              <ChevronRight size={14} />
              <span className="font-bold text-[#1C3EB9]">{formData.make} {formData.model || "New Car"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
            onClick={() => navigate("/cars")}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#1C3EB9] text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-[#00B49D] transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Save size={16} />
            {isEdit ? "Update Car" : "Publish Listing"}
          </button>
        </div>
      </div>

      {/* Step Progress & Tab Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 mb-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-black text-[#155DFC] uppercase tracking-wider block">
              Step {currentStepIndex + 1} of 4 Form Guide
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {STEPS[currentStepIndex].title} — <span className="text-slate-500 dark:text-gray-400 font-medium">{STEPS[currentStepIndex].desc}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-gray-300">
              {Math.round(((currentStepIndex + 1) / 4) * 100)}% Completed
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-5">
          <div 
            className="bg-[#155DFC] h-full transition-all duration-300 rounded-full shadow-xs" 
            style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
          />
        </div>

        {/* 4 Step Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s, idx) => {
            const isActive = currentStepIndex === idx;
            const isCompleted = currentStepIndex > idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                  isActive 
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-gray-800 dark:border-gray-700 shadow-md scale-[1.02]" 
                    : isCompleted 
                      ? "bg-emerald-50/70 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800/40"
                      : "bg-slate-50 dark:bg-gray-900/60 text-slate-500 border-slate-200/80 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                  isActive 
                    ? "bg-[#155DFC] text-white" 
                    : isCompleted 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs truncate leading-tight">{s.title.split('. ')[1]}</div>
                  <div className="text-[10px] opacity-75 truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-8 pb-44">
        {/* Basic Details & Pricing Section */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Overview & Pricing */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white dark:bg-gray-900 p-6 md:p-7 rounded-3xl shadow-xs border border-slate-200/80 dark:border-gray-800">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-gray-800">
                  <div className="w-1.5 h-5 bg-[#155DFC] rounded-full" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Vehicle Overview
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Make (Brand)</label>
                    <select 
                      className={inpClass} 
                      value={formData.make} 
                      onChange={e => {
                        const newMake = e.target.value;
                        setFormData({...formData, make: newMake, model: ""});
                      }}
                    >
                      <option value="">Select Brand...</option>
                      {brandsList.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Model</label>
                    <select 
                      className={inpClass} 
                      value={formData.model} 
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      disabled={!formData.make}
                    >
                      <option value="">Select Model...</option>
                      {brandsList.find(b => b.name === formData.make)?.models?.map((m:any) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Variant</label>
                    {(() => {
                      const selectedModelObj = brandsList.find(b => b.name === formData.make)?.models?.find((m: any) => m.name === formData.model);
                      const modelVariants = selectedModelObj?.variants || [];

                      return (
                        <div className="space-y-1.5">
                          {modelVariants.length > 0 && (
                            <select
                              className={inpClass}
                              value={formData.variant}
                              onChange={e => setFormData({ ...formData, variant: e.target.value })}
                            >
                              <option value="">Select Catalog Variant...</option>
                              {modelVariants.map((v: any) => (
                                <option key={v.id} value={v.name}>{v.name}</option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            className={inpClass}
                            value={formData.variant}
                            onChange={e => setFormData({ ...formData, variant: e.target.value })}
                            placeholder="e.g. SX (O) / Asta"
                          />
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className={labelClass}>Year (Manufacturing)</label>
                    <input type="number" className={inpClass} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2023" />
                  </div>

                  <div>
                    <label className={labelClass}>Reg. Year</label>
                    <input type="number" className={inpClass} value={formData.regYear || formData.year} onChange={e => setFormData({...formData, regYear: e.target.value})} placeholder="e.g. 2023" />
                  </div>

                  <div>
                    <label className={labelClass}>Fuel Type</label>
                    <select className={inpClass} value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                      {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Transmission</label>
                    <select className={inpClass} value={formData.transmission || "Automatic"} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                      {["Automatic", "Manual"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Body Type</label>
                    <select className={inpClass} value={formData.bodyType || ""} onChange={e => setFormData({...formData, bodyType: e.target.value})}>
                      <option value="">Select Body Type...</option>
                      {["Hatchback", "Sedan", "SUV", "MUV", "Luxury Sedan", "Luxury SUV"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Location (City)</label>
                    <input type="text" className={inpClass} value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Raipur, CG" />
                  </div>
                </div>

                {/* Pricing Subcard */}
                <div className="mt-7 pt-6 border-t border-slate-100 dark:border-gray-800 bg-blue-50/40 dark:bg-blue-950/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div className="flex items-center gap-2">
                      <IndianRupee size={18} className="text-[#155DFC]" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Pricing & Special Offer Overview</h3>
                    </div>
                    {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price || 0) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold w-fit">
                        🔥 Offer Active: ₹{(Number(formData.originalPrice) - Number(formData.price || 0)).toLocaleString('en-IN')} OFF ({Math.round(((Number(formData.originalPrice) - Number(formData.price || 0)) / Number(formData.originalPrice)) * 100)}%)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className={labelClass}>Original List Price (₹)</label>
                      <input 
                        type="number" 
                        className={inpClass} 
                        value={formData.originalPrice || formData.original_price || ""} 
                        onChange={e => {
                          const orig = e.target.value;
                          const currentPrice = formData.price;
                          setFormData({
                            ...formData, 
                            originalPrice: orig, 
                            original_price: orig,
                            offerPrice: currentPrice
                          });
                        }} 
                        placeholder="e.g. 1045000 (Strikethrough Price)" 
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Leave empty if no discount.</p>
                    </div>

                    <div>
                      <label className={labelClass}>Discount Type</label>
                      <select 
                        className={inpClass} 
                        value={formData.discountType || formData.discount_type || "none"}
                        onChange={e => {
                          const type = e.target.value;
                          setFormData({ ...formData, discountType: type, discount_type: type });
                        }}
                      >
                        <option value="none">No Discount (Standard Price)</option>
                        <option value="fixed">Fixed Amount (₹ OFF)</option>
                        <option value="percentage">Percentage (% OFF)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        {formData.discountType === 'percentage' || formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                      </label>
                      <input 
                        type="number" 
                        className={inpClass} 
                        value={formData.discountValue || formData.discount_value || ""} 
                        onChange={e => {
                          const val = e.target.value;
                          const orig = Number(formData.originalPrice || formData.original_price || formData.price || 0);
                          let newPrice = formData.price;
                          const dType = formData.discountType || formData.discount_type;
                          
                          if (dType === 'percentage' && orig > 0 && Number(val) > 0) {
                            newPrice = Math.round(orig * (1 - Number(val) / 100));
                          } else if (dType === 'fixed' && orig > 0 && Number(val) > 0) {
                            newPrice = Math.max(0, orig - Number(val));
                          }
                          setFormData({
                            ...formData, 
                            discountValue: val, 
                            discount_value: val,
                            price: newPrice,
                            offerPrice: newPrice
                          });
                        }} 
                        placeholder={formData.discountType === 'percentage' || formData.discount_type === 'percentage' ? 'e.g. 5 for 5% OFF' : 'e.g. 50000 for ₹50,000 OFF'} 
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Actual Selling Price (₹)</label>
                      <input 
                        type="number" 
                        className={`${inpClass} font-bold text-slate-900 dark:text-white bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800`} 
                        value={formData.price || ""} 
                        onChange={e => setFormData({ ...formData, price: e.target.value, offerPrice: e.target.value })} 
                        placeholder="e.g. 985000 (Final Customer Price)" 
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Final customer selling price displayed on frontend.</p>
                    </div>

                    <div>
                      <label className={labelClass}>EMI Starting (₹/mo)</label>
                      <input type="number" className={inpClass} value={formData.emi || ""} onChange={e => setFormData({ ...formData, emi: e.target.value })} placeholder="e.g. 9500" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Status & Badges */}
            <div className="space-y-6">
              <section className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-gray-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-gray-800">
                  <Tag size={16} className="text-[#155DFC]" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Listing Status</h2>
                </div>
                <div>
                  <select 
                    className={inpClass} 
                    value={formData.status || "in_stock"} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="in_stock">🟢 In Stock</option>
                    <option value="out_of_stock">🔴 Out of Stock</option>
                    <option value="booked">🟠 Booked</option>
                    <option value="sold_out">🏷️ Sold Out</option>
                    <option value="coming_soon">⏳ Coming Soon</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                    Controls visibility and stock badge on main website catalog.
                  </p>
                </div>
              </section>

              <section className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-gray-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-gray-800">
                  <ShieldCheck size={16} className="text-[#155DFC]" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Listing Category & Badges</h2>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Listing Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'standard' })}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        formData.listingType === 'standard' || !formData.listingType
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-black shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-extrabold">Standard</span>
                      <span className="text-[10px] text-slate-400 font-medium">Standard Inventory</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: 'luxury' })}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        formData.listingType === 'luxury'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-400 font-black shadow-xs ring-2 ring-amber-500/20'
                          : 'bg-slate-50 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-extrabold flex items-center gap-1">
                        <span>👑</span> Luxury
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Selectt Luxury</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Badge / Tag</label>
                  <input type="text" className={inpClass} value={formData.tag || ""} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. HOT DEAL" />
                </div>
                <div>
                  <label className={labelClass}>Top-Left Badge (Price Drop)</label>
                  <input type="text" className={inpClass} value={formData.badgeText || ""} onChange={e => setFormData({...formData, badgeText: e.target.value})} placeholder="e.g. ₹9,000 ↓" />
                </div>
              </section>

              <section className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#155DFC]" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Main Cover Image</h2>
                  </div>
                </div>

                <div className="aspect-video bg-slate-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700 overflow-hidden relative group">
                  {formData.image ? (
                    <>
                      <img src={formData.image.startsWith('/') ? `${API}${formData.image}` : formData.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button onClick={() => setFormData({...formData, image: ""})} className="p-2 bg-rose-600 text-white rounded-full cursor-pointer shadow-md">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-xs font-bold mt-2">No Image Selected</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-[#155DFC] px-3 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 cursor-pointer font-bold transition-all text-xs hover:bg-blue-100">
                    <span>{isUploadingImage ? "Uploading..." : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleImageUpload(e, 'main')}
                      className="hidden" 
                      disabled={isUploadingImage}
                    />
                  </label>
                  <button 
                    type="button"
                    onClick={() => openMediaLibrary('main')}
                    className="flex-1 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 font-bold transition-all text-xs hover:bg-slate-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Media Library
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Reasons to Buy Section */}
        {activeTab === "reasons" && (
          <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-800 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Reasons to Buy
              </h2>
              <button 
                onClick={() => addItem("reasonsToBuy", { title: "", description: "", icon: "Diamond" })}
                className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
              >
                <Plus size={18} /> Add Reason
              </button>
            </div>

            <div className="space-y-4">
              {formData.reasonsToBuy.length === 0 && (
                <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  No reasons added yet. Click "+ Add Reason" to start.
                </div>
              )}
              {formData.reasonsToBuy.map((reason: any, idx: number) => (
                <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl relative group border border-transparent hover:border-indigo-200 transition-all">
                  <button 
                    onClick={() => removeItem("reasonsToBuy", idx)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className={labelClass}>Icon Type</label>
                      <select className={inpClass} value={reason.icon} onChange={e => updateItem("reasonsToBuy", idx, "icon", e.target.value)}>
                        <option value="Diamond">Diamond</option>
                        <option value="Shield">Shield</option>
                        <option value="Battery">Battery</option>
                        <option value="History">History</option>
                      </select>
                    </div>
                    <div className="md:col-span-3 space-y-4">
                      <div>
                        <label className={labelClass}>Highlight (Title)</label>
                        <input 
                          type="text" 
                          className={inpClass} 
                          value={reason.title} 
                          onChange={e => updateItem("reasonsToBuy", idx, "title", e.target.value)} 
                          placeholder="e.g. Rarely priced well-maintained car"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Subtitle (Description)</label>
                        <textarea 
                          className={inpClass + " min-h-[60px] resize-none"} 
                          value={reason.description} 
                          onChange={e => updateItem("reasonsToBuy", idx, "description", e.target.value)} 
                          placeholder="e.g. Priced ₹2.5L lower than market"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Specifications Section */}
        {activeTab === "specs" && (
          <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-800 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Technical Specifications
              </h2>
              <button 
                onClick={() => addItem("specifications", { label: "", value: "", icon: "Gauge" })}
                className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
              >
                <Plus size={18} /> Add Spec
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.specifications.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  No technical specs added yet.
                </div>
              )}
              {formData.specifications.map((spec: any, idx: number) => (
                <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl relative group border border-transparent hover:border-indigo-200 transition-all flex gap-4">
                   <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          className={inpClass} 
                          value={spec.label} 
                          onChange={e => updateItem("specifications", idx, "label", e.target.value)} 
                          placeholder="Label (e.g. Mileage)"
                        />
                        <input 
                          type="text" 
                          className={inpClass} 
                          value={spec.value} 
                          onChange={e => updateItem("specifications", idx, "value", e.target.value)} 
                          placeholder="Value (e.g. 18.5 kmpl)"
                        />
                      </div>
                   </div>
                   <button 
                    onClick={() => removeItem("specifications", idx)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        {activeTab === "features" && (
          <div className="max-w-5xl mx-auto">
            <FeatureCategory 
              title="Comfort & Convenience" 
              options={["Air Conditioner", "Power Windows", "Adjustable Seats", "Keyless Entry", "Cruise Control", "Sunroof", "Panoramic Sunroof", "Ventilated Seats", "Rear AC Vents", "Automatic Climate Control"]} 
            />
            <FeatureCategory 
              title="Safety" 
              options={["Anti-Lock Braking System", "Brake Assist", "Central Locking", "Child Safety Locks", "Airbags", "EBD", "Tyre Pressure Monitor", "Rear Camera"]} 
            />
            <FeatureCategory 
              title="Exterior" 
              options={["Fog Lights", "Alloy Wheels", "Rear Spoiler", "Moonroof", "LED Headlights", "Roof Rails", "Turn Indicators on ORVM"]} 
            />
          </div>
        )}

        {/* Gallery Section */}
        {activeTab === "images" && (
          <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-800 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Image Gallery
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {/* Upload from Computer */}
                <label className="flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 cursor-pointer font-bold transition-all text-xs hover:bg-indigo-100 select-none">
                  <span>{isUploadingImage ? "Uploading..." : "Upload Local"}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    multiple
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                    disabled={isUploadingImage}
                  />
                </label>

                {/* Media Library */}
                <button
                  type="button"
                  onClick={() => openMediaLibrary('gallery')}
                  className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold transition-all text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Media Library
                </button>

                {/* URL Input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="image-url-input"
                    className={inpClass + " w-48 md:w-64"} 
                    placeholder="Paste image URL..." 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const url = (e.currentTarget as HTMLInputElement).value;
                        if (url) {
                          setFormData({...formData, moreImages: [...formData.moreImages, url]});
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('image-url-input') as HTMLInputElement;
                      if (input.value) {
                        setFormData({...formData, moreImages: [...formData.moreImages, input.value]});
                        input.value = "";
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.moreImages.map((img: string, idx: number) => {
                const mediaType = getMediaType(img);
                const isDragging = draggedIndex === idx;
                return (
                  <div 
                    key={img} 
                    className={`aspect-video bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden relative group border transition-all cursor-move select-none ${
                      isDragging 
                        ? 'border-indigo-500 scale-95 opacity-50 shadow-inner' 
                        : 'border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                     {mediaType === 'video' ? (
                       <div className="w-full h-full bg-[#0C1B33] flex flex-col items-center justify-center text-white text-[10px] font-bold p-3">
                         <span className="text-lg">▶</span>
                         <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 mt-1">Walkaround Video</span>
                         <span className="text-[7px] text-gray-400 mt-1 font-mono text-center truncate w-full">{img}</span>
                       </div>
                     ) : mediaType === 'youtube' ? (
                       <div className="w-full h-full bg-[#FF0000] flex flex-col items-center justify-center text-white text-[10px] font-bold p-3">
                         <span className="text-lg">▶</span>
                         <span className="text-[9px] uppercase tracking-wider font-extrabold mt-1">YouTube Link</span>
                         <span className="text-[7px] text-gray-200 mt-1 font-mono text-center truncate w-full">{img}</span>
                       </div>
                     ) : (
                       <img src={img} className="w-full h-full object-cover pointer-events-none" />
                     )}
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                        <button 
                          type="button"
                          onClick={() => {
                            const newer = [...formData.moreImages];
                            newer.splice(idx, 1);
                            const isVid = mediaType === 'video' || mediaType === 'youtube';
                            setFormData({
                              ...formData,
                              moreImages: newer,
                              videoUrl: isVid ? "" : formData.videoUrl
                            });
                          }}
                          className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                        >
                          <Trash2 size={20} />
                        </button>
                     </div>
                  </div>
                );
              })}
              {formData.moreImages.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  No additional images or videos added.
                </div>
              )}
            </div>
                        {/* Walkaround Video Section */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-6">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Walkaround Video
              </h2>
              
              {/* Source Type Selector */}
              <div className="flex gap-4 mb-6">
                {[
                  { id: "upload", label: "Upload Video" },
                  { id: "youtube", label: "YouTube Link" },
                  { id: "url", label: "Direct Video URL" }
                ].map(src => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setVideoSource(src.id as any);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      videoSource === src.id 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-4">
                  {videoSource === "upload" && (
                    <div className="space-y-2">
                      <label className={labelClass}>Upload Local MP4/MOV File</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 px-6 py-3 rounded-xl border border-indigo-200 cursor-pointer font-bold transition-all text-sm">
                          <Plus size={18} />
                          {isUploadingVideo ? "Uploading..." : "Choose Video File"}
                          <input 
                            type="file" 
                            accept="video/mp4,video/quicktime" 
                            className="hidden" 
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo}
                          />
                        </label>
                        {formData.videoUrl && formData.videoUrl.startsWith('/uploads') && (
                          <span className="text-xs text-green-600 font-medium">✓ Video ready</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Supports standard MP4 and MOV files. Max file size depends on your local configuration.
                      </p>
                    </div>
                  )}

                    {videoSource === "youtube" && (
                      <div className="space-y-2">
                        <label className={labelClass}>YouTube Video URL</label>
                        <input 
                          type="text" 
                          className={inpClass} 
                          value={formData.videoUrl || ""} 
                          onChange={e => updateVideoInGallery(e.target.value)} 
                          placeholder="https://www.youtube.com/watch?v=..." 
                        />
                        <p className="text-[11px] text-gray-400">
                          Paste a full YouTube link or mobile short link.
                        </p>
                      </div>
                    )}

                    {videoSource === "url" && (
                      <div className="space-y-2">
                        <label className={labelClass}>Direct Video Link URL</label>
                        <input 
                          type="text" 
                          className={inpClass} 
                          value={formData.videoUrl || ""} 
                          onChange={e => updateVideoInGallery(e.target.value)} 
                          placeholder="https://example.com/videos/car_video.mp4" 
                        />
                        <p className="text-[11px] text-gray-400">
                          Paste any online direct video file path (.mp4, .mov, etc).
                        </p>
                      </div>
                    )}

                    {formData.videoUrl && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700/50 flex items-center justify-between">
                        <div className="truncate pr-4 flex-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-0.5">Active Video Path</span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate block">{formData.videoUrl}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => updateVideoInGallery("")}
                          className="text-red-500 hover:text-red-700 p-2 font-bold text-xs uppercase shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-1">
                  <label className={labelClass}>Video Preview</label>
                  <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden relative flex items-center justify-center">
                    {formData.videoUrl ? (
                      videoSource === "youtube" && getYouTubeId(formData.videoUrl) ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYouTubeId(formData.videoUrl)}`}
                          className="w-full h-full"
                          allowFullScreen
                          frameBorder="0"
                        />
                      ) : (
                        <video 
                          src={formData.videoUrl.startsWith('/') ? `${API}${formData.videoUrl}` : formData.videoUrl} 
                          className="w-full h-full object-cover" 
                          controls 
                          key={formData.videoUrl}
                        />
                      )
                    ) : (
                      <span className="text-xs text-gray-400 font-bold">No Video Configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quality Report Section */}
        {activeTab === "report" && (
          <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-800 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Expert Quality Report
            </h2>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Expert Summary</label>
                <textarea 
                  className={inpClass + " min-h-[120px]"} 
                  value={formData.qualityReport.summary} 
                  onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, summary: e.target.value}})}
                  placeholder="e.g. 1452 parts evaluated. Core structure intact. No flood damage found."
                />
              </div>
              <div>
                <label className={labelClass}>Full Report PDF/Link URL</label>
                <input 
                  type="text" 
                  className={inpClass} 
                  value={formData.qualityReport.fullReportUrl} 
                  onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, fullReportUrl: e.target.value}})}
                  placeholder="https://selecttcars.com/reports/car-123"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quality Scores (out of 10)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Core Systems</label>
                    <input type="number" step="0.1" max="10" className={inpClass} value={formData.qualityReport.coreScore || ""} onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, coreScore: e.target.value}})} placeholder="e.g. 9.9" />
                  </div>
                  <div>
                    <label className={labelClass}>Supporting Systems</label>
                    <input type="number" step="0.1" max="10" className={inpClass} value={formData.qualityReport.supportingScore || ""} onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, supportingScore: e.target.value}})} placeholder="e.g. 9.5" />
                  </div>
                  <div>
                    <label className={labelClass}>Interiors & AC</label>
                    <input type="number" step="0.1" max="10" className={inpClass} value={formData.qualityReport.interiorsScore || ""} onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, interiorsScore: e.target.value}})} placeholder="e.g. 9.6" />
                  </div>
                  <div>
                    <label className={labelClass}>Exteriors & Lights</label>
                    <input type="number" step="0.1" max="10" className={inpClass} value={formData.qualityReport.exteriorsScore || ""} onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, exteriorsScore: e.target.value}})} placeholder="e.g. 9.2" />
                  </div>
                  <div>
                    <label className={labelClass}>Wear & Tear Parts</label>
                    <input type="number" step="0.1" max="10" className={inpClass} value={formData.qualityReport.wearTearScore || ""} onChange={e => setFormData({...formData, qualityReport: {...formData.qualityReport, wearTearScore: e.target.value}})} placeholder="e.g. 8.7" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Media Library Selector Modal */}
        {isLibraryOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Select from Media Library</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click an image or video to select it for the car listing.</p>
                </div>
                
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search media by name..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-gray-900 dark:text-white"
                  />
                  {librarySearch && (
                    <button
                      onClick={() => setLibrarySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setIsLibraryOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Grid of Images */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {libraryLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-gray-400 text-sm font-bold">Scanning media...</p>
                  </div>
                ) : libraryMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <ImageIcon className="text-gray-300 dark:text-gray-700 mb-4" size={48} />
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No media found</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Upload images via the Media Library menu first, or upload local files.</p>
                  </div>
                ) : filteredLibraryMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Search className="text-gray-350 dark:text-gray-650 mb-4" size={48} />
                    <h4 className="text-sm font-bold text-gray-850 dark:text-gray-250">No matching media found</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">We couldn't find any images or videos matching "{librarySearch}".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {filteredLibraryMedia.map((item: any, idx: number) => {
                      const filename = item.url.split('/').pop() || "";
                      const isVideo = item.url.split('.').pop()?.toLowerCase() === 'mp4' || item.url.split('.').pop()?.toLowerCase() === 'mov';
                      const isSelected = selectedLibraryUrls.includes(item.url);
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleMediaClick(item.url)}
                          className="group cursor-pointer flex flex-col gap-1.5 relative"
                        >
                          <div className={`aspect-video bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden relative border transition-all flex items-center justify-center ${
                            isSelected 
                              ? 'border-indigo-650 dark:border-indigo-550 ring-2 ring-indigo-500/30 shadow-md' 
                              : 'border-gray-200 dark:border-gray-800 group-hover:border-indigo-500 group-hover:shadow-md'
                          }`}>
                            {isVideo ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white relative">
                                <Play size={18} className="fill-white" />
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-400 mt-1">Video</span>
                              </div>
                            ) : (
                              <img 
                                src={`${API}${item.thumbnailUrl || item.url}`} 
                                alt={item.alt || filename} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                loading="lazy"
                              />
                            )}

                            {/* Checkbox badge in top-right for gallery multiple selection */}
                            {libraryTarget === 'gallery' && (
                              <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white scale-100 shadow-sm shadow-indigo-500/30' 
                                  : 'bg-black/45 text-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 border border-white/20'
                              }`}>
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {/* File Details Label */}
                          <div className="px-1 flex flex-col gap-0.5">
                            <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300 truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={filename}>
                              {filename}
                            </span>
                            {item.alt && (
                              <span className="text-[8px] text-gray-400 dark:text-gray-500 truncate block" title={item.alt}>
                                {item.alt}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-850">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                  {libraryTarget === 'gallery' && selectedLibraryUrls.length > 0 && (
                    <span>{selectedLibraryUrls.length} item(s) selected</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsLibraryOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  {libraryTarget === 'gallery' && (
                    <button
                      type="button"
                      onClick={confirmLibrarySelection}
                      disabled={selectedLibraryUrls.length === 0}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-500/10 cursor-pointer"
                    >
                      Add Selected ({selectedLibraryUrls.length})
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Step Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-gray-800 py-3.5 px-4 md:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (currentStepIndex > 0) setActiveTab(STEPS[currentStepIndex - 1].id);
            }}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            ← Previous Step
          </button>

          <div className="flex items-center gap-3">
            {currentStepIndex < 3 && (
              <button
                onClick={() => setActiveTab(STEPS[currentStepIndex + 1].id)}
                className="flex items-center gap-1.5 bg-[#155DFC] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
              >
                <span>Next Step: {STEPS[currentStepIndex + 1].title.split('. ')[1]}</span>
                <ChevronRight size={16} />
              </button>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Save size={16} />
              <span>{isEdit ? "Update Car" : "Publish Listing"}</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default CarEditPage;

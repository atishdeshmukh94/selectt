import React, { useState, useEffect, useRef } from "react";
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
  Tag,
  Star,
  Video,
  CheckCircle,
  Clock,
  AlertCircle,
  UploadCloud,
  Car,
  ExternalLink,
  FileText,
  Upload
} from "lucide-react";

import { API_URL } from "../config/api";
import PageMeta from "../components/common/PageMeta";
const API = API_URL;

const CarEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [videoSource, setVideoSource] = useState<"upload" | "youtube" | "url">("upload");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadSpeed, setVideoUploadSpeed] = useState("");
  const [videoUploadEta, setVideoUploadEta] = useState("");
  const [videoUploadSizeInfo, setVideoUploadSizeInfo] = useState("");
  const [videoUploadStatus, setVideoUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [videoUploadFileName, setVideoUploadFileName] = useState("");
  const [videoUploadError, setVideoUploadError] = useState("");
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomVariant, setIsCustomVariant] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<'main' | 'gallery'>('main');
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<string[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [altMap, setAltMap] = useState<Record<string, string>>({});
  const [altModalImage, setAltModalImage] = useState<string | null>(null);
  const [altModalText, setAltModalText] = useState("");
  const [isSavingAlt, setIsSavingAlt] = useState(false);

  const fetchAltTags = async () => {
    try {
      const res = await fetch(`${API}/api/media/alt`);
      if (res.ok) {
        const data = await res.json();
        setAltMap(data || {});
      }
    } catch (e) {
      console.warn("Failed to fetch alt tags", e);
    }
  };

  const handleOpenAltModal = (img: string) => {
    setAltModalImage(img);
    setAltModalText(altMap[img] || "");
  };

  const handleSaveAltText = async () => {
    if (!altModalImage) return;
    setIsSavingAlt(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
      const res = await fetch(`${API}/api/media/alt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          filePath: altModalImage,
          altText: altModalText.trim()
        })
      });
      if (res.ok) {
        const trimmed = altModalText.trim();
        setAltMap(prev => ({ ...prev, [altModalImage]: trimmed }));
        toast.success("Alt text saved successfully!");
        setAltModalImage(null);
      } else {
        toast.error("Failed to save alt text");
      }
    } catch (e) {
      toast.error("Error saving alt text");
    } finally {
      setIsSavingAlt(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }

    setUploadingPdf(true);
    const uploadToast = toast.loading('Uploading inspection PDF report...');
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
      const uFormData = new FormData();
      uFormData.append("file", file);

      const response = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uFormData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to upload PDF");
      }

      const data = await response.json();
      const uploadedUrl = data.url || data.path || "";
      if (!uploadedUrl) throw new Error("No URL returned from upload server");

      setFormData((prev: any) => ({
        ...prev,
        qualityReport: {
          ...(prev?.qualityReport || {}),
          fullReportUrl: uploadedUrl
        }
      }));

      toast.dismiss(uploadToast);
      toast.success("✅ Inspection PDF report uploaded successfully!");
    } catch (err: any) {
      toast.dismiss(uploadToast);
      toast.error(err.message || "Error uploading inspection report PDF");
    } finally {
      setUploadingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit';
    carTitle: string;
    carPrice: string;
    carImage: string;
    carId?: string | number;
    make?: string;
    model?: string;
    variant?: string;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const slugify = (text: string) => {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const resolveAdminImgUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    if (cleanPath.startsWith("/uploads/")) return `https://api.selectt.in${cleanPath}`;
    return `https://selectt.in${cleanPath}`;
  };

  const getCarLiveUrl = (carId?: string | number, make?: string, model?: string, variant?: string) => {
    if (!carId) return 'https://selectt.in/buy-cars';
    const sMake = slugify(make || 'car');
    const sModel = slugify(model || 'model');
    const sVariant = slugify(variant || 'details');
    return `https://selectt.in/car/${sMake}/${sModel}/${sVariant}/${carId}`;
  };

  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0 || !successModal?.isOpen) {
      if (redirectCountdown === 0 && successModal?.isOpen) {
        navigate("/cars");
      }
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, successModal, navigate]);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getMediaType = (url: string) => {
    if (!url) return 'image';
    if (typeof url !== 'string') return 'image';
    const trimmed = url.trim();
    if (trimmed.includes('iframe.mediadelivery.net') || trimmed.includes('video.bunnycdn.com') || trimmed.includes('b-cdn.net') || trimmed.includes('bunnycdn.com') || /^[0-9a-fA-F-]{36}$/.test(trimmed)) {
      return 'bunny_stream';
    }
    const cleanUrl = trimmed.split('?')[0];
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.MP4') || cleanUrl.endsWith('.MOV') || cleanUrl.endsWith('.webm')) {
      return 'video';
    }
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      return 'youtube';
    }
    return 'image';
  };

  const updateVideoInGallery = (newUrl: string) => {
    // Strip all video URLs from moreImages so photos gallery remains pure photos
    const cleanImages = formData.moreImages.filter((img: string) => {
      const t = getMediaType(img);
      return t === 'image';
    });
    setFormData({
      ...formData,
      videoUrl: newUrl.trim(),
      moreImages: cleanImages
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
          const firstRealImg = newImages.find(u => getMediaType(u) === 'image') || '';
          setFormData({ 
            ...formData, 
            moreImages: newImages, 
            image: formData.image || firstRealImg 
          });
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
      toast.success("Main cover image set from library!");
    } else {
      if (!formData.moreImages.includes(url)) {
        const updatedImages = [...formData.moreImages, url];
        const firstRealImg = updatedImages.find(u => getMediaType(u) === 'image') || '';
        setFormData({ 
          ...formData, 
          moreImages: updatedImages,
          image: formData.image || firstRealImg
        });
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
    const firstRealImg = newImages.find(u => getMediaType(u) === 'image') || '';
    setFormData({ 
      ...formData, 
      moreImages: newImages,
      image: formData.image || firstRealImg
    });
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} image(s) to gallery!`);
    }
    setIsLibraryOpen(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);
    setVideoUploadStatus('uploading');
    setVideoUploadFileName(file.name);
    setVideoUploadError('');
    setVideoUploadSpeed('0 KB/s');
    setVideoUploadEta('Calculating...');

    const uFormData = new FormData();
    uFormData.append("file", file);

    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setVideoUploadProgress(percent);

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        if (elapsedSeconds > 0.3) {
          const bytesPerSec = event.loaded / elapsedSeconds;
          const speedMb = (bytesPerSec / (1024 * 1024)).toFixed(1);
          setVideoUploadSpeed(`${speedMb} MB/s`);

          const remainingBytes = event.total - event.loaded;
          const etaSec = Math.round(remainingBytes / bytesPerSec);
          setVideoUploadEta(etaSec > 0 ? `~${etaSec}s remaining` : 'Finalizing...');

          const loadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (event.total / (1024 * 1024)).toFixed(1);
          setVideoUploadSizeInfo(`${loadedMb} MB / ${totalMb} MB`);
        }

        if (percent >= 100) {
          setVideoUploadStatus('processing');
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resData = JSON.parse(xhr.responseText);
          const uploadedUrl = resData.url || resData.videoUrl || resData.path;
          updateVideoInGallery(uploadedUrl);
          setVideoUploadStatus('success');
          setVideoUploadProgress(100);
          toast.success("Video uploaded successfully!");
          setTimeout(() => {
            setIsUploadingVideo(false);
          }, 3500);
        } catch (err) {
          setVideoUploadStatus('error');
          setVideoUploadError('Invalid response from server');
          toast.error("Failed to process uploaded video.");
          setIsUploadingVideo(false);
        }
      } else {
        setVideoUploadStatus('error');
        setVideoUploadError(`Upload failed with status ${xhr.status}`);
        toast.error("Failed to upload video file.");
        setIsUploadingVideo(false);
      }
    };

    xhr.onerror = () => {
      setVideoUploadStatus('error');
      setVideoUploadError('Network connection error during upload');
      toast.error("Network error during video upload.");
      setIsUploadingVideo(false);
    };

    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    xhr.open("POST", `${API}/api/upload`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(uFormData);
  };
  const [formData, setFormData] = useState<any>({
    title: "",
    make: "",
    model: "",
    variant: "",
    year: new Date().getFullYear(),
    mfgMonth: "",
    price: "",
    emi: "",
    km: "",
    fuelType: "Petrol",
    transmission: "Manual",
    location: "",
    rto_code: "",
    image: "",
    listingType: "standard",
    isAssured: false,
    tag: "",
    badgeText: "",
    hub: "",
    ownership: "1st Owner",
    engineCapacity: "",
    regYear: new Date().getFullYear(),
    regMonth: "",
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
      subtitle: "1452 parts evaluated by 5 automotive experts",
      meterTampered: true,
      nonFlooded: true,
      coreStructureIntact: true,
      coreScore: "9.9",
      coreLabel: "Excellent",
      supportingScore: "9.5",
      supportingLabel: "Excellent",
      interiorsScore: "9.6",
      interiorsLabel: "Excellent",
      exteriorsScore: "9.2",
      exteriorsLabel: "Excellent",
      wearTearScore: "8.7",
      wearTearLabel: "Good",
      nextServiceText: "Next service due after 12 months or 10,000 km",
      fullReportUrl: ""
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
    fetchAltTags();
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
      if (data.mediaAlt && typeof data.mediaAlt === 'object') {
        setAltMap(prev => ({ ...prev, ...data.mediaAlt }));
      }
      
      // Ensure features object has correct structure
      let features = data.features;
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch(e) { features = {}; }
      }
      if (!features || typeof features !== 'object' || Array.isArray(features)) {
        features = { "Comfort & Convenience": [], "Safety": [], "Exterior": [] };
      }

      // Feature name migration for existing cars (e.g. car 41)
      if (features && typeof features === 'object') {
        const featureNameMap: Record<string, string> = {
          "Anti-Lock Braking System": "ABS System",
          "Brake Assist": "Hill Assist",
          "Tyre Pressure Monitor": "TPMS Monitoring",
          "Rear Camera": "360° Camera",
          "Child Safety Locks": "Cruise Control",
        };

        if (Array.isArray(features["Safety"])) {
          features["Safety"] = features["Safety"].map((item: string) => featureNameMap[item] || item);
        }

        if (Array.isArray(features["Comfort & Convenience"])) {
          features["Comfort & Convenience"] = features["Comfort & Convenience"].map((item: string) => {
            if (item === "Cruise Control") {
              if (Array.isArray(features["Safety"]) && !features["Safety"].includes("Cruise Control")) {
                features["Safety"].push("Cruise Control");
              }
              return "Wireless Charging";
            }
            return item;
          });
        }
      }

      let moreImages = data.moreImages || [];
      if (data.videoUrl && !moreImages.includes(data.videoUrl)) {
        moreImages = [data.videoUrl, ...moreImages];
      }

      const carYear = data.year ? Number(data.year) : new Date().getFullYear();
      const autoDefaultTitle = `${carYear} ${data.make || ''} ${data.model || ''} ${data.variant || ''}`.replace(/\s+/g, ' ').trim();
      setFormData({
        ...data,
        title: data.title || autoDefaultTitle,
        make: data.make || "",
        model: data.model || "",
        variant: data.variant || "",
        year: carYear,
        mfgMonth: data.mfgMonth || data.mfg_month || "",
        regYear: data.regYear ? Number(data.regYear) : (data.reg_year ? Number(data.reg_year) : carYear),
        regMonth: data.regMonth || data.reg_month || "",
        regState: data.regState || data.reg_state || "MH",
        bodyType: data.bodyType || data.body_type || "Hatchback",
        fuelType: data.fuelType || data.fuel_type || "Petrol",
        transmission: data.transmission || "Manual",
        location: data.location || "Mumbai",
        rto_code: data.rto_code || data.rto || (data.registration_no ? data.registration_no.slice(0, 4).toUpperCase() : ""),
        price: data.price !== undefined && data.price !== null ? data.price : "",
        km: data.km !== undefined && data.km !== null ? data.km : 0,
        ownership: data.ownership || "1st Owner",
        listingType: data.listingType || data.listing_type || (data.tag && data.tag.toLowerCase().includes('luxury') ? "luxury" : "standard"),
        reasonsToBuy: data.reasonsToBuy || [],
        specifications: data.specifications || [],
        features: features,
        moreImages: moreImages,
        videoUrl: data.videoUrl || "",
        qualityReport: {
          summary: data.qualityReport?.summary || "",
          subtitle: data.qualityReport?.subtitle || "1452 parts evaluated by 5 automotive experts",
          meterTampered: data.qualityReport?.meterTampered !== undefined ? (data.qualityReport.meterTampered !== false && data.qualityReport.meterTampered !== "false") : true,
          nonFlooded: data.qualityReport?.nonFlooded !== undefined ? (data.qualityReport.nonFlooded !== false && data.qualityReport.nonFlooded !== "false") : true,
          coreStructureIntact: data.qualityReport?.coreStructureIntact !== undefined ? (data.qualityReport.coreStructureIntact !== false && data.qualityReport.coreStructureIntact !== "false") : true,
          coreScore: data.qualityReport?.coreScore || "9.9",
          coreLabel: data.qualityReport?.coreLabel || "Excellent",
          supportingScore: data.qualityReport?.supportingScore || "9.5",
          supportingLabel: data.qualityReport?.supportingLabel || "Excellent",
          interiorsScore: data.qualityReport?.interiorsScore || "9.6",
          interiorsLabel: data.qualityReport?.interiorsLabel || "Excellent",
          exteriorsScore: data.qualityReport?.exteriorsScore || "9.2",
          exteriorsLabel: data.qualityReport?.exteriorsLabel || "Excellent",
          wearTearScore: data.qualityReport?.wearTearScore || "8.7",
          wearTearLabel: data.qualityReport?.wearTearLabel || "Good",
          nextServiceText: data.qualityReport?.nextServiceText || "Next service due after 12 months or 10,000 km",
          fullReportUrl: data.qualityReport?.fullReportUrl || ""
        }
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    // 1. Mandatory Validation Checks - Step 1 (Basic & Pricing)
    if (!formData.make || !String(formData.make).trim()) {
      toast.error("Please select or enter the Brand (Make) in Step 1");
      setActiveTab("basic");
      return;
    }

    if (!formData.model || !String(formData.model).trim()) {
      toast.error("Please select or enter the Model in Step 1");
      setActiveTab("basic");
      return;
    }

    const finalYear = formData.year ? Number(formData.year) : new Date().getFullYear();
    if (!finalYear || isNaN(finalYear) || finalYear < 1990) {
      toast.error("Please enter a valid Manufacturing Year in Step 1");
      setActiveTab("basic");
      return;
    }

    const finalRtoCode = formData.rto_code ? String(formData.rto_code).trim().toUpperCase() : "";
    if (!finalRtoCode) {
      toast.error("Please enter a valid RTO Code in Step 2 (e.g. MH01, DL3C)");
      setActiveTab("specs");
      return;
    }

    const finalRegYear = formData.regYear ? Number(formData.regYear) : finalYear;
    const finalRegState = finalRtoCode.length >= 2 ? finalRtoCode.slice(0, 2) : "MH";
    const finalBodyType = (formData.bodyType && String(formData.bodyType).trim()) ? String(formData.bodyType).trim() : "Hatchback";
    const finalFuelType = (formData.fuelType && String(formData.fuelType).trim()) ? String(formData.fuelType).trim() : "Petrol";
    const finalTransmission = (formData.transmission && String(formData.transmission).trim()) ? String(formData.transmission).trim() : "Manual";
    const finalLocation = (formData.location && String(formData.location).trim()) ? String(formData.location).trim() : "Mumbai";
    const finalOwnership = (formData.ownership && String(formData.ownership).trim()) ? String(formData.ownership).trim() : "1st Owner";
    const finalKm = (formData.km !== undefined && formData.km !== "" && !isNaN(Number(formData.km))) ? Number(formData.km) : 0;

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error("Please enter a valid Selling Price in Step 1");
      setActiveTab("basic");
      return;
    }

    // 3. Mandatory Validation Checks - Step 4 (Photos & Media)
    const firstImage = (formData.moreImages || []).find((url: string) => {
      return getMediaType(url) === 'image';
    }) || "";
    const primaryCover = formData.image || firstImage || "/img/suv.png";

    // Auto-extract first video to sync with videoUrl field in database
    const firstVideo = (formData.moreImages || []).find((url: string) => {
      const t = getMediaType(url);
      return t === 'video' || t === 'youtube';
    }) || formData.videoUrl || "";

    const finalTitle = (formData.title && String(formData.title).trim())
      ? String(formData.title).trim()
      : `${finalYear} ${String(formData.make).trim()} ${String(formData.model).trim()} ${formData.variant ? String(formData.variant).trim() : ''}`.replace(/\s+/g, ' ').trim();

    const updatedFormData = {
      ...formData,
      title: finalTitle,
      year: finalYear,
      mfgMonth: formData.mfgMonth || "",
      mfg_month: formData.mfgMonth || "",
      regYear: finalRegYear,
      regMonth: formData.regMonth || "",
      reg_month: formData.regMonth || "",
      regState: finalRegState,
      bodyType: finalBodyType,
      fuelType: finalFuelType,
      transmission: finalTransmission,
      location: finalLocation,
      hub: finalLocation,
      rto_code: formData.rto_code ? String(formData.rto_code).trim().toUpperCase() : "",
      rto: formData.rto_code ? String(formData.rto_code).trim().toUpperCase() : "",
      ownership: finalOwnership,
      km: finalKm,
      image: primaryCover,
      videoUrl: firstVideo
    };

    const url = isEdit ? `${API}/api/cars/${id}` : `${API}/api/cars`;
    const method = isEdit ? "PUT" : "POST";

    setIsSaving(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Failed to save car (HTTP ${response.status})`);
      }

      const resData = await response.json().catch(() => ({}));
      const carId = isEdit ? id : (resData.id || resData.insertId || resData.carId || "");

      toast.success(isEdit ? "Listing saved successfully!" : "New car listed successfully!");

      setSuccessModal({
        isOpen: true,
        type: isEdit ? 'edit' : 'create',
        carTitle: finalTitle,
        carPrice: String(formData.price || 0),
        carImage: primaryCover,
        carId,
        make: formData.make,
        model: formData.model,
        variant: formData.variant || formData.title,
      });

      if (!isEdit) {
        setRedirectCountdown(4);
      }
    } catch (error: any) {
      console.error("Error saving car:", error);
      toast.error(error.message || "Error saving car");
    } finally {
      setIsSaving(false);
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
        {options.map(opt => {
          const isSelected = formData.features[title]?.includes(opt);
          return (
            <div 
              key={opt} 
              onClick={() => toggleFeature(title, opt)}
              className="flex items-center gap-2.5 cursor-pointer group select-none py-1 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <div 
                className={`w-5 h-5 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                  isSelected 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                  : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400 bg-white dark:bg-gray-800"
                }`}
              >
                {isSelected && <CheckCircle2 size={13} />}
              </div>
              <span className={`text-sm transition-colors ${isSelected ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}`}>
                {opt}
              </span>
            </div>
          );
        })}
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
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#1C3EB9] text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-[#00B49D] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Listing...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEdit ? "Update Car" : "Publish Listing"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress & Tab Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 mb-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-[#155DFC] uppercase tracking-wider block">
              Step {currentStepIndex + 1} of 4 Form Guide
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug">
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
                    ? "bg-[#155DFC] text-white border-[#155DFC] shadow-lg shadow-blue-500/25 scale-[1.02]" 
                    : isCompleted 
                      ? "bg-emerald-50/70 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800/40"
                      : "bg-slate-50 dark:bg-gray-900/60 text-slate-500 border-slate-200/80 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                  isActive 
                    ? "bg-white text-[#155DFC] shadow-xs" 
                    : isCompleted 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className={`font-extrabold text-xs truncate leading-tight ${isActive ? "text-white" : ""}`}>{s.title.split('. ')[1]}</div>
                  <div className={`text-[10px] truncate ${isActive ? "text-blue-100 font-medium" : "opacity-75"}`}>{s.desc}</div>
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
                    Vehicle Overview & Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {/* Car Custom Title Field */}
                  <div className="col-span-full pb-2">
                    <div className="mb-1.5 ml-1">
                      <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Vehicle Display / Meta Catalog Title
                      </label>
                    </div>
                    <input 
                      type="text" 
                      className={`${inpClass} font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-gray-800/80 focus:bg-white`}
                      value={formData.title || ""} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })} 
                      placeholder="e.g. 2022 Maruti Suzuki XL6 Alpha AT or 🏆 2023 MG Hector Savvy Pro 7S | 33K" 
                    />
                    <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1.5 ml-1">
                      This title appears on website search, car details page, Meta Commerce catalog ads, and WhatsApp shares.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Make (Brand) <span className="text-rose-500 font-black ml-1">*</span>
                      </label>
                      {brandsList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCustomMake(!isCustomMake)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {isCustomMake ? "← Catalog List" : "+ Custom Brand"}
                        </button>
                      )}
                    </div>
                    {brandsList.length > 0 && !isCustomMake ? (
                      <select 
                        className={inpClass} 
                        value={brandsList.some(b => b.name?.toLowerCase() === (formData.make || '').toLowerCase()) ? formData.make : (formData.make || "")} 
                        onChange={e => {
                          const newMake = e.target.value;
                          if (newMake === "__custom__") {
                            setIsCustomMake(true);
                            return;
                          }
                          if (!newMake) return;
                          const currentAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                          const nextAuto = `${formData.year || ''} ${newMake || ''}`.replace(/\s+/g, ' ').trim();
                          const isUntouched = !formData.title || formData.title.trim() === '' || formData.title.trim() === currentAuto;
                          setFormData({
                            ...formData, 
                            make: newMake, 
                            model: "",
                            title: isUntouched ? nextAuto : formData.title
                          });
                        }}
                        required
                      >
                        <option value="">Select Brand...</option>
                        {brandsList.map(b => (
                          <option key={b.id || b.name} value={b.name}>{b.name}</option>
                        ))}
                        {formData.make && !brandsList.some(b => b.name?.toLowerCase() === (formData.make || '').toLowerCase()) && (
                          <option value={formData.make}>{formData.make}</option>
                        )}
                        <option value="__custom__">+ Enter Custom Brand...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.make || ''}
                        onChange={e => {
                          const newMake = e.target.value;
                          const currentAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                          const nextAuto = `${formData.year || ''} ${newMake || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                          const isUntouched = !formData.title || formData.title.trim() === '' || formData.title.trim() === currentAuto;
                          setFormData({
                            ...formData,
                            make: newMake,
                            title: isUntouched ? nextAuto : formData.title
                          });
                        }}
                        placeholder="Enter brand name (e.g. Skoda, Hyundai, MG)"
                        required
                      />
                    )}
                  </div>

                  <div>
                    {(() => {
                      const availableModels = brandsList.find(b => b.name?.toLowerCase() === (formData.make || '').toLowerCase())?.models || [];

                      const handleModelChange = (newModel: string) => {
                        const currentAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                        const nextAuto = `${formData.year || ''} ${formData.make || ''} ${newModel || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                        const isUntouched = !formData.title || formData.title.trim() === '' || formData.title.trim() === currentAuto;
                        setFormData({
                          ...formData, 
                          model: newModel,
                          title: isUntouched ? nextAuto : formData.title
                        });
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between mb-1.5 ml-1">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              Model <span className="text-rose-500 font-black ml-1">*</span>
                            </label>
                            {availableModels.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsCustomModel(!isCustomModel)}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                {isCustomModel ? "← Catalog List" : "+ Custom Model"}
                              </button>
                            )}
                          </div>
                          {availableModels.length > 0 && !isCustomModel ? (
                            <select 
                              className={inpClass} 
                              value={availableModels.some((m: any) => m.name?.toLowerCase() === (formData.model || '').toLowerCase()) ? formData.model : (formData.model || "")} 
                              onChange={e => {
                                if (e.target.value === "__custom__") {
                                  setIsCustomModel(true);
                                } else if (e.target.value) {
                                  handleModelChange(e.target.value);
                                }
                              }}
                              required
                            >
                              <option value="">Select Model...</option>
                              {availableModels.map((m: any) => (
                                <option key={m.id || m.name} value={m.name}>{m.name}</option>
                              ))}
                              {formData.model && !availableModels.some((m: any) => m.name?.toLowerCase() === (formData.model || '').toLowerCase()) && (
                                <option value={formData.model}>{formData.model}</option>
                              )}
                              <option value="__custom__">+ Enter Custom Model...</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              className={inpClass}
                              value={formData.model || ''}
                              onChange={e => handleModelChange(e.target.value)}
                              placeholder={availableModels.length > 0 ? "Enter model name (e.g. Kylaq / Kushaq)..." : "Enter car model (e.g. Kylaq, Creta, Fortuner)"}
                              required
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div>
                    {(() => {
                      const selectedModelObj = brandsList.find(b => b.name?.toLowerCase() === (formData.make || '').toLowerCase())?.models?.find((m: any) => m.name?.toLowerCase() === (formData.model || '').toLowerCase());
                      const modelVariants = selectedModelObj?.variants || [];

                      const handleVariantChange = (newVariant: string) => {
                        const currentAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                        const nextAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${newVariant || ''}`.replace(/\s+/g, ' ').trim();
                        const isUntouched = !formData.title || formData.title.trim() === '' || formData.title.trim() === currentAuto;
                        setFormData({ 
                          ...formData, 
                          variant: newVariant,
                          title: isUntouched ? nextAuto : formData.title
                        });
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between mb-1.5 ml-1">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Variant</label>
                            {modelVariants.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsCustomVariant(!isCustomVariant)}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                {isCustomVariant ? "← Catalog List" : "+ Custom Variant"}
                              </button>
                            )}
                          </div>
                          {modelVariants.length > 0 && !isCustomVariant ? (
                            <select
                              className={inpClass}
                              value={modelVariants.some((v: any) => v.name?.toLowerCase() === (formData.variant || '').toLowerCase()) ? formData.variant : (formData.variant || "")}
                              onChange={e => {
                                if (e.target.value === "__custom__") {
                                  setIsCustomVariant(true);
                                } else {
                                  handleVariantChange(e.target.value);
                                }
                              }}
                            >
                              <option value="">Select Variant...</option>
                              {modelVariants.map((v: any) => (
                                <option key={v.id || v.name} value={v.name}>{v.name}</option>
                              ))}
                              {formData.variant && !modelVariants.some((v: any) => v.name?.toLowerCase() === (formData.variant || '').toLowerCase()) && (
                                <option value={formData.variant}>{formData.variant}</option>
                              )}
                              <option value="__custom__">+ Enter Custom Variant...</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              className={inpClass}
                              value={formData.variant || ''}
                              onChange={e => handleVariantChange(e.target.value)}
                              placeholder="e.g. Signature MT / SX (O) / Asta"
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* 3 Fields in One Row: Fuel Type, Transmission, Body Type */}
                  <div>
                    <label className={labelClass}>
                      Fuel Type <span className="text-rose-500 font-black ml-1">*</span>
                    </label>
                    <select className={inpClass} value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                      {["Petrol", "Diesel", "CNG", "Petrol/CNG", "Electric", "Hybrid"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Transmission <span className="text-rose-500 font-black ml-1">*</span>
                    </label>
                    <select className={inpClass} value={formData.transmission || "Automatic"} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                      {["Automatic", "Manual"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Body Type <span className="text-rose-500 font-black ml-1">*</span>
                    </label>
                    <select className={inpClass} value={formData.bodyType || ""} onChange={e => setFormData({...formData, bodyType: e.target.value})}>
                      <option value="">Select Body Type...</option>
                      {["Hatchback", "Sedan", "SUV", "Compact SUV", "MUV", "Luxury Sedan", "Luxury SUV", "EV CAR", "Luxury"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {/* Year (Manufacturing) & Reg. Year Fields moved down in 2nd row */}
                  <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        Year (Manufacturing) <span className="text-rose-500 font-black ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          className={`${inpClass} w-[100px] sm:w-[110px] shrink-0 !px-2.5 !pr-6 text-xs font-bold`}
                          value={formData.mfgMonth || ""}
                          onChange={e => setFormData({ ...formData, mfgMonth: e.target.value })}
                          title="Manufacturing Month"
                        >
                          <option value="">Month</option>
                          {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          className={`${inpClass} flex-1 min-w-0`}
                          value={formData.year} 
                          onChange={e => {
                            const newYear = e.target.value;
                            const currentAuto = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                            const nextAuto = `${newYear || ''} ${formData.make || ''} ${formData.model || ''} ${formData.variant || ''}`.replace(/\s+/g, ' ').trim();
                            const isUntouched = !formData.title || formData.title.trim() === '' || formData.title.trim() === currentAuto;
                            setFormData({
                              ...formData, 
                              year: newYear,
                              title: isUntouched ? nextAuto : formData.title
                            });
                          }} 
                          placeholder="e.g. 2024" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Reg. Year <span className="text-rose-500 font-black ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          className={`${inpClass} w-[100px] sm:w-[110px] shrink-0 !px-2.5 !pr-6 text-xs font-bold`}
                          value={formData.regMonth || ""}
                          onChange={e => setFormData({ ...formData, regMonth: e.target.value })}
                          title="Registration Month"
                        >
                          <option value="">Month</option>
                          {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          className={`${inpClass} flex-1 min-w-0`}
                          value={formData.regYear || formData.year} 
                          onChange={e => setFormData({ ...formData, regYear: e.target.value })} 
                          placeholder="e.g. 2024" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Details / Long Description Box in Step 1 */}
                  <div className="col-span-full pt-3 mt-1 border-t border-slate-100 dark:border-gray-800/80">
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span>Vehicle Description & Custom Highlights</span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-gray-500">(Custom Details / Overview)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">{(formData.description || '').length} chars</span>
                    </div>
                    <textarea 
                      className={inpClass + " min-h-[90px] resize-y font-normal"} 
                      value={formData.description || ""} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Enter vehicle highlights (e.g. 🔥 Premium 7-seater space, single owner, fully authorized service history, pristine condition, comprehensive insurance valid until Oct 2026)."
                    />
                    <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1 ml-1">
                      Shows on vehicle details page and feeds into Meta Commerce catalog description.
                    </p>
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
                      <label className={labelClass}>
                        Actual Selling Price (₹) <span className="text-rose-500 font-black ml-1">*</span>
                      </label>
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
                      <span className="text-xs uppercase tracking-wider font-extrabold">
                        Luxury
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
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      Main Cover Image <span className="text-rose-500 font-black ml-1">*</span>
                    </h2>
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
                      <span className="text-xs font-bold mt-2">No Cover Photo Selected</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Will auto-pick from gallery or choose here</span>
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

        {/* Specifications & History Section */}
        {activeTab === "specs" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Core Vehicle History & Registration */}
            <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/80 dark:border-gray-800">
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-gray-800">
                <div className="w-1.5 h-5 bg-[#155DFC] rounded-full" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Vehicle History & Core Specs
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>
                    KM Driven (Odometer) <span className="text-rose-500 font-black ml-1">*</span>
                  </label>
                  <input 
                    type="number" 
                    className={inpClass} 
                    value={formData.km} 
                    onChange={e => setFormData({...formData, km: e.target.value})} 
                    placeholder="e.g. 24500" 
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Ownership <span className="text-rose-500 font-black ml-1">*</span>
                  </label>
                  <select 
                    className={inpClass} 
                    value={formData.ownership || "1st Owner"} 
                    onChange={e => setFormData({...formData, ownership: e.target.value})}
                  >
                    {["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    RTO Code <span className="text-rose-500 font-black ml-1">*</span>
                    <span className="text-gray-400 text-xs font-normal ml-1.5">(e.g. MH01, DL3C)</span>
                  </label>
                  <input 
                    type="text" 
                    className={inpClass} 
                    value={formData.rto_code || ""} 
                    onChange={e => setFormData({
                      ...formData, 
                      rto_code: e.target.value.toUpperCase(),
                      regState: e.target.value.slice(0, 2).toUpperCase()
                    })} 
                    placeholder="e.g. MH01" 
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Registration Number</label>
                  <input 
                    type="text" 
                    className={inpClass} 
                    value={formData.registrationNo || formData.registration_no || ""} 
                    onChange={e => setFormData({...formData, registrationNo: e.target.value.toUpperCase(), registration_no: e.target.value.toUpperCase()})} 
                    placeholder="e.g. MH02DW8821" 
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Location (City / Hub) <span className="text-rose-500 font-black ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={inpClass} 
                    value={formData.location || formData.hub || ""} 
                    onChange={e => setFormData({ ...formData, location: e.target.value, hub: e.target.value })} 
                    placeholder="e.g. Eksar Village, Borivali West, Mumbai" 
                  />
                </div>

                <div>
                  <label className={labelClass}>Engine Capacity (CC)</label>
                  <input 
                    type="text" 
                    className={inpClass} 
                    value={formData.engineCapacity || ""} 
                    onChange={e => setFormData({...formData, engineCapacity: e.target.value})} 
                    placeholder="e.g. 1498 cc" 
                  />
                </div>

                <div>
                  <label className={labelClass}>Color</label>
                  <input 
                    type="text" 
                    className={inpClass} 
                    value={formData.color || ""} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                    placeholder="e.g. Polar White" 
                  />
                </div>

                <div>
                  <label className={labelClass}>Insurance Status</label>
                  <select 
                    className={inpClass} 
                    value={formData.insuranceStatus || "Active"} 
                    onChange={e => setFormData({...formData, insuranceStatus: e.target.value})}
                  >
                    <option value="Active">Comprehensive (Active)</option>
                    <option value="Third Party">Third Party Only</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Technical Specifications Table */}
            <section className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/80 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-5 bg-[#155DFC] rounded-full" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Technical Specifications
                  </h2>
                </div>
                <button 
                  onClick={() => addItem("specifications", { label: "", value: "", icon: "Gauge" })}
                  className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-xs cursor-pointer"
                >
                  <Plus size={16} /> Add Spec
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.specifications.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-xs">
                    No custom technical specs added yet. Click "+ Add Spec" to add extra details like ground clearance, boot space, etc.
                  </div>
                )}
                {formData.specifications.map((spec: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl relative group border border-slate-100 dark:border-gray-700 transition-all flex gap-3 items-center">
                     <div className="flex-1 grid grid-cols-2 gap-3">
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
                     <button 
                      onClick={() => removeItem("specifications", idx)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Features Section */}
        {activeTab === "features" && (
          <div className="max-w-5xl mx-auto">
            <FeatureCategory 
              title="Comfort & Convenience" 
              options={[
                "Air Conditioner", 
                "Power Windows", 
                "Adjustable Seats", 
                "Keyless Entry", 
                "Wireless Charging", 
                "Air Purifier", 
                "Seat Massager", 
                "Sunroof", 
                "Panoramic Sunroof", 
                "Ventilated Seats", 
                "Rear AC Vents", 
                "Automatic Climate Control"
              ]} 
            />
            <FeatureCategory 
              title="Safety" 
              options={[
                "ABS System", 
                "Hill Assist", 
                "Auto Hold", 
                "ADAS Level 2", 
                "Cruise Control", 
                "360° Camera", 
                "TPMS Monitoring", 
                "Central Locking", 
                "Airbags", 
                "EBD"
              ]} 
            />
            <FeatureCategory 
              title="Exterior" 
              options={["Fog Lights", "Alloy Wheels", "Rear Spoiler", "Moonroof", "LED Headlights", "Roof Rails", "Turn Indicators on ORVM"]} 
            />

            {/* QUALITY & INSPECTION REPORT SECTION */}
            <div className="mt-8 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                      Vehicle Quality & Inspection Report
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Configure the quality score ratings, evaluation summary, and upload the official PDF inspection report.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    {uploadingPdf ? (
                      <>
                        <span className="animate-spin text-xs">⏳</span>
                        <span>Uploading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload PDF Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. PDF Upload / Attachment Display */}
              <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Inspection PDF Document (for "View full report" button)</span>
                  </label>
                  {formData.qualityReport?.fullReportUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      PDF Attached
                    </span>
                  )}
                </div>

                {formData.qualityReport?.fullReportUrl ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {formData.qualityReport.fullReportUrl.split('/').pop() || 'Inspection_Report.pdf'}
                        </p>
                        <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                          {formData.qualityReport.fullReportUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <a
                        href={formData.qualityReport.fullReportUrl.startsWith('/uploads/') ? `${API}${formData.qualityReport.fullReportUrl}` : formData.qualityReport.fullReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 transition-colors"
                      >
                        <ExternalLink size={12} /> View PDF
                      </a>
                      <button
                        type="button"
                        onClick={() => setFormData((prev: any) => ({
                          ...prev,
                          qualityReport: { ...prev.qualityReport, fullReportUrl: '' }
                        }))}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
                    <span>No PDF uploaded yet for this vehicle. Click <strong>Upload PDF Report</strong> above or paste a direct link below.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Or Enter PDF / External Report URL manually:
                  </label>
                  <input
                    type="text"
                    className={inpClass}
                    value={formData.qualityReport?.fullReportUrl || ""}
                    onChange={e => setFormData({
                      ...formData,
                      qualityReport: { ...formData.qualityReport, fullReportUrl: e.target.value }
                    })}
                    placeholder="https://... or /uploads/report.pdf"
                  />
                </div>
              </div>

              {/* 2. Subtitle & Expert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Header Evaluation Subtitle</label>
                  <input
                    type="text"
                    className={inpClass}
                    value={formData.qualityReport?.subtitle || ""}
                    onChange={e => setFormData({
                      ...formData,
                      qualityReport: { ...formData.qualityReport, subtitle: e.target.value }
                    })}
                    placeholder="e.g. 1452 parts evaluated by 5 automotive experts"
                  />
                </div>

                <div>
                  <label className={labelClass}>Next Service Due Notice</label>
                  <input
                    type="text"
                    className={inpClass}
                    value={formData.qualityReport?.nextServiceText || ""}
                    onChange={e => setFormData({
                      ...formData,
                      qualityReport: { ...formData.qualityReport, nextServiceText: e.target.value }
                    })}
                    placeholder="e.g. Next service due after 12 months or 10,000 km"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Expert Summary (Detailed Notes)</label>
                <textarea
                  className={inpClass + " min-h-[90px]"}
                  value={formData.qualityReport?.summary || ""}
                  onChange={e => setFormData({
                    ...formData,
                    qualityReport: { ...formData.qualityReport, summary: e.target.value }
                  })}
                  placeholder="e.g. 1452 parts evaluated. Core structure intact. No flood damage found."
                />
              </div>

              {/* 3. Inspection Check Badges */}
              <div>
                <label className={labelClass}>Inspection Badges & Guarantees</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.qualityReport?.meterTampered !== false && formData.qualityReport?.meterTampered !== "false"}
                      onChange={e => setFormData({
                        ...formData,
                        qualityReport: { ...formData.qualityReport, meterTampered: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Meter not tampered</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.qualityReport?.nonFlooded !== false && formData.qualityReport?.nonFlooded !== "false"}
                      onChange={e => setFormData({
                        ...formData,
                        qualityReport: { ...formData.qualityReport, nonFlooded: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Non-flooded</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.qualityReport?.coreStructureIntact !== false && formData.qualityReport?.coreStructureIntact !== "false"}
                      onChange={e => setFormData({
                        ...formData,
                        qualityReport: { ...formData.qualityReport, coreStructureIntact: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Core structure intact</span>
                  </label>
                </div>
              </div>

              {/* 4. The 5 Quality Category Scores & Ratings */}
              <div className="pt-2">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">
                  Quality Category Scores & Ratings (Out of 10)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {/* Category 1 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">Core systems</div>
                    <p className="text-[10px] text-gray-400">Engine, transmission</p>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Score (e.g. 9.9)</label>
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.qualityReport?.coreScore || ""}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, coreScore: e.target.value }
                        })}
                        placeholder="9.9"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Rating Label</label>
                      <select
                        className={inpClass}
                        value={formData.qualityReport?.coreLabel || "Excellent"}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, coreLabel: e.target.value }
                        })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>

                  {/* Category 2 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">Supporting systems</div>
                    <p className="text-[10px] text-gray-400">Fuel supply, ignition</p>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Score (e.g. 9.5)</label>
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.qualityReport?.supportingScore || ""}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, supportingScore: e.target.value }
                        })}
                        placeholder="9.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Rating Label</label>
                      <select
                        className={inpClass}
                        value={formData.qualityReport?.supportingLabel || "Excellent"}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, supportingLabel: e.target.value }
                        })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>

                  {/* Category 3 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">Interiors & AC</div>
                    <p className="text-[10px] text-gray-400">Seats, AC, audio</p>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Score (e.g. 9.6)</label>
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.qualityReport?.interiorsScore || ""}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, interiorsScore: e.target.value }
                        })}
                        placeholder="9.6"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Rating Label</label>
                      <select
                        className={inpClass}
                        value={formData.qualityReport?.interiorsLabel || "Excellent"}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, interiorsLabel: e.target.value }
                        })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>

                  {/* Category 4 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">Exteriors & lights</div>
                    <p className="text-[10px] text-gray-400">Panels, glasses, lights</p>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Score (e.g. 9.2)</label>
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.qualityReport?.exteriorsScore || ""}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, exteriorsScore: e.target.value }
                        })}
                        placeholder="9.2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Rating Label</label>
                      <select
                        className={inpClass}
                        value={formData.qualityReport?.exteriorsLabel || "Excellent"}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, exteriorsLabel: e.target.value }
                        })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>

                  {/* Category 5 */}
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">Wear & tear parts</div>
                    <p className="text-[10px] text-gray-400">Tyres, clutch, brakes</p>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Score (e.g. 8.7)</label>
                      <input
                        type="text"
                        className={inpClass}
                        value={formData.qualityReport?.wearTearScore || ""}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, wearTearScore: e.target.value }
                        })}
                        placeholder="8.7"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Rating Label</label>
                      <select
                        className={inpClass}
                        value={formData.qualityReport?.wearTearLabel || "Good"}
                        onChange={e => setFormData({
                          ...formData,
                          qualityReport: { ...formData.qualityReport, wearTearLabel: e.target.value }
                        })}
                      >
                        <option value="Good">Good</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                const isCover = formData.image === img || (!formData.image && idx === 0 && mediaType === 'image');
                return (
                  <div 
                    key={img} 
                    className={`aspect-video bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden relative group border transition-all cursor-move select-none ${
                      isDragging 
                        ? 'border-indigo-500 scale-95 opacity-50 shadow-inner' 
                        : isCover 
                          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                          : 'border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                     {/* Cover Badge */}
                     {isCover && (
                       <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 z-10">
                         <Star size={10} className="fill-white" />
                         <span>Cover Photo</span>
                       </div>
                     )}

                     {mediaType === 'bunny_stream' || mediaType === 'video' ? (
                       <div className="w-full h-full bg-[#0C1B33] flex flex-col items-center justify-center text-white text-[10px] font-bold p-3">
                         <span className="text-lg">▶</span>
                         <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00C9AF] mt-1">Walkaround Video</span>
                         <span className="text-[7px] text-gray-400 mt-1 font-mono text-center truncate w-full">{img}</span>
                       </div>
                     ) : mediaType === 'youtube' ? (
                       <div className="w-full h-full bg-[#FF0000] flex flex-col items-center justify-center text-white text-[10px] font-bold p-3">
                         <span className="text-lg">▶</span>
                         <span className="text-[9px] uppercase tracking-wider font-extrabold mt-1">YouTube Link</span>
                         <span className="text-[7px] text-gray-200 mt-1 font-mono text-center truncate w-full">{img}</span>
                       </div>
                     ) : (
                       <img src={img.startsWith('/') ? `${API}${img}` : img} className="w-full h-full object-cover pointer-events-none" />
                     )}
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all z-20">
                        {mediaType === 'image' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAltModal(img);
                            }}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md"
                            title="Edit Alt Text / View Angle"
                          >
                            <Tag size={16} />
                          </button>
                        )}
                        {mediaType === 'image' && !isCover && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, image: img });
                              toast.success("Set as main cover photo!");
                            }}
                            className="p-2 bg-amber-500 text-white rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md"
                            title="Set as Main Cover Photo"
                          >
                            <Star size={16} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            const newer = [...formData.moreImages];
                            newer.splice(idx, 1);
                            const isVid = mediaType === 'video' || mediaType === 'youtube';
                            const nextCover = formData.image === img ? (newer.find((u: string) => getMediaType(u) === 'image') || '') : formData.image;
                            setFormData({
                              ...formData,
                              moreImages: newer,
                              image: nextCover,
                              videoUrl: isVid ? "" : formData.videoUrl
                            });
                          }}
                          className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>

                     {/* Alt Text / View Angle Label Strip */}
                     {mediaType === 'image' && (
                       <div 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleOpenAltModal(img);
                         }}
                         className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-3 flex items-center justify-between text-[11px] text-white cursor-pointer z-10 hover:bg-black/90 transition-all"
                         title="Click to edit Alt Text / View Angle"
                       >
                         <span className="truncate font-semibold flex items-center gap-1 min-w-0 pr-1">
                           <Tag size={11} className="text-[#00C9AF] shrink-0" />
                           <span className="truncate">{altMap[img] || <span className="text-gray-300 font-normal italic">Add Alt Text</span>}</span>
                         </span>
                         <span className="text-[9px] bg-white/20 hover:bg-white/30 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                           Edit
                         </span>
                       </div>
                     )}
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
                    <div className="space-y-4">
                      <label className={labelClass}>Upload Local MP4/MOV File</label>
                      
                      {/* Choose File Button */}
                      <div className="flex flex-wrap items-center gap-3">
                        <label className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all text-sm cursor-pointer shadow-sm ${
                          isUploadingVideo
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-70"
                            : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:shadow"
                        }`}>
                          <UploadCloud size={18} />
                          {isUploadingVideo ? "Uploading Video..." : "Choose Video File"}
                          <input 
                            type="file" 
                            accept="video/mp4,video/quicktime,video/webm" 
                            className="hidden" 
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo}
                          />
                        </label>
                        
                        {formData.videoUrl && !isUploadingVideo && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                            <CheckCircle size={14} className="text-emerald-600" />
                            <span>Video Ready</span>
                          </div>
                        )}
                      </div>

                      {/* Video Upload Progress Bar & Metrics UI */}
                      {isUploadingVideo && (
                        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-fade-in shadow-inner">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                              <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
                                {videoUploadFileName || "Uploading video..."}
                              </span>
                            </div>
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                              {videoUploadProgress}%
                            </span>
                          </div>

                          {/* Animated Progress Bar */}
                          <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-indigo-100 dark:border-indigo-900/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-[#00C9AF] to-emerald-400 transition-all duration-200 shadow-sm relative overflow-hidden"
                              style={{ width: `${Math.max(videoUploadProgress, 3)}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                          </div>

                          {/* Upload Stats: Speed, ETA, Size */}
                          <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-indigo-700 dark:text-indigo-300">
                                {videoUploadStatus === 'processing' ? 'Processing on server...' : (videoUploadSizeInfo || 'Preparing...')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {videoUploadSpeed && videoUploadStatus === 'uploading' && (
                                <span className="font-mono">{videoUploadSpeed}</span>
                              )}
                              {videoUploadEta && videoUploadStatus === 'uploading' && (
                                <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                                  <Clock size={12} /> {videoUploadEta}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success Feedback Box */}
                      {videoUploadStatus === 'success' && !isUploadingVideo && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between animate-fade-in text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                            <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Video uploaded successfully!</span>
                            {videoUploadFileName && (
                              <span className="font-normal text-emerald-700 dark:text-emerald-400">({videoUploadFileName})</span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold tracking-wider">Ready to Save</span>
                        </div>
                      )}

                      {/* Error Feedback Box */}
                      {videoUploadStatus === 'error' && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
                          <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{videoUploadError || 'Upload failed. Please try again.'}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-gray-400">
                        Supports standard MP4, MOV, and WEBM video files. Max file size depends on server limits.
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
                      <label className={labelClass}>Direct Video / Bunny Stream URL</label>
                      <input 
                        type="text" 
                        className={inpClass} 
                        value={formData.videoUrl || ""} 
                        onChange={e => updateVideoInGallery(e.target.value)} 
                        placeholder="https://iframe.mediadelivery.net/embed/... or https://example.com/video.mp4" 
                      />
                      <p className="text-[11px] text-gray-400">
                        Paste a Bunny Stream iframe embed URL or direct video file URL (.mp4, .mov).
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
                        onClick={() => {
                          updateVideoInGallery("");
                          setVideoUploadStatus('idle');
                        }}
                        className="text-red-500 hover:text-red-700 p-2 font-bold text-xs uppercase shrink-0 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Side Video Preview Player */}
                <div className="md:col-span-1">
                  <label className={labelClass}>Video Preview</label>
                  <div className="aspect-video bg-gray-950 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden relative flex items-center justify-center shadow-md">
                    {formData.videoUrl ? (
                      (formData.videoUrl.includes("youtube.com") || formData.videoUrl.includes("youtu.be")) && getYouTubeId(formData.videoUrl) ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYouTubeId(formData.videoUrl)}`}
                          className="w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (formData.videoUrl.includes("mediadelivery.net") || formData.videoUrl.includes("bunnycdn.com") || formData.videoUrl.includes("/embed/")) ? (
                        <iframe 
                          src={formData.videoUrl}
                          className="w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        />
                      ) : (
                        <video 
                          src={formData.videoUrl.startsWith('/') ? `${API}${formData.videoUrl}` : formData.videoUrl} 
                          className="w-full h-full object-contain bg-black" 
                          controls 
                          playsInline
                          preload="metadata"
                          key={formData.videoUrl}
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Video className="w-8 h-8 text-gray-500 dark:text-gray-600 mb-1.5" />
                        <span className="text-xs text-gray-400 font-bold">No Video Configured</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">Upload a video to preview here</span>
                      </div>
                    )}
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
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Listing...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Car" : "Publish Listing"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Popup Modal */}
      {successModal?.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Header */}
            <div className="p-6 text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 relative">
              <button
                type="button"
                onClick={() => {
                  setRedirectCountdown(null);
                  setSuccessModal(null);
                  if (successModal.type === 'create') navigate("/cars");
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {successModal.type === 'create' ? 'Car Listed Successfully!' : 'Listing Saved Successfully!'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {successModal.type === 'create'
                  ? 'Your new vehicle has been published to inventory and is now active.'
                  : 'Your vehicle listing details and changes have been saved.'}
              </p>
            </div>

            {/* Car Summary Card */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                  {successModal.carImage ? (
                    <img
                      src={resolveAdminImgUrl(successModal.carImage)}
                      alt={successModal.carTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Car size={22} className="text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {successModal.carTitle}
                  </div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{Number(successModal.carPrice || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Status: Active in Inventory</span>
                  </div>
                </div>
              </div>

              {/* Countdown notification */}
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <span>Redirecting to inventory list...</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{redirectCountdown}s</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRedirectCountdown(null);
                    setSuccessModal(null);
                    navigate("/cars");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Go to Cars List (Inventory)</span>
                  <ChevronRight size={14} />
                </button>

                <div className="flex gap-2">
                  {successModal.type === 'create' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRedirectCountdown(null);
                        setSuccessModal(null);
                        window.location.href = "/cars/add";
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      + Add Another Car
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRedirectCountdown(null);
                        setSuccessModal(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Stay on Edit Page
                    </button>
                  )}
                  {successModal.carId && (
                    <a
                      href={getCarLiveUrl(successModal.carId, successModal.make, successModal.model, successModal.variant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>View Live</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Alt Text / Angle Label Modal */}
      {altModalImage && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Image Alt Text & View Label</h3>
                  <p className="text-[11px] text-gray-500">Sets accessibility alt text, SEO, and frontend gallery angle labels</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAltModalImage(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 bg-black">
                  <img
                    src={altModalImage.startsWith('/') ? `${API}${altModalImage}` : altModalImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-400 font-mono truncate">{altModalImage}</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                    Current: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{altMap[altModalImage] || '(None)'}</span>
                  </div>
                </div>
              </div>

              {/* Alt Text Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Alt Text / View Angle Label:
                </label>
                <input
                  type="text"
                  value={altModalText}
                  onChange={(e) => setAltModalText(e.target.value)}
                  placeholder="e.g. Left Front Corner View, Back View, Engine Bay..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveAltText();
                    }
                  }}
                />
              </div>

              {/* Quick Preset Angle Chips */}
              <div>
                <div className="text-[11px] font-bold text-gray-500 mb-2">Quick Preset Angle Labels:</div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {[
                    'Left Front Corner View',
                    'Back View',
                    'Front View',
                    'Right Profile View',
                    'Left Profile View',
                    'Cockpit & Dashboard',
                    'Steering Wheel & Controls',
                    'Infotainment System',
                    'Front Cabin Seats',
                    'Rear Passenger Seats',
                    'Engine Bay View',
                    'Front Right Alloy & Tyre',
                    'Sunroof & Roof Profile',
                    'Boot / Trunk Space',
                    'Front Grille & Headlamp',
                    'Odometer / Instrument Cluster'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAltModalText(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        altModalText === preset
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAltModalImage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAltText}
                disabled={isSavingAlt}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingAlt && <Loader2 size={13} className="animate-spin" />}
                <span>Save Alt Text</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default CarEditPage;

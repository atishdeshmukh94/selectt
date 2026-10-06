import { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Zap, 
  Radio, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Database,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import { API_URL } from "../config/api";
import { toast } from "react-hot-toast";

const API = API_URL;

interface MetaCatalogStatus {
  settings: {
    catalog_id: string;
    secondary_catalog_id: string;
    pixel_id: string;
    access_token: string;
    secondary_access_token: string;
    has_token: boolean;
    has_secondary_token: boolean;
    business_id: string;
    auto_sync: boolean;
    fallback_brand: string;
    currency: string;
    last_synced_at: string | null;
    last_sync_status: string;
    last_sync_result: string | null;
  };
  feed_urls: {
    csv: string;
    xml: string;
    json: string;
  };
  inventory: {
    total: number;
    active: number;
    health: {
      total_cars: number;
      ready_for_meta: number;
      health_percentage: number;
      missing_images: number;
      missing_prices: number;
      missing_makes: number;
      missing_years: number;
      problematic_items: Array<{
        id: number;
        title: string;
        issues: string[];
      }>;
    };
  };
}

export default function MetaCatalogSettings() {
  const [data, setData] = useState<MetaCatalogStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  
  // Form State - Dual Meta Catalogs (Official Selectt + Gallabox)
  const [catalogId, setCatalogId] = useState("");
  const [secondaryCatalogId, setSecondaryCatalogId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [secondaryAccessToken, setSecondaryAccessToken] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [fallbackBrand, setFallbackBrand] = useState("Selectt Cars");
  const [currency, setCurrency] = useState("INR");
  const [showToken, setShowToken] = useState(false);
  const [showSecondaryToken, setShowSecondaryToken] = useState(false);
  
  // UI states
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<"csv" | "xml" | "json">("csv");
  const [testResult, setTestResult] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [openGuide, setOpenGuide] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/api/admin/meta-catalog/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setCatalogId(json.settings?.catalog_id || "");
        setSecondaryCatalogId(json.settings?.secondary_catalog_id || "1096255408500197");
        setPixelId(json.settings?.pixel_id || "");
        setAccessToken(json.settings?.access_token || "");
        setSecondaryAccessToken(json.settings?.secondary_access_token || "");
        setBusinessId(json.settings?.business_id || "");
        setAutoSync(Boolean(json.settings?.auto_sync));
        setFallbackBrand(json.settings?.fallback_brand || "Selectt Cars");
        setCurrency(json.settings?.currency || "INR");
      }
    } catch (err) {
      console.error("Error fetching Meta catalog status:", err);
      toast.error("Failed to load Meta Catalog status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/api/admin/meta-catalog/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          catalog_id: catalogId,
          secondary_catalog_id: secondaryCatalogId,
          pixel_id: pixelId,
          access_token: accessToken,
          secondary_access_token: secondaryAccessToken,
          business_id: businessId,
          auto_sync: autoSync,
          fallback_brand: fallbackBrand,
          currency: currency
        })
      });
      const resJson = await res.json();
      if (res.ok) {
        toast.success(resJson.message || "Meta Catalog configuration saved!");
        fetchStatus();
      } else {
        toast.error(resJson.message || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/api/admin/meta-catalog/test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          catalog_id: catalogId,
          secondary_catalog_id: secondaryCatalogId,
          access_token: accessToken,
          secondary_access_token: secondaryAccessToken
        })
      });
      const resJson = await res.json();
      setTestResult(resJson);
      if (resJson.success) {
        toast.success(resJson.message || "Meta Catalog connection verified!");
      } else {
        toast.error(resJson.message || "Meta connection test reported an issue");
      }
    } catch (err: any) {
      toast.error(err.message || "Error testing Meta connection");
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAll = async () => {
    if (!catalogId) {
      toast.error("Please enter and save your Meta Catalog ID first.");
      return;
    }
    if (!confirm("This will push all active website inventory directly into your Meta Catalog via Graph API. Proceed?")) return;

    setSyncingAll(true);
    setSyncResult(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/api/admin/meta-catalog/sync-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const resJson = await res.json();
      setSyncResult(resJson);
      if (resJson.success) {
        toast.success(resJson.message || "Inventory successfully synced to Meta Catalog!");
        fetchStatus();
      } else {
        toast.error(resJson.message || "Meta catalog sync encountered an error");
      }
    } catch (err: any) {
      toast.error(err.message || "Error pushing inventory to Meta");
    } finally {
      setSyncingAll(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeed(type);
    toast.success(`${type.toUpperCase()} Feed URL copied to clipboard!`);
    setTimeout(() => setCopiedFeed(null), 2500);
  };

  const activeFeedUrl = data?.feed_urls ? (data.feed_urls[activeFeedTab] || `${API}/api/feeds/meta-catalog.${activeFeedTab}`) : `${API}/api/feeds/meta-catalog.csv`;

  return (
    <>
      <PageMeta 
        title="Meta Catalog Setup | Selectt Admin"
        description="Connect your website vehicle inventory with Meta Facebook & Instagram Catalog for dynamic ads and marketplace shopping."
      />

      <div className="space-y-6 pb-16 max-w-6xl mx-auto">
        {/* Header Title & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Share2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Meta Catalog Setup
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  Facebook & Instagram
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Automatically feed cars and sync inventory with Meta Commerce Manager & Dynamic Product Ads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Status
            </button>
            <button
              onClick={() => setOpenGuide(!openGuide)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <HelpCircle size={14} />
              {openGuide ? "Hide Setup Guide" : "Setup Instructions"}
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Inventory</span>
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <Database size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {data?.inventory.total || 0}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">Vehicles registered in database</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Live In Meta Feed</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {data?.inventory.active || 0}
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">Active & available cars in feed</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Catalog Health</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {data?.inventory.health?.health_percentage || 100}%
            </p>
            <span className="text-xs text-gray-500 mt-1 inline-block">
              {data?.inventory.health?.ready_for_meta || 0} / {data?.inventory.active || 0} ready without warnings
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Auto-Sync Status</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Zap size={18} />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-2 flex items-center gap-1.5">
              {data?.settings?.auto_sync ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-base">
                  <CheckCircle2 size={18} /> Enabled
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1 text-base">
                  Manual / Feed
                </span>
              )}
            </p>
            <span className="text-[11px] text-gray-500 mt-1 block truncate">
              {data?.settings?.last_synced_at ? `Last sync: ${new Date(data.settings.last_synced_at).toLocaleDateString()}` : "Scheduled Feed Active"}
            </span>
          </div>
        </div>

        {/* Expandable Step-by-Step Meta Guide */}
        {openGuide && (
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-800/80 p-6 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={18} />
                  How to Integrate Meta Catalog with Facebook & Instagram
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Meta provides two ways to synchronize your inventory. You can use either or both:
                </p>
              </div>
              <button 
                onClick={() => setOpenGuide(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <ChevronUp size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-900/70 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold">1</span>
                  Option A: Scheduled Data Feed (Recommended & Easiest)
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  Meta automatically crawls the live feed URL every hour or day to keep prices and newly added cars up to date.
                </p>
                <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 mt-3 list-decimal list-inside">
                  <li>Go to <a href="https://business.facebook.com/commerce_manager" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Meta Commerce Manager</a>.</li>
                  <li>Click <b>Data Sources</b> &gt; <b>Add Items</b> &gt; <b>Data Feed</b>.</li>
                  <li>Select <b>Set a Schedule</b> (e.g. Daily or Hourly).</li>
                  <li>Paste the <b>Live CSV or XML Feed URL</b> from below.</li>
                  <li>Meta will import all current and future website cars automatically!</li>
                </ol>
              </div>

              <div className="bg-white dark:bg-gray-900/70 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold">2</span>
                  Option B: Real-Time Graph API / Meta SDK Sync
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  Instantly sync cars to Meta the exact millisecond an admin publishes or edits a car in this portal.
                </p>
                <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 mt-3 list-decimal list-inside">
                  <li>In Meta Business Settings, go to <b>System Users</b> &gt; generate a token with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">catalog_management</code> permission.</li>
                  <li>Copy your <b>Catalog ID</b> and <b>Access Token</b> into the form below.</li>
                  <li>Enable <b>Auto-Sync on Car Publish</b> and click <b>Save Configuration</b>.</li>
                  <li>Click <b>Test Connection</b> and <b>Force Sync All</b> to verify.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1: Scheduled Live Data Feed (One-click copy & preview) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Radio className="text-emerald-500 animate-pulse" size={18} />
                Live Scheduled Data Feed URLs
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Paste this URL into Meta Commerce Manager Data Sources for scheduled automated catalog synchronization.
              </p>
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-900/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFeedTab("csv")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeFeedTab === "csv"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FileSpreadsheet size={13} />
                CSV (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("xml")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeFeedTab === "xml"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FileCode size={13} />
                XML / RSS 2.0
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("json")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeFeedTab === "json"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FileJson size={13} />
                JSON Feed
              </button>
            </div>
          </div>

          {/* Feed URL Bar */}
          <div className="flex flex-col md:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={activeFeedUrl}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => copyToClipboard(activeFeedUrl, activeFeedTab)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
            >
              {copiedFeed === activeFeedTab ? <Check size={14} /> : <Copy size={14} />}
              {copiedFeed === activeFeedTab ? "Copied to Clipboard!" : "Copy Feed URL"}
            </button>

            <a
              href={activeFeedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors shrink-0"
            >
              <ExternalLink size={14} />
              Preview Feed
            </a>

            <a
              href={activeFeedUrl}
              download={`selectt-meta-catalog.${activeFeedTab}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors shrink-0"
            >
              <Download size={14} />
              Download
            </a>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>
                Feed conforms strictly to <b>Meta Automotive & Product Catalog Specifications</b> with vehicle make, model, year, transmission, fuel type, km mileage, and clean imagery.
              </span>
            </div>
            <a 
              href="https://business.facebook.com/commerce_manager" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-semibold shrink-0 text-xs flex items-center gap-1"
            >
              Open Meta Commerce Manager <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* SECTION 2: Meta Graph API & Commerce Account Credentials */}
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="text-amber-500" size={18} />
                Meta Graph API Credentials & Real-Time Sync
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Configure your Meta Catalog ID and System User token for live auto-sync and instant updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !catalogId}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {testing ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                Test Connection
              </button>
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncingAll || !catalogId}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {syncingAll ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Force Sync All ({data?.inventory.active || 0} Cars)
              </button>
            </div>
          </div>

          {/* Test Connection / Sync Response Feedback */}
          {testResult && (
            <div className="space-y-2.5">
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}>
                {testResult.success ? <CheckCircle2 size={17} className="shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle size={17} className="shrink-0 text-amber-600 mt-0.5" />}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.message}</p>
                </div>
              </div>

              {/* Individual Catalog Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Primary Official Selectt */}
                {testResult.primary && (
                  <div className={`p-3.5 rounded-xl border ${
                    testResult.primary.success 
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60" 
                      : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${testResult.primary.success ? "bg-emerald-500" : "bg-rose-500"}`} />
                        1. Official Selectt Catalog
                      </span>
                      <span className="text-[11px] font-mono opacity-80">{catalogId}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">
                      {testResult.primary.success 
                        ? `Connected! "${testResult.primary.catalog_name}" (${testResult.primary.product_count} products)`
                        : testResult.primary.message}
                    </p>
                  </div>
                )}

                {/* Secondary Gallabox */}
                {secondaryCatalogId && (
                  <div className={`p-3.5 rounded-xl border ${
                    testResult.secondary?.success 
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60" 
                      : "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${testResult.secondary?.success ? "bg-emerald-500" : "bg-blue-500"}`} />
                        2. Gallabox WhatsApp Catalog
                      </span>
                      <span className="text-[11px] font-mono opacity-80">{secondaryCatalogId}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">
                      {testResult.secondary?.success 
                        ? `Connected via API! (${testResult.secondary.product_count} products)`
                        : "Ready for Scheduled Data Feed import in Gallabox Commerce Manager."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {syncResult && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              syncResult.success
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}>
              {syncResult.success ? <CheckCircle2 size={17} className="shrink-0 text-blue-600 mt-0.5" /> : <AlertCircle size={17} className="shrink-0 text-rose-600 mt-0.5" />}
              <div className="space-y-1">
                <p className="font-semibold">{syncResult.message}</p>
                {syncResult.targets && Array.isArray(syncResult.targets) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-[11px]">
                    {syncResult.targets.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg">
                        <span className="font-medium">{t.label || t.catalogId}</span>
                        <span className={t.success ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                          {t.success ? `✓ ${t.count} Cars Synced` : `✗ Failed`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DUAL CATALOG SETUP TABS / CARDS */}
          <div className="space-y-6">
            {/* CATALOG 1: Official Selectt */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/70 dark:border-blue-800/50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Primary Catalog: Official Selectt
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Owned by <b>Selectt Official</b> (Used for Facebook & Instagram Ads & Commerce Manager)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Selectt Official
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Meta Catalog ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={catalogId}
                    onChange={e => setCatalogId(e.target.value)}
                    placeholder="2206855529763290"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Catalog ID for Official Selectt Catalogue_Products (e.g. <b>2206855529763290</b>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Meta Pixel ID (Optional for DPA)
                  </label>
                  <input
                    type="text"
                    value={pixelId}
                    onChange={e => setPixelId(e.target.value)}
                    placeholder="1289001699087868"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Links website visitors to dynamic retargeting ads
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    System User / Page Access Token (Selectt Official)
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={accessToken}
                      onChange={e => setAccessToken(e.target.value)}
                      placeholder="e.g. EAAX..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Generated in Meta Business Suite &gt; Selectt Official &gt; System Users (with <code>catalog_management</code>).
                  </span>
                </div>
              </div>
            </div>

            {/* CATALOG 2: Gallabox / WhatsApp Commerce */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/70 dark:border-emerald-800/50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Secondary Catalog: Gallabox WhatsApp Catalog
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Owned by <b>Gallabox Selectt Page</b> (Used for WhatsApp Catalog & Messaging)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Gallabox WhatsApp
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Gallabox Meta Catalog ID
                  </label>
                  <input
                    type="text"
                    value={secondaryCatalogId}
                    onChange={e => setSecondaryCatalogId(e.target.value)}
                    placeholder="1096255408500197"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Catalog ID for <b>Gallabox No Catalogue_Products</b> (ID: <b>1096255408500197</b>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Gallabox Access Token (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showSecondaryToken ? "text" : "password"}
                      value={secondaryAccessToken}
                      onChange={e => setSecondaryAccessToken(e.target.value)}
                      placeholder="Leave empty if using Scheduled Data Feed"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecondaryToken(!showSecondaryToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showSecondaryToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Optional token if Gallabox business portfolio has its own System User.
                  </span>
                </div>
              </div>

              {/* Direct Scheduled Feed Connection Tip Box for Gallabox */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-gray-900/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <Sparkles size={15} />
                  <span>How to connect this with Gallabox Catalog (100% Guaranteed & Automatic):</span>
                </div>
                <ol className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
                  <li>In Meta Business Suite under <b>Gallabox Selectt Page</b>, open <b>Gallabox No Catalogue_Products</b> in Commerce Manager.</li>
                  <li>Go to <b>Catalog &gt; Data Sources &gt; Add Items &gt; Data Feed</b>.</li>
                  <li>Choose <b>Set a Schedule</b> (Daily or Hourly) and paste this URL:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-[11px] font-mono text-emerald-700 dark:text-emerald-400 select-all">
                        {data?.feed_urls?.csv || "https://api.selectt.in/api/feeds/meta-catalog.csv"}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(data?.feed_urls?.csv || "https://api.selectt.in/api/feeds/meta-catalog.csv", "csv")}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
                      >
                        Copy URL
                      </button>
                    </div>
                  </li>
                  <li>Click <b>Upload Now</b>. All Selectt cars will instantly appear in Gallabox Catalog!</li>
                </ol>
              </div>
            </div>

            {/* General Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Meta Business Account ID (Optional)
                </label>
                <input
                  type="text"
                  value={businessId}
                  onChange={e => setBusinessId(e.target.value)}
                  placeholder="535964300375557"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Default Brand Name
                  </label>
                  <input
                    type="text"
                    value={fallbackBrand}
                    onChange={e => setFallbackBrand(e.target.value)}
                    placeholder="Selectt Cars"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto Sync Switch */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap size={16} className="text-blue-600" />
                Real-Time Auto-Sync on Car Upload / Edit / Delete
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When turned ON, newly added or updated cars in the admin panel are immediately pushed to Meta Catalog in the background.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={autoSync} 
                onChange={e => setAutoSync(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Save Meta Catalog Configuration
            </button>
          </div>
        </form>

        {/* SECTION 3: Catalog Inventory Health & Diagnostics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={18} />
                Meta Catalog Readiness & Inventory Health
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Ensures vehicles meet Meta Commerce specifications to avoid ad disapprovals or ingestion errors.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              {data?.inventory.health?.health_percentage || 100}% Ready
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Ready for Meta</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {data?.inventory.health?.ready_for_meta || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Missing Images</span>
              <p className={`text-lg font-bold mt-0.5 ${(data?.inventory.health?.missing_images || 0) > 0 ? "text-amber-600" : "text-gray-700 dark:text-gray-300"}`}>
                {data?.inventory.health?.missing_images || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Missing Prices</span>
              <p className={`text-lg font-bold mt-0.5 ${(data?.inventory.health?.missing_prices || 0) > 0 ? "text-rose-600" : "text-gray-700 dark:text-gray-300"}`}>
                {data?.inventory.health?.missing_prices || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Missing Year/Model</span>
              <p className={`text-lg font-bold mt-0.5 ${(data?.inventory.health?.missing_years || 0) > 0 ? "text-amber-600" : "text-gray-700 dark:text-gray-300"}`}>
                {data?.inventory.health?.missing_years || 0}
              </p>
            </div>
          </div>

          {data?.inventory.health?.problematic_items && data.inventory.health.problematic_items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Items Requiring Attention Before Meta Sync:
              </h4>
              <div className="space-y-2">
                {data.inventory.health.problematic_items.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Car #{item.id}: {item.title}
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      {item.issues.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

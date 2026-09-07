import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, 
  Globe, 
  MapPin, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet, 
  RefreshCw, 
  Eye, 
  Layers, 
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

interface ActiveVisitor {
  id: number;
  session_id: string;
  visitor_id: string;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  page_url: string;
  page_title: string;
  device_type: string;
  browser: string;
  os: string;
  duration_seconds: number;
  is_bounce: number;
  created_at: string;
  updated_at: string;
  seconds_ago?: number;
}

interface LiveData {
  live_count: number;
  active_visitors: ActiveVisitor[];
  active_pages: { page_url: string; count: number }[];
  active_cities: { city: string; count: number }[];
  timestamp: string;
}

export default function LiveVisitorsCard() {
  const { token } = useAuth();
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const timerRef = useRef<any>(null);

  const fetchLive = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics/live`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch live visitor data:", err);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLive(true);
    }
  }, [token]);

  // Real-time polling interval (every 5 seconds)
  useEffect(() => {
    if (autoRefresh && token) {
      timerRef.current = setInterval(() => {
        fetchLive(false);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, token]);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "Just started";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getRelativeTime = (secondsAgo?: number) => {
    if (secondsAgo === undefined || secondsAgo === null || secondsAgo <= 5) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const mins = Math.floor(secondsAgo / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Radio className="size-4 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Live Active Visitors Right Now
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                <span>{liveData?.live_count || 0} Online</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time live feed of users actively browsing pages on your website.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              autoRefresh 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
            <span>{autoRefresh ? "Live Auto-Sync (5s)" : "Auto-Sync Paused"}</span>
          </button>

          <button
            onClick={() => fetchLive(true)}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            title="Refresh now"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#1C3EB9]" : ""}`} />
          </button>

          <Link
            to="/reports/visitors"
            className="px-3 py-1.5 rounded-xl bg-[#1C3EB9] hover:bg-[#153096] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
          >
            <span>All Logs</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Real-time Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Active Pages Pill */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 flex items-center gap-1">
            <Globe className="size-3 text-[#1C3EB9]" />
            <span>Pages Currently Being Viewed</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {liveData?.active_pages && liveData.active_pages.length > 0 ? (
              liveData.active_pages.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 shadow-2xs"
                >
                  <span className="text-[#1C3EB9]">{p.page_url === "/" ? "/ (Home)" : p.page_url}</span>
                  <span className="w-4 h-4 rounded-full bg-[#1C3EB9]/10 text-[#1C3EB9] text-[10px] flex items-center justify-center font-extrabold ml-1">
                    {p.count}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Waiting for live traffic...</span>
            )}
          </div>
        </div>

        {/* Active Locations Pill */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 flex items-center gap-1">
            <MapPin className="size-3 text-emerald-600" />
            <span>Active Visitor Locations</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {liveData?.active_cities && liveData.active_cities.length > 0 ? (
              liveData.active_cities.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 shadow-2xs"
                >
                  <span className="text-emerald-600">📍 {c.city}</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 text-[10px] flex items-center justify-center font-extrabold ml-1">
                    {c.count}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">Waiting for location pings...</span>
            )}
          </div>
        </div>
      </div>

      {/* Live Visitors Stream Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th className="py-2.5 px-3">Live Status</th>
              <th className="py-2.5 px-3">Current Active Page</th>
              <th className="py-2.5 px-3">Location & IP</th>
              <th className="py-2.5 px-3">Device / Browser</th>
              <th className="py-2.5 px-3 text-right">Time on Site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {liveData?.active_visitors && liveData.active_visitors.length > 0 ? (
              liveData.active_visitors.slice(0, 6).map((v) => {
                const DeviceIcon = v.device_type === "Mobile" ? Smartphone : (v.device_type === "Tablet" ? Tablet : Monitor);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Live Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {getRelativeTime(v.seconds_ago)}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-gray-400 block pl-3.5">
                        {v.visitor_id.substring(0, 8)}...
                      </span>
                    </td>

                    {/* Current Page */}
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="font-bold text-[#1C3EB9] truncate" title={v.page_url}>
                        {v.page_url === "/" ? "/ (Home)" : v.page_url}
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block">
                        {v.page_title || "Selectt"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200">
                        <MapPin className="size-3 text-emerald-600 shrink-0" />
                        <span>{v.city || "Raipur"}</span>
                        {v.region && <span className="text-gray-400 text-[10px] font-normal">({v.region})</span>}
                      </div>
                      <span className="font-mono text-[9px] text-gray-400 block pl-4">
                        {v.ip_address || "127.0.0.1"}
                      </span>
                    </td>

                    {/* Device */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                        <DeviceIcon className="size-3.5 text-gray-500" />
                        <span>{v.device_type}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block pl-5">
                        {v.browser} • {v.os}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1C3EB9] dark:bg-blue-950/40 dark:text-blue-300">
                        <Clock className="size-2.5" />
                        <span>{formatDuration(v.duration_seconds)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">
                  No active visitors detected right now. Open frontend website in a new tab to see live activity!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

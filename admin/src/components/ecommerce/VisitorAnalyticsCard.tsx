import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { 
  Users, 
  Eye, 
  Clock, 
  Activity, 
  MapPin, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  ExternalLink,
  ArrowUpRight,
  Radio,
  Layers,
  Compass
} from "lucide-react";
import { Link } from "react-router";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

interface VisitorOverviewData {
  kpis: {
    total_pageviews: number;
    total_sessions: number;
    unique_visitors: number;
    avg_duration_seconds: number;
    bounce_rate: number;
    live_active_visitors: number;
  };
  chart: { label: string; visitors: number; pageviews: number }[];
  top_pages: { page_url: string; page_title: string; views: number; avg_duration: number }[];
  top_locations: { city: string; region: string; country: string; visitors: number; percentage: number }[];
  device_breakdown: { device_type: string; count: number; percentage: number }[];
  browser_breakdown: { browser: string; count: number }[];
  traffic_sources: { source: string; count: number }[];
}

export default function VisitorAnalyticsCard() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<string>("30days");
  const [data, setData] = useState<VisitorOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const fetchAnalytics = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/analytics/overview?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load visitor analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics(period);
    }
  }, [token, period]);

  // Format seconds to mm:ss or s
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const chartCategories = data?.chart?.map(c => c.label) || [];
  const chartVisitors = data?.chart?.map(c => c.visitors) || [];
  const chartPageviews = data?.chart?.map(c => c.pageviews) || [];

  const chartOptions: ApexOptions = {
    chart: {
      type: chartType,
      height: 270,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ["#1C3EB9", "#10B981"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: chartType === "area" ? [3, 2.5] : [0, 0]
    },
    fill: chartType === "area" ? {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    } : { opacity: 0.9 },
    markers: {
      size: 3,
      strokeWidth: 2,
      hover: { size: 6 }
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "11px",
          fontWeight: 600
        },
        rotate: -30
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "11px",
          fontWeight: 600
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      markers: {
        size: 6
      }
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `${val}`
      }
    }
  };

  const chartSeries = [
    { name: "Unique Visitors", data: chartVisitors },
    { name: "Pageviews", data: chartPageviews }
  ];

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1C3EB9]/10 text-[#1C3EB9] flex items-center justify-center font-bold">
              <Activity className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Website Traffic & Visitor Analytics
                </h2>
                {data?.kpis?.live_active_visitors !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Radio className="size-3 animate-pulse text-emerald-600" />
                    <span>{data.kpis.live_active_visitors} Live Now</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time tracking of visitor locations, page journeys, session duration, and bounce rate.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Period Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-lg transition-all ${chartType === "area" ? "bg-white dark:bg-gray-700 text-[#1C3EB9] shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"}`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-lg transition-all ${chartType === "bar" ? "bg-white dark:bg-gray-700 text-[#1C3EB9] shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"}`}
            >
              Bar
            </button>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1C3EB9] cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="all">All Time</option>
          </select>

          <Link
            to="/reports/visitors"
            className="px-3 py-1.5 rounded-xl bg-[#1C3EB9] hover:bg-[#153096] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
          >
            <span>Full Logs</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* Total Pageviews */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pageviews
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#1C3EB9] dark:bg-blue-950/40">
              <Eye className="size-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {loading ? "..." : (data?.kpis?.total_pageviews || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Total page visits</span>
        </div>

        {/* Unique Visitors */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Unique Visitors
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {loading ? "..." : (data?.kpis?.unique_visitors || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Individual users</span>
        </div>

        {/* Total Sessions */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sessions
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {loading ? "..." : (data?.kpis?.total_sessions || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Browsing sessions</span>
        </div>

        {/* Avg Duration on Site */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg. Time on Site
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            {loading ? "..." : formatDuration(data?.kpis?.avg_duration_seconds || 0)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Per visitor session</span>
        </div>

        {/* Bounce Rate */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/70 dark:bg-white/[0.02] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Bounce Rate
            </span>
            <div className={`p-1.5 rounded-lg ${Number(data?.kpis?.bounce_rate || 0) > 60 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Activity className="size-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>{loading ? "..." : `${data?.kpis?.bounce_rate || 0}%`}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">&lt; 15s single-page visits</span>
        </div>
      </div>

      {/* Main Traffic Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Visitor Trends & Pageview Volume
          </h3>
          <span className="text-[11px] text-gray-400">
            {period === "today" ? "Hourly breakdowns" : "Daily tracking records"}
          </span>
        </div>
        <div className="w-full h-[270px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/30 rounded-xl">
              <div className="w-8 h-8 rounded-full border-2 border-[#1C3EB9] border-t-transparent animate-spin"></div>
            </div>
          ) : chartCategories.length > 0 ? (
            <Chart options={chartOptions} series={chartSeries} type={chartType} height={270} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <span>No visitor traffic recorded for this selected period</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Breakdown (Top Pages, Visitor Locations, Devices) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* 1. Top Visited Pages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Globe className="size-3.5 text-[#1C3EB9]" />
              <span>Top Visited Pages</span>
            </h3>
            <span className="text-[10px] font-semibold text-gray-400">Views / Avg Time</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="text-xs text-gray-400 py-4 text-center">Loading pages...</div>
            ) : data?.top_pages && data.top_pages.length > 0 ? (
              data.top_pages.slice(0, 5).map((page, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[170px]" title={page.page_url}>
                      {page.page_url === "/" ? "/ (Home)" : page.page_url}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="text-[#1C3EB9] font-bold">{page.views}</span>
                      <span className="text-gray-400 font-medium">({formatDuration(page.avg_duration)})</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-[#1C3EB9] rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, ((page.views / (data?.kpis?.total_pageviews || 1)) * 100)))}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-3 text-center">No page data</div>
            )}
          </div>
        </div>

        {/* 2. Top Locations (Cities) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-emerald-600" />
              <span>Visitor Locations</span>
            </h3>
            <span className="text-[10px] font-semibold text-gray-400">Visitors / Share</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="text-xs text-gray-400 py-4 text-center">Loading locations...</div>
            ) : data?.top_locations && data.top_locations.length > 0 ? (
              data.top_locations.slice(0, 5).map((loc, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {loc.city}
                      </span>
                      {loc.region && (
                        <span className="text-[10px] text-gray-400 font-medium">({loc.region})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-emerald-600">{loc.visitors}</span>
                      <span className="text-gray-400 font-medium">{loc.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(8, loc.percentage))}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-3 text-center">No location data</div>
            )}
          </div>
        </div>

        {/* 3. Device & Traffic Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Monitor className="size-3.5 text-indigo-600" />
              <span>Devices & Channels</span>
            </h3>
            <span className="text-[10px] font-semibold text-gray-400">Share %</span>
          </div>

          {/* Device Types */}
          <div className="grid grid-cols-3 gap-2">
            {data?.device_breakdown?.map((dev, idx) => {
              const Icon = dev.device_type === "Mobile" ? Smartphone : (dev.device_type === "Tablet" ? Tablet : Monitor);
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 text-center">
                  <Icon className="size-4 mx-auto mb-1 text-gray-600 dark:text-gray-300" />
                  <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{dev.device_type}</div>
                  <div className="text-xs font-extrabold text-[#1C3EB9] mt-0.5">{dev.percentage}%</div>
                </div>
              );
            })}
          </div>

          {/* Top Referrers */}
          <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Traffic Sources</span>
            {data?.traffic_sources && data.traffic_sources.length > 0 ? (
              data.traffic_sources.slice(0, 3).map((src, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[160px] font-medium">{src.source}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{src.count}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">Direct traffic</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { API_URL } from "../../config/api";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RevenueTargetCard from "../../components/ecommerce/RevenueTargetCard";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import RecentTestDrives from "../../components/ecommerce/RecentTestDrives";
import VisitorAnalyticsCard from "../../components/ecommerce/VisitorAnalyticsCard";
import LiveVisitorsCard from "../../components/ecommerce/LiveVisitorsCard";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { Plus, FileText, Calendar, Filter } from "lucide-react";

export default function Home() {
  const { token, logout, user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  // Date & Time Period Filter State
  const [period, setPeriod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = (p = period, start = startDate, end = endDate) => {
    let url = `${API_URL}/api/dashboard/stats?period=${p}`;
    if (p === 'custom' && start && end) {
      url += `&startDate=${start}&endDate=${end}`;
    }
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.message === 'Invalid token.' || data.message === 'No token provided.') {
          logout();
          return;
        }
        setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (token) fetchStats(period, startDate, endDate);
  }, [token, period, startDate, endDate]);

  if (!stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1C3EB9] border-t-transparent animate-spin mb-3"></div>
        <span className="text-xs font-semibold text-gray-400 animate-pulse">Loading Minimalist Dashboard...</span>
      </div>
    );
  }

  if (stats.error || stats.message || !stats.charts) {
    return (
      <div className="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow-xs border border-red-100 flex flex-col justify-center items-center">
        <span className="text-base">Failed to load dashboard data.</span>
        <span className="text-xs font-normal mt-1 text-red-400">{stats.error || stats.message || "Invalid data format received"}</span>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Dashboard | Selectt Admin"
        description="Selectt Auto Hub Minimalist Admin Dashboard"
      />
      
      <div className="space-y-4 sm:space-y-5">
        {/* Sleek Minimalist Top Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-gray-800 p-4 sm:px-6 sm:py-4 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Welcome back, {user?.first_name || 'Admin'} 👋
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C3EB9] bg-[#1C3EB9]/10 px-2 py-0.5 rounded-full border border-[#1C3EB9]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C3EB9] animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Overview of catalog inventory, sales, test drives, and customer inquiries.
            </p>
          </div>

          {/* Minimalist Quick Action Buttons & Date Filter */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Date & Time Period Filter */}
            <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-2xs">
              <Filter className="size-3.5 text-[#1C3EB9]" />
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer text-gray-800 dark:text-gray-200"
              >
                <option value="all">📅 All Time (Overall)</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            <Link
              to="/cars?action=new"
              className="px-4 py-2 rounded-full bg-[#465FFF] hover:bg-[#364AF0] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Add New Car</span>
            </Link>
            <Link
              to="/sell-requests"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <FileText className="size-3.5 text-gray-500" />
              <span>Sell Requests</span>
            </Link>
            <Link
              to="/test-drives"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Calendar className="size-3.5 text-gray-500" />
              <span>Test Drives</span>
            </Link>
          </div>
        </div>

        {/* Custom Date Range Picker bar if selected */}
        {period === "custom" && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-gray-900 border border-slate-200/90 dark:border-gray-800 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#1C3EB9]/10 flex items-center justify-center text-[#1C3EB9]">
                <Calendar className="size-4" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Select Custom Date Range</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) {
                    try { (input as any).showPicker(); } catch (err) {}
                  }
                }}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-slate-200/90 dark:border-gray-700 hover:border-[#1C3EB9] rounded-xl px-3.5 py-2 shadow-2xs cursor-pointer transition-all active:scale-98"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase select-none">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  onClick={e => {
                    try { (e.currentTarget as any).showPicker(); } catch (err) {}
                  }}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-32"
                />
              </label>
              <span className="text-xs font-extrabold text-slate-400">→</span>
              <label 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) {
                    try { (input as any).showPicker(); } catch (err) {}
                  }
                }}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-slate-200/90 dark:border-gray-700 hover:border-[#1C3EB9] rounded-xl px-3.5 py-2 shadow-2xs cursor-pointer transition-all active:scale-98"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase select-none">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  onClick={e => {
                    try { (e.currentTarget as any).showPicker(); } catch (err) {}
                  }}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-32"
                />
              </label>
            </div>
          </div>
        )}

        {/* Primary Business Metrics Grid */}
        <div>
          <EcommerceMetrics metrics={stats.metrics} />
        </div>

        {/* Financial Analytics & Target Goal Hub */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <div className="col-span-12 xl:col-span-8">
            <StatisticsChart charts={stats.charts} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <RevenueTargetCard
              todayRevenue={stats.todayRevenue || 0}
              monthlyRevenue={stats.monthlyRevenue || 0}
              monthlyTarget={stats.monthlyTarget || 2000000}
            />
          </div>
        </div>

        {/* Real-Time Live Visitors Stream & Website Traffic Analytics */}
        <div className="space-y-4 sm:space-y-5">
          <LiveVisitorsCard />
          <VisitorAnalyticsCard />
        </div>

        {/* Real-Time Activity Feeds */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <div className="col-span-12 xl:col-span-6">
            <RecentOrders orders={stats.recentOrders || []} />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <RecentTestDrives testDrives={stats.recentTestDrives || []} />
          </div>
        </div>
      </div>
    </>
  );
}

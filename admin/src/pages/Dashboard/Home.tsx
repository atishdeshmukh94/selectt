import { API_URL } from "../../config/api";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import RecentTestDrives from "../../components/ecommerce/RecentTestDrives";
import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { token, logout, user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  const fetchStats = () => {
    fetch(`${API_URL}/api/dashboard/stats`, {
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
    if (token) fetchStats();
  }, [token]);

  if (!stats) return <div className="p-10 text-center animate-pulse text-gray-400">Loading Dashboard...</div>;
  if (stats.error || stats.message || !stats.charts) return (
    <div className="p-10 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-100 flex flex-col justify-center items-center">
      <span>Failed to load dashboard data.</span>
      <span className="text-sm font-normal mt-2 text-red-400">{stats.error || stats.message || "Invalid data format received"}</span>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Dashboard | Selectt Admin"
        description="This is Admin Dashboard page for Selectt"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Welcome Greeting Banner */}
        <div className="col-span-12 flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 rounded-3xl text-white shadow-sm mb-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute left-1/3 bottom-0 -mb-10 h-32 w-32 rounded-full bg-white/5 blur-lg"></div>
          <div className="z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.first_name || 'Admin'} 👋
            </h1>
            <p className="mt-1 text-blue-100 text-sm font-medium">
              Here is a summary of what's happening in Selectt Auto Hub today.
            </p>
          </div>
          <div className="z-10 shrink-0 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white">System Status: Active</span>
          </div>
        </div>

        {/* Core metrics and sections list */}
        <div className="col-span-12">
          <EcommerceMetrics metrics={stats.metrics} />
        </div>

        {/* Charts Section */}
        <div className="col-span-12">
          <StatisticsChart charts={stats.charts} />
        </div>

        {/* Recent actions tables */}
        <div className="col-span-12 xl:col-span-6">
          <RecentOrders orders={stats.recentOrders || []} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <RecentTestDrives testDrives={stats.recentTestDrives || []} />
        </div>
      </div>
    </>
  );
}


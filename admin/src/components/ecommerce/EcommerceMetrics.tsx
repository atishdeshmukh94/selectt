import { Link } from "react-router";
import {
  Car,
  Heart,
  Calendar,
  FileText,
  Tag,
  ShoppingBag,
  Users,
  Coins,
  MapPin,
  Image as ImageIcon,
  BookOpen,
  FolderKanban,
  UserCheck,
  Video,
  Clock,
  ArrowRight,
  Zap
} from "lucide-react";

interface EcommerceMetricsProps {
  metrics: {
    totalCustomers: number;
    totalCars: number;
    totalOrders: number;
    soldOutCars: number;
    testDrivesBooked: number;
    wishlistedCars: number;
    sellRequests: number;
    loanApplications: number;
    locations: number;
    banners: number;
    blogPosts: number;
    testimonials: number;
    brands: number;
    models: number;
    staff: number;
    calendarEvents: number;
  };
}

export default function EcommerceMetrics({ metrics }: EcommerceMetricsProps) {
  // Primary KPI Metrics
  const primaryKpis = [
    {
      title: "Total Customers",
      value: metrics.totalCustomers || 0,
      description: "Buyer & seller accounts",
      path: "/customers",
      icon: <Users className="size-5 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40"
    },
    {
      title: "Total Listed Cars",
      value: metrics.totalCars || 0,
      description: "Catalog vehicles",
      path: "/cars",
      icon: <Car className="size-5 text-[#1C3EB9] dark:text-[#1C3EB9]" />,
      iconBg: "bg-[#E6FAF7] dark:bg-[#1C3EB9]/20 border border-[#1C3EB9]/20"
    },
    {
      title: "Booked Cars",
      value: metrics.totalOrders || 0,
      description: "Successful sales orders",
      path: "/booked-cars",
      icon: <ShoppingBag className="size-5 text-violet-600 dark:text-violet-400" />,
      iconBg: "bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40"
    },
    {
      title: "Test Drives Booked",
      value: metrics.testDrivesBooked || 0,
      description: "Scheduled test runs",
      path: "/test-drives",
      icon: <Calendar className="size-5 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40"
    },
    {
      title: "Inbound Sell Requests",
      value: metrics.sellRequests || 0,
      description: "Private seller offers",
      path: "/sell-requests",
      icon: <FileText className="size-5 text-cyan-600 dark:text-cyan-400" />,
      iconBg: "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/40"
    },
    {
      title: "Loan Applications",
      value: metrics.loanApplications || 0,
      description: "Auto finance leads",
      path: "/loan-applications",
      icon: <Coins className="size-5 text-rose-600 dark:text-rose-400" />,
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40"
    }
  ];

  // Secondary Administration & Content Sections
  const adminSections = [
    {
      title: "Wishlisted Cars",
      value: metrics.wishlistedCars || 0,
      path: "/reports/wishlist",
      icon: <Heart className="size-4 text-pink-500" />,
      bg: "bg-pink-500/10"
    },
    {
      title: "Sold Out Cars",
      value: metrics.soldOutCars || 0,
      path: "/cars",
      icon: <Tag className="size-4 text-slate-500" />,
      bg: "bg-slate-500/10"
    },
    {
      title: "Active Banners",
      value: metrics.banners || 0,
      path: "/banners",
      icon: <ImageIcon className="size-4 text-orange-500" />,
      bg: "bg-orange-500/10"
    },
    {
      title: "Blog Posts",
      value: metrics.blogPosts || 0,
      path: "/blog",
      icon: <BookOpen className="size-4 text-emerald-500" />,
      bg: "bg-emerald-500/10"
    },
    {
      title: "Active Hubs",
      value: metrics.locations || 0,
      path: "/locations",
      icon: <MapPin className="size-4 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Brands / Models",
      value: `${metrics.brands || 0} / ${metrics.models || 0}`,
      path: "/brands",
      icon: <FolderKanban className="size-4 text-purple-500" />,
      bg: "bg-purple-500/10"
    },
    {
      title: "Staff Members",
      value: metrics.staff || 0,
      path: "/staff",
      icon: <UserCheck className="size-4 text-indigo-500" />,
      bg: "bg-indigo-500/10"
    },
    {
      title: "Video Reviews",
      value: metrics.testimonials || 0,
      path: "/testimonials-video",
      icon: <Video className="size-4 text-red-500" />,
      bg: "bg-red-500/10"
    },
    {
      title: "Calendar Events",
      value: metrics.calendarEvents || 0,
      path: "/calendar",
      icon: <Clock className="size-4 text-teal-500" />,
      bg: "bg-teal-500/10"
    }
  ];

  return (
    <div className="space-y-5">
      {/* Primary KPIs */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {primaryKpis.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="group flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs hover:shadow-sm hover:border-[#1C3EB9]/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
                  {item.title}
                </span>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105 ${item.iconBg}`}>
                  {item.icon}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {item.value.toLocaleString()}
                </h4>
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-400 dark:text-gray-500 group-hover:text-[#1C3EB9] transition-colors">
                  Manage
                </span>
                <ArrowRight className="size-3 text-gray-300 group-hover:text-[#1C3EB9] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Administrative and Content Panels */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Management & Operations Panels
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 sm:gap-3.5">
          {adminSections.map((section, idx) => (
            <Link
              key={idx}
              to={section.path}
              className="group flex items-center justify-between rounded-xl border border-gray-200/70 bg-white px-3.5 py-3 hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.02] shadow-2xs transition-all duration-150"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${section.bg}`}>
                  {section.icon}
                </div>
                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs group-hover:text-[#1C3EB9] transition-colors truncate">
                  {section.title}
                </h5>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                  {section.value}
                </span>
                <ArrowRight className="size-3 text-gray-300 group-hover:text-[#1C3EB9] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

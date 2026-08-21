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
  ArrowRight
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
      description: "Registered buyer & seller accounts",
      path: "/customers",
      icon: <Users className="size-6 text-blue-600 dark:text-blue-400" />,
      colorClass: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30",
      accentBg: "bg-blue-100/80 dark:bg-blue-950/40",
      changeText: "+12.5% vs last month"
    },
    {
      title: "Total Listed Cars",
      value: metrics.totalCars || 0,
      description: "Vehicles in catalog inventory",
      path: "/cars",
      icon: <Car className="size-6 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30",
      accentBg: "bg-emerald-100/80 dark:bg-emerald-950/40",
      changeText: "Active listing catalog"
    },
    {
      title: "Booked Cars (Orders)",
      value: metrics.totalOrders || 0,
      description: "Successful sales bookings",
      path: "/booked-cars",
      icon: <ShoppingBag className="size-6 text-violet-600 dark:text-violet-400" />,
      colorClass: "from-violet-500/10 to-purple-500/5 hover:border-violet-500/30",
      accentBg: "bg-violet-100/80 dark:bg-violet-950/40",
      changeText: "+5.2% transaction rate"
    },
    {
      title: "Test Drives Booked",
      value: metrics.testDrivesBooked || 0,
      description: "Scheduled customer test runs",
      path: "/test-drives",
      icon: <Calendar className="size-6 text-amber-600 dark:text-amber-400" />,
      colorClass: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/30",
      accentBg: "bg-amber-100/80 dark:bg-amber-950/40",
      changeText: "Actionable drive leads"
    },
    {
      title: "Inbound Sell Requests",
      value: metrics.sellRequests || 0,
      description: "Private sellers offering cars",
      path: "/sell-requests",
      icon: <FileText className="size-6 text-cyan-600 dark:text-cyan-400" />,
      colorClass: "from-cyan-500/10 to-sky-500/5 hover:border-cyan-500/30",
      accentBg: "bg-cyan-100/80 dark:bg-cyan-950/40",
      changeText: "Needs review & appraisal"
    },
    {
      title: "Loan Applications",
      value: metrics.loanApplications || 0,
      description: "Auto finance inquiries",
      path: "/loan-applications",
      icon: <Coins className="size-6 text-rose-600 dark:text-rose-400" />,
      colorClass: "from-rose-500/10 to-pink-500/5 hover:border-rose-500/30",
      accentBg: "bg-rose-100/80 dark:bg-rose-950/40",
      changeText: "Credit approvals & verification"
    }
  ];

  // Secondary Administration & Content Sections
  const adminSections = [
    {
      title: "Wishlisted Cars",
      value: metrics.wishlistedCars || 0,
      description: "User favorites statistics",
      path: "/reports/wishlist",
      icon: <Heart className="size-5 text-pink-500" />,
      bg: "bg-pink-500/10"
    },
    {
      title: "Sold Out Cars",
      value: metrics.soldOutCars || 0,
      description: "Archived sales inventory",
      path: "/cars",
      icon: <Tag className="size-5 text-slate-500" />,
      bg: "bg-slate-500/10"
    },
    {
      title: "Active Banners",
      value: metrics.banners || 0,
      description: "Homepage promo slider",
      path: "/banners",
      icon: <ImageIcon className="size-5 text-orange-500" />,
      bg: "bg-orange-500/10"
    },
    {
      title: "Blog Posts",
      value: metrics.blogPosts || 0,
      description: "Content marketing articles",
      path: "/blog",
      icon: <BookOpen className="size-5 text-emerald-500" />,
      bg: "bg-emerald-500/10"
    },
    {
      title: "Active Hubs (Locations)",
      value: metrics.locations || 0,
      description: "Regional business locations",
      path: "/locations",
      icon: <MapPin className="size-5 text-blue-500" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Brands / Models",
      value: `${metrics.brands || 0} / ${metrics.models || 0}`,
      description: "Supported makes inventory list",
      path: "/brands",
      icon: <FolderKanban className="size-5 text-purple-500" />,
      bg: "bg-purple-500/10"
    },
    {
      title: "Staff Members",
      value: metrics.staff || 0,
      description: "Administrators & staff access",
      path: "/staff",
      icon: <UserCheck className="size-5 text-indigo-500" />,
      bg: "bg-indigo-500/10"
    },
    {
      title: "Video Testimonials",
      value: metrics.testimonials || 0,
      description: "Client reviews and feedback",
      path: "/testimonials-video",
      icon: <Video className="size-5 text-red-500" />,
      bg: "bg-red-500/10"
    },
    {
      title: "Calendar Events",
      value: metrics.calendarEvents || 0,
      description: "Scheduled meetings & tasks",
      path: "/calendar",
      icon: <Clock className="size-5 text-teal-500" />,
      bg: "bg-teal-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary KPIs */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          Core Business Indicators
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {primaryKpis.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`group flex flex-col justify-between rounded-3xl border border-gray-150 bg-gradient-to-br ${item.colorClass} p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">
                    {item.title}
                  </span>
                  <h4 className="mt-2 text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                    {item.value.toLocaleString()}
                  </h4>
                </div>
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.accentBg}`}>
                  {item.icon}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100/50 dark:border-gray-800/55 flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {item.description}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Manage <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Administrative and Content Panels */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          Management & Administration Panels
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {adminSections.map((section, idx) => (
            <Link
              key={idx}
              to={section.path}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-500/40 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] transition-all duration-200 ease-in-out"
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${section.bg} group-hover:scale-105 transition-transform duration-200`}>
                  {section.icon}
                </div>
                <div>
                  <h5 className="font-bold text-gray-800 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {section.title}
                  </h5>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                  {section.value}
                </span>
                <ArrowRight className="size-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

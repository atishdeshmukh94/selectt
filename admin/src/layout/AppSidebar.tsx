import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { API_URL } from "../config/api";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  role?: "admin" | "staff";
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Car Inventory",
    subItems: [
      { name: "Manage Cars", path: "/cars" },
      { name: "Brand & Models", path: "/brands" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Booked Cars",
    path: "/booked-cars",
  },
  {
    icon: <ListIcon />,
    name: "Sell Requests",
    path: "/sell-requests",
  },
  {
    icon: <CalenderIcon />,
    name: "Test Drives",
    path: "/test-drives",
  },
  {
    icon: <PageIcon />,
    name: "Loan Applications",
    path: "/loan-applications",
    role: "admin",
  },
  {
    icon: <TableIcon />,
    name: "Wishlisted Cars",
    path: "/reports/wishlist",
    role: "admin",
  },
  {
    icon: <UserCircleIcon />,
    name: "Customers",
    path: "/customers",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/staff",
    role: "admin",
  },
  {
    icon: <PageIcon />,
    name: "Blog",
    path: "/blog",
  },
  {
    icon: <GridIcon />,
    name: "Media Library",
    path: "/media-library",
  },
  {
    icon: <PieChartIcon />,
    name: "Reports",
    role: "admin",
    subItems: [
      { name: "Payment Transactions", path: "/reports/payments" },
    ],
  },
  {
    icon: <GridIcon />,
    name: "Site Settings",
    role: "admin",
    subItems: [
      { name: "Image & Branding", path: "/image-settings" },
      { name: "Video Reviews", path: "/testimonials-video" },
      { name: "Locations", path: "/locations" },
      { name: "Car Hub Locations", path: "/settings/car-hubs" },
      { name: "Customer Reviews", path: "/settings/customer-reviews" },
      { name: "Payment Gateway", path: "/settings/payment" },
      { name: "SMTP Settings", path: "/settings/smtp" },
      { name: "Maintenance Mode", path: "/settings/maintenance" },
      { name: "WhatsApp API", path: "/settings/whatsapp" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { getSetting } = useSettings();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === "main" && prev.index === index) return null;
      return { type: "main", index };
    });
  };

  const { user } = useAuth();

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.filter(nav => !nav.role || nav.role === user?.role).map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu?.type === "main" && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[260px]"
            : isHovered
            ? "w-[260px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-6 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={
                  getSetting("admin_logo")
                    ? `${API_URL}${getSetting("admin_logo")}`
                    : "/images/logo/dark-logo.svg"
                }
                alt="Selectt Logo"
                width={140}
                height={36}
              />
              <img
                className="hidden dark:block"
                src={
                  getSetting("admin_logo_dark")
                    ? `${API_URL}${getSetting("admin_logo_dark")}`
                    : "/images/logo/dark-logo.svg"
                }
                alt="Selectt Logo"
                width={140}
                height={36}
              />
            </>
          ) : (
            <img
              src={
                getSetting("admin_logo_icon")
                  ? `${API_URL}${getSetting("admin_logo_icon")}`
                  : "/images/logo/favicon.png"
              }
              alt="Selectt"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-2">
            {(isExpanded || isHovered || isMobileOpen) && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1">
                Navigation
              </p>
            )}
            {!isExpanded && !isHovered && !isMobileOpen && (
              <div className="flex justify-center mb-2">
                <HorizontaLDots className="size-5 text-gray-400" />
              </div>
            )}
            {renderMenuItems(navItems)}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;

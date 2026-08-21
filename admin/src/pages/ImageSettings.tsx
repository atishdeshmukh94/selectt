import React, { useState } from "react";
import { Image as ImageIcon, Sliders, Layers } from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import SiteSettings from "./SiteSettings";
import BannerManagement from "./BannerManagement";

export default function ImageSettings() {
  const [activeTab, setActiveTab] = useState<"branding" | "banners">("branding");

  return (
    <>
      <PageMeta
        title="Image Settings | Selectt Admin Panel"
        description="Manage brand logos, page hero banners, promotional images, and sliders."
      />

      <div className="p-4 md:p-6 space-y-6">
        <PageBreadCrumb pageTitle="Image Settings" />

        {/* Top Tab Bar Navigation */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "branding"
                ? "bg-[#00C9AF] text-[#0C1B33] shadow-md"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
          >
            <ImageIcon size={16} /> Brand Logos
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === "banners"
                ? "bg-[#00C9AF] text-[#0C1B33] shadow-md"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
          >
            <Sliders size={16} /> Page Sliders & Banners
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "branding" ? (
          <SiteSettings section="branding" />
        ) : (
          <BannerManagement />
        )}
      </div>
    </>
  );
}

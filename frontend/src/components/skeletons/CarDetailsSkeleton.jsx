import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const CarDetailsSkeleton = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-navy-900 pb-20 pt-4 sm:pt-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton width={50} height={14} borderRadius={4} />
        <Skeleton width={12} height={14} borderRadius={2} />
        <Skeleton width={70} height={14} borderRadius={4} />
        <Skeleton width={12} height={14} borderRadius={2} />
        <Skeleton width={150} height={14} borderRadius={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Section (Gallery + Specs) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Gallery Card */}
          <div className="bg-white dark:bg-card-dark rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden mb-3">
              <Skeleton height="100%" borderRadius={16} className="block leading-none" />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                  <Skeleton height="100%" borderRadius={12} className="block leading-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <Skeleton width={140} height={20} borderRadius={6} className="mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Skeleton width={60} height={12} borderRadius={4} className="mb-2" />
                  <Skeleton width={90} height={16} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>

          {/* Inspection / Overview Card */}
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <Skeleton width={180} height={22} borderRadius={6} className="mb-3" />
            <Skeleton count={3} height={14} className="mb-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Skeleton width="70%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section (Pricing & Booking Card) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-lg sticky top-24 space-y-5">
            {/* Title & Badge */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Skeleton width={90} height={22} borderRadius={20} />
                <Skeleton circle width={36} height={36} />
              </div>
              <Skeleton width="90%" height={26} borderRadius={6} className="mb-2" />
              <Skeleton width="60%" height={16} borderRadius={4} />
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <Skeleton width={80} height={12} borderRadius={4} />
              <div className="flex items-baseline justify-between">
                <Skeleton width={150} height={32} borderRadius={6} />
                <Skeleton width={80} height={18} borderRadius={4} />
              </div>
              <Skeleton width={120} height={14} borderRadius={4} />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Skeleton height={48} borderRadius={14} className="w-full" />
              <Skeleton height={44} borderRadius={14} className="w-full" />
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton circle width={18} height={18} />
                  <Skeleton width="75%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CarDetailsSkeleton;

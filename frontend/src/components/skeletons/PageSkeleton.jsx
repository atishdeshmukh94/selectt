import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { CarGridSkeleton } from './CarCardSkeleton';

/**
 * Universal Page Skeleton Loader
 * Replaces full-screen spinner preloader with a modern content layout placeholder.
 * Provides instant visual structure with zero layout shift during route transitions.
 */
export default function PageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Hero / Header Skeleton */}
      <div className="w-full rounded-3xl bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-3">
          <Skeleton height={14} width={120} borderRadius={6} />
          <Skeleton height={36} width="85%" borderRadius={10} />
          <Skeleton height={16} width="60%" borderRadius={6} />
        </div>

        {/* Filter / Search Bar Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton height={38} borderRadius={10} />
          <Skeleton height={38} borderRadius={10} />
          <Skeleton height={38} borderRadius={10} />
          <Skeleton height={38} borderRadius={10} />
        </div>
      </div>

      {/* Brand / Category Pills Skeleton */}
      <div className="flex gap-2.5 overflow-hidden py-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shrink-0">
            <Skeleton height={36} width={90} borderRadius={20} />
          </div>
        ))}
      </div>

      {/* Section Title Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton height={24} width={220} borderRadius={8} />
        <Skeleton height={16} width={80} borderRadius={6} />
      </div>

      {/* Responsive Cards Grid Skeleton */}
      <CarGridSkeleton count={8} />
    </div>
  );
}

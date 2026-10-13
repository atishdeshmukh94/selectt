import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const CarCardSkeleton = () => (
  <div className="rounded-[20px] overflow-hidden bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col w-full h-full p-3">
    {/* Image Container Skeleton */}
    <div className="relative h-[155px] w-full rounded-[14px] overflow-hidden mb-3">
      <Skeleton height="100%" borderRadius={14} className="leading-none block w-full h-full" />
    </div>

    {/* Content details */}
    <div className="px-1 flex-1 flex flex-col justify-between gap-3">
      <div>
        {/* Title */}
        <Skeleton height={18} width="85%" borderRadius={6} className="mb-2" />
        {/* Location */}
        <Skeleton height={13} width="50%" borderRadius={4} className="mb-3" />

        {/* Specs Pills */}
        <div className="flex gap-2">
          <Skeleton height={20} width={55} borderRadius={10} />
          <Skeleton height={20} width={50} borderRadius={10} />
          <Skeleton height={20} width={65} borderRadius={10} />
        </div>
      </div>

      {/* Price & CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton height={18} width={80} borderRadius={4} />
          <Skeleton height={11} width={60} borderRadius={4} />
        </div>
        <Skeleton height={32} width={70} borderRadius={10} />
      </div>
    </div>
  </div>
);

export const CarGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <CarCardSkeleton key={i} />
    ))}
  </div>
);

export default CarCardSkeleton;

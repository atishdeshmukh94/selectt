import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const VideoReviewGridSkeleton = ({ count = 5 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 justify-items-center w-full">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="w-full max-w-[240px] rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm p-2 flex flex-col space-y-2">
        <div className="aspect-[9/16] w-full rounded-xl overflow-hidden">
          <Skeleton height="100%" borderRadius={12} className="block leading-none" />
        </div>
        <Skeleton height={14} width="80%" borderRadius={4} />
        <Skeleton height={11} width="50%" borderRadius={4} />
      </div>
    ))}
  </div>
);

export const CarHubGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton height={20} width={160} borderRadius={6} />
          <Skeleton height={18} width={60} borderRadius={12} />
        </div>
        <Skeleton count={2} height={13} borderRadius={4} />
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <Skeleton height={14} width={100} borderRadius={4} />
          <Skeleton height={32} width={110} borderRadius={10} />
        </div>
      </div>
    ))}
  </div>
);

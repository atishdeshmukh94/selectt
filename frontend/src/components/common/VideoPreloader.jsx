import React from 'react';
import PageSkeleton from '../skeletons/PageSkeleton';
import Skeleton from 'react-loading-skeleton';

/**
 * Skeleton Loader Component (replaces previous spinner preloader)
 */
export default function VideoPreloader({
  fullScreen = true,
  message = '',
  className = ''
}) {
  if (fullScreen) {
    return (
      <div className={`w-full min-h-screen bg-slate-50/60 ${className}`}>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-[200px] bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3 ${className}`}>
      <Skeleton height={20} width={180} borderRadius={6} />
      <Skeleton height={14} width="85%" borderRadius={4} />
      <Skeleton height={14} width="60%" borderRadius={4} />
      <div className="pt-4 flex gap-3">
        <Skeleton height={36} width={120} borderRadius={10} />
        <Skeleton height={36} width={120} borderRadius={10} />
      </div>
    </div>
  );
}

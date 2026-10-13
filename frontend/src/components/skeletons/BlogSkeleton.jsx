import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const BlogCardSkeleton = () => (
  <div className="flex flex-col bg-white dark:bg-gray-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-sm">
    <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6">
      <Skeleton height="100%" borderRadius={16} className="block leading-none" />
    </div>
    <div className="space-y-3 flex-1 flex flex-col justify-between">
      <div>
        <Skeleton width={80} height={20} borderRadius={20} className="mb-3" />
        <Skeleton height={24} width="90%" borderRadius={6} className="mb-2" />
        <Skeleton count={2} height={14} borderRadius={4} className="mb-1" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <Skeleton width={90} height={14} borderRadius={4} />
        <Skeleton width={70} height={14} borderRadius={4} />
      </div>
    </div>
  </div>
);

export const BlogGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

export const BlogPostDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
    <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
      <Skeleton width={100} height={24} borderRadius={20} />
      <Skeleton height={36} width="95%" borderRadius={8} />
      <Skeleton height={36} width="70%" borderRadius={8} />
      <div className="flex justify-center gap-3 pt-3">
        <Skeleton width={110} height={14} borderRadius={4} />
        <Skeleton width={80} height={14} borderRadius={4} />
      </div>
    </div>

    <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden mb-10 shadow-md">
      <Skeleton height="100%" borderRadius={24} className="block leading-none" />
    </div>

    <div className="space-y-4 max-w-3xl mx-auto">
      <Skeleton height={18} width="100%" />
      <Skeleton height={18} width="95%" />
      <Skeleton height={18} width="90%" />
      <Skeleton height={18} width="98%" />
      <div className="py-4">
        <Skeleton height={28} width="40%" borderRadius={6} />
      </div>
      <Skeleton height={18} width="100%" />
      <Skeleton height={18} width="92%" />
      <Skeleton height={18} width="85%" />
    </div>
  </div>
);

export default BlogGridSkeleton;

import React from 'react';

/**
 * PlaceholderExampleImageSquare
 * Pure CSS responsive image square placeholder
 */
export const PlaceholderExampleImageSquare = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs animate-pulse">
        <div className="aspect-square bg-slate-200 rounded-xl" />
      </div>
    ))}
  </div>
);

/**
 * PlaceholderExampleLine
 * Simple skeleton lines placeholder
 */
export const PlaceholderExampleLine = () => (
  <div className="space-y-2.5 animate-pulse py-2">
    <div className="h-3 bg-slate-200 rounded-full w-full" />
    <div className="h-3 bg-slate-200 rounded-full w-5/6" />
    <div className="h-3 bg-slate-200 rounded-full w-4/6" />
    <div className="h-3 bg-slate-200 rounded-full w-3/6" />
    <div className="h-3 bg-slate-200 rounded-full w-1/2" />
  </div>
);

/**
 * SemanticCarCardSkeleton
 * High-fidelity car card placeholder with shimmer effect
 */
export const SemanticCarCardSkeleton = () => (
  <div className="bg-white rounded-[20px] border border-slate-200/80 p-3 h-[380px] flex flex-col justify-between overflow-hidden shadow-xs animate-pulse">
    {/* Card Image Placeholder */}
    <div className="rounded-[14px] bg-slate-200 w-full aspect-[4/3]" />

    {/* Content details placeholder */}
    <div className="mt-4 px-1 space-y-3 flex-1 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3.5 bg-slate-200 rounded-md w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded-md w-1/3" />
        <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      </div>
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded-md w-1/3" />
        <div className="h-8 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

/**
 * SemanticBannerSkeleton
 * Top promo banner placeholder with shimmer effect
 */
export const SemanticBannerSkeleton = () => (
  <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white h-[180px] sm:h-[190px] animate-pulse p-4 flex flex-col justify-center gap-3">
    <div className="h-6 bg-slate-200 rounded-lg w-2/5" />
    <div className="h-4 bg-slate-200 rounded-lg w-3/5" />
    <div className="h-8 bg-slate-200 rounded-xl w-32 mt-2" />
  </div>
);

export default PlaceholderExampleImageSquare;

import React from 'react';
import { Component as LumaSpin } from '@/components/ui/luma-spin';

export default function PagePreloader({ message = 'Loading Selectt...' }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0c1b33] text-white transition-all duration-300">
      <div className="flex flex-col items-center space-y-6">
        <LumaSpin />
        {message && (
          <p className="text-base font-semibold tracking-wider text-slate-100 uppercase animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

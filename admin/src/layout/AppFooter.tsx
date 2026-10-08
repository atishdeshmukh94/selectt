import React from "react";

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-white border-t border-gray-200 z-20 dark:border-gray-800 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3.5 mx-auto max-w-7xl md:px-6">
        {/* Left Side: Project Name, Portal Info & Version */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
            <span className="font-extrabold tracking-tight text-brand-600 dark:text-brand-400">Selectt.</span>
            <span className="font-semibold text-gray-600 dark:text-gray-300">Admin Portal</span>
          </div>

          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            v1.0.0
          </span>

          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>

          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            © {currentYear} SELECTT MOTOCORP PVT LTD. All rights reserved.
          </span>
        </div>

        {/* Right Side: Developed by Wepnex */}
        <div className="flex items-center justify-center md:justify-end gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Developed by</span>
          <a
            href="https://wepnex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-slate-200/80 dark:border-gray-700 transition-all shadow-2xs hover:scale-[1.02]"
          >
            <span>Wepnex</span>
            <span className="text-[10px] font-normal text-gray-400">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

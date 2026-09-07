import { Target, TrendingUp, ArrowUpRight } from "lucide-react";

interface RevenueTargetCardProps {
  todayRevenue?: number;
  monthlyRevenue?: number;
  monthlyTarget?: number;
}

export default function RevenueTargetCard({
  todayRevenue = 0,
  monthlyRevenue = 0,
  monthlyTarget = 2000000,
}: RevenueTargetCardProps) {
  const target = monthlyTarget > 0 ? monthlyTarget : 2000000;
  const progressPercent = Math.min(Math.round((monthlyRevenue / target) * 100), 100);
  
  const todayLakh = (todayRevenue / 100000).toFixed(2);
  const monthlyLakh = (monthlyRevenue / 100000).toFixed(2);
  const targetLakh = (target / 100000).toFixed(2);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1C3EB9]/10 text-[#1C3EB9] dark:bg-[#1C3EB9]/20">
              <Target className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Revenue & Goal Target
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                Monthly sales performance
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1C3EB9] bg-[#1C3EB9]/10 px-2 py-0.5 rounded-md">
            <TrendingUp className="size-3" />
            <span>{progressPercent}%</span>
          </span>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
              Today's Revenue
            </span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
              ₹{todayLakh} <span className="text-xs font-bold text-gray-400">Lakh</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#E6FAF7] dark:bg-[#1C3EB9]/10 border border-[#1C3EB9]/20">
            <span className="text-[11px] font-bold text-[#1C3EB9] uppercase tracking-wider block mb-0.5">
              Monthly Total
            </span>
            <span className="text-lg font-extrabold text-[#0C1B33] dark:text-white">
              ₹{monthlyLakh} <span className="text-xs font-bold text-[#1C3EB9]">Lakh</span>
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-400 dark:text-gray-500">Target Progress</span>
            <span className="text-gray-700 dark:text-gray-300 font-bold">
              ₹{monthlyLakh}L / ₹{targetLakh}L
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1C3EB9] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
        <span className="text-gray-400 text-[11px]">Updated live</span>
        <a
          href="/reports/payment"
          className="font-semibold text-[#1C3EB9] hover:underline flex items-center gap-0.5 text-xs"
        >
          Reports <ArrowUpRight className="size-3" />
        </a>
      </div>
    </div>
  );
}

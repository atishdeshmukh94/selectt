import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab";
import { CalenderIcon } from "../../icons";
import { BarChart3 } from "lucide-react";

export default function StatisticsChart({ charts }: { charts: { sales: number[], revenue: number[] } }) {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"monthly" | "quarterly" | "annually">("monthly");

  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, []);

  const getSubTitle = () => {
    switch (activeTab) {
      case "monthly":
        return "Monthly sales volume & revenue";
      case "quarterly":
        return "Quarterly sales volume & revenue";
      case "annually":
        return "Annual sales volume & revenue";
      default:
        return "Sales and revenue statistics";
    }
  };

  const getXAxisCategories = () => {
    switch (activeTab) {
      case "quarterly":
        return ["Q1", "Q2", "Q3", "Q4"];
      case "annually":
        return [new Date().getFullYear().toString()];
      case "monthly":
      default:
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
  };

  const getSeriesData = () => {
    const rawSales = charts?.sales || Array(12).fill(0);
    const rawRevenue = charts?.revenue || Array(12).fill(0);

    if (activeTab === "quarterly") {
      return {
        sales: [
          rawSales.slice(0, 3).reduce((a, b) => a + b, 0),
          rawSales.slice(3, 6).reduce((a, b) => a + b, 0),
          rawSales.slice(6, 9).reduce((a, b) => a + b, 0),
          rawSales.slice(9, 12).reduce((a, b) => a + b, 0),
        ],
        revenue: [
          rawRevenue.slice(0, 3).reduce((a, b) => a + b, 0),
          rawRevenue.slice(3, 6).reduce((a, b) => a + b, 0),
          rawRevenue.slice(6, 9).reduce((a, b) => a + b, 0),
          rawRevenue.slice(9, 12).reduce((a, b) => a + b, 0),
        ],
      };
    } else if (activeTab === "annually") {
      return {
        sales: [rawSales.reduce((a, b) => a + b, 0)],
        revenue: [rawRevenue.reduce((a, b) => a + b, 0)],
      };
    } else {
      return {
        sales: rawSales,
        revenue: rawRevenue,
      };
    }
  };

  const currentData = getSeriesData();

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      fontWeight: 600,
    },
    colors: ["#3B82F6", "#1C3EB9"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 280,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [0, 2.5],
    },
    plotOptions: {
      bar: {
        columnWidth: activeTab === "annually" ? "12%" : activeTab === "quarterly" ? "20%" : "30%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      type: ["solid", "gradient"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: [0, 4],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "rgba(156, 163, 175, 0.12)",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: "dark",
      y: {
        formatter: (val: number, opts: any) => {
          if (opts.seriesIndex === 0) {
            return `${val} Cars`;
          }
          return `₹${(val / 100000).toFixed(2)} Lakh`;
        }
      }
    },
    xaxis: {
      type: "category",
      categories: getXAxisCategories(),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#9CA3AF",
          fontWeight: 600,
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Sales (Cars)",
          style: {
            fontSize: "11px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            color: "#3B82F6",
          },
        },
        labels: {
          style: {
            fontSize: "11px",
            colors: ["#6B7280"],
          },
          formatter: (val: number) => Math.round(val).toString(),
        },
      },
      {
        opposite: true,
        title: {
          text: "Revenue (₹ Lakh)",
          style: {
            fontSize: "11px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            color: "#1C3EB9",
          },
        },
        labels: {
          style: {
            fontSize: "11px",
            colors: ["#6B7280"],
          },
          formatter: (val: number) => `₹${(val / 100000).toFixed(1)} L`,
        },
      },
    ],
  };

  const series = [
    {
      name: "Sales (Cars)",
      type: "column",
      data: currentData.sales,
    },
    {
      name: "Revenue (₹)",
      type: "area",
      data: currentData.revenue,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs h-full flex flex-col justify-between">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="size-4 text-[#1C3EB9]" />
            Sales & Revenue Performance
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">
            {getSubTitle()}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
          <ChartTab selected={activeTab} onChange={setActiveTab} />
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-8 w-32 pl-8 pr-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
              placeholder="Select range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={280} />
        </div>
      </div>
    </div>
  );
}

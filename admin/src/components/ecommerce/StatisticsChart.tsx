import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab";
import { CalenderIcon } from "../../icons";

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
        return "Sales and revenue metrics by month";
      case "quarterly":
        return "Sales and revenue metrics by quarter";
      case "annually":
        return "Sales and revenue metrics by year";
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
      fontFamily: "Outfit",
    },
    colors: ["#465FFF", "#10B981"], // Blue for Sales bars, Emerald for Revenue area
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // General type for mixed charts
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [0, 3], // 0 stroke width for columns, 3 stroke width for the revenue line
    },
    plotOptions: {
      bar: {
        columnWidth: activeTab === "annually" ? "15%" : activeTab === "quarterly" ? "25%" : "35%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      type: ["solid", "gradient"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: [0, 4], // Size of marker points: 0 for columns, 4 for the area line
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
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts: any) => {
          if (opts.seriesIndex === 0) {
            return `${val} Cars`;
          }
          return `₹${val.toLocaleString()}`;
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
      tooltip: {
        enabled: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Sales (Cars)",
          style: {
            fontSize: "12px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 500,
            color: "#465FFF",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
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
            fontSize: "12px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 500,
            color: "#10B981",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
          formatter: (val: number) => `₹${(val / 100000).toFixed(2)} L`,
        },
      },
    ],
  };

  const series = [
    {
      name: "Sales (Cars)",
      type: "column", // Bar chart
      data: currentData.sales,
    },
    {
      name: "Revenue (₹)",
      type: "area", // Area line chart
      data: currentData.revenue,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {getSubTitle()}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab selected={activeTab} onChange={setActiveTab} />
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-40 lg:h-auto  lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer"
              placeholder="Select date range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}

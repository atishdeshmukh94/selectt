import { API_URL } from "../../config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Link } from "react-router";
import { Calendar, ArrowRight, MapPin, Clock } from "lucide-react";

const API = API_URL;

export default function RecentTestDrives({ testDrives = [] }: { testDrives: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Calendar className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Recent Test Drives
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Scheduled appointments
            </p>
          </div>
        </div>

        <Link
          to="/test-drives"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-[#1C3EB9] hover:text-[#0C1B33] hover:border-[#1C3EB9] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <span>View All</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Vehicle
              </TableCell>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Time & Location
              </TableCell>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {testDrives.length === 0 && (
              <TableRow>
                <TableCell className="py-6 text-center text-gray-400 font-medium text-xs">
                  No recent test drives.
                </TableCell>
              </TableRow>
            )}
            {testDrives.map((td) => {
              let imageUrl = td.image || "";
              try {
                const parsed = JSON.parse(td.image);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  imageUrl = parsed[0];
                }
              } catch (e) {
                // Ignore parse error
              }
              const finalImageUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `${API}${imageUrl}`;

              return (
                <TableRow key={td.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <TableCell className="py-2.5">
                    <div>
                      <p className="font-bold text-gray-800 text-xs dark:text-white truncate">
                        {td.first_name || 'Customer'} {td.last_name || ''}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 block truncate">
                        +91 {td.phone || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-11 overflow-hidden rounded-md border border-gray-200 bg-gray-100 shrink-0">
                        <img
                          src={finalImageUrl}
                          className="h-full w-full object-cover"
                          alt={`${td.make} ${td.model}`}
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200";
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-800 text-xs dark:text-gray-200 truncate">
                        {td.year} {td.make} {td.model}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 truncate">
                        <Clock className="size-3 text-[#1C3EB9] shrink-0" /> {td.date_label || 'Today'} · {td.slot || '11:00 AM'}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="size-2.5 text-amber-500 shrink-0" /> {td.location || 'Home Drive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge
                      size="sm"
                      color={
                        td.status === "completed"
                          ? "success"
                          : td.status === "confirmed" || td.status === "approved"
                          ? "info"
                          : td.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {td.status || 'scheduled'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

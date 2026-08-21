import { API_URL } from "../../config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

const API = API_URL;

export default function RecentTestDrives({ testDrives = [] }: { testDrives: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Test Drive Requests
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Latest {testDrives.length > 0 ? testDrives.length : ""} test drive bookings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/test-drives"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </a>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Vehicle
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date / Slot
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Location
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {testDrives.length === 0 && (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500 font-medium">
                  No recent test drive requests found.
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
                // Not JSON, use as-is
              }
              const finalImageUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `${API}${imageUrl}`;

              const statusColor =
                td.status === "approved"
                  ? "success"
                  : td.status === "rejected"
                  ? "error"
                  : "warning";

              return (
                <TableRow key={td.id} className="">
                  {/* Vehicle */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[60px] overflow-hidden rounded-md border border-slate-200 flex-shrink-0">
                        <img
                          src={finalImageUrl}
                          className="h-full w-full object-cover"
                          alt={`${td.make} ${td.model}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {td.make} {td.model}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {td.year}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {td.first_name} {td.last_name}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {td.phone}
                    </span>
                  </TableCell>

                  {/* Date / Slot */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {td.date_label}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {td.slot}
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {td.location || "N/A"}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <Badge size="sm" color={statusColor}>
                      {td.status}
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

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
import { ShoppingBag, ArrowRight } from "lucide-react";

const API = API_URL;

export default function RecentOrders({ orders = [] }: { orders: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Recent Bookings
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Latest sales transactions
            </p>
          </div>
        </div>

        <Link
          to="/booked-cars"
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
                Vehicle
              </TableCell>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="py-2 font-bold text-gray-400 uppercase tracking-wider text-start text-[10px] dark:text-gray-400"
              >
                Price
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
            {orders.length === 0 && (
              <TableRow>
                <TableCell className="py-6 text-center text-gray-400 font-medium text-xs">
                  No recent bookings.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => {
              let imageUrl = order.image || "";
              try {
                const parsed = JSON.parse(order.image);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  imageUrl = parsed[0];
                }
              } catch (e) {
                // Not JSON
              }
              const finalImageUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `${API}${imageUrl}`;

              return (
                <TableRow key={order.id || order.orderId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-12 overflow-hidden rounded-lg border border-gray-200/80 bg-gray-100 shrink-0">
                        <img
                          src={finalImageUrl}
                          className="h-full w-full object-cover"
                          alt={`${order.make} ${order.model}`}
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-xs dark:text-white truncate">
                          {order.make} {order.model}
                        </p>
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 block truncate">
                          {order.orderId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {order.category || "Car"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs font-black text-gray-900 dark:text-white">
                    ₹{(order.price / 100000).toFixed(2)}L
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge
                      size="sm"
                      color={
                        order.status === "paid" || order.status === "completed" || order.status === "confirmed"
                          ? "success"
                          : order.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status || 'confirmed'}
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

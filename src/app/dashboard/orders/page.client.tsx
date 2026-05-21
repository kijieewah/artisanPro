"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  LayoutDashboard,
  Menu,
  ChevronDown,
  Bell,
  X,
  User,
  LogOut,
  Settings,
  Eye,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Input } from "~/ui/primitives/input";
import { Skeleton } from "~/ui/primitives/skeleton";
import Header from "~/ui/components/header";
import Sidebar from "~/ui/components/sidebar/sidebar";

// Corrected Order Interface to match the API response structure
interface Order {
  id: string; // The API returns a string ID
  orderNumber: string; // Correctly typed as string
  customer: {
    name: string;
  };
  createdAt: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  total: number;
}

interface CustomersPageProps {
  user: any; // or use a more specific type if you have one
}

// The client-side interface for display purposes
interface DisplayOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
}

interface Notification {
  id: string; // Ensure id is a string
  text: string;
  time: string;
  read: boolean;
}

// DataTable Interfaces
interface Column<T> {
  key: string;
  header: string;
  cell: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  initialPageSize?: number;
  loadMore?: () => void;
  hasMore?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// DataTable Component
function DataTable<T>({
  data,
  columns,
  loading = false,
  initialPageSize = 10,
  loadMore,
  hasMore = false,
  onRowClick,
  emptyMessage = "No data available",
  searchable = false,
  onSearch,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchValue);

  // Use debounced search query
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  // Notify parent of search changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  // Sync with external search value
  useEffect(() => {
    setLocalSearchQuery(searchValue);
  }, [searchValue]);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    onSearchChange?.(query);
    setCurrentPage(1);
  };

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    if (!debouncedSearchQuery) return true;

    const query = debouncedSearchQuery.toLowerCase();
    const itemString = JSON.stringify(item).toLowerCase();
    return itemString.includes(query);
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;
    if (bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data - show all data initially, use load more for additional pages
  const paginatedData = sortedData.slice(0, currentPage * initialPageSize);
  const totalPages = Math.ceil(sortedData.length / initialPageSize);
  const canLoadMore = currentPage < totalPages;

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (canLoadMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchable && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder={searchPlaceholder}
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 shadow-sm"
          />
          {localSearchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${column.width || ""}`}
                >
                  <button
                    onClick={() => handleSort(column.key)}
                    className={`flex items-center gap-1 w-full text-left ${
                      column.sortable
                        ? "cursor-pointer hover:text-gray-700"
                        : "cursor-default"
                    }`}
                  >
                    {column.header}
                    {column.sortable &&
                      sortConfig?.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.cell(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {debouncedSearchQuery
                  ? "No results found for your search"
                  : emptyMessage}
              </p>
              {debouncedSearchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="mt-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Load More Button */}
      {canLoadMore && paginatedData.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-lg border border-blue-600 bg-white px-6 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* Results Count */}
      {paginatedData.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {sortedData.length} orders
          {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
        </div>
      )}
    </div>
  );
}

const OrdersPage = ({ user }: CustomersPageProps) => {
  const LOAD_LIMIT = 20;
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const notifications: Notification[] = [];

  const EmptyState = ({ title, description }: any) => (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <ShoppingCart className="mb-4 h-12 w-12" />
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );

  const fetchOrders = async (pageToFetch: number, search: string) => {
    try {
      if (pageToFetch === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingNextPage(true);
      }
      setError("");

      const res = await fetch(
        `/api/orders?phone=${encodeURIComponent(
          user.phone,
        )}&page=${pageToFetch}&limit=${LOAD_LIMIT}&search=${encodeURIComponent(
          search,
        )}`,
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const rawOrders = (await res.json()) as Order[];

      const formattedOrders: DisplayOrder[] = rawOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || "N/A",
        orderDate: order.createdAt,
        status: order.status,
        totalAmount: order.total,
      }));

      if (pageToFetch === 1) {
        setOrders(formattedOrders);
      } else {
        setOrders((prev) => [...prev, ...formattedOrders]);
      }

      setHasMore(formattedOrders.length === LOAD_LIMIT);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    if (user?.phone) {
      setPage(1);
      setOrders([]);
      setHasMore(true);
      fetchOrders(1, searchQuery);
    }
  }, [user, searchQuery]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleViewOrder = (orderId: string) => {
    console.log(`Navigating to order details for ID: ${orderId}`);
    toast.info(`Viewing details for order: ${orderId}`);
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
    fetchOrders(page + 1, searchQuery);
  };

  const displayedOrders = orders;

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      shipped: { color: "bg-blue-100 text-blue-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // DataTable columns for orders
  const orderColumns: Column<DisplayOrder>[] = [
    {
      key: "orderNumber",
      header: "Order ID",
      sortable: true,
      cell: (order) => (
        <div className="font-medium text-gray-900">{order.orderNumber}</div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      cell: (order) => (
        <span className="text-gray-700">{order.customerName}</span>
      ),
    },
    {
      key: "orderDate",
      header: "Date",
      sortable: true,
      cell: (order) => (
        <span className="text-gray-600">
          {new Date(order.orderDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: "totalAmount",
      header: "Amount",
      sortable: true,
      cell: (order) => (
        <span className="font-bold text-green-600">
          ₦{order.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      width: "100px",
      cell: (order) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleViewOrder(order.id)}
            className="rounded p-2 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
            title="View Order Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header
        userData={user}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <div className="flex flex-1">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMenu}
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShoppingCart className="h-6 w-6" />
                Order Management
              </CardTitle>
              <CardDescription>
                A list of all orders from your customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && displayedOrders.length === 0 ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                /* Using the new DataTable component */
                <DataTable
                  data={displayedOrders}
                  columns={orderColumns}
                  loading={isLoading || isFetchingNextPage}
                  searchable={true}
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search orders by ID, customer, or status..."
                  emptyMessage="No orders found. New orders will appear here after they are placed."
                  onRowClick={(order) =>
                    handleViewOrder((order as DisplayOrder).id)
                  }
                  initialPageSize={10}
                />
              )}

              {/* Keep the original Load More button as fallback */}
              {hasMore && displayedOrders.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default OrdersPage;

// app/dashboard/orders/page.client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Package,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Receipt,
  Award,
  GraduationCap,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
};

interface OrderItem {
  id: string;
  itemType: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata: any;
  details: {
    id: string;
    name: string;
    serviceName: string;
    type: string;
    status?: string;
    progress?: number;
    enrollmentCode?: string;
    applicationNumber?: string;
    partnerName?: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  invoice: { invoiceNumber: string; pdfUrl: string | null } | null;
  receipt: { receiptNumber: string; pdfUrl: string | null } | null;
  paymentTransaction: { transactionRef: string; status: string } | null;
  orderItems: OrderItem[];
}

interface OrdersClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    name: string;
  };
  orders: Order[];
}

export default function OrdersClient({ user, orders }: OrdersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { 
          icon: CheckCircle, 
          label: "Completed", 
          color: "bg-green-100 text-green-700",
          borderColor: "border-green-200",
          bgLight: "bg-green-50"
        };
      case "PAYMENT_PROCESSING":
        return { 
          icon: Clock, 
          label: "Processing Payment", 
          color: "bg-blue-100 text-blue-700",
          borderColor: "border-blue-200",
          bgLight: "bg-blue-50"
        };
      case "PENDING_PAYMENT":
        return { 
          icon: Clock, 
          label: "Pending Payment", 
          color: "bg-yellow-100 text-yellow-700",
          borderColor: "border-yellow-200",
          bgLight: "bg-yellow-50"
        };
      case "FAILED":
        return { 
          icon: XCircle, 
          label: "Failed", 
          color: "bg-red-100 text-red-700",
          borderColor: "border-red-200",
          bgLight: "bg-red-50"
        };
      case "REFUNDED":
        return { 
          icon: XCircle, 
          label: "Refunded", 
          color: "bg-gray-100 text-gray-700",
          borderColor: "border-gray-200",
          bgLight: "bg-gray-50"
        };
      default:
        return { 
          icon: AlertCircle, 
          label: status, 
          color: "bg-gray-100 text-gray-700",
          borderColor: "border-gray-200",
          bgLight: "bg-gray-50"
        };
    }
  };

  const getItemIcon = (type: string) => {
    if (type === "CERTIFICATION_APPLICATION") {
      return <Award className="h-5 w-5 text-green-600" />;
    }
    return <GraduationCap className="h-5 w-5 text-blue-600" />;
  };

  const getItemTypeLabel = (type: string) => {
    return type === "CERTIFICATION_APPLICATION" ? "Certification" : "Course Enrollment";
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderItems.some(item => 
          item.details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.details?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      const matchesType = typeFilter === "all" || 
        order.orderItems.some(item => 
          typeFilter === "certification" ? item.itemType === "CERTIFICATION_APPLICATION" : item.itemType === "COURSE_ENROLLMENT"
        );
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "amount_asc":
          return a.total - b.total;
        case "amount_desc":
          return b.total - a.total;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
    pending: orders.filter(o => o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_PROCESSING").length,
    totalSpent: orders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0),
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    window.open(`/api/invoices/${invoiceNumber}/download`, "_blank");
    toast.success("Download started");
  };

  const handleDownloadReceipt = (receiptNumber: string) => {
    window.open(`/api/receipts/${receiptNumber}/download`, "_blank");
    toast.success("Download started");
  };

  const handleRetryPayment = async (orderId: string) => {
    toast.info("Redirecting to payment...");
    // Implement retry logic
    router.push(`/payment?orderId=${orderId}`);
  };

  // Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-full bg-yellow-100 p-3">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
              {formatAmount(stats.totalSpent)}
            </p>
          </div>
          <div className="rounded-full p-3" style={{ backgroundColor: `${colors.primary}15` }}>
            <TrendingUp className="h-5 w-5" style={{ color: colors.primary }} />
          </div>
        </div>
      </div>
    </div>
  );

  // Filters Bar
  const FiltersBar = () => (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order number or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Statuses</option>
        <option value="COMPLETED">Completed</option>
        <option value="PENDING_PAYMENT">Pending Payment</option>
        <option value="PAYMENT_PROCESSING">Processing</option>
        <option value="FAILED">Failed</option>
        <option value="REFUNDED">Refunded</option>
      </select>

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Types</option>
        <option value="certification">Certifications Only</option>
        <option value="course">Courses Only</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="amount_desc">Highest Amount</option>
        <option value="amount_asc">Lowest Amount</option>
      </select>
    </div>
  );

  // Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = getStatusBadge(order.status);
    const StatusIcon = statusConfig.icon;
    const isExpanded = selectedOrder?.id === order.id;

    return (
      <div className="rounded-lg border bg-white shadow-sm hover:shadow-md transition-all">
        {/* Order Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleViewOrder(order)}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-bold" style={{ color: colors.primary }}>
                  {formatAmount(order.total)}
                </p>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="mt-3 flex flex-wrap gap-2">
            {order.orderItems.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg text-sm"
              >
                {getItemIcon(item.itemType)}
                <span className="text-gray-700">
                  {item.details?.name || getItemTypeLabel(item.itemType)}
                </span>
                <span className="text-gray-400">×{item.quantity}</span>
              </div>
            ))}
            {order.orderItems.length > 2 && (
              <span className="px-2 py-1 text-sm text-gray-500">
                +{order.orderItems.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Order Actions */}
        <div className="border-t p-4 bg-gray-50 flex flex-wrap gap-3">
          {order.status === "COMPLETED" && (
            <>
              {order.invoice && (
                <button
                  onClick={() => handleDownloadInvoice(order.invoice!.invoiceNumber)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                  Invoice
                </button>
              )}
              {order.receipt && (
                <button
                  onClick={() => handleDownloadReceipt(order.receipt!.receiptNumber)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Receipt className="h-4 w-4 text-gray-500" />
                  Receipt
                </button>
              )}
            </>
          )}
          
          {order.status === "FAILED" && (
            <button
              onClick={() => handleRetryPayment(order.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              Retry Payment
            </button>
          )}

          <button
            onClick={() => handleViewOrder(order)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors ml-auto"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Order Details Modal
  const OrderDetailsModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
    const statusConfig = getStatusBadge(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <p className="text-sm text-gray-500">#{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className={`rounded-lg p-4 ${statusConfig.bgLight} border ${statusConfig.borderColor}`}>
              <div className="flex items-center gap-3">
                <StatusIcon className="h-6 w-6" style={{ color: statusConfig.color.includes("green") ? "#16a34a" : statusConfig.color.includes("blue") ? "#2563eb" : statusConfig.color.includes("yellow") ? "#ca8a04" : "#6b7280" }} />
                <div>
                  <p className="font-semibold">Order {statusConfig.label}</p>
                  <p className="text-sm text-gray-600">
                    {order.status === "COMPLETED" 
                      ? `Your order was completed on ${formatDate(order.paidAt || order.createdAt)}`
                      : order.status === "PENDING_PAYMENT"
                      ? "Complete your payment to process this order"
                      : "Contact support if you need assistance"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div>
              <h3 className="font-semibold mb-3">Order Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Completed</p>
                      <p className="text-sm text-gray-500">{formatDate(order.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Items Purchased</h3>
              <div className="space-y-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-full p-2 bg-white">
                          {getItemIcon(item.itemType)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {item.details?.name || getItemTypeLabel(item.itemType)}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            {getItemTypeLabel(item.itemType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.details?.serviceName}
                          {item.details?.partnerName && (
                            <> • {item.details.partnerName}</>
                          )}
                        </p>
                        {item.details?.enrollmentCode && (
                          <p className="text-xs text-gray-400 mt-1">
                            Enrollment: {item.details.enrollmentCode}
                          </p>
                        )}
                        {item.details?.applicationNumber && (
                          <p className="text-xs text-gray-400 mt-1">
                            Application: {item.details.applicationNumber}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Quantity: {item.quantity} × {formatAmount(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: colors.primary }}>
                        {formatAmount(item.totalPrice)}
                      </p>
                      {item.details?.progress !== undefined && (
                        <div className="mt-1">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${item.details.progress}%`, backgroundColor: colors.primary }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.details.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatAmount(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatAmount(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-lg" style={{ color: colors.primary }}>
                    {formatAmount(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Transaction */}
            {order.paymentTransaction && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Transaction Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Reference</p>
                      <p className="font-mono text-xs">{order.paymentTransaction.transactionRef}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium">{order.paymentTransaction.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
            {order.status === "COMPLETED" && (
              <>
                {order.invoice && (
                  <button
                    onClick={() => handleDownloadInvoice(order.invoice!.invoiceNumber)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    Download Invoice
                  </button>
                )}
                {order.receipt && (
                  <button
                    onClick={() => handleDownloadReceipt(order.receipt!.receiptNumber)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Receipt className="h-4 w-4" />
                    Download Receipt
                  </button>
                )}
              </>
            )}
            {order.status === "FAILED" && (
              <button
                onClick={() => handleRetryPayment(order.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <AlertCircle className="h-4 w-4" />
                Retry Payment
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and track all your certification and course purchases
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Filters */}
      <FiltersBar />

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "You haven't made any purchases yet."}
          </p>
          {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
            <Link
              href="/dashboard/training"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
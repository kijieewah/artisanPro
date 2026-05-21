import { Edit, Trash2, ShoppingCart, Download } from "lucide-react";
import { Button } from "~/ui/primitives/button";
import { StatusBadge } from "./status-badge";

interface OrderCardProps {
  order: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails: () => void;
}

export function OrderCard({
  order,
  onEdit,
  onDelete,
  onViewDetails,
}: OrderCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">
            {order.orderNumber || `#${order.id}`}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {order.customer || "Unknown Customer"}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-500 hover:text-primary"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Date:</span>
          <span>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Amount:</span>
          <span className="font-medium">
            {order.amount || order.subtotal || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <StatusBadge status={order.status} />
        </div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onViewDetails}
        >
          <ShoppingCart size={14} />
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => console.log("Print invoice", order.id)}
        >
          <Download size={14} />
          Invoice
        </Button>
      </div>
    </div>
  );
}

import { Edit, Trash2, Users, MessageSquare } from "lucide-react";
import { Button } from "~/ui/primitives/button";

interface CustomerCardProps {
  customer: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{customer.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {customer.email}
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
        <div className="flex items-center gap-1">
          <span className="text-gray-500 dark:text-gray-400">Phone:</span>
          <span>{customer.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Orders:</span>
          <span>{customer.orders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Total Spent:</span>
          <span className="font-medium">{customer.totalSpent}</span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => console.log("View customer history", customer.id)}
        >
          <Users size={14} />
          History
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => console.log("Message customer", customer.id)}
        >
          <MessageSquare size={14} />
          Message
        </Button>
      </div>
    </div>
  );
}

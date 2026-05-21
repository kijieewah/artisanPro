import {
  Edit,
  Trash2,
  ShoppingCart,
  QrCode,
  Settings,
  Copy,
} from "lucide-react";
import { Button } from "~/ui/primitives/button";
import { toast } from "sonner";

interface Business {
  bussinesId: string;
  bussines_name: string;
  type: string;
  address: string;
  link: string;
  mplink: string;
  whatsapp: string;
  state: string;
  userId: string;
  logo?: string;
}

interface BusinessCardProps {
  business: Business;
  onEdit: () => void;
  onDelete: () => void;
  onManageProducts: () => void;
  onViewQR: () => void;
}

export function BusinessCard({
  business,
  onEdit,
  onDelete,
  onManageProducts,
  onViewQR,
}: BusinessCardProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(business.link);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        {business.logo && (
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border">
            <img
              src={business.logo}
              alt={`${business.bussines_name} logo`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{business.bussines_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {business.type}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="text-gray-500 hover:text-primary"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={onDelete}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <p className="truncate">
              <span className="font-medium">Address:</span> {business.address}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium">Store: </span>
              <a
                href={business.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {business.link}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCopyLink();
                  }}
                  className="text-gray-500 hover:text-primary"
                >
                  <Copy size={14} />
                </button>
              </a>
            </div>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={onManageProducts}
            >
              <ShoppingCart size={14} />
              Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={onViewQR}
            >
              <QrCode size={14} />
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => window.open(business.mplink, "_blank")}
            >
              <Settings size={14} />
              Manage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

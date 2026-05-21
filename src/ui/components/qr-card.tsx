import { Copy, Download } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "~/ui/primitives/button";
import { toast } from "sonner";

interface QRCardProps {
  title: string;
  subtitle: string;
  ptitle: string;
  plink: string;
  ltitle: string;
  icon: React.ComponentType<any>;
  color: string;
  value: string;
  description: string;
  onDownload: () => void;
}

export function QRCard({
  title,
  subtitle,
  ptitle,
  plink,
  ltitle,
  icon: Icon,
  color,
  value,
  description,
  onDownload,
}: QRCardProps) {
  const handleCopyLink = (text: string, successMessage: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(successMessage))
      .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <div
      className={`rounded-lg border bg-${color}-50 p-4 shadow-sm dark:border-gray-800 dark:bg-${color}-900/30`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="mt-4 flex flex-col items-center">
        <div className="mb-3 flex items-center justify-center rounded border bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
          <QRCode
            bgColor="transparent"
            className="h-full w-full text-black dark:text-white"
            fgColor="currentColor"
            size={140}
            value={value}
            data-value={value}
          />
        </div>

        {subtitle && (
          <div className="group flex items-center gap-2 mb-1">
            <a
              href={subtitle}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {ltitle} {subtitle}
            </a>
            <button
              onClick={() =>
                handleCopyLink(subtitle, "Link copied to clipboard!")
              }
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary"
              aria-label="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}

        {plink && (
          <div className="group flex items-center gap-2 mb-1">
            <a
              href={plink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {ptitle} {plink}
            </a>
            <button
              onClick={() => handleCopyLink(plink, "Link copied to clipboard!")}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary"
              aria-label="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="mb-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <Button
          onClick={onDownload}
          className="flex items-center gap-2"
          size="sm"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  stat: {
    name: string;
    value: string | number;
    trend: "up" | "down";
    change: string;
  };
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {stat.name}
        </h3>
        {stat.trend === "up" ? (
          <TrendingUp className="h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{stat.value}</p>
        <p
          className={`mt-1 flex items-center text-sm ${
            stat.trend === "up"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {stat.trend === "up" ? (
            <TrendingUp className="mr-1 h-4 w-4" />
          ) : (
            <TrendingDown className="mr-1 h-4 w-4" />
          )}
          {stat.change}
        </p>
      </div>
    </div>
  );
}

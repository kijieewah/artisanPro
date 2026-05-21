// src/app/business-pages/manage-products/sales-overview.tsx
"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { ChevronDown, LineChart, BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  amount: string;
  status: string;
  createdAt: string;
}

export const SalesOverview = ({ orders = [] }: { orders?: any[] }) => {
  const chartRef = useRef(null);

  const dataByDay = orders.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const amount = Number.parseFloat(order.subtotal || 0);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const labels = Object.keys(dataByDay).sort();
  const values = labels.map((label) => dataByDay[label]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Sales",
        data: values,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: (context: { chart: any }) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top,
          );
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.5)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#d1d5db",
        borderColor: "#4b5563",
        borderWidth: 1,
        cornerRadius: 6,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      y: {
        grid: {
          color: "#4b5563",
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: any) => `₦${value.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Orders Overview</h2>
        <button className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80">
          View report
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="h-64">
        {labels.length > 0 ? (
          <Line ref={chartRef} options={chartOptions} data={chartData} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No sales data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

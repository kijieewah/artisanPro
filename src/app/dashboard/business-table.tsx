// src/app/business-pages/manage-products/business-table.tsx

"use client";

import { ArrowRight, Store, MapPin, Phone, Mail, List } from "lucide-react";

interface Business {
  bussines_name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
}

export const BusinessTable = ({ businesses }: { businesses: Business[] }) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
        <h2 className="text-lg font-medium">Businesses</h2>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {businesses.length} Total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase text-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  Business Name
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                <div className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  Category
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {businesses.length > 0 ? (
              businesses.map((biz, index) => (
                <tr
                  key={index}
                  className="border-b bg-white transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-50">
                    {biz.bussines_name}
                  </td>
                  <td className="px-6 py-4">{biz.type}</td>
                  <td className="px-6 py-4">{biz.address}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No businesses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t p-4 text-right dark:border-gray-800">
        <button className="text-sm text-primary transition-colors hover:text-primary/80">
          View all businesses
          <ArrowRight className="ml-1 inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

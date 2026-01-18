import React from "react";

export function StatsTileSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-gray-100 rounded-xl">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RevenueTileSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-xl">
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-24 mb-1"></div><div className="h-3 bg-gray-200 rounded w-32"></div></td>
      <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200"></div><div><div className="h-5 bg-gray-200 rounded w-28 mb-1"></div><div className="h-3 bg-gray-200 rounded w-24"></div></div></div></td>
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-32 mb-1"></div><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-20 mb-1"></div></td>
      <td className="py-4 px-4"><div className="h-7 bg-gray-200 rounded-full w-24"></div></td>
      <td className="py-4 px-4"><div className="flex gap-2"><div className="w-8 h-8 bg-gray-200 rounded-lg"></div><div className="w-8 h-8 bg-gray-200 rounded-lg"></div></div></td>
    </tr>
  );
}

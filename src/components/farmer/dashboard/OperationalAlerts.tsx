"use client";

import { AlertTriangle, PackageX } from "lucide-react";
import Link from "next/link";

// Dummy data untuk alert stok
const stockAlerts = [
  { id: 1, name: "Maggot Segar 1kg", stock: 5, threshold: 10, urgency: "high" },
  {
    id: 2,
    name: "Pupuk Organik 5kg",
    stock: 8,
    threshold: 10,
    urgency: "medium",
  },
  {
    id: 3,
    name: "Pakan Ikan Premium",
    stock: 3,
    threshold: 10,
    urgency: "high",
  },
];

export default function OperationalAlerts() {
  const highUrgencyCount = stockAlerts.filter(
    (a) => a.urgency === "high"
  ).length;

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#303646] poppins-bold">
              Peringatan Stok
            </h3>
            <p className="text-xs text-gray-500">Stok di bawah 10 unit</p>
          </div>
        </div>
        {highUrgencyCount > 0 && (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
            {highUrgencyCount} Kritis
          </span>
        )}
      </div>

      {/* Stock Alert List */}
      <div className="space-y-3 mb-6">
        {stockAlerts.length > 0 ? (
          stockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                alert.urgency === "high"
                  ? "bg-red-50/50 border-red-100"
                  : "bg-amber-50/50 border-amber-100"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  alert.urgency === "high" ? "bg-red-100" : "bg-amber-100"
                }`}
              >
                <PackageX
                  className={`h-4 w-4 ${
                    alert.urgency === "high" ? "text-red-600" : "text-amber-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#303646] truncate">
                  {alert.name}
                </p>
                <p className="text-xs text-gray-500">
                  Tersisa{" "}
                  <span
                    className={`font-bold ${
                      alert.urgency === "high"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {alert.stock}
                  </span>{" "}
                  unit
                </p>
              </div>
              <Link
                href={`/farmer/products?restock=${alert.id}`}
                className="text-xs font-medium text-[#A3AF87] hover:underline"
              >
                Restock
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <PackageX className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Semua stok aman</p>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-[#A3AF87]/10 rounded-xl">
          <p className="text-xl font-bold text-[#303646]">24</p>
          <p className="text-xs text-gray-500">Total SKU Aktif</p>
        </div>
        <div className="text-center p-2 bg-emerald-50 rounded-xl">
          <p className="text-xl font-bold text-emerald-600">21</p>
          <p className="text-xs text-gray-500">Stok Aman</p>
        </div>
      </div>
    </div>
  );
}

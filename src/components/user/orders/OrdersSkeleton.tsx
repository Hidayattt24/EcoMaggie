import { Skeleton } from "@/components/ui/Skeleton";

export function OrdersPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/5 via-white to-[#A3AF87]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Orders List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border-2 border-gray-100 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b-2 border-gray-50">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>

              <div className="flex gap-4 mb-4">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-50">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="hidden sm:block h-10 w-32 rounded-lg" />
          </div>

          {/* Status Header */}
          <div className="bg-[#A3AF87]/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#A3AF87]/20">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <Skeleton className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl" />
              <div className="flex-1 text-center sm:text-left space-y-2">
                <Skeleton className="h-8 w-40 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-56 mx-auto sm:mx-0" />
              </div>
              <div className="text-center sm:text-right space-y-2">
                <Skeleton className="h-4 w-24 mx-auto sm:ml-auto" />
                <Skeleton className="h-10 w-36 mx-auto sm:ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Shipping Information Skeleton */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100">
          <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-[#A3AF87]/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-5 h-5 rounded-lg flex-shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="bg-white rounded-2xl border-2 border-gray-100">
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-[#A3AF87]/10">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-6 w-36" />
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 pb-4 border-b-2 border-gray-50 last:border-0 last:pb-0">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details Skeleton */}
        <div className="bg-white rounded-2xl border-2 border-gray-100">
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-[#A3AF87]/10">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
            <div className="pt-3 border-t-2 border-gray-100">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

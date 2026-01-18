import { Skeleton } from "@/components/ui/Skeleton";

export function CheckoutSkeleton() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-12">
          <Skeleton className="h-6 w-32 mb-4 sm:mb-6" />
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Stepper Skeleton - Desktop */}
        <div className="hidden sm:flex items-center max-w-2xl mx-auto mb-6 sm:mb-12">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <Skeleton className="w-12 h-12 rounded-xl mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              {index < 2 && (
                <div className="flex-1 h-1 mx-4 -mt-7">
                  <Skeleton className="h-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stepper Skeleton - Mobile */}
        <div className="sm:hidden flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <Skeleton key={step} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Address Cards Skeleton */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-full p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl bg-white"
                  style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
                >
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-6 h-6 rounded-full" variant="circular" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button Skeleton */}
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Order Summary Sidebar Skeleton - Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4 space-y-6">
              {/* Order Summary Card */}
              <div
                className="border-2 rounded-2xl p-6 bg-white"
                style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-6 w-40" />
                </div>

                {/* Product Skeleton */}
                <div className="pb-5 mb-5 border-b-2 space-y-4" style={{ borderColor: "rgba(163, 175, 135, 0.1)" }}>
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-20 rounded-lg" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>

                {/* Price Details Skeleton */}
                <div className="space-y-4 mb-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>

                {/* Total Skeleton */}
                <div
                  className="pt-5 border-t-2 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl"
                  style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>

              {/* Trust Badges Skeleton */}
              <div
                className="border-2 rounded-2xl p-5 bg-white"
                style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Skeleton className="w-11 h-11 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Section Skeleton */}
              <div
                className="border-2 rounded-2xl p-5 bg-white"
                style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
              >
                <Skeleton className="h-5 w-28 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile */}
          <div className="lg:hidden space-y-4">
            <div
              className="border-2 rounded-2xl p-4 bg-white"
              style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-5 w-36" />
              </div>

              {/* Product Skeleton */}
              <div className="pb-4 mb-4 border-b-2 space-y-3" style={{ borderColor: "rgba(163, 175, 135, 0.1)" }}>
                <div className="flex gap-3">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-16 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                className="pt-4 border-t-2 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl"
                style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            </div>

            {/* Trust Badges - Mobile */}
            <div
              className="border-2 rounded-2xl p-4 bg-white"
              style={{ borderColor: "rgba(163, 175, 135, 0.2)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                    <Skeleton className="w-10 h-10 rounded-xl mb-2" />
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

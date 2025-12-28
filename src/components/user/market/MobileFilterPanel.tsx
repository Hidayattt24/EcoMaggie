interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function MobileFilterPanel({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortChange,
}: MobileFilterPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Filter Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-3xl">
            <h2 className="font-bold text-lg text-[#2D5016] font-poppins">
              Filter & Urutkan
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Jenis Category */}
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#2D5016] mb-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>Jenis Produk</span>
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => onToggleCategory(category)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2D5016] accent-[#2D5016] focus:ring-[#2D5016] focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        selectedCategories.includes(category)
                          ? "text-[#2D5016] font-semibold"
                          : "text-gray-700 group-hover:text-[#2D5016]"
                      }`}
                    >
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#2D5016] mb-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Rentang Harga</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-[#2D5016] font-semibold">
                  <span>Rp {minPrice.toLocaleString("id-ID")}</span>
                  <span>Rp {maxPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={minPrice}
                    onChange={(e) =>
                      onMinPriceChange(
                        Math.min(parseInt(e.target.value), maxPrice - 5000)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5016]"
                    style={{
                      background: `linear-gradient(to right, #2D5016 0%, #2D5016 ${
                        (minPrice / 200000) * 100
                      }%, #e5e7eb ${(minPrice / 200000) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) =>
                      onMaxPriceChange(
                        Math.max(parseInt(e.target.value), minPrice + 5000)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5016]"
                    style={{
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${
                        (maxPrice / 200000) * 100
                      }%, #2D5016 ${(maxPrice / 200000) * 100}%, #2D5016 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#2D5016] mb-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span>Urutkan</span>
              </h3>
              <div className="space-y-2">
                {[
                  { value: "newest", label: "Terbaru" },
                  { value: "price-low", label: "Harga Terendah" },
                  { value: "price-high", label: "Harga Tertinggi" },
                  { value: "rating", label: "Rating Tertinggi" },
                  { value: "name-az", label: "Nama A-Z" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => onSortChange(e.target.value)}
                      className="w-4 h-4 border-gray-300 text-[#2D5016] accent-[#2D5016] focus:ring-[#2D5016] focus:ring-offset-0"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        sortBy === option.value
                          ? "text-[#2D5016] font-semibold"
                          : "text-gray-700 group-hover:text-[#2D5016]"
                      }`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white rounded-lg font-semibold text-sm shadow-md active:scale-95 transition-transform"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface FilterSidebarProps {
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

export default function FilterSidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortChange,
}: FilterSidebarProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100"
      style={{ scrollbarColor: "#A3AF87 #f3f4f6" } as React.CSSProperties}
    >
      {/* Filter Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#435664" } as React.CSSProperties}
        >
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
        <h2
          className="font-bold text-base flex-1 font-poppins"
          style={{ color: "#303646" } as React.CSSProperties}
        >
          Filter Produk
        </h2>
      </div>

      {/* Jenis Category */}
      <div className="mb-4">
        <button
          className="flex items-center gap-1.5 w-full text-xs font-semibold mb-2"
          style={{ color: "#303646" } as React.CSSProperties}
        >
          <svg
            className="h-3.5 w-3.5"
            style={{ color: "#a3af87" } as React.CSSProperties}
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
          <svg
            className="h-3 w-3 ml-auto"
            style={{ color: "#435664" } as React.CSSProperties}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-md transition-colors"
              style={
                {
                  "--hover-bg": "rgba(163, 175, 135, 0.1)",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(163, 175, 135, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onToggleCategory(category)}
                className="w-3.5 h-3.5 rounded border-gray-300 transition-all appearance-none border"
                style={
                  {
                    accentColor: "#A3AF87",
                  } as React.CSSProperties
                }
              />
              <style jsx>{`
                input[type="checkbox"]:checked {
                  background-color: #a3af87;
                  border-color: #a3af87;
                }
                input[type="checkbox"]:focus {
                  outline: 2px solid rgba(163, 175, 135, 0.3);
                }
              `}</style>
              <span
                className={`text-xs transition-colors ${
                  selectedCategories.includes(category)
                    ? "font-semibold"
                    : "text-gray-700"
                }`}
                style={
                  {
                    color: selectedCategories.includes(category)
                      ? "#303646"
                      : undefined,
                  } as React.CSSProperties
                }
              >
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <button
          className="flex items-center gap-1.5 w-full text-xs font-semibold mb-2"
          style={{ color: "#303646" } as React.CSSProperties}
        >
          <svg
            className="h-3.5 w-3.5"
            style={{ color: "#a3af87" } as React.CSSProperties}
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
          <svg
            className="h-3 w-3 ml-auto"
            style={{ color: "#435664" } as React.CSSProperties}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div className="space-y-3">
          <div
            className="flex justify-between text-[10px] font-semibold"
            style={{ color: "#303646" } as React.CSSProperties}
          >
            <span>Rp {minPrice.toLocaleString("id-ID")}</span>
            <span>Rp {maxPrice.toLocaleString("id-ID")}</span>
          </div>
          <div className="space-y-2">
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
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={
                {
                  background: `linear-gradient(to right, #435664 0%, #435664 ${
                    (minPrice / 200000) * 100
                  }%, #e5e7eb ${(minPrice / 200000) * 100}%, #e5e7eb 100%)`,
                  accentColor: "#435664",
                } as React.CSSProperties
              }
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
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={
                {
                  background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${
                    (maxPrice / 200000) * 100
                  }%, #435664 ${(maxPrice / 200000) * 100}%, #435664 100%)`,
                  accentColor: "#435664",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <button
          className="flex items-center gap-1.5 w-full text-xs font-semibold mb-2"
          style={{ color: "#303646" } as React.CSSProperties}
        >
          <svg
            className="h-3.5 w-3.5"
            style={{ color: "#a3af87" } as React.CSSProperties}
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
          <svg
            className="h-3 w-3 ml-auto"
            style={{ color: "#435664" } as React.CSSProperties}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div className="space-y-1.5">
          {[
            { value: "newest", label: "Terbaru" },
            { value: "price-low", label: "Harga Terendah" },
            { value: "price-high", label: "Harga Tertinggi" },
            { value: "rating", label: "Rating Tertinggi" },
            { value: "name-az", label: "Nama A-Z" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-md transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(163, 175, 135, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={sortBy === option.value}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-3.5 h-3.5 border-gray-300 appearance-none border rounded-full"
                style={
                  {
                    accentColor: "#A3AF87",
                  } as React.CSSProperties
                }
              />
              <style jsx>{`
                input[type="radio"]:checked {
                  background-color: #a3af87;
                  border-color: #a3af87;
                  box-shadow: inset 0 0 0 3px white;
                }
                input[type="radio"]:focus {
                  outline: 2px solid rgba(163, 175, 135, 0.3);
                }
              `}</style>
              <span
                className={`text-xs transition-colors ${
                  sortBy === option.value ? "font-semibold" : "text-gray-700"
                }`}
                style={
                  {
                    color: sortBy === option.value ? "#303646" : undefined,
                  } as React.CSSProperties
                }
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

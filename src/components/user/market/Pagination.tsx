interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700"
        style={
          {
            "--hover-bg": "#f9fafb",
            "--hover-border": "#A3AF87",
            "--hover-text": "#A3AF87",
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.borderColor = "#A3AF87";
            e.currentTarget.style.color = "#A3AF87";
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#374151";
          }
        }}
      >
        <div className="flex items-center gap-2">
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Kembali</span>
        </div>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          const showEllipsis =
            (page === currentPage - 2 && currentPage > 3) ||
            (page === currentPage + 2 && currentPage < totalPages - 2);

          if (showEllipsis) {
            return (
              <span key={page} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          if (!showPage) return null;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-10 w-10 rounded-lg font-semibold text-sm transition-all ${
                currentPage === page
                  ? "text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700"
              }`}
              style={
                currentPage === page
                  ? { backgroundColor: "#A3AF87" }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (currentPage !== page) {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.borderColor = "#A3AF87";
                  e.currentTarget.style.color = "#A3AF87";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== page) {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#374151";
                }
              }}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700"
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.borderColor = "#A3AF87";
            e.currentTarget.style.color = "#A3AF87";
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#374151";
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Selanjutnya</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}

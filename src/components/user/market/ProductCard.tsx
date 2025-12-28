import Link from "next/link";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  category: string;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
}

export default function ProductCard({
  product,
  wishlist,
  onToggleWishlist,
}: ProductCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-green-50 to-white overflow-hidden">
        <Link href={`/market/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all active:scale-95 z-10"
        >
          <svg
            className={`h-3 w-3 transition-colors ${
              wishlist.includes(product.id)
                ? "fill-red-500 stroke-red-500"
                : "fill-none stroke-gray-600"
            }`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Category Badge */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#2D5016]/90 text-white text-[9px] font-semibold rounded-full pointer-events-none">
          {product.category}
        </div>

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg animate-pulse pointer-events-none">
            🔥 DISKON {product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2">
        {/* Product Name */}
        <h3 className="font-bold text-xs text-[#2D5016] mb-0.5 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[9px] text-[#2D5016]/70 mb-1.5 line-clamp-1">
          {product.description}
        </p>

        {/* Rating & Stock */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-0.5">
            <svg className="h-2.5 w-2.5 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-800">
              {product.rating}
            </span>
            <span className="text-[9px] text-gray-500">
              ({product.reviews})
            </span>
          </div>
          <span className="text-[9px] text-gray-500">{product.stock} kg</span>
        </div>

        {/* Price */}
        <div className="mb-1.5">
          {product.discount ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-[#2D5016]">
                  Rp{" "}
                  {Math.round(
                    product.price * (1 - product.discount / 100)
                  ).toLocaleString("id-ID")}
                </span>
                <span className="text-[9px] text-gray-500">
                  /{product.unit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 line-through">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                <span className="text-[8px] px-1 py-0.5 bg-red-100 text-red-600 font-bold rounded">
                  -{product.discount}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#2D5016]">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              <span className="text-[9px] text-gray-500">/{product.unit}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button className="flex-1 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white py-1.5 rounded-md font-semibold text-[10px] hover:shadow-md hover:scale-105 transition-all active:scale-95">
            <div className="flex items-center justify-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Keranjang</span>
            </div>
          </button>

          <Link
            href={`/market/products/${product.id}`}
            className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[10px] hover:bg-gray-200 hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

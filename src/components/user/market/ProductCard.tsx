import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { addToCart } from "@/lib/api/cart.actions";
import Swal from "sweetalert2";

// Legacy Product interface for backward compatibility
export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  images?: string[];
  category: string;
  discount?: number;
  discountPercent?: number;
  finalPrice?: number;
  slug?: string;
  totalSold?: number;
  farmer?: {
    id: string;
    farmName: string;
    location: string | null;
    rating: number;
    isVerified: boolean;
  };
}

interface ProductCardProps {
  product: Product;
  wishlist: (number | string)[];
  onToggleWishlist: (id: number | string) => void;
}

export default function ProductCard({
  product,
  wishlist,
  onToggleWishlist,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  // Handle both legacy and new data formats
  const productImage =
    product.images?.[0] || product.image || "/assets/dummy/magot.png";
  const discount = product.discountPercent || product.discount || 0;
  const productSlug = product.slug || product.id.toString();
  const reviews = product.reviews || 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    setShowParticles(true);

    try {
      const result = await addToCart(product.id.toString(), 1);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        // Hide particles on error
        setShowParticles(false);

        if (result.error === "Unauthorized") {
          Swal.fire({
            icon: "warning",
            title: "Login Diperlukan",
            text: "Silakan login untuk menambahkan produk ke keranjang",
            confirmButtonColor: "#A3AF87",
            customClass: {
              popup: "rounded-3xl shadow-2xl border border-gray-100",
              title: "text-lg font-bold text-[#5a6c5b]",
              htmlContainer: "text-gray-600",
              confirmButton:
                "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
            },
            showClass: {
              popup: "animate__animated animate__headShake",
            },
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: result.message || "Gagal menambahkan ke keranjang",
            confirmButtonColor: "#A3AF87",
            customClass: {
              popup: "rounded-3xl shadow-2xl border border-gray-100",
              title: "text-lg font-bold text-[#5a6c5b]",
              htmlContainer: "text-gray-600",
              confirmButton:
                "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
            },
            showClass: {
              popup: "animate__animated animate__shakeX",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setShowParticles(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal menambahkan produk ke keranjang",
        confirmButtonColor: "#A3AF87",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          title: "text-lg font-bold text-[#5a6c5b]",
          htmlContainer: "text-gray-600",
          confirmButton:
            "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
        },
        showClass: {
          popup: "animate__animated animate__shakeX",
        },
      });
    } finally {
      setIsAdding(false);
      setTimeout(() => {
        setShowParticles(false);
      }, 1500);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlistAnimating(true);
    onToggleWishlist(product.id);

    setTimeout(() => {
      setIsWishlistAnimating(false);
    }, 600);
  };

  // Generate random particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (360 / 12) * i,
    delay: i * 0.03,
  }));

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 relative">
      {/* Success Checkmark in Center of Card */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
          style={{ backgroundColor: "rgba(163, 175, 135, 0.95)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{
              duration: 0.5,
              times: [0, 0.7, 1],
              ease: "easeOut",
            }}
          >
            <div className="bg-white rounded-full p-4 sm:p-6 shadow-2xl">
              <motion.svg
                className="h-12 w-12 sm:h-16 sm:w-16 text-[#A3AF87]"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Success Text */}
          <motion.div
            className="absolute bottom-4 sm:bottom-8 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white font-bold text-xs sm:text-sm text-center">
              Ditambahkan ke Keranjang!
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Particle Burst Animation */}
      {showParticles && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.cos((particle.angle * Math.PI) / 180) * 80,
                y: Math.sin((particle.angle * Math.PI) / 180) * 80,
              }}
              transition={{
                duration: 0.8,
                delay: particle.delay,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    particle.id % 2 === 0 ? "#A3AF87" : "#FDF8D4",
                  boxShadow: "0 0 8px rgba(163, 175, 135, 0.6)",
                }}
              />
            </motion.div>
          ))}

          {/* Expanding Ring Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-20 h-20 rounded-full border-4"
            style={{ borderColor: "#A3AF87" }}
          />

          {/* Secondary Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
            className="absolute w-20 h-20 rounded-full border-2"
            style={{ borderColor: "#A3AF87" }}
          />
        </div>
      )}

      {/* Product Image */}
      <div
        className="relative aspect-square overflow-hidden"
        style={
          {
            background:
              "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), #fff)",
          } as React.CSSProperties
        }
      >
        <Link href={`/market/products/${productSlug}`}>
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>

        {/* Wishlist Button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlistToggle();
          }}
          className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/95 rounded-full flex items-center justify-center shadow-md z-10"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          animate={
            isWishlistAnimating
              ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={
              wishlist.includes(product.id)
                ? {
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
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
          </motion.div>

          {/* Heart Pop Animation */}
          {isWishlistAnimating && wishlist.includes(product.id) && (
            <>
              {/* Heart particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos(((360 / 8) * i * Math.PI) / 180) * 15,
                    y: Math.sin(((360 / 8) * i * Math.PI) / 180) * 15,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="text-red-500 text-xs">❤️</div>
                </motion.div>
              ))}
            </>
          )}
        </motion.button>

        {/* Category Badge */}
        <div
          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-white text-[9px] font-semibold rounded-full pointer-events-none"
          style={
            {
              backgroundColor: "rgba(163, 175, 135, 0.9)",
            } as React.CSSProperties
          }
        >
          {product.category}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg animate-pulse pointer-events-none">
            🔥 DISKON {discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2">
        {/* Product Name */}
        <h3
          className="font-bold text-xs mb-0.5 line-clamp-1"
          style={{ color: "#303646" } as React.CSSProperties}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p
          className="text-[9px] mb-1.5 line-clamp-1"
          style={{ color: "rgba(90, 108, 91, 0.7)" } as React.CSSProperties}
        >
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
            <span className="text-[9px] text-gray-500">({reviews})</span>
          </div>
          <span className="text-[9px] text-gray-500">
            {product.stock} {product.unit}
          </span>
        </div>

        {/* Price */}
        <div className="mb-1.5">
          {discount > 0 ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-sm font-bold"
                  style={{ color: "#303646" } as React.CSSProperties}
                >
                  Rp{" "}
                  {(
                    product.finalPrice ||
                    Math.round(product.price * (1 - discount / 100))
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
                  -{discount}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-sm font-bold"
                style={{ color: "#303646" } as React.CSSProperties}
              >
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              <span className="text-[9px] text-gray-500">/{product.unit}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 text-white py-1.5 rounded-md font-semibold text-[10px] transition-all relative overflow-hidden disabled:opacity-70"
            style={
              {
                backgroundColor: "#A3AF87",
              } as React.CSSProperties
            }
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 0 20px rgba(163, 175, 135, 0.6), 0 0 40px rgba(163, 175, 135, 0.3)",
            }}
            whileTap={{ scale: 0.92 }}
          >
            {/* Shimmer Effect on Hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
              style={{
                transform: "translateX(-100%)",
              }}
              whileHover={{
                opacity: [0, 0.3, 0],
                x: ["0%", "200%"],
              }}
              transition={{
                duration: 0.8,
                ease: "linear",
              }}
            />

            {/* Glow Pulse Effect when Adding */}
            {isAdding && (
              <>
                <motion.div
                  className="absolute inset-0 bg-[#A3AF87] rounded-md"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Radial Pulse */}
                <motion.div
                  className="absolute inset-0 rounded-md"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(253, 248, 212, 0.4) 0%, transparent 70%)",
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </>
            )}

            {/* Button Content */}
            <motion.div
              className="flex items-center justify-center gap-1 relative z-10"
              animate={
                isAdding
                  ? {
                      y: [0, -3, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.4,
                repeat: isAdding ? Infinity : 0,
                repeatType: "reverse",
              }}
            >
              <motion.div
                animate={
                  isAdding
                    ? {
                        rotate: [0, -15, 15, -15, 0],
                        scale: [1, 1.2, 1, 1.2, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </motion.div>

              <motion.span
                animate={
                  isAdding
                    ? {
                        opacity: [1, 0.5, 1],
                      }
                    : {}
                }
                transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0 }}
              >
                {isAdding ? "Ditambah!" : "Keranjang"}
              </motion.span>
            </motion.div>

            {/* Sparkle Effects */}
            {isAdding && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#FDF8D4] rounded-full"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: "50%",
                    }}
                    initial={{ scale: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      y: [0, -20 - i * 3, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                ))}
              </>
            )}
          </motion.button>

          <Link
            href={`/market/products/${productSlug}`}
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

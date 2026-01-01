import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface ProductsHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductsHeader({
  searchQuery,
  onSearchChange,
}: ProductsHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
        style={
          { backgroundColor: "rgba(163, 175, 135, 0.1)" } as React.CSSProperties
        }
      >
        <svg
          className="h-4 w-4"
          style={{ color: "#A3AF87" } as React.CSSProperties}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
        <span
          className="text-xs font-bold tracking-wider uppercase font-poppins"
          style={{ color: "#A3AF87" } as React.CSSProperties}
        >
          Market Pengolahan Maggot
        </span>
      </div>

      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight font-poppins">
        DI MANA{" "}
        <span style={{ color: "#A3AF87" } as React.CSSProperties}>
          TEKNOLOGI
        </span>
        <br />
        BERTEMU{" "}
        <span style={{ color: "#A3AF87" } as React.CSSProperties}>ALAM</span>
      </h1>

      <p className="text-sm lg:text-base text-gray-600 mb-8 leading-relaxed font-poppins max-w-3xl mx-auto">
        EcoMaggie memanfaatkan teknologi untuk mendukung pengelolaan sampah
        organik yang lebih{" "}
        <span
          className="font-semibold"
          style={{ color: "#A3AF87" } as React.CSSProperties}
        >
          efisien, berkelanjutan
        </span>{" "}
        dan berdampak bagi lingkungan serta masyarakat.
      </p>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <PlaceholdersAndVanishInput
          placeholders={[
            "Maggot BSF hidup...",
            "Maggot BSF kering...",
            "Maggot BSF ukuran sedang...",
            "Maggot BSF 1 kg...",
            "Maggot BSF curah...",
          ]}
          onChange={onSearchChange}
          onSubmit={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

import ProductForm from "@/components/farmer/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 poppins-bold">
        Tambah Produk Baru
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}

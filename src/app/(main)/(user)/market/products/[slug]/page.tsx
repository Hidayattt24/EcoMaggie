export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Detail Produk</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Detail untuk produk: {params.slug}</p>
      </div>
    </div>
  );
}

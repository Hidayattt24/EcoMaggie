export default function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Produk</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Form edit produk: {params.slug}</p>
      </div>
    </div>
  );
}

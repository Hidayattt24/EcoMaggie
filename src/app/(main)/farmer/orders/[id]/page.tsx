export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Detail Pesanan</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Detail pesanan ID: {params.id}</p>
      </div>
    </div>
  );
}

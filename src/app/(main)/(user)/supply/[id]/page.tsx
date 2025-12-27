export default function SupplyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Detail Supply</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Detail supply ID: {params.id}</p>
      </div>
    </div>
  );
}

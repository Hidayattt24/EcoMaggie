interface SupplyMonitoringDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SupplyMonitoringDetailPage({
  params,
}: SupplyMonitoringDetailPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Detail Supply</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Detail supply ID: {id}</p>
      </div>
    </div>
  );
}

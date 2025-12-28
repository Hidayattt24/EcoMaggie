export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#2D5016]">
        Tentang EcoMaggie
      </h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#2D5016]">
            Apa itu EcoMaggie?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            EcoMaggie adalah platform inovatif yang menghubungkan masyarakat
            dengan petani maggot untuk menciptakan solusi pengelolaan sampah
            organik yang berkelanjutan.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#2D5016]">
            Misi Kami
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Mengurangi sampah organik di lingkungan</li>
            <li>Memberdayakan petani maggot lokal</li>
            <li>Menciptakan ekonomi sirkular yang berkelanjutan</li>
            <li>Mengedukasi masyarakat tentang pengelolaan sampah</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#2D5016]">
            Hubungi Kami
          </h2>
          <p className="text-gray-700">Email: info@ecomaggie.com</p>
          <p className="text-gray-700">WhatsApp: +62 812-3456-7890</p>
        </div>
      </div>
    </div>
  );
}

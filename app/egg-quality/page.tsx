import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import EggQualityForm from "@/components/EggQualityForm";

export default async function EggQualityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const cages = await prisma.cage.findMany({
    orderBy: { name: "asc" },
  });

  const recentLogs = await prisma.eggLog.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: { cage: true },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen Kualitas Telur</h1>
      
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        <EggQualityForm cages={cages} />

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Data Terbaru</h2>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left min-w-125">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Kandang</th>
                  <th className="pb-3 font-medium text-center">Grade S</th>
                  <th className="pb-3 font-medium text-center">Grade R</th>
                  <th className="pb-3 font-medium text-center">Grade P</th>
                  <th className="pb-3 font-medium text-right">Total Bagus</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="text-sm text-gray-900">
                    <td className="py-4">{new Date(log.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 font-medium">{log.cage.name}</td>
                    <td className="py-4 text-center">{log.qualityS}</td>
                    <td className="py-4 text-center">{log.qualityR}</td>
                    <td className="py-4 text-center">{log.qualityP}</td>
                    <td className="py-4 text-right font-bold text-blue-600">{log.totalGood}</td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                      Belum ada data tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
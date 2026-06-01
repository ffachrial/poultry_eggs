import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DailyLogForm from "@/components/DailyLogForm";

export default async function DailyLogsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const cages = await prisma.cage.findMany({
    orderBy: { name: "asc" },
  });

  const recentLogs = await prisma.dailyLog.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: { cage: true },
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Log Harian Kandang</h1>
      
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        <DailyLogForm cages={cages} />

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Data Terbaru</h2>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left min-w-125">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Waktu</th>
                  <th className="pb-3 font-medium">Kandang</th>
                  <th className="pb-3 font-medium text-center">Mortalitas</th>
                  <th className="pb-3 font-medium text-right">Pakan (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="text-sm text-gray-900">
                    <td className="py-4">{new Date(log.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        log.timeSlot === 'PAGI' ? 'bg-orange-100 text-orange-700' :
                        log.timeSlot === 'SIANG' ? 'bg-yellow-100 text-yellow-700' :
                        log.timeSlot === 'SORE' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {log.timeSlot}
                      </span>
                    </td>
                    <td className="py-4 font-medium">{log.cage.name}</td>
                    <td className="py-4 text-center text-red-600 font-medium">{log.mortality}</td>
                    <td className="py-4 text-right font-medium">{log.feedQuantity}</td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
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
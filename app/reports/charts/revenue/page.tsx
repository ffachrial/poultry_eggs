import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import ProductionChart from "@/components/ProductionChart";

export default async function QualityChartPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get date range for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const eggLogs = await prisma.eggLog.findMany({
    where: {
      date: {
        gte: firstDayOfMonth,
      },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate current month production for chart
  const productionChartData = eggLogs.reduce((acc, log) => {
    const dateStr = new Date(log.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
    });

    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, total: 0 };
    }

    acc[dateStr].total += log.qualityS + log.qualityR + log.qualityP;
    return acc;
  }, {} as Record<string, { date: string; total: number }>);

  const chartData = Object.values(productionChartData);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">Grafik Produksi Telur</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <PrintButton />
          </div>
        </div>
        <p className="text-gray-500 text-center lg:text-left print:block">
          Periode: {firstDayOfMonth.toLocaleDateString("id-ID")} - {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* Production Chart */}
      <ProductionChart data={chartData} />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-semibold mb-4">Keterangan Grafik</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Grafik di atas menunjukkan total produksi telur harian (akumulasi Grade S, Grade R, dan Grade P) untuk semua kandang selama bulan berjalan. 
          Gunakan grafik ini untuk memantau tren produktivitas ayam petelur Anda secara keseluruhan.
        </p>
      </div>
    </div>
  );
}
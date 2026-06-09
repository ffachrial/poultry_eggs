import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import ExportButton from "@/components/ExportButton";
import ProductionChart from "@/components/ProductionChart";

export default async function ReportsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get date range for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get date range for last 30 days (for table)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [eggLogsRaw, sales, expenses, currentMonthLogs] = await Promise.all([
    prisma.eggLog.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      include: { cage: true },
    }),
    prisma.sale.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.eggLog.findMany({
      where: {
        date: {
          gte: firstDayOfMonth,
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // Aggregate current month production for chart
  const productionChartData = currentMonthLogs.reduce((acc, log) => {
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

  // Group and aggregate egg logs by date and cage name
  const groupedEggLogs = eggLogsRaw.reduce((acc, log) => {
    const dateStr = new Date(log.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const cageName = log.cage.name;

    if (!acc[dateStr]) {
      acc[dateStr] = {};
    }

    if (!acc[dateStr][cageName]) {
      acc[dateStr][cageName] = {
        qualityS: 0,
        qualityR: 0,
        qualityP: 0,
      };
    }

    acc[dateStr][cageName].qualityS += log.qualityS;
    acc[dateStr][cageName].qualityR += log.qualityR;
    acc[dateStr][cageName].qualityP += log.qualityP;

    return acc;
  }, {} as Record<string, Record<string, { qualityS: number; qualityR: number; qualityP: number }>>);

  // Preserve the order from the database
  const uniqueDates = Array.from(
    new Set(
      eggLogsRaw.map((log) =>
        new Date(log.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      )
    )
  );

  const eggLogs = uniqueDates.map(date => ({
    date,
    items: Object.entries(groupedEggLogs[date]).map(([cageName, quality]) => ({
      cageName,
      ...quality,
      total: quality.qualityS + quality.qualityR + quality.qualityP
    }))
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">Laporan & Rekapitulasi</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <ExportButton
              data={eggLogs.flatMap(group =>
                group.items.map(item => ({
                  Tanggal: group.date,
                  Kandang: item.cageName,
                  "Grade S": item.qualityS,
                  "Grade R": item.qualityR,
                  "Grade P": item.qualityP,
                  "Total": item.total,
                }))
              )}
               filename={`Laporan_Produksi_${new Date().toISOString().split('T')[0]}`}
               label="Export Produksi"
             />
             <PrintButton />
           </div>
         </div>
         <p className="text-gray-500 text-center lg:text-left mt-2 lg:mt-0 print:block">
           Periode: {thirtyDaysAgo.toLocaleDateString("id-ID")} - {new Date().toLocaleDateString("id-ID")}
         </p>
       </div>

      {/* Production Chart */}
      <ProductionChart data={chartData} />

      {/* Egg Production Report */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-4 border-b pb-2">Produksi Telur (30 Hari Terakhir)</h2>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left min-w-150 border-collapse">
            <thead>
              <tr className="text-gray-900 font-bold text-sm border-b-2 border-black">
                <th className="py-2 px-1">Tanggal</th>
                <th className="py-2 px-1">Kandang</th>
                <th className="py-2 px-1 text-right">Grade S</th>
                <th className="py-2 px-1 text-right">Grade R</th>
                <th className="py-2 px-1 text-right">Grade P</th>
                <th className="py-2 px-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {eggLogs.map((group) => (
                group.items.map((item, index) => (
                  <tr key={`${group.date}-${item.cageName}`} className={`text-sm text-gray-900 ${index === group.items.length - 1 ? 'border-b-2 border-black' : ''}`}>
                    <td className="py-2 px-1 font-medium">
                      {index === 0 ? group.date : ""}
                    </td>
                    <td className="py-2 px-1">{item.cageName}</td>
                    <td className="py-2 px-1 text-right">{item.qualityS}</td>
                    <td className="py-2 px-1 text-right">{item.qualityR}</td>
                    <td className="py-2 px-1 text-right">{item.qualityP}</td>
                    <td className="py-2 px-1 text-right font-bold">{item.total}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Financial Summary Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Penjualan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Pembeli</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id} className="text-sm text-gray-900">
                    <td className="py-3">{new Date(sale.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-3">{sale.buyerName}</td>
                    <td className="py-3 text-right font-medium">Rp {sale.totalAmount.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Pengeluaran</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Kategori</th>
                  <th className="pb-3 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="text-sm text-gray-900">
                    <td className="py-3">{new Date(exp.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-3">{exp.category}</td>
                    <td className="py-3 text-right font-medium text-red-500">Rp {exp.amount.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
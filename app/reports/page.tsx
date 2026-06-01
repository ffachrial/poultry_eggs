import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import ExportButton from "@/components/ExportButton";

export default async function ReportsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get date range for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [eggLogs, sales, expenses] = await Promise.all([
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
  ]);

   return (
     <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
           <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h1>
           <div className="flex gap-2 mt-4 lg:mt-0 print:hidden">
             <ExportButton 
               data={eggLogs.map(log => ({
                 Tanggal: new Date(log.date).toLocaleDateString("id-ID"),
                 Kandang: log.cage.name,
                 "Grade S": log.qualityS,
                 "Grade R": log.qualityR,
                 "Grade P": log.qualityP,
                 "Total Bagus": log.totalGood
               }))}
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

      {/* Egg Production Report */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Produksi Telur (30 Hari Terakhir)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
              {eggLogs.map((log) => (
                <tr key={log.id} className="text-sm text-gray-900">
                  <td className="py-3">{new Date(log.date).toLocaleDateString("id-ID")}</td>
                  <td className="py-3">{log.cage.name}</td>
                  <td className="py-3 text-center">{log.qualityS}</td>
                  <td className="py-3 text-center">{log.qualityR}</td>
                  <td className="py-3 text-center">{log.qualityP}</td>
                  <td className="py-3 text-right font-bold">{log.totalGood}</td>
                </tr>
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
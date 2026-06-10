import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import ExportButton from "@/components/ExportButton";

export default async function RevenueReportPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get date range for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">Laporan Kualitas Telur</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <ExportButton
              data={[
                ...sales.map(s => ({ Tanggal: new Date(s.date).toLocaleDateString("id-ID"), Kategori: "Penjualan", Keterangan: s.buyerName, Masuk: s.totalAmount, Keluar: 0 })),
                ...expenses.map(e => ({ Tanggal: new Date(e.date).toLocaleDateString("id-ID"), Kategori: "Pengeluaran", Keterangan: e.category, Masuk: 0, Keluar: e.amount }))
              ].sort((a, b) => new Date(b.Tanggal).getTime() - new Date(a.Tanggal).getTime())}
              filename={`Laporan_Kualitas_${new Date().toISOString().split('T')[0]}`}
              label="Export"
            />
            <PrintButton />
          </div>
        </div>
        <p className="text-gray-500 text-center lg:text-left print:block">
          Periode: {thirtyDaysAgo.toLocaleDateString("id-ID")} - {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-green-600">Rp {totalSales.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">Rp {totalExpenses.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Laba Bersih</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Rp {netProfit.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Detail Pemasukan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Keterangan</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id} className="text-sm text-gray-900">
                    <td className="py-3">{new Date(sale.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-3">{sale.buyerName}</td>
                    <td className="py-3 text-right font-medium text-green-600">Rp {sale.totalAmount.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Detail Pengeluaran</h2>
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
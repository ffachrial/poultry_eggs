import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import ExportButton from "@/components/ExportButton";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = params.month || defaultMonth;

  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const sales = await prisma.sale.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "desc" },
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalWeight = sales.reduce((sum, sale) => sum + sale.weightKg, 0);

  const monthDisplay = new Date(year, month - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const groupedByDate = new Map<string, typeof sales>();
  sales.forEach((sale) => {
    const key = new Date(sale.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    if (!groupedByDate.has(key)) {
      groupedByDate.set(key, []);
    }
    groupedByDate.get(key)!.push(sale);
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">Laporan Penjualan Telur</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <ExportButton
              data={sales.map((sale) => ({
                Tanggal: new Date(sale.date).toLocaleDateString("id-ID"),
                Pembeli: sale.buyerName,
                "Berat (Kg)": sale.weightKg,
                "Harga/Kg": sale.unitPrice,
                Total: sale.totalAmount,
              }))}
              filename={`Laporan_Penjualan_${selectedMonth}`}
              label="Export"
            />
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label htmlFor="monthSelector" className="font-medium text-gray-700 whitespace-nowrap">
              Pilih Periode:
            </label>
            <input
              type="month"
              name="month"
              id="monthSelector"
              defaultValue={selectedMonth}
              max={defaultMonth}
              form="monthForm"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-gray-600 font-medium">{monthDisplay}</span>
          </div>
          <form id="monthForm" action="/reports/sales" method="GET" className="flex items-center gap-2">
            <button
              type="submit"
              form="monthForm"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terapkan
            </button>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
          <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Berat</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalWeight.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kg
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Sales Table by Date */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 print:break-inside-avoid">
        <h2 className="text-base sm:text-lg font-semibold mb-4 border-b pb-2">
          Detail Penjualan - {monthDisplay}
        </h2>
        {sales.length > 0 ? (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left min-w-150 border-collapse">
              <thead>
                <tr className="text-gray-900 font-bold text-sm border-b-2 border-black">
                  <th className="py-2 px-1">Tanggal</th>
                  <th className="py-2 px-1">Pembeli</th>
                  <th className="py-2 px-1 text-right">Berat (Kg)</th>
                  <th className="py-2 px-1 text-right">Harga/Kg</th>
                  <th className="py-2 px-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(groupedByDate.entries()).map(([date, items]) =>
                  items.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className={`text-sm text-gray-900 ${
                        index === items.length - 1 && groupedByDate.size > 1
                          ? "border-b-2 border-black"
                          : ""
                      }`}
                    >
                      <td className="py-2 px-1 font-medium">
                        {index === 0 ? date : ""}
                      </td>
                      <td className="py-2 px-1">{sale.buyerName}</td>
                      <td className="py-2 px-1 text-right">{sale.weightKg.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-1 text-right">Rp {sale.unitPrice.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-1 text-right font-bold text-green-600">
                        Rp {sale.totalAmount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Belum ada data penjualan untuk periode ini.
          </div>
        )}
      </section>
    </div>
  );
}

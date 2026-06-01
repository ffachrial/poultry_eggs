import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RevenueChart from "@/components/RevenueChart";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch summary data
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [cageCount, recentEggLogs, totalSales, totalExpense, last7DaysSales] = await Promise.all([
    prisma.cage.count(),
    prisma.eggLog.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { cage: true },
    }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    prisma.sale.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        totalAmount: true,
      },
    }),
  ]);

  // Process chart data
  const chartData = last7DaysSales.reduce((acc: any[], sale) => {
    const dateStr = new Date(sale.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    const existing = acc.find((item) => item.date === dateStr);
    if (existing) {
      existing.revenue += sale.totalAmount;
    } else {
      acc.push({ date: dateStr, revenue: sale.totalAmount });
    }
    return acc;
  }, []);

  const salesTotal = totalSales._sum.totalAmount || 0;
  const expenseTotal = totalExpense._sum.amount || 0;
  const netProfit = salesTotal - expenseTotal;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Ringkasan</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Kandang</p>
          <p className="text-3xl font-bold text-gray-900">{cageCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Penjualan</p>
          <p className="text-3xl font-bold text-green-600">Rp {salesTotal.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Pengeluaran</p>
          <p className="text-3xl font-bold text-red-600">Rp {expenseTotal.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Laba Bersih</p>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Rp {netProfit.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <RevenueChart 
          data={chartData} 
          title="Pendapatan Penjualan (7 Hari Terakhir)" 
          type="line"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Log Telur Terbaru</h2>
            <Link href="/egg-quality" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
          </div>
          {recentEggLogs.length > 0 ? (
            <div className="space-y-4">
              {recentEggLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{log.cage.name}</p>
                    <p className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{log.totalGood} Butir</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Belum ada data log hari ini.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Aktivitas Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Link
              href="/egg-quality"
              className="p-4 md:p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-center font-medium"
            >
              Input Telur
            </Link>
            <Link
              href="/sales"
              className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
            >
              Input Penjualan
            </Link>
            <Link
              href="/daily-logs"
              className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
            >
              Log Kandang
            </Link>
            <Link
              href="/finance"
              className="p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-center font-medium"
            >
              Input Pengeluaran
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
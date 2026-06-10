import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";
import SalesChart from "@/components/SalesChart";

export default async function SalesChartPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get date range for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sales = await prisma.sale.findMany({
    where: { date: { gte: firstDayOfMonth } },
    orderBy: { date: "asc" },
  });

  // Aggregate sales by date
  const chartData = sales.reduce((acc, sale) => {
    const dateStr = new Date(sale.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
    });

    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, totalAmount: 0, totalWeight: 0 };
    }

    acc[dateStr].totalAmount += sale.totalAmount;
    acc[dateStr].totalWeight += sale.weightKg;
    return acc;
  }, {} as Record<string, { date: string; totalAmount: number; totalWeight: number }>);

  const data = Object.values(chartData);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">Grafik Penjualan Telur</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <PrintButton />
          </div>
        </div>
        <p className="text-gray-500 text-center lg:text-left print:block">
          Periode: {firstDayOfMonth.toLocaleDateString("id-ID")} - {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      <SalesChart data={data} />
    </div>
  );
}
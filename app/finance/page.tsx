import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ExpenseForm from "@/components/ExpenseForm";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default async function FinancePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch recent data
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen Keuangan</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-green-50 rounded-lg mr-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pendapatan</p>
            <p className="text-xl font-bold text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-red-50 rounded-lg mr-4">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pengeluaran</p>
            <p className="text-xl font-bold text-gray-900">Rp {totalExpense.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Laba Bersih</p>
            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Rp {netProfit.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <ExpenseForm />
        </div>

        {/* Tables Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Expenses Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Pengeluaran Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-sm border-b">
                    <th className="pb-3 font-medium">Tanggal</th>
                    <th className="pb-3 font-medium">Kategori</th>
                    <th className="pb-3 font-medium">Keterangan</th>
                    <th className="pb-3 font-medium text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="text-sm text-gray-900">
                      <td className="py-4">{new Date(exp.date).toLocaleDateString("id-ID")}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500 italic">{exp.description || "-"}</td>
                      <td className="py-4 text-right font-medium text-red-500">
                        Rp {exp.amount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        Belum ada data pengeluaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
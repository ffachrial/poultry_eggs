import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SaleForm from "@/components/SaleForm";

export default async function SalesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const recentSales = await prisma.sale.findMany({
    take: 10,
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen Penjualan</h1>
      
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        <SaleForm />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Riwayat Penjualan Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Pembeli</th>
                  <th className="pb-3 font-medium text-center">Berat (Kg)</th>
                  <th className="pb-3 font-medium text-right">Harga/Kg</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="text-sm text-gray-900">
                    <td className="py-4">{new Date(sale.date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 font-medium">{sale.buyerName}</td>
                    <td className="py-4 text-center">{sale.weightKg.toLocaleString("id-ID")}</td>
                    <td className="py-4 text-right">Rp {sale.unitPrice.toLocaleString("id-ID")}</td>
                    <td className="py-4 text-right font-bold text-green-600">
                      Rp {sale.totalAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                      Belum ada data penjualan.
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
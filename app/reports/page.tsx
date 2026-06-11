"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PrintButton from "@/components/PrintButton";
import ExportButton from "@/components/ExportButton";
import ProductionChart from "@/components/ProductionChart";

interface EggLogRaw {
  id: string;
  date: Date;
  qualityS: number;
  qualityR: number;
  qualityP: number;
  cage: {
    id: string;
    name: string;
  };
}

interface Sale {
  id: string;
  date: Date;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface Expense {
  id: string;
  date: Date;
  amount: number;
  description: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [eggLogs, setEggLogs] = useState<Array<{
    date: string;
    items: Array<{
      cageName: string;
      qualityS: number;
      qualityR: number;
      qualityP: number;
      total: number;
    }>;
  }>>([]);
  const [chartData, setChartData] = useState<Array<{ date: string; total: number }>>([]);
  const [periodText, setPeriodText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedMonth || status !== "authenticated") return;

      setIsLoading(true);

      // Parse selected month
      const [year, month] = selectedMonth.split("-").map(Number);
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59);

      // Format period text
      const periodStr = firstDayOfMonth.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      setPeriodText(`Periode: ${periodStr}`);

      try {
        const eggLogsRaw = await fetchEggLogs(firstDayOfMonth, lastDayOfMonth);

        // Process egg logs
        const groupedEggLogs = eggLogsRaw.reduce((acc, log) => {
          const logDate = typeof log.date === "string" ? new Date(log.date) : log.date;
          const dateStr = logDate.toLocaleDateString("id-ID", {
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

        const uniqueDates = Array.from(
          new Set(
            eggLogsRaw.map((log) => {
              const logDate = typeof log.date === "string" ? new Date(log.date) : log.date;
              return logDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });
            })
          )
        );

        const processedEggLogs = uniqueDates.map((date) => ({
          date,
          items: Object.entries(groupedEggLogs[date]).map(([cageName, quality]) => ({
            cageName,
            ...quality,
            total: quality.qualityS + quality.qualityR + quality.qualityP,
          })),
        }));

        // Process chart data
        const productionChartData = eggLogsRaw.reduce((acc, log) => {
          const logDate = typeof log.date === "string" ? new Date(log.date) : log.date;
          const dateStr = logDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
          });

          if (!acc[dateStr]) {
            acc[dateStr] = { date: dateStr, total: 0 };
          }

          acc[dateStr].total += log.qualityS + log.qualityR + log.qualityP;
          return acc;
        }, {} as Record<string, { date: string; total: number }>);

        const processedChartData = Object.values(productionChartData);

        setEggLogs(processedEggLogs);
        setChartData(processedChartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Mengalihkan ke halaman login...</div>
      </div>
    );
  }

  const formattedSelectedMonth = selectedMonth || "";
  const monthDisplay = selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col items-center lg:flex-row lg:items-baseline lg:justify-between w-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 text-center lg:text-left">
            Laporan Kualitas Telur
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4 lg:mt-0 print:hidden">
            <ExportButton
              data={eggLogs.flatMap((group) =>
                group.items.map((item) => ({
                  Tanggal: group.date,
                  Kandang: item.cageName,
                  "Grade S": item.qualityS,
                  "Grade R": item.qualityR,
                  "Grade P": item.qualityP,
                  Total: item.total,
                }))
              )}
              filename={`Laporan_Produksi_${selectedMonth}`}
              label="Export Produksi"
            />
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label htmlFor="monthSelector" className="font-medium text-gray-700">
            Pilih Periode:
          </label>
          <input
            type="month"
            id="monthSelector"
            value={formattedSelectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span className="text-gray-600 font-medium">{monthDisplay}</span>
        </div>
      </div>

      {/* Chart Section */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-4 border-b pb-2">
          Grafik Produksi Telur - {monthDisplay}
        </h2>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Memuat data...
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 sm:h-80">
            <ProductionChart data={chartData} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Tidak ada data untuk periode ini
          </div>
        )}
      </section>

      {/* Egg Production Report Table */}
      <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-4 border-b pb-2">
          Tabel Produksi Telur - {monthDisplay}
        </h2>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Memuat data...</div>
        ) : eggLogs.length > 0 ? (
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
                {eggLogs.map((group) =>
                  group.items.map((item, index) => (
                    <tr
                      key={`${group.date}-${item.cageName}`}
                      className={`text-sm text-gray-900 ${
                        index === group.items.length - 1 ? "border-b-2 border-black" : ""
                      }`}
                    >
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
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tidak ada data untuk periode ini
          </div>
        )}
      </section>
    </div>
  );
}

// Helper function to fetch egg logs directly
async function fetchEggLogs(
  startDate: Date,
  endDate: Date
): Promise<EggLogRaw[]> {
  // This will be called on client side, so we need to use fetch
  const response = await fetch(
    `/api/egg-logs?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data;
}
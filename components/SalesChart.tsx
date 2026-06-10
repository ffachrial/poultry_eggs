"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SalesData {
  date: string;
  totalAmount: number;
  totalWeight: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Revenue Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-80 sm:h-110">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Total Penjualan Per Hari</h3>
        <div className="h-60 sm:h-85 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  `Rp ${Number(value || 0).toLocaleString("id-ID")}`,
                  "Total Penjualan",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line
                name="Total Penjualan"
                type="monotone"
                dataKey="totalAmount"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: "#fff",
                  stroke: "#16a34a",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#16a34a",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-80 sm:h-110">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Total Berat Terjual Per Hari (Kg)</h3>
        <div className="h-60 sm:h-85 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value || 0} Kg`, "Total Berat"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line
                name="Total Berat (Kg)"
                type="monotone"
                dataKey="totalWeight"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: "#fff",
                  stroke: "#2563eb",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#2563eb",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
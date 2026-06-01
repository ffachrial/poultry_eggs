"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors print:hidden"
    >
      <Printer className="mr-2 h-4 w-4" />
      Cetak Laporan
    </button>
  );
}
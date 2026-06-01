"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  data: any[];
  filename: string;
  label: string;
}

export default function ExportButton({ data, filename, label }: ExportButtonProps) {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
    >
      <Download size={16} />
      {label}
    </button>
  );
}
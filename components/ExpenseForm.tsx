"use client";

import { useActionState } from "react";
import { useSession } from "next-auth/react";
import { createExpense, ExpenseState } from "@/app/finance/actions";

const initialState: ExpenseState = {
  message: null,
  errors: {},
};

const categories = [
  "Pakan",
  "Vaksin/Obat",
  "Sekam/Alas",
  "Listrik/Air",
  "Gaji Karyawan",
  "Pemeliharaan Kandang",
  "Transportasi",
  "Lain-lain",
];

export default function ExpenseForm() {
  const [state, formAction, isPending] = useActionState(createExpense, initialState);
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 mb-8">
        <p className="font-medium text-center">Anda dalam mode View-Only. Hanya Admin yang dapat menambah data.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Input Pengeluaran</h2>
        
        {state.message && (
          <div className={`p-4 rounded-lg mb-6 ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {state.message}
          </div>
        )}

        {state.errors?.global && (
          <div className="p-4 rounded-lg mb-6 bg-red-50 text-red-700">
            {state.errors.global.map(err => <p key={err}>{err}</p>)}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.date && (
              <p className="text-sm text-red-600">{state.errors.date[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              id="category"
              name="category"
              required
              className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {state.errors?.category && (
              <p className="text-sm text-red-600">{state.errors.category[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="1"
              required
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.amount && (
              <p className="text-sm text-red-600">{state.errors.amount[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Keterangan (Opsional)</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detail pengeluaran..."
              className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full rounded-lg px-6 py-3 text-base font-medium text-white transition-colors ${
              isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPending ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </div>
    </form>
  );
}
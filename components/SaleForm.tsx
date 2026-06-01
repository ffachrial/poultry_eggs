"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createSale, SaleState } from "@/app/sales/actions";

const initialState: SaleState = {
  message: null,
  errors: {},
};

export default function SaleForm() {
  const [state, formAction, isPending] = useActionState(createSale, initialState);
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";

  useEffect(() => {
    if (state.success) {
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state]);

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
        <h2 className="text-lg font-semibold mb-4">Input Penjualan</h2>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal Penjualan</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
            {state.errors?.date && (
              <p className="text-sm text-red-600">{state.errors.date[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">Nama Pembeli</label>
          <input
            type="text"
            id="buyerName"
            name="buyerName"
            required
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nama pembeli"
          />
            {state.errors?.buyerName && (
              <p className="text-sm text-red-600">{state.errors.buyerName[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">Berat Telur</label>
            <div className="relative">
            <input
              type="number"
              step="0.01"
              id="weightKg"
              name="weightKg"
              min="0"
              required
              placeholder="0.00"
              className="block w-full rounded-lg border-gray-300 bg-gray-50 pl-4 pr-12 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">Kg</span>
            </div>
            {state.errors?.weightKg && (
              <p className="text-sm text-red-600">{state.errors.weightKg[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">Harga per Kg</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400 text-sm">Rp</span>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              min="0"
              required
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 bg-gray-50 pl-12 pr-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            </div>
            {state.errors?.unitPrice && (
              <p className="text-sm text-red-600">{state.errors.unitPrice[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Catatan tambahan..."
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full rounded-lg px-6 py-3 text-base font-medium text-white transition-colors ${
              isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPending ? 'Menyimpan...' : 'Simpan Penjualan'}
          </button>
        </div>
      </div>
    </form>
  );
}